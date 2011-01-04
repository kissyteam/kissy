/**
 * @module loader
 * @author lifesinger@gmail.com, lijing00333@163.com, yiminghe@gmail.com
 */
(function(S, undef) {

    var win = S.__HOST,
        doc = win['document'],
        head = doc.getElementsByTagName('head')[0] || doc.documentElement,
        EMPTY = '',
        CSSFULLPATH = 'cssfullpath',
        LOADING = 1,
        LOADED = 2,
        ERROR = 3,
        ATTACHED = 4,
        mix = S.mix,
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
        RE_CSS = /\.css(?:\?|$)/i,
        loader;

    loader = {

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
                mod,
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
            }
            // S.add(name[, fn[, config]])
            else {
                config = config || {};

                mod = mods[name] || {};

                // 注意：通过 S.add(name[, fn[, config]]) 注册的代码，无论是页面中的代码，
                // 还是 js 文件里的代码，add 执行时，都意味着该模块已经 LOADED
                mix(mod, { name: name, status: LOADED });

                if (mod.fn) {
                    S.error(name + " is defined more than once");

                }
                mod.def = def;
                mix((mods[name] = mod), config);
            }

            return self;
        },

        /**
         * Start load specific mods, and fire callback when these mods and requires are attached.
         * <code>
         * S.use('mod-name', callback, config);
         * S.use('mod1,mod2', callback, config);
         * </code>
         */
        use: function(modNames, callback, config) {
            modNames = modNames.replace(/\s+/g, EMPTY).split(',');
            config = config || {};

            var self = this,
                modName,
                i,
                len = modNames.length,
                fired;


            // 已经全部 attached, 直接执行回调即可
            if (self.__isAttached(modNames)) {
                var mods = self.__getModules(modNames);
                callback && callback.apply(self, mods);
                return;
            }
            // 有尚未 attached 的模块
            for (i = 0; i < len && (modName = modNames[i]); i++) {
                //从name开始调用，防止不存在模块
                self.__attachModByName(modName, function() {
                    if (!fired && self.__isAttached(modNames)) {
                        fired = true;
                        var mods = self.__getModules(modNames);
                        callback && callback.apply(self, mods);
                    }
                });
            }
            return self;
        },

        __getModules:function(modNames) {
            var mods = [this];
            modNames = modNames || [];
            for (var i = 0; i < modNames.length; i++) {
                mods.push(this.require(modNames[i]));
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
                mod = mods[moduleName];

            return mod && mod.value;
        },
        //加载指定模块名模块，如果不存在定义默认定义为内部模块
        __attachModByName: function(modName, callback) {

            var self = this,
                mods = self.Env.mods,
                //是否自带了css
                hasCss = modName.indexOf("+css") != -1;
            //得到真实组件名
            modName = hasCss ? modName.replace(/\+css/g, "") : modName;
            var mod = mods[modName];
            //没有模块定义，内部模块不许定义
            if (!mod) {
                //默认js名字
                var componentJsName = self.Config['componentJsName'] || function(m) {
                    return m + '-min.js?t=@TIMESTAMP@';
                },  js = S.isFunction(componentJsName) ?
                    componentJsName(modName) : componentJsName;
                mod = {
                    path:js,
                    charset: 'utf-8'
                };
                //添加模块定义
                mods[modName] = mod;
            }

            if (hasCss) {
                var componentCssName = self.Config['componentCssName'] || function(m) {
                    return m + '-min.css?t=@TIMESTAMP@';
                },  css = S.isFunction(componentCssName) ?
                    componentCssName(modName) :
                    componentCssName;
                mod.csspath = modName + '/' + css;
            }
            mod.name = modName;

            if (mod && mod.status === ATTACHED) return;
            self.__attach(mod, callback);
        },

        /**
         * Attach a module and all required modules.
         */
        __attach: function(mod, callback) {
            var self = this,
                mods = self.Env.mods,
                //复制一份当前的依赖项出来，防止add后修改！
                requires = (mod['requires'] || []).concat(),
                i = 0,
                len = requires.length;

            // attach all required modules
            for (; i < len; i++) {
                var r = mods[requires[i]];
                if (r && r.status === ATTACHED) {
                    //no need
                } else {
                    self.__attachModByName(requires[i], fn);
                }
            }

            // load and attach this module
            self.__buildPath(mod);
            self.__load(mod, function() {
                // add 可能改了 config，这里重新取下
                var newRequires = mod['requires'] || [],optimize = [];
                //本模块下载成功后串行下载 require
                for (var i = newRequires.length - 1; i >= 0; i--) {
                    var r = newRequires[i],
                        rmod = mods[r],
                        inA = S.inArray(r, requires);
                    //已经处理过了或将要处理
                    if (rmod && rmod.status === ATTACHED ||
                        inA) {
                        //no need
                    } else {
                        //新增的依赖项
                        self.__attachModByName(r, fn);
                    }
                    if (!inA) {
                        optimize.push(r);
                    }
                }
                if (optimize.length != 0) {
                    optimize.unshift(mod.name);
                    S.log(optimize + " : better to be used together", "warn");
                }
                fn();
            });

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
                def = mod.def;

            if (def) {
                if (S.isFunction(def)) {
                    mod.value = def.apply(self, self.__getModules(mod['requires']));
                } else {
                    mod.value = def;
                }
            }

            mod.status = ATTACHED;
        },

        __isAttached: function(modNames) {
            var mods = this.Env.mods,
                mod,
                i = (modNames = S.makeArray(modNames)).length - 1;

            for (; i >= 0; i--) {
                var name = modNames[i].replace(/\+css/, "");
                mod = mods[name] || {};
                if (mod.status !== ATTACHED) return false;
            }

            return true;
        },

        /**
         * Load a single module.
         */
        __load: function(mod, callback) {
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

            // 加载 css, 仅发出请求，不做任何其它处理
            if (S['isString'](mod[CSSFULLPATH])) {
                self.getScript(mod[CSSFULLPATH]);
                mod[CSSFULLPATH] = LOADED;
            }

            if (mod.status < LOADING && url) {
                mod.status = LOADING;

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
                if (!RE_CSS.test(url)) {
                    loadQueque[url] = ret;
                }
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
            var Config = this.Config;

            build('path', 'fullpath');

            if (mod[CSSFULLPATH] !== LOADED) {
                build('csspath', CSSFULLPATH);
            }

            function build(path, fullpath) {
                if (!mod[fullpath] && mod[path]) {
                    mod[fullpath] = (base || Config.base) + mod[path];
                }
                // debug 模式下，加载非 min 版
                if (mod[fullpath] && Config.debug) {
                    mod[fullpath] = mod[fullpath].replace(/-min/g, '');
                }
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
            var isCSS = RE_CSS.test(url),
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
                    if (head && node.parentNode) {
                        head.removeChild(node);
                    }
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
        baseTestReg = /(seed|kissy)(-min)?\.js/;

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
        return base;
    }

    /**
     * Initializes loader.
     */
    S.__initLoader = function() {
        // get base from current script file path
        var scripts = doc.getElementsByTagName('script'),
            currentScript = scripts[scripts.length - 1],
            base = getBaseUrl(currentScript);

        this.Env.mods = {}; // all added mods
        this.Env._loadQueue = {}; // information for loading and loaded mods

        // don't override
        if (!this.Config.base) this.Config.base = base;
        if (!this.Config.timeout) this.Config.timeout = 10;   // the default timeout for getScript
    };
    S.__initLoader();

    // for S.app working properly
    S.each(loader, function(v, k) {
        S.__APP_MEMBERS.push(k);
    });
    S.__APP_INIT_METHODS.push('__initLoader');

})(KISSY);

/**
 * 2011-01-04 adopt requirejs :
 * 1. add(moduleName,{property:value});
 * 2. add(moduleName,function(depModule){return function(){}},{requires:["depModule"]});
 * 3. S.use(["core"],function(S){
 *          dom=S.DOM;
 *    })
 *
 * add("core",function(dom,event,ua){
 * return {
 * DOM:dom,
 * Event:event
 * };
 *
 },{requires:["dom","event","ua"]})
 */

