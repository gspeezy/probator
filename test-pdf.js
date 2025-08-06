const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

async function generateTestPDF() {
  const mockData = {
    deceased_fullname: "Jarquavius Smith",
    deceased_residence: "Auranga",
    deceased_occupation: "Engineer",
    placeofdeath: "Auckland",
    dateofdeath: "01/01/2025",
    executor1_fullname: "Jaheim Smith",
    executor1_residence: "Queenstown",
    executor1_occupation: "Software Developer",
    dateofwill: "01/02/2023"
  };

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  const page = await browser.newPage();

  // Paths to all 4 form templates
  const templateFiles = [
    'templates/PR7-template.html',         // Form 1: Probate in Common Form
    'templates/exhibit_notes-template.html',         // Form 2: Exhibit Notes
    'templates/PR1-template.html',            // Form 3: Affidavit for Obtaining Grant of Probate
    'templates/PR1AA-template.html' // Form 4: Application Without Notice
  ];

  const pdfBuffers = [];

  for (const templatePath of templateFiles) {
    // Read and inject mock data
    let html = fs.readFileSync(path.resolve(__dirname, templatePath), 'utf8');
    Object.entries(mockData).forEach(([key, value]) => {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    pdfBuffers.push(pdfBuffer);
  }

  // Merge PDFs
  const finalPdf = await PDFDocument.create();
  for (const buffer of pdfBuffers) {
    const tempDoc = await PDFDocument.load(buffer);
    const pages = await finalPdf.copyPages(tempDoc, tempDoc.getPageIndices());
    pages.forEach(page => finalPdf.addPage(page));
  }

  const outputBytes = await finalPdf.save();
  fs.writeFileSync('test-output.pdf', outputBytes);

  await browser.close();
  console.log('✅ PDF generated: test-output.pdf');
}

generateTestPDF().catch(console.error);
