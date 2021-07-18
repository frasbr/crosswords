import axios from 'axios';
import moment from 'moment';
import { JSDOM } from 'jsdom';
import fs, { WriteStream } from 'fs';
import path from 'path';
import ptp from 'pdf-to-printer';
import { downloadPDF } from './downloadPDF.js';
import { findLatestCrossword } from './guardian.js';

// Guardian specific pdf retrieval
// const ORIGINAL_CROSSWORD = 28498;
// const EPOCH_DATE = '2021-07-17';
// const epoch = moment(EPOCH_DATE);
// const today = moment();
// const daysSinceEpoch = today.diff(epoch, 'days');
// const todaysCrossword = ORIGINAL_CROSSWORD + daysSinceEpoch;

const latestCrossword = await findLatestCrossword();

if (!latestCrossword) {
  console.error('Failed to find crossword');
  process.exit(1);
}

const CROSSWORD_URL = `https://www.theguardian.com/crosswords/cryptic/${latestCrossword}`;

// Find the link to the pdf version
console.log(`attempting to find crossword at: ${CROSSWORD_URL}`);
const res = await axios.get(CROSSWORD_URL);
const html = res.data;
const { window } = new JSDOM(html);
const anchors = Array.from(window.document.querySelectorAll('a'));
const pdfAnchor = anchors.filter(a => a.textContent.includes('PDF'))[0];
const pdfURL = pdfAnchor.getAttribute('href');
if (pdfURL) {
  console.log(`found a PDF at this address: ${pdfURL}`);
}

const fileToWriteTo = path.resolve(`guardian-cryptic-${latestCrossword}.pdf`);
console.log(`downloading PDF into file: ${fileToWriteTo}`);
await downloadPDF(pdfURL, fileToWriteTo);

console.log('searching for printer...');
const printerIds = await ptp.getPrinters().then(printers => printers.map(p => p.deviceId));
const printer = printerIds.find(p => p.toLowerCase().includes('brother') && !p.toLowerCase().includes('fax'));
if (printer) {
  console.log(`printer found: ${printer}`);
}

ptp.print(fileToWriteTo, {
  printer
}).then(console.log)
  .catch(console.error);
