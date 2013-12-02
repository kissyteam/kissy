/**
 * @ignore
 * enhanced base for model with sync
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Attribute = require('attribute');
    var blacklist = [
        'idAttribute',
        'destroyed',
        'plugins',
        'listeners',
        'clientId',
        'urlRoot',
        'url',
        'parse',
        'sync'
    ];

    /**
     * Model represent a data record.
     * @class KISSY.MVC.Model
     * @extends KISSY.Attribute
     */
    return Attribute.extend({
        getCollections: function () {
            return  this.collections || (this.collections = {});
        },

        /**
         * Add current model instance to a specified collection.
         * @param {KISSY.MVC.Collection} c
         */
        addToCollection: function (c) {
            this.getCollections()[S.stamp(c)] = c;
            this.addTarget(c);
        },
        /**
         * Remove current model instance from a specified collection.
         * @param {KISSY.MVC.Collection} c
         */
        removeFromCollection: function (c) {
            delete this.getCollections()[S.stamp(c)];
            this.removeTarget(c);
        },

        /**
         * Get current model 's id.
         */
        getId: function () {
            return this.get(this.get('idAttribute'));
        },

        /**
         * Set current model 's id.
         * @param id
         */
        'setId': function (id) {
            return this.set(this.get('idAttribute'), id);
        },

        setInternal: function () {
            this.__isModified = 1;
            return this.callSuper.apply(this, arguments);
        },

        /**
         * whether it is newly created.
         * @return {Boolean}
         */
        isNew: function () {
            return !this.getId();
        },

        /**
         * whether has been modified since last save.
         * @return {Boolean}
         */
        isModified: function () {
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
        destroy: function (opts) {
            var self = this;
            opts = opts || {};
            var success = opts.success;
            /**
             * @ignore
             */
            opts.success = function (resp) {
                var lists = self.getCollections();
                if (resp) {
                    var v = self.get('parse').call(self, resp);
                    if (v) {
                        self.set(v, opts);
                    }
                }
                for (var l in lists) {
                    lists[l].remove(self, opts);
                }
                self.fire('destroy');
                if(success){
                    success.apply(self, arguments);
                }
            };
            if (!self.isNew() && opts['delete']) {
                self.get('sync').call(self, self, 'delete', opts);
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
        load: function (opts) {
            var self = this;
            opts = opts || {};
            var success = opts.success;
            /**
             * @ignore
             */
            opts.success = function (resp) {
                if (resp) {
                    var v = self.get('parse').call(self, resp);
                    if (v) {
                        self.set(v, opts);
                    }
                }
                self.__isModified = 0;
                if(success){
                    success.apply(self, arguments);
                }
            };
            self.get('sync').call(self, self, 'read', opts);
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
        save: function (opts) {
            var self = this;
            opts = opts || {};
            var success = opts.success;
            /**
             * @ignore
             */
            opts.success = function (resp) {
                if (resp) {
                    var v = self.get('parse').call(self, resp);
                    if (v) {
                        self.set(v, opts);
                    }
                }
                self.__isModified = 0;
                if(success){
                    success.apply(self, arguments);
                }
            };
            self.get('sync').call(self, self, self.isNew() ? 'create' : 'update', opts);
            return self;
        },

        /**
         * Get json representation for current model.
         * @return {Object}
         */
        toJSON: function () {
            var ret = this.getAttrVals();
            S.each(blacklist, function (b) {
                delete ret[b];
            });
            return ret;
        }

    }, {
        ATTRS: {
            /**
             * Attribute name used to store id from server.
             * Defaults to: 'id'.
             * @type {String}
             */
            idAttribute: {
                value: 'id'
            },

            /**
             * Generated client id.
             * Default call S.guid()
             * @type {Function}
             */
            clientId: {
                valueFn: function () {
                    return S.guid('mvc-client');
                }
            },
            /**
             * Called to get url for delete/edit/new current model.
             * Defaults to: collection.url+"/"+mode.id
             * @type {Function}
             */
            url: {
                value: url
            },
            /**
             * If current model does not belong to any collection.
             * Use this attribute value as collection.url in {@link KISSY.MVC.Model#url}
             * @type {String}
             */
            urlRoot: {
                value: ''
            },
            /**
             * Sync model data with server.
             * Default to call {@link KISSY.MVC#sync}
             * @type {Function}
             */
            sync: {
                value: function () {
                    S.require('mvc').sync.apply(this, arguments);
                }
            },
            /**
             * parse json from server to get attr/value pairs.
             * Default to return raw data from server.
             * @type {Function}
             */
            parse: {
                value: function (resp) {
                    return resp;
                }
            }
        }
    });

    function getUrl(o) {
        var u;
        if (o && (u = o.get('url'))) {
            if (typeof u === 'string') {
                return u;
            }
            return u.call(o);
        }
        return u;
    }

    function url() {
        var c,
            cv,
            collections = this.getCollections();
        for (c in collections) {
            if (collections.hasOwnProperty(c)) {
                cv = collections[c];
                break;
            }
        }
        var base = getUrl(cv) || this.get('urlRoot');

        if (this.isNew()) {
            return base;
        }

        base = base + (base.charAt(base.length - 1) === '/' ? '' : '/');
        return base + encodeURIComponent(this.getId()) + '/';
    }
});