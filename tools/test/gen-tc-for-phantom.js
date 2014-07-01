var fs = require('fs');
var path = require('path');
var code = require('../common/gen-tc').getJsForPhantom();
fs.writeFileSync(path.join(__dirname, '../gen/tc.js'), code, 'utf-8');
console.log('gen tc: ' + path.join(__dirname, '../gen/tc.js'));