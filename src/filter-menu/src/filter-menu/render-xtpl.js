/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        return function (scope, S, undefined) {
            var buffer = "",
                config = this.config,
                engine = this,
                moduleWrap, utils = config.utils;
            if (typeof module !== "undefined" && module.kissy) {
                moduleWrap = module;
            }
            var runBlockCommandUtil = utils.runBlockCommand,
                renderOutputUtil = utils.renderOutput,
                getPropertyUtil = utils.getProperty,
                runInlineCommandUtil = utils.runInlineCommand,
                getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
            buffer += '<div id="ks-filter-menu-input-wrap-';
            var id0 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 1);
            buffer += renderOutputUtil(id0, true);
            buffer += '"\n     class="';
            var config2 = {};
            var params3 = [];
            params3.push('input-wrap');
            config2.params = params3;
            var id1 = runInlineCommandUtil(engine, scope, config2, "getBaseCssClasses", 2);
            buffer += renderOutputUtil(id1, true);
            buffer += '">\n    <div id="ks-filter-menu-placeholder-';
            var id4 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 3);
            buffer += renderOutputUtil(id4, true);
            buffer += '"\n         class="';
            var config6 = {};
            var params7 = [];
            params7.push('placeholder');
            config6.params = params7;
            var id5 = runInlineCommandUtil(engine, scope, config6, "getBaseCssClasses", 4);
            buffer += renderOutputUtil(id5, true);
            buffer += '">\n        ';
            var id8 = getPropertyOrRunCommandUtil(engine, scope, {}, "placeholder", 0, 5);
            buffer += renderOutputUtil(id8, true);
            buffer += '\n    </div>\n    <input id="ks-filter-menu-input-';
            var id9 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 7);
            buffer += renderOutputUtil(id9, true);
            buffer += '"\n           class="';
            var config11 = {};
            var params12 = [];
            params12.push('input');
            config11.params = params12;
            var id10 = runInlineCommandUtil(engine, scope, config11, "getBaseCssClasses", 8);
            buffer += renderOutputUtil(id10, true);
            buffer += '"\n            autocomplete="off"/>\n</div>\n';
            var config14 = {};
            var params15 = [];
            params15.push('component/extension/content-xtpl');
            config14.params = params15;
            if (moduleWrap) {
                require("component/extension/content-xtpl");
                config14.params[0] = moduleWrap.resolveByName(config14.params[0]);
            }
            var id13 = runInlineCommandUtil(engine, scope, config14, "include", 11);
            buffer += renderOutputUtil(id13, false);
            return buffer;
        };
});