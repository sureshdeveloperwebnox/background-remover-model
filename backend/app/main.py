from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import image_router, video_router
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Background Remover API",
    description="API for removing backgrounds from images and videos using backgroundremover",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(image_router.router)
app.include_router(video_router.router)


@app.get("/")
async def root():
    return {
        "message": "Background Remover API",
        "docs": "/docs",
        "endpoints": {
            "remove_image": "/remove-image",
            "remove_video": "/remove-video"
        }
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}

