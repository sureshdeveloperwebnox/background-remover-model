# Background Remover - Full Stack Application

A production-ready full-stack application for removing backgrounds from images and videos using the [backgroundremover](https://github.com/nadermx/backgroundremover) library.

## Features

- 🖼️ **Image Background Removal**: Remove backgrounds from images with various models
- 🎥 **Video Background Removal**: Process videos to remove backgrounds
- 🎨 **Advanced Options**: Alpha matting, custom background colors, background images
- 📊 **Real-time Processing**: Visual feedback during processing
- 🎯 **Before/After Preview**: Side-by-side comparison of original and processed files
- 📥 **Easy Download**: One-click download of processed files

## Tech Stack

### Backend
- Python 3.10+
- FastAPI
- backgroundremover
- PyTorch (CPU)
- FFmpeg
- Celery (optional for async processing)
- Redis (optional, for Celery)

### Frontend
- React 18
- Vite
- TailwindCSS
- Axios

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── routers/             # API route handlers
│   │   │   ├── image_router.py
│   │   │   └── video_router.py
│   │   ├── services/            # Business logic
│   │   │   └── background_remover.py
│   │   ├── utils/               # Utility functions
│   │   │   └── file_cleanup.py
│   │   └── models/              # Pydantic models
│   │       └── schemas.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── FileUploader.jsx
│   │   │   ├── OptionsPanel.jsx
│   │   │   └── ResultViewer.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- (Optional) Node.js 18+ and Python 3.10+ for local development

### Using Docker (Recommended)

1. **Clone or navigate to the project directory**

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Local Development

#### Backend

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Install FFmpeg** (if not already installed)
   - Ubuntu/Debian: `sudo apt-get install ffmpeg`
   - macOS: `brew install ffmpeg`
   - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)

5. **Run the server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Access the app**
   - Frontend: http://localhost:5173

## API Endpoints

### POST /remove-image

Remove background from an uploaded image.

**Request:**
- `file` (multipart/form-data): Image file
- `model` (optional): Model to use (`u2net`, `u2netp`, `u2net_human_seg`)
- `alpha_matting` (optional): Enable alpha matting (boolean)
- `alpha_matting_foreground_threshold` (optional): Foreground threshold (0-255)
- `alpha_matting_background_threshold` (optional): Background threshold (0-255)
- `alpha_matting_erode_structure_size` (optional): Erode structure size
- `alpha_matting_base_size` (optional): Base size for alpha matting
- `background_color` (optional): Hex color code (e.g., "#FF0000")
- `background_image` (optional): Background image file

**Response:**
- Processed image file (PNG)

### POST /remove-video

Remove background from an uploaded video.

**Request:**
- `file` (multipart/form-data): Video file
- `model` (optional): Model to use
- `tv` (optional): TV mode flag (boolean)
- `mk` (optional): Masks only flag (boolean)
- `tov` (optional): Transparent output video flag (boolean)
- `toi` (optional): Transparent output images flag (boolean)
- `gb` (optional): Green background flag (boolean)
- `wn` (optional): White background flag (boolean)
- `fr` (optional): Frame rate (float)
- `fl` (optional): Frame limit (float)
- `background_color` (optional): Hex color code
- `background_image` (optional): Background image file

**Response:**
- Processed video file (MP4)

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy"
}
```

## Usage

1. **Upload a file**: Drag and drop or click to browse for an image or video
2. **Configure options**: Select model, enable alpha matting, set background color/image
3. **Process**: Click "Remove Background" to start processing
4. **View results**: See side-by-side comparison of original and processed files
5. **Download**: Click "Download Result" to save the processed file

## Models

- **u2net**: Default model, good general-purpose performance
- **u2netp**: Lightweight model, faster processing
- **u2net_human_seg**: Optimized for human segmentation

## Advanced Options

### Alpha Matting
Improves edge quality for better results, especially for fine details like hair.

### Background Replacement
- **Background Color**: Replace background with a solid color (hex format)
- **Background Image**: Replace background with another image

### Video Options
- **TV Mode (-tv)**: Optimize for TV/video content
- **Masks Only (-mk)**: Generate masks only
- **Transparent Output**: Create transparent backgrounds
- **Frame Rate/Limit**: Control video processing parameters

## File Cleanup

The application automatically cleans up temporary files older than 24 hours. You can manually trigger cleanup by calling the cleanup service.

## Troubleshooting

### Backend Issues

1. **FFmpeg not found**
   - Ensure FFmpeg is installed in the Docker container or system
   - Check Dockerfile includes FFmpeg installation

2. **Out of memory**
   - Large videos may require more memory
   - Consider processing smaller files or increasing Docker memory limits

3. **Processing fails**
   - Check file format is supported
   - Verify model files are downloaded (first run may download models)

### Frontend Issues

1. **CORS errors**
   - Update `CORS_ORIGINS` in `.env` file
   - Ensure backend is running and accessible

2. **Upload fails**
   - Check file size limits (configured in nginx.conf)
   - Verify backend is running

## Development Scripts

### Backend
```bash
# Start backend
cd backend
uvicorn app.main:app --reload

# Run cleanup
python -m app.utils.file_cleanup
```

### Frontend
```bash
# Start dev server
cd frontend
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild specific service
docker-compose build backend
docker-compose up -d backend
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `CORS_ORIGINS`: Allowed CORS origins (comma-separated)
- `REDIS_URL`: Redis connection URL (if using Celery)
- `CELERY_BROKER_URL`: Celery broker URL
- `CELERY_RESULT_BACKEND`: Celery result backend URL

## License

This project uses the backgroundremover library. Please refer to the [backgroundremover license](https://github.com/nadermx/backgroundremover) for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues related to:
- **backgroundremover library**: [GitHub Issues](https://github.com/nadermx/backgroundremover/issues)
- **This application**: Open an issue in this repository

## Acknowledgments

- [backgroundremover](https://github.com/nadermx/backgroundremover) - The core library for background removal
- FastAPI - Modern Python web framework
- React & Vite - Frontend framework and build tool

# background-reomver-model
