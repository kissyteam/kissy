/**
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
        this.on("afterModelsChange", function() {
            this.fire("reset");
        });
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
        url:{value:S.noop()},
        comparator:{}
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

        pluck:function(attrName) {
            return S.map(this.get("models"), function(m) {
                return m.get(attrName)
            });
        },

        sync:function() {
            mvc.sync.apply(this, arguments);
        },

        parse:function(resp) {
            return resp;
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
                    self.set("models", self.parse(resp), opts);
                }
                success && success.apply(this, arguments);
            };
            self.sync('read', opts);
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
});