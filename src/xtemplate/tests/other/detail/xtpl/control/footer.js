/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        var t = function (scope, buffer, payload, undefined) {
            var engine = this,
                nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            if ("5.0.0" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
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
            buffer.write('<div class="fr-footer" data-spm="991222533">\n    <div class="fr-layout fr-footer-layout">\n        <div class="footer-loginnav">\n            <a class="footer-login" href="">登录</a>\n            <a class="footer-register" href="">注册</a>\n            <a class="footer-user hidden" href=""></a>\n            <a class="footer-logout hidden" href="">退出</a>\n        </div>\n        <div class="footer-search">\n            <form id="J_TBSearchForm" action="http://s.taobao.com/search">\n                <ul class="J_Search clearfix">\n                    <li class="input">\n                        <input type="text" name="q" autocomplete="off">\n                        <p class="placeholder"><i class="icon-search"></i> <span>搜索</span></p>\n                        <i class="clearsearch">X</i>\n                    </li>\n                    <li class="btn hidden"><button type="button" class="btn-searchtb">搜淘宝</button></li>\n\n                    <li class="btn hidden"><button type="button" class="btn-searchshop"\n                                                   data-action="');
            var option0 = {
                escape: 1
            };
            var params1 = [];
            var id2 = scope.resolve(["footer", "data", "shopUrl"]);
            params1.push(id2);
            option0.params = params1;
            option0.fn = function (scope, buffer) {

                buffer.write('footer.data.shopUrl');

                return buffer;
            };
            option0.inverse = function (scope, buffer) {

                buffer.write('http://store.taobao.com/shop/noshop.htm');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option0, buffer, 20, payload);
            buffer.write('" hidefocus="true">搜本店</button></li>\n                </ul>\n                <input type="hidden" name="searcy_type" value="item" />\n                <input type="hidden" value="newHeader" name="s_from">\n                <input type="hidden" name="source">\n                <input type="hidden" name="ssid" value="s5-e" />\n                <input type="hidden" name="search" value="y" />\n            </form>\n        </div>\n        <div class="footer-coptright">\n            ');
            var option3 = {
                escape: 1
            };
            var params4 = [];
            var id5 = scope.resolve(["footer", "data", "pcLink"]);
            params4.push(id5);
            option3.params = params4;
            option3.fn = function (scope, buffer) {

                buffer.write('<a href="');
                var id6 = scope.resolve(["footer", "data", "pcLink"]);
                buffer.write(id6, true);
                buffer.write('&mt=0" target="_self" class="gotoPC">返回电脑\n            版</a>');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option3, buffer, 30, payload);
            buffer.write('\n            <p><a href="#">关于淘宝</a> <a href="">免责申明</a></p>\n            <p>&copy;copyright 2013 Taobao.com 版权所有</p>\n        </div>\n        <div id="J_ScrollTop" class="tool-gotop"><i class="icon-gotop"></i> 回顶部</div>\n    </div>\n</div>\n\n\n\n<script>\n    KISSY.use("detail/mod", function(S,Mod) {\n        Mod.add({\n            name:"detail/footer/",\n            data:{}\n        });\n    });\n</script>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});