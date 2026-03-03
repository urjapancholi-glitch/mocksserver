const http = require('http');
const req = http.request('http://localhost:5000/api/auth/request-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
}, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => console.log('STATUS:', res.statusCode, 'DATA:', data));
});
req.write(JSON.stringify({ email: 'new_test_12345@example.com' }));
req.end();
