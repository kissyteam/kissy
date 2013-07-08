(function (S) {
    var isDebug = S.Config.debug;

    function importStyle(modNames) {
        if (typeof modNames == 'string') {
            modNames = modNames.split(',');
        }
        var cssList = [],
            cssCache = {},
            stack = [],
            stackCache = {},
            processed = {},
            mods = S.Env.mods;
        isDebug = S.Config.debug;
        S.each(modNames, function (modName) {
            var mod;
            if (mod = mods[modName]) {
                collectCss(mod, cssList, stack, cssCache, stackCache, processed);
            }
        });
        if (cssList.length) {
            if (S.config('combine')) {
                var Config = S.Config,
                    comboPrefix = Config.comboPrefix,
                    comboSep = Config.comboSep,
                    maxFileNum = Config.comboMaxFileNum,
                    maxUrlLength = Config.comboMaxUrlLength;
                var prefix = '';
                var suffix = '';
                var combined = [];
                var combinedUrl = [];
                for (var i = 0; i < cssList.length; i++) {
                    var currentCss = cssList[i];
                    var currentPackage = currentCss.getPackage();
                    var packagePath = currentPackage.getPrefixUriForCombo();
                    // map individual module
                    var fullpath = currentCss.getFullPath();
                    if (!currentPackage.isCombine() || !S.startsWith(fullpath, packagePath)) {
                        document.writeln('<link href="' + fullpath + '"  rel="stylesheet"/>');
                        continue;
                    }
                    var path = fullpath.slice(packagePath.length).replace(/\?.*$/, '');
                    combined.push(currentCss);
                    combinedUrl.push(path);
                    if (combined.length === 1) {
                        prefix = packagePath + comboPrefix;
                        suffix = '?t=' + encodeURIComponent(currentPackage.getTag());
                    } else {
                        if ((combinedUrl.length > maxFileNum) ||
                            (prefix.length + combinedUrl.join(comboSep).length + suffix.length > maxUrlLength) ||
                            combined[0].getPackage() != currentPackage) {
                            combined.pop();
                            combinedUrl.pop();
                            document.writeln('<link href="' + (prefix + combinedUrl.join(comboSep) + suffix) + '"  rel="stylesheet"/>');
                            combined = [];
                            combinedUrl = [];
                            i--;
                        } else {
                        }
                    }

                }
                if (combinedUrl.length) {
                    document.writeln('<link href="' + (prefix + combinedUrl.join(comboSep) + suffix) + '"  rel="stylesheet"/>');
                }
            } else {
                S.each(cssList, function (css) {
                    document.writeln('<link href="' + css.getFullPath() + '"  rel="stylesheet"/>')
                });
            }
        }
    }

    function collectCss(mod, cssList, stack, cssCache, stackCache, processed) {
        var name = mod.getName();
        if (isDebug && stackCache[name]) {
            S.error('circular dependencies found: ' + stack);
            return;
        }
        if (processed[name]) {
            return;
        }
        processed[name] = 1;
        if (mod.getType() == 'css') {
            if (!cssCache[name]) {
                mod.status = 4;
                cssList.push(mod);
                cssCache[name] = 1;
            }
            return;
        }
        var requires = mod.getRequiredMods();
        if (isDebug) {
            stackCache[name] = 1;
            stack.push(name);
        }
        S.each(requires, function (r) {
            collectCss(r, cssList, stack, cssCache, stackCache, processed);
        });
        if (isDebug) {
            stack.pop();
            delete stackCache[name];
        }
    }

    window.importStyle = importStyle;

})(KISSY);