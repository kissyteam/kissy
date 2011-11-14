/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Nov 14 18:16
*/
/**
 * mvc base
 * @author yiminghe@gmail.com
 */
KISSY.add("mvc/base", function(S, sync) {
    return {
        sync:sync
    };
}, {
    requires:['./sync']
});/**
 * collection of models
 * @author yiminghe@gmail.com
 */
KISSY.add("mvc/collection", function(S, Event, Model, mvc, Base) {

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

    function Collection() {
        Collection.superclass.constructor.apply(this, arguments);
    }

    Collection.ATTRS = {
        model:{
            value:Model
        },
        models:{
            /**
             * normalize model list
             * @param models
             */
            setter:function(models) {
                var prev = this.get("models");
                this.remove(prev, {silent:1});
                this.add(models, {silent:1});
                return this.get("models");
            },
            value:[]
        },
        url:{value:S.noop},
        comparator:{},
        sync:{
            value:function() {
                mvc.sync.apply(this, arguments);
            }
        },
        parse:{
            value:function(resp) {
                return resp;
            }
        }
    };

    S.extend(Collection, Base, {
        sort:function() {
            var comparator = this.get("comparator");
            if (comparator) {
                this.get("models").sort(function(a, b) {
                    return comparator(a) - comparator(b);
                });
            }
        },

        toJSON:function() {
            return S.map(this.get("models"), function(m) {
                return m.toJSON();
            });
        },

        /**
         *
         * @param model
         * @param opts
         * @return  boolean flag
         *          true:add success
         *          false:validate error
         */
        add:function(model, opts) {
            var self = this,
                ret = true;
            if (S.isArray(model)) {
                var orig = [].concat(model);
                S.each(orig, function(m) {
                    ret = ret && self._add(m, opts);
                });
            } else {
                ret = self._add(model, opts);
            }
            return ret;
        },

        remove:function(model, opts) {
            var self = this;
            if (S.isArray(model)) {
                var orig = [].concat(model);
                S.each(orig, function(m) {
                    self._remove(m, opts);
                });
            } else if (model) {
                self._remove(model, opts);
            }
        },

        at:function(i) {
            return this.get("models")[i];
        },

        _normModel:function(model) {
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

        load:function(opts) {
            var self = this;
            opts = opts || {};
            var success = opts.success;
            opts.success = function(resp) {
                if (resp) {
                    var v = self.get("parse").call(self, resp);
                    if (v) {
                        self.set("models", v, opts);
                    }
                }
                success && success.apply(this, arguments);
            };
            self.get("sync").call(self, self, 'read', opts);
            return self;
        },

        create:function(model, opts) {
            var self = this;
            opts = opts || {};
            model = this._normModel(model);
            if (model) {
                model.addToCollection(self);
                var success = opts.success;
                opts.success = function() {
                    self.add(model, opts);
                    success && success();
                };
                model.save(opts);
            }
            return model;
        },

        _add:function(model, opts) {
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
         * @param model
         * @param opts
         */
        _remove:function(model, opts) {
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

        getById:function(id) {
            var models = this.get("models");
            for (var i = 0; i < models.length; i++) {
                var model = models[i];
                if (model.getId() === id) {
                    return model;
                }
            }
            return null;
        },

        getByCid:function(cid) {
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
    requires:['event','./model','./base','base']
});/**
 * enhanced base for model with sync
 * @author yiminghe@gmail.com
 */
KISSY.add("mvc/model", function(S, Base, mvc) {

    var blacklist = [
        "idAttribute",
        "clientId",
        "urlRoot",
        "url",
        "parse",
        "sync"
    ];

    function Model() {
        var self = this;
        Model.superclass.constructor.apply(self, arguments);
        /**
         * should bubble to its collections
         */
        self.publish("*Change", {
            bubbles:1
        });
        /**
         * @Array mvc/collection collections this model belonged to
         */
        self.collections = {};
    }

    S.extend(Model, Base, {

        addToCollection:function(c) {
            this.collections[S.stamp(c)] = c;
            this.addTarget(c);
        },

        removeFromCollection:function(c) {
            delete this.collections[S.stamp(c)];
            this.removeTarget(c);
        },

        getId:function() {
            return this.get(this.get("idAttribute"));
        },

        setId:function(id) {
            return this.set(this.get("idAttribute"), id);
        },

        /**
         * @override
         */
        __set:function() {
            this.__isModified = 1;
            return Model.superclass.__set.apply(this, arguments);
        },

        /**
         * whether it is newly created
         */
        isNew:function() {
            return !this.getId();
        },

        /**
         * whether has been modified since last save
         */
        isModified:function() {
            return !!(this.isNew() || this.__isModified);
        },

        /**
         * destroy this model
         * @param opts
         */
        destroy:function(opts) {
            var self = this;
            opts = opts || {};
            var success = opts.success;
            opts.success = function(resp) {
                var lists = self.collections;
                if (resp) {
                    self.set(resp, opts);
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
         * call sycn to load
         * @param opts
         */
        load:function(opts) {
            var self = this;
            opts = opts || {};
            var success = opts.success;
            opts.success = function(resp) {
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

        save:function(opts) {
            var self = this;
            opts = opts || {};
            var success = opts.success;
            opts.success = function(resp) {
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

        toJSON:function() {
            var ret = this.getAttrVals();
            S.each(blacklist, function(b) {
                delete ret[b];
            });
            return ret;
        }

    }, {
        ATTRS:{
            idAttribute:{
                value:'id'
            },
            clientId:{
                valueFn:function() {
                    return S.guid("mvc-client");
                }
            },
            url:{
                value:url
            },
            urlRoot:{
                value:""
            },
            sync:{
                value:sync
            },
            parse:{
                /**
                 * parse json from server to get attr/value pairs
                 * @param resp
                 */
                value:function(resp) {
                    return resp;
                }
            }
        }
    });

    function getUrl(o) {
        var u;
        if (o && (u = o.get("url"))) {
            if (S.isString(u)) {
                return u;
            }
            return u.call(o);
        }
        return u;
    }


    function sync() {
        mvc.sync.apply(this, arguments);
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
    requires:['base','./base']
});/**
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
 **//**
 * default sync for model
 * @author yiminghe@gmail.com
 */
KISSY.add("mvc/sync", function(S, io) {
    var methodMap = {
        'create': 'POST',
        'update': 'POST', //'PUT'
        'delete': 'POST', //'DELETE'
        'read'  : 'GET'
    };

    function sync(self, method, options) {
        var type = methodMap[method],
            ioParam = S.merge({
                type:type,
                dataType:'json'
            }, options);

        var data = ioParam.data = ioParam.data || {};
        data['_method'] = method;

        if (!ioParam.url) {
            ioParam.url = S.isString(self.get("url")) ?
                self.get("url") :
                self.get("url").call(self);
        }

        if (method == 'create' || method == 'update') {
            data.model = self.toJSON();
        }

        return io(ioParam);
    }

    return sync;
}, {
    requires:['ajax']
});/**
 * view for kissy mvc : event delegation,el generator
 * @author yiminghe@gmail.com
 */
KISSY.add("mvc/view", function(S, Node, Base) {

    var $ = Node.all;

    function normFn(self, f) {
        if (S.isString(f)) {
            return self[f];
        }
        return f;
    }

    function View() {
        View.superclass.constructor.apply(this, arguments);
        var events;
        if (events = this.get("events")) {
            this._afterEventsChange({
                newVal:events
            });
        }
    }

    View.ATTRS = {
        el:{
            value:"<div />",
            getter:function(s) {
                if (S.isString(s)) {
                    s = $(s);
                    this.__set("el", s);
                }
                return s;
            }
        },

        /**
         * events:{
         *   selector:{
         *     eventType:callback
         *   }
         * }
         */
        events:{

        }
    };


    S.extend(View, Base, {

        _afterEventsChange:function(e) {
            var prevVal = e.prevVal;
            if (prevVal) {
                this._removeEvents(prevVal);
            }
            this._addEvents(e.newVal);
        },

        _removeEvents:function(events) {
            var el = this.get("el");
            for (var selector in events) {
                var event = events[selector];
                for (var type in event) {
                    var callback = normFn(this, event[type]);
                    el.undelegate(type, selector, callback, this);
                }
            }
        },

        _addEvents:function(events) {
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
         * user need to override
         */
        render:function() {
            return this;
        },

        destroy:function() {
            this.get("el").remove();
        }

    });

    return View;

}, {
    requires:['node','base']
});/**
 * KISSY's MVC Framework for Page Application (Backbone Style)
 * @author yiminghe@gmail.com
 */
KISSY.add("mvc", function(S, MVC, Model, Collection, View, Router) {
    return S.mix(MVC, {
        Model:Model,
        View:View,
        Collection:Collection,
        Router:Router
    });
}, {
    requires:["mvc/base","mvc/model","mvc/collection","mvc/view","mvc/router"]
});
