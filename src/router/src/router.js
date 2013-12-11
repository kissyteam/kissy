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
    var useNativeHistory;
    var urlRoot;
    var win = S.Env.host;
    var history = win.history;
    var supportNativeHashChange = S.Features.isHashChangeSupported();
    var supportNativeHistory = !!(history && history.pushState);
    // take a breath to avoid duplicate hashchange
    var BREATH_INTERVAL = 100;

    // get url path for router dispatch
    function getUrlForRouter(url) {
        url = url || location.href;
        var uri = new Uri(url);
        if (useNativeHistory && supportNativeHistory) {
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

    function dispatch() {
        var url = getUrlForRouter();
        var uri = new S.Uri(url);
        var query = uri.query.get();
        uri.query.reset();
        // normalize to '/'
        var path = uri.toString() || '/';
        var request = new Request({
            query: query,
            path: path,
            url: url,
            originalUrl: url
        });
        var response = {
            redirect: exports.navigate
        };
        fireMiddleWare(request, response, fireRoutes);
    }

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
     * @member KISSY.MVC.Router
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
            if (useNativeHistory && supportNativeHistory) {
                history[replaceHistory ? 'replaceState' : 'pushState']({}, '', utils.getFullPath(path, urlRoot));
                // pushState does not fire popstate event (unlike hashchange)
                // so popstate is not statechange
                // fire manually
                dispatch();
            } else {
                normalizedPath = '#!' + path;
                if (replaceHistory) {
                    // add history hack for ie67
                    location.replace(normalizedPath + (supportNativeHashChange ? Node.REPLACE_HISTORY : ''));
                } else {
                    location.hash = normalizedPath;
                }
            }
        } else if (opts && opts.triggerRoute) {
            dispatch();
        }
    };

    exports.get = function (path) {
        var callbacks = S.makeArray(arguments).slice(1);
        routes.push(new Route(path, callbacks));
    };

    /**
     * Start router (url monitor).
     * @static
     * @member KISSY.Router
     * @param {Object} opts
     * @param {Function} opts.success Callback function to be called after router is started.
     * @param {String} opts.urlRoot Specify url root for html5 history management.
     * @param {Boolean} opts.useNativeHistory Whether enable html5 history management.
     */
    exports.start = function (opts) {
        opts = opts || {};

        if (started) {
            return opts.success && opts.success.call(exports);
        }

        // remove backslash
        opts.urlRoot = (opts.urlRoot || '').replace(/\/$/, '');
        useNativeHistory = opts.useNativeHistory;
        urlRoot = opts.urlRoot;

        var locPath = location.pathname,
            hash = getUrlForRouter(),
            hashIsValid = location.hash.match(/#!.+/);

        if (useNativeHistory) {
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
            if (useNativeHistory && supportNativeHistory) {
                DomEvent.on(win, 'popstate', dispatch);
                // html5 triggerRoute is leaved to user decision
                // if provide no #! hash
            } else {
                DomEvent.on(win, 'hashchange', dispatch);
                // hash-based browser is forced to trigger route
                opts.triggerRoute = 1;
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
});