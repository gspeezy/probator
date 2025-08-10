const fs = require('fs');
const { generateProbatePDF } = require('./generate-pdf');

(async () => {
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

  try {
    const pdfBuffer = await generateProbatePDF(mockData);
    fs.writeFileSync('test-output.pdf', pdfBuffer);
    console.log('✅ PDF generated: test-output.pdf');
  } catch (err) {
    console.error('Error generating test PDF:', err);
  }
})();

