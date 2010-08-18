/**
 * @module loader
 * @author lifesinger@gmail.com, lijing00333@163.com
 */
(function(win, S, undefined) {

    var doc = win['document'],
        head = doc.getElementsByTagName('head')[0] || doc.documentElement,
        EMPTY = '',
        LOADING = 1, LOADED = 2, ERROR = 3, ATTACHED = 4,
        mix = S.mix,

        scriptOnload = doc.createElement('script').readyState ?
            function(node, callback) {
                var oldCallback = node.onreadystatechange;
                node.onreadystatechange = function() {
                    var rs = node.readyState;
                    if (rs === 'loaded' || rs === 'complete') {
                        node.onreadystatechange = null;
                        oldCallback && oldCallback();
                        callback.call(this);
                    }
                };
            } :
            function(node, callback) {
                var oldCallback = node.onload;
                node.onload = function() {
                    oldCallback && oldCallback();
                    callback();
                };
            },

        RE_CSS = /\.css(?:\?|$)/i,
        loader;

    loader = {

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
            var self = this, mods = self.Env.mods, mod, o;

            // S.add(name, config) => S.add( { name: config } )
            if (S.isString(name) && !config && S.isPlainObject(fn)) {
                o = {};
                o[name] = fn;
                name = o;
            }

            // S.add( { name: config } )
            if (S.isPlainObject(name)) {
                S.each(name, function(v, k) {
                    v.name = k;
                });
                mix(mods, name);
            }
            // S.add(name[, fn[, config]])
            else {
                // 处理子模块
                if(config && config.host) {
                    name = config.host;
                }

                // 注意：通过 S.add(name[, fn[, config]]) 注册的代码，无论是页面中的代码，还
                //      是 js 文件里的代码，add 执行时，都意味着该模块已经 LOADED
                mix((mod = mods[name] || { }), { name: name, status: LOADED });
                if(!mod.fns) mod.fns = [];
                fn && mod.fns.push(fn);
                mix((mods[name] = mod), config);

                // 对于 requires 都已 attached 的模块，比如 core 中的模块，直接 attach
                if (self._isAttached(mod.requires)) {
                    self._attachMod(mod);
                }
            }

            return self;
        },

        /**
         * Start load specific mods, and fire callback when these mods and requires are attached.
         * <code>
         * S.use('mod-name', callback);
         * S.use('mod1,mod2', callback);
         * S.use('mod1+mod2,mod3', callback); 暂不实现
         * S.use('*', callback);  暂不实现
         * S.use('*+', callback); 暂不实现
         * </code>
         */
        use: function(modNames, callback) {
            modNames = modNames.replace(/\s+/g, EMPTY).split(',');

            var self = this, mods = self.Env.mods,
                i = 0, len = modNames.length, mod, fired;

            // 已经全部 attached, 直接执行回调即可
            if (self._isAttached(modNames)) {
                callback && callback(self);
                return;
            }

            // 有尚未 attached 的模块
            for (; i < len && (mod = mods[modNames[i++]]);) {
                if (mod.status === ATTACHED) continue;

                self._attach(mod, function() {
                    if (!fired && self._isAttached(modNames)) {
                        fired = true;
                        callback && callback(self);
                    }
                });
            }

            return self;
        },

        /**
         * Attach a module and all required modules.
         */
        _attach: function(mod, callback) {
            var self = this, requires = mod['requires'] || [],
                i = 0, len = requires.length;

            // attach all required modules
            for (; i < len; i++) {
                self._attach(self.Env.mods[requires[i]], fn);
            }

            // load and attach this module
            self._buildPath(mod);
            self._load(mod, fn);

            function fn() {
                if (self._isAttached(requires)) {
                    if (mod.status === LOADED) {
                        self._attachMod(mod);
                    }
                    if (mod.status === ATTACHED) {
                        callback();
                    }
                }
            }
        },

        _attachMod: function(mod) {
            var self = this;
            if (mod.fns) {
                S.each(mod.fns, function(fn) {
                    fn && fn(self);
                });
                mod.fns = undefined; // 保证 attach 过的方法只执行一次
                S.log(mod.name + '.status = attached');
            }
            mod.status = ATTACHED;
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
            var self = this, url = mod.fullpath,
                loadingQueque = self.Env._loadingQueue,
                node;

            if ((mod.status || 0) < LOADING && url) {
                mod.status = LOADING;

                loadingQueque[url] = self.getScript(url, {
                    success: function() {
                        S.log(mod.name + ' onload fired.', 'info');
                        _success();
                    },
                    error: function() {
                        mod.status = ERROR;
                        _final();
                    },
                    charset: mod.charset
                });
            }
            // 已经在加载中，需要添加回调到 script onload 中
            // 注意：没有考虑 error 情形
            else if (mod.status === LOADING && (node = loadingQueque[url])) {
                scriptOnload(node, _success);
            }
            // 是内嵌代码，或者已经 loaded
            else {
                mod.status = LOADED;
                callback();
            }

            function _success() {
                if (mod.status !== ERROR) {
                    mod.status = LOADED;
                    callback();
                }
                _final();
            }
            
            function _final() {
                loadingQueque[url] = undefined;
                delete loadingQueque.url;
            }
        },

        _buildPath: function(mod) {
            if (!mod.fullpath && mod['path']) {
                mod.fullpath = this.Config.base + mod['path'];
            }
            // debug 模式下，加载非 min 版
            if(mod.fullpath && this.Config.debug) {
                mod.fullpath = mod.fullpath.replace(/-min/g, '');
            }
        },

        /**
         * Load a JavaScript file from the server using a GET HTTP request, then execute it.
         * <code>
         *  getScript(url, success, charset);
         *  or
         *  getScript(url, {
         *      charset: string
         *      success: fn,
         *      error: fn,
         *      timeout: number
         *  });
         * </code>
         */
        getScript: function(url, success, charset) {
            var isCSS = RE_CSS.test(url),
                node = doc.createElement(isCSS ? 'link' : 'script'),
                config = success, error, timeout, timer;

            if (S.isPlainObject(config)) {
                success = config.success;
                error = config.error;
                timeout = config.timeout;
                charset = config.charset;
            }

            if (isCSS) {
                node.href = url;
                node.rel = 'stylesheet';
            } else {
                node.src = url;
                node.async = true;
            }
            if (charset) node.charset = charset;

            if (S.isFunction(success)) {
                if (isCSS) {
                    success.call(node);
                } else {
                    scriptOnload(node, function() {
                        if (timer) {
                            timer.cancel();
                            timer = undefined;
                        }
                        success.call(node);
                    });
                }
            }

            if (S.isFunction(error)) {
                timer = S.later(function() {
                    timer = undefined;
                    error();
                }, (timeout || this.Config.timeout) * 1000);
            }

            head.insertBefore(node, head.firstChild);
            return node;
        }
    };

    mix(S, loader);

    S.each(loader, function(v, k) {
        S._APP_MEMBERS.push(k);
    });

})(window, KISSY);

/**
 * TODO:
 *  - combo 实现
 *  - 使用场景和测试用例整理
 *
 *
 * NOTES:
 *
 * 2010/08/16 玉伯：
 *  - 基于拔赤的实现，重构。解耦 add/use 和 ready 的关系，简化实现代码。
 *  - 暂时去除 combo 支持，combo 由用户手工控制。
 *  - 支持 app 生成的多 loader.
 *
 * 2010/08/13 拔赤：
 *  - 重写 add, use, ready, 重新组织 add 的工作模式，添加 loader 功能。
 *  - 借鉴 YUI3 原生支持 loader, 但 YUI 的 loader 使用场景复杂，且多 loader 共存的场景
 *    在越复杂的程序中越推荐使用，在中等规模的 webpage 中，形同鸡肋，因此将 KISSY 全局对象
 *    包装成一个 loader，来统一管理页面所有的 modules.
 *  - loader 的使用一定要用 add 来配合，加载脚本过程中的三个状态（before domready,
 *    after domready & before KISSY callbacks' ready, after KISSY callbacks' ready）要明确区分。
 *  - 使用 add 和 ready 的基本思路和之前保持一致，即只要执行 add('mod-name', callback)，就
 *    会执行其中的 callback. callback 执行的时机由 loader 统一控制。
 *  - 支持 combo, 通过 Config.combo = true 来开启，模块的 fullpath 用 path 代替。
 *  - KISSY 内部组件和开发者文件当做地位平等的模块处理，包括 combo.
 *
 */
