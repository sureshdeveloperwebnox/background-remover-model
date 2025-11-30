import os
import time
from pathlib import Path
from typing import List


class FileCleanup:
    def __init__(self, temp_dir: str, max_age_hours: int = 24):
        self.temp_dir = Path(temp_dir)
        self.max_age_seconds = max_age_hours * 3600
        self.temp_dir.mkdir(parents=True, exist_ok=True)

    def cleanup_old_files(self):
        """Remove files older than max_age_hours"""
        current_time = time.time()
        removed_count = 0
        
        for file_path in self.temp_dir.rglob("*"):
            if file_path.is_file():
                file_age = current_time - file_path.stat().st_mtime
                if file_age > self.max_age_seconds:
                    try:
                        file_path.unlink()
                        removed_count += 1
                    except Exception as e:
                        print(f"Error removing {file_path}: {e}")
        
        return removed_count

    def get_temp_file_path(self, filename: str) -> Path:
        """Generate a temporary file path"""
        return self.temp_dir / filename

    def remove_file(self, file_path: Path):
        """Remove a specific file"""
        try:
            if file_path.exists():
                file_path.unlink()
        except Exception as e:
            print(f"Error removing {file_path}: {e}")

