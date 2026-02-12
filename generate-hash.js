import bcrypt from 'bcrypt';

const password = 'AppWorks@123!';
const hash = bcrypt.hashSync(password, 10);
console.log('Password hash:', hash);
console.log('SQL INSERT value:');
console.log(`'$2b$10$${hash.split('$2b$10$')[1]}'`);
