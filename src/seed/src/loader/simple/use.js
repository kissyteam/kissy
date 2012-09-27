/**
 * @ignore
 * @fileOverview use and attach mod for kissy simple loader
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
(function (S) {

    var Loader = S.Loader,
        data = Loader.STATUS,
        utils = Loader.Utils,
        IE = utils.IE,
        LOADING = data.LOADING,
        LOADED = data.LOADED,
        ERROR = data.ERROR,
        ALL_REQUIRES = '__allRequires',
        CURRENT_MODULE = '__currentModule',
        ATTACHED = data.ATTACHED;

    function LoadChecker() {
        this.listeners = {};
        this.results = {};
    }

    LoadChecker.prototype = {

        addListener: function (fn, modName) {
            if (!(modName in this.listeners)) {
                this.listeners[modName] = fn;
                return 1;
            }
            return 0;
        },

        removeListener: function (modName) {
            this.listeners[modName] = null;
        },

        check: function () {
            var listeners = this.listeners, fn, keys = S.keys(listeners);
            S.each(keys, function (k) {
                if (fn = listeners[k]) {
                    fn();
                }
            });
        },

        inResult: function (modName) {
            return modName in this.results;
        }

    };


    S.augment(Loader, {
        /**
         * Start load specific mods, and fire callback when these mods and requires are attached.
         * @member KISSY.Loader
         *
         * for example:
         *      @example
         *      S.use('mod-name', callback);
         *      S.use('mod1,mod2', callback);
         *
         * @param {String|String[]} modNames names of mods to be loaded,if string then separated by space
         * @param {Function} callback callback when modNames are all loaded,
         * with KISSY as first argument and mod 's value as the following arguments
         */
        use: function (modNames, callback) {
            var self = this,
                callbackId = S.guid('callback'),
            // use simultaneously on one loader
                loadChecker = self.__loadChecker ||
                    (self.__loadChecker = new LoadChecker()),
                SS = self.SS;

            modNames = utils.getModNamesAsArray(modNames);
            modNames = utils.normalizeModNamesWithAlias(SS, modNames);

            var normalizedModNames = utils.unalias(SS, modNames);

            loadChecker.addListener(function () {
                var all = S.reduce(normalizedModNames, function (a, modName) {
                    return a && loadChecker.inResult(modName);
                }, 1);
                if (all) {
                    // prevent call duplication
                    loadChecker.removeListener(callbackId);
                    callback && callback.apply(SS, utils.getModules(SS, modNames));
                    callback = null;
                }
            }, callbackId);

            attachMods(self, normalizedModNames, loadChecker);

            return self;
        },

        clear: function () {
            this.__loadChecker = new LoadChecker();
        }
    });

    function attachMods(self, mods, loadChecker) {
        S.each(mods, function (m) {
            attachModByName(self, m, loadChecker);
        });
    }

    function attachModByName(self, modName, loadChecker) {

        var SS = self.SS,
            debug = S.Config.debug,
            mods = SS.Env.mods,
            mod;

        utils.createModuleInfo(SS, modName);
        mod = mods[modName];

        function ready() {

            if (mod.status == ATTACHED) {
                return 1;
            } else if (mod.status != LOADED) {
                return 0;
            }

            var requires = mod.getNormalizedRequires(),
                all = S.reduce(requires, function (a, r) {
                    return a && loadChecker.inResult(r)
                }, 1);

            if (all) {
                utils.attachMod(SS, mod);
                return 1;
            } else {
                return 0;
            }
        }

        function end() {
            if (ready()) {
                loadChecker.removeListener(modName);
                loadChecker.results[modName] = 1;
                // a module is ready, need to notify other modules globally
                // chain effect
                loadChecker.check();
                return 1;
            }
            return 0;
        }

        if (end()) {
            return;
        }

        if (loadChecker.addListener(end, modName)) {
            attachModRecursive(self, mod, loadChecker);
            if (debug) {
                cyclicCheck(SS, modName);
            }
        } else if (debug) {
            // this mod is already listened
            checkCyclicRecursive(SS, modName);
        }
    }

    function checkCyclicRecursive(SS, modName) {
        // S.log('checkCyclicRecursive :' + modName, 'warn');
        cyclicCheck(SS, modName);
        var mods = SS.Env.mods,
            requires = mods[modName].getNormalizedRequires();
        S.each(requires, function (r) {
            if (mods[r] && mods[r].status != ATTACHED) {
                checkCyclicRecursive(SS, r);
            }
        });
    }

    // Attach a module and all required modules.
    function attachModRecursive(self, mod, loadChecker) {

        var requires = mod.getNormalizedRequires();

        // attach all required modules
        attachMods(self, requires, loadChecker);

        if (mod.status < LOADING) {
            // load and attach this module
            loadModByScript(self, mod, loadChecker);
        }

    }

    // Load a single module.
    function loadModByScript(self, mod, loadChecker) {

        var SS = self.SS,
            modName = mod.getName(),
            charset = mod.getCharset(),
            url = mod.getFullPath(),
            isCss = mod.getType() == 'css';

        mod.status = LOADING;

        if (IE && !isCss) {
            self.__startLoadModuleName = modName;
            self.__startLoadTime = Number(+new Date());
        }

        S.getScript(url, {
            // syntaxError in all browser will trigger this
            // same as #111 : https://github.com/kissyteam/kissy/issues/111
            success: function () {
                if (isCss) {
                    // css does not set LOADED because no add for css! must be set manually
                    utils.registerModule(SS, modName, S.noop);
                } else {
                    var currentModule;
                    // does not need this step for css
                    // standard browser(except ie9) fire load after KISSY.add immediately
                    if (currentModule = self[CURRENT_MODULE]) {
                        S.log('standard browser get mod name after load : ' + modName);
                        utils.registerModule(SS,
                            modName, currentModule.fn,
                            currentModule.config);
                        self[CURRENT_MODULE] = null;
                    }
                }
                checkAndHandle();
            },
            error: checkAndHandle,
            // source:mod.name + '-init',
            charset: charset
        });

        function checkAndHandle() {
            if (mod.fn) {
                var requires = mod.getNormalizedRequires();

                if (requires.length) {
                    attachMods(self, requires, loadChecker);
                } else {
                    // a mod is loaded, need to check globally at least once
                    loadChecker.check();
                }
            } else {
                // ie will call success even when getScript error(404)
                _modError();
            }
        }

        function _modError() {
            S.log(modName + ' is not loaded! can not find module in path : ' + url, 'error');
            mod.status = ERROR;
        }

    }

    // check cyclic dependency between mods
    function cyclicCheck(SS, modName) {
        // one mod 's all requires mods to run its callback
        var mods = SS.Env.mods,
            mod = mods[modName],
            __allRequires = mod[ALL_REQUIRES] = mod[ALL_REQUIRES] || {},
            requires = mod.getNormalizedRequires(),
            myName = mod.name,
            rMod,
            r__allRequires;

        S.each(requires, function (r) {
            rMod = mods[r];
            __allRequires[r] = 1;
            if (rMod && (r__allRequires = rMod[ALL_REQUIRES])) {
                S.mix(__allRequires, r__allRequires);
            }
        });

        if (__allRequires[myName]) {
            S.log(__allRequires, 'error');
            var JSON = S.Env.host.JSON,
                error = '';
            if (JSON) {
                error = JSON.stringify(__allRequires);
            }
            S.error('find cyclic dependency by mod ' + myName + ' between mods: ' + error);
        }
    }
})(KISSY);

/*
 2012-09-20 yiminghe@gmail.com refactor
 - 参考 async 重构，去除递归回调

 TODO： 1.4 不兼容修改
 - 分离下载与 attach(执行) 过程
 - 下载阶段构建依赖树
 - use callback 统一 attach
 */