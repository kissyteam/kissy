/*
Copyright 2012, KISSY UI Library v1.30
MIT Licensed
build time: Dec 20 22:27
*/
/**
 * @fileOverview collection of models
 * @author yiminghe@gmail.com
 */
KISSY.add("mvc/collection", function (S, Event, Model, Base) {

    function findModelIndex(mods, mod, comparator) {
        var i = mods.length;
        if (comparator) {
            var k = comparator(mod);
            for (i = 0; i < mods.length; i++) {
                var k2 = comparator(mods[i]);
                if (k < k2) {
                    break;
                }
            }
        }
        return i;
    }

    /**
     * @name Collection
     * @class
     * Collection. A list of model.
     * @memberOf MVC
     * @extends KISSY.Base
     */
    function Collection() {
        Collection.superclass.constructor.apply(this, arguments);
    }

    Collection.ATTRS =
    /**
     * @lends MVC.Collection#
     */
    {
        /**
         * Model constructor with in current collection.
         * @type {MVC.Model}
         */
        model:{
            value:Model
        },
        /**
         * Model list.
         * @type {MVC.Model[]}
         */
        models:{
            /*
             normalize model list
             @param models
             */
            setter:function (models) {
                var prev = this.get("models");
                this.remove(prev, {silent:1});
                this.add(models, {silent:1});
                return this.get("models");
            },
            value:[]
        },
        /**
         * Get url for sending data to server.
         * @type {String|Function}
         */
        url:{
            value:""
        },
        /**
         * Comparator function for index getter when adding model.
         * default to append to last of current model list.
         * @type {Function}
         */
        comparator:{},
        /**
         * Sync function to sync data with server.
         * Default to call {@link MVC.sync}
         * @type {Function}
         */
        sync:{
            value:function () {
                S.require("mvc").sync.apply(this, arguments);
            }
        },
        /**
         * Get structured data from raw data returned from server.
         * default to return raw data from server.
         * @type {Function}
         */
        parse:{
            value:function (resp) {
                return resp;
            }
        }
    };

    S.extend(Collection, Base,
        /**
         * @lends MVC.Collection#
         */
        {
            /**
             * Sort model list according {@link MVC.Collection#comparator}.
             */
            sort:function () {
                var comparator = this.get("comparator");
                if (comparator) {
                    this.get("models").sort(function (a, b) {
                        return comparator(a) - comparator(b);
                    });
                }
            },

            /**
             * Get json representation of this collection.
             * @return Object[]
             */
            toJSON:function () {
                return S.map(this.get("models"), function (m) {
                    return m.toJSON();
                });
            },

            /**
             * Add a model to current collection.
             * @param {Object|MVC.Model} model Model or json data to be added.
             * @param {Object} [opts] Add config
             * @param {Function} opts.silent Whether to fire add event.
             */
            add:function (model, opts) {
                var self = this,
                    ret = true;
                if (S.isArray(model)) {
                    var orig = [].concat(model);
                    S.each(orig, function (m) {
                        var t = self._add(m, opts);
                        ret = ret && t;
                    });
                } else {
                    ret = self._add(model, opts);
                }
                return ret;
            },

            /**
             * Remove an existing model from current collection.
             * @param {MVC.Model} model Model to be removed.
             * @param {Object} [opts] Remove config.
             * @param {Function} opts.silent Whether to fire remove event.
             */
            remove:function (model, opts) {
                var self = this;
                if (S.isArray(model)) {
                    var orig = [].concat(model);
                    S.each(orig, function (m) {
                        self._remove(m, opts);
                    });
                } else if (model) {
                    self._remove(model, opts);
                }
            },

            /**
             * Get model at specified index.
             * @param {Number} i Specified index.
             */
            at:function (i) {
                return this.get("models")[i];
            },

            _normModel:function (model) {
                var ret = true;
                if (!(model instanceof Model)) {
                    var data = model,
                        modelConstructor = this.get("model");
                    model = new modelConstructor();
                    ret = model.set(data, {
                        silent:1
                    });
                }
                return ret && model;
            },

            /**
             * Initialize model list by loading data using sync mechanism.
             * @param {Object} opts Load config.
             * @param {Function} opts.success Callback when load is successful.
             * @param {Function} opts.error Callback when error occurs on loading.
             * @param {Function} opts.complete Callback when load is complete.
             * @chainable
             */
            load:function (opts) {
                var self = this;
                opts = opts || {};
                var success = opts.success;
                /**
                 * @ignore
                 */
                opts.success = function (resp) {
                    if (resp) {
                        var v = self.get("parse").call(self, resp);
                        if (v) {
                            self.set("models", v, opts);
                        }
                    }
                    // https://github.com/kissyteam/kissy/issues/138
                    S.each(self.get("models"), function (m) {
                        m.__isModified = 0;
                    });
                    success && success.apply(this, arguments);
                };
                self.get("sync").call(self, self, 'read', opts);
                return self;
            },

            /**
             * Add a model to current collection by provide json data.
             * @param {Object} model Json data represent model data.
             * @param {Object} opts Create config.
             * @param {Function} opts.success Callback when create is successful.
             * @param {Function} opts.error Callback when error occurs on creating.
             * @param {Function} opts.complete Callback when create is complete.
             * @param {Function} opts.silent Whether to fire add event.
             */
            create:function (model, opts) {
                var self = this;
                opts = opts || {};
                model = this._normModel(model);
                if (model) {
                    model.addToCollection(self);
                    var success = opts.success;
                    opts.success = function () {
                        self.add(model, opts);
                        success && success();
                    };
                    model.save(opts);
                }
                return model;
            },

            _add:function (model, opts) {
                model = this._normModel(model);
                if (model) {
                    opts = opts || {};
                    var index = findModelIndex(this.get("models"), model, this.get("comparator"));
                    this.get("models").splice(index, 0, model);
                    model.addToCollection(this);
                    if (!opts['silent']) {
                        this.fire("add", {
                            model:model
                        });
                    }
                }
                return model;
            },

            /**
             * not call model.destroy ,maybe model belongs to multiple collections
             * @private
             */
            _remove:function (model, opts) {
                opts = opts || {};
                var index = S.indexOf(model, this.get("models"));
                if (index != -1) {
                    this.get("models").splice(index, 1);
                    model.removeFromCollection(this);
                }
                if (!opts['silent']) {
                    this.fire("remove", {
                        model:model
                    });
                }
            },

            /**
             * Get model instance by id.
             * @param {String} id
             */
            getById:function (id) {
                var models = this.get("models");
                for (var i = 0; i < models.length; i++) {
                    var model = models[i];
                    if (model.getId() === id) {
                        return model;
                    }
                }
                return null;
            },

            /**
             * Get model instance by client id.
             * @param {String} cid Client id auto generated by model.
             */
            getByCid:function (cid) {
                var models = this.get("models");
                for (var i = 0; i < models.length; i++) {
                    var model = models[i];
                    if (model.get("clientId") === cid) {
                        return model;
                    }
                }
                return null;
            }

        });

    return Collection;

}, {
    requires:['event', './model', 'base']
});/**
 * @fileOverview enhanced base for model with sync
 * @author yiminghe@gmail.com
 */
KISSY.add("mvc/model", function (S, Base) {

    var blacklist = [
        "idAttribute",
        "clientId",
        "urlRoot",
        "url",
        "parse",
        "sync"
    ];

    /**
     * @name Model
     * @class
     * Model represent a data record.
     * @memberOf MVC
     * @extends KISSY.Base
     */
    function Model() {
        var self = this;
        Model.superclass.constructor.apply(self, arguments);
        /*
         *Change should bubble to its collections
         */
        self.collections = {};
    }

    S.extend(Model, Base,
        /**
         * @lends MVC.Model#
         */
        {

            /**
             * Add current model instance to a specified collection.
             * @param {MVC.Collection} c
             */
            addToCollection:function (c) {
                this.collections[S.stamp(c)] = c;
                this.addTarget(c);
            },
            /**
             * Remove current model instance from a specified collection.
             * @param {MVC.Collection} c
             */
            removeFromCollection:function (c) {
                delete this.collections[S.stamp(c)];
                this.removeTarget(c);
            },

            /**
             * Get current model 's id.
             */
            getId:function () {
                return this.get(this.get("idAttribute"));
            },

            /**
             * Set current model 's id.
             * @param id
             */
            setId:function (id) {
                return this.set(this.get("idAttribute"), id);
            },

            setInternal:function () {
                this.__isModified = 1;
                return Model.superclass.setInternal.apply(this, arguments);
            },

            /**
             * whether it is newly created.
             * @return {Boolean}
             */
            isNew:function () {
                return !this.getId();
            },

            /**
             * whether has been modified since last save.
             * @return {Boolean}
             */
            isModified:function () {
                return !!(this.isNew() || this.__isModified);
            },

            /**
             * destroy this model and sync with server.
             * @param {Object} [opts] destroy config.
             * @param {Function} opts.success callback when action is done successfully.
             * @param {Function} opts.error callback when error occurs at action.
             * @param {Function} opts.complete callback when action is complete.
             * @chainable
             */
            destroy:function (opts) {
                var self = this;
                opts = opts || {};
                var success = opts.success;
                /**
                 * @ignore
                 */
                opts.success = function (resp) {
                    var lists = self.collections;
                    if (resp) {
                        var v = self.get("parse").call(self, resp);
                        if (v) {
                            self.set(v, opts);
                        }
                    }
                    for (var l in lists) {
                        lists[l].remove(self, opts);
                        self.removeFromCollection(lists[l]);
                    }
                    self.fire("destroy");
                    success && success.apply(this, arguments);
                };
                if (!self.isNew() && opts['delete']) {
                    self.get("sync").call(self, self, 'delete', opts);
                } else {
                    opts.success();
                    if (opts.complete) {
                        opts.complete();
                    }
                }

                return self;
            },

            /**
             * Load model data from server.
             * @param {Object} opts Load config.
             * @param {Function} opts.success callback when action is done successfully.
             * @param {Function} opts.error callback when error occurs at action.
             * @param {Function} opts.complete callback when action is complete.
             * @chainable
             */
            load:function (opts) {
                var self = this;
                opts = opts || {};
                var success = opts.success;
                /**
                 * @ignore
                 */
                opts.success = function (resp) {
                    if (resp) {
                        var v = self.get("parse").call(self, resp);
                        if (v) {
                            self.set(v, opts);
                        }
                    }
                    self.__isModified = 0;
                    success && success.apply(this, arguments);
                };
                self.get("sync").call(self, self, 'read', opts);
                return self;
            },

            /**
             * Save current model 's data to server using sync.
             * @param {Object} opts Save config.
             * @param {Function} opts.success callback when action is done successfully.
             * @param {Function} opts.error callback when error occurs at action.
             * @param {Function} opts.complete callback when action is complete.
             * @chainable
             */
            save:function (opts) {
                var self = this;
                opts = opts || {};
                var success = opts.success;
                /**
                 * @ignore
                 */
                opts.success = function (resp) {
                    if (resp) {
                        var v = self.get("parse").call(self, resp);
                        if (v) {
                            self.set(v, opts);
                        }
                    }
                    self.__isModified = 0;
                    success && success.apply(this, arguments);
                };
                self.get("sync").call(self, self, self.isNew() ? 'create' : 'update', opts);
                return self;
            },

            /**
             * Get json representation for current model.
             * @return {Object}
             */
            toJSON:function () {
                var ret = this.getAttrVals();
                S.each(blacklist, function (b) {
                    delete ret[b];
                });
                return ret;
            }

        }, {
            ATTRS:/**
             * @lends MVC.Model#
             */
            {
                /**
                 * Attribute name used to store id from server.
                 * @default "id".
                 * @type {String}
                 */
                idAttribute:{
                    value:'id'
                },

                /**
                 * Generated client id.
                 * Default call S.guid()
                 * @type {Function}
                 */
                clientId:{
                    valueFn:function () {
                        return S.guid("mvc-client");
                    }
                },
                /**
                 * Called to get url for delete/edit/new current model.
                 * @default collection.url+"/"+mode.id
                 * @type {Function}
                 */
                url:{
                    value:url
                },
                /**
                 * If current model does not belong to any collection.
                 * Use this attribute value as collection.url in {@link MVC.Model#url}
                 * @type {String}
                 */
                urlRoot:{
                    value:""
                },
                /**
                 * Sync model data with server.
                 * Default to call {@link MVC.sync}
                 * @type {Function}
                 */
                sync:{
                    value:function () {
                        S.require("mvc").sync.apply(this, arguments);
                    }
                },
                /**
                 * parse json from server to get attr/value pairs.
                 * Default to return raw data from server.
                 * @type {Function}
                 */
                parse:{
                    value:function (resp) {
                        return resp;
                    }
                }
            }
        });

    function getUrl(o) {
        var u;
        if (o && (u = o.get("url"))) {
            if (typeof u == 'string') {
                return u;
            }
            return u.call(o);
        }
        return u;
    }

    function url() {
        var c,
            cv,
            collections = this.collections;
        for (c in collections) {
            if (collections.hasOwnProperty(c)) {
                cv = collections[c];
                break;
            }
        }
        var base = getUrl(cv) || this.get("urlRoot");

        if (this.isNew()) {
            return base;
        }

        base = base + (base.charAt(base.length - 1) == '/' ? '' : '/');
        return base + encodeURIComponent(this.getId()) + "/";
    }

    return Model;

}, {
    requires:['base']
});/**
 * @fileOverview KISSY 's MVC Framework for Page Application (Backbone Style)
 * @author yiminghe@gmail.com
 */
KISSY.add("mvc", function (S, Model, Collection, View, Router, sync) {

    /**
     * @namespace
     * KISSY MVC Framework.
     * @name MVC
     */

    return {
        sync:sync,
        Model:Model,
        View:View,
        Collection:Collection,
        Router:Router
    };
}, {
    requires:["mvc/model", "mvc/collection", "mvc/view", "mvc/router", "mvc/sync"]
});/**
 * @fileOverview simple router to get path parameter and query parameter from hash(old ie) or url(html5)
 * @author yiminghe@gmail.com
 */
KISSY.add('mvc/router', function (S, Event, Base) {
    var each = S.each,
    // take a breath to avoid duplicate hashchange
        BREATH_INTERVAL = 100,
        grammar = /(:([\w\d]+))|(\\\*([\w\d]+))/g,
    // all registered route instance
        allRoutes = [],
        win = S.Env.host,
        ie = win.document.documentMode || S.UA.ie,
        history = win.history ,
        supportNativeHistory = !!(history && history['pushState']),
        ROUTER_MAP = "__routerMap";

    function findFirstCaptureGroupIndex(regStr) {
        var r, i;
        for (i = 0; i < regStr.length; i++) {
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
        return new S.Uri(url).getFragment().replace(/^!/, "");
    }

    /**
     * get url fragment and dispatch
     */
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
        if (str) {
            return "/" + removeStartSlash(str);
        } else {
            return str;
        }
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
     * match url with route intelligently (always get optimal result)
     */
    function dispatch() {
        var query,
            path,
            arg,
            finalRoute = 0,
            finalMatchLength = -1,
            finalRegStr = "",
            finalFirstCaptureGroupIndex = -1,
            finalCallback = 0,
            finalRouteName = "",
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
                    if (m = path.match(reg)) {
                        // match all result item shift out
                        m.shift();

                        function genParam() {
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
                        }
                        else if (regStr) {

                            firstCaptureGroupIndex = findFirstCaptureGroupIndex(regStr);

                            // final route : /*
                            // now route : /xx/*
                            if (firstCaptureGroupIndex > finalFirstCaptureGroupIndex) {
                                upToFinal();
                            }

                            else if (
                                firstCaptureGroupIndex == finalFirstCaptureGroupIndex &&
                                    finalMatchLength >= m.length
                                ) {
                                // final route : /xx/:id/:id
                                // now route :  /xx/:id/zz
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
                        // if exists user-given reg router rule then update value directly
                        // first route has priority
                        // 用户设置的正则表达式具备高优先级
                        else {
                            upToFinal();
                            exactlyMatch = 1;
                            return false;
                        }
                    }
                }
            );

            if (exactlyMatch) {
                return false;
            }
        });


        if (finalParam) {
            query = pathUri.query.get();
            finalCallback.apply(finalRoute, [finalParam, query, {
                path: path,
                url: location.href
            }]);
            arg = {
                name: finalRouteName,
                "paths": finalParam,
                path: path,
                url: location.href,
                query: query
            };
            finalRoute.fire('route:' + finalRouteName, arg);
            finalRoute.fire('route', arg);
        }
    }

    /**
     * transform route declaration to router reg
     * @param str
     *         /search/:q
     *         /user/*path
     */
    function transformRouterReg(self, str, callback) {
        var name = str,
            paramNames = [];

        if (S.isFunction(callback)) {
            // escape keyword from regexp
            str = S.escapeRegExp(str);

            str = str.replace(grammar, function (m, g1, g2, g3, g4) {
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
                name: name,
                paramNames: paramNames,
                reg: new RegExp("^" + str + "$"),
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

    /**
     * normalize function by self
     * @param self
     * @param callback
     */
    function normFn(self, callback) {
        if (S.isFunction(callback)) {
            return callback;
        } else if (typeof callback == 'string') {
            return self[callback];
        }
        return callback;
    }

    function _afterRoutesChange(e) {
        var self = this;
        self[ROUTER_MAP] = {};
        self.addRoutes(e.newVal);
    }

    /**
     * @name Router
     * @class
     * Router used to route url to responding action callbacks.
     * @memberOf MVC
     * @extends KISSY.Base
     */
    function Router() {
        var self = this;
        Router.superclass.constructor.apply(self, arguments);
        self.on("afterRoutesChange", _afterRoutesChange, self);
        _afterRoutesChange.call(self, {newVal: self.get("routes")});
        allRoutes.push(self);
    }

    Router.ATTRS =
    /**
     * @lends MVC.Router#
     */
    {
        /**
         * Route and action config.
         * @type {Object}
         * @example
         * <code>
         *   {
         *     "/search/:param":"callback"
         *     // or
         *     "search":{
         *       reg:/xx/,
         *       callback:fn
         *     }
         *   }
         * </code>
         */
        routes: {}
    };

    S.extend(Router, Base,
        /**
         * @lends MVC.Router#
         */
        {
            /**
             * Add config to current router.
             * @param {Object} routes Route config.
             * @example
             * <code>
             *   {
             *     "/search/:param":"callback"
             *     // or
             *     "search":{
             *       reg:/xx/,
             *       callback:fn
             *     }
             *   }
             * </code>
             */
            addRoutes: function (routes) {
                var self = this;
                each(routes, function (callback, name) {
                    self[ROUTER_MAP][name] = transformRouterReg(self, name, normFn(self, callback));
                });
            }
        },
        /**
         * @lends MVC.Router
         */
        {

            /**
             * whether Router can process path
             * @param {String} path path for route
             * @return {Boolean}
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
                    });
                    if (match) {
                        return false;
                    }
                });
                return !!match;
            },

            /**
             * get the route path
             * @param {String} url full location href
             * @return {String} route path
             */
            removeRoot: function (url) {
                var u = new S.Uri(url);
                return u.getPath().substr(Router.urlRoot.length);
            },

            /**
             * Navigate to specified path.
             * Similar to runRoute in sammy.js.
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
                            "", getFullPath(path));
                        // pushState does not fire popstate event (unlike hashchange)
                        // so popstate is not statechange
                        // fire manually
                        dispatch();
                    } else {
                        normalizedPath = '#!' + path;
                        if (replaceHistory) {
                            // add history hack
                            location.replace(normalizedPath +
                                (ie && ie < 8 ? Event.REPLACE_HISTORY : ''));
                        } else {
                            location.hash = normalizedPath;
                        }
                    }
                } else if (opts && opts.triggerRoute) {
                    dispatch();
                }
            },
            /**
             * Start router (url monitor).
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
                opts.urlRoot = (opts.urlRoot || "").replace(/\/$/, '');

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
                setTimeout(function () {

                    if (nativeHistory && supportNativeHistory) {
                        Event.on(win, 'popstate', dispatch);
                        // html5 triggerRoute is leaved to user decision
                        // if provide no #! hash
                    } else {
                        Event.on(win, "hashchange", dispatch);
                        // hash-based browser is forced to trigger route
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

                Router.__started = 1;
            }
        });

    return Router;

}, {
    requires: ['event', 'base']
});

/**
 * 2011-11-30
 *  - support user-given native regexp for router rule
 *
 * refer :
 * http://www.w3.org/TR/html5/history.html
 * http://documentcloud.github.com/backbone/
 **//**
 * @fileOverview default sync for model
 * @author yiminghe@gmail.com
 */
KISSY.add("mvc/sync", function (S, io, JSON) {
    var methodMap = {
        'create': 'POST',
        'update': 'POST', //'PUT'
        'delete': 'POST', //'DELETE'
        'read': 'GET'
    };

    /**
     * Default sync mechanism.
     * Sync data with server using {@link IO} .
     * @memberOf MVC
     * @param {MVC.Model|MVC.Collection} self Model or Collection instance to sync with server.
     * @param {String} method Create or update or delete or read.
     * @param {Object} options IO options
     */
    function sync(self, method, options) {
        var type = methodMap[method],
            ioParam = S.merge({
                type: type,
                dataType: 'json'
            }, options),
            data,
            url;

        data = ioParam.data = ioParam.data || {};
        data['_method'] = method;

        if (!ioParam.url) {
            url = self.get("url");
            ioParam.url = (typeof url == 'string') ?
                url :
                url.call(self);
        }

        if (method == 'create' || method == 'update') {
            data.model = JSON.stringify(self.toJSON());
        }

        return io(ioParam);
    }

    return sync;
}, {
    requires: ['ajax', 'json']
});/**
 * @fileOverview view for kissy mvc : event delegation,el generator
 * @author yiminghe@gmail.com
 */
KISSY.add("mvc/view", function (S, Node, Base) {

    var $ = Node.all;

    function normFn(self, f) {
        if (typeof f == 'string') {
            return self[f];
        }
        return f;
    }

    /**
     * @name View
     * @class
     * View for delegating event on root element.
     * @memberOf MVC
     * @extends KISSY.Base
     */
    function View() {
        View.superclass.constructor.apply(this, arguments);
        var events;
        if (events = this.get("events")) {
            this._afterEventsChange({
                newVal: events
            });
        }
    }

    View.ATTRS =
    /**
     * @lends MVC.View#
     */
    {
        /**
         * Get root element for current view instance.
         * @type {String}
         * @example
         * <code>
         * //  selector :
         * .xx
         * // or html string
         * <div>my</div>
         * </code>
         */
        el: {
            value: "<div />",
            getter: function (s) {
                if (typeof s == 'string') {
                    s = $(s);
                    this.setInternal("el", s);
                }
                return s;
            }
        },

        /**
         * Delegate event on root element.
         * @type {Object}
         * @example
         * <code>
         * events:{
         *   selector:{
         *     eventType:callback
         *   }
         * }
         * </code>
         */
        events: {

        }
    };


    S.extend(View, Base,
        /**
         * @lends MVC.View#
         */
        {

            _afterEventsChange: function (e) {
                var prevVal = e.prevVal;
                if (prevVal) {
                    this._removeEvents(prevVal);
                }
                this._addEvents(e.newVal);
            },

            _removeEvents: function (events) {
                var el = this.get("el");
                for (var selector in events) {
                    var event = events[selector];
                    for (var type in event) {
                        var callback = normFn(this, event[type]);
                        el.undelegate(type, selector, callback, this);
                    }
                }
            },

            _addEvents: function (events) {
                var el = this.get("el");
                for (var selector in events) {
                    var event = events[selector];
                    for (var type in event) {
                        var callback = normFn(this, event[type]);
                        el.delegate(type, selector, callback, this);
                    }
                }
            },

            /**
             * @chainable
             */
            render: function () {
                return this;
            },

            /**
             * Remove root element.
             */
            destroy: function () {
                this.get("el").remove();
            }

        });

    return View;

}, {
    requires: ['node', 'base']
});
