const http = require('http');
const req = http.request('http://localhost:5000/api/auth/register/request-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
}, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => console.log('STATUS:', res.statusCode, 'DATA:', data));
});
req.write(JSON.stringify({ email: 'adarshpandey34846@gmail.com' }));
req.end();
