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
        CURRENT_MODULE = '__currentModule',
        ATTACHED = data.ATTACHED;

    function LoadChecker(fn) {
        this.fn = fn;
        this.waitMods = {};
        this.requireLoadedMods = {};
    }

    LoadChecker.prototype = {

        check: function () {
            var self = this,
                waitMods = self.waitMods,
                fn = self.fn;
            if (fn && S.isEmptyObject(waitMods)) {
                fn();
                self.fn = null;
            }
        },

        addWaitMod: function (modName) {
            this.waitMods[modName] = 1;
        },

        removeWaitMod: function (modName) {
            delete this.waitMods[modName];
        },

        // only load mod requires once
        // prevent looping dependency tree more than once for one use()
        loadModRequires: function (loader, mod) {
            var requireLoadedMods = this.requireLoadedMods,
                modName = mod.name,
                requires;
            if (!requireLoadedMods[modName]) {
                requireLoadedMods[modName] = 1;
                requires = mod.getNormalizedRequires();
                loadModules(loader, requires, this);
            }
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
                normalizedModNames,
                loadChecker = new LoadChecker(loadReady),
                runtime = self.runtime;

            modNames = utils.getModNamesAsArray(modNames);
            modNames = utils.normalizeModNamesWithAlias(runtime, modNames);

            normalizedModNames = utils.unalias(runtime, modNames);

            function loadReady() {
                attachMods(normalizedModNames, runtime, []);
                callback && callback.apply(runtime, utils.getModules(runtime, modNames));
            }

            loadModules(self, normalizedModNames, loadChecker);

            // in case modules is loaded statically
            // synchronous check
            loadChecker.check();

            return self;
        },

        clear: function () {
        }
    });

    function attachMods(modNames, runtime, stack) {
        var i,
            l = modNames.length,
            stackDepth = stack.length;

        for (i = 0; i < l; i++) {
            attachMod(modNames[i], runtime, stack);
            stack.length = stackDepth;
        }
    }

    function attachMod(modName, runtime, stack) {
        var mods = runtime.Env.mods,
            m = mods[modName];
        if (m.status == ATTACHED) {
            return;
        }
        if (S.inArray(modName, stack)) {
            stack.push(modName);
            S.error('find cyclic dependency between mods: ' + stack);
            return;
        }
        stack.push(modName);
        attachMods(m.getNormalizedRequires(), runtime, stack);
        utils.attachMod(runtime, m);
    }

    function loadModules(self, modNames, loadChecker) {
        var i, l = modNames.length;
        for (i = 0; i < l; i++) {
            loadModule(self, modNames[i], loadChecker);
        }
    }

    function loadModule(self, modName, loadChecker) {
        var runtime = self.runtime,
            status,
            mods = runtime.Env.mods,
            mod = mods[modName];

        if (!mod) {
            utils.createModuleInfo(runtime, modName);
            mod = mods[modName];
        }

        status = mod.status;

        if (status == ATTACHED) {
            return;
        }

        // 只在 LOADED 后加载一次依赖项一次
        if (status === LOADED) {
            loadChecker.loadModRequires(self, mod);
        } else {
            // error or init or loading
            loadChecker.addWaitMod(modName);
            // parallel use
            if (status <= LOADING) {
                // load and attach this module
                fetchModule(self, mod, loadChecker);
            }
        }
    }

    // Load a single module.
    function fetchModule(self, mod, loadChecker) {

        var runtime = self.runtime,
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
                // parallel use
                if (mod.status == LOADING) {
                    if (isCss) {
                        // css does not set LOADED because no add for css! must be set manually
                        utils.registerModule(runtime, modName, S.noop);
                    } else {
                        var currentModule;
                        // does not need this step for css
                        // standard browser(except ie9) fire load after KISSY.add immediately
                        if (currentModule = self[CURRENT_MODULE]) {
                            S.log('standard browser get mod name after load : ' + modName);
                            utils.registerModule(runtime,
                                modName, currentModule.fn,
                                currentModule.config);
                            self[CURRENT_MODULE] = null;
                        }
                    }
                }
                checkHandler();
            },
            error: checkHandler,
            // source:mod.name + '-init',
            charset: charset
        });

        function checkHandler() {
            if (mod.fn) {
                loadChecker.loadModRequires(self, mod);
                loadChecker.removeWaitMod(modName);
                // a mod is loaded, need to check globally
                loadChecker.check();
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
})(KISSY);

/*
 2012-10-08 yiminghe@gmail.com refactor
 - use 调用先统一 load 再统一 attach

 2012-09-20 yiminghe@gmail.com refactor
 - 参考 async 重构，去除递归回调

 TODO： 1.4 不兼容修改
 - 分离下载与 attach(执行) 过程
 - 下载阶段构建依赖树
 - use callback 统一 attach
 */