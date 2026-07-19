import * as pdfMakeModule from 'pdfmake/build/pdfmake';
import * as pdfFontsModule from 'pdfmake/build/vfs_fonts';

const pdfMake = pdfMakeModule.default || pdfMakeModule;
const pdfFonts = pdfFontsModule.default || pdfFontsModule;

if (pdfFonts && pdfFonts.pdfMake) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
} else if (pdfFonts && pdfFonts.vfs) {
  pdfMake.vfs = pdfFonts.vfs;
}
function parseTextToPdfmake(text) {
  if (!text) return null;
  const lines = text.split('\n').filter(l => l.trim() !== '');
  if (lines.length > 1 || text.includes('\n')) {
    // Treat as bullet points
    return { ul: lines.map(l => l.replace(/\*\*(.*?)\*\*/g, '$1').trim()), style: 'list' };
  }
  return { text: text.replace(/\*\*(.*?)\*\*/g, '$1'), style: 'bodyText' };
}

export function generateCVDocument(cvData) {
  const { personalInfo, workExperience, education, skills, projects, certifications } = cvData;
  const { name, location, email, phone, linkedin, github, portfolio, summary, photo } = personalInfo;

  // Header Logic
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
    headerColumns.push({
      image: photo,
      width: 70, 
      height: 93,
      margin: [0, 0, 15, 0]
    });
    headerColumns.push({
      stack: headerInfo,
      alignment: 'center',
      margin: [0, 10, 0, 0]
    });
  } else {
    headerColumns.push({ stack: headerInfo, alignment: 'center' });
  }

  const content = [];
  content.push({ columns: headerColumns });

  // Helper for Section Titles
  const addSection = (title) => {
    content.push({ text: title.toUpperCase(), style: 'sectionTitle' });
    content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 1 }], margin: [0, -4, 0, 8] });
  };

  // Helper to format dates
  const formatDates = (start, end) => {
    if (!start && !end) return '';
    if (start && end) return `${start} – ${end}`;
    return start || end;
  };

  // Helper for bullets
  const parseBullets = (bullets) => {
    if (!bullets || bullets.length === 0) return null;
    return {
      ul: bullets.map(b => b.replace(/\*\*(.*?)\*\*/g, '$1')),
      style: 'list'
    };
  };

  // Work Experience
  if (workExperience?.length > 0) {
    addSection('Work Experience');
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

  // Education
  if (education?.length > 0) {
    addSection('Education');
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

  // Projects
  if (projects?.length > 0) {
    addSection('Projects');
    projects.forEach(proj => {
      const projTitle = [];
      projTitle.push({ text: proj.title, style: 'entryTitle' });
      if (proj.link) projTitle.push({ text: ' | ' + proj.link, style: 'contactLink', link: (proj.link.startsWith('http') ? '' : 'https://') + proj.link });

      content.push({
        columns: [
          { text: projTitle },
          { text: formatDates(proj.startDate, proj.endDate), style: 'entryDate', alignment: 'right' }
        ]
      });
      const bullets = parseBullets(proj.bullets);
      if (bullets) content.push(bullets);
    });
  }

  // Skills
  if (skills?.length > 0) {
    addSection('Skills & Expertise');
    skills.forEach(skill => {
      content.push({
        text: [
          { text: skill.category + ': ', bold: true },
          skill.items
        ],
        style: 'bodyText'
      });
    });
  }

  // Certifications
  if (certifications?.length > 0) {
    addSection('Certifications');
    certifications.forEach(cert => {
      content.push({
        columns: [
          { text: cert.title, style: 'entryTitle' },
          { text: cert.date, style: 'entryDate', alignment: 'right' }
        ]
      });
      content.push({ text: cert.issuer, style: 'entrySubtitle' });
    });
  }

  const docDef = {
    pageSize: 'A4',
    pageMargins: [30, 30, 30, 30],
    defaultStyle: {
      font: 'Roboto',
      fontSize: 10,
      color: '#000000',
      lineHeight: 1.2
    },
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

  return docDef;
}

export function downloadCVDocument(cvData, filename) {
  const docDef = generateCVDocument(cvData);
  pdfMake.createPdf(docDef).download(filename);
}
