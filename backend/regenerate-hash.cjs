const bcrypt = require('bcryptjs');
const fs = require('fs');

async function main() {
  const passwords = [
    'AppWorks@123!',
    'AppWorks@123',
    'appworks@123!',
    'Appworks@123!',
    'password',
    'AppWorks@123!!'
  ];
  
  const targetHash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
  
  let results = 'Testing passwords against target hash:\n';
  
  for (const pwd of passwords) {
    const match = await bcrypt.compare(pwd, targetHash);
    const newHash = await bcrypt.hash(pwd, 10);
    results += `${pwd}: ${match} | hash: ${newHash}\n`;
  }
  
  fs.writeFileSync('password-test.txt', results);
  console.log('Done');
}

main();
