const fs = require('fs');
const pdfMake = require('pdfmake/build/pdfmake.js');
const vfsFonts = require('pdfmake/build/vfs_fonts.js');
pdfMake.vfs = vfsFonts.pdfMake ? vfsFonts.pdfMake.vfs : vfsFonts.vfs;

// Quick mock of the ES module generator logic since we are in CJS here
const { defaultCV } = require('./src/data/defaultCV.js');

// Helper for Section Titles
const addSection = (content, title) => {
  content.push({ text: title.toUpperCase(), style: 'sectionTitle' });
  content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 1 }], margin: [0, -4, 0, 8] });
};

const formatDates = (start, end) => {
  if (!start && !end) return '';
  if (start && end) return `${start} – ${end}`;
  return start || end;
};

const parseBullets = (bullets) => {
  if (!bullets || bullets.length === 0) return null;
  return {
    ul: bullets.map(b => b.replace(/\*\*(.*?)\*\*/g, '$1')),
    style: 'list'
  };
};

function generateCVDocument(cvData) {
  const { personalInfo, workExperience, education, skills, projects, certifications } = cvData;
  const { name, location, email, phone, linkedin, github, portfolio, summary, photo } = personalInfo;

  const row1 = [location, email, phone].filter(Boolean);
  const contactsContent = [];
  if (row1.length > 0) contactsContent.push({ text: row1.join(' • '), style: 'contactText' });
  if (linkedin) {
    if (contactsContent.length > 0) contactsContent.push({ text: ' • ', style: 'contactText' });
    contactsContent.push({ text: 'linkedin.com/in/' + linkedin.split('/').pop(), link: 'https://' + linkedin, style: 'contactLink' });
  }

  const row2Content = [];
  if (github) row2Content.push({ text: github, link: 'https://' + github, style: 'contactLink' });
  if (portfolio) {
    if (row2Content.length > 0) row2Content.push({ text: ' • ', style: 'contactText' });
    row2Content.push({ text: portfolio, link: 'https://' + portfolio, style: 'contactLink' });
  }

  const headerInfo = [
    { text: name || 'Your Name', style: 'name' },
    { text: contactsContent, alignment: 'center', margin: [0, 0, 0, 2] },
    row2Content.length > 0 ? { text: row2Content, alignment: 'center', margin: [0, 0, 0, 2] } : null,
    summary ? { text: summary, style: 'summary' } : null
  ].filter(Boolean);

  const headerColumns = [];
  if (photo) {
    headerColumns.push({ image: photo, width: 70, height: 93, margin: [0, 0, 15, 0] });
    headerColumns.push({ stack: headerInfo, alignment: 'center', margin: [0, 10, 0, 0] });
  } else {
    headerColumns.push({ stack: headerInfo, alignment: 'center' });
  }

  const content = [];
  content.push({ columns: headerColumns });

  if (workExperience?.length > 0) {
    addSection(content, 'Work Experience');
    workExperience.forEach(job => {
      content.push({
        columns: [
          { text: job.jobTitle, style: 'entryTitle' },
          { text: formatDates(job.startDate, job.endDate), style: 'entryDate', alignment: 'right' }
        ]
      });
      content.push({
        columns: [
          { text: job.company, style: 'entrySubtitle' },
          { text: job.location, style: 'entryLocation', alignment: 'right' }
        ]
      });
      const bullets = parseBullets(job.bullets);
      if (bullets) content.push(bullets);
    });
  }

  if (education?.length > 0) {
    addSection(content, 'Education');
    education.forEach(edu => {
      content.push({
        columns: [
          { text: edu.degree, style: 'entryTitle' },
          { text: formatDates(edu.startDate, edu.endDate), style: 'entryDate', alignment: 'right' }
        ]
      });
      content.push({
        columns: [
          { text: [edu.institution, edu.gpa ? ` | ${edu.gpa}` : ''].join(''), style: 'entrySubtitle' },
          { text: edu.location, style: 'entryLocation', alignment: 'right' }
        ]
      });
      const bullets = parseBullets(edu.bullets);
      if (bullets) content.push(bullets);
    });
  }

  return {
    pageSize: 'A4',
    pageMargins: [30, 30, 30, 30],
    defaultStyle: { font: 'Roboto', fontSize: 10, color: '#000000', lineHeight: 1.2 },
    styles: {
      name: { fontSize: 20, bold: true, alignment: 'center', margin: [0, 0, 0, 4] },
      contactText: { fontSize: 8.5, color: '#333333' },
      contactLink: { fontSize: 8.5, color: '#000000' },
      summary: { fontSize: 9, color: '#111111', alignment: 'justify', margin: [0, 6, 0, 0], lineHeight: 1.4 },
      sectionTitle: { fontSize: 10, bold: true, margin: [0, 10, 0, 6] },
      entryTitle: { fontSize: 10, bold: true, margin: [0, 2, 0, 1] },
      entrySubtitle: { fontSize: 9.5, margin: [0, 0, 0, 2] },
      entryDate: { fontSize: 9, color: '#111111', bold: true, margin: [0, 2, 0, 1] },
      entryLocation: { fontSize: 9, color: '#555555', margin: [0, 0, 0, 2] },
      bodyText: { fontSize: 9.5, margin: [0, 0, 0, 4] },
      list: { fontSize: 9.5, margin: [0, 0, 0, 6] }
    },
    content
  };
}

try {
  import('./src/data/defaultCV.js').then(module => {
     const docDefinition = generateCVDocument(module.defaultCV);
     const pdfDocGenerator = pdfMake.createPdf(docDefinition);
     pdfDocGenerator.getBuffer((buffer) => {
       fs.writeFileSync('test-output-pdfmake3.pdf', buffer);
       console.log('Success!');
     });
  });
} catch (e) {
  console.error(e);
}
