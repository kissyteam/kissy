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
            buffer += '<div id="ks-combobox-invalid-el-';
            var id0 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 1);
            buffer += renderOutputUtil(id0, true);
            buffer += '"\n     class="';
            var config2 = {};
            var params3 = [];
            params3.push('invalid-el');
            config2.params = params3;
            var id1 = runInlineCommandUtil(engine, scope, config2, "getBaseCssClasses", 2);
            buffer += renderOutputUtil(id1, true);
            buffer += '">\n    <div class="';
            var config5 = {};
            var params6 = [];
            params6.push('invalid-inner');
            config5.params = params6;
            var id4 = runInlineCommandUtil(engine, scope, config5, "getBaseCssClasses", 3);
            buffer += renderOutputUtil(id4, true);
            buffer += '"></div>\n</div>\n\n';
            var config7 = {};
            var params8 = [];
            var id9 = getPropertyUtil(engine, scope, "hasTrigger", 0, 6);
            params8.push(id9);
            config7.params = params8;
            config7.fn = function (scope) {
                var buffer = "";
                buffer += '\n<div id="ks-combobox-trigger-';
                var id10 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 7);
                buffer += renderOutputUtil(id10, true);
                buffer += '"\n     class="';
                var config12 = {};
                var params13 = [];
                params13.push('trigger');
                config12.params = params13;
                var id11 = runInlineCommandUtil(engine, scope, config12, "getBaseCssClasses", 8);
                buffer += renderOutputUtil(id11, true);
                buffer += '">\n    <div class="';
                var config15 = {};
                var params16 = [];
                params16.push('trigger-inner');
                config15.params = params16;
                var id14 = runInlineCommandUtil(engine, scope, config15, "getBaseCssClasses", 9);
                buffer += renderOutputUtil(id14, true);
                buffer += '">&#x25BC;</div>\n</div>\n';
                return buffer;
            };
            buffer += runBlockCommandUtil(engine, scope, config7, "if", 6);
            buffer += '\n\n<div class="';
            var config18 = {};
            var params19 = [];
            params19.push('input-wrap');
            config18.params = params19;
            var id17 = runInlineCommandUtil(engine, scope, config18, "getBaseCssClasses", 13);
            buffer += renderOutputUtil(id17, true);
            buffer += '">\n\n    <input id="ks-combobox-input-';
            var id20 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 15);
            buffer += renderOutputUtil(id20, true);
            buffer += '"\n           aria-haspopup="true"\n           aria-autocomplete="list"\n           aria-haspopup="true"\n           role="autocomplete"\n           aria-expanded="false"\n\n    ';
            var config21 = {};
            var params22 = [];
            var id23 = getPropertyUtil(engine, scope, "disabled", 0, 22);
            params22.push(id23);
            config21.params = params22;
            config21.fn = function (scope) {
                var buffer = "";
                buffer += '\n    disabled\n    ';
                return buffer;
            };
            buffer += runBlockCommandUtil(engine, scope, config21, "if", 22);
            buffer += '\n\n    autocomplete="off"\n    class="';
            var config25 = {};
            var params26 = [];
            params26.push('input');
            config25.params = params26;
            var id24 = runInlineCommandUtil(engine, scope, config25, "getBaseCssClasses", 27);
            buffer += renderOutputUtil(id24, true);
            buffer += '"\n\n    value="';
            var id27 = getPropertyOrRunCommandUtil(engine, scope, {}, "value", 0, 29);
            buffer += renderOutputUtil(id27, true);
            buffer += '"\n    />\n\n\n    <label id="ks-combobox-placeholder-';
            var id28 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 33);
            buffer += renderOutputUtil(id28, true);
            buffer += '"\n           for="ks-combobox-input-';
            var id29 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 34);
            buffer += renderOutputUtil(id29, true);
            buffer += '"\n            style=\'display:';
            var config30 = {};
            var params31 = [];
            var id32 = getPropertyUtil(engine, scope, "value", 0, 35);
            params31.push(id32);
            config30.params = params31;
            config30.fn = function (scope) {
                var buffer = "";
                buffer += 'none';
                return buffer;
            };
            config30.inverse = function (scope) {
                var buffer = "";
                buffer += 'block';
                return buffer;
            };
            buffer += runBlockCommandUtil(engine, scope, config30, "if", 35);
            buffer += ';\'\n    class="';
            var config34 = {};
            var params35 = [];
            params35.push('placeholder');
            config34.params = params35;
            var id33 = runInlineCommandUtil(engine, scope, config34, "getBaseCssClasses", 36);
            buffer += renderOutputUtil(id33, true);
            buffer += '">\n    ';
            var id36 = getPropertyOrRunCommandUtil(engine, scope, {}, "placeholder", 0, 37);
            buffer += renderOutputUtil(id36, true);
            buffer += '\n    </label>\n</div>\n';
            return buffer;
        };
});