/**
 * @ignore
 * implement getScript for nodejs synchronously.
 * so loader need not to be changed.
 * @author yiminghe@gmail.com
 */
(function (S) {
    if (!S.UA.nodejs) {
        return;
    }

    var fs = require('fs'),
        logger = S.getLogger('s/loader'),
        vm = require('vm');

    S.getScript = function (url, success, charset) {

        var error;

        if (S.isPlainObject(success)) {
            charset = success.charset;
            error = success.error;
            success = success.success;
        }

        if (S.startsWith(S.Path.extname(url).toLowerCase(), '.css')) {
            logger.warn('node js can not load css: ' + url);
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
            logger.error('in file: ' + url);
            logger.error(e.stack);
            error && error(e);
        }
    };
})(KISSY);