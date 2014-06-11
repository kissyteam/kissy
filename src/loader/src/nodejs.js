/**
 * @ignore
 * implement getScript for nodejs synchronously.
 * so loader need not to be changed.
 * @author yiminghe@gmail.com
 */
(function (S) {
    // --no-module-wrap--
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

        if (!fs.existsSync(url)) {
            var e = 'can not find file ' + url;
            S.log(e, 'error');
            if (error) {
                error(e);
            }
            return;
        }

        try {

            // async is controlled by async option in use
            // sync load in getScript, same as cached load in browser environment
            var mod = fs.readFileSync(url, charset);
            // code in runInThisContext unlike eval can not access local scope
            // noinspection JSUnresolvedFunction
            // use path, or else use url will error in nodejs debug mode
            var factory = vm.runInThisContext('(function(KISSY, requireNode){' + mod + '})', url);

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
        S.use([modName], {
            success: function () {
                ret = [].slice.call(arguments, 1);
            },
            sync: true
        });
        return ret[0];
    };

    S.config('packages', {
        core: {
            filter: ''
        }
    });
})(KISSY);