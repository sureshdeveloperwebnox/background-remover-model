# Development Guide

## Local Development Setup

### Backend Development

1. **Install Python 3.10+**
   ```bash
   python3 --version  # Should be 3.10 or higher
   ```

2. **Create virtual environment**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Install FFmpeg**
   - **Ubuntu/Debian**: `sudo apt-get update && sudo apt-get install ffmpeg`
   - **macOS**: `brew install ffmpeg`
   - **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH

5. **Run the server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

6. **Access API docs**
   - OpenAPI/Swagger: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

### Frontend Development

1. **Install Node.js 18+**
   ```bash
   node --version  # Should be 18 or higher
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Create `.env` file** (optional, for custom API URL)
   ```bash
   echo "VITE_API_URL=http://localhost:8000" > .env
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Access the app**
   - Frontend: http://localhost:5173

## Testing the Application

### Test Image Processing

1. Open http://localhost:5173 (or http://localhost if using Docker)
2. Upload an image file
3. Select options (model, alpha matting, etc.)
4. Click "Remove Background"
5. Wait for processing
6. Download the result

### Test Video Processing

1. Upload a video file (smaller videos recommended for testing)
2. Configure video options
3. Process and download

### API Testing

Use the interactive API docs at http://localhost:8000/docs or use curl:

```bash
# Test image endpoint
curl -X POST "http://localhost:8000/remove-image" \
  -F "file=@/path/to/image.jpg" \
  -F "model=u2net" \
  -o result.png

# Test health endpoint
curl http://localhost:8000/health
```

## Docker Development

### Build and Run

```bash
# Build all services
docker-compose build

# Start services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Rebuild After Changes

```bash
# Rebuild specific service
docker-compose build backend
docker-compose up -d backend

# Rebuild all
docker-compose build --no-cache
docker-compose up -d
```

### Access Services

- Frontend: http://localhost
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Troubleshooting

### Backend Issues

**Issue: `backgroundremover: command not found`**
- Solution: Ensure backgroundremover is installed: `pip install backgroundremover`

**Issue: `ffmpeg: command not found`**
- Solution: Install FFmpeg system-wide or in Docker container

**Issue: Out of memory errors**
- Solution: Process smaller files or increase Docker memory limits
- For videos, consider implementing Celery for async processing

**Issue: Model download fails**
- Solution: First run downloads models automatically. Ensure internet connection.

### Frontend Issues

**Issue: CORS errors**
- Solution: Update `CORS_ORIGINS` in backend `.env` or `docker-compose.yml`

**Issue: API calls fail**
- Solution: Check `VITE_API_URL` in frontend `.env` matches backend URL
- In Docker, use service name: `http://backend:8000`
- In local dev, use: `http://localhost:8000`

**Issue: Large file upload fails**
- Solution: Increase `client_max_body_size` in nginx.conf

### Docker Issues

**Issue: Port already in use**
- Solution: Change ports in `docker-compose.yml` or stop conflicting services

**Issue: Build fails**
- Solution: Clear Docker cache: `docker-compose build --no-cache`

**Issue: Container exits immediately**
- Solution: Check logs: `docker-compose logs backend`

## Code Structure

### Backend

- `app/main.py`: FastAPI application entry point
- `app/routers/`: API route handlers
- `app/services/`: Business logic (background removal)
- `app/utils/`: Utility functions (file cleanup)
- `app/models/`: Pydantic models for request/response

### Frontend

- `src/App.jsx`: Main application component
- `src/components/`: Reusable React components
  - `FileUploader.jsx`: File upload UI
  - `OptionsPanel.jsx`: Processing options
  - `ResultViewer.jsx`: Before/after preview
- `src/main.jsx`: React entry point

## Adding New Features

### Add New API Endpoint

1. Create route in `backend/app/routers/`
2. Add service method in `backend/app/services/`
3. Update `backend/app/main.py` to include router
4. Test in API docs

### Add New Frontend Component

1. Create component in `frontend/src/components/`
2. Import and use in `App.jsx` or parent component
3. Style with TailwindCSS classes

## Performance Tips

1. **Image Processing**: Use `u2netp` for faster processing
2. **Video Processing**: Consider async processing with Celery for large videos
3. **File Cleanup**: Runs automatically, but can be triggered manually
4. **Caching**: Consider adding Redis for caching processed results

## Next Steps

- [ ] Implement Celery for async video processing
- [ ] Add task status endpoint with polling
- [ ] Add user authentication
- [ ] Add processing history
- [ ] Add batch processing
- [ ] Add more model options
- [ ] Add progress tracking for videos

