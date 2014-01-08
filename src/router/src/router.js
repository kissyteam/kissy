/**
 * A express-like router
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require, exports) {
    var middlewares = [];
    var routes = [];
    var utils = require('./router/utils');
    var Route = require('./router/route');
    var Uri = require('uri');
    var Request = require('./router/request');
    var DomEvent = require('event/dom');
    var started = false;
    var useHash;
    var urlRoot;
    var win = S.Env.host;
    var history = win.history;
    var supportNativeHashChange = S.Features.isHashChangeSupported();
    var supportNativeHistory = !!(history && history.pushState);
    // take a breath to avoid duplicate hashchange
    var BREATH_INTERVAL = 100;

    // for judging backward or forward
    var uuid = 10;
    var pageIdHistory = [uuid];

    // get url path for router dispatch
    function getUrlForRouter(url) {
        url = url || location.href;
        var uri = new Uri(url);
        if (!useHash && supportNativeHistory) {
            var query = uri.query;
            return uri.getPath().substr(urlRoot.length) + (query.has() ? ('?' + query.toString()) : '');
        } else {
            return utils.getHash(uri);
        }
    }

    function fireMiddleWare(request, response, cb) {
        var index = -1;
        var len = middlewares.length;

        function next() {
            index++;
            if (index === len) {
                cb(request, response);
            } else {
                var middleware = middlewares[index];
                if (S.startsWith(request.path + '/', middleware[0] + '/')) {
                    var prefixLen = middleware[0].length;
                    request.url = request.url.slice(prefixLen);
                    var path = request.path;
                    request.path = request.path.slice(prefixLen);
                    middleware[1](request, next);
                    request.url = request.originalUrl;
                    request.path = path;
                } else {
                    next();
                }
            }
        }

        next();
    }

    function fireRoutes(request, response) {
        var index = -1;
        var len = routes.length;

        function next() {
            index++;
            if (index !== len) {
                var route = routes[index];
                if ((request.params = route.match(request.path))) {
                    var callbackIndex = -1;
                    var callbacks = route.callbacks;
                    var callbacksLen = callbacks.length;
                    var nextCallback = function (cause) {
                        if (cause === 'route') {
                            nextCallback = null;
                            next();
                        } else {
                            callbackIndex++;
                            if (callbackIndex !== callbacksLen) {
                                request.route = route;
                                callbacks[callbackIndex](request, response, nextCallback);
                            }
                        }
                    };
                    nextCallback('');
                } else {
                    next();
                }
            }
        }

        next();
    }

    function dispatch(backward) {
        var url = getUrlForRouter();
        var uri = new S.Uri(url);
        var query = uri.query.get();
        uri.query.reset();
        // normalize to '/'
        var path = uri.toString() || '/';
        var request = new Request({
            query: query,
            backward: backward,
            path: path,
            url: url,
            originalUrl: url
        });
        var response = {
            redirect: exports.navigate
        };
        fireMiddleWare(request, response, fireRoutes);
    }

    /**
     * Router using hash or html5 history
     * @class KISSY.Router
     * @singleton
     */


    /**
     * config middleware for router
     * @param {String} prefix config prefix to decide which path is processed
     * @param {Function} callback middleware logic function
     */
    exports.use = function (prefix, callback) {
        if (typeof prefix !== 'string') {
            callback = prefix;
            prefix = '';
        }
        middlewares.push([prefix, callback]);
    };

    /**
     * Navigate to specified path.
     * @static
     * @member KISSY.Router
     * @param {String} path Destination path.
     * @param {Object} [opts] Config for current navigation.
     * @param {Boolean} opts.triggerRoute Whether to trigger responding action
     *                  even current path is same as parameter
     */
    exports.navigate = function (path, opts) {
        opts = opts || {};
        var replaceHistory = opts.replaceHistory,
            normalizedPath;
        if (getUrlForRouter() !== path) {
            if (!replaceHistory) {
                uuid++;
                pageIdHistory.push(uuid);
            }
            //S.log('current: ' + pageIdHistory);
            if (!useHash && supportNativeHistory) {
                history[replaceHistory ? 'replaceState' : 'pushState']({
                    pageDepth: uuid
                }, '', utils.getFullPath(path, urlRoot));
                // pushState does not fire popstate event (unlike hashchange)
                // so popstate is not statechange
                // fire manually
                dispatch();
            } else {
                normalizedPath = '#!' + path;
                if (replaceHistory) {
                    if (supportNativeHistory) {
                        history.replaceState({
                            pageDepth: uuid
                        }, '', normalizedPath);
                        dispatch();
                    } else {
                        // add history hack for ie67
                        location.replace(normalizedPath + (supportNativeHashChange ? '' : DomEvent.REPLACE_HISTORY));
                    }
                } else {
                    if (supportNativeHistory) {
                        history.pushState({
                            pageDepth: uuid
                        }, '', normalizedPath);
                        dispatch();
                    } else {
                        location.hash = normalizedPath;
                    }
                }
            }
        } else if (opts && opts.triggerRoute) {
            dispatch();
        }
    };

    /**
     * add route and its callbacks
     * @param {String|RegExp} routePath route string or regexp
     */
    exports.get = function (routePath) {
        var callbacks = S.makeArray(arguments).slice(1);
        routes.push(new Route(routePath, callbacks));
    };

    /**
     * whether url path match config routes
     * @param {String} path url path
     * @returns {Boolean}
     */
    exports.matchRoute = function (path) {
        for (var i = 0, l = routes.length; i < l; i++) {
            if (routes[i].match(path)) {
                return routes[i];
            }
        }
        return false;
    };

    /**
     * remove specified route
     * @param {String|RegExp} routePath route string or regexp
     * @param {Function} [callback] router callback
     */
    exports.removeRoute = function (routePath, callback) {
        for (var i = routes.length - 1; i >= 0; i--) {
            var r = routes[i];
            if (r.path === routePath) {
                if (callback) {
                    r.removeCallback(callback);
                    if (!r.callbacks.length) {
                        routes.splice(i, 1);
                    }
                } else {
                    routes.splice(i, 1);
                }
            }
        }
    };

    // private
    exports.clearRoutes = function () {
        middlewares = [];
        routes = [];
    };

    /**
     * whether has specified route
     * @param {String|RegExp} routePath route string or regexp
     * @returns {Boolean}
     */
    exports.hasRoute = function (routePath) {
        for (var i = 0, l = routes.length; i < l; i++) {
            if (routes[i].path === routePath) {
                return routes[i];
            }
        }
        return false;
    };

    function onPopState(e) {
        // page to be rendered
        var state = e.originalEvent.state;
        var backward = false;

        if (state.pageDepth === pageIdHistory[pageIdHistory.length - 2]) {
            backward = true;
            pageIdHistory.pop();
        } else {
            pageIdHistory.push(state.pageDepth);
        }

        //S.log('backward: ' + backward);
        //S.log(pageIdHistory);
        dispatch(backward);
    }

    /**
     * Start router (url monitor).
     * @static
     * @member KISSY.Router
     * @param {Object} [opts]
     * @param {Function} [opts.success] Callback function to be called after router is started.
     * @param {String} [opts.urlRoot] Specify url root for html5 history management.
     * @param {Boolean} [opts.useHash=true] Whether to use hash url for navigation.
     * false is only invalid for html history supported browsers
     */
    exports.start = function (opts) {
        opts = opts || {};

        if (started) {
            return opts.success && opts.success.call(exports);
        }

        // remove backslash
        opts.urlRoot = (opts.urlRoot || '').replace(/\/$/, '');
        useHash = opts.useHash;
        urlRoot = opts.urlRoot;

        if (useHash === undefined) {
            useHash = true;
        }

        var locPath = location.pathname,
            hash = getUrlForRouter(),
            hashIsValid = location.hash.match(/#!.+/);

        if (!useHash) {
            if (supportNativeHistory) {
                // http://x.com/#!/x/y
                // =>
                // http://x.com/x/y
                // =>
                // process without refresh page and add history entry
                if (hashIsValid) {
                    if (utils.equalsIgnoreSlash(locPath, urlRoot)) {
                        // put hash to path
                        history.replaceState({}, '', utils.getFullPath(hash, urlRoot));
                        opts.triggerRoute = 1;
                    } else {
                        S.error('router: location path must be same with urlRoot!');
                    }
                }
            }
            // http://x.com/x/y
            // =>
            // http://x.com/#!/x/y
            // =>
            // refresh page without add history entry
            else if (!utils.equalsIgnoreSlash(locPath, urlRoot)) {
                location.replace(utils.addEndSlash(urlRoot) + '#!' + hash);
                return undefined;
            }
        }

        // prevent hashChange trigger on start
        setTimeout(function () {
            var needReplaceHistory = supportNativeHistory;
            if (supportNativeHistory) {
                DomEvent.on(win, 'popstate', onPopState);
                // html5 triggerRoute is leaved to user decision
                // if provide no #! hash
            } else {
                DomEvent.on(win, 'hashchange', dispatch);
                // hash-based browser is forced to trigger route
                opts.triggerRoute = 1;
            }
            if (useHash) {
                if (!getUrlForRouter()) {
                    exports.navigate('/', {
                        replaceHistory: 1
                    });
                    opts.triggerRoute = 0;
                    needReplaceHistory = false;
                }
            }
            if (needReplaceHistory) {
                // fill in first state
                history.replaceState({
                    pageDepth: uuid
                }, '', location.href);
            }
            // check initial hash on start
            // in case server does not render initial state correctly
            // when monitor hashchange ,client must be responsible for dispatching and rendering.
            if (opts.triggerRoute) {
                dispatch();
            }
            if (opts.success) {
                opts.success();
            }
        }, BREATH_INTERVAL);

        started = true;
        return exports;
    };

    // private
    exports.stop = function () {
        started = false;
        DomEvent.detach(win, 'hashchange', dispatch);
        DomEvent.detach(win, 'popstate', onPopState);
    };
});