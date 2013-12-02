/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark: false, unused:false, indent:false*/
        return function (scope, S, undefined) {
            var buffer = "",
                config = this.config,
                engine = this,
                moduleWrap, utils = config.utils;
            if (typeof module !== "undefined" && module.kissy) {
                moduleWrap = module;
            }
            var runBlockCommandUtil = utils.runBlockCommand,
                getExpressionUtil = utils.getExpression,
                getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
            buffer += '<div id="ks-scrollbar-arrow-up-';
            var id0 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 1, undefined, false);
            buffer += getExpressionUtil(id0, true);
            buffer += '"\n        class="';
            var config2 = {};
            var params3 = [];
            var id4 = getPropertyOrRunCommandUtil(engine, scope, {}, "axis", 0, 2, undefined, true);
            params3.push(id4 + ('-arrow-up'));
            config2.params = params3;
            var id1 = getPropertyOrRunCommandUtil(engine, scope, config2, "getBaseCssClasses", 0, 2, true, undefined);
            buffer += id1;
            buffer += '">\n    <a href="javascript:void(\'up\')">up</a>\n</div>\n<div id="ks-scrollbar-arrow-down-';
            var id5 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 5, undefined, false);
            buffer += getExpressionUtil(id5, true);
            buffer += '"\n        class="';
            var config7 = {};
            var params8 = [];
            var id9 = getPropertyOrRunCommandUtil(engine, scope, {}, "axis", 0, 6, undefined, true);
            params8.push(id9 + ('-arrow-down'));
            config7.params = params8;
            var id6 = getPropertyOrRunCommandUtil(engine, scope, config7, "getBaseCssClasses", 0, 6, true, undefined);
            buffer += id6;
            buffer += '">\n    <a href="javascript:void(\'down\')">down</a>\n</div>\n<div id="ks-scrollbar-track-';
            var id10 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 9, undefined, false);
            buffer += getExpressionUtil(id10, true);
            buffer += '"\n     class="';
            var config12 = {};
            var params13 = [];
            var id14 = getPropertyOrRunCommandUtil(engine, scope, {}, "axis", 0, 10, undefined, true);
            params13.push(id14 + ('-track'));
            config12.params = params13;
            var id11 = getPropertyOrRunCommandUtil(engine, scope, config12, "getBaseCssClasses", 0, 10, true, undefined);
            buffer += id11;
            buffer += '">\n<div id="ks-scrollbar-drag-';
            var id15 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 11, undefined, false);
            buffer += getExpressionUtil(id15, true);
            buffer += '"\n     class="';
            var config17 = {};
            var params18 = [];
            var id19 = getPropertyOrRunCommandUtil(engine, scope, {}, "axis", 0, 12, undefined, true);
            params18.push(id19 + ('-drag'));
            config17.params = params18;
            var id16 = getPropertyOrRunCommandUtil(engine, scope, config17, "getBaseCssClasses", 0, 12, true, undefined);
            buffer += id16;
            buffer += '">\n<div class="';
            var config21 = {};
            var params22 = [];
            var id23 = getPropertyOrRunCommandUtil(engine, scope, {}, "axis", 0, 13, undefined, true);
            params22.push(id23 + ('-drag-top'));
            config21.params = params22;
            var id20 = getPropertyOrRunCommandUtil(engine, scope, config21, "getBaseCssClasses", 0, 13, true, undefined);
            buffer += id20;
            buffer += '">\n</div>\n<div class="';
            var config25 = {};
            var params26 = [];
            var id27 = getPropertyOrRunCommandUtil(engine, scope, {}, "axis", 0, 15, undefined, true);
            params26.push(id27 + ('-drag-center'));
            config25.params = params26;
            var id24 = getPropertyOrRunCommandUtil(engine, scope, config25, "getBaseCssClasses", 0, 15, true, undefined);
            buffer += id24;
            buffer += '">\n</div>\n<div class="';
            var config29 = {};
            var params30 = [];
            var id31 = getPropertyOrRunCommandUtil(engine, scope, {}, "axis", 0, 17, undefined, true);
            params30.push(id31 + ('-drag-bottom'));
            config29.params = params30;
            var id28 = getPropertyOrRunCommandUtil(engine, scope, config29, "getBaseCssClasses", 0, 17, true, undefined);
            buffer += id28;
            buffer += '">\n</div>\n</div>\n</div>';
            return buffer;
        };
});