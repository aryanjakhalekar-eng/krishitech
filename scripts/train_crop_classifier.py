import sys, time, random
from pathlib import Path
import numpy as np
import torch, torch.nn as nn
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler
from torchvision import models, transforms
from sklearn.model_selection import train_test_split
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                              f1_score, confusion_matrix, classification_report)
from PIL import Image

SEED = 42
random.seed(SEED); np.random.seed(SEED); torch.manual_seed(SEED)

DATASET_ROOT = Path(r"D:\crop images dataset")
PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODEL_DIR    = PROJECT_ROOT / "ml" / "models" / "crop_classifier"
MODEL_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH   = MODEL_DIR / "model.pt"

CROP_CLASSES   = ["Tomato", "Rice", "Unsupported"]
TOMATO_CLASSES = ["early_blight", "healthy", "late_blight", "leaf_mold"]
RICE_CLASSES   = ["bacterial_leaf_blight", "brown_spot", "healthy", "leaf_blast", "tungro"]

EMBED_DIM = 128; IMG_SIZE = 224; EPOCHS = 60; BATCH_SIZE = 16
LR = 8e-4; WEIGHT_DECAY = 1e-4

train_tfm = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomVerticalFlip(),
    transforms.RandomRotation(20),
    transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])
eval_tfm = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


def collect_samples():
    s = []
    for cls in TOMATO_CLASSES:
        for p in sorted((DATASET_ROOT / "tomato" / cls).glob("*.jpg")):
            s.append((p, 0))
    for cls in RICE_CLASSES:
        for p in sorted((DATASET_ROOT / "rice" / cls).glob("*.jpg")):
            s.append((p, 1))
    for p in sorted((DATASET_ROOT / "general" / "non_plant").glob("*")):
        if p.suffix.lower() in {".jpg", ".jpeg", ".png"}:
            s.append((p, 2))
    return s


class CropDataset(Dataset):
    def __init__(self, s, t): self.s = s; self.t = t
    def __len__(self): return len(self.s)
    def __getitem__(self, i):
        p, l = self.s[i]
        with Image.open(p) as img:
            img = img.convert("RGB")
        return self.t(img), l


def build_model(n):
    m = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.IMAGENET1K_V1)
    f = m.classifier[0].in_features
    m.classifier = nn.Sequential(
        nn.Linear(f, EMBED_DIM), nn.Hardswish(), nn.Dropout(0.2), nn.Linear(EMBED_DIM, n))
    return m


class EmbedExtractor(nn.Module):
    def __init__(self, m):
        super().__init__()
        layers = list(m.classifier.children())
        self.features = m.features; self.pool = m.avgpool
        self.embed_head = nn.Sequential(*layers[:-1])
    def forward(self, x):
        x = self.features(x); x = self.pool(x); x = x.flatten(1)
        return self.embed_head(x)


def train():
    print("=" * 60)
    print("CROP DOMAIN CLASSIFIER TRAINING")
    print("=" * 60)
    samples = collect_samples(); labels = [s[1] for s in samples]
    for i, cn in enumerate(CROP_CLASSES):
        print(f"  {cn}: {labels.count(i)} images")

    paths = [s[0] for s in samples]
    trP, tmpP, trL, tmpL = train_test_split(
        paths, labels, test_size=0.30, stratify=labels, random_state=SEED)
    vaP, teP, vaL, teL = train_test_split(
        tmpP, tmpL, test_size=0.50, stratify=tmpL, random_state=SEED)
    print(f"Split - Train:{len(trP)} Val:{len(vaP)} Test:{len(teP)}")

    cc = [trL.count(i) for i in range(3)]
    wts = [1.0 / cc[l] for l in trL]
    sampler = WeightedRandomSampler(wts, num_samples=len(trL), replacement=True)
    trDS = CropDataset(list(zip(trP, trL)), train_tfm)
    vaDS = CropDataset(list(zip(vaP, vaL)), eval_tfm)
    teDS = CropDataset(list(zip(teP, teL)), eval_tfm)
    trDL = DataLoader(trDS, batch_size=BATCH_SIZE, sampler=sampler)
    vaDL = DataLoader(vaDS, batch_size=BATCH_SIZE, shuffle=False)
    teDL = DataLoader(teDS, batch_size=BATCH_SIZE, shuffle=False)

    device = torch.device("cpu")
    model = build_model(3).to(device)
    crit = nn.CrossEntropyLoss(label_smoothing=0.05)
    opt = torch.optim.AdamW(model.parameters(), lr=LR, weight_decay=WEIGHT_DECAY)
    sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=EPOCHS)
    best_val = 0.0; best_state = None

    print("Training...")
    for epoch in range(1, EPOCHS + 1):
        model.train(); tl, cor, tot = 0.0, 0, 0
        for imgs, lbls in trDL:
            imgs, lbls = imgs.to(device), lbls.to(device)
            opt.zero_grad(); out = model(imgs); loss = crit(out, lbls)
            loss.backward(); opt.step()
            tl += loss.item() * imgs.size(0)
            cor += (out.argmax(1) == lbls).sum().item(); tot += imgs.size(0)
        sched.step()
        model.eval(); vc, vt = 0, 0
        with torch.no_grad():
            for imgs, lbls in vaDL:
                imgs, lbls = imgs.to(device), lbls.to(device)
                out = model(imgs)
                vc += (out.argmax(1) == lbls).sum().item(); vt += imgs.size(0)
        va = vc / vt
        if va >= best_val:
            best_val = va; best_state = {k: v.clone() for k, v in model.state_dict().items()}
        if epoch % 10 == 0 or epoch == 1:
            print(f"  Ep {epoch:3d}/{EPOCHS} loss={tl/tot:.4f} train={cor/tot:.4f} val={va:.4f} best={best_val:.4f}")
            sys.stdout.flush()

    model.load_state_dict(best_state); model.eval()
    ap, al = [], []
    with torch.no_grad():
        for imgs, lbls in teDL:
            out = model(imgs.to(device))
            ap.extend(out.argmax(1).cpu().numpy()); al.extend(lbls.numpy())

    acc = accuracy_score(al, ap)
    mP = precision_score(al, ap, average="macro", zero_division=0)
    mR = recall_score(al, ap, average="macro", zero_division=0)
    mF = f1_score(al, ap, average="macro", zero_division=0)
    cm = confusion_matrix(al, ap)
    print("CROP CLASSIFIER - TEST RESULTS")
    print(f"  Acc={acc:.4f} ({int(acc*len(al))}/{len(al)}) P={mP:.4f} R={mR:.4f} F1={mF:.4f}")
    print(f"  CM labels: {CROP_CLASSES}")
    print(cm)
    print(classification_report(al, ap, target_names=CROP_CLASSES, zero_division=0))

    ext = EmbedExtractor(model).to(device); ext.eval()
    allS = collect_samples(); allDS = CropDataset(allS, eval_tfm)
    allDL = DataLoader(allDS, batch_size=32, shuffle=False)
    ec = {i: [] for i in range(3)}
    with torch.no_grad():
        for imgs, lbls in allDL:
            embs = ext(imgs.to(device))
            for e, l in zip(embs.cpu().numpy(), lbls.numpy()):
                ne = e / (np.linalg.norm(e) + 1e-8); ec[int(l)].append(ne)

    centroids = {}
    for ci, el in ec.items():
        c = np.mean(el, axis=0); c = c / (np.linalg.norm(c) + 1e-8)
        centroids[CROP_CLASSES[ci]] = c.tolist()
        print(f"  Centroid {CROP_CLASSES[ci]}: norm={np.linalg.norm(c):.4f} n={len(el)}")

    ckpt = {
        "class_names":      CROP_CLASSES,
        "model_state_dict": best_state,
        "centroids":        centroids,
        "ood_threshold":    3.50,
        "test_accuracy":    float(acc),
        "macro_f1":         float(mF),
        "tomato_classes":   TOMATO_CLASSES,
        "rice_classes":     RICE_CLASSES,
        "confusion_matrix": cm.tolist(),
    }
    torch.save(ckpt, str(MODEL_PATH))
    print(f"Saved: {MODEL_PATH}  best_val={best_val:.4f}  test_acc={acc:.4f}")


if __name__ == "__main__":
    t0 = time.time(); train()
    elapsed = time.time() - t0
    mins = int(elapsed // 60); secs = int(elapsed % 60)
    print(f"Done in {mins}m {secs}s")
