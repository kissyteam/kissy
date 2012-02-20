/**
 * @fileOverview use and attach mod
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
(function (S, loader, utils, data) {

    if (typeof require !== 'undefined') {
        return;
    }

    var LOADED = data.LOADED,
        ATTACHED = data.ATTACHED;

    S.mix(loader,
        /**
         * @lends KISSY
         */
        {
            /**
             * Start load specific mods, and fire callback when these mods and requires are attached.
             * @example
             * <code>
             * S.use('mod-name', callback, config);
             * S.use('mod1,mod2', callback, config);
             * </code>
             * @param {String|String[]} modNames names of mods to be loaded,if string then separated by space
             * @param {Function} callback callback when modNames are all loaded,
             *                   with KISSY as first argument and mod's value as the following argumwnts
             * @param {Object} cfg special config for this use
             */
            use:function (modNames, callback, cfg) {

                modNames = utils.normalizeModNamesInUse(modNames);

                cfg = cfg || {};

                var self = this,
                    fired;

                // 已经全部 attached, 直接执行回调即可
                if (utils.isAttached(self, modNames)) {
                    var mods = utils.getModules(self, modNames);
                    callback && callback.apply(self, mods);
                    return;
                }

                // 有尚未 attached 的模块
                S.each(modNames, function (modName) {
                    // 从 name 开始调用，防止不存在模块
                    self.__attachModByName(modName, function () {
                        if (!fired &&
                            utils.isAttached(self, modNames)) {
                            fired = true;
                            var mods = utils.getModules(self, modNames);
                            callback && callback.apply(self, mods);
                        }
                    }, cfg);
                });

                return self;
            },

            /**
             * get module's value defined by define function
             * @param {string} moduleName
             * @private
             */
            require:function (moduleName) {
                var self = this,
                    mods = self.Env.mods,
                    mod = mods[moduleName],
                    re = self['onRequire'] && self['onRequire'](mod);
                if (re !== undefined) {
                    return re;
                }
                return mod && mod.value;
            },

            // 加载指定模块名模块，如果不存在定义默认定义为内部模块
            __attachModByName:function (modName, callback, cfg) {

                utils.generateModulePath(this, modName);

                var self = this,
                    mod = self.Env.mods[modName];

                if (mod && mod.status === ATTACHED) {
                    callback();
                    return;
                }

                // 先从 global 里取
                if (cfg.global) {
                    self.__mixMod(modName, cfg.global);
                }

                self.__attach(mod, callback, cfg);
            },

            /**
             * Attach a module and all required modules.
             */
            __attach:function (mod, callback, cfg) {
                var self = this,
                    r,
                    rMod,
                    i,
                    attached = 0,
                    mods = self.Env.mods,
                    //复制一份当前的依赖项出来，防止 add 后修改！
                    requires = (mod['requires'] || []).concat();

                mod['requires'] = requires;

                /**
                 * check cyclic dependency between mods
                 * @private
                 */
                function cyclicCheck() {
                    var __allRequires,
                        myName = mod.name,
                        r, r2, rmod,
                        r__allRequires,
                        requires = mod.requires;
                    // one mod's all requires mods to run its callback
                    __allRequires = mod.__allRequires = mod.__allRequires || {};
                    for (var i = 0; i < requires.length; i++) {
                        r = requires[i];
                        rmod = mods[r];
                        __allRequires[r] = 1;
                        if (rmod && (r__allRequires = rmod.__allRequires)) {
                            for (r2 in r__allRequires) {
                                if (r__allRequires.hasOwnProperty(r2)) {
                                    __allRequires[r2] = 1;
                                }
                            }
                        }
                    }
                    if (__allRequires[myName]) {
                        var t = [];
                        for (r in __allRequires) {
                            if (__allRequires.hasOwnProperty(r)) {
                                t.push(r);
                            }
                        }
                        S.error("find cyclic dependency by mod " + myName + " between mods : " + t.join(","));
                    }
                }

                if (S.Config.debug) {
                    cyclicCheck();
                }

                // attach all required modules
                for (i = 0; i < requires.length; i++) {
                    r = requires[i] = utils.normalDepModuleName(mod.name, requires[i]);
                    rMod = mods[r];
                    if (rMod && rMod.status === ATTACHED) {
                        //no need
                    } else {
                        self.__attachModByName(r, fn, cfg);
                    }
                }

                // load and attach this module
                self.__buildPath(mod, utils.getPackagePath(mod));

                self.__load(mod, function () {

                    // add 可能改了 config，这里重新取下
                    mod['requires'] = mod['requires'] || [];

                    var newRequires = mod['requires'],
                        needToLoad = [];

                    //本模块下载成功后串行下载 require
                    for (i = 0; i < newRequires.length; i++) {
                        r = newRequires[i] = utils.normalDepModuleName(mod.name, newRequires[i]);
                        var rMod = mods[r],
                            inA = S.inArray(r, requires);
                        //已经处理过了或将要处理
                        if (rMod &&
                            rMod.status === ATTACHED
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
                            self.__attachModByName(needToLoad[i], fn, cfg);
                        }
                    } else {
                        fn();
                    }
                }, cfg);

                function fn() {
                    if (!attached && utils.isAttached(self, mod['requires'])) {
                        if (mod.status === LOADED) {
                            utils.attachMod(self, mod);
                        }
                        if (mod.status === ATTACHED) {
                            attached = 1;
                            callback();
                        }
                    }
                }
            }
        });
})(KISSY, KISSY.__loader, KISSY.__loaderUtils, KISSY.__loaderData);