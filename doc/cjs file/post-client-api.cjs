const url = process.env.CLIENTS_API_URL || 'https://i-projects.skin/api/clients';

const nameArg = process.argv[2];
const taxIdArg = process.argv[3];
const omitTaxId = process.argv.includes('--omit-taxId');

const payload = {
  name: nameArg || `TEST-API-${Date.now()}`,
  ...(omitTaxId ? {} : { taxId: taxIdArg || '0994000160999' }),
};

async function main() {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log('POST', url);
  console.log('Payload:', payload);
  console.log('Status:', res.status);
  console.log('Body:', text);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
