const url = process.env.CLIENTS_API_URL || 'https://i-projects.skin/api/clients';

async function main() {
  const res = await fetch(url, { method: 'GET' });
  const text = await res.text();
  console.log('GET', url);
  console.log('Status:', res.status);
  console.log('Body:', text);

  try {
    const json = JSON.parse(text);
    if (Array.isArray(json) && json[0] && typeof json[0] === 'object') {
      console.log('First item keys:', Object.keys(json[0]));
    }
  } catch {}
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
