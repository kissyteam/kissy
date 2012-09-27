/**
 * @ignore
 * @fileOverview implement getScript for nodejs.
 *  so loader need not to be changed.
 * @author yiminghe@gmail.com
 */
(function (S) {

    var fs = require('fs'),
        vm = require('vm');

    S.mix(S, {

        getScript: function (url, success, charset) {

            var error;

            if (S.isPlainObject(success)) {
                charset = success.charset;
                error = success.error;
                success = success.success;
            }

            if (S.startsWith(S.Path.extname(url).toLowerCase(), '.css')) {
                S.log('node js can not load css: ' + url, 'warn');
                return success && success();
            }

            var uri = new S.Uri(url);

            fs.readFile(uri.getPath(), charset || 'utf-8', function (err, mod) {
                if (err) {
                    error && error(err);
                } else {
                    try {
                        var fn = vm.runInThisContext('(function(KISSY){' + mod + '})', url);
                        fn(S);
                    } catch (e) {
                        S.log('in file: ' + url);
                        S.log(e.stack, 'error');
                        error && error(e);
                    }
                    success && success();
                }
            });
        }

    });

})(KISSY);