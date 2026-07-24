const express = require('express');
const app = express();
const PORT = 3000;

async function getMetadata(path) {
  try {
    const res = await fetch(`http://169.254.169.254/latest/meta-data/${path}`);
    return await res.text();
  } catch (e) {
    return 'unavailable';
  }
}

app.get('/', async (req, res) => {
  const instanceId = await getMetadata('instance-id');
  const az = await getMetadata('placement/availability-zone');
  res.send(`<h2>Served by instance ${instanceId} in ${az}</h2>`);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => console.log(`App running on port ${PORT}`));
