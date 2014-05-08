/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var footer = function (scope, buffer, session, undefined) {
            var engine = this,
                nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            var callFnUtil = utils["callFn"],
                callCommandUtil = utils["callCommand"],
                eachCommand = nativeCommands["each"],
                withCommand = nativeCommands["with"],
                ifCommand = nativeCommands["if"],
                setCommand = nativeCommands["set"],
                includeCommand = nativeCommands["include"],
                parseCommand = nativeCommands["parse"],
                extendCommand = nativeCommands["extend"],
                blockCommand = nativeCommands["block"],
                macroCommand = nativeCommands["macro"],
                debuggerCommand = nativeCommands["debugger"];
            if ("5.0.0" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
            }
            buffer.write('<div class="fr-footer" data-spm="991222533">\r\n    <div class="fr-layout fr-footer-layout">\r\n        <div class="footer-loginnav">\r\n            <a class="footer-login" href="">登录</a>\r\n            <a class="footer-register" href="">注册</a>\r\n            <a class="footer-user hidden" href=""></a>\r\n            <a class="footer-logout hidden" href="">退出</a>\r\n        </div>\r\n        <div class="footer-search">\r\n            <form id="J_TBSearchForm" action="http://s.taobao.com/search">\r\n                <ul class="J_Search clearfix">\r\n                    <li class="input">\r\n                        <input type="text" name="q" autocomplete="off">\r\n                        <p class="placeholder"><i class="icon-search"></i> <span>搜索</span></p>\r\n                        <i class="clearsearch">X</i>\r\n                    </li>\r\n                    <li class="btn hidden"><button type="button" class="btn-searchtb">搜淘宝</button></li>\r\n\r\n                    <li class="btn hidden"><button type="button" class="btn-searchshop"\r\n                                                   data-action="', 0);
            var option0 = {
                escape: 1
            };
            var params1 = [];
            var id2 = scope.resolve(["footer", "data", "shopUrl"], 0);
            params1.push(id2);
            option0.params = params1;
            option0.fn = function (scope, buffer) {
                buffer.write('footer.data.shopUrl', 0);
                return buffer;
            };
            option0.inverse = function (scope, buffer) {
                buffer.write('http://store.taobao.com/shop/noshop.htm', 0);
                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option0, buffer, 20, session);
            buffer.write('" hidefocus="true">搜本店</button></li>\r\n                </ul>\r\n                <input type="hidden" name="searcy_type" value="item" />\r\n                <input type="hidden" value="newHeader" name="s_from">\r\n                <input type="hidden" name="source">\r\n                <input type="hidden" name="ssid" value="s5-e" />\r\n                <input type="hidden" name="search" value="y" />\r\n            </form>\r\n        </div>\r\n        <div class="footer-coptright">\r\n            ', 0);
            var option3 = {
                escape: 1
            };
            var params4 = [];
            var id5 = scope.resolve(["footer", "data", "pcLink"], 0);
            params4.push(id5);
            option3.params = params4;
            option3.fn = function (scope, buffer) {
                buffer.write('<a href="', 0);
                var id6 = scope.resolve(["footer", "data", "pcLink"], 0);
                buffer.write(id6, true);
                buffer.write('&mt=0" target="_self" class="gotoPC">返回电脑\r\n            版</a>', 0);
                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option3, buffer, 30, session);
            buffer.write('\r\n            <p><a href="#">关于淘宝</a> <a href="">免责申明</a></p>\r\n            <p>&copy;copyright 2013 Taobao.com 版权所有</p>\r\n        </div>\r\n        <div id="J_ScrollTop" class="tool-gotop"><i class="icon-gotop"></i> 回顶部</div>\r\n    </div>\r\n</div>\r\n\r\n\r\n\r\n<script>\r\n    KISSY.use("detail/mod", function(S,Mod) {\r\n        Mod.add({\r\n            name:"detail/footer/",\r\n            data:{}\r\n        });\r\n    });\r\n</script>', 0);
            return buffer;
        };
footer.TPL_NAME = module.name;
return footer
});