/**
 * @ignore
 * simple router to get path parameter and query parameter from hash(old ie) or url(html5)
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Attribute = require('attribute');
    var Node = require('node');
    var each = S.each,
    // take a breath to avoid duplicate hashchange
        BREATH_INTERVAL = 100,
        grammar = /(:([\w\d]+))|(\\\*([\w\d]+))/g,
    // all registered route instance
        allRoutes = [],
        win = S.Env.host,
        $ = Node.all,
        $win = $(win),
        ie = S.UA.ieMode,
        history = win.history ,
        supportNativeHistory = !!(history && history.pushState),
        ROUTER_MAP = '__routerMap';

    function findFirstCaptureGroupIndex(regStr) {
        var r, i;
        for (i = 0; i < regStr.length; i++) {
            r = regStr.charAt(i);
            // skip escaped reg meta char
            if (r === '\\') {
                i++;
            } else if (r === '(') {
                return i;
            }
        }
        throw new Error('impossible to not to get capture group in kissy mvc route');
    }

    function getHash(url) {
        // 不能 location.hash
        // 1.
        // http://xx.com/#yy?z=1
        // ie6 => location.hash = #yy
        // 其他浏览器 => location.hash = #yy?z=1
        // 2.
        // #!/home/q={%22thedate%22:%2220121010~20121010%22}
        // firefox 15 => #!/home/q={"thedate":"20121010~20121010"}
        // !! :(
        return new S.Uri(url).getFragment().replace(/^!/, '');
    }


    // get url fragment and dispatch
    function getFragment(url) {
        url = url || location.href;
        if (Router.nativeHistory && supportNativeHistory) {
            url = new S.Uri(url);
            var query = url.getQuery().toString();
            return url.getPath().substr(Router.urlRoot.length) + (query ? ('?' + query) : '');
        } else {
            return getHash(url);
        }
    }

    function endWithSlash(str) {
        return S.endsWith(str, '/');
    }

    function startWithSlash(str) {
        return S.startsWith(str, '/');
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
        return removeEndSlash(str) + '/';
    }

    function addStartSlash(str) {
        if (str) {
            return '/' + removeStartSlash(str);
        } else {
            return str;
        }
    }

    function equalsIgnoreSlash(str1, str2) {
        str1 = removeEndSlash(str1);
        str2 = removeEndSlash(str2);
        return str1 === str2;
    }


    // get full path from fragment for html history
    function getFullPath(fragment) {
        return location.protocol + '//' + location.host +
            removeEndSlash(Router.urlRoot) + addStartSlash(fragment);
    }


    // match url with route intelligently (always get optimal result)
    function dispatch() {
        var query,
            path,
            arg,
            finalRoute = 0,
            finalMatchLength = -1,
            finalRegStr = '',
            finalFirstCaptureGroupIndex = -1,
            finalCallback = 0,
            finalRouteName = '',
            pathUri = new S.Uri(getFragment()),
            finalParam = 0;

        path = pathUri.clone();
        path.query.reset();
        path = path.toString();

        // user input : /xx/yy/zz
        each(allRoutes, function (route) {
            var routeRegs = route[ROUTER_MAP],
            // match exactly
                exactlyMatch = 0;
            each(routeRegs, function (desc) {
                    var reg = desc.reg,
                        regStr = desc.regStr,
                        paramNames = desc.paramNames,
                        firstCaptureGroupIndex = -1,
                        m,
                        name = desc.name,
                        callback = desc.callback;
                    if ((m = path.match(reg))) {
                        // match all result item shift out
                        m.shift();

                        var genParam = function () {
                            if (paramNames) {
                                var params = {};
                                each(m, function (sm, i) {
                                    params[paramNames[i]] = sm;
                                });
                                return params;
                            } else {
                                // if user gave directly reg
                                // then call callback with match result array
                                return [].concat(m);
                            }
                        };

                        var upToFinal = function () {
                            finalRegStr = regStr;
                            finalFirstCaptureGroupIndex = firstCaptureGroupIndex;
                            finalCallback = callback;
                            finalParam = genParam();
                            finalRoute = route;
                            finalRouteName = name;
                            finalMatchLength = m.length;
                        };

                        // route: /xx/yy/zz
                        if (!m.length) {
                            upToFinal();
                            exactlyMatch = 1;
                            return false;
                        }
                        else if (regStr) {

                            firstCaptureGroupIndex = findFirstCaptureGroupIndex(regStr);

                            // final route : /*
                            // now route : /xx/*
                            if (firstCaptureGroupIndex > finalFirstCaptureGroupIndex) {
                                upToFinal();
                            }

                            else if (
                                firstCaptureGroupIndex === finalFirstCaptureGroupIndex &&
                                    finalMatchLength >= m.length
                                ) {
                                // final route : /xx/:id/:id
                                // now route :  /xx/:id/zz
                                if (m.length < finalMatchLength) {
                                    upToFinal();
                                } else if (regStr.length > finalRegStr.length) {
                                    upToFinal();
                                }
                            }

                            // first route has priority
                            else if (!finalRoute) {
                                upToFinal();
                            }
                        }
                        // if exists user-given reg router rule then update value directly
                        // first route has priority
                        // 用户设置的正则表达式具备高优先级
                        else {
                            upToFinal();
                            exactlyMatch = 1;
                            return false;
                        }
                    }
                    return undefined;
                }
            );

            if (exactlyMatch) {
                return false;
            }
            return undefined;
        });


        if (finalParam) {
            query = pathUri.query.get();
            finalCallback.apply(finalRoute, [finalParam, query, {
                path: path,
                url: location.href
            }]);
            arg = {
                name: finalRouteName,
                'paths': finalParam,
                path: path,
                url: location.href,
                query: query
            };
            finalRoute.fire('route:' + finalRouteName, arg);
            finalRoute.fire('route', arg);
        }
    }

    /*
     transform route declaration to router reg
     @param str
     /search/:q
     /user/*path
     */
    function transformRouterReg(self, str, callback) {
        var name = str,
            paramNames = [];

        if (typeof callback === 'function') {
            // escape keyword from regexp
            str = S.escapeRegExp(str);

            str = str.replace(grammar, function (m, g1, g2, g3, g4) {
                paramNames.push(g2 || g4);
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
                name: name,
                paramNames: paramNames,
                reg: new RegExp('^' + str + '$'),
                regStr: str,
                callback: callback
            };
        } else {
            return {
                name: name,
                reg: callback.reg,
                callback: normFn(self, callback.callback)
            };
        }
    }


    // normalize function by self
    function normFn(self, callback) {
        if (typeof callback === 'function') {
            return callback;
        } else if (typeof callback === 'string') {
            return self[callback];
        }
        return callback;
    }

    function _afterRoutesChange(e) {
        var self = this;
        self[ROUTER_MAP] = {};
        self.addRoutes(e.newVal);
    }

    var Router;

    /**
     * Router used to route url to responding action callbacks.
     * @class KISSY.MVC.Router
     * @extends KISSY.Attribute
     */
    Router = Attribute.extend({
        constructor: function () {
            var self = this;
            self.callSuper.apply(self, arguments);
            self.on('afterRoutesChange', _afterRoutesChange, self);
            _afterRoutesChange.call(self, {newVal: self.get('routes')});
            allRoutes.push(self);
        },
        /**
         * Add config to current router.
         * @param {Object} routes Route config.
         *
         *
         *      {
         *          '/search/:param':'callback'
         *          // or
         *          'search':{
         *              reg:/xx/,
         *              callback:fn
         *          }
         *      }
         */
        addRoutes: function (routes) {
            var self = this;
            each(routes, function (callback, name) {
                self[ROUTER_MAP][name] = transformRouterReg(self, name, normFn(self, callback));
            });
        }
    }, {
        ATTRS: {

            /**
             * Route and action config.
             * @cfg {Object} routes
             *
             *
             *     {
             *       '/search/:param':'callback'
             *       // or
             *       'search':{
             *         reg:/xx/,
             *         callback:fn
             *       }
             *     }
             */
            /**
             * @ignore
             */
            routes: {}
        },

        /**
         * whether Router can process path
         * @param {String} path path for route
         * @return {Boolean}
         * @static
         * @member KISSY.MVC.Router
         */
        hasRoute: function (path) {
            var match = 0;
            // user input : /xx/yy/zz
            each(allRoutes, function (route) {
                var routeRegs = route[ROUTER_MAP];
                each(routeRegs, function (desc) {
                    var reg = desc.reg;
                    if (path.match(reg)) {
                        match = 1;
                        return false;
                    }
                    return undefined;
                });
                if (match) {
                    return false;
                }
                return undefined;
            });
            return !!match;
        },

        /**
         * get the route path
         * @param {String} url full location href
         * @return {String} route path
         * @static
         * @member KISSY.MVC.Router
         */
        removeRoot: function (url) {
            var u = new S.Uri(url);
            return u.getPath().substr(Router.urlRoot.length);
        },

        /**
         * Navigate to specified path.
         * @static
         * @member KISSY.MVC.Router
         * @param {String} path Destination path.
         * @param {Object} [opts] Config for current navigation.
         * @param {Boolean} opts.triggerRoute Whether to trigger responding action
         *                  even current path is same as parameter
         */
        navigate: function (path, opts) {
            opts = opts || {};
            var replaceHistory = opts.replaceHistory, normalizedPath;
            if (getFragment() !== path) {
                if (Router.nativeHistory && supportNativeHistory) {
                    history[replaceHistory ? 'replaceState' : 'pushState']({},
                        '', getFullPath(path));
                    // pushState does not fire popstate event (unlike hashchange)
                    // so popstate is not statechange
                    // fire manually
                    dispatch();
                } else {
                    normalizedPath = '#!' + path;
                    if (replaceHistory) {
                        // add history hack
                        location.replace(normalizedPath +
                            (ie && ie < 8 ? Node.REPLACE_HISTORY : ''));
                    } else {
                        location.hash = normalizedPath;
                    }
                }
            } else if (opts && opts.triggerRoute) {
                dispatch();
            }
        },
        /**
         * Start all routers (url monitor).
         * @static
         * @member KISSY.MVC.Router
         * @param {Object} opts
         * @param {Function} opts.success Callback function to be called after router is started.
         * @param {String} opts.urlRoot Specify url root for html5 history management.
         * @param {Boolean} opts.nativeHistory Whether enable html5 history management.
         */
        start: function (opts) {
            opts = opts || {};

            if (Router.__started) {
                return opts.success && opts.success();
            }

            // remove backslash
            opts.urlRoot = (opts.urlRoot || '').replace(/\/$/, '');

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
                            history.replaceState({}, '', getFullPath(hash));
                            opts.triggerRoute = 1;
                        } else {
                            S.error('location path must be same with urlRoot!');
                        }
                    }
                }
                // http://x.com/x/y
                // =>
                // http://x.com/#!/x/y
                // =>
                // refresh page without add history entry
                else if (!equalsIgnoreSlash(locPath, urlRoot)) {
                    location.replace(addEndSlash(urlRoot) + '#!' + hash);
                    return undefined;
                }

            }

            // prevent hashChange trigger on start
            setTimeout(function () {

                if (nativeHistory && supportNativeHistory) {
                    $win.on('popstate', dispatch);
                    // html5 triggerRoute is leaved to user decision
                    // if provide no #! hash
                } else {
                    $win.on('hashchange', dispatch);
                    // hash-based browser is forced to trigger route
                    opts.triggerRoute = 1;
                }

                // check initial hash on start
                // in case server does not render initial state correctly
                // when monitor hashchange ,client must be responsible for dispatching and rendering.
                if (opts.triggerRoute) {
                    dispatch();
                }
                if(opts.success){
                    opts.success();
                }

            }, BREATH_INTERVAL);

            Router.__started = 1;
            return undefined;
        },

        /**
         * stop all routers
         * @static
         * @member KISSY.MVC.Router
         */
        stop: function () {
            Router.__started = 0;
            $win.detach('popstate', dispatch);
            $win.detach('hashchange', dispatch);
            allRoutes = [];
        }
    });

    return Router;
});

/**
 * @ignore
 * 2011-11-30
 *  - support user-given native regexp for router rule
 *
 * refer :
 * http://www.w3.org/TR/html5/history.html
 * http://documentcloud.github.com/backbone/
 **/