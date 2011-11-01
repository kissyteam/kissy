/**
 * simple hash router to get path parameter and query parameter
 * @author yiminghe@gmail.com
 */
KISSY.add('mvc/router', function(S, Event, Base) {
    var queryReg = /\?(.*)/,
        grammar = /(:([\w\d]+))|(\\\*([\w\d]+))/g,
        hashPrefix = /^#(?:!)?/,
        loc = location,
        // all registered route instance
        allRoutes = [],
        __routerMap = "__routerMap";


    function findFirstCaptureGroupIndex(regStr) {
        var r;
        for (var i = 0; i < regStr.length; i++) {
            r = regStr.charAt(i);
            // skip escaped reg meta char
            if (r == "\\") {
                i++;
            } else if (r == "(") {
                return i;
            }
        }
        throw new Error("impossible to not to get capture group in kissy mvc route");
    }

    function getHash() {
        return loc.hash.replace(hashPrefix, "");
    }

    function getQuery(path) {
        var m,
            ret = {};
        if (m = path.match(queryReg)) {
            var queryStr = S.unEscapeHTML(m[1]);
            return S.unparam(queryStr);
        }
        return ret;
    }


    /**
     * match url with route intelligently (always get optimal result)
     */
    function matchRoute(path) {
        var fullPath = path,
            query,
            arg,
            finalRoute = 0,
            finalMatchLength = -1,
            finalRegStr = "",
            finalFirstCaptureGroupIndex = -1,
            finalCallback = 0,
            finalRouteName = "",
            finalParam = 0;

        path = fullPath.replace(queryReg, "");

        // user input : /xx/yy/zz
        S.each(allRoutes, function(route) {
            var routeRegs = route[__routerMap],
                // match exactly
                exactlyMatch = 0;
            S.each(routeRegs, function(desc) {
                    var reg = desc.reg,
                        regStr = desc.regStr,
                        paramNames = desc.paramNames,
                        firstCaptureGroupIndex = -1,
                        m,
                        name = desc.name,
                        callback = desc.callback;
                    if (m = path.match(reg)) {
                        // match all result item shift out
                        m.shift();

                        function genParam() {
                            var params = {};
                            S.each(m, function(sm, i) {
                                params[paramNames[i]] = sm;
                            });
                            return params;
                        }

                        function upToFinal() {
                            finalRegStr = regStr;
                            finalFirstCaptureGroupIndex = firstCaptureGroupIndex;
                            finalCallback = callback;
                            finalParam = genParam();
                            finalRoute = route;
                            finalRouteName = name;
                            finalMatchLength = m.length;
                        }

                        // route: /xx/yy/zz
                        if (!m.length) {

                            upToFinal();
                            exactlyMatch = 1;
                            return false;

                        } else {

                            firstCaptureGroupIndex = findFirstCaptureGroupIndex(regStr);

                            // final route : /*
                            // now route : /xx/*
                            if (firstCaptureGroupIndex > finalFirstCaptureGroupIndex) {
                                upToFinal();
                            }

                            // final route : /xx/:id/:id
                            // now route :  /xx/:id/zz
                            else if (
                                firstCaptureGroupIndex == finalFirstCaptureGroupIndex &&
                                    finalMatchLength >= m.length
                                ) {
                                if (m.length < finalMatchLength) {
                                    upToFinal()
                                } else if (regStr.length > finalRegStr.length) {
                                    upToFinal();
                                }
                            }

                            // first route has priority
                            else if (!finalRoute) {
                                upToFinal();
                            }
                        }

                    }
                }
            );

            if (exactlyMatch) {
                return false;
            }
        });


        if (finalParam) {
            query = getQuery(fullPath);
            finalCallback.apply(finalRoute, [finalParam,query]);
            arg = {
                name:name,
                paths:finalParam,
                query:query
            };
            finalRoute.fire('route:' + name, arg);
            finalRoute.fire('route', arg);
        }
    }

    /**
     * transform route declaration to router reg
     * @param str
     *         /search/:q
     *         /user/*path
     */
    function transformRouterReg(str, callback) {
        var name = str,
            paramNames = [];
        // escape keyword from regexp
        str = S.escapeRegExp(str);

        str = str.replace(grammar, function(m, g1, g2, g3, g4) {
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
            regStr:str,
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

    function _afterRoutesChange(e) {
        var self = this;
        self[__routerMap] = {};
        self.addRoutes(e.newVal);
    }

    function Router() {
        var self = this;
        Router.superclass.constructor.apply(self, arguments);
        self.on("afterRoutesChange", _afterRoutesChange, self);
        _afterRoutesChange.call(self, {newVal:self.get("routes")});
        allRoutes.push(self);
    }

    Router.ATTRS = {
        /**
         * @example
         *   {
         *     path:callback
         *   }
         */
        routes:{}
    };

    function hashChange() {
        matchRoute(getHash());
    }

    S.extend(Router, Base, {
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
                self[__routerMap][name] = transformRouterReg(name, normFn(self, callback));
            });
        }
    }, {
        navigate:function(path, opts) {
            loc.hash = "!" + path;
            opts = opts || {};
            if (opts.triggerRoute && getHash() == path) {
                hashChange();
            }
        },
        start:function(opts) {
            opts = opts || {};
            // prevent hashChange trigger on start
            setTimeout(function() {
                Event.on(window, "hashchange", hashChange);
                // check initial hash on start
                // in case server does not render initial state correctly
                if (opts.triggerRoute) {
                    hashChange();
                }
                opts.success && opts.success();
            }, 100);
        }
    });

    return Router;

}, {
    requires:['event','base']
});