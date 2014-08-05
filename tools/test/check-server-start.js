var http = require('http');
var retry = 0;

function check() {
    var options = {
        hostname: 'localhost',
        port: 8888,
        path: '/kissy/'
    };
    if (retry) {
        console.log('retry: ' + retry);
    }
    console.log('check server: ' + JSON.stringify(options));
    var req = http.request(options, function (res) {
        if (res.statusCode === 200) {
            console.log('server ok!');
            process.exit(0);
        } else {
            console.log('statusCode: ' + res.statusCode);
            recheck();
        }
    });

    req.on('error', function (e) {
        console.log(e);
        recheck();
    });

    req.end();
}

function recheck() {
    setTimeout(function () {
        retry++;
        check();
    }, 1000);
}

check();
