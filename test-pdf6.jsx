import React from 'react';
import { pdf } from '@react-pdf/renderer';
import CVDocumentPDF from './src/components/Preview/CVDocumentPDF.jsx';
import fs from 'fs';

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
    photo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
  }
};

async function test() {
  const doc = React.createElement(CVDocumentPDF, { cvData });
  const blob = await pdf(doc).toBuffer();
  fs.writeFileSync('test-output6.pdf', blob);
  console.log('PDF saved to test-output6.pdf');
}
test();
