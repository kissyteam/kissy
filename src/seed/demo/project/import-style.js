(function (S) {

    function importStyle(modNames) {
        if (typeof modNames == 'string') {
            modNames = modNames.split(',');
        }
        var cssList = [];
        var stack = [];
        var mods = S.Env.mods;
        S.each(modNames, function (modName) {
            var mod;
            if (mod = mods[modName]) {
                collectCss(mod, cssList, stack);
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
                            combined = [];
                            combinedUrl = [];
                            document.writeln('<link href="' + (prefix + combinedUrl.join(comboSep) + suffix) + '"  rel="stylesheet"/>');
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
    
    function getRequiredMods(self) {
            var runtime = self.runtime;
            return S.map(self.getNormalizedRequires(), function (r) {
                return Utils.createModuleInfo(runtime, r);
            });
        },

    function collectCss(mod, cssList, stack) {
        if (S.inArray(mod, stack)) {
            S.error('circular dependencies found: ' + stack);
            return;
        }
        if (mod.getType() == 'css') {
            if (!S.inArray(mod, cssList)) {
                mod.status = 4;
                cssList.push(mod);
            }
            return;
        }
        var requires = getRequiredMods(mod);
        stack.push(mod);
        S.each(requires, function (r) {
            collectCss(r, cssList, stack);
        });
        stack.pop();
    }

    window.importStyle = importStyle;

})(KISSY);