const fs = require('fs');
const content = `PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://peruguharika4_db_user:harika123456789@cluster0.qa4houd.mongodb.net/aspirebridge?retryWrites=true&w=majority
FRONTEND_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_RpkvgGqzIA3kly
RAZORPAY_KEY_SECRET=Jo4Ww99NQRSNR3Vd81
ADMIN_EMAIL=admin@aspirebridge.com
ADMIN_PASSWORD=admin1231335fr
ZEGOCLOUD_SERVER_SECRET=fc5348369ada20771a
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random
`;

fs.writeFileSync('.env', content, { encoding: 'utf8' });
console.log('✅ .env updated with new database credentials');
