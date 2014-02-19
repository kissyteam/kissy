/**
 * use document.write to load external css files in block loading ways.
 * depends on loader.
 * @ignore
 * @author yiminghe@gmail.com
 */
(function (S) {
    var isDebug;

    /**
     * use document.write to load module's css dependency or css module in block loading ways.
     * @param {String[]} modNames css/js module names
     * @member KISSY
     */
    function importStyle(modNames) {
        var Utils = S.Loader.Utils;

        modNames = Utils.getModNamesAsArray(modNames);
        modNames = Utils.normalizeModNames(S, modNames);

        var cssList = [],
            doc = S.Env.host.document,
            Config = S.Config,
            cssCache = {},
            stack = [],
            stackCache = {},
            processed = {};
        isDebug = Config.debug;
        S.each(modNames, function (modName) {
            var mod = S.Loader.Utils.createModuleInfo(S, modName);
            collectCss(mod, cssList, stack, cssCache, stackCache, processed);
        });
        if (cssList.length) {
            if (Config.combine) {
                var comboPrefix = Config.comboPrefix,
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
                        doc.writeln('<link href="' + fullpath + '"  rel="stylesheet"/>');
                        continue;
                    }
                    var path = fullpath.slice(packagePath.length).replace(/\?.*$/, '');
                    combined.push(currentCss);
                    combinedUrl.push(path);
                    if (combined.length === 1) {
                        prefix = packagePath + comboPrefix;
                        if (currentPackage.getTag()) {
                            suffix = '?t=' + encodeURIComponent(currentPackage.getTag()) + '.css';
                        }
                    } else {
                        if ((combinedUrl.length > maxFileNum) ||
                            (prefix.length + combinedUrl.join(comboSep).length +
                                suffix.length > maxUrlLength) ||
                            combined[0].getPackage() !== currentPackage) {
                            combined.pop();
                            combinedUrl.pop();
                            doc.writeln('<link href="' +
                                (prefix + combinedUrl.join(comboSep) + suffix) +
                                '"  rel="stylesheet"/>');
                            combined = [];
                            combinedUrl = [];
                            i--;
                        }
                    }
                }
                if (combinedUrl.length) {
                    doc.writeln('<link href="' +
                        (prefix + combinedUrl.join(comboSep) + suffix) +
                        '"  rel="stylesheet"/>');
                }
            } else {
                S.each(cssList, function (css) {
                    doc.writeln('<link href="' + css.getFullPath() + '"  rel="stylesheet"/>');
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
        if (mod.getType() === 'css') {
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

    S.importStyle = importStyle;
})(KISSY);