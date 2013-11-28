/**
 * @ignore
 * implement getScript for nodejs synchronously.
 * so loader need not to be changed.
 * @author yiminghe@gmail.com
 */
(function (S) {
    /*global require*/
    var fs = require('fs'),
        vm = require('vm');

    S.getScript = function (url, success, charset) {
        var error;

        if (S.isPlainObject(success)) {
            charset = success.charset;
            error = success.error;
            success = success.success;
        }

        if (S.startsWith(S.Path.extname(url).toLowerCase(), '.css')) {
            S.log('node js can not load css: ' + url, 'warn');
            if (success) {
                success();
            }
            return;
        }

        var uri = new S.Uri(url),
            path = uri.getPath();

        try {
            var mod = fs.readFileSync(path, charset);
            //noinspection JSUnresolvedFunction
            var factory = vm.runInThisContext('(function(KISSY,requireNode){' + mod + '})', url);
            factory(S, require);
            if (success) {
                success();
            }
        } catch (e) {
            S.log('in file: ' + url, 'error');
            S.log(e.stack, 'error');
            if (error) {
                error(e);
            }
        }
    };
})(KISSY);