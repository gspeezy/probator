const puppeteer = require('puppeteer');
const fs = require('fs');

async function generateTestPDF() {
  // Mock form data - replace with your actual form fields
  const mockData = {
    deceased_fullname: "Jarquavius Smith",
    deceased_residence: "Auranga",
    deceased_occupation: "Engineer",
    placeofdeath: "Auckland",
    dateofdeath: "01/01/2025",
    executor1_fullname: "Jaheim Smith",
    executor1_residence: "Queenstown",
    executor1_occupation: "Software Developer",
  };

  // Read your existing template file
  let html = fs.readFileSync('templates/PR7-template.html', 'utf8');
  
  // Replace all the merge tags with actual data
  Object.keys(mockData).forEach(key => {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), mockData[key]);
  });

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
  
  await page.setContent(html);
  await page.pdf({ 
    path: 'test-output.pdf', 
    format: 'A4' 
  });
  
  await browser.close();
  console.log('✅ PDF generated: test-output.pdf');
}

generateTestPDF().catch(console.error);