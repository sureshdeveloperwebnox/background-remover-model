from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query, BackgroundTasks
from fastapi.responses import FileResponse, StreamingResponse
from pathlib import Path
import uuid
import os
from typing import Optional
from app.models.schemas import ModelType, ImageRemoveRequest
from app.services.background_remover import BackgroundRemoverService
from app.utils.file_cleanup import FileCleanup

router = APIRouter(prefix="/remove-image", tags=["image"])

background_remover = BackgroundRemoverService()
file_cleanup = FileCleanup(temp_dir="/tmp/backgroundremover")


@router.post("")
async def remove_image_background(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    model: Optional[str] = Form(None),
    alpha_matting: Optional[bool] = Form(None),
    alpha_matting_foreground_threshold: Optional[int] = Form(None),
    alpha_matting_background_threshold: Optional[int] = Form(None),
    alpha_matting_erode_structure_size: Optional[int] = Form(None),
    alpha_matting_base_size: Optional[int] = Form(None),
    background_color: Optional[str] = Form(None),
    background_image: Optional[UploadFile] = File(None)
):
    """Remove background from uploaded image"""
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Generate unique filenames
        file_id = str(uuid.uuid4())
        input_path = file_cleanup.get_temp_file_path(f"{file_id}_input.{file.filename.split('.')[-1]}")
        output_path = file_cleanup.get_temp_file_path(f"{file_id}_output.png")

        # Save uploaded file
        with open(input_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # Handle background image if provided
        bg_image_path = None
        if background_image:
            bg_image_path = file_cleanup.get_temp_file_path(f"{file_id}_bg.png")
            with open(bg_image_path, "wb") as f:
                bg_content = await background_image.read()
                f.write(bg_content)

        # Build request model
        model_type = ModelType(model) if model else ModelType.u2net
        request = ImageRemoveRequest(
            model=model_type,
            alpha_matting=alpha_matting or False,
            alpha_matting_foreground_threshold=alpha_matting_foreground_threshold or 240,
            alpha_matting_background_threshold=alpha_matting_background_threshold or 10,
            alpha_matting_erode_structure_size=alpha_matting_erode_structure_size or 10,
            alpha_matting_base_size=alpha_matting_base_size or 1000,
            background_color=background_color,
            background_image=str(bg_image_path) if bg_image_path else None
        )

        # Process image
        result_path = background_remover.remove_image_background(
            input_path, output_path, request
        )

        # Cleanup input file
        file_cleanup.remove_file(input_path)
        if bg_image_path:
            file_cleanup.remove_file(bg_image_path)

        # Return processed image
        if not result_path.exists():
            raise HTTPException(status_code=500, detail="Processing failed - output file not found")

        # Schedule cleanup after response
        background_tasks.add_task(file_cleanup.remove_file, result_path)

        return FileResponse(
            str(result_path),
            media_type="image/png",
            filename="background_removed.png"
        )

    except Exception as e:
        # Cleanup on error
        if 'input_path' in locals():
            file_cleanup.remove_file(input_path)
        if 'output_path' in locals():
            file_cleanup.remove_file(output_path)
        if 'bg_image_path' in locals() and bg_image_path:
            file_cleanup.remove_file(bg_image_path)
        
        raise HTTPException(status_code=500, detail=str(e))

