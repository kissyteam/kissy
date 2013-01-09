/**
 *  collection of models
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
});