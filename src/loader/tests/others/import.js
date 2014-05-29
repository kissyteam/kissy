(function () {
    var dir = '/kissy/src/loader/src/';
    var coverage = location.href.indexOf('?coverage') !== -1;
    var files = ['kissy', 'utils',
        'data-structure',
        'css-onload', 'get-script',
        'configs', 'combo-loader',
        'loader', 'i18n', 'init'];

    for (var i = 0; i < files.length; i++) {
        window.document.write('<script src="' + dir +
            files[i] + (coverage ? '-coverage' : '') + '.js">' + '<' + '/script>');
    }
    window.document.write('<script src="/kissy/src/loader/tests/others/version.js">' + '<' + '/script>');
})();