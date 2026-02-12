const bcrypt = require('bcryptjs');
const fs = require('fs');

async function main() {
  const hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
  const password = 'AppWorks@123!';
  
  const result = await bcrypt.compare(password, hash);
  const newHash = await bcrypt.hash(password, 10);
  
  fs.writeFileSync('test-result.txt', 'compare: ' + result + '\nnewHash: ' + newHash);
  console.log('Done');
}

main();
