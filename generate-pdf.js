// generate-pdf.js
const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');

// Simple placeholder replacement function
function replacePlaceholders(htmlContent, data) {
    let result = htmlContent;
    for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, value);
    }
    return result;
}

async function generateProbatePDF(data) {
    try {
        // Determine template suffix based on executor count
        const templateSuffix = data.isSingleExecutor ? '' : '-dual';

        // Centralised list of templates in the correct order
        const templateFiles = [
            `PR1AA${templateSuffix}-template.html`,
            `PR1${templateSuffix}-template.html`,
            `PR7${templateSuffix}-template.html`,
            `exhibit_notes${templateSuffix}-template.html`
        ];
        
        let combinedHtml = '';
        
        for (const file of templateFiles) {
            const templatePath = path.join(__dirname, 'templates', file);
            let htmlContent = await fs.readFile(templatePath, 'utf-8');
            htmlContent = replacePlaceholders(htmlContent, data);
            combinedHtml += htmlContent + '<div style="page-break-after: always;"></div>';
        }
        
        const browser = await puppeteer.launch({
            headless: true,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });
        
        const page = await browser.newPage();
        await page.setContent(combinedHtml, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
            }
        });
        
        await browser.close();
        return pdfBuffer;
        
    } catch (err) {
        console.error('Error generating probate PDF:', err);
        throw err;
    }
}

module.exports = { generateProbatePDF };
