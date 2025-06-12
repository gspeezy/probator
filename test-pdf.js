const puppeteer = require('puppeteer');
const fs = require('fs');

async function generateTestPDF() {
  // Mock form data - replace with your actual form fields
  const mockData = {
    deceased_fullname: "Jarquavius Smith",
    deceased_fullname_in_will: "Jon Smythe",
    deceased_residence: "Auranga",
    former_will_address: "Drury",
    deceased_occupation: "Engineer",
    former_will_occupation: "Doctor",
    placeofdeath: "Auckland",
    dateofdeath: "1st of January 2025",
    executor1_fullname: "Jaheim Smith",
    executor1_fullname_in_will: "Jaheim Jahron Smith",
    executor1_residence: "Queenstown",
    executor1_former_address: "Cromwell",
    executor1_occupation: "Software Developer",
    executor1_former_occupation: "Teacher",
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