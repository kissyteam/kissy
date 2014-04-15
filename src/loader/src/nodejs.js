/**
 * @ignore
 * implement getScript for nodejs synchronously.
 * so loader need not to be changed.
 * @author yiminghe@gmail.com
 */
(function (S) {
    /*global require*/
    var fs = require('fs'),
        Utils = S.Loader.Utils,
        vm = require('vm');

    S.getScript = function (url, success, charset) {
        var error;

        if (typeof success === 'object') {
            charset = success.charset;
            error = success.error;
            success = success.success;
        }

        if (Utils.endsWith(url, '.css')) {
            S.log('node js can not load css: ' + url, 'warn');
            if (success) {
                success();
            }
            return;
        }

        try {
            // async is controlled by async option in use
            // sync load in getScript, same as cached load in browser environment
            var mod = fs.readFileSync(url, charset);
            // code in runInThisContext unlike eval can not access local scope
            //noinspection JSUnresolvedFunction
            // use path, or else use url will error in nodejs debug mode
            var factory = vm.runInThisContext('(function(KISSY,requireNode){' + mod + '})', url);

            factory(S, function (moduleName) {
                return require(Utils.normalizePath(url, moduleName));
            });

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

    S.KISSY = S;

    /*global module*/
    if (typeof module !== 'undefined') {
        module.exports = S;
    }

    S.config({
        charset: 'utf-8',
        /*global __dirname*/
        base: __dirname.replace(/\\/g, '/').replace(/\/$/, '') + '/'
    });

    // require synchronously in node js
    S.nodeRequire = function (modName) {
        var ret = [];
        if (typeof modName === 'string' && modName.indexOf(',') !== -1) {
            modName = modName.split(',');
        }
        S.use(modName, {
            success: function () {
                ret = [].slice.call(arguments, 1);
            },
            sync: true
        });
        return typeof modName === 'string' ? ret[0] : ret;
    };
})(KISSY);