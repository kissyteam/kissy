/**
 * @module kissy
 * @author lifesinger@gmail.com, lijing00333@163.com
 */
(function(win, S, undefined) {

    var doc = win['document'],
        head = doc.getElementsByTagName('head')[0] || doc.documentElement,
        EMPTY = '',
        mix = S.mix,

        scriptOnload = doc.createElement('script').readyState ?
            function(node, callback) {
                node.onreadystatechange = function() {
                    var rs = node.readyState;
                    if (rs === 'loaded' || rs === 'complete') {
                        node.onreadystatechange = null;
                        callback.call(this);
                    }
                };
            } :
            function(node, callback) {
                node.onload = callback;
            },

        // css file
        RE_CSS = /\.css(?:\?|$)/i;

    S.mix(S, {

        _initLoader: function() {
            mix(this.Env, {
                mods: { },
                _loadQueue: [], // 所有需要加载的模块队列
                _uses: [], // use 的模块列表
                _used: [], // use 已经加载过的的模块列表
                _loaded_mods: [], // 用于存储已经加载的模块
                _loaded_array: [], // 用于存储加载模块的个数，判断是否加载完毕
                _combo_js: EMPTY, // combine js url
                _combo_css: EMPTY // combine css url
            });
        },

        /**
         * Registers a module.
         * @param name {String} module name
         * @param fn {Function} entry point into the module that is used to bind module to KISSY
         * @param config {Object}
         * <code>
         * KISSY.add('module-name', function(S){ }, requires: ['mod1']);
         * </code>
         * <code>
         * KISSY.add({
         *     'mod-name': {
         *         path: 'url',
         *         requires: ['mod1','mod2']
         *     }
         * });
         * </code>
         * @return {KISSY}
         */
        add: function(name, fn, config) {
            var self = this, Env = self.Env;

            if (S.isPlainObject(name)) {
                mix(Env.mods, name);
                return self;
            }

            // override mode
            Env.mods[name] = S.merge(Env.mods[name], { name: name, fn: fn }, config);

            // when a module is added to KISSY via S.add(),
            // u do not need use "S.use" to exec its callback function
            Env._uses.reverse().push(name); // TODO: 一定要 reverse ?
            Env._uses.reverse();

            // when a module is add to KISSY via S.add() after "domReady" event,
            // its callback function should be exec immediately
            //if (!(isReady && !afterReady) && self._requiresIsReady(name)) {
            fn(self);
            Env._used.push(name);
            //}

            // chain support
            return self;
        },

        /**
         * if all requires mods are loaded, return true
         * else return false
         */
        _requiresIsReady: function(mod) {
            var self = this, Env = self.Env,
                requires = Env.mods[mod].requires || [],
                i;

            for (i = requires.length - 1; i >= 0; i--) {
                if (!S.inArray(requires[i], Env._loaded_mods)) {
                    return false;
                }
            }
            return true;
        },

        /**
         * Load a JavaScript file from the server using a GET HTTP request, then execute it.
         */
        getScript: function(url, callback, charset) {
            var isCSS = RE_CSS.test(url),
                node = doc.createElement(isCSS ? 'link' : 'script');

            if (isCSS) {
                node.href = url;
                node.rel = 'stylesheet';
            } else {
                node.src = url;
                node.async = true;
            }
            if (charset) node.charset = charset;

            if (!isCSS && S.isFunction(callback)) {
                scriptOnload(node, callback);
            }

            head.insertBefore(node, head.firstChild);
            return S;
        }
    });

    // init KISSY
    S._init();

})(window, KISSY);

/**
 * NOTES:
 *
 * 2010/08
 *  - 重写 add, use, ready, 重新组织 add 的工作模式，添加 loader 功能。
 *  - 借鉴 YUI3 原生支持 loader, 但 YUI 的 loader 使用场景复杂，且多 loader 共存的场景
 *    在越复杂的程序中越推荐使用，在中等规模的 webpage 中，形同鸡肋，因此将 KISSY 全局对象
 *    包装成一个 loader，来统一管理页面所有的 modules.
 *  - loader 的使用一定要用 add 来配合，加载脚本过程中的三个状态（before domready,
 *    after domready & before KISSY callbacks' ready, after KISSY callbacks' ready）要明确区分。
 *  - 使用 add 和 ready 的基本思路和之前保持一致，即只要执行 add('mod-name', callback)，就
 *    会执行其中的 callback. callback 执行的时机由 loader 统一控制。
 *  - 支持 combo, 通过 KISSY.Config.combo = true 来开启，模块的 fullpath 用 path 代替。
 *  - KISSY 内部组件和开发者文件当做地位平等的模块处理，包括 combo.
 *
 */
