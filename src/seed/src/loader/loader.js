/**
 * @ignore
 * mix loader into S and infer KISSY baseUrl if not set
 * @author yiminghe@gmail.com
 */
(function (S, undefined) {

    var Loader = KISSY.Loader,
        Env = S.Env,
        Utils = Loader.Utils,
        SimpleLoader = Loader.SimpleLoader,
        ComboLoader = Loader.ComboLoader;

    function WaitingModules(fn) {
        S.mix(this, {
            fn: fn,
            waitMods: {}
        });
    }

    WaitingModules.prototype = {

        constructor: WaitingModules,

        notifyAll: function () {
            var self = this,
                fn = self.fn;
            if (fn && S.isEmptyObject(self.waitMods)) {
                self.fn = null;
                fn();
            }
        },

        add: function (modName) {
            this.waitMods[modName] = 1;
        },

        remove: function (modName) {
            delete this.waitMods[modName];
        },

        contains: function (modName) {
            return this.waitMods[modName];
        }

    };

    Loader.WaitingModules = WaitingModules;

    S.mix(S, {
        /**
         * Registers a module with the KISSY global.
         * @param {String} name module name.
         * it must be set if combine is true in {@link KISSY#config}
         * @param {Function} fn module definition function that is used to return
         * this module value
         * @param {KISSY} fn.S KISSY global instance
         * @param {Object} [cfg] module optional config data
         * @param {String[]} cfg.requires this module's required module name list
         * @member KISSY
         *
         * for example:
         *      @example
         *      // dom module's definition
         *      KISSY.add('dom', function(S, xx){
             *          return {css: function(el, name, val){}};
             *      },{
             *          requires:['xx']
             *      });
         */
        add: function (name, fn, cfg) {
            if (typeof name == 'string') {
                Utils.registerModule(S, name, fn, cfg);
            } else {
                SimpleLoader.add(name, fn, cfg, S);
            }
        },
        /**
         * Attached one or more modules to global KISSY instance.
         * @param {String|String[]} modNames moduleNames. 1-n modules to bind(use comma to separate)
         * @param {Function} success callback function executed
         * when KISSY has the required functionality.
         * @param {KISSY} success.S KISSY instance
         * @param success.x... used module values
         * @member KISSY
         *
         * for example:
         *      @example
         *      // loads and attached overlay,dd and its dependencies
         *      KISSY.use('overlay,dd', function(S, Overlay){});
         */
        use: function (modNames, success) {
            var Config = S.Config,
                normalizedModNames,
                loader,
                error,
                sync,
                waitingModules = new WaitingModules(loadReady);

            if (S.isPlainObject(success)) {
                sync = success.sync;
                error = success.error;
                success = success.success;
            }

            modNames = Utils.getModNamesAsArray(modNames);
            modNames = Utils.normalizeModNamesWithAlias(S, modNames);

            normalizedModNames = Utils.unalias(S, modNames);

            function loadReady() {
                var errorList = [],
                    ret;
                ret = Utils.attachModsRecursively(normalizedModNames, S, undefined, errorList);
                if (ret) {
                    if (success) {
                        if (sync) {
                            success.apply(S, Utils.getModules(S, modNames));
                        } else {
                            // standalone error trace
                            setTimeout(function () {
                                success.apply(S, Utils.getModules(S, modNames));
                            }, 0);
                        }
                    }
                } else if (errorList.length) {
                    if (error) {
                        if (sync) {
                            error.apply(S, errorList);
                        } else {
                            setTimeout(function () {
                                error.apply(S, errorList);
                            }, 0);
                        }
                    }
                } else {
                    waitingModules.fn = loadReady;
                    loader.use(normalizedModNames);
                }
            }

            if (Config.combine && !S.UA.nodejs) {
                loader = new ComboLoader(S, waitingModules);
            } else {
                loader = new SimpleLoader(S, waitingModules);
            }

            // in case modules is loaded statically
            // synchronous check
            // but always async for loader
            if (sync) {
                waitingModules.notifyAll();
            } else {
                setTimeout(function () {
                    waitingModules.notifyAll();
                }, 0);
            }
            return S;
        },

        require: function (name) {
            return Utils.getModules(S,
                Utils.normalizeModNamesWithAlias(S, [name]))[1];
        }
    });

    function returnJson(s) {
        return (new Function('return ' + s))();
    }

    var baseReg = /^(.*)(seed|kissy)(?:-min)?\.js[^/]*/i,
        baseTestReg = /(seed|kissy)(?:-min)?\.js/i;

    function getBaseInfoFromOneScript(script) {
        // can not use KISSY.Uri
        // /??x.js,dom.js for tbcdn
        var src = script.src || '';
        if (!src.match(baseTestReg)) {
            return 0;
        }

        var baseInfo = script.getAttribute('data-config');

        if (baseInfo) {
            baseInfo = returnJson(baseInfo);
        } else {
            baseInfo = {};
        }

        var comboPrefix = baseInfo.comboPrefix = baseInfo.comboPrefix || '??';
        var comboSep = baseInfo.comboSep = baseInfo.comboSep || ',';

        var parts ,
            base,
            index = src.indexOf(comboPrefix);

        // no combo
        if (index == -1) {
            base = src.replace(baseReg, '$1');
        } else {
            base = src.substring(0, index);
            // a.tbcdn.cn??y.js, ie does not insert / after host
            // a.tbcdn.cn/combo? comboPrefix=/combo?
            if (base.charAt(base.length - 1) != '/') {
                base += '/';
            }
            parts = src.substring(index + comboPrefix.length).split(comboSep);
            S.each(parts, function (part) {
                if (part.match(baseTestReg)) {
                    base += part.replace(baseReg, '$1');
                    return false;
                }
                return undefined;
            });
        }

        return S.mix({
            base: base
        }, baseInfo);
    }

    /**
     * get base from seed.js
     * @return {Object} base for kissy
     * @ignore
     *
     * for example:
     *      @example
     *      http://a.tbcdn.cn/??s/kissy/x.y.z/seed-min.js,p/global/global.js
     *      note about custom combo rules, such as yui3:
     *      combo-prefix='combo?' combo-sep='&'
     */
    function getBaseInfo() {
        // get base from current script file path
        // notice: timestamp
        var scripts = Env.host.document.getElementsByTagName('script'),
            i,
            info;

        for (i = scripts.length - 1; i >= 0; i--) {
            if (info = getBaseInfoFromOneScript(scripts[i])) {
                return info;
            }
        }

        S.error('must load kissy by file name: seed.js or seed-min.js');
        return null;
    }

    if (S.UA.nodejs) {
        // nodejs: no tag
        S.config({
            charset: 'utf-8',
            base: __dirname.replace(/\\/g, '/').replace(/\/$/, '') + '/'
        });
    } else {
        // will transform base to absolute path
        S.config(S.mix({
            // 2k(2048) url length
            comboMaxUrlLength: 2000,
            // file limit number for a single combo url
            comboMaxFileNum: 40,
            charset: 'utf-8',
            tag: '@TIMESTAMP@'
        }, getBaseInfo()));
    }

    // Initializes loader.
    Env.mods = {}; // all added mods

})(KISSY);

/*
 2013-06-04 yiminghe@gmail.com
 - refactor merge combo loader and simple loader
 - support error callback
 */