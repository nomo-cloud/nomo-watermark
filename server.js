const express = require('express');
const { PDFDocument, rgb, degrees } = require('pdf-lib');
const fetch = require('node-fetch');
const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'nomo-watermark',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Add watermark to PDF
app.post('/add-watermark', async (req, res) => {
  try {
    const { pdf_url, pdf_base64, watermark = {} } = req.body;

    // Validate input
    if (!pdf_url && !pdf_base64) {
      return res.status(400).json({ 
        error: 'pdf_url or pdf_base64 is required' 
      });
    }

    // Get PDF bytes
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

    // Load PDF
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    // Watermark configuration
    const text = watermark.text || 'NOMO';
    const fontSize = watermark.fontSize || 60;
    const opacity = watermark.opacity || 0.3;
    const rotation = watermark.rotation || -45;
    const color = watermark.color || { r: 0.5, g: 0.5, b: 0.5 };

    // Add watermark to all pages
    for (const page of pages) {
      const { width, height } = page.getSize();
      
      // Calculate position
      let x, y;
      const position = watermark.position || 'center';
      
      switch (position) {
        case 'center':
          x = width / 2 - (fontSize * text.length
