const express = require('express');
const app = express();
const PORT = 3000;

async function getToken() {
  const res = await fetch('http://169.254.169.254/latest/api/token', {
    method: 'PUT',
    headers: { 'X-aws-ec2-metadata-token-ttl-seconds': '21600' }
  });
  return await res.text();
}

async function getMetadata(path) {
  try {
    const token = await getToken();
    const res = await fetch(`http://169.254.169.254/latest/meta-data/${path}`, {
      headers: { 'X-aws-ec2-metadata-token': token }
    });
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
