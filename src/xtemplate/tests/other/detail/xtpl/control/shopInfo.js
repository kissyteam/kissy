/** Compiled By kissy-xtemplate */
/*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
var shopInfoHtml = function (scope, buffer, undefined) {
    var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
    var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
    buffer.write('<!--\u638C\u67DC\u4FE1\u606F-->\r\n<div class="mod-shop" id="J_ShopInfo" data-spm="991222461">\r\n    ', 0);
    var option0 = { escape: 1 };
    var params1 = [];
    var id2 = scope.resolve([
            'shopInfo',
            'data',
            'hasShop'
        ], 0);
    params1.push(id2);
    option0.params = params1;
    option0.fn = function (scope, buffer) {
        buffer.write('\r\n    <div class="mod-shop-hd">\r\n        <h3>', 0);
        var id3 = scope.resolve([
                'shopInfo',
                'data',
                'shopTitle'
            ], 0);
        buffer.write(id3, true);
        buffer.write('</h3>\r\n        <p class="mod-shop-flag">\r\n            <span class="rank J_rank" data-rank="', 0);
        var id4 = scope.resolve([
                'shopInfo',
                'data',
                'sellerScore'
            ], 0);
        buffer.write(id4, true);
        buffer.write('"></span>\r\n            ', 0);
        var option5 = {};
        var params6 = [];
        params6.push('./shopIdentity');
        option5.params = params6;
        require('./shopIdentity');
        var callRet7;
        callRet7 = includeCommand.call(tpl, scope, option5, buffer, 8);
        if (callRet7 && callRet7.isBuffer) {
            buffer = callRet7;
            callRet7 = undefined;
        }
        buffer.write(callRet7, false);
        buffer.write('\r\n        </p>\r\n    </div>\r\n    ', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option0, buffer, 3);
    buffer.write('\r\n    ', 0);
    var option8 = {};
    var params9 = [];
    params9.push('./shopDsr');
    option8.params = params9;
    require('./shopDsr');
    var callRet10;
    callRet10 = includeCommand.call(tpl, scope, option8, buffer, 12);
    if (callRet10 && callRet10.isBuffer) {
        buffer = callRet10;
        callRet10 = undefined;
    }
    buffer.write(callRet10, false);
    buffer.write('\r\n    <div class="mod-shop-ft">\r\n        <ul class="mod-shop-link clearfix">\r\n            <li class="J_ww"><span class="J_WangWang wangwang" data-icon="small"\r\n                                   data-nick="', 0);
    var id11 = scope.resolve([
            'shopInfo',
            'data',
            'nickForWWH5'
        ], 0);
    buffer.write(id11, true);
    buffer.write('" data-encode="true"\r\n                                   data-display="inline"></span> <i class="icon-ww"></i>\u8054\u7CFB\u5356\u5BB6</li>\r\n            ', 0);
    var option12 = { escape: 1 };
    var params13 = [];
    var id14 = scope.resolve([
            'shopInfo',
            'data',
            'hasShop'
        ], 0);
    params13.push(id14);
    option12.params = params13;
    option12.fn = function (scope, buffer) {
        buffer.write('\r\n            <li><a href="', 0);
        var id15 = scope.resolve([
                'shopInfo',
                'data',
                'shopUrl'
            ], 0);
        buffer.write(id15, true);
        buffer.write('"><i class="icon-shop"></i>\u8FDB\u5165\u5E97\u94FA</a></li>\r\n            ', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option12, buffer, 18);
    buffer.write('\r\n        </ul>\r\n    </div>\r\n</div>\r\n\r\n<script>\r\n    KISSY.use("detail/mod", function(S,Mod) {\r\n        Mod.add({\r\n            name:"detail/shop/",\r\n            data:{\r\n                panel: "#J_ShopInfo"\r\n            }\r\n        });\r\n    });\r\n</script>', 0);
    return buffer;
};
shopInfoHtml.TPL_NAME = module.name;
shopInfoHtml.version = '5.0.0';
module.exports = shopInfoHtml;