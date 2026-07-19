const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('test-output.pdf');

pdf(dataBuffer).then(function(data) {
  console.log(data.text);
}).catch(console.error);
