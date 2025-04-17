const express = require('express');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

app.post('/generate-pdf', async (req, res) => {
  const formData = req.body;

  let template = fs.readFileSync('./templates/pdf-template.html', 'utf8');
  for (const key in formData) {
    template = template.replace(`{{${key}}}`, formData[key]);
  }

  const browser = await puppeteer.launch();
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
