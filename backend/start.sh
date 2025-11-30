#!/bin/bash
# Start script for backend

# Cleanup old files on startup
python -c "from app.utils.file_cleanup import FileCleanup; FileCleanup('/tmp/backgroundremover').cleanup_old_files()"

# Start the server
uvicorn app.main:app --host 0.0.0.0 --port 8000

