/** Compiled By kissy-xtemplate */
/*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
var itemCollectPageXtpl = function (scope, buffer, undefined) {
    var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
    var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
    buffer.write('<div class="mercury-cont">\r\n    ', 0);
    var option0 = { escape: 1 };
    var params1 = [];
    var id2 = scope.resolve([
            'info',
            'hasData'
        ], 0);
    var exp4 = !id2;
    if (!id2) {
        var id3 = scope.resolve([
                'info',
                'hasQuery'
            ], 0);
        exp4 = !id3;
    }
    params1.push(exp4);
    option0.params = params1;
    option0.fn = function (scope, buffer) {
        buffer.write('\r\n        <div class="fav-list">\r\n            <div class="no-fav-result clearfix">\r\n                <div class="no-pic">\r\n                    <img src="http://img01.taobaocdn.com/tps/i1/T141OmXtFXXXXfNwfm-71-78.png">\r\n                </div>\r\n                <div class="no-result-tips">\r\n                    <p class="big-font">\u4F60\u8FD8\u6CA1\u6536\u85CF\u8FC7\u5B9D\u8D1D\u54E6</p>\r\n                    <p><a target="_blank" href="http://guang.taobao.com">\u53BB\u968F\u4FBF\u901B\u901B\u5427</a>\uFF0C\u770B\u770B\u6709\u6CA1\u6709\u559C\u6B22\u7684</p>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    ', 0);
        return buffer;
    };
    option0.inverse = function (scope, buffer) {
        buffer.write('\r\n\r\n        ', 0);
        var option5 = { escape: 1 };
        var params6 = [];
        params6.push('../control/section-tags-filter');
        option5.params = params6;
        require('../control/section-tags-filter');
        var callRet7;
        callRet7 = includeCommand.call(tpl, scope, option5, buffer, 16);
        if (callRet7 && callRet7.isBuffer) {
            buffer = callRet7;
            callRet7 = undefined;
        }
        buffer.write(callRet7, true);
        buffer.write('\r\n        ', 0);
        var option8 = { escape: 1 };
        var params9 = [];
        params9.push('../control/section-item-nav');
        option8.params = params9;
        require('../control/section-item-nav');
        var callRet10;
        callRet10 = includeCommand.call(tpl, scope, option8, buffer, 17);
        if (callRet10 && callRet10.isBuffer) {
            buffer = callRet10;
            callRet10 = undefined;
        }
        buffer.write(callRet10, true);
        buffer.write('\r\n\r\n        ', 0);
        var option11 = { escape: 1 };
        var params12 = [];
        var id13 = scope.resolve([
                'info',
                'hasData'
            ], 0);
        params12.push(!id13);
        option11.params = params12;
        option11.fn = function (scope, buffer) {
            buffer.write('\r\n            <div class="no-fav-result clearfix">\r\n                <div class="no-pic">\r\n                    <img src="http://img01.taobaocdn.com/tps/i1/T141OmXtFXXXXfNwfm-71-78.png">\r\n                </div>\r\n                <div class="no-result-tips">\r\n                    ', 0);
            var option14 = { escape: 1 };
            var params15 = [];
            var id16 = scope.resolve([
                    'queryData',
                    'isPromotion'
                ], 0);
            params15.push(id16);
            option14.params = params15;
            option14.fn = function (scope, buffer) {
                buffer.write('\r\n                        <p class="big-font">\u4ECA\u5929\u6CA1\u6709\u5B9D\u8D1D\u5728\u4F18\u60E0\u54E6</p>\r\n                        <p>\u53BB\u770B\u770B<a target="_blank" href="/shop_collect_list.htm">\u5E97\u94FA</a>\u90FD\u4E0A\u4E86\u54EA\u4E9B\u65B0\u6B3E\u5427</p>\r\n                    ', 0);
                return buffer;
            };
            option14.inverse = function (scope, buffer) {
                buffer.write(' ', 0);
                var option17 = { escape: 1 };
                var params18 = [];
                var id19 = scope.resolve([
                        'queryData',
                        'invalid'
                    ], 0);
                params18.push(id19);
                option17.params = params18;
                option17.fn = function (scope, buffer) {
                    buffer.write('\r\n                        <p class="big-font">\u6CA1\u6709\u5931\u6548\u7684\u5B9D\u8D1D\u54E6</p>\r\n                        <p>\u53BB\u770B\u770B<a target="_blank" href="/item_collect_list.htm">\u6536\u85CF</a>\u7684\u5176\u4ED6\u5B9D\u8D1D\u5427</p>\r\n                    ', 0);
                    return buffer;
                };
                option17.inverse = function (scope, buffer) {
                    buffer.write(' ', 0);
                    var option20 = { escape: 1 };
                    var params21 = [];
                    var id22 = scope.resolve([
                            'queryData',
                            'tagname'
                        ], 0);
                    var exp23 = id22;
                    exp23 = id22 !== '';
                    var exp26 = exp23;
                    if (!exp23) {
                        var id24 = scope.resolve([
                                'queryData',
                                'frontCategory'
                            ], 0);
                        var exp25 = id24;
                        exp25 = id24 > 0;
                        exp26 = exp25;
                    }
                    params21.push(exp26);
                    option20.params = params21;
                    option20.fn = function (scope, buffer) {
                        buffer.write('\r\n                        <p class="big-font">\u8FD9\u4E2A\u5206\u7C7B\u91CC\u8FD8\u6CA1\u6709\u5B9D\u8D1D\u54E6</p>\r\n                        <p>\u8D76\u7D27\u53BB<a target="_blank" href="/item_collect_list.htm">\u5168\u90E8\u5B9D\u8D1D</a>\u91CC\u6DFB\u52A0</p>\r\n\r\n                    ', 0);
                        return buffer;
                    };
                    option20.inverse = function (scope, buffer) {
                        buffer.write(' ', 0);
                        var option27 = { escape: 1 };
                        var params28 = [];
                        var id29 = scope.resolve([
                                'queryData',
                                'keyword'
                            ], 0);
                        var exp30 = id29;
                        exp30 = id29 !== '';
                        params28.push(exp30);
                        option27.params = params28;
                        option27.fn = function (scope, buffer) {
                            buffer.write('\r\n                        <p class="big-font">\u4F60\u7684\u6536\u85CF\u5939\u6CA1\u6709\u4E0E"', 0);
                            var id31 = scope.resolve([
                                    'queryData',
                                    'keyword'
                                ], 0);
                            buffer.write(id31, true);
                            buffer.write('"\u76F8\u5173\u7684\u5B9D\u8D1D\u54E6</p>\r\n\r\n                        <p>\u770B\u770B\u8F93\u5165\u7684\u6587\u5B57\u662F\u5426\u6709\u8BEF</p>\r\n\r\n                        <p>\u53BB\u6389\u4E0D\u5FC5\u8981\u7684\u5B57\u6216\u8BCD\uFF0C\u5982\u201C\u7684\u201D\u3001\u201C\u4EC0\u4E48\u201D\u7B49</p>\r\n\r\n                        <p>\u8C03\u6574\u5173\u952E\u5B57\uFF0C\u5982\u201C\u79FB\u52A8\u5145\u503C\u201D\u6539\u4E3A\u201C\u79FB\u52A8 \u5145\u503C\u201D\u6216\u201C\u79FB\u52A8\u201D</p>\r\n\r\n                        <p>\u53BB\u770B\u770B<a target="_blank" href="/shop_collect_list.htm">\u5E97\u94FA</a>\u90FD\u4E0A\u4E86\u54EA\u4E9B\u65B0\u6B3E\u5427</p>\r\n\r\n                    ', 0);
                            return buffer;
                        };
                        buffer = ifCommand.call(tpl, scope, option27, buffer, 35);
                        buffer.write('', 0);
                        return buffer;
                    };
                    buffer = ifCommand.call(tpl, scope, option20, buffer, 31);
                    buffer.write('', 0);
                    return buffer;
                };
                buffer = ifCommand.call(tpl, scope, option17, buffer, 28);
                buffer.write('\r\n\r\n                    ', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option14, buffer, 25);
            buffer.write('\r\n                </div>\r\n            </div>\r\n\r\n        ', 0);
            return buffer;
        };
        option11.inverse = function (scope, buffer) {
            buffer.write('\r\n            <div id="fav-list">\r\n                <ul class="img-item-list J_FavList clearfix">\r\n\r\n                    ', 0);
            buffer.write('\r\n                    ', 0);
            buffer.write('\r\n\r\n                    ', 0);
            var option32 = { escape: 1 };
            var params33 = [];
            params33.push('../control/item-collect-li');
            option32.params = params33;
            require('../control/item-collect-li');
            var callRet34;
            callRet34 = includeCommand.call(tpl, scope, option32, buffer, 59);
            if (callRet34 && callRet34.isBuffer) {
                buffer = callRet34;
                callRet34 = undefined;
            }
            buffer.write(callRet34, true);
            buffer.write('\r\n                </ul>\r\n                <div id="loading-img">\u6B63\u5728\u52A0\u8F7D</div>\r\n            </div>\r\n        ', 0);
            return buffer;
        };
        buffer = ifCommand.call(tpl, scope, option11, buffer, 19);
        buffer.write('\r\n\r\n        ', 0);
        var option35 = { escape: 1 };
        var params36 = [];
        var id37 = scope.resolve([
                'pageInfo',
                'totalCount'
            ], 0);
        var exp39 = id37;
        var id38 = scope.resolve([
                'pageInfo',
                'bigPageSize'
            ], 0);
        exp39 = id37 > id38;
        params36.push(exp39);
        option35.params = params36;
        option35.fn = function (scope, buffer) {
            buffer.write('\r\n            ', 0);
            var option40 = { escape: 1 };
            var params41 = [];
            params41.push('../control/widget-page-feed');
            option40.params = params41;
            require('../control/widget-page-feed');
            var callRet42;
            callRet42 = includeCommand.call(tpl, scope, option40, buffer, 66);
            if (callRet42 && callRet42.isBuffer) {
                buffer = callRet42;
                callRet42 = undefined;
            }
            buffer.write(callRet42, true);
            buffer.write('\r\n        ', 0);
            return buffer;
        };
        option35.inverse = function (scope, buffer) {
            buffer.write('\r\n            <div class="page-nav-box-none"></div>\r\n        ', 0);
            return buffer;
        };
        buffer = ifCommand.call(tpl, scope, option35, buffer, 65);
        buffer.write('\r\n\r\n    ', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option0, buffer, 2);
    buffer.write('\r\n\r\n    ', 0);
    buffer.write('\r\n    ', 0);
    var option43 = {};
    var params44 = [];
    params44.push('../control/ad-area');
    option43.params = params44;
    require('../control/ad-area');
    var callRet45;
    callRet45 = includeCommand.call(tpl, scope, option43, buffer, 74);
    if (callRet45 && callRet45.isBuffer) {
        buffer = callRet45;
        callRet45 = undefined;
    }
    buffer.write(callRet45, false);
    buffer.write('\r\n</div>\r\n', 0);
    return buffer;
};
itemCollectPageXtpl.TPL_NAME = module.name;
itemCollectPageXtpl.version = '5.0.0';
module.exports = itemCollectPageXtpl;