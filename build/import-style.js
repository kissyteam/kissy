/*
Copyright 2013, KISSY UI Library v1.31
MIT Licensed
build time: Aug 15 00:06
*/
/**
 * use document.write to load external css files in block loading ways.
 * depends on loader.
 * @author yiminghe@gmail.com
 */
(function (S) {
    var isDebug;

    function importStyle(modNames) {
        if (typeof modNames == 'string') {
            modNames = modNames.split(',');
        }
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
                        document.writeln('<link href="' + fullpath + '"  rel="stylesheet"/>');
                        continue;
                    }
                    var path = fullpath.slice(packagePath.length).replace(/\?.*$/, '');
                    combined.push(currentCss);
                    combinedUrl.push(path);
                    if (combined.length === 1) {
                        prefix = packagePath + comboPrefix;
                        suffix = '?t=' + encodeURIComponent(currentPackage.getTag()) + '.css';
                    } else {
                        if ((combinedUrl.length > maxFileNum) ||
                            (prefix.length + combinedUrl.join(comboSep).length +
                                suffix.length > maxUrlLength) ||
                            combined[0].getPackage() != currentPackage) {
                            combined.pop();
                            combinedUrl.pop();
                            document.writeln('<link href="' +
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
                    doc.writeln('<link href="' + css.getFullPath() + '"  rel="stylesheet"/>')
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

    S.importStyle = importStyle;
})(KISSY);
