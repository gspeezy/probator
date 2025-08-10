const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const puppeteer = require('puppeteer');
const { generateProbatePDF } = require('./generate-pdf');

const app = express();
const PORT = 3000;

// Middleware to serve static files from the 'public' directory
app.use(express.static('public'));
// Middleware to parse JSON request bodies
app.use(express.json());

/**
 * @api {get} /api/questions
 * @description API endpoint to fetch the form questions from the JSON file.
 */
app.get('/api/questions', async (req, res) => {
    try {
        console.log('API: /api/questions hit. Reading questions file.');
        const questionsPath = path.join(__dirname, 'questions-and-logic.json');
        const data = await fs.readFile(questionsPath, 'utf-8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading questions file:', error);
        res.status(500).json({ error: 'Could not load form questions.' });
    }
});

/**
 * @api {post} /api/submit
 * @description API endpoint to receive the final mapped data and generate PDF.
 */
app.post('/api/submit', async (req, res) => {
    const finalData = req.body;
    
    console.log('-----------------------------------------');
    console.log('✅ Final Mapped Data Received for PDF:');
    console.log(JSON.stringify(finalData, null, 2));
    console.log('-----------------------------------------');
    
    try {
        // Generate PDF
        const pdfBuffer = await generateProbatePDF(finalData);
        
        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="probate-application.pdf"');
        res.setHeader('Content-Length', pdfBuffer.length);
        
        // Send the PDF
        res.send(pdfBuffer);
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to generate PDF. Please try again.' 
        });
    }
});

const { generateProbatePDF } = require('./generate-pdf');

app.post('/generate', async (req, res) => {
    try {
        const pdfBuffer = await generateProbatePDF(req.body);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="probate-forms.pdf"',
        });
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating probate PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});

/**
 * Function to replace placeholders in HTML template with actual data
 */
function replacePlaceholders(htmlContent, data) {
    // Handle empty/undefined values by replacing with empty string
    const safeReplace = (key, value) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        return htmlContent.replace(regex, value || '');
    };
    
    // Replace all known placeholders
    Object.keys(data).forEach(key => {
        htmlContent = safeReplace(key, data[key]);
    });
    
    // Handle any remaining unreplaced placeholders by removing them
    htmlContent = htmlContent.replace(/{{[^}]+}}/g, '');
    
    return htmlContent;
}

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT}/form.html to start the form.`);
});