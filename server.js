const express = require('express');
const fs = require('fs/promises');
const path = require('path');

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
 * @description API endpoint to receive the final mapped data.
 * For now, it just logs the data. Later, this will trigger PDF generation.
 */
app.post('/api/submit', (req, res) => {
    const finalData = req.body;
    
    console.log('-----------------------------------------');
    console.log('✅ Final Mapped Data Received for PDF:');
    console.log(JSON.stringify(finalData, null, 2));
    console.log('-----------------------------------------');
    
    // In a future step, you would trigger Puppeteer here with `finalData`
    
    res.json({ 
        status: 'success', 
        message: 'Data received successfully. Check server console.',
        data: finalData 
    });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT}/form.html to start the form.`);
});