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

build('xtemplate', ['xtemplate', 'xtemplate/runtime']);
build('dom', ['dom/base', 'dom/ie']);
build('event-dom', [
    'event-dom/base', 'event-dom/ie',
    'event-dom/focusin', 'event-dom/hashchange',
    'event-dom/input', 'event-dom/gesture/basic',
    'event-dom/gesture/edge-pan',
    'event-dom/gesture/pan',
    'event-dom/gesture/pinch',
    'event-dom/gesture/rotate',
    'event-dom/gesture/shake',
    'event-dom/gesture/swipe',
    'event-dom/gesture/tap',
    'event-dom/gesture/util'
]);

builds(['util', 'querystring', 'path',
    'event-base', 'event-custom',
    'ua', 'html-parser', 'json', 'url',
    'query-selector', 'feature', 'logger-manager']);

console.log('done');
