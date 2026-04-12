import https from 'https';

https.get('https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=filetype:audio%20crowd&utf8=&format=json', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log(JSON.parse(data).query.search.map(s => s.title));
  });
});
