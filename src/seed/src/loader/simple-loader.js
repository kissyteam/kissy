/**
 * simple loader for KISSY. one module on request.
 * @ignore
 * @author yiminghe@gmail.com
 */
(function (S, undefined) {

    var Loader, Status, Utils, UA,
    // standard browser 如果 add 没有模块名，模块定义先暂存这里
        currentMod = undefined,
    // ie 开始载入脚本的时间
        startLoadTime = 0,
    // ie6,7,8开始载入脚本对应的模块名
        startLoadModName,
        LOADING, LOADED, ERROR, ATTACHED;

    Loader = S.Loader;
    Status = Loader.Status;
    Utils = Loader.Utils;
    UA = S.UA;
    LOADING = Status.LOADING;
    LOADED = Status.LOADED;
    ERROR = Status.ERROR;
    ATTACHED = Status.ATTACHED;

    /**
     * @class KISSY.Loader.SimpleLoader
     * one module one request
     * @param runtime KISSY
     * @param waitingModules load checker
     * @private
     */
    function SimpleLoader(runtime, waitingModules) {
        S.mix(this, {
            runtime: runtime,
            requireLoadedMods: {},
            waitingModules: waitingModules
        });
    }

    S.augment(SimpleLoader, {

        use: function (normalizedModNames) {
            var i,
                l = normalizedModNames.length;
            for (i = 0; i < l; i++) {
                this.loadModule(normalizedModNames[i]);
            }
        },

        // only load mod requires once
        // prevent looping dependency sub tree more than once for one use()
        loadModRequires: function (mod) {
            // 根据每次 use 缓存子树
            var self = this,
                requireLoadedMods = self.requireLoadedMods,
                modName = mod.name,
                requires;
            if (!requireLoadedMods[modName]) {
                requireLoadedMods[modName] = 1;
                requires = mod.getNormalizedRequires();
                self.use(requires);
            }
        },

        loadModule: function (modName) {
            var self = this,
                waitingModules = self.waitingModules,
                runtime = self.runtime,
                status,
                isWait,
                mod = Utils.createModuleInfo(runtime, modName);

            status = mod.status;

            if (status == ATTACHED || status == ERROR) {
                return;
            }

            // 已经静态存在在页面上
            // 或者该模块不是根据自身模块名动态加载来的(io.js包含 io/base,io/form)
            if (status === LOADED) {
                self.loadModRequires(mod);
            } else {
                isWait = waitingModules.contains(modName);

                // prevent duplicate listen for this use
                //  use('a,a') or
                //  user('a,c') a require b, c require b
                // listen b only once
                // already waiting, will notify loadReady in the future
                if (isWait) {
                    return;
                }

                mod.addCallback(function () {
                    // 只在 LOADED 后加载依赖项一次
                    // 防止 config('modules') requires 和模块中 requires 不一致
                    self.loadModRequires(mod);
                    waitingModules.remove(modName);
                    // notify current loader instance
                    waitingModules.notifyAll();
                });

                waitingModules.add(modName);

                // in case parallel use (more than one use)
                if (status < LOADING) {
                    // load and attach this module
                    self.fetchModule(mod);
                }
            }
        },

        // Load a single module.
        fetchModule: function (mod) {

            var self = this,
                runtime = self.runtime,
                modName = mod.getName(),
                charset = mod.getCharset(),
                url = mod.getFullPath(),
                ie = UA.ie,
                isCss = mod.getType() == 'css';

            mod.status = LOADING;

            if (ie && !isCss) {
                startLoadModName = modName;
                startLoadTime = Number(+new Date());
            }

            S.getScript(url, {
                attrs: ie ? {
                    'data-mod-name': modName
                } : undefined,
                // syntaxError in all browser will trigger this
                // same as #111 : https://github.com/kissyteam/kissy/issues/111
                success: function () {

                    if (isCss) {
                        // css does not set LOADED because no add for css! must be set manually
                        Utils.registerModule(runtime, modName, S.noop);
                    } else {
                        // does not need this step for css
                        // standard browser(except ie9) fire load after KISSY.add immediately
                        if (currentMod) {
                            // S.log('standard browser get mod name after load : ' + modName);
                            Utils.registerModule(runtime,
                                modName, currentMod.fn,
                                currentMod.config);
                            currentMod = undefined;
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
                    var msg = 'load remote module: "' + modName +
                        '" from: "' + url + '"';
                    S.log(msg, 'info');
                } else {
                    // ie will call success even when getScript error(404)
                    _modError();
                }
                // notify all loader instance
                mod.notifyAll();
            }

            function _modError() {
                var msg = modName +
                    ' is not loaded! can not find module in path : ' +
                    url;
                S.log(msg, 'error');
                mod.status = ERROR;
            }

        }

    });

// ie 特有，找到当前正在交互的脚本，根据脚本名确定模块名
// 如果找不到，返回发送前那个脚本
    function findModuleNameByInteractive() {
        var scripts = S.Env.host.document.getElementsByTagName('script'),
            re,
            i,
            name,
            script;

        for (i = scripts.length - 1; i >= 0; i--) {
            script = scripts[i];
            if (script.readyState == 'interactive') {
                re = script;
                break;
            }
        }
        if (re) {
            name = re.getAttribute('data-mod-name');
        } else {
            // sometimes when read module file from cache,
            // interactive status is not triggered
            // module code is executed right after inserting into dom
            // i has to preserve module name before insert module script into dom,
            // then get it back here
            // S.log('can not find interactive script,time diff : ' + (+new Date() - self.__startLoadTime), 'error');
            // S.log('old_ie get mod name from cache : ' + self.__startLoadModName);
            name = startLoadModName;
        }
        return name;
    }

    SimpleLoader.add = function (name, fn, config, runtime) {
        if (typeof name === 'function') {
            config = fn;
            fn = name;
            if (UA.ie) {
                // http://groups.google.com/group/commonjs/browse_thread/thread/5a3358ece35e688e/43145ceccfb1dc02#43145ceccfb1dc02
                name = findModuleNameByInteractive();
                // S.log('ie get modName by interactive: ' + name);
                Utils.registerModule(runtime, name, fn, config);
                startLoadModName = null;
                startLoadTime = 0;
            } else {
                // 其他浏览器 onload 时，关联模块名与模块定义
                currentMod = {
                    fn: fn,
                    config: config
                };
            }
        }
    };

    Loader.SimpleLoader = SimpleLoader;

})(KISSY);

/*
 2013-06-04 yiminghe@gmail.com
 - refactor merge combo loader and simple loader
 - support error callback

 2012-10-08 yiminghe@gmail.com refactor
 - use 调用先统一 load 再统一 attach

 2012-09-20 yiminghe@gmail.com refactor
 - 参考 async 重构，去除递归回调
 */