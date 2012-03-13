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

            modNames = utils.getModNamesAsArray(modNames);

            var self = this,
                SS = self.SS,
                normalizedModNames = utils.normalizeModNames(SS, modNames),
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
                self.__attachModByName(modName, function () {
                    currentIndex++;
                    if (currentIndex == count) {
                        var mods = utils.getModules(SS, modNames);
                        callback && callback.apply(SS, mods);
                    }
                });
            });

            return self;
        },
        __buildPath:function (mod, base) {
            var self = this,
                SS = self.SS,
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
                        ((t = mod.tag) ? ("?t=" + t) : ""));
                    mod[flag] = 1;
                }
            }
        },

        // 加载指定模块名模块，如果不存在定义默认定义为内部模块
        __attachModByName:function (modName, callback) {
            var self = this,
                SS = self.SS,
                mod = SS.Env.mods[modName];
            if (mod.status === ATTACHED) {
                callback();
                return;
            }
            self.__attach(mod, callback);
        },

        /**
         * Attach a module and all required modules.
         */
        __attach:function (mod, callback) {
            var self = this,
                SS = self.SS,
                r,
                rMod,
                i,
                attached = 0,
                mods = SS.Env.mods,
                //复制一份当前的依赖项出来，防止 add 后修改！
                requires = mod.requires = utils.normalizeModNames(SS, mod.requires, mod.name);

            /**
             * check cyclic dependency between mods
             * @private
             */
            function cyclicCheck() {
                // one mod's all requires mods to run its callback
                var __allRequires = mod.__allRequires = mod.__allRequires || {},
                    myName = mod.name,
                    rmod,
                    r__allRequires,
                    requires = mod.requires;

                S.each(requires, function (r) {
                    rmod = mods[r];
                    __allRequires[r] = 1;
                    if (rmod && (r__allRequires = rmod.__allRequires)) {
                        S.mix(__allRequires, r__allRequires);
                    }
                });

                if (__allRequires[myName]) {
                    S.log(__allRequires, "error");
                    var JSON=window.JSON;
                    S.error("find cyclic dependency by mod " +
                        myName + " between mods : " +(JSON && JSON.stringify(__allRequires)));

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
                    self.__attachModByName(r, fn);
                }
            }

            // load and attach this module
            self.__buildPath(mod, utils.getPackagePath(SS, mod));

            self.__load(mod, function () {

                // add 可能改了 config，这里重新取下
                var newRequires = mod.requires =
                    utils.normalizeModNames(SS, mod.requires, mod.name),
                    needToLoad = [];

                //本模块下载成功后串行下载 require
                for (i = 0; i < newRequires.length; i++) {
                    r = newRequires[i];
                    var rMod = mods[r],
                        inA = S.inArray(r, requires);
                    //已经处理过了或将要处理
                    if (rMod && rMod.status === ATTACHED
                        //已经正在处理了
                        || inA) {
                        //no need
                    } else {
                        //新增的依赖项
                        needToLoad.push(r);
                    }
                }

                if (needToLoad.length) {
                    for (i = 0; i < needToLoad.length; i++) {
                        self.__attachModByName(needToLoad[i], fn);
                    }
                } else {
                    fn();
                }
            });

            function fn() {
                if (!attached && utils.isAttached(SS, mod.requires)) {
                    if (mod.status === LOADED) {
                        utils.attachMod(SS, mod);
                    }
                    if (mod.status === ATTACHED) {
                        attached = 1;
                        callback();
                    }
                }
            }
        },

        /**
         * Load a single module.
         */
        __load:function (mod, callback) {

            var self = this,
                SS = self,
                cssfullpath,
                url = mod['fullpath'],
                isCss = utils.isCss(url),
                node = mod.domNode;

            mod.status = mod.status || INIT;

            // 1.20 兼容 1.1x 处理：加载 cssfullpath 配置的 css 文件
            // 仅发出请求，不做任何其它处理
            if (cssfullpath = mod["cssfullpath"]) {
                S.getScript(cssfullpath);
                mod["cssfullpath"] = mod.csspath = LOADED;
            }

            if (mod.status < LOADING && url) {
                mod.status = LOADING;
                if (IE && !isCss) {
                    self.__startLoadModuleName = mod.name;
                    self.__startLoadTime = Number(+new Date());
                }
                node = S.getScript(url, {
                    success:function () {
                        if (isCss) {
                        } else {
                            //载入 css 不需要这步了
                            //标准浏览器下：外部脚本执行后立即触发该脚本的 load 事件,ie9 还是不行
                            if (self.__currentModule) {
                                S.log("standard browser get modname after load : " + mod.name);
                                utils.registerModule(SS,
                                    mod.name, self.__currentModule.def,
                                    self.__currentModule.config);
                                self.__currentModule = null;
                            }
                            if (mod.fn) {
                            } else {
                                _modError();
                            }
                        }
                        _scriptOnComplete();
                    },
                    error:function () {
                        _modError();
                        _scriptOnComplete();
                    },
                    charset:mod.charset
                });
                mod.domNode = node;
            }
            // 已经在加载中，需要添加回调到 script onload 中
            // 注意：没有考虑 error 情形
            else if (mod.status === LOADING) {
                utils.scriptOnload(node, function () {
                    // 模块载入后，如果需要也要混入对应 global 上模块定义
                    _scriptOnComplete();
                });
            }
            // 是内嵌代码，或者已经 loaded
            else {
                callback();
            }

            function _modError() {
                S.log(mod.name + ' is not loaded! can not find module in path : ' + mod['fullpath'], 'error');
                mod.status = ERROR;
            }

            function _scriptOnComplete() {
                if (mod.status !== ERROR) {
                    // 注意：当多个模块依赖同一个下载中的模块A下，模块A仅需 attach 一次
                    // 因此要加上下面的 !== 判断，否则会出现重复 attach,
                    // 比如编辑器里动态加载时，被依赖的模块会重复
                    if (mod.status != ATTACHED) {
                        mod.status = LOADED;
                    }
                    callback();
                }
            }
        }
    });
})(KISSY);