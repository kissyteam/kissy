/**
 * @ignore
 * implement getScript for nodejs synchronously.
 * so loader need not to be changed.
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
                success && success();
                return;
            }

            var uri = new S.Uri(url),
                path = uri.getPath();

            try {
                var mod = fs.readFileSync(path, charset);
                var fn = vm.runInThisContext('(function(KISSY,require){' + mod + '})', url);
                fn(S, require);
                success && success();
            } catch (e) {
                S.log('in file: ' + url);
                S.log(e.stack, 'error');
                error && error(e);
            }

        }

    });

})(KISSY);