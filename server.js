const express = require('express');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

app.post('/generate-pdf', async (req, res) => {
    console.log('📥  ➜  POST /generate-pdf received, body:', req.body);
  const formData = req.body;

  let template = fs.readFileSync('./templates/pdf-template.html', 'utf8');
  for (const key in formData) {
    const value = formData[key] || '';
    const placeholder = `{{${key}}}`;
    template = template.replaceAll(placeholder, value);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
//PDF generation uses Puppeteer with --no-sandbox for compatibility on Linux. 
// Consider reviewing sandboxing if migrating to production or accepting untrusted content.
    });
  const page = await browser.newPage();
  await page.setContent(template, { waitUntil: 'domcontentloaded' });

  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename="application.pdf"',
  });
  res.send(pdfBuffer);
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
