/**
 * @module loader
 * @author lifesinger@gmail.com, lijing00333@163.com
 */
(function(win, S) {

    var doc = win['document'],
        head = doc.getElementsByTagName('head')[0] || doc.documentElement,
        EMPTY = '',
        LOADING = 1, LOADED = 2, ATTACHED = 3,
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
                mods: {}
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
         *         fullpath: 'url',
         *         requires: ['mod1','mod2']
         *     }
         * });
         * </code>
         * @return {KISSY}
         */
        add: function(name, fn, config) {
            var self = this, mods = self.Env.mods;

            if (S.isPlainObject(name)) {
                mix(mods, name);
            } else {
                mods[name] = S.merge(mods[name], { name: name, fn: fn }, config);
            }

            return self;
        },

        /**
         * Start load specific mods, and fire callback when these mods and requires are attached.
         * <code>
         * S.use('mod-name', callback);
         * S.use('mod1,mod2', callback);
         * S.use('mod1+mod2,mod3', callback); // TODO
         * S.use('*', callback);
         * S.use('*+', callback);
         * </code>
         */
        use: function(modNames, callback) {
            modNames = modNames.replace(/\s+/g, EMPTY).split(',');

            var self = this, mods = self.Env.mods,
                i = 0, len = modNames.length, mod, fired;

            for (; i < len && (mod = mods[modNames[i++]]);) {
                self._attach(mod, function() {
                    if (!fired && self._isAttached(modNames)) {
                        fired = true;
                        callback(self);
                    }
                });
            }
        },

        /**
         * Attach a module and all required modules.
         */
        _attach: function(mod, callback) {
            var self = this, requires = mod.requires || [],
                i = 0, len = requires.length;

            // attach all required modules
            for (; i < len; i++) {
                self._attach(requires[i], fn);
            }

            // load this module
            S._load(mod, fn);

            function fn() {
                if (self._isAttached(requires)) {
                    if (mod.status != ATTACHED) {
                        if (mod.fn) mod.fn();
                        mod.status = ATTACHED;
                    }
                    callback();
                }
            }
        },

        _isAttached: function(modNames) {
            var mods = this.Env.mods, mod,
                i = (modNames = S.makeArray(modNames)).length - 1;

            for (; i >= 0 && (mod = mods[modNames[i]]); i--) {
                if (mod.status !== ATTACHED) return false;
            }

            return true;
        },

        /**
         * Load a single module.
         */
        _load: function(mod, callback) {
            var self = this;

            if ((mod.status || 0) < LOADING) {
                self.getScript(self._buildPath(mod), function() {
                    mod.status = LOADED;
                    callback();
                });
            }
        },

        _buildPath: function(mod) {
            return mod.fullpath;
            // TODO: base + path
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

            // TODO: timeout
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
