from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from pathlib import Path
import uuid
import os
from typing import Optional
from app.models.schemas import ModelType, VideoRemoveRequest
from app.services.background_remover import BackgroundRemoverService
from app.utils.file_cleanup import FileCleanup

router = APIRouter(prefix="/remove-video", tags=["video"])

background_remover = BackgroundRemoverService()
file_cleanup = FileCleanup(temp_dir="/tmp/backgroundremover")


@router.post("")
async def remove_video_background(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    model: Optional[str] = Form(None),
    tv: Optional[bool] = Form(None),
    mk: Optional[bool] = Form(None),
    tov: Optional[bool] = Form(None),
    toi: Optional[bool] = Form(None),
    gb: Optional[bool] = Form(None),
    wn: Optional[bool] = Form(None),
    fr: Optional[float] = Form(None),
    fl: Optional[float] = Form(None),
    background_color: Optional[str] = Form(None),
    background_image: Optional[UploadFile] = File(None),
    async_mode: Optional[bool] = Form(False)
):
    """Remove background from uploaded video"""
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("video/"):
            raise HTTPException(status_code=400, detail="File must be a video")

        # Generate unique filenames
        file_id = str(uuid.uuid4())
        file_ext = file.filename.split('.')[-1] if '.' in file.filename else "mp4"
        input_path = file_cleanup.get_temp_file_path(f"{file_id}_input.{file_ext}")
        # backgroundremover -tv outputs MOV format, so use .mov extension
        output_path = file_cleanup.get_temp_file_path(f"{file_id}_output.mov")

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
        request = VideoRemoveRequest(
            model=model_type,
            tv=tv or False,
            mk=mk or False,
            tov=tov or False,
            toi=toi or False,
            gb=gb or False,
            wn=wn or False,
            fr=fr,
            fl=fl,
            background_color=background_color,
            background_image=str(bg_image_path) if bg_image_path else None
        )

        # Process video (synchronous for now, can be made async with Celery)
        result_path = background_remover.remove_video_background(
            input_path, output_path, request
        )

        # Return processed video
        if not result_path.exists():
            raise HTTPException(status_code=500, detail="Processing failed - output file not found")

        # Check file size
        file_size = result_path.stat().st_size
        if file_size == 0:
            raise HTTPException(status_code=500, detail="Processing failed - output file is empty")

        # Schedule cleanup after response is sent (don't cleanup result_path immediately)
        background_tasks.add_task(file_cleanup.remove_file, input_path)
        if bg_image_path:
            background_tasks.add_task(file_cleanup.remove_file, bg_image_path)
        # Note: result_path cleanup should happen after download, but for now we'll keep it
        # In production, you'd want to implement a proper cleanup schedule

        # Determine media type based on file extension
        media_type = "video/quicktime" if result_path.suffix == ".mov" else "video/mp4"
        filename = "background_removed.mov" if result_path.suffix == ".mov" else "background_removed.mp4"
        
        return FileResponse(
            str(result_path),
            media_type=media_type,
            filename=filename,
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Length": str(file_size)
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        # Cleanup on error
        if 'input_path' in locals():
            file_cleanup.remove_file(input_path)
        if 'output_path' in locals():
            file_cleanup.remove_file(output_path)
        if 'bg_image_path' in locals() and bg_image_path:
            file_cleanup.remove_file(bg_image_path)
        
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"Video processing error: {error_detail}")  # Log to console
        raise HTTPException(status_code=500, detail=f"Video processing failed: {str(e)}")

