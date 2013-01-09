/**
 * @ignore
 * use and attach mod for kissy simple loader
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
(function (S, undefined) {

    var Loader, data, utils, UA,
        remoteLoads = {},
        LOADING, LOADED, ERROR, ATTACHED;

    Loader = S.Loader;
    data = Loader.Status;
    utils = Loader.Utils;
    UA = S.UA;
    LOADING = data.LOADING;
    LOADED = data.LOADED;
    ERROR = data.ERROR;
    ATTACHED = data.ATTACHED;

    function LoadChecker(fn) {
        S.mix(this, {
            fn: fn,
            waitMods: {},
            requireLoadedMods: {}
        });
    }

    LoadChecker.prototype = {

        check: function () {
            var self = this,
                fn = self.fn;
            if (fn && S.isEmptyObject(self.waitMods)) {
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

        isModWait: function (modName) {
            return this.waitMods[modName];
        },

        // only load mod requires once
        // prevent looping dependency sub tree more than once for one use()
        loadModRequires: function (loader, mod) {
            // 根据每次 use 缓存子树
            var self = this,
                requireLoadedMods = self.requireLoadedMods,
                modName = mod.name,
                requires;
            if (!requireLoadedMods[modName]) {
                requireLoadedMods[modName] = 1;
                requires = mod.getNormalizedRequires();
                loadModules(loader, requires, self);
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
         * @param _forceSync internal use, do not set
         * @chainable
         */
        use: function (modNames, callback, /* for internal */_forceSync) {
            var self = this,
                normalizedModNames,
                loadChecker = new LoadChecker(loadReady),
                runtime = self.runtime;

            modNames = utils.getModNamesAsArray(modNames);
            modNames = utils.normalizeModNamesWithAlias(runtime, modNames);

            normalizedModNames = utils.unalias(runtime, modNames);

            function loadReady() {
                utils.attachModsRecursively(normalizedModNames, runtime);
                callback && callback.apply(runtime, utils.getModules(runtime, modNames));
            }

            loadModules(self, normalizedModNames, loadChecker);

            // in case modules is loaded statically
            // synchronous check
            // but always async for loader
            if (_forceSync) {
                loadChecker.check();
            } else {
                setTimeout(function () {
                    loadChecker.check();
                }, 0);
            }
            return self;
        }
    });

    function loadModules(self, modNames, loadChecker) {
        var i,
            l = modNames.length;
        for (i = 0; i < l; i++) {
            loadModule(self, modNames[i], loadChecker);
        }
    }

    function loadModule(self, modName, loadChecker) {
        var runtime = self.runtime,
            status,
            isWait,
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

        // 已经静态存在在页面上
        // 或者该模块不是根据自身模块名动态加载来的(ajax.js包含 ajax/base,ajax/form)
        if (status === LOADED) {
            loadChecker.loadModRequires(self, mod);
        } else {
            isWait = loadChecker.isModWait(modName);
            // prevent duplicate listen for this use
            //  use('a,a') or
            //  user('a,c') a require b, c require b
            // listen b only once
            // already waiting, will notify loadReady in the future
            if (isWait) {
                return;
            }
            // error or init or loading
            loadChecker.addWaitMod(modName);
            // in case parallel use (more than one use)
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
            currentModule = 0,
            ie = UA.ie,
            isCss = mod.getType() == 'css';

        mod.status = LOADING;

        if (ie && !isCss) {
            self.__startLoadModName = modName;
            self.__startLoadTime = Number(+new Date());
        }

        S.getScript(url, {
            attrs: ie ? {
                'data-mod-name': modName
            } : undefined,
            // syntaxError in all browser will trigger this
            // same as #111 : https://github.com/kissyteam/kissy/issues/111
            success: function () {
                // parallel use
                // 只设置第一个 use 处
                if (mod.status == LOADING) {
                    if (isCss) {
                        // css does not set LOADED because no add for css! must be set manually
                        utils.registerModule(runtime, modName, S.noop);
                    } else {
                        // does not need this step for css
                        // standard browser(except ie9) fire load after KISSY.add immediately
                        if (currentModule = self.__currentMod) {
                            // S.log('standard browser get mod name after load : ' + modName);
                            utils.registerModule(runtime,
                                modName, currentModule.fn,
                                currentModule.config);
                            self.__currentMod = null;
                        }
                    }
                }

                // nodejs is synchronous,
                // use('x,y')
                // need x,y filled into waitingMods first
                // x,y waiting -> x -> load -> y -> load -> check

                S.later(checkHandler);
            },
            error: checkHandler,
            // source:mod.name + '-init',
            charset: charset
        });

        function checkHandler() {
            if (mod.fn) {
                if (!remoteLoads[modName]) {
                    S.log('load remote module: "' + modName + '" from: "' + url + '"', 'info');
                    remoteLoads[modName] = 1;
                }
                // 只在 LOADED 后加载依赖项一次
                // 防止 config('modules') requires 和模块中 requires 不一致
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
 */