/**
 * enhanced base for model with sync
 * @author yiminghe@gmail.com
 */
KISSY.add("mvc/model", function(S, Base, Sync) {


    function Model() {
        var self = this;
        Model.superclass.constructor.apply(self, arguments);
        /**
         * should bubble to its collections
         */
        self.publish("beforeChange", {
            bubbles:1
        });
        self.publish("afterChange", {
            bubbles:1
        });
        /**
         * @Array mvc/collection collections this model belonged to
         */
        self.__collections = {};
    }

    S.extend(Model, Base, {

        addToCollection:function(c) {
            this.__collections[S.stamp(c)] = c;
            this.addTarget(c);
        },

        removeFromCollection:function(c) {
            delete this.__collections[S.stamp(c)];
            this.removeTarget(c);
        },

        /**
         * @override
         */
        __set:function() {
            this.__isModified = 1;
            Model.superclass.__set.apply(this, arguments);
        },

        /**
         *  action,opts,callback
         */
        sync:Sync,

        /**
         * whether it is newly created
         */
        isNew:function() {
            return !this.get(this.get("idAttribute"));
        },

        /**
         * whether has been modified since last save
         */
        isModified:function() {
            return this.isNew() || this.__isModified;
        },

        /**
         * destroy this model
         * @param opts
         * @param callback
         */
        destroy:function(opts, callback) {
            var self = this;
            if (S.isFunction(opts)) {
                opts = {};
                callback = opts;
            }

            function f(err) {

                if (!err) {
                    var lists = self.__collections;
                    for (var l in lists) {
                        lists[l].remove(self, opts);
                        self.removeFromCollection(lists[l]);
                    }
                }

                if (callback) {
                    callback(err);
                }

            }

            if (opts['delete']) {
                self.sync('delete', opts, f);
            } else {
                f();
            }

            return self;
        },

        /**
         * call sycn to load
         * @param opts
         * @param callback
         */
        load:function(opts, callback) {
            var self = this;
            if (S.isFunction(opts)) {
                opts = {};
                callback = opts;
            }

            self.sync('read', opts, function(resp, err) {
                if (!err) {
                    if (resp) {
                        self.set(self.parse(resp), opts);
                    }
                    self.__isModified = 0;
                }
                if (callback) {
                    callback(resp, err);
                }
            });

            return self;
        },

        /**
         * parse json from server to get attr/value pairs
         * @param resp
         */
        parse:function(resp) {
            return resp;
        },

        save:function(opts, callback) {
            var self = this;
            if (S.isFunction(opts)) {
                opts = {};
                callback = opts;
            }
            self.sync(self.isNew() ? 'create' : 'update', opts, function(resp, err) {
                if (!err) {
                    if (resp) {
                        self.set(self.parse(resp), opts);
                    }
                    self.__isModified = 0;
                }
                if (callback) {
                    callback(resp, err);
                }
            });
            return self;
        },

        toJson:function() {
            var ret = this.getAttrVals();
            delete ret.idAttribute;
            delete ret.clientId;
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
            }
        }
    });

    return Model;

}, {
    requires:['base','./sync']
});