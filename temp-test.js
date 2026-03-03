const fetch = require('node-fetch'); // wait, built in fetch? node 18+ has fetch.
(async () => {
    try {
        const res = await fetch('http://localhost:5000/api/auth/request-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test_server_err@example.com' })
        });
        console.log(res.status);
        console.log(await res.text());
    } catch (e) {
        console.error(e);
    }
})();
