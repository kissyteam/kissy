/**
 * 全局同步函数
 * @author yiminghe@gmail.com
 */
KISSY.add(function(S, mvc) {
    var KEY = 'KISSY_Note';

    function isModel(m) {
        return m instanceof mvc.Model;
    }

    function findById(store, id) {
        for (var i = 0; i < store.length; i++) {
            if (store[i].id == id) {
                return i;
            }
        }
        return -1;
    }

    var STORE,sync;
    /*
     覆盖全局的同步函数
     */
    sync = mvc.sync = function(self, method, options) {
        options = options || {};
        S.log(method);
        // 模拟异步请求
        setTimeout(function() {
            var index;
            var store = STORE || (window.localStorage ? window.localStorage.getItem(KEY) || [] : []);
            if (S.isString(store)) {
                store = JSON.parse(store);
            }

            var ret,id,error,i;
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
                            ret = store[findById(store, self.get("id"))];
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
                    ret.id = S.guid("note");
                    ret.time = new Date().toLocaleTimeString();
                    store.push(ret);
                    break;
                case 'delete':
                    id = self.get("id");
                    index = findById(store, id);
                    if (index > -1) {
                        store.splice(index, 1);
                    }
                    break;
                case 'update':
                    id = self.get("id");
                    index = findById(store, id);
                    if (index > -1) {
                        store[index] = self.toJSON();
                    }
                    break;
            }

            if (method != 'read' && window.localStorage) {
                window.localStorage.setItem(KEY, S.JSON.stringify(store));
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

    return sync;
}, {
    requires:['mvc']
});