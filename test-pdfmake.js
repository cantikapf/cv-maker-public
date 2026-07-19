const pdfMake = require('pdfmake/build/pdfmake.js');
const pdfFonts = require('pdfmake/build/vfs_fonts.js');
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const { generateCVDocument } = require('./src/utils/pdfMakeGenerator.js');

const cvData = {
  personalInfo: {
    name: 'Cantikaputri Febrianti',
    location: 'Tangerang Selatan, Indonesia',
    email: 'cantikapf.7@gmail.com',
    phone: '+6287881022075',
    linkedin: 'linkedin.com/in/cantikaputri-febrianti',
    github: 'github.com/cantikapf',
    portfolio: 'cantikapf.github.io',
    summary: 'Results-driven professional with experience in AI marketing...',
    photo: '' // empty photo
  }
};

try {
  const docDefinition = generateCVDocument(cvData);
  const pdfDocGenerator = pdfMake.createPdf(docDefinition);
  pdfDocGenerator.getBuffer((buffer) => {
    require('fs').writeFileSync('test-output-pdfmake.pdf', buffer);
    console.log('Success!');
  });
} catch (e) {
  console.error(e);
}
