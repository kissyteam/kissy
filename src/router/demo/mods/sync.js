/**
 * 全局同步函数
 * @author yiminghe@gmail.com
 */

    var mvc = require('../mvc/index');
    var Json = require('json');
    var KEY = 'KISSY_Note';
    var util = require('util');

    function isModel(m) {
        return m instanceof mvc.Model;
    }

    function findById(store, id) {
        for (var i = 0; i < store.length; i++) {
            if (store[i].id === id) {
                return i;
            }
        }
        return -1;
    }

    var STORE, sync;
    /*
     覆盖全局的同步函数
     */
    sync = function (self, method, options) {
        options = options || {};
        S.log(method);
        // 模拟异步请求
        setTimeout(function () {
            var index;
            var store = STORE || (window.localStorage ? window.localStorage.getItem(KEY) || [] : []);
            if (typeof store === 'string') {
                store = Json.parse(store);
            }

            var ret, id, error, i;
            switch (method) {
                case 'read':
                    var q;
                    if (options.data && (q = options.data.q)) {
                        ret = [];
                        for (i in store) {
                            if (store[i].title.indexOf(q) > -1) {
                                ret.push(store[i]);
                            }
                        }
                    } else {
                        if (isModel(self)) {
                            ret = store[findById(store, self.get('id'))];
                            if (!ret) {
                                error = 'not found';
                            }
                        } else {
                            ret = [];
                            for (i in store) {
                                ret.push(store[i]);
                            }
                        }
                    }
                    break;
                case 'create':
                    ret = self.toJSON();
                    ret.id = util.guid('note');
                    ret.time = new Date().toLocaleTimeString();
                    store.push(ret);
                    break;
                case 'delete':
                    id = self.get('id');
                    index = findById(store, id);
                    if (index > -1) {
                        store.splice(index, 1);
                    }
                    break;
                case 'update':
                    id = self.get('id');
                    index = findById(store, id);
                    if (index > -1) {
                        store[index] = self.toJSON();
                    }
                    break;
            }

            if (method !== 'read' && window.localStorage) {
                try {
                    window.localStorage.setItem(KEY, Json.stringify(store));
                } catch (e) {
                    // QUOTA_EXCEEDED_ERR
                    S.log(e, 'error');
                }
            }

            STORE = store;

            if (error) {
                if (options.error) {
                    options.error(null, error);
                }
            }

            else if (options.success) {
                options.success(ret);
            }

            if (options.complete) {
                options.complete(ret, error);
            }
        }, 500);
    };

    module.exports = sync;