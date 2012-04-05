/**
 * using combo to load module files
 * @author yiminghe@gmail.com
 */
(function (S) {

    if (typeof require !== 'undefined') {
        return;
    }

    function loadScripts(urls, callback, charset) {
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
            }, charset || "utf-8");
        }
    }

    var MAX_URL_LENGTH = 1024,
        Loader = S.Loader,
        data = Loader.STATUS,
        utils = Loader.Utils;

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
        Loader.Target,
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
                var self = this, SS = self.SS;

                self.loading = 1;

                modNames = utils.getModNamesAsArray(modNames);

                modNames= utils.normalizeModNamesWithAlias(SS,modNames);

                var unaliasModNames = utils.normalizeModNames(SS, modNames);

                var allModNames = self.calculate(unaliasModNames);

                var comboUrls = self.getComboUrls(allModNames);

                // load css first to avoid page blink
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
                            S.each(unaliasModNames, function (name) {
                                utils.attachMod(self.SS, self.getModInfo(name));
                            });
                            self._useJs(comboUrls, fn, modNames);
                        }
                    }, css[p].charset);
                }
            },

            use:function (modNames, callback) {
                var self = this,
                    fn = function () {
                        // KISSY.use in callback will be queued
                        if (callback) {
                            callback.apply(this, arguments);
                        }
                        self.loading = 0;
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
                    fn.apply(null, utils.getModules(self.SS, modNames));
                    return;
                }
                var success = 1;
                for (p in jss) {
                    (function (p) {
                        loadScripts(jss[p], function () {
                            var mods = jss[p].mods;
                            for (var i = 0; i < mods.length; i++) {
                                var mod = mods[i];
                                // fix #111
                                // https://github.com/kissyteam/kissy/issues/111
                                if (!mod.fn) {
                                    S.log(mod.name + ' is not loaded! can not find module in path : ' + jss[p], 'error');
                                    mod.status = data.ERROR;
                                    success = 0;
                                    return;
                                }
                            }
                            if (success && !(--countJss)) {
                                var unaliasModNames = utils.normalizeModNames(self.SS, modNames);
                                self.attachMods(unaliasModNames);
                                if (utils.isAttached(self.SS, unaliasModNames)) {
                                    fn.apply(null, utils.getModules(self.SS, modNames))
                                } else {
                                    // new require is introduced by KISSY.add
                                    // run again
                                    self._use(modNames, fn)
                                }
                            }
                        }, jss[p].charset);
                    })(p);
                }
            },

            add:function (name, def, config) {
                var self = this,
                    requires,
                    SS = self.SS;

                if (utils.normAdd(SS, name, def, config)) {
                    return;
                }
                if (config && (requires = config.requires)) {
                    utils.normalDepModuleName(name, requires);
                }
                utils.registerModule(SS, name, def, config);
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
                    !mod || utils.isAttached(SS, modName)) {
                    return;
                }
                var requires = utils.normalizeModNames(SS, mod.requires, modName);
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
                    mod = self.getModInfo(modName);
                    packagePath = utils.getPackagePath(self.SS, mod);
                    var type = utils.isCss(mod.path) ? "css" : "js";
                    combos[packagePath] = combos[packagePath] || {};
                    combos[packagePath][type] = combos[packagePath][type] || [];
                    combos[packagePath][type].tag = combos[packagePath][type].tag || mod.tag;
                    combos[packagePath][type].packageTag = mod.packageTag;
                    combos[packagePath][type].charset = mod.charset;
                    combos[packagePath][type].push(mod);
                });

                S.each(combos, function (v) {
                    var js, css;
                    if (js = v["js"]) {
                        // module level tag is superior to package level tag
                        js.tag = js.tag || js.packageTag;
                    }
                    if (css = v["css"]) {
                        css.tag = css.tag || css.packageTag;
                    }
                });

                var res = {
                    js:{},
                    css:{}
                }, t;

                var comboPrefix = S.Config.comboPrefix,
                    comboSep = S.Config.comboSep,
                    maxUrlLength = S.Config['comboMaxUrlLength'] || MAX_URL_LENGTH;

                for (packagePath in combos) {
                    for (var type in combos[packagePath]) {
                        t = [];
                        var jss = combos[packagePath][type];
                        res[type][packagePath] = [];
                        res[type][packagePath].charset = jss.charset;
                        // current package's mods
                        res[type][packagePath].mods = [];
                        var prefix = packagePath + comboPrefix,
                            l = prefix.length;
                        for (i = 0; i < jss.length; i++) {
                            t.push(jss[i].path);
                            res[type][packagePath].mods.push(jss[i]);
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
                return utils.getMappedPath(
                    this.SS,
                    prefix + t.join(comboSep) + (tag ? ("?t=" + tag) : "")
                );
            },

            getModInfo:function (modName) {
                var SS = this.SS, mods = SS.Env.mods;
                return mods[modName];
            },

            // get requires mods need to be loaded dynamically
            getRequires:function (modName) {
                var self = this,
                    SS = self.SS,
                    mod = self.getModInfo(modName),
                    ret = {};
                // if this mod is attached then its require is attached too!
                if (mod && !utils.isAttached(SS, modName)) {
                    var requires = utils.normalizeModNames(SS, mod.requires, modName);
                    // circular dependency check
                    if (S.Config.debug) {
                        var allRequires = mod.__allRequires || (mod.__allRequires = {});
                        if (allRequires[modName]) {
                            S.error("detect circular dependency among : ");
                            S.error(allRequires);
                        }
                    }
                    for (var i = 0; i < requires.length; i++) {
                        var r = requires[i];
                        if (S.Config.debug) {
                            // circular dependency check
                            var rMod = self.getModInfo(r);
                            allRequires[r] = 1;
                            if (rMod && rMod.__allRequires) {
                                S.each(rMod.__allRequires, function (_, r2) {
                                    allRequires[r2] = 1;
                                });
                            }
                        }
                        // if not load into page yet
                        if (!utils.isLoaded(SS, r)
                            // and not attached
                            && !utils.isAttached(SS, r)) {
                            ret[r] = 1;
                        }
                        var ret2 = self.getRequires(r);
                        S.mix(ret, ret2);
                    }
                }
                return ret;
            }
        });

    Loader.Combo = ComboLoader;

})(KISSY);
/**
 * 2012-02-20 yiminghe note:
 *  - three status
 *      0 : initialized
 *      LOADED : load into page
 *      ATTACHED : def executed
 **/