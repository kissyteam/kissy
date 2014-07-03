var fs = require('fs');
var path = require('path');
if (!fs.existsSync(path.join(__dirname, '../gen/'))) {
    fs.mkdirSync(path.join(__dirname, '../gen/'));
}
var code = require('../common/gen-tc').getJsForPhantom();
fs.writeFileSync(path.join(__dirname, '../gen/tc.js'), code, 'utf-8');
console.log('gen tc: ' + path.join(__dirname, '../gen/tc.js'));