/**
 * KISSY.Editor 富文本编辑器
 * editor.js
 * requires: yahoo-dom-event
 * @author lifesinger@gmail.com
 */

var KISSY = window.KISSY || {};

/**
 * @class Editor
 * @requires YAHOO.util.Dom
 * @requires YAHOO.util.Event
 * @constructor
 * @param {string|HTMLElement} textarea
 * @param {object} config
 */
KISSY.Editor = function(textarea, config) {
    var E = KISSY.Editor;

    if (!(this instanceof E)) {
        return new E(textarea, config);
    } else {
        if (!E._isReady) {
            E._setup();
        }
        return new E.Instance(textarea, config);
    }
};

(function(E) {
    var Lang = YAHOO.lang;

    Lang.augmentObject(E, {
        /**
         * 版本号
         */
        version: "0.1",

        /**
         * 语言配置，在 lang 目录添加
         */
        lang: {},

        /**
         * 所有添加的模块
         * 注：mod = { name: modName, fn: initFn, details: {...} }
         */
        mods: {},

        /**
         * 所有注册的插件
         * 注：plugin = { name: pluginName, type: pluginType, fn: responseFn, details: {...} }
         */
        plugins: {},

        /**
         * 添加模块
         */
        add: function(name, fn, details) {
            this.mods[name] = {
                name: name,
                fn: fn,
                details: details || {}
            };
            return this; // chain support
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
            this._initPlugins();

            this._isReady = true;
        },

        /**
         * 已加载的模块
         */
        _attached: {},

        /**
         * 加载注册的所有模块
         */
        _loadModules: function() {
            var mods = this.mods,
                    attached = this._attached,
                    name, m;

            for (name in mods) {
                m = mods[name];

                if (!attached[name] && m) {
                    attached[name] = m;

                    if (m.fn) {
                        m.fn(this);
                    }
                }
            }

            // TODO
            // lang 的加载可以延迟到实例化时，只加载当前 lang
        },

        /**
         * 初始化 plugins
         */
        _initPlugins: function() {
            var plugins = this.plugins,
                ret = {},
                name, arr, key, p, i, len;

            for(name in plugins) {
                p = plugins[name];
                if(!p) continue;

                arr = name.split(","); // 允许 name 为 "bold,italic,underline" 这种形式注册同类插件
                for(i = 0, len = arr.length; i < len; ++i) {
                    key = Lang.trim(arr[i]);
                    if(!ret[key]) { // 不允许覆盖
                        ret[key] = {
                            name    : key,
                            type    : p.type,
                            lang    : {},
                            domEl   : null,
                            fn      : p.fn || function() {},
                            init    : p.init || function() {},
                            details : p.details || {}
                        };
                    }
                }
            }
            this.plugins = ret;
        }
    });

})(KISSY.Editor);

// TODO
// 1. 自动替换页面中的 textarea ? 约定有特殊 class 的不替换
