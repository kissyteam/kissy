var prefix = '/kissy/src/';
var cwd = process.cwd();
var fs = require('fs');
var Path = require('path');

module.exports = function (req, res, next) {
    var m = req.originalUrl.match(/(.+)\/coverage\/runner(\?.+)?$/);
    if (!m) {
        next();
        return;
    }
    var path = m[1];
    var componentName = path.slice(prefix.length).replace(/sub-modules\//, '');
    var testPath = path + '/tests/runner';
    var testJss = Path.normalize(cwd + '/../' + testPath + '/test.jss');
    var testHtml = Path.normalize(cwd + '/../' + testPath + '/test.html');
    if (fs.existsSync(testJss)) {
        testPath += '/test.jss';
    } else if (fs.existsSync(testHtml)) {
        testPath += '/test.html';
    }
    res.render('coverage', {
        component: componentName,
        jss: testPath
    });
};