const http = require('http');
http.get('http://localhost:5000/api/mock/admin', (res) => {
    let data = '';
    res.on('data', (c) => data += c);
    res.on('end', () => {
        const mocks = JSON.parse(data);
        mocks.forEach(m => console.log(`Mock: ${m.title}, Pos: ${m.positiveMarks}, Neg: ${m.negativeMarks}`));
    });
});
