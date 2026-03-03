const config = require('./src/config');
console.log('Tested Config directly:', config.smtpUser, config.smtpPass ? 'PASS SET' : 'PASS UNSET');

const email = require('./src/utils/email');
console.log('Email required.');
