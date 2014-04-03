/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        var t = function (scope, S, buffer, payload, undefined) {
            var engine = this,
                moduleWrap, nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            if ("1.50" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
            }
            if (typeof module !== "undefined" && module.kissy) {
                moduleWrap = module;
            }
            var callCommandUtil = utils.callCommand,
                eachCommand = nativeCommands.each,
                withCommand = nativeCommands["with"],
                ifCommand = nativeCommands["if"],
                setCommand = nativeCommands.set,
                includeCommand = nativeCommands.include,
                parseCommand = nativeCommands.parse,
                extendCommand = nativeCommands.extend,
                blockCommand = nativeCommands.block,
                macroCommand = nativeCommands.macro,
                debuggerCommand = nativeCommands["debugger"];
            buffer.write('<span class="others" data-spm="991222469">\n\n\t');
            var option0 = {
                escape: 1
            };
            var params1 = [];
            var id2 = scope.resolve(["shopIdentity", "data", "alipayCompanyAuth"]);
            params1.push(id2);
            option0.params = params1;
            option0.fn = function (scope, buffer) {

                buffer.write('\n\t\t<a title="支付宝企业认证" href="http://help.alipay.com/lab/210321-232507/0-232507.htm" target="_blank"><i class="icon-qyrz"></i></a>\n\t');

                return buffer;
            };
            option0.inverse = function (scope, buffer) {

                buffer.write('\n        ');
                var option3 = {
                    escape: 1
                };
                var params4 = [];
                var id5 = scope.resolve(["shopIdentity", "data", "alipayPersionAuth"]);
                params4.push(id5);
                option3.params = params4;
                option3.fn = function (scope, buffer) {

                    buffer.write('\n\t\t    <a title="支付宝个人认证" href="http://help.alipay.com/lab/210120-210321/0-210321.htm" target="_blank"><i class="icon-grrz"></i></a>\n\t    ');

                    return buffer;
                };
                option3.inverse = function (scope, buffer) {

                    buffer.write('\n            ');
                    var option6 = {
                        escape: 1
                    };
                    var params7 = [];
                    var id8 = scope.resolve(["shopIdentity", "data", "personalAuth"]);
                    params7.push(id8);
                    option6.params = params7;
                    option6.fn = function (scope, buffer) {

                        buffer.write('\n\t\t        <a title="淘宝个人实名认证" href="http://service.taobao.com/support/5-27-31/help-1055.htm" target="_blank"><i class="icon-grrz"></i></a>\n            ');

                        return buffer;
                    };
                    buffer = ifCommand.call(engine, scope, option6, buffer, 9, payload);
                    buffer.write('\n        ');

                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option3, buffer, 6, payload);
                buffer.write('\n\t');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option0, buffer, 3, payload);
            buffer.write('\n\n\n\t');
            var option9 = {
                escape: 1
            };
            var params10 = [];
            var id11 = scope.resolve(["shopIdentity", "data", "globalSeller"]);
            params10.push(id11);
            option9.params = params10;
            option9.fn = function (scope, buffer) {

                buffer.write('\n\t\t<a href="#" onclick="javascript:return false;" target="_blank" title="全球购卖家"><i class="icon-global"></i></a>\n\t');

                return buffer;
            };
            option9.inverse = function (scope, buffer) {

                buffer.write('\n        ');
                var option12 = {
                    escape: 1
                };
                var params13 = [];
                var id14 = scope.resolve(["shopIdentity", "data", "starSeller"]);
                params13.push(id14);
                option12.params = params13;
                option12.fn = function (scope, buffer) {

                    buffer.write('\n\t\t    <a href="#" onclick="javascript:return false;" target="_blank" title="明星卖家"><i class="icon-star"></i></a>\n\t    ');

                    return buffer;
                };
                option12.inverse = function (scope, buffer) {

                    buffer.write('\n            ');
                    var option15 = {
                        escape: 1
                    };
                    var params16 = [];
                    var id17 = scope.resolve(["shopIdentity", "data", "protectSeller"]);
                    params16.push(id17);
                    option15.params = params16;
                    option15.fn = function (scope, buffer) {

                        buffer.write('\n\t\t        <a href="#" onclick="javascript:return false;" target="_blank" title="消保卖家"><i class="icon-xb"></i></a>\n            ');

                        return buffer;
                    };
                    buffer = ifCommand.call(engine, scope, option15, buffer, 22, payload);
                    buffer.write('\n        ');

                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option12, buffer, 19, payload);
                buffer.write('\n\t');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option9, buffer, 16, payload);
            buffer.write('\n\n</span>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});