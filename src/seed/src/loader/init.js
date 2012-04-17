/**
 *  @fileOverview mix loader into S and infer KISSy baseUrl if not set
 *  @author  lifesinger@gmail.com,yiminghe@gmail.com
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
             * @param {Function} def module definition function that is used to return
             * this module value
             * @param {KISSY} def.S KISSY global instance
             * @param def.x... this module's required modules' value
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
            add:function (name, def, cfg) {
                this.getLoader().add(name, def, cfg);
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
             * get KISSY's loader instance
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

    /**
     * get base from seed/kissy.js
     * @return base for kissy
     * @private
     * @example
     * <pre>
     *   http://a.tbcdn.cn/s/kissy/1.1.6/??kissy-min.js,suggest/suggest-pkg-min.js
     *   http://a.tbcdn.cn/??s/kissy/1.1.6/kissy-min.js,s/kissy/1.1.5/suggest/suggest-pkg-min.js
     *   http://a.tbcdn.cn/??s/kissy/1.1.6/suggest/suggest-pkg-min.js,s/kissy/1.1.5/kissy-min.js
     *   http://a.tbcdn.cn/s/kissy/1.1.6/kissy-min.js?t=20101215.js
     *   note about custom combo rules, such as yui3:
     *   <script src="path/to/kissy" data-combo-prefix="combo?" data-combo-sep="&"></script>
     * <pre>
     */
    function getBaseInfo() {
        // get base from current script file path
        // notice: timestamp
        var baseReg = /^(.*)(seed|kissy)(-aio)?(-min)?\.js[^/]*/i,
            baseTestReg = /(seed|kissy)(-aio)?(-min)?\.js/i,
            scripts = S.Env.host.document.getElementsByTagName('script'),
            script = scripts[scripts.length - 1],
            src = utils.absoluteFilePath(script.src),
            comboPrefix = script.getAttribute('data-combo-prefix') || '??',
            comboSep = script.getAttribute('data-combo-sep') || ',',
            parts = src.split(comboSep),
            base,
            part0 = parts[0],
            part01,
            index = part0.indexOf(comboPrefix);

        // no combo
        if (index == -1) {
            base = src.replace(baseReg, '$1');
        } else {
            base = part0.substring(0, index);
            part01 = part0.substring(index + 2, part0.length);
            // combo first
            // notice use match better than test
            if (part01.match(baseTestReg)) {
                base += part01.replace(baseReg, '$1');
            }
            // combo after first
            else {
                S.each(parts, function (part) {
                    if (part.match(baseTestReg)) {
                        base += part.replace(baseReg, '$1');
                        return false;
                    }
                });
            }
        }
        return {
            base:base,
            comboPrefix:comboPrefix,
            comboSep:comboSep
        };
    }


    S.config(S.mix({
        // the default timeout for getScript
        timeout:10,
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