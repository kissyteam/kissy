module.exports = function (req, res) {
    var fs = require('fs');
    res.set('Content-Type', 'text/html;charset=gbk;');
    res.write(fs.readFileSync('./src/loader/tests/specs/getScript/cache.html'));
    res.end();
};