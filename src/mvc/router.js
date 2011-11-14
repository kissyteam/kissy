/**
 * simple router to get path parameter and query parameter from hash(old ie) or url(html5)
 * @author yiminghe@gmail.com
 */
KISSY.add('mvc/router', function(S, Event, Base) {
    var queryReg = /\?(.*)/,
        each = S.each,
        // take a breath to avoid duplicate hashchange
        BREATH_INTERVAL = 100,
        grammar = /(:([\w\d]+))|(\\\*([\w\d]+))/g,
        // all registered route instance
        allRoutes = [],
        win = window,
        location = win.location,
        history = win.history ,
        supportNativeHistory = !!(history && history['pushState']),
        __routerMap = "__routerMap";

    function findFirstCaptureGroupIndex(regStr) {
        var r,i;
        for (i = 0;
             i < regStr.length;
             i++) {
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
        // 不能 location.hash
        // http://xx.com/#yy?z=1
        // ie6 => location.hash = #yy
        // 其他浏览器 => location.hash = #yy?z=1
        return location.href.replace(/^[^#]*#?!?(.*)$/, '$1');
    }

    /**
     * get url fragment and dispatch
     */
    function getFragment() {
        if (Router.nativeHistory && supportNativeHistory) {
            return location.pathname.substr(Router.urlRoot.length) + location.search;
        } else {
            return getHash();
        }
    }

    /**
     * slash ------------- start
     */

    /**
     * whether string end with slash
     * @param str
     */
    function endWithSlash(str) {
        return S.endsWith(str, "/");
    }

    function startWithSlash(str) {
        return S.startsWith(str, "/");
    }

    function removeEndSlash(str) {
        if (endWithSlash(str)) {
            str = str.substring(0, str.length - 1);
        }
        return str;
    }

    function removeStartSlash(str) {
        if (startWithSlash(str)) {
            str = str.substring(1);
        }
        return str;
    }

    function addEndSlash(str) {
        return removeEndSlash(str) + "/";
    }

    function addStartSlash(str) {
        return "/" + removeStartSlash(str);
    }

    function equalsIgnoreSlash(str1, str2) {
        str1 = removeEndSlash(str1);
        str2 = removeEndSlash(str2);
        return str1 == str2;
    }

    /**
     * slash ------------------  end
     */

    /**
     * get full path from fragment for html history
     * @param fragment
     */
    function getFullPath(fragment) {
        return location.protocol + "//" + location.host +
            removeEndSlash(Router.urlRoot) + addStartSlash(fragment)
    }

    /**
     * get query object from query string
     * @param path
     */
    function getQuery(path) {
        var m,
            ret = {};
        if (m = path.match(queryReg)) {
            return S.unparam(m[1]);
        }
        return ret;
    }

    /**
     * match url with route intelligently (always get optimal result)
     */
    function dispatch() {
        var path = getFragment(),
            fullPath = path,
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
        each(allRoutes, function(route) {
            var routeRegs = route[__routerMap],
                // match exactly
                exactlyMatch = 0;
            each(routeRegs, function(desc) {
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
                            each(m, function(sm, i) {
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

    /**
     * normalize function by self
     * @param self
     * @param callback
     */
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
            each(routes, function(callback, name) {
                self[__routerMap][name] = transformRouterReg(name, normFn(self, callback));
            });
        }
    }, {
        navigate:function(path, opts) {
            if (getFragment() !== path) {
                if (Router.nativeHistory && supportNativeHistory) {
                    history['pushState']({}, "", getFullPath(path));
                    // pushState does not fire popstate event (unlike hashchange)
                    // so popstate is not statechange
                    // fire manually
                    dispatch();
                } else {
                    location.hash = "!" + path;
                }
            } else if (opts && opts.triggerRoute) {
                dispatch();
            }
        },
        start:function(opts) {
            opts = opts || {};

            opts.urlRoot = opts.urlRoot || "";

            var urlRoot,
                nativeHistory = opts.nativeHistory,
                locPath = location.pathname,
                hash = getFragment(),
                hashIsValid = location.hash.match(/#!.+/);

            urlRoot = Router.urlRoot = opts.urlRoot;
            Router.nativeHistory = nativeHistory;

            if (nativeHistory) {

                if (supportNativeHistory) {
                    // http://x.com/#!/x/y
                    // =>
                    // http://x.com/x/y
                    // =>
                    // process without refresh page and add history entry
                    if (hashIsValid) {
                        if (equalsIgnoreSlash(locPath, urlRoot)) {
                            // put hash to path
                            history['replaceState']({}, "", getFullPath(hash));
                            opts.triggerRoute = 1;
                        } else {
                            S.error("location path must be same with urlRoot!");
                        }
                    }
                }
                // http://x.com/x/y
                // =>
                // http://x.com/#!/x/y
                // =>
                // refresh page without add history entry
                else if (!equalsIgnoreSlash(locPath, urlRoot)) {
                    location.replace(addEndSlash(urlRoot) + "#!" + hash);
                    return;
                }

            }

            // prevent hashChange trigger on start
            setTimeout(function() {
                if (nativeHistory && supportNativeHistory) {
                    Event.on(win, 'popstate', dispatch);
                } else {
                    Event.on(win, "hashchange", dispatch);
                    opts.triggerRoute = 1;
                }

                // check initial hash on start
                // in case server does not render initial state correctly
                // when monitor hashchange ,client must be responsible for dispatching and rendering.
                if (opts.triggerRoute) {
                    dispatch();
                }
                opts.success && opts.success();

            }, BREATH_INTERVAL);
        }
    });

    return Router;

}, {
    requires:['event','base']
});

/**
 * refer :
 * http://www.w3.org/TR/html5/history.html
 * http://documentcloud.github.com/backbone/
 **/