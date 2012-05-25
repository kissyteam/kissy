/**
 * @fileOverview utils for kissy loader
 * @author yiminghe@gmail.com
 */
(function (S, undefined) {

    if (typeof require !== 'undefined') {
        return;
    }

    var Loader = S.Loader,
        ua = navigator.userAgent,
        startsWith = S.startsWith,
        data = Loader.STATUS,
        utils = {},
        host = S.Env.host,
        win = host,
        doc = host.document,
        loc = host.location,
    // 当前页面所在的目录
    // http://xx.com/y/z.htm#!/f/g
    // ->
    // http://xx.com/y/
        __pagePath = loc.href.replace(loc.hash, "").replace(/[^/]*$/i, "");

    // http://wiki.commonjs.org/wiki/Packages/Mappings/A
    // 如果模块名以 / 结尾，自动加 index
    function indexMap(s) {
        if (S.isArray(s)) {
            var ret = [];
            S.each(s, function (si) {
                ret.push(indexMap(si));
            });
            return ret;
        }
        return indexMapStr(s);
    }

    function indexMapStr(s) {
        if (/(.+\/)(\?t=.+)?$/.test(s)) {
            return RegExp.$1 + "index" + RegExp.$2;
        } else {
            return s
        }
    }

    function removeSuffixAndTagFromModName(modName) {
        var tag = undefined,
            m,
            withTagReg = /([^?]+)(?:\?t=(.+))/;

        if (m = modName.match(withTagReg)) {
            modName = m[1];
            tag = m[2];
        }

        // js do not need suffix
        modName = modName.replace(/\.js$/i, "");

        return {
            modName:modName,
            tag:tag
        };
    }


    function getPackageInfo(self, mod) {
        if (mod.packageInfo) {
            return mod.packageInfo;
        }

        var modName = mod.name,
            Config = self.Config,
            packages = Config.packages || {},
            pName = "",
            packageDesc;

        for (var p in packages) {
            if (packages.hasOwnProperty(p)) {
                if (S.startsWith(modName, p) &&
                    p.length > pName.length) {
                    pName = p;
                }
            }
        }

        packageDesc = packages[pName] || {
            // 无包，kissy 自身模块
            "__kissy":1
        };

        S.mix(packageDesc, {
            name:pName,
            tag:encodeURIComponent(Config.tag),
            path:Config.base,
            debug:Config.debug,
            charset:"utf-8"
        }, false);

        mod.packageInfo = packageDesc;

        return packageDesc;
    }

    S.mix(utils, {

        docHead:function () {
            return doc.getElementsByTagName('head')[0] || doc.documentElement;
        },

        isWebKit:!!ua.match(/AppleWebKit/),

        isGecko:!!ua.match(/Gecko/),

        isPresto:!!ua.match(/Presto/),

        IE:!!ua.match(/MSIE/),

        isCss:function (url) {
            return /\.css(?:\?|$)/i.test(url);
        },

        /**
         * resolve relative part of path
         * x/../y/z -> y/z
         * x/./y/z -> x/y/z
         * @param path uri path
         * @return {string} resolved path
         * @description similar to path.normalize in nodejs
         */
        normalizePath:function (path) {
            var paths = path.split("/"),
                re = [],
                p;
            for (var i = 0; i < paths.length; i++) {
                p = paths[i];
                if (p == ".") {
                } else if (p == "..") {
                    re.pop();
                } else {
                    re.push(p);
                }
            }
            return re.join("/");
        },

        /**
         * 根据当前模块以及依赖模块的相对路径，得到依赖模块的绝对路径
         * @param moduleName 当前模块
         * @param depName 依赖模块
         * @return {string|Array} 依赖模块的绝对路径
         * @description similar to path.resolve in nodejs
         */
        normalDepModuleName:function (moduleName, depName) {
            if (!depName) {
                return depName;
            }
            if (S.isArray(depName)) {
                for (var i = 0; i < depName.length; i++) {
                    depName[i] = utils.normalDepModuleName(moduleName, depName[i]);
                }
                return depName;
            }
            if (startsWith(depName, "../") || startsWith(depName, "./")) {
                var anchor = "", index;
                // x/y/z -> x/y/
                if ((index = moduleName.lastIndexOf("/")) != -1) {
                    anchor = moduleName.substring(0, index + 1);
                }
                return normalizePath(anchor + depName);
            } else if (depName.indexOf("./") != -1
                || depName.indexOf("../") != -1) {
                return normalizePath(depName);
            } else {
                return depName;
            }
        },

        //去除后缀名，要考虑时间戳!
        removePostfix:function (path) {
            return path.replace(/(-min)?\.js[^/]*$/i, "");
        },

        /**
         * 路径正则化，不能是相对地址
         * 相对地址则转换成相对页面的绝对地址
         * 用途:
         * package path 相对地址则相对于当前页面获取绝对地址
         */
        normalBasePath:function (path) {
            path = S.trim(path);

            // path 为空时，不能变成 "/"
            if (path &&
                path.charAt(path.length - 1) != '/') {
                path += "/";
            }

            /**
             * 一定要正则化，防止出现 ../ 等相对路径
             * 考虑本地路径
             */
            if (!path.match(/^(http(s)?)|(file):/i) &&
                !startsWith(path, "/")) {
                path = __pagePath + path;
            }

            if (startsWith(path, "/")) {
                var loc = win.location;
                path = loc.protocol + "//" + loc.host + path;
            }

            return normalizePath(path);
        },

        /**
         * 相对路径文件名转换为绝对路径
         * @param path
         */
        absoluteFilePath:function (path) {
            path = utils.normalBasePath(path);
            return path.substring(0, path.length - 1);
        },

        getPackageInfo:getPackageInfo,

        createModuleInfo:function (self, modName) {
            var info = removeSuffixAndTagFromModName(modName);

            modName = info.modName;

            var mods = self.Env.mods,
                t,
                mod = mods[modName];

            if (mod) {
                return mod;
            }

            if (!mod) {
                mods[modName] = mod = new Loader.Module();
                mod.name = modName;
            }

            if (info.tag) {
                mod.tag = info.tag;
            }

            var packageInfo = getPackageInfo(self, mod),
                path = defaultComponentJsName(modName, packageInfo);

            // 用户配置的 path优先
            S.mix(mod, {
                path:path,
                packageInfo:packageInfo
            }, false);

            mod.fullpath = utils.getMappedPath(self, packageInfo.path +
                mod.path + ((t = mod.getTag()) ? ("?t=" + t) : ""));

            return mod;
        },

        isAttached:function (self, modNames) {
            return isStatus(self, modNames, data.ATTACHED);
        },

        isLoaded:function (self, modNames) {
            return isStatus(self, modNames, data.LOADED);
        },

        getModules:function (self, modNames) {
            var mods = [self];

            S.each(modNames, function (modName) {
                if (!utils.isCss(modName)) {
                    mods.push(self.require(modName));
                }
            });

            return mods;
        },

        attachMod:function (self, mod) {

            if (mod.status != data.LOADED) {
                return;
            }

            var fn = mod.fn,
                value;

            // 需要解开 index，相对路径，去除 tag，但是需要保留 alias，防止值不对应
            mod.requires = utils.normalizeModNamesWithAlias(self, mod.requires, mod.name);

            if (fn) {
                if (S.isFunction(fn)) {
                    // context is mod info
                    value = fn.apply(mod, utils.getModules(self, mod.requires));
                } else {
                    value = fn;
                }
                mod.value = value;
            }

            mod.status = data.ATTACHED;

            self.getLoader().fire("afterModAttached", {
                mod:mod
            });
        },

        getModNamesAsArray:function (modNames) {
            if (S.isString(modNames)) {
                modNames = modNames.replace(/\s+/g, "").split(',');
            }
            return modNames;
        },


        indexMapStr:indexMapStr,

        /**
         * Three effects:
         * 1. add index : / => /index
         * 2. unalias : core => dom,event,ua
         * 3. relative to absolute : ./x => y/x
         * 4. create module info with tag : core.js?t=xx => core , tag=xx
         * @param {KISSY} self Global KISSY instance
         * @param {String|String[]} modNames Array of module names or module names string separated by comma
         */
        normalizeModNames:function (self, modNames, refModName, keepAlias) {
            var ret = [],
                mods = self['Env'].mods;
            S.each(modNames, function (name) {
                var alias, m;
                // 1. index map
                name = indexMap(name);
                // 2. un alias
                if (!keepAlias && (m = mods[name]) && (alias = m.alias)) {
                    ret.push.apply(ret, indexMap(alias));
                } else {
                    ret.push(name);
                }
            });
            // 3. relative to absolute (optional)
            if (refModName) {
                ret = utils.normalDepModuleName(refModName, ret);
            }
            // 4. create module info with tag
            S.each(ret, function (name, i) {
                ret[i] = utils.createModuleInfo(self, name).name;
            });
            return ret;
        },

        normalizeModNamesWithAlias:function (self, modNames, refModName) {
            return utils.normalizeModNames(self, modNames, refModName, 1);
        },

        // 注册模块，将模块和定义 factory 关联起来
        registerModule:function (self, name, fn, config) {
            var mods = self.Env.mods,
                mod = mods[name];

            if (mod && mod.fn) {
                S.log(name + " is defined more than once");
                return;
            }

            utils.createModuleInfo(self, name);

            mod = mods[name];

            // 注意：通过 S.add(name[, fn[, config]]) 注册的代码，无论是页面中的代码，
            // 还是 js 文件里的代码，add 执行时，都意味着该模块已经 LOADED
            S.mix(mod, { name:name, status:data.LOADED });


            mod.fn = fn;


            if (config && config.requires) {
                config.requires = utils.normalizeModNames(self, config.requires, name);
            }

            S.mix((mods[name] = mod), config);

            S.log(name + " is loaded");
        },

        /**
         * 只用来指定模块依赖信息. 注意：需要在 package 声明后 add ！
         * @param self
         * @param name
         * @param fn
         * @param config
         * @example
         * <code>
         *
         * KISSY.config({
         *  packages:[
         *      {
         *          name:"biz1",
         *          path:"haha"
         *      }
         *  ]
         * });
         *
         * KISSY.add({
         *   "biz1/main" : {
         *      requires:[ "biz1/part1" , "biz1/part2" ]
         *   }
         * });
         *
         * </code>
         */
        normAdd:function (self, name, fn, config) {
            var mods = self.Env.mods,
                o;

            // S.add(name, config) => S.add( { name: config } )
            if (S.isString(name) &&
                !config &&
                S.isPlainObject(fn)) {
                o = {};
                o[name] = fn;
                name = o;
            }

            // S.add( { name: config } )
            if (S.isPlainObject(name)) {
                S.each(name, function (modCfg, modName) {
                    modName = utils.indexMapStr(modName);
                    if (modCfg.requires) {
                        modCfg.requires =
                            utils.normalizeModNames(self, modCfg.requires, modName);
                    }
                    utils.createModuleInfo(self, modName);
                    S.mix(mods[modName], modCfg);
                });
                return true;
            }
        },

        getMappedPath:function (self, path) {
            var __mappedRules = self.Config.mappedRules || [];
            for (var i = 0; i < __mappedRules.length; i++) {
                var m, rule = __mappedRules[i];
                if (m = path.match(rule[0])) {
                    return path.replace(rule[0], rule[1]);
                }
            }
            return path;
        },

        /**
         * test3,test3/a/b => a/b
         */
        removePackageNameFromModName:function () {
            var cache = {};
            return function (packageName, modName) {
                if (!packageName) {
                    return modName;
                }
                if (!S.endsWith(packageName, "/")) {
                    packageName += "/";
                }
                var reg;
                if (!(reg = cache[packageName])) {
                    reg = cache[packageName] = new RegExp("^" + S.escapeRegExp(packageName));
                }
                return modName.replace(reg, "");
            }
        }()

    });

    function defaultComponentJsName(m, packageInfo) {
        var suffix = ".js",
            match;
        if (match = m.match(/(.+)(\.css)$/i)) {
            suffix = match[2];
            m = match[1];
        }
        var min = "-min";
        if (packageInfo.debug) {
            min = "";
        }
        return m + min + suffix;
    }

    function isStatus(self, modNames, status) {
        var mods = self.Env.mods,
            i;
        modNames = S.makeArray(modNames);
        for (i = 0; i < modNames.length; i++) {
            var mod = mods[modNames[i]];
            if (!mod || mod.status !== status) {
                return false;
            }
        }
        return true;
    }

    var normalizePath = utils.normalizePath;

    Loader.Utils = utils;

})(KISSY);