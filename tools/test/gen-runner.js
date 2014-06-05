var fs = require('fs');
var walk = require('walk');
var path = require('path');
var cwd = path.join(__dirname, '../../src/');
var walker = walk.walk(cwd);
//var fsExtra = require('fs-extra');
walker.on('directories', function (dir, states, next) {
    if (path.basename(dir) === 'tests' && fs.existsSync(path.join(dir, 'specs'))) {
        var parentPath = path.resolve(dir, '../src');
        if (fs.existsSync(parentPath)) {
            if (!fs.existsSync(path.join(dir, 'coverage'))) {
                fs.writeFileSync(path.join(dir, 'coverage'), '');
            }
            if (!fs.existsSync(path.join(dir, 'runner'))) {
                fs.writeFileSync(path.join(dir, 'runner'), '');
            }
        } else {
            if (fs.existsSync(path.join(dir, 'coverage'))) {
                fs.unlinkSync(path.join(dir, 'coverage'));
            }
            if (fs.existsSync(path.join(dir, 'runner'))) {
                fs.unlinkSync(path.join(dir, 'runner'));
            }
        }
    }
    next();
});