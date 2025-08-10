// generate-pdf.js
const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');

/**
 * Replace placeholders in the HTML with actual data.
 * Assumes replacePlaceholders is a shared function somewhere.
 */
const { replacePlaceholders } = require('./replacePlaceholders');

async function generateProbatePDF(data) {
    try {
        // Centralised list of templates
        const templates = [
            'PR1-template.html',
            'PR1AA-template.html',
            'PR7-template.html',
            'exhibit_notes-template.html'
        ];

        let combinedHtml = '';

        for (const file of templates) {
            const templatePath = path.join(__dirname, 'templates', file);
            let htmlContent = await fs.readFile(templatePath, 'utf-8');
            htmlContent = replacePlaceholders(htmlContent, data);
            combinedHtml += htmlContent + '<div style="page-break-after: always;"></div>';
        }

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
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
