from pydantic import BaseModel
from typing import Optional
from enum import Enum


class ModelType(str, Enum):
    u2net = "u2net"
    u2netp = "u2netp"
    u2net_human_seg = "u2net_human_seg"


class ImageRemoveRequest(BaseModel):
    model: Optional[ModelType] = ModelType.u2net
    alpha_matting: Optional[bool] = False
    alpha_matting_foreground_threshold: Optional[int] = 240
    alpha_matting_background_threshold: Optional[int] = 10
    alpha_matting_erode_structure_size: Optional[int] = 10
    alpha_matting_base_size: Optional[int] = 1000
    background_color: Optional[str] = None  # hex color like "#FF0000"
    background_image: Optional[str] = None  # base64 or path


class VideoRemoveRequest(BaseModel):
    model: Optional[ModelType] = ModelType.u2net
    tv: Optional[bool] = False  # -tv flag
    mk: Optional[bool] = False  # -mk flag
    tov: Optional[bool] = False  # -tov flag
    toi: Optional[bool] = False  # -toi flag
    gb: Optional[bool] = False  # -gb flag
    wn: Optional[bool] = False  # -wn flag
    fr: Optional[float] = None  # -fr flag
    fl: Optional[float] = None  # -fl flag
    background_color: Optional[str] = None
    background_image: Optional[str] = None


class TaskStatus(BaseModel):
    task_id: str
    status: str
    progress: Optional[float] = None
    result_url: Optional[str] = None
    error: Optional[str] = None

