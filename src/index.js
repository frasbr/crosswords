import axios from 'axios';

axios.get('https://www.theguardian.com/crosswords/cryptic/28499').then(res => {
  console.log(res.data);
});