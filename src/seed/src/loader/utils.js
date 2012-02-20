/**
 * @fileOverview utils for kissy loader
 * @author yiminghe@gmail.com
 */
(function (S, loader, utils, data) {
    if (typeof require !== 'undefined') {
        return;
    }
    var ua = navigator.userAgent, doc = document;
    S.mix(utils, {

        docHead:function () {
            return doc.getElementsByTagName('head')[0] || doc.documentElement;
        },

        isWebKit:!!ua.match(/AppleWebKit/),

        IE:!!ua.match(/MSIE/),

        isCss:function (url) {
            return /\.css(?:\?|$)/i.test(url);
        },

        isLinkNode:function (n) {
            return n.nodeName.toLowerCase() == 'link';
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
        normalDepModuleName:function normalDepModuleName(moduleName, depName) {
            if (!depName) {
                return depName;
            }
            if (S.isArray(depName)) {
                for (var i = 0; i < depName.length; i++) {
                    depName[i] = normalDepModuleName(moduleName, depName[i]);
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

        //去除后缀名，要考虑时间戳?
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
            if (path && path.charAt(path.length - 1) != '/') {
                path += "/";
            }

            /**
             * 一定要正则化，防止出现 ../ 等相对路径
             * 考虑本地路径
             */
            if (!path.match(/^(http(s)?)|(file):/i)
                && !startsWith(path, "/")) {
                path = loader.__pagePath + path;
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

        //http://wiki.commonjs.org/wiki/Packages/Mappings/A
        //如果模块名以 / 结尾，自动加 index
        indexMapping:function (names) {
            for (var i = 0; i < names.length; i++) {
                if (names[i].match(/\/$/)) {
                    names[i] += "index";
                }
            }
            return names;
        },

        getPackagePath:function (mod) {

            //缓存包路径，未申明的包的模块都到核心模块中找
            if (mod.packagepath) {
                return mod.packagepath;
            }

            var //一个模块合并到了另一个模块文件中去
                modName = mod.name,
                packages = S.Config.packages || {},
                pName = "",
                p_def;

            for (var p in packages) {
                if (packages.hasOwnProperty(p)) {
                    if (S.startsWith(modName, p) &&
                        p.length > pName) {
                        pName = p;
                    }
                }
            }

            p_def = packages[pName];

            mod.charset = p_def && p_def.charset || mod.charset;

            if (p_def) {
                mod.tag = p_def.tag;
            } else {
                // kissy 自身组件的事件戳后缀
                mod.tag = encodeURIComponent(S.Config.tag || S.buildTime);
            }

            return mod.packagepath = (p_def && p_def.path) || S.Config.base;
        },

        generateModulePath:function (self, modName) {
            var mods = self.Env.mods,
                mod = mods[modName];

            if (mod && mod.path && mod.charset) {
                return;
            }

            // 默认 js/css 名字
            // 不指定 .js 默认为 js
            // 指定为 css 载入 .css
            var componentJsName = self.Config['componentJsName'] ||
                function (m) {
                    var suffix = "js", match;
                    if (match = m.match(/(.+)\.(js|css)$/i)) {
                        suffix = match[2];
                        m = match[1];
                    }
                    return m + (S.Config.debug ? '' : '-min') + "." + suffix;
                },
                path = componentJsName(modName);

            // 用户配置的 path优先
            mod = S.mix({
                path:path,
                charset:'utf-8'
            }, mods[modName], true);

            //添加模块定义
            mods[modName] = mod;

            mod.name = modName;
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
            if (mod.status == data.ATTACHED) {
                return;
            }

            var fns = mod.fns;

            if (fns) {
                S.each(fns, function (fn) {
                    var value;
                    if (S.isFunction(fn)) {
                        value = fn.apply(self, utils.getModules(self, mod.requires));
                    } else {
                        value = fn;
                    }
                    mod.value = mod.value || value;
                });
            }

            mod.status = data.ATTACHED;
        },

        normalizeModNamesInUse:function (modNames) {
            if (S.isString(modNames)) {
                modNames = modNames.replace(/\s+/g, "").split(',');
            }
            utils.indexMapping(modNames);
            return modNames;
        },


        //注册模块，将模块和定义 factory 关联起来
        registerModule:function (self, name, def, config) {
            config = config || {};
            var mods = self.Env.mods,
                mod = mods[name] || {};

            // 注意：通过 S.add(name[, fn[, config]]) 注册的代码，无论是页面中的代码，
            // 还是 js 文件里的代码，add 执行时，都意味着该模块已经 LOADED
            S.mix(mod, { name:name, status:data.LOADED });

            if (mod.fns && mod.fns.length) {
                S.log(name + " is defined more than once");
                //S.error(name + " is defined more than once");
            }

            //支持 host，一个模块多个 add factory
            mod.fns = mod.fns || [];
            mod.fns.push(def);
            S.mix((mods[name] = mod), config);
        }

    });

    function isStatus(self, modNames, status) {
        var mods = self.Env.mods,
            ret = true;
        modNames = S.makeArray(modNames);
        S.each(modNames, function (name) {
            var mod = mods[name];
            if (!mod || mod.status !== status) {
                ret = false;
                return ret;
            }
        });
        return ret;
    }

    var startsWith = S.startsWith, normalizePath = utils.normalizePath;

})(KISSY, KISSY.__loader, KISSY.__loaderUtils, KISSY.__loaderData);