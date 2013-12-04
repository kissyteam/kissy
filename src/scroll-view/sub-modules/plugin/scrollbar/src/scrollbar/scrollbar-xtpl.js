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
            buffer += '<div id="ks-scrollbar-arrow-up-';
            var id0 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 1);
            buffer += renderOutputUtil(id0, true);
            buffer += '"\n        class="';
            var config2 = {};
            var params3 = [];
            var id4 = getPropertyUtil(engine, scope, "axis", 0, 2);
            params3.push(id4 + ('-arrow-up'));
            config2.params = params3;
            var id1 = runInlineCommandUtil(engine, scope, config2, "getBaseCssClasses", 2);
            buffer += renderOutputUtil(id1, true);
            buffer += '">\n    <a href="javascript:void(\'up\')">up</a>\n</div>\n<div id="ks-scrollbar-arrow-down-';
            var id5 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 5);
            buffer += renderOutputUtil(id5, true);
            buffer += '"\n        class="';
            var config7 = {};
            var params8 = [];
            var id9 = getPropertyUtil(engine, scope, "axis", 0, 6);
            params8.push(id9 + ('-arrow-down'));
            config7.params = params8;
            var id6 = runInlineCommandUtil(engine, scope, config7, "getBaseCssClasses", 6);
            buffer += renderOutputUtil(id6, true);
            buffer += '">\n    <a href="javascript:void(\'down\')">down</a>\n</div>\n<div id="ks-scrollbar-track-';
            var id10 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 9);
            buffer += renderOutputUtil(id10, true);
            buffer += '"\n     class="';
            var config12 = {};
            var params13 = [];
            var id14 = getPropertyUtil(engine, scope, "axis", 0, 10);
            params13.push(id14 + ('-track'));
            config12.params = params13;
            var id11 = runInlineCommandUtil(engine, scope, config12, "getBaseCssClasses", 10);
            buffer += renderOutputUtil(id11, true);
            buffer += '">\n<div id="ks-scrollbar-drag-';
            var id15 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 11);
            buffer += renderOutputUtil(id15, true);
            buffer += '"\n     class="';
            var config17 = {};
            var params18 = [];
            var id19 = getPropertyUtil(engine, scope, "axis", 0, 12);
            params18.push(id19 + ('-drag'));
            config17.params = params18;
            var id16 = runInlineCommandUtil(engine, scope, config17, "getBaseCssClasses", 12);
            buffer += renderOutputUtil(id16, true);
            buffer += '">\n<div class="';
            var config21 = {};
            var params22 = [];
            var id23 = getPropertyUtil(engine, scope, "axis", 0, 13);
            params22.push(id23 + ('-drag-top'));
            config21.params = params22;
            var id20 = runInlineCommandUtil(engine, scope, config21, "getBaseCssClasses", 13);
            buffer += renderOutputUtil(id20, true);
            buffer += '">\n</div>\n<div class="';
            var config25 = {};
            var params26 = [];
            var id27 = getPropertyUtil(engine, scope, "axis", 0, 15);
            params26.push(id27 + ('-drag-center'));
            config25.params = params26;
            var id24 = runInlineCommandUtil(engine, scope, config25, "getBaseCssClasses", 15);
            buffer += renderOutputUtil(id24, true);
            buffer += '">\n</div>\n<div class="';
            var config29 = {};
            var params30 = [];
            var id31 = getPropertyUtil(engine, scope, "axis", 0, 17);
            params30.push(id31 + ('-drag-bottom'));
            config29.params = params30;
            var id28 = runInlineCommandUtil(engine, scope, config29, "getBaseCssClasses", 17);
            buffer += renderOutputUtil(id28, true);
            buffer += '">\n</div>\n</div>\n</div>';
            return buffer;
        };
});