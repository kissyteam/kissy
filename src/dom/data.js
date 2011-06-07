/**
 * @module  dom-data
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/data', function(S, DOM, undefined) {

    var win = window,
        EXPANDO = '_ks_data_' + S.now(), // 让每一份 kissy 的 expando 都不同
        dataCache = { },       // 存储 node 节点的 data
        winDataCache = { };    // 避免污染全局


    // The following elements throw uncatchable exceptions if you
    // attempt to add expando properties to them.
    var noData = {
    };
    noData['applet'] = 1;
    noData['object'] = 1;
    noData['embed'] = 1;

    var commonOps = {

        hasData:function(cache, name) {
            if (cache) {
                if (name !== undefined) {
                    if (name in cache) {
                        return true;
                    }
                } else if (!S.isEmptyObject(cache)) {
                    return true;
                }
            }
            return false;
        }
    };

    var objectOps = {
        hasData:function(ob, name) {
            if (ob == win) {
                return objectOps.hasData(winDataCache, name);
            }
            // 直接建立在对象内
            var thisCache = ob[EXPANDO];
            return commonOps.hasData(thisCache, name);
        },

        data:function(ob, name, value) {
            if (ob == win) {
                return objectOps.data(winDataCache, name, value);
            }
            var cache = ob[EXPANDO] = ob[EXPANDO] || {};
            if (value !== undefined) {
                cache[name] = value;
            } else {
                if (name !== undefined) {
                    return cache[name] === undefined ? null : cache[name];
                } else {
                    return cache;
                }
            }
        },
        removeData:function(ob, name) {
            if (ob == win) {
                return objectOps.removeData(winDataCache, name);
            }
            var cache = ob[EXPANDO];
            if (!cache) return;
            if (name !== undefined) {
                delete cache[name];
                if (S.isEmptyObject(cache)) {
                    objectOps.removeData(ob, undefined);
                }
            } else {
                delete ob[EXPANDO];
            }
        }
    };

    var domOps = {
        hasData:function(elem, name) {

            var key = elem[EXPANDO];
            if (!key) {
                return false;
            }
            var thisCache = dataCache[key];
            return commonOps.hasData(thisCache, name);
        },
        data:function(elem, name, value) {

            if (noData[elem.nodeName.toLowerCase()]) {
                return;
            }
            var key = elem[EXPANDO];
            if (!key) {
                key = elem[EXPANDO] = S.guid();
            }
            var cache = dataCache[key] = dataCache[key] || {};
            if (value !== undefined) {
                cache[name] = value;
            } else {
                if (name !== undefined) {
                    return cache[name] === undefined ? null : cache[name];
                } else {
                    return cache;
                }
            }
        },
        removeData:function(elem, name) {
            var key = elem[EXPANDO];
            if (!key) {
                return;
            }
            var cache = dataCache[key];
            if (!cache) {
                return;
            }
            if (name !== undefined) {
                delete cache[name];
                if (S.isEmptyObject(cache)) {
                    domOps.removeData(elem, undefined);
                }
            } else {
                delete dataCache[key];
                try {
                    delete elem[EXPANDO];
                } catch(e) {
                }
                if (elem.removeAttribute) {
                    elem.removeAttribute(EXPANDO);
                }
            }
        }
    };


    S.mix(DOM, {

            hasData:function(selector, name) {
                var ret = false;
                DOM.query(selector).each(function(elem) {
                    if (checkIsNode(elem)) {
                        ret = ret || domOps.hasData(elem, name);
                    } else {
                        ret = ret || objectOps.hasData(elem, name);
                    }
                });
                return ret;
            },

            /**
             * Store arbitrary data associated with the matched elements.
             */
            data: function(selector, name, data) {
                // suports hash
                if (S.isPlainObject(name)) {
                    for (var k in name) {
                        DOM.data(selector, k, name[k]);
                    }
                    return;
                }

                // getter
                if (data === undefined) {
                    var elem = DOM.get(selector);
                    if (checkIsNode(elem)) {
                        return domOps.data(elem, name, data);
                    } else {
                        return objectOps.data(elem, name, data);
                    }
                }
                // setter
                else {
                    DOM.query(selector).each(function(elem) {
                        if (checkIsNode(elem)) {
                            domOps.data(elem, name, data);
                        } else {
                            objectOps.data(elem, name, data);
                        }
                    });
                }
            },

            /**
             * Remove a previously-stored piece of data.
             */
            removeData: function(selector, name) {
                DOM.query(selector).each(function(elem) {
                    if (checkIsNode(elem)) {
                        domOps.removeData(elem, name);
                    } else {
                        objectOps.removeData(elem, name);
                    }
                });
            }
        });

    function checkIsNode(elem) {
        return elem && elem.nodeType;
    }

    return DOM;

}, {
        requires:["./base"]
    });
/**
 * 承玉：2011-05-31
 *  - 分层 ，节点和普通对象分开粗合理
 **/