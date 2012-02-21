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

    S.mix(S, {
        add:function (name, def, cfg) {
            var self = this;
            if (self.Config.combine) {
                self.__comboLoader.add(name, def, cfg);
            } else {
                self.__loader.add(name, def, cfg);
            }
        },
        use:function (names, fn) {
            var self = this;
            if (self.Config.combine) {
                self.__comboLoader.use(names, fn);
            } else {
                self.__loader.use(names, fn);
            }
        },
        /**
         * get module's value defined by define function
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


    // notice: timestamp
    var baseReg = /^(.*)(seed|kissy)(-aio)?(-min)?\.js[^/]*/i,
        baseTestReg = /(seed|kissy)(-aio)?(-min)?\.js/i;

    /**
     * get base from src
     * @param script script node
     * @return base for kissy
     * @example
     *   http://a.tbcdn.cn/s/kissy/1.1.6/??kissy-min.js,suggest/suggest-pkg-min.js
     *   http://a.tbcdn.cn/??s/kissy/1.1.6/kissy-min.js,s/kissy/1.1.5/suggest/suggest-pkg-min.js
     *   http://a.tbcdn.cn/??s/kissy/1.1.6/suggest/suggest-pkg-min.js,s/kissy/1.1.5/kissy-min.js
     *   http://a.tbcdn.cn/s/kissy/1.1.6/kissy-min.js?t=20101215.js
     * @notice custom combo rules, such as yui3:
     *  <script src="path/to/kissy" data-combo-prefix="combo?" data-combo-sep="&"></script>
     */
    function getBaseUrl(script) {
        var src = utils.absoluteFilePath(script.src),
            prefix = S.Config.comboPrefix = script.getAttribute('data-combo-prefix') || '??',
            sep = S.Config.comboSep = script.getAttribute('data-combo-sep') || ',',
            parts = src.split(sep),
            base,
            part0 = parts[0],
            index = part0.indexOf(prefix);

        // no combo
        if (index == -1) {
            base = src.replace(baseReg, '$1');
        } else {
            base = part0.substring(0, index);
            var part01 = part0.substring(index + 2, part0.length);
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
        return base;
    }

    /**
     * Initializes loader.
     */
    function initLoader() {
        var self = this;
        self.Env.mods = self.Env.mods || {}; // all added mods
        self.__loader = new Loader(self);
        self.__comboLoader = new ComboLoader(self);
    }

    // get base from current script file path
    var scripts = document.getElementsByTagName('script');

    S.config({
        base:getBaseUrl(scripts[scripts.length - 1])
    });

    // the default timeout for getScript
    S.Config.timeout = 10;

    S.Env._loadQueue = {}; // information for loading and loaded mods

    initLoader.call(S);

    // for S.app working properly
    S.__APP_MEMBERS.push("add", "use", "require");

    S.__APP_INIT_METHODS.push(initLoader);

})(KISSY);