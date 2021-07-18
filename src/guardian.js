import { JSDOM } from 'jsdom';
import axios from 'axios';

export const findLatestCrossword = async () => {
  // Find the URL of the latest crossword
  const GUARDIAN_URL = 'https://www.theguardian.com/crosswords/series/cryptic';
  const { data } = await axios.get(GUARDIAN_URL);
  const { window } = new JSDOM(data);
  const crosswordNumbers = Array
    .from(window.document.querySelectorAll('a'))
    .filter(anchor => anchor.textContent.includes('Cryptic crossword'))
    .map(anchor => anchor.getAttribute('href'))
    .map(url => url.split('/').pop());

  return crosswordNumbers[0];
}