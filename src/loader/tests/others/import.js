// --no-module-wrap--
(function () {
    var build = location.href.indexOf('?build') !== -1;
    if (build) {
        window.document.write('<script src="/kissy/build/loader-debug.js">' + '<' + '/script>');
        return;
    }
    var min = location.href.indexOf('?min') !== -1;
    if (min) {
        window.document.write('<script src="/kissy/build/loader.js">' + '<' + '/script>');
        return;
    }
    var dir = '/kissy/src/loader/src/';
    var coverage = location.href.indexOf('?coverage') !== -1;
    var files = ['kissy',
        'logger',
        'utils',
        'data-structure',
        'css-onload',
        'get-script',
        'configs',
        'combo-loader',
        'loader',
        'i18n',
        'init'];
    if (coverage) {
        window.document.write('<script src="http://g.alicdn.com/kissy/third-party/0.1.0/jscover/jscoverage.js">' + '<' + '/script>');
    }
    for (var i = 0; i < files.length; i++) {
        window.document.write('<script src="' + dir +
            files[i] + (coverage ? '-coverage' : '') + '.js">' + '<' + '/script>');
    }
    window.document.write('<script src="/kissy/src/loader/tests/others/version.js">' + '<' + '/script>');
})();
