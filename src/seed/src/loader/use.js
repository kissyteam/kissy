/**
 * @fileOverview use and attach mod
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
(function (S) {
    if (typeof require !== 'undefined') {
        return;
    }

    var Loader = S.Loader,
        data = Loader.STATUS,
        utils = Loader.Utils,
        INIT = data.INIT,
        IE = utils.IE,
        LOADING = data.LOADING,
        LOADED = data.LOADED,
        ERROR = data.ERROR,
        ATTACHED = data.ATTACHED;

    S.augment(Loader, {
        /**
         * Start load specific mods, and fire callback when these mods and requires are attached.
         * @example
         * <code>
         * S.use('mod-name', callback, config);
         * S.use('mod1,mod2', callback, config);
         * </code>
         * @param {String|String[]} modNames names of mods to be loaded,if string then separated by space
         * @param {Function} callback callback when modNames are all loaded,
         *                   with KISSY as first argument and mod's value as the following arguments
         */
        use:function (modNames, callback) {
            var self = this,
                SS = self.SS;

            modNames = utils.getModNamesAsArray(modNames);
            modNames = utils.normalizeModNamesWithAlias(SS,modNames);

            var normalizedModNames = utils.normalizeModNames(SS, modNames),
                count = normalizedModNames.length,
                currentIndex = 0;

            // 已经全部 attached, 直接执行回调即可
            if (utils.isAttached(SS, normalizedModNames)) {
                var mods = utils.getModules(SS, modNames);
                callback && callback.apply(SS, mods);
                return;
            }

            // 有尚未 attached 的模块
            S.each(normalizedModNames, function (modName) {
                // 从 name 开始调用，防止不存在模块
                attachModByName(self, modName, function () {
                    currentIndex++;
                    if (currentIndex == count) {
                        var mods = utils.getModules(SS, modNames);
                        callback && callback.apply(SS, mods);
                    }
                });
            });

            return self;
        }
    });


    function buildModPath(self, mod, base) {
        var SS = self.SS,
            Config = SS.Config;

        base = base || Config.base;

        build("fullpath", "path");

        if (mod["cssfullpath"] !== data.LOADED) {
            build("cssfullpath", "csspath");
        }

        function build(fullpath, path) {
            var flag = "__" + fullpath + "Ready",
                t,
                p = mod[fullpath],
                sp = mod[path];
            if (mod[flag]) {
                return;
            }
            if (!p && sp) {
                //如果是 ./ 或 ../ 则相对当前模块路径
                sp = mod[path] = utils.normalDepModuleName(mod.name, sp);
                p = base + sp;
            }
            // debug 模式下，加载非 min 版
            if (p) {
                mod[fullpath] = utils.getMappedPath(SS, p +
                    ((t = mod.getUrlTag()) ? ("?t=" + t) : ""));
                mod[flag] = 1;
            }
        }
    }

    // 加载指定模块名模块，如果不存在定义默认定义为内部模块
    function attachModByName(self, modName, callback) {
        var SS = self.SS,
            mod = SS.Env.mods[modName];
        if (mod.status === ATTACHED) {
            callback();
            return;
        }
        attachModRecursive(self, mod, callback);
    }


    /**
     * Attach a module and all required modules.
     */
    function attachModRecursive(self, mod, callback) {
        var SS = self.SS,
            r,
            rMod,
            i,
            callbackBeCalled = 0,
            // 最终有效的 require ，add 处声明为准
            newRequires,
            mods = SS.Env.mods;

        // 复制一份当前的依赖项出来，防止 add 后修改！
        // 事先配置的 require ，同 newRequires 有区别
        var requires = utils.normalizeModNames(SS, mod.requires, mod.name);

        /**
         * check cyclic dependency between mods
         * @private
         */
        function cyclicCheck() {
            // one mod's all requires mods to run its callback
            var __allRequires = mod.__allRequires = mod.__allRequires || {},
                myName = mod.name,
                rmod,
                r__allRequires;

            S.each(requires, function (r) {
                rmod = mods[r];
                __allRequires[r] = 1;
                if (rmod && (r__allRequires = rmod.__allRequires)) {
                    S.mix(__allRequires, r__allRequires);
                }
            });

            if (__allRequires[myName]) {
                S.log(__allRequires, "error");
                var JSON = window.JSON,
                    error = "";
                if (JSON) {
                    error = JSON.stringify(__allRequires);
                }
                S.error("find cyclic dependency by mod " + myName + " between mods : " + error);

            }
        }

        if (S.Config.debug) {
            cyclicCheck();
        }

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
        buildModPath(self, mod, utils.getPackagePath(SS, mod));

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
                if (mod.status == LOADED) {
                    utils.attachMod(SS, mod);
                }
                if (mod.status == ATTACHED) {
                    callbackBeCalled = 1;
                    callback();
                }
            }
        }
    }


    /**
     * Load a single module.
     */
    function loadModByScript(self, mod, callback) {
        var SS = self.SS,
            cssfullpath,
            url = mod['fullpath'],
            isCss = utils.isCss(url)

        mod.status = mod.status || INIT;

        // 1.20 兼容 1.1x 处理：加载 cssfullpath 配置的 css 文件
        // 仅发出请求，不做任何其它处理
        if (cssfullpath = mod["cssfullpath"]) {
            S.getScript(cssfullpath);
            mod["cssfullpath"] = mod.csspath = LOADED;
        }

        if (mod.status < LOADING) {
            mod.status = LOADING;
            if (IE && !isCss) {
                self.__startLoadModuleName = mod.name;
                self.__startLoadTime = Number(+new Date());
            }
            S.getScript(url, {
                // syntaxError in all browser will trigger this
                // same as #111 : https://github.com/kissyteam/kissy/issues/111
                success:function () {
                    if (!isCss) {
                        // 载入 css 不需要这步了
                        // 标准浏览器下：外部脚本执行后立即触发该脚本的 load 事件,ie9 还是不行
                        if (self.__currentModule) {
                            S.log("standard browser get modname after load : " + mod.name);
                            utils.registerModule(SS,
                                mod.name, self.__currentModule.def,
                                self.__currentModule.config);
                            self.__currentModule = null;
                        }
                    }
                    checkAndHandle();
                },
                error:checkAndHandle,
                // source:mod.name + "-init",
                charset:mod.charset
            });
        }
        // 已经在加载中，需要添加回调到 script onload 中
        // 注意：没有考虑 error 情形，只在第一次处理即可
        // 交给 getScript 排队
        else if (mod.status == LOADING) {
            S.getScript(url, {
                success:checkAndHandle,
                // source:mod.name + "-loading",
                charset:mod.charset
            });
        }
        // loaded/attached/error
        else {
            checkAndHandle();
        }

        function checkAndHandle() {
            if (isCss || mod.fn) {
                // css 不会设置 LOADED! 必须外部设置
                if (isCss && mod.status != ATTACHED) {
                    mod.status = LOADED;
                }
                callback();
            } else {
                // ie will call success even when getScript error(404)
                _modError();
            }
        }

        function _modError() {
            S.log(mod.name + ' is not loaded! can not find module in path : ' + mod['fullpath'], 'error');
            mod.status = ERROR;
        }
    }
})(KISSY);