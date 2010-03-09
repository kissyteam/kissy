/**
 * KISSY.Editor 富文本编辑器
 * @module      editor
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy-core, yahoo-dom-event
 */
KISSY.add("editor", function(S) {

    /**
     * @constructor
     * @param {string|HTMLElement} textarea
     * @param {object} config
     */
    function Editor(textarea, config) {
        var E = Editor;
        // allow instantiation without the new operator
        if (!(this instanceof E)) {
            return new E(textarea, config);
        }

        if (!E._isReady) {
            E._setup();
        }
        return new E.Instance(textarea, config);
    }

    S.mix(Editor, {
        /**
         * 版本号
         */
        version: "1.0",

        /**
         * 语言配置，在 lang 目录添加
         */
        lang: {},

        /**
         * 所有注册的插件
         * 注：plugin = { name: pluginName, type: pluginType, init: initFn, ... }
         */
        plugins: {},

        /**
         * 全局环境变量
         */
        Env: {
            /**
             * 所有添加的模块
             * 注：mod = { name: modName, fn: initFn, details: {...} }
             */
            mods: { }
        },

        /**
         * 添加模块
         */
        add: function(name, fn, details) {

            this.Env.mods[name] = {
                name: name,
                fn: fn,
                details: details || {}
            };

            return this; // chain support
        },

        /**
         * 添加插件
         * @param {string|Array} name
         */
        addPlugin: function(name, p) {
            var arr = typeof name == "string" ? [name] : name,
                plugins = this.plugins,
                key, i, len;

            for (i = 0,len = arr.length; i < len; ++i) {
                key = arr[i];

                if (!plugins[key]) { // 不允许覆盖
                    plugins[key] = S.merge(p, {
                        name: key
                    });
                }
            }
        },

        /**
         * 是否已完成 setup
         */
        _isReady: false,

        /**
         * setup to use
         */
        _setup: function() {
            this._loadModules();
            this._isReady = true;
        },

        /**
         * 已加载的模块
         */
        _attached: { },

        /**
         * 加载注册的所有模块
         */
        _loadModules: function() {
            var mods = KISSY.Editor.Env.mods,
                attached = this._attached,
                name, m;

            for (name in mods) {
                m = mods[name];
                if (m) {
                    attached[name] = m;
                    if (m.fn) {
                        m.fn(this);
                    }
                }
                // 注意：m.details 暂时没用到，仅是预留的扩展接口
            }

            // TODO
            // lang 的加载可以延迟到实例化时，只加载当前 lang
        }
    });

    S.Editor = Editor;
});

// TODO
// 1. 自动替换页面中的 textarea ? 约定有特殊 class 的不替换
