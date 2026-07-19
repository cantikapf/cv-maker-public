const fs = require('fs');
const pdfMake = require('pdfmake/build/pdfmake.js');
const vfsFonts = require('pdfmake/build/vfs_fonts.js');
pdfMake.vfs = vfsFonts.pdfMake ? vfsFonts.pdfMake.vfs : vfsFonts.vfs;

const docDefinition = {
  content: [
    { text: 'Testing pdfmake', style: 'header' }
  ],
  defaultStyle: { font: 'Helvetica' }
};

const pdfDocGenerator = pdfMake.createPdf(docDefinition);
pdfDocGenerator.getBuffer((buffer) => {
  fs.writeFileSync('test-output-pdfmake2.pdf', buffer);
  console.log('Success!');
});
