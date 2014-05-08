/**
 * pool of xtemplate instances
 * @author yiminghe@gmail.com
 */
KISSY.add(function () {
    var cache = {};

    // reduce object allocation to reduce gc time!
    return {
        getInstance: function (tpl, config, Constructor) {
            var name = config.name;
            var ret;
            var nameCache = cache[name];
            if (nameCache && nameCache.length) {
                //console.log('from pool: '+name);
                ret = nameCache.pop();
                ret.config = config;
                return ret;
            }
            //console.log('escape pool: '+name);
            ret = new Constructor(tpl, config);
            ret.fromPool = 1;
            return ret;
        },

        hasInstance: function (name) {
            var nameCache = cache[name];
            return nameCache && nameCache.length;
        },

        getCache: function () {
            return cache;
        },

        recycle: function (instance) {
            if (instance.fromPool) {
                var name = instance.name;
                var nameCache;
                nameCache = cache[name] = cache[name] || [];
                //console.log('return pool: '+name);
                nameCache[nameCache.length] = instance;
            }
        }
    };
});