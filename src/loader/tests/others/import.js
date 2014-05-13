var dir = '/kissy/src/loader/src/';
if (location.href.indexOf('?coverage') !== -1) {
    dir = '/kissy/src/loader/coverage/src/';
}
var files = ['kissy.js','utils.js',
    'data-structure.js',
    'css-onload.js', 'get-script.js',
    'configs.js', 'combo-loader.js',
    'loader.js', 'i18n.js', 'init.js'];

for (var i = 0; i < files.length; i++) {
    window.document.write('<script src="' + dir +
        files[i] + '">' + '<' + '/script>');
}