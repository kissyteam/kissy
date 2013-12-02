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
            buffer += '<div id="ks-tree-node-row-';
            var id0 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 1, undefined, false);
            buffer += getExpressionUtil(id0, true);
            buffer += '"\n     class="';
            var config2 = {};
            var params3 = [];
            params3.push('row');
            config2.params = params3;
            var id1 = getPropertyOrRunCommandUtil(engine, scope, config2, "getBaseCssClasses", 0, 2, true, undefined);
            buffer += id1;
            buffer += '\n     ';
            var config4 = {};
            var params5 = [];
            var id6 = getPropertyOrRunCommandUtil(engine, scope, {}, "selected", 0, 3, undefined, true);
            params5.push(id6);
            config4.params = params5;
            config4.fn = function (scope) {
                var buffer = "";
                buffer += '\n        ';
                var config8 = {};
                var params9 = [];
                params9.push('selected');
                config8.params = params9;
                var id7 = getPropertyOrRunCommandUtil(engine, scope, config8, "getBaseCssClasses", 0, 4, true, undefined);
                buffer += id7;
                buffer += '\n     ';
                return buffer;
            };
            buffer += runBlockCommandUtil(engine, scope, config4, "if", 3);
            buffer += '\n     ">\n    <div id="ks-tree-node-expand-icon-';
            var id10 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 7, undefined, false);
            buffer += getExpressionUtil(id10, true);
            buffer += '"\n         class="';
            var config12 = {};
            var params13 = [];
            params13.push('expand-icon');
            config12.params = params13;
            var id11 = getPropertyOrRunCommandUtil(engine, scope, config12, "getBaseCssClasses", 0, 8, true, undefined);
            buffer += id11;
            buffer += '">\n    </div>\n    ';
            var config14 = {};
            var params15 = [];
            var id16 = getPropertyOrRunCommandUtil(engine, scope, {}, "checkable", 0, 10, undefined, true);
            params15.push(id16);
            config14.params = params15;
            config14.fn = function (scope) {
                var buffer = "";
                buffer += '\n    <div id="ks-tree-node-checked-';
                var id17 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 11, undefined, false);
                buffer += getExpressionUtil(id17, true);
                buffer += '"\n         class="';
                var config19 = {};
                var params20 = [];
                var id21 = getPropertyOrRunCommandUtil(engine, scope, {}, "checkState", 0, 12, undefined, true);
                params20.push(('checked') + id21);
                config19.params = params20;
                var id18 = getPropertyOrRunCommandUtil(engine, scope, config19, "getBaseCssClasses", 0, 12, true, undefined);
                buffer += id18;
                buffer += '"></div>\n    ';
                return buffer;
            };
            buffer += runBlockCommandUtil(engine, scope, config14, "if", 10);
            buffer += '\n    <div id="ks-tree-node-icon-';
            var id22 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 14, undefined, false);
            buffer += getExpressionUtil(id22, true);
            buffer += '"\n         class="';
            var config24 = {};
            var params25 = [];
            params25.push('icon');
            config24.params = params25;
            var id23 = getPropertyOrRunCommandUtil(engine, scope, config24, "getBaseCssClasses", 0, 15, true, undefined);
            buffer += id23;
            buffer += '">\n\n    </div>\n    ';
            var config27 = {};
            var params28 = [];
            params28.push('component/extension/content-xtpl');
            config27.params = params28;
            if (moduleWrap) {
                require("component/extension/content-xtpl");
                config27.params[0] = moduleWrap.resolveByName(config27.params[0]);
            }
            var id26 = getPropertyOrRunCommandUtil(engine, scope, config27, "include", 0, 18, false, undefined);
            buffer += id26;
            buffer += '\n</div>\n<div id="ks-tree-node-children-';
            var id29 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 20, undefined, false);
            buffer += getExpressionUtil(id29, true);
            buffer += '"\n     class="';
            var config31 = {};
            var params32 = [];
            params32.push('children');
            config31.params = params32;
            var id30 = getPropertyOrRunCommandUtil(engine, scope, config31, "getBaseCssClasses", 0, 21, true, undefined);
            buffer += id30;
            buffer += '"\n';
            var config33 = {};
            var params34 = [];
            var id35 = getPropertyOrRunCommandUtil(engine, scope, {}, "expanded", 0, 22, undefined, true);
            params34.push(id35);
            config33.params = params34;
            config33.fn = function (scope) {
                var buffer = "";
                buffer += '\nstyle="display:none"\n';
                return buffer;
            };
            var inverse36 = config33.fn;
            config33.fn = config33.inverse;
            config33.inverse = inverse36;
            buffer += runBlockCommandUtil(engine, scope, config33, "if", 22);
            buffer += '\n>\n</div>';
            return buffer;
        };
});