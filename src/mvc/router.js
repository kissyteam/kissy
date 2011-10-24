/**
 * simple hash router to get path parameter and query parameter
 * @author yiminghe@gmail.com
 */
KISSY.add('mvc/router', function(S, Event, Base) {
    var queryReg = /\?(.*)/;
    var escapeRegExp = /[-[\]{}()+?.,\\^$|#\s]/g;
    var grammar = /(:([\w\d]+))|(\*([\w\d]+))/g;
    var hashPrefix = /^#/;
    var loc = location;

    function getQuery(path) {
        var m,
            ret = {};
        if (m = path.match(queryReg)) {
            var queryStr = S.unEscapeHTML(m[1]);
            return S.unparam(queryStr);
        }
        return ret;
    }

    function matchRoute(self, path, routeRegs) {
        var fullPath = path;
        path = fullPath.replace(queryReg, "");
        S.each(routeRegs, function(desc) {
            //debugger
            var reg = desc.reg,
                paramNames = desc.paramNames,
                m,
                name = desc.name,
                callback = desc.callback;
            if (m = path.match(reg)) {
                //debugger
                // match all result item shift out
                m.shift();
                var params = {};
                S.each(m, function(sm, i) {
                    params[paramNames[i]] = sm;
                });
                var query = getQuery(fullPath);
                callback.apply(self, [params,query]);
                self.fire(name, {
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
        str = str.replace(escapeRegExp,
            function(m) {
                return "\\" + m;
            }).replace(grammar, function(m, g1, g2, g3, g4) {
                paramNames.push(g2 || g4);
                // :name
                if (g2) {
                    return "([^/]+)";
                }
                // *name
                else if (g4) {
                    return "(.*)";
                }

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

    function Router() {
        Router.superclass.constructor.apply(this, arguments);
        this.__routerMap = {};
        this.on("afterRoutesChange", this._afterRoutesChange, this);
        this._afterRoutesChange({
            newVal:this.get("routes")
        });
    }


    Router.ATTRS = {
        /**
         * {
         * path:callback
         * }
         */
        routes:{

        }
    };

    function hashChange() {
        matchRoute(this, loc.hash.replace(hashPrefix, ""), this.__routerMap);
    }


    S.extend(Router, Base, {

        _afterRoutesChange:function(e) {
            this.__routerMap = {};
            this.addRoutes(e.newVal);
        },
        /**
         *
         * @param routes
         *         {
         *           "/search/:param":"callback"
         *         }
         */
        addRoutes:function(routes) {
            var self = this;
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

    return Router;

}, {
    requires:['event','base']
});