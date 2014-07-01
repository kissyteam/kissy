/** Compiled By kissy-xtemplate */
/*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
var footerHtml = function (scope, buffer, undefined) {
    var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
    var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
    buffer.write('<div class="fr-footer" data-spm="991222533">\r\n    <div class="fr-layout fr-footer-layout">\r\n        <div class="footer-loginnav">\r\n            <a class="footer-login" href="">\u767B\u5F55</a>\r\n            <a class="footer-register" href="">\u6CE8\u518C</a>\r\n            <a class="footer-user hidden" href=""></a>\r\n            <a class="footer-logout hidden" href="">\u9000\u51FA</a>\r\n        </div>\r\n        <div class="footer-search">\r\n            <form id="J_TBSearchForm" action="http://s.taobao.com/search">\r\n                <ul class="J_Search clearfix">\r\n                    <li class="input">\r\n                        <input type="text" name="q" autocomplete="off">\r\n                        <p class="placeholder"><i class="icon-search"></i> <span>\u641C\u7D22</span></p>\r\n                        <i class="clearsearch">X</i>\r\n                    </li>\r\n                    <li class="btn hidden"><button type="button" class="btn-searchtb">\u641C\u6DD8\u5B9D</button></li>\r\n\r\n                    <li class="btn hidden"><button type="button" class="btn-searchshop"\r\n                                                   data-action="', 0);
    var option0 = { escape: 1 };
    var params1 = [];
    var id2 = scope.resolve([
            'footer',
            'data',
            'shopUrl'
        ], 0);
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
    buffer = ifCommand.call(tpl, scope, option0, buffer, 20);
    buffer.write('" hidefocus="true">\u641C\u672C\u5E97</button></li>\r\n                </ul>\r\n                <input type="hidden" name="searcy_type" value="item" />\r\n                <input type="hidden" value="newHeader" name="s_from">\r\n                <input type="hidden" name="source">\r\n                <input type="hidden" name="ssid" value="s5-e" />\r\n                <input type="hidden" name="search" value="y" />\r\n            </form>\r\n        </div>\r\n        <div class="footer-coptright">\r\n            ', 0);
    var option3 = { escape: 1 };
    var params4 = [];
    var id5 = scope.resolve([
            'footer',
            'data',
            'pcLink'
        ], 0);
    params4.push(id5);
    option3.params = params4;
    option3.fn = function (scope, buffer) {
        buffer.write('<a href="', 0);
        var id6 = scope.resolve([
                'footer',
                'data',
                'pcLink'
            ], 0);
        buffer.write(id6, true);
        buffer.write('&mt=0" target="_self" class="gotoPC">\u8FD4\u56DE\u7535\u8111\r\n            \u7248</a>', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option3, buffer, 30);
    buffer.write('\r\n            <p><a href="#">\u5173\u4E8E\u6DD8\u5B9D</a> <a href="">\u514D\u8D23\u7533\u660E</a></p>\r\n            <p>&copy;copyright 2013 Taobao.com \u7248\u6743\u6240\u6709</p>\r\n        </div>\r\n        <div id="J_ScrollTop" class="tool-gotop"><i class="icon-gotop"></i> \u56DE\u9876\u90E8</div>\r\n    </div>\r\n</div>\r\n\r\n\r\n\r\n<script>\r\n    KISSY.use("detail/mod", function(S,Mod) {\r\n        Mod.add({\r\n            name:"detail/footer/",\r\n            data:{}\r\n        });\r\n    });\r\n</script>', 0);
    return buffer;
};
footerHtml.TPL_NAME = module.name;
footerHtml.version = '5.0.0';
module.exports = footerHtml;