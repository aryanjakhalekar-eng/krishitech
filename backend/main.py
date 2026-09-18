import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.app.database.session import engine, Base
from backend.app.api import auth, farms, scans, cases, officer, analytics, outbreaks, weather, notifications

# Create DB tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="KrishiRakshak AI",
    description="Offline-First Crop Disease Identification, Safe Triage & Outbreak Intelligence System for Maharashtra Farmers.",
    version="1.0.0"
)

# CORS Configuration
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost",
    "http://127.0.0.1",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router)
app.include_router(farms.router)
app.include_router(scans.router)
app.include_router(cases.router)
app.include_router(officer.router)
app.include_router(analytics.router)
app.include_router(outbreaks.router)
app.include_router(weather.router)
app.include_router(notifications.router)

# Health Check API
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

# Static Files Directory (Demo crop photos, uploads, etc.)
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app", "static")
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Frontend Production Build Directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIST = os.path.join(BASE_DIR, "frontend", "dist")
ASSETS_DIR = os.path.join(FRONTEND_DIST, "assets")

# Mount Production Assets from frontend/dist/assets
if os.path.exists(ASSETS_DIR):
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

# Direct PWA & manifest routes
@app.get("/manifest.json")
def get_manifest():
    manifest_path = os.path.join(FRONTEND_DIST, "manifest.json")
    if os.path.exists(manifest_path):
        return FileResponse(manifest_path, media_type="application/json")
    raise HTTPException(status_code=404, detail="Manifest not found")

@app.get("/sw.js")
def get_service_worker():
    sw_path = os.path.join(FRONTEND_DIST, "sw.js")
    if os.path.exists(sw_path):
        return FileResponse(sw_path, media_type="application/javascript")
    raise HTTPException(status_code=404, detail="Service worker not found")

# Root Endpoint: Serves frontend/dist/index.html
@app.get("/")
def serve_frontend_root():
    dist_index = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(dist_index):
        return FileResponse(dist_index)
    raise HTTPException(
        status_code=404,
        detail="React production build not found at frontend/dist. Please run 'npm run build' in the frontend directory."
    )

# SPA Client-Side Catch-All Fallback (Serves React App for Client Routes)
@app.get("/{full_path:path}")
def serve_spa_fallback(full_path: str):
    # Do not intercept API, static, or OpenAPI doc endpoints
    if full_path.startswith("api/") or full_path.startswith("static/") or full_path in ["docs", "redoc", "openapi.json"]:
        raise HTTPException(status_code=404, detail="Resource not found.")

    # Check for direct static file in frontend/dist (e.g. favicon.svg, robots.txt, etc.)
    file_path = os.path.join(FRONTEND_DIST, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)

    # Return index.html for React SPA routes (/login, /register, /dashboard, /scan, /farms, /cases, /officer/queue, /gis-map, /analytics, etc.)
    dist_index = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(dist_index):
        return FileResponse(dist_index)

    raise HTTPException(
        status_code=404,
        detail="React production build not found at frontend/dist. Please run 'npm run build' in the frontend directory."
    )

