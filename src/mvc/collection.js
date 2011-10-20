/**
 * collection of models
 * @author yiminghe@gmail.com
 */
KISSY.add("mvc/collection", function(S, Event, Model, mvc) {

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

    function Collection(models) {
        this.models = [];
        if (models) {
            this.reset(models, {
                silent:1
            });
        }
    }

    S.augment(Collection, Event.Target, {

        sort:function() {
            var comparator = this.comparator;
            if (comparator) {
                this.models.sort(function(a, b) {
                    return comparator(a) - comparator(b);
                });
            }
        },

        toJSON:function() {
            return S.map(this.models, function(m) {
                return m.toJSON();
            });
        },

        pluck:function(attrName) {
            return S.map(this.models, function(m) {
                return m.get(attrName)
            });
        },

        sync:function() {
            mvc.sync.apply(this, arguments);
        },

        parse:function(resp) {
            return resp;
        },

        url:function() {
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
                S.each(model, function(m) {
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
                S.each(model, function(m) {
                    self._remove(m, opts);
                });
            } else {
                self._remove(model, opts);
            }
        },

        _normModel:function(model) {
            var ret = true;
            if (!model instanceof Model) {
                var data = model;
                model = new (this.model)();
                ret = model.set(data, {
                    silent:1
                });
            }
            return ret && model;
        },

        load:function(opts) {
            var self = this;
            opts = opts || {};
            self.sync('read', opts, function(resp, err) {
                if (!err) {
                    if (resp) {
                        self.reset(self.parse(resp), opts);
                    }
                    if (opts.success) {
                        opts.success(resp, err);
                    }
                } else {
                    if (opts.error) {
                        opts.error(resp, err);
                    }
                }
                if (opts.complete) {
                    opts.complete(resp, err);
                }
            });
            return self;
        },

        create:function(model, opts) {
            var self = this;
            opts = opts || {};
            model = this._normModel(model);
            if (model) {
                var success = opts.success;
                opts.success = function() {
                    self.add(model, opts);
                    success && success();
                };
                model.save(opts);
            }
            return model;
        },

        reset:function(models, opts) {
            models = models || [];
            opts = opts || {};
            this.remove(this.models, {silent:1});
            this.add(models, {silent:1});
            if (!opts['silent']) {
                this.fire("reset");
            }
        },

        comparator:null,

        model:null,

        _add:function(model, opts) {
            if (!model instanceof Model) {
                model = this._normModel(model)
            }
            if (model) {
                opts = opts || {};
                var index = findModelIndex(this.models, model, this.comparator);
                this.models.splice(index, 0, model);
                model.addToCollection(this);
                if (!opts['silent']) {
                    this.fire("add", function() {
                        model:model
                    });
                }
            }
            return model;
        },

        _remove:function(model, opts) {
            opts = opts || {};
            var index = S.indexOf(this.models, model);
            if (index != -1) {
                this.models.splice(index, 1);
            }
            model.removeFromCollection(this);
            if (!opts['silent']) {
                this.fire("remove", function() {
                    model:model
                });
            }
        },

        get:function(id) {
            for (var i = 0; i < this.models.length; i++) {
                var model = this.models[i];
                if (model.getId() === id) {
                    return model;
                }
            }
            return null;
        },

        getByCid:function(cid) {
            for (var i = 0; i < this.models.length; i++) {
                var model = this.models[i];
                if (model.get("clientId") === cid) {
                    return model;
                }
            }
            return null;
        }

    });

    return Collection;

}, {
    requires:['event','./model','./base']
});