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

function builds(cs) {
    cs.forEach(function (c) {
        build(c);
    });
}

//function builds2(cs) {
//    cs.forEach(function (c) {
//        build(c[0], c[1]);
//    });
//}

build('xtemplate', ['xtemplate', 'xtemplate/runtime']);
builds(['util', 'querystring', 'path', 'ua', 'html-parser', 'json', 'url', 'feature']);

console.log('done');
