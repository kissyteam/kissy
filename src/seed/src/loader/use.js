/**
 * @ignore
 * @fileOverview use and attach mod
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
(function (S) {
    if (S.Env.nodejs) {
        return;
    }

    var Loader = S.Loader,
        data = Loader.STATUS,
        utils = Loader.Utils,
        INIT = data.INIT,
        IE = utils.IE,
        win = S.Env.host,
        LOADING = data.LOADING,
        ERROR = data.ERROR,
        ALL_REQUIRES = '__allRequires',
        CURRENT_MODULE = '__currentModule',
        ATTACHED = data.ATTACHED;

    S.augment(Loader, {
        /**
         * Start load specific mods, and fire callback when these mods and requires are attached.
         * @member KISSY.Loader
         *
         * for example:
         *      @example
         *      S.use('mod-name', callback, config);
         *      S.use('mod1,mod2', callback, config);
         *
         * @param {String|String[]} modNames names of mods to be loaded,if string then separated by space
         * @param {Function} callback callback when modNames are all loaded,
         * with KISSY as first argument and mod's value as the following arguments
         */
        use: function (modNames, callback) {
            var self = this,
                SS = self.SS;

            modNames = utils.getModNamesAsArray(modNames);
            modNames = utils.normalizeModNamesWithAlias(SS, modNames);

            var normalizedModNames = utils.unalias(SS, modNames),
                count = normalizedModNames.length,
                currentIndex = 0;

            function end() {
                var mods = utils.getModules(SS, modNames);
                callback && callback.apply(SS, mods);
            }

            // 已经全部 attached, 直接执行回调即可
            if (utils.isAttached(SS, normalizedModNames)) {
                return end();
            }

            // 有尚未 attached 的模块
            S.each(normalizedModNames, function (modName) {
                // 从 name 开始调用，防止不存在模块
                attachModByName(self, modName, function () {
                    if ((++currentIndex) == count) {
                        end();
                    }
                });
            });

            return self;
        }
    });

    // 加载指定模块名模块，如果不存在定义默认定义为内部模块
    function attachModByName(self, modName, callback) {
        var SS = self.SS,
            mod;
        utils.createModuleInfo(SS, modName);
        mod = SS.Env.mods[modName];
        if (mod.status === ATTACHED) {
            callback();
            return;
        }
        attachModRecursive(self, mod, callback);
    }


    // Attach a module and all required modules.
    function attachModRecursive(self, mod, callback) {
        var SS = self.SS,
            r,
            rMod,
            i,
            callbackBeCalled = 0,
        // 最终有效的 require, add 处声明为准
            newRequires,
            mods = SS.Env.mods;

        // 复制一份当前的依赖项出来，防止 add 后修改！
        // 事先配置的 require ，同 newRequires 有区别
        var requires = utils.normalizeModNames(SS, mod.requires, mod.name);


        // check cyclic dependency between mods
        function cyclicCheck() {
            // one mod 's all requires mods to run its callback
            var __allRequires = mod[ALL_REQUIRES] = mod[ALL_REQUIRES] || {},
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
                var JSON = win.JSON,
                    error = '';
                if (JSON) {
                    error = JSON.stringify(__allRequires);
                }
                S.error('find cyclic dependency by mod ' + myName + ' between mods: ' + error);
            }
        }

        S.log(cyclicCheck());

        // attach all required modules
        for (i = 0; i < requires.length; i++) {
            r = requires[i];
            rMod = mods[r];
            if (rMod && rMod.status === ATTACHED) {
                //no need
            } else {
                attachModByName(self, r, fn);
            }
        }

        // load and attach this module
        loadModByScript(self, mod, function () {

            // KISSY.add 可能改了 config，这里重新取下
            newRequires = utils.normalizeModNames(SS, mod.requires, mod.name);

            var needToLoad = [];

            //本模块下载成功后串行下载 require
            for (i = 0; i < newRequires.length; i++) {
                var r = newRequires[i],
                    rMod = mods[r],
                    inA = S.inArray(r, requires);
                //已经处理过了或将要处理
                if (rMod &&
                    rMod.status === ATTACHED ||
                    //已经正在处理了
                    inA) {
                    //no need
                } else {
                    //新增的依赖项
                    needToLoad.push(r);
                }
            }

            if (needToLoad.length) {
                for (i = 0; i < needToLoad.length; i++) {
                    attachModByName(self, needToLoad[i], fn);
                }
            } else {
                fn();
            }
        });

        function fn() {
            if (
            // 前提条件，本模块 script onload 已经调用
            // ie 下 add 与 script onload 并不连续！！
            // attach 以 newRequires 为准
                newRequires &&
                    !callbackBeCalled &&
                    // 2012-03-16 by yiminghe@gmail.com
                    // add 与 onload ie 下不连续
                    // c 依赖 a
                    // a 模块 add 时进行 attach
                    // a add 后 c 模块 onload 触发
                    // 检测到 a 已经 attach 则调用该函数
                    // a onload 后又调用该函数则需要用 callbackBeCalled 来把门
                    utils.isAttached(SS, newRequires)) {

                utils.attachMod(SS, mod);

                if (mod.status == ATTACHED) {
                    callbackBeCalled = 1;
                    callback();
                }
            }
        }
    }


    // Load a single module.
    function loadModByScript(self, mod, callback) {
        var SS = self.SS,
            modName = mod.getName(),
            charset = mod.getCharset(),
            url = mod.getFullPath(),
            isCss = mod.getType() == 'css';

        mod.status = mod.status || INIT;

        if (mod.status < LOADING) {
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
                        // css 不会设置 LOADED! 必须外部设置
                        utils.registerModule(SS, modName, S.noop);
                    } else {
                        var currentModule;
                        // 载入 css 不需要这步了
                        // 标准浏览器下：外部脚本执行后立即触发该脚本的 load 事件,ie9 还是不行
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
        }
        // 已经在加载中，需要添加回调到 script onload 中
        // 注意：没有考虑 error 情形，只在第一次处理即可
        // 交给 getScript 排队
        else if (mod.status == LOADING) {
            S.getScript(url, {
                success: checkAndHandle,
                // source:mod.name + '-loading',
                charset: charset
            });
        }
        // loaded/attached/error
        else {
            checkAndHandle();
        }

        function checkAndHandle() {
            if (mod.fn) {
                callback();
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