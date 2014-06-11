/** Compiled By kissy-xtemplate */
/*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
var widgetPageDirectionXtpl = function (scope, buffer, undefined) {
    var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
    var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
    buffer.write('', 0);
    var option0 = { escape: 1 };
    var hash1 = {};
    var id2 = scope.resolve([
            'pageInfo',
            'bigTotalPage'
        ], 0);
    hash1['totalpage'] = id2;
    option0.hash = hash1;
    var callRet3;
    callRet3 = setCommand.call(tpl, scope, option0, buffer, 1);
    if (callRet3 && callRet3.isBuffer) {
        buffer = callRet3;
        callRet3 = undefined;
    }
    buffer.write(callRet3, true);
    buffer.write('\r\n', 0);
    var option4 = { escape: 1 };
    var params5 = [];
    var id6 = scope.resolve(['totalpage'], 0);
    var exp7 = id6;
    exp7 = id6 > 100;
    params5.push(exp7);
    option4.params = params5;
    option4.fn = function (scope, buffer) {
        buffer.write('\r\n    ', 0);
        var option8 = { escape: 1 };
        var hash9 = {};
        hash9['totalpage'] = 100;
        option8.hash = hash9;
        var callRet10;
        callRet10 = setCommand.call(tpl, scope, option8, buffer, 3);
        if (callRet10 && callRet10.isBuffer) {
            buffer = callRet10;
            callRet10 = undefined;
        }
        buffer.write(callRet10, true);
        buffer.write('\r\n', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option4, buffer, 2);
    buffer.write('\r\n\r\n', 0);
    var option11 = { escape: 1 };
    var hash12 = {};
    var id13 = scope.resolve([
            'pageInfo',
            'bigPageNum'
        ], 0);
    hash12['currentpage'] = id13;
    option11.hash = hash12;
    var callRet14;
    callRet14 = setCommand.call(tpl, scope, option11, buffer, 6);
    if (callRet14 && callRet14.isBuffer) {
        buffer = callRet14;
        callRet14 = undefined;
    }
    buffer.write(callRet14, true);
    buffer.write('\r\n', 0);
    var option15 = { escape: 1 };
    var hash16 = {};
    var id17 = scope.resolve(['currentpage'], 0);
    var exp18 = id17;
    exp18 = id17 - 1;
    hash16['prepage'] = exp18;
    option15.hash = hash16;
    var callRet19;
    callRet19 = setCommand.call(tpl, scope, option15, buffer, 7);
    if (callRet19 && callRet19.isBuffer) {
        buffer = callRet19;
        callRet19 = undefined;
    }
    buffer.write(callRet19, true);
    buffer.write('\r\n', 0);
    var option20 = { escape: 1 };
    var hash21 = {};
    var id22 = scope.resolve(['currentpage'], 0);
    var exp23 = id22;
    exp23 = id22 + 1;
    hash21['nextpage'] = exp23;
    option20.hash = hash21;
    var callRet24;
    callRet24 = setCommand.call(tpl, scope, option20, buffer, 8);
    if (callRet24 && callRet24.isBuffer) {
        buffer = callRet24;
        callRet24 = undefined;
    }
    buffer.write(callRet24, true);
    buffer.write('\r\n', 0);
    var option25 = { escape: 1 };
    var hash26 = {};
    var id27 = scope.resolve([
            'pageInfo',
            'bigPageSize'
        ], 0);
    hash26['pagesize'] = id27;
    option25.hash = hash26;
    var callRet28;
    callRet28 = setCommand.call(tpl, scope, option25, buffer, 9);
    if (callRet28 && callRet28.isBuffer) {
        buffer = callRet28;
        callRet28 = undefined;
    }
    buffer.write(callRet28, true);
    buffer.write('\r\n\r\n', 0);
    var option29 = { escape: 1 };
    var params30 = [];
    var id31 = scope.resolve(['nextpage'], 0);
    var exp33 = id31;
    var id32 = scope.resolve(['totalpage'], 0);
    exp33 = id31 > id32;
    params30.push(exp33);
    option29.params = params30;
    option29.fn = function (scope, buffer) {
        buffer.write('\r\n    ', 0);
        var option34 = { escape: 1 };
        var hash35 = {};
        var id36 = scope.resolve(['totalpage'], 0);
        hash35['defaultpage'] = id36;
        option34.hash = hash35;
        var callRet37;
        callRet37 = setCommand.call(tpl, scope, option34, buffer, 12);
        if (callRet37 && callRet37.isBuffer) {
            buffer = callRet37;
            callRet37 = undefined;
        }
        buffer.write(callRet37, true);
        buffer.write('\r\n', 0);
        return buffer;
    };
    option29.inverse = function (scope, buffer) {
        buffer.write('\r\n    ', 0);
        var option38 = { escape: 1 };
        var hash39 = {};
        var id40 = scope.resolve(['nextpage'], 0);
        hash39['defaultpage'] = id40;
        option38.hash = hash39;
        var callRet41;
        callRet41 = setCommand.call(tpl, scope, option38, buffer, 14);
        if (callRet41 && callRet41.isBuffer) {
            buffer = callRet41;
            callRet41 = undefined;
        }
        buffer.write(callRet41, true);
        buffer.write('\r\n', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option29, buffer, 11);
    buffer.write('\r\n\r\n<div class="page-nav-top" data-spm="', 0);
    var id42 = scope.resolve([
            'spm',
            'page'
        ], 0);
    buffer.write(id42, true);
    buffer.write('">\r\n\r\n    ', 0);
    var option43 = { escape: 1 };
    var params44 = [];
    var id45 = scope.resolve(['prepage'], 0);
    var exp46 = id45;
    exp46 = id45 > 0;
    params44.push(exp46);
    option43.params = params44;
    option43.fn = function (scope, buffer) {
        buffer.write('\r\n        <a  data-spm="', 0);
        var id47 = scope.resolve([
                'spm',
                'pagePrevious'
            ], 0);
        buffer.write(id47, true);
        buffer.write('"\r\n            class="J_PrevPage  page-pre "\r\n            href="', 0);
        var option48 = {};
        var params49 = [];
        var id50 = scope.resolve(['prepage'], 0);
        params49.push(id50);
        option48.params = params49;
        var callRet51;
        callRet51 = callFnUtil(tpl, scope, option48, buffer, ['pageUrl'], 0, 22);
        if (callRet51 && callRet51.isBuffer) {
            buffer = callRet51;
            callRet51 = undefined;
        }
        buffer.write(callRet51, false);
        buffer.write('">\u4E0A\u4E00\u9875</a>\r\n\r\n    ', 0);
        return buffer;
    };
    option43.inverse = function (scope, buffer) {
        buffer.write('\r\n        <a class="J_PrevPage  page-pre disabled" href="#">\u4E0A\u4E00\u9875</a>\r\n    ', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option43, buffer, 19);
    buffer.write('\r\n\r\n    ', 0);
    var option52 = { escape: 1 };
    var params53 = [];
    var id54 = scope.resolve(['nextpage'], 0);
    var exp57 = id54;
    var id55 = scope.resolve(['totalpage'], 0);
    var exp56 = id55;
    exp56 = id55 + 1;
    exp57 = id54 < exp56;
    params53.push(exp57);
    option52.params = params53;
    option52.fn = function (scope, buffer) {
        buffer.write('\r\n        <a  data-spm="', 0);
        var id58 = scope.resolve([
                'spm',
                'pageNext'
            ], 0);
        buffer.write(id58, true);
        buffer.write('"\r\n            class="J_NextPage page-next"\r\n            href="', 0);
        var option59 = {};
        var params60 = [];
        var id61 = scope.resolve(['nextpage'], 0);
        params60.push(id61);
        option59.params = params60;
        var callRet62;
        callRet62 = callFnUtil(tpl, scope, option59, buffer, ['pageUrl'], 0, 31);
        if (callRet62 && callRet62.isBuffer) {
            buffer = callRet62;
            callRet62 = undefined;
        }
        buffer.write(callRet62, false);
        buffer.write('">\u4E0B\u4E00\u9875</a>\r\n\r\n    ', 0);
        return buffer;
    };
    option52.inverse = function (scope, buffer) {
        buffer.write('\r\n        <a class="J_NextPage page-next disabled" href="#">\u4E0B\u4E00\u9875</a>\r\n    ', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option52, buffer, 28);
    buffer.write('\r\n\r\n</div>\r\n\r\n', 0);
    return buffer;
};
widgetPageDirectionXtpl.TPL_NAME = module.name;
widgetPageDirectionXtpl.version = '5.0.0';
module.exports = widgetPageDirectionXtpl;