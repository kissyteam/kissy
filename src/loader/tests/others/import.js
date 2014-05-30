(function () {
    var build = location.href.indexOf('?build') !== -1;
    if(build){
        window.document.write('<script src="/kissy/build/loader-debug.js">' + '<' + '/script>');
        return;
    }
    var min = location.href.indexOf('?min') !== -1;
    if(min){
        window.document.write('<script src="/kissy/build/loader.js">' + '<' + '/script>');
        return;
    }
    var dir = '/kissy/src/loader/src/';
    var coverage = location.href.indexOf('?coverage') !== -1;
    var files = ['kissy', 'utils',
        'data-structure',
        'css-onload', 'get-script',
        'configs', 'combo-loader',
        'loader', 'i18n', 'init'];
    if(coverage){
        window.document.write('<script src="/kissy/tools/jscover/assets/jscoverage.js">' + '<' + '/script>');
    }
    for (var i = 0; i < files.length; i++) {
        window.document.write('<script src="' + dir +
            files[i] + (coverage ? '-coverage' : '') + '.js">' + '<' + '/script>');
    }
    window.document.write('<script src="/kissy/src/loader/tests/others/version.js">' + '<' + '/script>');
})();