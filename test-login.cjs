const https = require('https');

const data = JSON.stringify({
    email: 'admin@church.com',
    password: 'Admin@2024'
});

const options = {
    hostname: 'church-management.marcuxyang.workers.dev',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);
    let body = '';

    res.on('data', d => {
        body += d;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(body);
            console.log('Response:', JSON.stringify(json, null, 2));
        } catch (e) {
            console.log('Raw Body:', body);
        }
    });
});

req.on('error', error => {
    console.error(error);
});

req.write(data);
req.end();
