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
    var CustomEvent = require('event/custom');
    var started = false;
    var useHash;
    var urlRoot;
    var getVidFromUrlWithHash = utils.getVidFromUrlWithHash;
    var win = S.Env.host;
    var history = win.history;
    var supportNativeHashChange = S.Feature.isHashChangeSupported();
    var supportNativeHistory = !!(history && history.pushState);
    // take a breath to avoid duplicate hashchange
    var BREATH_INTERVAL = 100;

    // for judging backward or forward
    var viewUniqueId = 10;
    var viewsHistory = [viewUniqueId];

    function setPathByHash(path, replace) {
        var hash = utils.addVid('#!' + path +
            // add history hack for ie67
            (supportNativeHashChange ? '' : DomEvent.REPLACE_HISTORY),
            viewUniqueId);
        if (replace) {
            location.replace(hash);
        } else {
            location.hash = hash;
        }
    }

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

    function dispatch(backward, replace) {
        var url = getUrlForRouter();
        var uri = new S.Uri(url);
        var query = uri.query.get();
        uri.query.reset();
        // normalize to '/'
        var path = uri.toString() || '/';
        var request = new Request({
            query: query,
            // backward or forward
            backward: backward === true,
            // replace history
            replace: replace === true,
            forward: (backward === false && replace === false),
            path: path,
            url: url,
            originalUrl: url
        });
        var response = {
            redirect: exports.navigate
        };
        exports.fire('dispatch', {
            request: request,
            response: response
        });
        fireMiddleWare(request, response, fireRoutes);
    }

    /**
     * Router using hash or html5 history
     * @class KISSY.Router
     * @singleton
     */

    S.mix(exports, CustomEvent.Target);

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
        var replace = opts.replace||false;
        if (getUrlForRouter() !== path) {
            if (!replace) {
                viewUniqueId++;
                viewsHistory.push(viewUniqueId);
            }
            //S.log('current: ' + viewsHistory);
            if (!useHash && supportNativeHistory) {
                history[replace ? 'replaceState' : 'pushState']({
                    vid: viewUniqueId
                }, '', utils.getFullPath(path, urlRoot));
                // pushState does not fire popstate event (unlike hashchange)
                // so popstate is not statechange
                // fire manually
                dispatch(false, replace);
            } else {
                if (supportNativeHistory) {
                    history[replace ? 'replaceState' : 'pushState']({
                        vid: viewUniqueId
                    }, '', '#!' + path);
                    dispatch(false, replace);
                } else {
                    setPathByHash(path, replace);
                }
            }
        } else if (opts && opts.triggerRoute) {
            dispatch(false, true);
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

    function dispatchByVid(vid) {
        var backward = false;
        var replace = false;

        if (vid === viewsHistory[viewsHistory.length - 2]) {
            backward = true;
            viewsHistory.pop();
        } else if (
        //  when hashchange mode already push vid by navigate
            vid !== viewsHistory[viewsHistory.length - 1]) {
            viewsHistory.push(vid);
        } else {
            replace = true;
        }

        dispatch(backward, replace);
    }

    function onPopState(e) {
        // page to be rendered
        var state = e.originalEvent.state;
        // input url directly
        if (!state) {
            return;
        }
        dispatchByVid(state.vid);
    }


    function onHashChange(e) {
        //S.log('onHashChange');
        // no view id, just return
        var newURL = e.newURL || location.href;
        var vid = getVidFromUrlWithHash(newURL);
        if (!vid) {
            return;
        }
        dispatchByVid(vid);
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

        // for test!
        // http://caniuse.com/#search=pushState
        if (opts.useHashChange) {
            supportNativeHistory = false;
        }

        var locPath = location.pathname,
            href = location.href,
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
            } else {
                useHash = true;
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
                DomEvent.on(win, 'hashchange', onHashChange);
                // hash-based browser is forced to trigger route
                opts.triggerRoute = 1;
            }
            if (useHash) {
                if (!getUrlForRouter()) {
                    exports.navigate('/', {
                        replace: 1
                    });
                    opts.triggerRoute = 0;
                    needReplaceHistory = false;
                } else if (!supportNativeHistory && getVidFromUrlWithHash(href) !== viewUniqueId) {
                    setPathByHash(utils.getHash(new S.Uri(href)), true);
                    opts.triggerRoute = 0;
                } else if (supportNativeHistory && utils.hasVid(href)) {
                    location.replace(href = utils.removeVid(href));
                }
            }
            if (needReplaceHistory) {
                // fill in first state
                history.replaceState({
                    vid: viewUniqueId
                }, '', href);
            }
            // check initial hash on start
            // in case server does not render initial state correctly
            // when monitor hashchange ,client must be responsible for dispatching and rendering.
            if (opts.triggerRoute) {
                dispatch(false, true);
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
        DomEvent.detach(win, 'hashchange', onHashChange);
        DomEvent.detach(win, 'popstate', onPopState);
    };
});