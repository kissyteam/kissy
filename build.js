var fs = require('fs-extra');
var path = require('path');
var bowerDir = path.resolve(process.cwd(), 'bower_components');
var buildDir = path.resolve(process.cwd(), 'build');

function build(component, components) {
    var cDir = path.resolve(bowerDir, component + '/build/');
    if (!components) {
        components = [component];
    }
    components.forEach(function (c) {
        fs.copySync(path.resolve(cDir, c + '-debug.js'), path.resolve(buildDir, c + '-debug.js'));
        fs.copySync(path.resolve(cDir, c + '.js'), path.resolve(buildDir, c + '.js'));
    });
}

build('xtemplate', ['xtemplate', 'xtemplate/runtime']);
build('util');

console.log('done');
