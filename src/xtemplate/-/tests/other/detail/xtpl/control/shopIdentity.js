/** Compiled By kissy-xtemplate */
/*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
var shopIdentityHtml = function (scope, buffer, undefined) {
    var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
    var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
    buffer.write('<span class="others" data-spm="991222469">\r\n\r\n\t', 0);
    var option0 = { escape: 1 };
    var params1 = [];
    var id2 = scope.resolve([
            'shopIdentity',
            'data',
            'alipayCompanyAuth'
        ], 0);
    params1.push(id2);
    option0.params = params1;
    option0.fn = function (scope, buffer) {
        buffer.write('\r\n\t\t<a title="\u652F\u4ED8\u5B9D\u4F01\u4E1A\u8BA4\u8BC1" href="http://help.alipay.com/lab/210321-232507/0-232507.htm" target="_blank"><i class="icon-qyrz"></i></a>\r\n\t', 0);
        return buffer;
    };
    option0.inverse = function (scope, buffer) {
        buffer.write('\r\n        ', 0);
        var option3 = { escape: 1 };
        var params4 = [];
        var id5 = scope.resolve([
                'shopIdentity',
                'data',
                'alipayPersionAuth'
            ], 0);
        params4.push(id5);
        option3.params = params4;
        option3.fn = function (scope, buffer) {
            buffer.write('\r\n\t\t    <a title="\u652F\u4ED8\u5B9D\u4E2A\u4EBA\u8BA4\u8BC1" href="http://help.alipay.com/lab/210120-210321/0-210321.htm" target="_blank"><i class="icon-grrz"></i></a>\r\n\t    ', 0);
            return buffer;
        };
        option3.inverse = function (scope, buffer) {
            buffer.write('\r\n            ', 0);
            var option6 = { escape: 1 };
            var params7 = [];
            var id8 = scope.resolve([
                    'shopIdentity',
                    'data',
                    'personalAuth'
                ], 0);
            params7.push(id8);
            option6.params = params7;
            option6.fn = function (scope, buffer) {
                buffer.write('\r\n\t\t        <a title="\u6DD8\u5B9D\u4E2A\u4EBA\u5B9E\u540D\u8BA4\u8BC1" href="http://service.taobao.com/support/5-27-31/help-1055.htm" target="_blank"><i class="icon-grrz"></i></a>\r\n            ', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option6, buffer, 9);
            buffer.write('\r\n        ', 0);
            return buffer;
        };
        buffer = ifCommand.call(tpl, scope, option3, buffer, 6);
        buffer.write('\r\n\t', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option0, buffer, 3);
    buffer.write('\r\n\r\n\r\n\t', 0);
    var option9 = { escape: 1 };
    var params10 = [];
    var id11 = scope.resolve([
            'shopIdentity',
            'data',
            'globalSeller'
        ], 0);
    params10.push(id11);
    option9.params = params10;
    option9.fn = function (scope, buffer) {
        buffer.write('\r\n\t\t<a href="#" onclick="javascript:return false;" target="_blank" title="\u5168\u7403\u8D2D\u5356\u5BB6"><i class="icon-global"></i></a>\r\n\t', 0);
        return buffer;
    };
    option9.inverse = function (scope, buffer) {
        buffer.write('\r\n        ', 0);
        var option12 = { escape: 1 };
        var params13 = [];
        var id14 = scope.resolve([
                'shopIdentity',
                'data',
                'starSeller'
            ], 0);
        params13.push(id14);
        option12.params = params13;
        option12.fn = function (scope, buffer) {
            buffer.write('\r\n\t\t    <a href="#" onclick="javascript:return false;" target="_blank" title="\u660E\u661F\u5356\u5BB6"><i class="icon-star"></i></a>\r\n\t    ', 0);
            return buffer;
        };
        option12.inverse = function (scope, buffer) {
            buffer.write('\r\n            ', 0);
            var option15 = { escape: 1 };
            var params16 = [];
            var id17 = scope.resolve([
                    'shopIdentity',
                    'data',
                    'protectSeller'
                ], 0);
            params16.push(id17);
            option15.params = params16;
            option15.fn = function (scope, buffer) {
                buffer.write('\r\n\t\t        <a href="#" onclick="javascript:return false;" target="_blank" title="\u6D88\u4FDD\u5356\u5BB6"><i class="icon-xb"></i></a>\r\n            ', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option15, buffer, 22);
            buffer.write('\r\n        ', 0);
            return buffer;
        };
        buffer = ifCommand.call(tpl, scope, option12, buffer, 19);
        buffer.write('\r\n\t', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option9, buffer, 16);
    buffer.write('\r\n\r\n</span>', 0);
    return buffer;
};
shopIdentityHtml.TPL_NAME = module.name;
shopIdentityHtml.version = '5.0.0';
module.exports = shopIdentityHtml;