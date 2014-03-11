/**
 * Router data structure
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S) {
    /*
     transform route declaration to router reg
     @param str
     /search/:q
     /user/*path
     */
    function pathRegexp(path, keys, strict, sensitive) {
        if (S.isArray(path)) {
            path = '(' + path.join('|') + ')';
        }
        path = path
            .concat(strict ? '' : '/?')
            .replace(/\/\(/g, '(?:/')
            .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function (_, slash, format, key, capture, optional, star) {
                keys.push(key);
                slash = slash || '';
                return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') +
                    (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')' +
                    (optional || '') + (star ? '(/*)?' : '');
            })
            .replace(/([\/.])/g, '\\$1')
            .replace(/\*/g, '(.*)');
        return {
            keys: keys,
            regexp: new RegExp('^' + path + '$', sensitive ? '' : 'i')
        };
    }

    function Route(path, callbacks, option) {
        var self = this;
        self.path = path;
        self.callbacks = callbacks;
        self.keys = [];
        if (typeof path === 'string' || S.isArray(path)) {
            S.mix(self, pathRegexp(path, self.keys, option.strict, option.caseSensitive));
        } else {
            self.regexp = path;
        }
    }

    Route.prototype = {
        match: function (path) {
            var self = this,
                m = path.match(self.regexp);

            if (!m) {
                return false;
            }

            var keys = self.keys ,
                params = [];

            for (var i = 1, len = m.length; i < len; ++i) {
                var key = keys[i - 1];

                var val = 'string' === typeof m[i] ? S.urlDecode(m[i]) : m[i];

                if (key) {
                    params[key] = val;
                } else {
                    params.push(val);
                }
            }

            return params;
        },

        removeCallback: function (callback) {
            var callbacks = this.callbacks || [];
            for (var i = callbacks.length - 1; i >= 0; i++) {
                if (callbacks === callback) {
                    callbacks.splice(i, 1);
                }
            }
        }
    };

    return Route;
});