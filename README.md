# NOMO-WATERMARK

PDF watermarking microservice for NOMO educational platform.

## Features

- 🎨 High-quality PDF watermarking using pdf-lib
- 📄 Support for text watermarks with custom positioning
- 🔒 Configurable opacity, rotation, and color
- 🚀 Fast processing with minimal file size increase
- ☁️ Optimized for Google Cloud Run

## API Endpoints

### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "nomo-watermark",
  "version": "1.0.0",
  "timestamp": "2026-01-17T08:00:00.000Z"
}
```

### `POST /add-watermark`

Add watermark to PDF.

**Request:**
```json
{
  "pdf_url": "https://example.com/document.pdf",
  "watermark": {
    "text": "NOMO",
    "fontSize": 60,
    "opacity": 0.3,
    "rotation": -45,
    "position": "center",
    "color": {
      "r": 0.5,
      "g": 0.5,
      "b": 0.5
    }
  }
}
```

**Or with base64:**
```json
{
  "pdf_base64": "JVBERi0xLjQK...",
  "watermark": {
    "text": "CONFIDENCIAL"
  }
}
```

**Response:**
Binary PDF file with watermark applied.

**Watermark Options:**
- `text` (string): Watermark text (default: "NOMO")
- `fontSize` (number): Font size (default: 60)
- `opacity` (number): 0.0-1.0 (default: 0.3)
- `rotation` (number): Degrees (default: -45)
- `position` (string): "center", "top-right", "bottom-left", "bottom-right" (default: "center")
- `color` (object): RGB values 0.0-1.0 (default: gray)

## Local Development
```bash
# Install dependencies
npm install

# Run server
npm start

# Development mode with auto-reload
npm run dev
```

## Docker
```bash
# Build image
docker build -t nomo-watermark .

# Run container
docker run -p 8080:8080 nomo-watermark

# Test
curl http://localhost:8080/health
```

## Deployment

Automatically deployed to Google Cloud Run via GitHub Actions on push to `main`.

**Endpoint:** `https://nomo-watermark-XXXXX-ew.a.run.app`

## Environment Variables

- `PORT` - Server port (default: 8080)
- `NODE_ENV` - Environment mode (production/development)

## License

MIT © 2026 NOMO CommV - Jaume López
