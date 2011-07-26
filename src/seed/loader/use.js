/**
 * use and attach mod
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
(function(S, loader, utils, data) {
    if ("require" in this) return;
    var win = S.__HOST,
        doc = win['document'],
        head = doc.getElementsByTagName('head')[0] || doc.documentElement,
        LOADED = data.LOADED,
        ATTACHED = data.ATTACHED;

    S.mix(loader, {
        /**
         * Start load specific mods, and fire callback when these mods and requires are attached.
         * <code>
         * S.use('mod-name', callback, config);
         * S.use('mod1,mod2', callback, config);
         * </code>
         */
        use: function(modNames, callback, cfg) {
            modNames = modNames.replace(/\s+/g, "").split(',');
            utils.indexMapping(modNames);
            cfg = cfg || {};

            var self = this,
                fired;
            //如果 use 指定了 global
            if (cfg.global) {
                self.__mixMods(cfg.global);
            }

            // 已经全部 attached, 直接执行回调即可
            if (self.__isAttached(modNames)) {
                var mods = self.__getModules(modNames);
                callback && callback.apply(self, mods);
                return;
            }

            // 有尚未 attached 的模块
            S.each(modNames, function(modName) {
                // 从 name 开始调用，防止不存在模块
                self.__attachModByName(modName, function() {
                    if (!fired && self.__isAttached(modNames)) {
                        fired = true;
                        var mods = self.__getModules(modNames);
                        callback && callback.apply(self, mods);
                    }
                }, cfg);
            });

            return self;
        },

        __getModules:function(modNames) {
            var self = this,
                mods = [self];
            S.each(modNames, function(modName) {
                if (!utils.isCss(modName)) {
                    mods.push(self.require(modName));
                }
            });
            return mods;
        },

        /**
         * get module's value defined by define function
         * @param {string} moduleName
         */
        require:function(moduleName) {
            var self = this,
                mods = self.Env.mods,
                mod = mods[moduleName],
                re = self['onRequire'] && self['onRequire'](mod);
            if (re !== undefined) {
                return re;
            }
            return mod && mod.value;
        },

        //加载指定模块名模块，如果不存在定义默认定义为内部模块
        __attachModByName: function(modName, callback, cfg) {

            var self = this,
                mods = self.Env.mods,
                mod = mods[modName];
            //没有模块定义
            if (!mod) {
                // 默认 js/css 名字
                // 不指定 .js 默认为 js
                // 指定为 css 载入 .css
                var componentJsName = self.Config['componentJsName'] || function(m) {
                    var suffix = "js";
                    if (/(.+)\.(js|css)$/i.test(m)) {
                        suffix = RegExp.$2;
                        m = RegExp.$1;
                    }
                    return m + '-min.' + suffix;
                },  path = S.isFunction(componentJsName) ?
                    //一个模块合并到了了另一个模块文件中去
                    componentJsName(self._combine(modName))
                    : componentJsName;
                mod = {
                    path:path,
                    charset: 'utf-8'
                };
                //添加模块定义
                mods[modName] = mod;
            }
            mod.name = modName;
            if (mod && mod.status === ATTACHED) {
                return;
            }

            self.__attach(mod, callback, cfg);
        },

        /**
         * Attach a module and all required modules.
         */
        __attach: function(mod, callback, cfg) {
            var self = this,
                mods = self.Env.mods,
                //复制一份当前的依赖项出来，防止add后修改！
                requires = (mod['requires'] || []).concat();
            mod['requires'] = requires;

            // attach all required modules
            S.each(requires, function(r, i, requires) {
                r = requires[i] = utils.normalDepModuleName(mod.name, r);
                var rMod = mods[r];
                if (rMod && rMod.status === ATTACHED) {
                    //no need
                } else {
                    self.__attachModByName(r, fn, cfg);
                }
            });


            // load and attach this module
            self.__buildPath(mod, self.__getPackagePath(mod));

            self.__load(mod, function() {

                // add 可能改了 config，这里重新取下
                mod['requires'] = mod['requires'] || [];

                var newRequires = mod['requires'];
                //var    optimize = [];

                //本模块下载成功后串行下载 require
                S.each(newRequires, function(r, i, newRequires) {
                    r = newRequires[i] = utils.normalDepModuleName(mod.name, r);
                    var rMod = mods[r],
                        inA = S.inArray(r, requires);
                    //已经处理过了或将要处理
                    if (rMod && rMod.status === ATTACHED
                        //已经正在处理了
                        || inA) {
                        //no need
                    } else {
                        //新增的依赖项
                        self.__attachModByName(r, fn, cfg);
                    }
                    /**
                     * 依赖项需要重新下载，最好和被依赖者一起 use
                     */
//                    if (!inA && (!rMod || rMod.status < LOADED)) {
//                        optimize.push(r);
//                    }
                });

//                if (optimize.length != 0) {
//                    optimize.unshift(mod.name);
//                    S.log(optimize + " : better to be used together", "warn");
//                }

                fn();
            }, cfg);

            var attached = false;

            function fn() {
                if (!attached && self.__isAttached(mod['requires'])) {

                    if (mod.status === LOADED) {
                        self.__attachMod(mod);
                    }
                    if (mod.status === ATTACHED) {
                        attached = true;
                        callback();
                    }
                }
            }
        },

        __attachMod: function(mod) {
            var self = this,
                defs = mod.fns;

            if (defs) {
                S.each(defs, function(def) {
                    var value;
                    if (S.isFunction(def)) {
                        value = def.apply(self, self.__getModules(mod['requires']));
                    } else {
                        value = def;
                    }
                    mod.value = mod.value || value;
                });
            }

            mod.status = ATTACHED;
        }
    });
})(KISSY, KISSY.__loader, KISSY.__loaderUtils, KISSY.__loaderData);