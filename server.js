const express = require('express');
const { PDFDocument, rgb, degrees } = require('pdf-lib');
const fetch = require('node-fetch');
const app = express();

app.use(express.json({ limit: '50mb' }));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'nomo-watermark',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.post('/add-watermark', async (req, res) => {
  try {
    const { pdf_url, pdf_base64, watermark = {} } = req.body;

    if (!pdf_url && !pdf_base64) {
      return res.status(400).json({ 
        error: 'pdf_url or pdf_base64 is required' 
      });
    }

    let pdfBytes;
    if (pdf_base64) {
      pdfBytes = Buffer.from(pdf_base64, 'base64');
    } else {
      const response = await fetch(pdf_url);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }
      pdfBytes = await response.arrayBuffer();
    }

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    const text = watermark.text || 'NOMO';
    const fontSize = watermark.fontSize || 60;
    const opacity = watermark.opacity || 0.3;
    const rotation = watermark.rotation || -45;
    const color = watermark.color || { r: 0.5, g: 0.5, b: 0.5 };

    for (const page of pages) {
      const { width, height } = page.getSize();
      
      let x, y;
      const position = watermark.position || 'center';
      
      switch (position) {
        case 'center':
          x = width / 2 - (fontSize * text.length) / 4;
          y = height / 2;
          break;
        case 'top-right':
          x = width - fontSize * text.length / 2 - 50;
          y = height - 100;
          break;
        case 'bottom-left':
          x = 50;
          y = 100;
          break;
        case 'bottom-right':
          x = width - fontSize * text.length / 2 - 50;
          y = 100;
          break;
        default:
          x = width / 2 - (fontSize * text.length) / 4;
          y = height / 2;
      }

      page.drawText(text, {
        x,
        y,
        size: fontSize,
        color: rgb(color.r, color.g, color.b),
        opacity,
        rotate: degrees(rotation)
      });
    }

    const modifiedPdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=watermarked.pdf');
    res.send(Buffer.from(modifiedPdfBytes));

  } catch (error) {
    console.error('Watermark Error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ NOMO-WATERMARK running on port ${PORT}`);
  console.log(`📄 Health check: http://localhost:${PORT}/health`);
});
