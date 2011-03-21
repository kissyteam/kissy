/**
 * @module loader
 * @author lifesinger@gmail.com, lijing00333@163.com, yiminghe@gmail.com
 */
(function(S, undef) {
    //如果已经定义过，则不运行，例如 nodejs 环境下采用原生机制先行定义
    if (S.use) return;

    var win = S.__HOST,
        oldIE = !win['getSelection'] && win['ActiveXObject'],
        doc = win['document'],
        head = doc.getElementsByTagName('head')[0] || doc.documentElement,
        EMPTY = '',
        LOADING = 1,
        LOADED = 2,
        ERROR = 3,
        ATTACHED = 4,
        mix = S.mix,
        /**
         * ie 与标准浏览器监听 script 载入完毕有区别
         */
            scriptOnload = doc.createElement('script').readyState ?
            function(node, callback) {
                var oldCallback = node.onreadystatechange;
                node.onreadystatechange = function() {
                    var rs = node.readyState;
                    if (rs === 'loaded' || rs === 'complete') {
                        node.onreadystatechange = null;
                        oldCallback && oldCallback();
                        callback.call(this);
                    }
                };
            } :
            function(node, callback) {
                node.addEventListener('load', callback, false);
            },
        loader;

    /**
     * resolve relative part of path
     * x/../y/z -> y/z
     * x/./y/z -> x/y/z
     * @param path uri path
     * @return {string} resolved path
     * @description similar to path.normalize in nodejs
     */
    function normalizePath(path) {
        var paths = path.split("/");
        var re = [];
        for (var i = 0; i < paths.length; i++) {
            var p = paths[i];
            if (p == ".") {
            }
            else if (p == "..") {
                re.pop();
            }
            else {
                re.push(p);
            }

        }
        return re.join("/");
    }

    /**
     * 根据当前模块以及依赖模块的相对路径，得到依赖模块的绝对路径
     * @param moduleName 当前模块
     * @param depName 依赖模块
     * @return {string|Array} 依赖模块的绝对路径
     * @description similar to path.resolve in nodejs
     */
    function normalDepModuleName(moduleName, depName) {
        if (!depName) return depName;
        if (S.isArray(depName)) {
            for (var i = 0; i < depName.length; i++) {
                depName[i] = normalDepModuleName(moduleName, depName[i]);
            }
            return depName;
        }
        if (startsWith(depName, "../") || startsWith(depName, "./")) {
            var anchor = EMPTY,index;
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
    }

    //去除后缀名，要考虑时间戳?
    function removePostfix(path) {
        return path.replace(/(-min)?\.js[^/]*$/i, EMPTY);
    }

    //当前页面所在的目录
    // http://xx.com/y/z.htm
    // ->
    // http://xx.com/y/
    var pagePath = (function() {
        var url = location.href;
        return url.replace(/[^/]*$/i, EMPTY);
    })();

    //路径正则化，不能是相对地址
    //相对地址则转换成相对页面的绝对地址
    function normalBasePath(path) {
        if (path.charAt(path.length - 1) != '/')
            path += "/";
        path = S.trim(path);
        if (!path.match(/^(http(s)?)|(file):/i)
            && !startsWith(path, "/")) {
            path = pagePath + path;
        }
        return normalizePath(path);
    }

    //清楚时间戳
    function removeTimestamp(str) {
        return str.replace(/\?.*$/, "");
    }

    //http://wiki.commonjs.org/wiki/Packages/Mappings/A
    //如果模块名以 / 结尾，自动加 index
    function indexMapping(names) {
        for (var i = 0; i < names.length; i++) {
            if (names[i].match(/\/$/)) {
                names[i] += "index";
            }
        }
        return names;
    }


    loader = {


        //firefox,ie9,chrome 如果add没有模块名，模块定义先暂存这里
        __currentModule:null,

        //ie6,7,8开始载入脚本的时间
        __startLoadTime:0,

        //ie6,7,8开始载入脚本对应的模块名
        __startLoadModuleName:null,

        /**
         * Registers a module.
         * @param name {String} module name
         * @param def {Function|Object} entry point into the module that is used to bind module to KISSY
         * @param config {Object}
         * <code>
         * KISSY.add('module-name', function(S){ }, {requires: ['mod1']});
         * </code>
         * <code>
         * KISSY.add({
         *     'mod-name': {
         *         fullpath: 'url',
         *         requires: ['mod1','mod2']
         *     }
         * });
         * </code>
         * @return {KISSY}
         */
        add: function(name, def, config) {
            var self = this,
                mods = self.Env.mods,
                o;

            // S.add(name, config) => S.add( { name: config } )
            if (S['isString'](name)
                && !config
                && S.isPlainObject(def)) {
                o = {};
                o[name] = def;
                name = o;
            }

            // S.add( { name: config } )
            if (S.isPlainObject(name)) {
                S.each(name, function(v, k) {
                    v.name = k;
                    if (mods[k]) mix(v, mods[k], false); // 保留之前添加的配置
                });
                mix(mods, name);
                return self;
            }
            // S.add(name[, fn[, config]])
            if (S['isString'](name)) {

                var host;
                if (config && ( host = config.host )) {
                    var hostMod = mods[host];
                    if (!hostMod) {
                        S.error("module " + host + " can not be found !");
                        return self;
                    }
                    if (self.__isAttached(host)) {
                        def.call(self, self);
                    } else {
                        //该 host 模块纯虚！
                        hostMod.fns = hostMod.fns || [];
                        hostMod.fns.push(def);
                    }
                    return self;
                }

                self.__registerModule(name, def, config);
                //显示指定 add 不 attach
                if (config && config['attach'] === false) return self;
                // 和 1.1.7 以前版本保持兼容，不得已而为之
                var mod = mods[name];
                var requires = normalDepModuleName(name, mod.requires);
                if (self.__isAttached(requires)) {
                    //S.log(mod.name + " is attached when add !");
                    self.__attachMod(mod);
                }
                //调试用，为什么不在 add 时 attach
                else if (this.Config.debug && !mod) {
                    var i,modNames;
                    i = (modNames = S.makeArray(requires)).length - 1;
                    for (; i >= 0; i--) {
                        var requireName = removeTimestamp(modNames[i]);
                        var requireMod = mods[requireName] || {};
                        if (requireMod.status !== ATTACHED) {
                            S.log(mod.name + " not attached when added : depends " + requireName);
                        }
                    }
                }
                return self;
            }
            // S.add(fn,config);
            if (S.isFunction(name)) {
                config = def;
                def = name;
                if (oldIE) {
                    // 15 ms 内，从缓存读取的
                    if (((+new Date()) - self.__startLoadTime) < 15) {
                        S.log("old_ie 从缓存中读取");
                        if (name = self.__startLoadModuleName) {
                            self.__registerModule(name, def, config);
                        } else {
                            S.log("从缓存读取？？但是请求前记录没有模块名", "error");
                            S.error("从缓存读取？？但是请求前记录没有模块名");
                        }
                    } else {
                        S.log("old_ie 读取 interactiove 脚本地址");
                        name = self.__findModuleNameByInteractive();
                        self.__registerModule(name, def, config);
                    }
                    self.__startLoadModuleName = null;
                    self.__startLoadTime = 0;
                } else {
                    S.log("标准浏览器等load时再关联模块名");
                    // 其他浏览器 onload 时，关联模块名与模块定义
                    self.__currentModule = {
                        def:def,
                        config:config
                    };
                }

                return self;
            }

            S.error("invalid format for KISSY.add !");
            return self;
        },

        //ie 特有，找到当前正在交互的脚本，根据脚本名确定模块名
        __findModuleNameByInteractive:function() {
            var self = this,
                scripts = document.getElementsByTagName("script"),re;
            for (var i = 0; i < scripts.length; i++) {
                var script = scripts[i];
                if (script.readyState == "interactive") {
                    re = script;
                    break;
                }
            }
            if (!re) {
                S.log("找不到 interactive 状态的 script", "error");
                S.error("找不到 interactive 状态的 script");
            }
            var src = re.src;
            S.log("interactive src :" + src);

            //注意：模块名不包含后缀名以及参数，所以去除
            //系统模块去除系统路径
            if (src.lastIndexOf(self.Config.base, 0) == 0) {
                return removePostfix(src.substring(self.Config.base.length));
            }
            var packages = self.__packages;
            //外部模块去除包路径，得到模块名
            for (var p in packages) {
                if (!packages.hasOwnProperty(p)) continue;
                if (src.lastIndexOf(packages[p].path, 0) == 0) {
                    return removePostfix(src.substring(packages[p].path.length));
                }
            }

            S.log("interactive 状态的 script 没有对应包 ：" + src, "error");
            S.error("interactive 状态的 script 没有对应包 ：" + src);
            return undefined;
        },

        //注册模块，将模块和定义 factory 关联起来
        __registerModule:function(name, def, config) {
            config = config || {};
            var self = this,
                mods = self.Env.mods,
                mod = mods[name] || {};

            // 注意：通过 S.add(name[, fn[, config]]) 注册的代码，无论是页面中的代码，
            // 还是 js 文件里的代码，add 执行时，都意味着该模块已经 LOADED
            mix(mod, { name: name, status: LOADED });

            if (mod.fns && mod.fns.length) {
                S.log(name + " is defined more than once");
                //S.error(name + " is defined more than once");
            }

            //支持 host，一个模块多个 add factory
            mod.fns = mod.fns || [];
            mod.fns.push(def);
            mix((mods[name] = mod), config);
        },

        /**
         * 包声明
         * biz -> .
         * 表示遇到 biz/x
         * 在当前网页路径找 biz/x.js
         */
        _packages:function(cfgs) {
            var self = this,
                ps;
            ps = self.__packages = self.__packages || {};
            for (var i = 0; i < cfgs.length; i++) {
                var cfg = cfgs[i];
                ps[cfg.name] = cfg;
                if (cfg.path) {
                    //注意正则化
                    cfg.path = normalBasePath(cfg.path);
                }
            }
        },

        /**
         * compress 'from module' to 'to module'
         * {
         *   core:['dom','ua','event','node','json','ajax','anim','base','cookie']
         * }
         */
        _combine:function(from, to) {
            var self = this,cs;
            if (S['isObject'](from)) {
                S.each(from, function(v, k) {
                    S.each(v, function(v2) {
                        self._combine(v2, k);
                    });
                });
                return;
            }
            cs = self.__combines = self.__combines || {};
            if (to) {
                cs[from] = to;
            } else {
                return cs[from] || from;
            }
        },

        __mixMods: function(global) {
            var mods = this.Env.mods, gMods = global.Env.mods, name;
            for (name in gMods) {
                this.__mixMod(mods, gMods, name, global);
            }
        },

        __mixMod: function(mods, gMods, name, global) {
            var mod = mods[name] || {}, status = mod.status;

            S.mix(mod, S.clone(gMods[name]));

            // status 属于实例，当有值时，不能被覆盖。只有没有初始值时，才从 global 上继承
            if (status) mod.status = status;

            // 来自 global 的 mod, path 应该基于 global
            if (global) this.__buildPath(mod, global.Config.base);

            mods[name] = mod;
        },

        /**
         * Start load specific mods, and fire callback when these mods and requires are attached.
         * <code>
         * S.use('mod-name', callback, config);
         * S.use('mod1,mod2', callback, config);
         * </code>
         */
        use: function(modNames, callback, cfg) {

            modNames = modNames.replace(/\s+/g, EMPTY).split(',');
            indexMapping(modNames);
            cfg = cfg || {};
            var self = this,
                modName,
                i,
                len = modNames.length,
                fired;
            //如果 use 指定了 global
            if (cfg.global)self.__mixMods(cfg.global);

            // 已经全部 attached, 直接执行回调即可
            if (self.__isAttached(modNames)) {
                var mods = self.__getModules(modNames);
                callback && callback.apply(self, mods);
                return;
            }
            // 有尚未 attached 的模块
            for (i = 0; i < len && (modName = modNames[i]); i++) {
                // 从 name 开始调用，防止不存在模块
                self.__attachModByName(modName, function() {
                    if (!fired && self.__isAttached(modNames)) {
                        fired = true;
                        var mods = self.__getModules(modNames);
                        callback && callback.apply(self, mods);
                    }
                }, cfg);
            }
            return self;
        },

        __getModules:function(modNames) {
            var self = this,
                mods = [self];
            modNames = modNames || [];
            for (var i = 0; i < modNames.length; i++) {
                mods.push(self.require(modNames[i]));
            }
            return mods;
        },

        /**
         * get module's value defined by define function
         * @param {string} moduleName
         */
        require:function(moduleName) {
            var self = this,
                mods = self.Env.mods,
                mod = mods[removeTimestamp(moduleName)];
            var re = self['onRequire'] && self['onRequire'](mod);
            if (re !== undefined) return re;
            return mod && mod.value;
        },

        __getPackagePath:function(mod) {
            var self = this,
                //一个模块合并到了另一个模块文件中去
                modName = self._combine(mod.name),
                packages = self.__packages || {};
            var pName = "";
            for (var p in packages) {
                if (packages.hasOwnProperty(p)) {
                    if (startsWith(modName, p)) {
                        if (p.length > pName) {
                            pName = p;
                        }
                    }
                }
            }
            var p_def = packages[pName];
            var p_path = (p_def && p_def.path) || this.Config.base;
            if (p_def && p_def.charset) {
                mod.charset = p_def.charset;
            }
            return p_path;
        },

        //加载指定模块名模块，如果不存在定义默认定义为内部模块
        __attachModByName: function(modName, callback, cfg) {

            var self = this,
                mods = self.Env.mods;
            // x/y?t=2011
            // 注意模块名中带时间戳，用于强制下载最新模块文件
            var reg = /^([^?]+)(\?.*)?$/;
            reg.test(modName);
            modName = RegExp.$1;
            var tag = RegExp.$2;
            var mod = mods[modName];
            //没有模块定义
            if (!mod) {
                //默认js名字
                var componentJsName = self.Config['componentJsName'] || function(m, tag) {
                    return m + '-min.js' + (tag ? tag : '');
                },  jsPath = S.isFunction(componentJsName) ?
                    //一个模块合并到了了另一个模块文件中去
                    componentJsName(self._combine(modName), tag)
                    : componentJsName;
                mod = {
                    path:jsPath,
                    charset: 'utf-8'
                };
                //添加模块定义
                mods[modName] = mod;
            }
            mod.name = modName;
            if (mod && mod.status === ATTACHED) return;
            self.__attach(mod, callback, cfg);
        },

        /**
         * Attach a module and all required modules.
         */
        __attach: function(mod, callback, cfg) {
            var self = this,
                mods = self.Env.mods,
                //复制一份当前的依赖项出来，防止add后修改！
                requires = (mod['requires'] || []).concat(),
                i = 0,
                len = requires.length;
            mod['requires'] = requires;
            // attach all required modules
            for (; i < len; i++) {
                requires[i] = normalDepModuleName(mod.name,
                    requires[i]);
                var r = mods[removeTimestamp(requires[i])];
                if (r && r.status === ATTACHED) {
                    //no need
                } else {
                    self.__attachModByName(requires[i], fn, cfg);
                }
            }

            // load and attach this module
            self.__buildPath(mod, self.__getPackagePath(mod));

            self.__load(mod, function() {

                //标准浏览器下：外部脚本执行后立即触发该脚本的 load 事件
                if (self.__currentModule) {
                    self.__registerModule(mod.name, self.__currentModule.def,
                        self.__currentModule.config);
                    self.__currentModule = null;
                }

                // add 可能改了 config，这里重新取下
                var newRequires = mod['requires'] || [],optimize = [];
                mod['requires'] = newRequires;
                //本模块下载成功后串行下载 require
                for (var i = newRequires.length - 1; i >= 0; i--) {
                    newRequires[i] = normalDepModuleName(mod.name,
                        newRequires[i]);
                    var r = newRequires[i],
                        rmod = mods[removeTimestamp(r)],
                        inA = S.inArray(r, requires);
                    //已经处理过了或将要处理
                    if (rmod && rmod.status === ATTACHED
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
                    if (!inA && (!rmod || rmod.status < LOADED)) {
                        optimize.push(r);
                    }
                }
                if (optimize.length != 0) {
                    optimize.unshift(mod.name);
                    S.log(optimize + " : better to be used together", "warn");
                }
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
        },

        __isAttached: function(modNames) {
            var mods = this.Env.mods,
                mod,
                i = (modNames = S.makeArray(modNames)).length - 1;

            for (; i >= 0; i--) {
                var name = removeTimestamp(modNames[i]);
                mod = mods[name] || {};
                if (mod.status !== ATTACHED) return false;
            }

            return true;
        },

        /**
         * Load a single module.
         */
        __load: function(mod, callback, cfg) {
            var self = this,
                url = mod['fullpath'],
                //这个是全局的，防止多实例对同一模块的重复下载
                loadQueque = S.Env._loadQueue,
                node = loadQueque[url], ret;

            mod.status = mod.status || 0;

            // 可能已经由其它模块触发加载
            if (mod.status < LOADING && node) {
                mod.status = node.nodeName ? LOADING : LOADED;
            }

            if (mod.status < LOADING && url) {
                mod.status = LOADING;
                if (oldIE) {
                    self.__startLoadModuleName = mod.name;
                    self.__startLoadTime = Number(+new Date());
                }
                ret = self.getScript(url, {
                    success: function() {
                        S.log(mod.name + ' is loaded.', 'info'); // 压缩时不过滤该句，以方便线上调试
                        _success();
                    },
                    error: function() {
                        mod.status = ERROR;
                        _final();
                    },
                    charset: mod.charset
                });

                // css 是同步的，在 success 回调里，已经将 loadQueque[url] 置成 LOADED
                // 不需要再置成节点，否则有问题
                //if (!RE_CSS.test(url)) {
                loadQueque[url] = ret;
                //}
            }
            // 已经在加载中，需要添加回调到 script onload 中
            // 注意：没有考虑 error 情形
            else if (mod.status === LOADING) {
                scriptOnload(node, _success);
            }
            // 是内嵌代码，或者已经 loaded
            else {
                callback();
            }

            function _success() {
                _final();
                if (mod.status !== ERROR) {

                    // 对于动态下载下来的模块，loaded 后，global 上有可能更新 mods 信息，需要同步到 instance 上去
                    // 注意：要求 mod 对应的文件里，仅修改该 mod 信息
                    if (cfg.global) {
                        self.__mixMod(self.Env.mods, cfg.global.Env.mods, mod.name, cfg.global);
                    }

                    // 注意：当多个模块依赖同一个下载中的模块A下，模块A仅需 attach 一次
                    // 因此要加上下面的 !== 判断，否则会出现重复 attach, 比如编辑器里动态加载时，被依赖的模块会重复
                    if (mod.status !== ATTACHED) mod.status = LOADED;

                    callback();
                }
            }

            function _final() {
                loadQueque[url] = LOADED;
            }
        },

        __buildPath: function(mod, base) {
            var self = this,
                Config = self.Config,
                path = 'path',
                fullpath = 'fullpath';

            if (!mod[fullpath] && mod[path]) {
                mod[fullpath] = (base || Config.base) + mod[path];
            }
            // debug 模式下，加载非 min 版
            if (mod[fullpath] && Config.debug) {
                mod[fullpath] = mod[fullpath].replace(/-min/ig, EMPTY);
            }
        },

        /**
         * Load a JavaScript file from the server using a GET HTTP request, then execute it.
         * <code>
         *  getScript(url, success, charset);
         *  or
         *  getScript(url, {
         *      charset: string
         *      success: fn,
         *      error: fn,
         *      timeout: number
         *  });
         * </code>
         */
        getScript: function(url, success, charset) {
            var isCSS = /\.css(?:\?|$)/i.test(url),
                node = doc.createElement(isCSS ? 'link' : 'script'),
                config = success, error, timeout, timer;

            if (S.isPlainObject(config)) {
                success = config.success;
                error = config.error;
                timeout = config.timeout;
                charset = config.charset;
            }

            if (isCSS) {
                node.href = url;
                node.rel = 'stylesheet';
            } else {
                node.src = url;
                node.async = true;
            }
            if (charset) node.charset = charset;

            if (isCSS) {
                S.isFunction(success) && success.call(node);
            } else {
                scriptOnload(node, function() {
                    if (timer) {
                        timer.cancel();
                        timer = undef;
                    }

                    S.isFunction(success) && success.call(node);

                    // remove script
                    //if (head && node.parentNode) {
                    //    head.removeChild(node);
                    //}
                });
            }

            if (S.isFunction(error)) {
                timer = S.later(function() {
                    timer = undef;
                    error();
                }, (timeout || this.Config.timeout) * 1000);
            }

            head.insertBefore(node, head.firstChild);
            return node;
        }
    };

    mix(S, loader);

    /**
     * get base from src
     * @param src script source url
     * @return base for kissy
     * @example:
     *   http://a.tbcdn.cn/s/kissy/1.1.6/??kissy-min.js,suggest/suggest-pkg-min.js
     *   http://a.tbcdn.cn/??s/kissy/1.1.6/kissy-min.js,s/kissy/1.1.5/suggest/suggest-pkg-min.js
     *   http://a.tbcdn.cn/??s/kissy/1.1.6/suggest/suggest-pkg-min.js,s/kissy/1.1.5/kissy-min.js
     *   http://a.tbcdn.cn/s/kissy/1.1.6/kissy-min.js?t=20101215.js
     * @notice: custom combo rules, such as yui3:
     *  <script src="path/to/kissy" data-combo-prefix="combo?" data-combo-sep="&"></script>
     */
    // notice: timestamp
    var baseReg = /^(.*)(seed|kissy)(-min)?\.js[^/]*/i,
        baseTestReg = /(seed|kissy)(-min)?\.js/i;

    function getBaseUrl(script) {
        var src = script.src,
            prefix = script.getAttribute('data-combo-prefix') || '??',
            sep = script.getAttribute('data-combo-sep') || ',',
            parts = src.split(sep),
            base,
            part0 = parts[0],
            index = part0.indexOf(prefix);

        // no combo
        if (index == -1) {
            base = src.replace(baseReg, '$1');
        } else {
            base = part0.substring(0, index);
            var part01 = part0.substring(index + 2, part0.length);
            // combo first
            // notice use match better than test
            if (part01.match(baseTestReg)) {
                base += part01.replace(baseReg, '$1');
            }
            // combo after first
            else {
                for (var i = 1; i < parts.length; i++) {
                    var part = parts[i];
                    if (part.match(baseTestReg)) {
                        base += part.replace(baseReg, '$1');
                        break;
                    }
                }
            }
        }
        /**
         * 一定要正则化，防止出现 ../ 等相对路径
         * 考虑本地路径
         */
        if (!base.match(/^(http(s)?)|(file):/i)
            && !startsWith(base, "/")) {
            base = pagePath + base;
        }
        return base;
    }

    function startsWith(str, prefix) {
        return str.lastIndexOf(prefix, 0) == 0;
    }

    /**
     * Initializes loader.
     */
    S.__initLoader = function() {
        // get base from current script file path
        var self = this,
            scripts = doc.getElementsByTagName('script'),
            currentScript = scripts[scripts.length - 1],
            base = getBaseUrl(currentScript);

        self.Env.mods = {}; // all added mods
        self.Env._loadQueue = {}; // information for loading and loaded mods

        // don't override
        if (!self.Config.base) {
            self.Config.base = normalBasePath(base);
        }
        if (!self.Config.timeout) {
            self.Config.timeout = 10;
        }   // the default timeout for getScript
    };
    S.__initLoader();

    // for S.app working properly
    S.each(loader, function(v, k) {
        S.__APP_MEMBERS.push(k);
    });
    S.__APP_INIT_METHODS.push('__initLoader');

})(KISSY);

/**
 * 2011-01-04 chengyu<yiminghe@gmail.com> refactor:
 *
 * adopt requirejs :
 *
 * 1. packages(cfg) , cfg :{
 *    name : 包名，用于指定业务模块前缀
 *    path: 前缀包名对应的路径
 *    charset: 该包下所有文件的编码
 *
 * 2. add(moduleName,function(S,depModule){return function(){}},{requires:["depModuleName"]});
 *    moduleName add 时可以不写
 *    depModuleName 可以写相对地址 (./ , ../)，相对于 moduleName
 *
 * 3. S.use(["dom"],function(S,DOM){
 *    });
 *    依赖注入，发生于 add 和 use 时期
 *
 * 4. add,use 不支持 css loader ,getScript 仍然保留支持
 *
 * 5. 部分更新模块文件代码 x/y?t=2011 ，加载过程中注意去除事件戳，仅在载入文件时使用
 *
 * demo : http://lite-ext.googlecode.com/svn/trunk/lite-ext/playground/module_package/index.html
 *
 * 2011-03-01 yiminghe@gmail.com note:
 *
 * compatibility
 *
 * 1. 保持兼容性，不得已而为之
 *      支持 { host : }
 *      如果 requires 都已经 attached，支持 add 后立即 attach
 *      支持 { attach : false } 显示控制 add 时是否 attach
 *      支持 { global : Editor } 指明模块来源
 */

