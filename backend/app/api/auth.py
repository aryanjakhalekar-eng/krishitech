from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database.session import get_db
from backend.app.models.domain import User
from backend.app.schemas.pydantic_schemas import UserRegister, UserLogin, TokenResponse, UserOut
from backend.app.auth.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserRegister, db: Session = Depends(get_db)):
    # 1. Validate full name
    name_clean = user_in.full_name.strip() if user_in.full_name else ""
    if not name_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Full name is required."
        )

    # 2. Validate and normalize email
    email_clean = str(user_in.email).strip().lower()
    if not email_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Valid email address is required."
        )

    # 3. Check for existing duplicate email
    existing = db.query(User).filter(func.lower(User.email) == email_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )

    # 4. Validate password length
    if not user_in.password or len(user_in.password.strip()) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    # 5. Role validation: Public registration is restricted to FARMER
    role_requested = (user_in.role or "FARMER").strip().upper()
    if role_requested != "FARMER":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Public registration is only permitted for FARMER accounts."
        )

    # 6. Sanitize phone, district, and taluka
    phone_clean = user_in.phone.strip() if user_in.phone else None
    district_clean = user_in.district.strip() if user_in.district else "Pune"
    taluka_clean = user_in.taluka.strip() if user_in.taluka else "Baramati"

    # 7. Create & Persist User
    user = User(
        full_name=name_clean,
        email=email_clean,
        phone=phone_clean,
        hashed_password=hash_password(user_in.password),
        role="FARMER",
        district=district_clean,
        taluka=taluka_clean
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=TokenResponse)
def login_user(credentials: UserLogin, db: Session = Depends(get_db)):
    email_clean = str(credentials.email).strip().lower()
    user = db.query(User).filter(func.lower(User.email) == email_clean).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    token = create_access_token({"sub": user.email, "role": user.role, "user_id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "district": user.district,
        "taluka": user.taluka
    }

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
