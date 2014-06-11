/** Compiled By kissy-xtemplate */
/*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
var itemCollectLayoutXtpl = function (scope, buffer, undefined) {
    var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
    var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
    buffer.write('<!doctype html>\r\n<html>\r\n<!--Node.js-->\r\n<head>\r\n    ', 0);
    var option0 = {};
    var params1 = [];
    params1.push('../control/js-config');
    option0.params = params1;
    require('../control/js-config');
    var callRet2;
    callRet2 = includeCommand.call(tpl, scope, option0, buffer, 5);
    if (callRet2 && callRet2.isBuffer) {
        buffer = callRet2;
        callRet2 = undefined;
    }
    buffer.write(callRet2, false);
    buffer.write('\r\n    ', 0);
    var option3 = {};
    var params4 = [];
    params4.push('../control/layout-head');
    option3.params = params4;
    require('../control/layout-head');
    var callRet5;
    callRet5 = includeCommand.call(tpl, scope, option3, buffer, 6);
    if (callRet5 && callRet5.isBuffer) {
        buffer = callRet5;
        callRet5 = undefined;
    }
    buffer.write(callRet5, false);
    buffer.write('\r\n\r\n    <link rel="stylesheet" type="text/css" href="http://a.tbcdn.cn/apps/smf/utils/applyCoupon-min.css?t=20140105.css" />\r\n\r\n</head>\r\n\r\n<body data-spm="', 0);
    var id6 = scope.resolve([
            'spm',
            'body'
        ], 0);
    buffer.write(id6, true);
    buffer.write('">\r\n\r\n    <script src="', 0);
    var id7 = scope.resolve([
            'config',
            'server'
        ], 0);
    buffer.write(id7, true);
    buffer.write('/', 0);
    var id8 = scope.resolve([
            'config',
            'version'
        ], 0);
    buffer.write(id8, true);
    buffer.write('/c/responsive/index.js"></script>\r\n    <script src="http://a.tbcdn.cn/apps/smf/utils/applyCouponWidget-min.js?t=20140107.js"></script>\r\n\r\n    ', 0);
    var option9 = { escape: 1 };
    var params10 = [];
    params10.push('global/header.html');
    option9.params = params10;
    var callRet11;
    callRet11 = callFnUtil(tpl, scope, option9, buffer, ['vmcommon'], 0, 17);
    if (callRet11 && callRet11.isBuffer) {
        buffer = callRet11;
        callRet11 = undefined;
    }
    buffer.write(callRet11, true);
    buffer.write('\r\n    <script>TB.Global.init();</script>\r\n\r\n    <div id="page">\r\n        ', 0);
    var option12 = { escape: 1 };
    var params13 = [];
    params13.push('mercury/topbanner2013.php');
    option12.params = params13;
    var callRet14;
    callRet14 = callFnUtil(tpl, scope, option12, buffer, ['tms'], 0, 21);
    if (callRet14 && callRet14.isBuffer) {
        buffer = callRet14;
        callRet14 = undefined;
    }
    buffer.write(callRet14, true);
    buffer.write('\r\n\r\n        <div id="content">\r\n            <div id="mercury">\r\n                ', 0);
    var option15 = {};
    var params16 = [];
    params16.push('../control/layout-nav');
    option15.params = params16;
    require('../control/layout-nav');
    var callRet17;
    callRet17 = includeCommand.call(tpl, scope, option15, buffer, 25);
    if (callRet17 && callRet17.isBuffer) {
        buffer = callRet17;
        callRet17 = undefined;
    }
    buffer.write(callRet17, false);
    buffer.write('\r\n\r\n                ', 0);
    var option18 = {};
    var params19 = [];
    params19.push('content');
    option18.params = params19;
    var callRet20;
    callRet20 = blockCommand.call(tpl, scope, option18, buffer, 27);
    if (callRet20 && callRet20.isBuffer) {
        buffer = callRet20;
        callRet20 = undefined;
    }
    buffer.write(callRet20, false);
    buffer.write('\r\n            </div>\r\n        </div>\r\n    </div>\r\n\r\n    ', 0);
    var option21 = {};
    var params22 = [];
    params22.push('../control/widget-to-top');
    option21.params = params22;
    require('../control/widget-to-top');
    var callRet23;
    callRet23 = includeCommand.call(tpl, scope, option21, buffer, 32);
    if (callRet23 && callRet23.isBuffer) {
        buffer = callRet23;
        callRet23 = undefined;
    }
    buffer.write(callRet23, false);
    buffer.write('\r\n\r\n    <div class="page-footer-hidden">\r\n        ', 0);
    var option24 = { escape: 1 };
    var params25 = [];
    params25.push('global/footer.html');
    option24.params = params25;
    var callRet26;
    callRet26 = callFnUtil(tpl, scope, option24, buffer, ['vmcommon'], 0, 35);
    if (callRet26 && callRet26.isBuffer) {
        buffer = callRet26;
        callRet26 = undefined;
    }
    buffer.write(callRet26, true);
    buffer.write('\r\n    </div>\r\n\r\n    <script>\r\n    KISSY.use(\'mercury/p/', 0);
    var id27 = scope.resolve([
            'info',
            'jsmod'
        ], 0);
    buffer.write(id27, true);
    buffer.write('/index\', function (S, mod) {\r\n        new mod();\r\n    });\r\n    </script>\r\n\r\n    ', 0);
    var option28 = {};
    var params29 = [];
    params29.push('mercury/1212css.php');
    option28.params = params29;
    var callRet30;
    callRet30 = callFnUtil(tpl, scope, option28, buffer, ['tms'], 0, 44);
    if (callRet30 && callRet30.isBuffer) {
        buffer = callRet30;
        callRet30 = undefined;
    }
    buffer.write(callRet30, false);
    buffer.write('\r\n    <div id="appendBox" data-spm="', 0);
    var id31 = scope.resolve([
            'spm',
            'appendBox'
        ], 0);
    buffer.write(id31, true);
    buffer.write('"></div>\r\n\r\n</body>\r\n</html>\r\n', 0);
    return buffer;
};
itemCollectLayoutXtpl.TPL_NAME = module.name;
itemCollectLayoutXtpl.version = '5.0.0';
module.exports = itemCollectLayoutXtpl;