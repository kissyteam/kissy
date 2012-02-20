/**
 * using combo to load module files
 * @author yiminghe@gmail.com
 */
(function (S, utils) {

    function loadScripts(urls, callback) {
        var count = urls && urls.length;
        if (!count) {
            callback();
            return;
        }
        for (var i = 0; i < urls.length; i++) {
            var url = urls[i];
            S.getScript(url, function () {
                if (!(--count)) {
                    callback();
                }
            });
        }
    }

    var MAX_URL_LENGTH = 1024;

    /**
     * using combo to load module files
     * @class
     * @param SS KISSY
     */
    function ComboLoader(SS) {
        S.mix(this, {
            SS:SS,
            queue:[],
            loading:0
        });
    }

    S.augment(ComboLoader,
        /**
         * @lends ComboLoader#
         */
        {
            next:function () {
                var self = this;
                if (self.queue.length) {
                    var args = self.queue.shift();
                    self._use(args.modNames, args.fn);
                }
            },

            enqueue:function (modNames, fn) {
                var self = this;
                self.queue.push({
                    modNames:modNames,
                    fn:fn
                });
            },

            _use:function (modNames, fn) {
                var self = this;

                self.loading = 1;

                modNames = utils.normalizeModNamesInUse(modNames);

                var allModNames = self.calculate(modNames),
                    comboUrls = self.getComboUrls(allModNames);

                // css first to avoid page blink
                var css = comboUrls.css,
                    countCss = 0;

                for (var p in css) {
                    countCss++;
                }

                if (!countCss) {
                    self._useJs(comboUrls, fn, modNames);
                    return;
                }

                for (p in css) {
                    loadScripts(css[p], function () {
                        if (!(--countCss)) {
                            self._useJs(comboUrls, fn);
                        }
                    });
                }
            },

            use:function (modNames, callback) {
                var self = this,
                    fn = function () {
                        self.loading = 0;
                        if (callback) {
                            callback.apply(this, arguments);
                        }
                        self.next();
                    };

                self.enqueue(modNames, fn);

                if (!self.loading) {
                    self.next();
                }
            },

            _useJs:function (comboUrls, fn, modNames) {
                var self = this,
                    jss = comboUrls.js,
                    countJss = 0;

                for (var p in jss) {
                    countJss++;
                }

                if (!countJss) {
                    fn.apply(utils.getModules(self.SS, modNames));
                    return;
                }

                for (p in jss) {
                    loadScripts(jss[p], function () {
                        if (!(--countJss)) {
                            self.attachMods(modNames);
                            if (utils.isAttached(self.SS, modNames)) {
                                fn.apply(utils.getModules(self.SS, modNames))
                            } else {
                                // new require is introduced by KISSY.add
                                // run again
                                self._use(modNames, fn)
                            }
                        }
                    });
                }
            },

            add:function (name, def, config) {
                var self = this,
                    mods = self.SS.Env.mods,
                    o;
                // S.add(name, config) => S.add( { name: config } )
                if (S.isString(name)
                    && !config
                    && S.isPlainObject(def)) {
                    o = {};
                    o[name] = def;
                    name = o;
                }

                // S.add( { name: config } )
                if (S.isPlainObject(name)) {
                    S.each(name, function (v, k) {
                        v.name = k;
                        if (mods[k]) {
                            // 保留之前添加的配置
                            S.mix(v, mods[k], false);
                        }
                    });
                    S.mix(mods, name);
                    return self;
                }

                utils.registerModule(self.SS, name, def, config);
            },


            attachMods:function (modNames) {
                var self = this;
                S.each(modNames, function (modName) {
                    self.attachMod(modName);
                });
            },

            attachMod:function (modName) {
                var SS = this.SS,
                    mod = this.getModInfo(modName);
                if (
                // new require after add
                // not register yet!
                    !mod ||
                        utils.isAttached(SS, modName)) {
                    return;
                }
                var requires = mod.requires || [];
                for (var i = 0; i < requires.length; i++) {
                    this.attachMod(requires[i]);
                }
                for (i = 0; i < requires.length; i++) {
                    if (!utils.isAttached(SS, requires[i])) {
                        return false;
                    }
                }
                utils.attachMod(SS, mod);
            },

            calculate:function (modNames) {
                var ret = {}, SS = this.SS;
                for (var i = 0; i < modNames.length; i++) {
                    var m = modNames[i];
                    if (!utils.isAttached(SS, m)) {
                        if (!utils.isLoaded(SS, m)) {
                            ret[m] = 1;
                        }
                        S.mix(ret, this.getRequires((m)));
                    }
                }
                var ret2 = [];
                for (var r in ret) {
                    ret2.push(r);
                }
                return ret2;
            },

            getComboUrls:function (modNames) {
                var self = this,
                    i,
                    mod,
                    packagePath,
                    combos = {};

                S.each(modNames, function (modName) {
                    utils.generateModulePath(self.SS, modName);
                    mod = self.getModInfo(modName);
                    packagePath = utils.getPackagePath(mod);
                    var type = utils.isCss(mod.path) ? "css" : "js";
                    combos[packagePath] = combos[packagePath] || {};
                    combos[packagePath][type] = combos[packagePath][type] || [];
                    combos[packagePath][type].tag = mod.tag;
                    combos[packagePath][type].push(mod.path);
                });

                var res = {
                    js:{},
                    css:{}
                }, t;

                var comboPrefix = S.Config.comboPrefix,
                    comboSep = S.Config.comboSep,
                    maxUrlLength = KISSY.Config['comboMaxUrlLength'] || MAX_URL_LENGTH;

                for (packagePath in combos) {
                    for (var type in combos[packagePath]) {
                        t = [];
                        var jss = combos[packagePath][type];
                        res[type][packagePath] = [];
                        var prefix = packagePath + comboPrefix,
                            l = prefix.length;
                        for (i = 0; i < jss.length; i++) {
                            t.push(jss[i]);
                            if (l + t.join(comboSep).length > maxUrlLength) {
                                t.pop();
                                res[type][packagePath].push(self.getComboUrl(
                                    t.length > 1 ? prefix : packagePath,
                                    t, comboSep, jss.tag
                                ));
                                t = [];
                                i--;
                            }
                        }
                        if (t.length) {
                            res[type][packagePath].push(self.getComboUrl(
                                t.length > 1 ? prefix : packagePath,
                                t, comboSep, jss.tag
                            ));
                        }
                    }
                }

                return res;
            },

            getComboUrl:function (prefix, t, comboSep, tag) {
                return prefix + t.join(comboSep) + (S.Config.withTag ? ("?t=" + tag) : "");
            },

            getModInfo:function (modName) {
                var SS = this.SS, mods = SS.Env.mods;
                return mods[modName];
            },

            // get requires mods need to be loaded dynamically
            getRequires:function (modName) {
                var mod = this.getModInfo(modName),
                    ret = {};
                // if this mod is attached then its require is attached too!
                if (mod && !utils.isAttached(this.SS, modName)) {
                    var requires = mod.requires || [],
                        allRequires = mod.__allRequires || (mod.__allRequires = {});
                    for (var i = 0; i < requires.length; i++) {
                        var r = utils.normalDepModuleName(modName, requires[i]);
                        requires[i] = r;
                        if (S.Config.debug && allRequires[r]) {
                            S.error("detect circular dependency among : ");
                            S.error(allRequires);
                        }

                        // if not load into page yet
                        if (!utils.isLoaded(this.SS, r)) {
                            ret[r] = 1;
                        }
                        var ret2 = this.getRequires(r);
                        S.mix(ret, ret2);
                    }
                }
                return ret;
            }
        });

    S.namespace("Loader");
    S.Loader.Combo = ComboLoader;

})(KISSY, KISSY.__loaderUtils);
/**
 * 2012-02-20 yiminghe note:
 *  - three status
 *      0 : initialized
 *      LOADED : load into page
 *      ATTACHED : def executed
 **/