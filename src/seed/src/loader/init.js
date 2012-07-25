/**
 * @fileOverview mix loader into S and infer KISSy baseUrl if not set
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
(function (S) {

    if (typeof require !== 'undefined') {
        return;
    }

    var Loader = S.Loader,
        utils = Loader.Utils,
        ComboLoader = S.Loader.Combo;

    S.mix(S,
        /**
         * @lends KISSY
         */
        {
            /**
             * Registers a module with the KISSY global.
             * @param {String} [name] module name.
             * it must be set if combine is true in {@link KISSY.config}
             * @param {Function} fn module definition function that is used to return
             * this module value
             * @param {KISSY} fn.S KISSY global instance
             * @param fn.x... this module's required modules' value
             * @param {Object} [cfg] module optional config data
             * @param {String[]} cfg.requires this module's required module name list
             * @example
             * // dom module's definition
             * <code>
             * KISSY.add("dom",function(S,UA){
             *  return { css:function(el,name,val){} };
             * },{
             *  requires:["ua"]
             * });
             * </code>
             */
            add:function (name, fn, cfg) {
                this.getLoader().add(name, fn, cfg);
            },
            /**
             * Attached one or more modules to global KISSY instance.
             * @param {String|String[]} names moduleNames. 1-n modules to bind(use comma to separate)
             * @param {Function} callback callback function executed
             * when KISSY has the required functionality.
             * @param {KISSY} callback.S KISSY instance
             * @param callback.x... used module values
             * @example
             * // loads and attached overlay,dd and its dependencies
             * KISSY.use("overlay,dd",function(S,Overlay){});
             */
            use:function (names, callback) {
                this.getLoader().use(names, callback);
            },
            /**
             * get KISSY 's loader instance
             * @returns {KISSY.Loader}
             */
            getLoader:function () {
                var self = this, env = self.Env;
                if (self.Config.combine) {
                    return env._comboLoader;
                } else {
                    return env._loader;
                }
            },
            /**
             * get module value defined by define function
             * @param {string} moduleName
             * @private
             */
            require:function (moduleName) {
                var self = this,
                    mods = self.Env.mods,
                    mod = mods[moduleName];
                return mod && mod.value;
            }
        });

    function returnJson(s) {
        return (new Function("return " + s))();
    }

    /**
     * get base from seed/kissy.js
     * @return base for kissy
     * @private
     * @example
     * <pre>
     *   http://a.tbcdn.cn/??s/kissy/1.4.0/seed-min.js,p/global/global.js
     *   note about custom combo rules, such as yui3:
     *   combo-prefix="combo?" combo-sep="&"
     * <pre>
     */
    function getBaseInfo() {
        // get base from current script file path
        // notice: timestamp
        var baseReg = /^(.*)(seed|kissy)(?:-min)?\.js[^/]*/i,
            baseTestReg = /(seed|kissy)(?:-min)?\.js/i,
            comboPrefix,
            comboSep,
            scripts = S.Env.host.document.getElementsByTagName('script'),
            script = scripts[scripts.length - 1],
            src = utils.resolveByPage(script.src).toString(),
            baseInfo = script.getAttribute("data-config");

        if (baseInfo) {
            baseInfo = returnJson(baseInfo);
        } else {
            baseInfo = {};
        }

        comboPrefix = baseInfo.comboPrefix = baseInfo.comboPrefix || '??';
        comboSep = baseInfo.comboSep = baseInfo.comboSep || ',';

        var parts ,
            base,
            index = src.indexOf(comboPrefix);

        // no combo
        if (index == -1) {
            base = src.replace(baseReg, '$1');
        } else {
            base = src.substring(0, index);
            parts = src.substring(index + comboPrefix.length).split(comboSep);
            S.each(parts, function (part) {
                if (part.match(baseTestReg)) {
                    base += part.replace(baseReg, '$1');
                    return false;
                }
            });
        }
        return S.mix({
            base:base,
            baseUri:new S.Uri(base)
        }, baseInfo);
    }

    S.config(S.mix({
        // 2k
        comboMaxUrlLength:2048,
        charset:'utf-8',
        tag:'@TIMESTAMP@'
    }, getBaseInfo()));

    /**
     * Initializes loader.
     */
    (function () {
        var env = S.Env;
        env.mods = env.mods || {}; // all added mods
        env._loader = new Loader(S);
        env._comboLoader = new ComboLoader(S);
    })();

})(KISSY);