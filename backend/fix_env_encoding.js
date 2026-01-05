const fs = require('fs');
const content = `PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/aspirebridge
FRONTEND_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_RpkvgGqzIA3kly
RAZORPAY_KEY_SECRET=Jo4Ww99NQRSNR3Vd81
ADMIN_EMAIL=admin@aspirebridge.com
ADMIN_PASSWORD=admin1231335fr
ZEGOCLOUD_SERVER_SECRET=fc5348369ada20771a
`;

fs.writeFileSync('.env', content, { encoding: 'utf8' });
console.log('.env file repaired (UTF-8)');
