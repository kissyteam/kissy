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
            buffer.write('<!--掌柜信息-->\n<div class="mod-shop" id="J_ShopInfo" data-spm="991222461">\n    ');
            var option0 = {
                escape: 1
            };
            var params1 = [];
            var id2 = scope.resolve(["shopInfo", "data", "hasShop"]);
            params1.push(id2);
            option0.params = params1;
            option0.fn = function (scope, buffer) {

                buffer.write('\n    <div class="mod-shop-hd">\n        <h3>');
                var id3 = scope.resolve(["shopInfo", "data", "shopTitle"]);
                buffer.write(id3, true);
                buffer.write('</h3>\n        <p class="mod-shop-flag">\n            <span class="rank J_rank" data-rank="');
                var id4 = scope.resolve(["shopInfo", "data", "sellerScore"]);
                buffer.write(id4, true);
                buffer.write('"></span>\n            ');
                var option5 = {};
                var params6 = [];
                params6.push('./shopIdentity');
                option5.params = params6;
                if (moduleWrap) {
                    require("./shopIdentity");
                    option5.params[0] = moduleWrap.resolve(option5.params[0]);
                }
                var commandRet7 = includeCommand.call(engine, scope, option5, buffer, 8, payload);
                if (commandRet7 && commandRet7.isBuffer) {
                    buffer = commandRet7;
                    commandRet7 = undefined;
                }
                buffer.write(commandRet7, false);
                buffer.write('\n        </p>\n    </div>\n    ');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option0, buffer, 3, payload);
            buffer.write('\n    ');
            var option8 = {};
            var params9 = [];
            params9.push('./shopDsr');
            option8.params = params9;
            if (moduleWrap) {
                require("./shopDsr");
                option8.params[0] = moduleWrap.resolve(option8.params[0]);
            }
            var commandRet10 = includeCommand.call(engine, scope, option8, buffer, 12, payload);
            if (commandRet10 && commandRet10.isBuffer) {
                buffer = commandRet10;
                commandRet10 = undefined;
            }
            buffer.write(commandRet10, false);
            buffer.write('\n    <div class="mod-shop-ft">\n        <ul class="mod-shop-link clearfix">\n            <li class="J_ww"><span class="J_WangWang wangwang" data-icon="small"\n                                   data-nick="');
            var id11 = scope.resolve(["shopInfo", "data", "nickForWWH5"]);
            buffer.write(id11, true);
            buffer.write('" data-encode="true"\n                                   data-display="inline"></span> <i class="icon-ww"></i>联系卖家</li>\n            ');
            var option12 = {
                escape: 1
            };
            var params13 = [];
            var id14 = scope.resolve(["shopInfo", "data", "hasShop"]);
            params13.push(id14);
            option12.params = params13;
            option12.fn = function (scope, buffer) {

                buffer.write('\n            <li><a href="');
                var id15 = scope.resolve(["shopInfo", "data", "shopUrl"]);
                buffer.write(id15, true);
                buffer.write('"><i class="icon-shop"></i>进入店铺</a></li>\n            ');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option12, buffer, 18, payload);
            buffer.write('\n        </ul>\n    </div>\n</div>\n\n<script>\n    KISSY.use("detail/mod", function(S,Mod) {\n        Mod.add({\n            name:"detail/shop/",\n            data:{\n                panel: "#J_ShopInfo"\n            }\n        });\n    });\n</script>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});