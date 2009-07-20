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
        if (!E._isLoaded) {
            // load modules
            E._load();
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
         */
        mods: {},

        /**
         * 已加载的模块
         */
        _attached: {},

        /**
         * 是否已完成模块的加载
         */
        _isLoaded: false,

        /**
         * 加载所有模块
         */
        _load: function() {
            var mods = this.mods,
                attached = this._attached,
                i, name, m;

            for (name in mods) {
                m = mods[name];

                if (!attached[name] && m) {
                    attached[name] = m;

                    if (m.fn) {
                        m.fn(this);
                    }
                }
            }

            this._isLoaded = true;

            // TODO
            // lang 的加载可以延迟到实例化时，只加载当前 lang
        },

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
        }
    });

})(KISSY.Editor);

// TODO
// 1. 自动替换页面中的 textarea ? 约定有特殊 class 的不替换
