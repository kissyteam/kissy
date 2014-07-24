/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 24 19:32
*/
/**
 * use document.write to load external css files in block loading ways.
 * depends on loader.
 * @ignore
 * @author yiminghe@gmail.com
 */
(function (S) {
    var method = 'writeln';

    function importStyle(modNames) {
        if (typeof modNames === 'string') {
            modNames = modNames.split(',');
        }
        var Utils = S.Loader.Utils;
        var Status = S.Loader.Status;
        var each = Utils.each;
        var ComboLoader = S.Loader.ComboLoader;
        var loader = new ComboLoader();
        var mods = Utils.createModules(modNames);
        var unloadedMods = [];
        each(mods, function (mod) {
            unloadedMods.push.apply(unloadedMods, mod.getNormalizedModules());
        });
        unloadedMods = loader.calculate(unloadedMods, []);
        var unloadedCssMods = [];
        each(unloadedMods, function (mod) {
            if (mod.getType() === 'css') {
                mod.status = Status.ATTACHED;
                unloadedCssMods.push(mod);
            } else {
                mod.status = Status.INIT;
            }
        });
        var comboUrls = loader.getComboUrls(unloadedCssMods);
        // load css first to avoid page blink
        if (comboUrls.css) {
            each(comboUrls.css, function (rs) {
                document[method](' <link rel="stylesheet" href="' + rs.url + '">');
            });
        }
    }

    S.importStyle = importStyle;
})(KISSY);
