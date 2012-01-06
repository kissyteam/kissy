/**
 * @fileOverview enhanced base for model with sync
 * @author yiminghe@gmail.com
 */
KISSY.add("mvc/model", function (S, Base, mvc) {

    var blacklist = [
        "idAttribute",
        "clientId",
        "urlRoot",
        "url",
        "parse",
        "sync"
    ];

    /**
     * @class
     * @memberOf MVC
     */
    function Model() {
        var self = this;
        Model.superclass.constructor.apply(self, arguments);
        /*
         should bubble to its collections
         */
        self.publish("*Change", {
            bubbles:1
        });
        self.collections = {};
    }

    S.extend(Model, Base,
        /**
         * @lends MVC.Model#
         */
        {

            addToCollection:function (c) {
                this.collections[S.stamp(c)] = c;
                this.addTarget(c);
            },

            removeFromCollection:function (c) {
                delete this.collections[S.stamp(c)];
                this.removeTarget(c);
            },

            getId:function () {
                return this.get(this.get("idAttribute"));
            },

            setId:function (id) {
                return this.set(this.get("idAttribute"), id);
            },

            __set:function () {
                this.__isModified = 1;
                return Model.superclass.__set.apply(this, arguments);
            },

            /**
             * whether it is newly created
             */
            isNew:function () {
                return !this.getId();
            },

            /**
             * whether has been modified since last save
             */
            isModified:function () {
                return !!(this.isNew() || this.__isModified);
            },

            /**
             * destroy this model
             * @param opts
             * @param {Object} opts
             * @param {Function} opts.success callback when action is done successfully
             * @param {Function} opts.error
             * @param {Function} opts.complete
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
             * call sycn to load
             * @param opts
             * @param {Object} opts
             * @param {Function} opts.success callback when action is done successfully
             * @param {Function} opts.error
             * @param {Function} opts.complete
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
             *
             * @param {Object} opts
             * @param {Function} opts.success callback when action is done successfully
             * @param {Function} opts.error
             * @param {Function} opts.complete
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

            toJSON:function () {
                var ret = this.getAttrVals();
                S.each(blacklist, function (b) {
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
                    valueFn:function () {
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
                    /*
                     parse json from server to get attr/value pairs
                     */
                    value:function (resp) {
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
    requires:['base', './base']
});