import subprocess
import os
from pathlib import Path
from typing import Optional, Tuple
from app.models.schemas import ModelType, ImageRemoveRequest, VideoRemoveRequest


class BackgroundRemoverService:
    def __init__(self, temp_dir: str = "/tmp/backgroundremover"):
        self.temp_dir = Path(temp_dir)
        self.temp_dir.mkdir(parents=True, exist_ok=True)

    def remove_image_background(
        self,
        input_path: Path,
        output_path: Path,
        request: ImageRemoveRequest
    ) -> Path:
        """Remove background from image using backgroundremover CLI"""
        cmd = [
            "backgroundremover",
            "-i", str(input_path),
            "-o", str(output_path),
            "-m", request.model.value
        ]

        if request.alpha_matting:
            cmd.extend([
                "-a",
                "-at", str(request.alpha_matting_foreground_threshold),
                "-ab", str(request.alpha_matting_background_threshold),
                "-ae", str(request.alpha_matting_erode_structure_size),
                "-az", str(request.alpha_matting_base_size)
            ])

        if request.background_color:
            cmd.extend(["-bc", request.background_color])

        if request.background_image:
            bg_path = self.temp_dir / "bg_image.png"
            # If background_image is a path, use it; otherwise save from base64
            if os.path.exists(request.background_image):
                bg_path = Path(request.background_image)
            cmd.extend(["-bi", str(bg_path)])

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True
            )
            return output_path
        except subprocess.CalledProcessError as e:
            raise Exception(f"Background removal failed: {e.stderr}")

    def remove_video_background(
        self,
        input_path: Path,
        output_path: Path,
        request: VideoRemoveRequest
    ) -> Path:
        """Remove background from video using backgroundremover CLI"""
        cmd = [
            "backgroundremover",
            "-i", str(input_path),
            "-o", str(output_path),
            "-m", request.model.value
        ]

        # For video output, we need to specify the output format
        # Default: use -tv for transparent video (MOV format)
        # -tov requires a background video file (-bv) which we don't support
        # -toi requires a background image (-bi)
        
        if request.background_image:
            bg_path = self.temp_dir / "bg_image.png"
            if os.path.exists(request.background_image):
                bg_path = Path(request.background_image)
            cmd.extend(["-bi", str(bg_path)])
            # If background image provided, use -toi for overlay
            if request.toi or request.tov:
                cmd.append("-toi")
            else:
                # Default: transparent video
                cmd.append("-tv")
        else:
            # No background image - use transparent video format
            # Don't use -tov (requires background video)
            if request.tov:
                # User wants transparent video, use -tv instead of -tov
                cmd.append("-tv")
            elif request.toi:
                # -toi without background image doesn't make sense, use -tv
                cmd.append("-tv")
            elif request.tv:
                cmd.append("-tv")
            else:
                # Default: use -tv for transparent video output
                cmd.append("-tv")

        # Add other video-specific flags
        if request.mk:
            cmd.append("-mk")
        if request.gb:
            cmd.append("-gb")
        if request.wn:
            cmd.append("-wn")
        if request.fr is not None:
            cmd.extend(["-fr", str(request.fr)])
        if request.fl is not None:
            cmd.extend(["-fl", str(request.fl)])

        if request.background_color:
            cmd.extend(["-bc", request.background_color])

        try:
            print(f"Running command: {' '.join(cmd)}")  # Debug log
            print(f"Input file exists: {input_path.exists()}, size: {input_path.stat().st_size if input_path.exists() else 0}")
            print(f"Output path: {output_path}")
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True,
                timeout=3600  # 1 hour timeout for long videos
            )
            
            print(f"Command stdout: {result.stdout}")
            if result.stderr:
                print(f"Command stderr: {result.stderr}")
            
            # Wait a moment for file to be written
            import time
            time.sleep(2)
            
            # Check if output file exists and has content
            if not output_path.exists():
                raise Exception(f"Output file was not created at {output_path}")
            
            file_size = output_path.stat().st_size
            print(f"Output file size: {file_size} bytes")
            
            if file_size == 0:
                # Try to find alternative output files
                output_dir = output_path.parent
                possible_files = list(output_dir.glob(f"{output_path.stem}*"))
                print(f"Possible output files: {[str(f) for f in possible_files]}")
                raise Exception(f"Output file is empty (0 bytes). Command may have failed silently. Check stderr: {result.stderr}")
            
            return output_path
        except subprocess.TimeoutExpired:
            raise Exception("Video processing timed out after 1 hour. Video may be too long.")
        except subprocess.CalledProcessError as e:
            error_msg = e.stderr if e.stderr else e.stdout
            print(f"Command failed with return code {e.returncode}")
            print(f"stderr: {e.stderr}")
            print(f"stdout: {e.stdout}")
            raise Exception(f"Video background removal failed: {error_msg}")

