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

        getStyle: function (url, success) {
            S.log('nodejs does not support getStyle: ' + url, 'warn');
            if (S.isPlainObject(success)) {
                success = success.success;
            }
            success && success();
        },

        getScript: function (url, success, charset) {

            if (S.startsWith(S.Path.extname(url).toLowerCase(), '.css')) {
                return S.getStyle(url, success, charset);
            }

            var error = S.noop;
            if (S.isPlainObject(success)) {
                charset = success.charset;
                error = success.error || error;
                success = success.success;
            }
            var uri = new S.Uri(url),
                msg = 'nodejs does not support remote js file';
            if (uri.getScheme() != 'file') {
                S.log(msg, 'error');
                return error(msg);
            }
            fs.readFile(uri.getPath(), charset || 'utf-8', function (err, mod) {
                if (err) {
                    error(err);
                } else {
                    try {
                        var fn = vm.runInThisContext('(function(KISSY){' + mod + '})',
                            url);
                        fn(S);
                    } catch (e) {
                        S.log('in file: ' + url);
                        S.log(e.stack, 'error');
                        error(e);
                    }
                    success();
                }
            });
        }

    });

})(KISSY);