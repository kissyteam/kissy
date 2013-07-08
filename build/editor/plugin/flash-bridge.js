﻿/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:51
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/flash-bridge
*/

/**
 * simplified flash bridge for yui swf
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/flash-bridge", function (S, SWF, Editor) {

    var instances = {};

    function FlashBridge(cfg) {
        this._init(cfg);
    }

    S.augment(FlashBridge, S.EventTarget, {
        _init: function (cfg) {
            var self = this,
                id = S.guid("flashbridge-"),
                callback = "KISSY.Editor.FlashBridge.EventHandler";
            cfg.id = id;
            cfg.attrs = cfg.attrs || {};
            cfg.params = cfg.params || {};
            var
                attrs = cfg.attrs,
                params = cfg.params,
                flashVars = params.flashVars = params.flashVars || {};

            S.mix(attrs, {
                //http://yiminghe.javaeye.com/blog/764872
                //firefox 必须使创建的flash以及容器可见，才会触发contentReady
                //默认给flash自身很大的宽高，容器小点就可以了，
                width: 1,
                height: 1
            }, false);
            //这几个要放在 param 里面，主要是允许 flash js沟通
            S.mix(params, {
                allowScriptAccess: 'always',
                allowNetworking: 'all',
                scale: 'noScale'
            }, false);
            S.mix(flashVars, {
                shareData: false,
                useCompression: false
            }, false);
            var swfCore = {
                YUISwfId: id,
                YUIBridgeCallback: callback
            };
            if (cfg.ajbridge) {
                swfCore = {
                    swfID: id,
                    jsEntry: callback
                };
            }
            S.mix(flashVars, swfCore);
            instances[id] = self;
            self.id = id;
            self.swf = new SWF(cfg);
            self._expose(cfg.methods);
        },
        _expose: function (methods) {
            var self = this;
            for (var i = 0; i < methods.length; i++) {
                var m = methods[i];
                (function (m) {
                    self[m] = function () {
                        return self._callSWF(m, S.makeArray(arguments));
                    };
                })(m);
            }
        },
        /**
         * Calls a specific function exposed by the SWF's ExternalInterface.
         * @param func {String} the name of the function to call
         * @param args {Array} the set of arguments to pass to the function.
         */
        _callSWF: function (func, args) {
            return this.swf.callSWF(func,args);
        },
        _eventHandler: function (event) {
            var self = this,
                type = event.type;

            if (type === 'log') {
                S.log(event.message);
            } else if (type) {
                self.fire(type, event);
            }
        },
        ready: function (fn) {
            var self = this;
            if (self._ready) {
                fn.call(this);
            } else {
                self.on("contentReady", fn);
            }
        },
        destroy: function () {
            this.swf.destroy();
            delete instances[this.id];
        }
    });

    FlashBridge.EventHandler = function (id, event) {
        S.log("flash fire event : " + event.type);
        var instance = instances[id];
        if (instance) {
            //防止ie同步触发事件，后面还没on呢，另外给 swf 喘息机会
            //否则同步后触发事件，立即调用swf方法会出错
            setTimeout(function () {
                instance._eventHandler.call(instance, event);
            }, 100);
        }
    };

    Editor.FlashBridge = FlashBridge;

    return FlashBridge;

}, {
    requires: ['swf', 'editor']
});

