/**
 * Router data structure
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S) {
    var grammar = /(:([\w\d]+\??))|(\\\*([\w\d]+))/g;

    /*
     transform route declaration to router reg
     @param str
     /search/:q
     /user/*path
     */
    function pathRegexp(path) {
        var keys = [];

        // escape keyword from regexp
        path = S.escapeRegExp(path);

        path = path.replace(grammar, function (m, g1, g2, g3, g4) {
            var key = {};
            if (g2 && S.endsWith(g2, '?')) {
                key.optional = true;
                g2 = g2.slice(0, -1);
            }
            key.name = g2 || g4;
            keys.push(key);
            // :name
            if (g2) {
                return '([^/]+)';
            }
            // *name
            else if (g4) {
                return '(.*)';
            }
            return undefined;
        });

        return {
            keys: keys,
            regexp: new RegExp('^' + path + '$')
        };
    }

    function Route(path, callbacks) {
        this.path = path;
        this.callbacks = callbacks;
        if (typeof path === 'string') {
            S.mix(this, pathRegexp(path));
        } else {
            this.regexp = path;
        }
    }

    Route.prototype = {
        match: function (path) {
            var self = this,
                m = path.match(self.regexp);

            if (!m) {
                return false;
            }

            var keys = self.keys || [] ,
                params = [];

            for (var i = 1, len = m.length; i < len; ++i) {
                var key = keys[i - 1];

                var val = 'string' === typeof m[i] ? S.urlDecode(m[i]) : m[i];

                if (key) {
                    params[key.name] = val;
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