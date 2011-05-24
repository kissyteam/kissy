/**
 * @module  dom-data
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom/data', function(S, DOM, undefined) {

    var win = window,
        expando = '_ks_data_' + S.now(), // 让每一份 kissy 的 expando 都不同
        dataCache = { },       // 存储 node 节点的 data
        winDataCache = { },    // 避免污染全局

        // The following elements throw uncatchable exceptions if you
        // attempt to add expando properties to them.
        noData = {
        };

    noData['applet'] = 1;
    noData['object'] = 1;
    noData['embed'] = 1;


    S.mix(DOM, {


            hasData:function(selector, name) {
                var elem = DOM.get(selector),
                    isNode,
                    cache,
                    key,
                    thisCache;
                if (!elem ||
                    (elem.nodeName && noData[elem.nodeName.toLowerCase()])
                    ) {
                    return false;
                }
                if (elem == win) {
                    elem = winDataCache;
                }
                isNode = checkIsNode(elem);
                cache = isNode ? dataCache : elem;
                key = isNode ? elem[expando] : expando;
                thisCache = cache[key];
                if (thisCache) {
                    if (name !== undefined) {
                        if (name in thisCache) {
                            return true;
                        }
                    } else {
                        return true;
                    }
                }
                return false;
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
                    var elem = DOM.get(selector),
                        isNode,
                        cache,
                        key,
                        thisCache;

                    if (
                        !elem ||
                            (elem.nodeName && noData[elem.nodeName.toLowerCase()])
                        ) {
                        return null;
                    }

                    if (elem == win) elem = winDataCache;
                    isNode = checkIsNode(elem);

                    cache = isNode ? dataCache : elem;
                    key = isNode ? elem[expando] : expando;
                    thisCache = cache[key];
                    var ret = thisCache;
                    if (S.isString(name) && thisCache) {
                        ret = thisCache[name];
                    }
                    return ret === undefined ? null : ret;
                }
                // setter
                else {
                    DOM.query(selector).each(function(elem) {
                        if (!elem ||
                            (elem.nodeName && noData[elem.nodeName.toLowerCase()])
                            ) {
                            return;
                        }
                        if (elem == win) elem = winDataCache;

                        var cache = dataCache, key;

                        if (!checkIsNode(elem)) {
                            key = expando;
                            cache = elem;
                        }
                        else if (!(key = elem[expando])) {
                            key = elem[expando] = S.guid();
                        }

                        if (name && data !== undefined) {
                            if (!cache[key]) cache[key] = { };
                            cache[key][name] = data;
                        }
                    });
                }
            },

            /**
             * Remove a previously-stored piece of data.
             */
            removeData: function(selector, name) {
                DOM.query(selector).each(function(elem) {
                    if (!elem) return;
                    if (elem == win) elem = winDataCache;

                    var key, cache = dataCache, thisCache,
                        isNode = checkIsNode(elem);

                    if (!isNode) {
                        cache = elem;
                        key = expando;
                    } else {
                        key = elem[expando];
                    }

                    if (!key) return;
                    thisCache = cache[key];

                    // If we want to remove a specific section of the element's data
                    if (name) {
                        if (thisCache) {
                            delete thisCache[name];

                            // If we've removed all the data, remove the element's cache
                            if (S.isEmptyObject(thisCache)) {
                                DOM.removeData(elem);
                            }
                        }
                    }
                    // Otherwise, we want to remove all of the element's data
                    else {
                        if (!isNode) {
                            try {
                                delete elem[expando];
                            } catch(ex) {
                            }
                        } else if (elem.removeAttribute) {
                            elem.removeAttribute(expando);
                        }

                        // Completely remove the data cache
                        if (isNode) {
                            delete cache[key];
                        }
                    }
                });
            }
        });

    function checkIsNode(elem) {
        return elem && elem.nodeType;
    }

    if (1 > 2) {
        DOM.hasData();
    }
    return DOM;

}, {
        requires:["dom/base"]
    });
