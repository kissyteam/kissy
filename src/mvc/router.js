KISSY.add('mvc/router', function(S, Event) {
    var queryReg = /\?(.*)/;
    var escapeRegExp = /[-[\]{}()+?.,\\^$|#\s]/g;
    var grammar = /(:([\w\d]+))|(\*([\w\d]+))/g;
    var hashPrefix = /^#/;
    var loc = location;

    function getQuery(path) {
        var m,
            ret = {};
        if (m = path.match(queryReg)) {
            var queryStr = m[1];
            return S.unparam(queryStr);
        }
        return ret;
    }


    function matchRoute(self, path, routeRegs) {
        var fullPath = path;
        path = fullPath.replace(queryReg, "");
        S.each(routeRegs, function(desc) {
            var reg = desc.reg,
                paramNames = desc.paramNames,
                m,
                name = desc.name,
                callback = desc.callback;
            if (m = path.match(reg)) {
                m.shift();
                var params = {};
                S.each(m, function(sm, i) {
                    params[paramNames[i]] = sm;
                });
                var query = getQuery(fullPath);
                m.push(query);
                callback.apply(self, m);
                this.fire(name, {
                    params:params,
                    query:query
                });
                return false;
            }
        });
    }

    /**
     * transform route declaration to router reg
     * @param str
     *         /search/:q
     *         /user/*
     */
    function transformRouterReg(str, callback) {
        var name = str,
            paramNames = [];
        // escape keyword from regexp
        str = str.replace(escapeRegExp, function(m) {
            return "\\" + m;
        });
        str.replace(grammar, function(m, g1, g2, g3, g4) {
            // :name
            if (g2) {
                return "([^/]+)";
            } else if (g4) {
                return "(.*)";
            }
            paramNames.push(g2 || g4);
        });
        return {
            name:name,
            paramNames:paramNames,
            reg:new RegExp("^" + str + "$"),
            callback:callback
        }
    }

    function normFn(self, callback) {
        if (S.isFunction(callback)) {
            return callback;
        } else {
            return self[callback];
        }
    }

    function Router(routes) {
        this.__routerMap = {};
        if (this['routes']) {
            this.addRoutes(this['routes']);
        }
        if (routes) {
            this.addRoutes(routes);
        }
    }

    function hashChange() {
        matchRoute(this, loc.hash.replace(hashPrefix, ""), this.__routerMap);
    }


    S.augment(Router, Event.Target, {
        /**
         *
         * @param routes
         *         {
         *           "/search/:param":"callback"
         *         }
         */
        addRoutes:function(routes) {
            var self;
            S.each(routes, function(callback, name) {
                self.__routerMap[name] = transformRouterReg(name, normFn(self, callback));
            });
        },

        navigate:function(path) {
            loc.hash = path;
        },

        start:function() {
            Event.on(window, "hashchange", hashChange, this);
        }
    });

}, {
    requires:['event']
});