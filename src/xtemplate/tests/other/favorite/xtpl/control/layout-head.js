/** Compiled By kissy-xtemplate */
/*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
var layoutHeadXtpl = function (scope, buffer, undefined) {
    var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
    var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
    buffer.write('\r\n<meta http-equiv="X-UA-Compatible" content="IE=edge"/>\r\n<meta charset="utf-8"/>\r\n<meta name="spm-id" content="', 0);
    var id0 = scope.resolve([
            'spm',
            'meta'
        ], 0);
    buffer.write(id0, true);
    buffer.write('" />\r\n<meta name="viewport" content="width=device-width,initial-scale=1.0"/>\r\n<meta name="description" content="\u4E2D\u56FD\u6700\u5927\u3001\u6700\u5B89\u5168\u7684\u7F51\u4E0A\u4EA4\u6613\u793E\u533A,\u5C3D\u4EAB\u6DD8\u5B9D\u4E50\u8DA3\uFF01"/>\r\n<meta name="keywords" content="\u6DD8\u5B9D,\u638F\u5B9D,\u7F51\u4E0A\u8D2D\u7269,C2C,\u5728\u7EBF\u4EA4\u6613,\u4EA4\u6613\u5E02\u573A,\u7F51\u4E0A\u4EA4\u6613,\u4EA4\u6613\u5E02\u573A,\u7F51\u4E0A\u4E70,\u7F51\u4E0A\u5356\uFF0C\u8D2D\u7269\u7F51\u7AD9,\u56E2\u8D2D,\u7F51\u4E0A\u8D38\u6613,\u5B89\u5168\u8D2D\u7269,\u7535\u5B50\u5546\u52A1,\u653E\u5FC3\u4E70,\u4F9B\u5E94,\u4E70\u5356\u4FE1\u606F,\u7F51\u5E97,\u4E00\u53E3\u4EF7,\u62CD\u5356,\u7F51\u4E0A\u5F00\u5E97,\u7F51\u7EDC\u8D2D\u7269,\u6253\u6298,\u514D\u8D39\u5F00\u5E97,\u7F51\u8D2D,\u9891\u9053,\u5E97\u94FA" />\r\n\r\n<title>\r\n    ', 0);
    var option1 = { escape: 1 };
    var params2 = [];
    var id3 = scope.resolve([
            'contextData',
            'usernick'
        ], 0);
    params2.push(id3);
    option1.params = params2;
    option1.fn = function (scope, buffer) {
        buffer.write('\r\n        ', 0);
        var id4 = scope.resolve([
                'contextData',
                'usernick'
            ], 0);
        buffer.write(id4, true);
        buffer.write('\u7684\u6536\u85CF\u5939\r\n    ', 0);
        return buffer;
    };
    option1.inverse = function (scope, buffer) {
        buffer.write('\r\n        \u6536\u85CF\u5939\r\n    ', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option1, buffer, 10);
    buffer.write('\r\n</title>\r\n\r\n<link rel="shortcut icon" href="http://pics.taobao.com/favicon.ico" type="image/x-icon" />\r\n\r\n', 0);
    var option5 = { escape: 1 };
    var params6 = [];
    params6.push('global/js.html');
    params6.push('kissy=1.4.1');
    option5.params = params6;
    var callRet7;
    callRet7 = callFnUtil(tpl, scope, option5, buffer, ['vmcommon'], 0, 19);
    if (callRet7 && callRet7.isBuffer) {
        buffer = callRet7;
        callRet7 = undefined;
    }
    buffer.write(callRet7, true);
    buffer.write('\r\n', 0);
    var option8 = { escape: 1 };
    var params9 = [];
    params9.push('global/css.html');
    option8.params = params9;
    var callRet10;
    callRet10 = callFnUtil(tpl, scope, option8, buffer, ['vmcommon'], 0, 20);
    if (callRet10 && callRet10.isBuffer) {
        buffer = callRet10;
        callRet10 = undefined;
    }
    buffer.write(callRet10, true);
    buffer.write('\r\n\r\n<script src="http://g.tbcdn.cn/kissy/k/1.4.1/import-style-min.js" data-config="{combine:true}"></script>\r\n<script id="J_ConfigScript" src="', 0);
    var id11 = scope.resolve([
            'config',
            'server'
        ], 0);
    buffer.write(id11, true);
    buffer.write('/', 0);
    var id12 = scope.resolve([
            'config',
            'version'
        ], 0);
    buffer.write(id12, true);
    buffer.write('/c/config/pkg.js" data-v="', 0);
    var id13 = scope.resolve([
            'config',
            'version'
        ], 0);
    buffer.write(id13, true);
    buffer.write('" type="text/javascript"></script>\r\n<script src="', 0);
    var id14 = scope.resolve([
            'config',
            'server'
        ], 0);
    buffer.write(id14, true);
    buffer.write('/', 0);
    var id15 = scope.resolve([
            'config',
            'version'
        ], 0);
    buffer.write(id15, true);
    buffer.write('/deps.js"></script>\r\n<link href="http://g.tbcdn.cn/tbc/search-suggest/1.0.30/new_searchbox-min.css" rel="stylesheet"/>\r\n<script>KISSY.importStyle(\'mercury/p/', 0);
    var id16 = scope.resolve([
            'info',
            'jsmod'
        ], 0);
    buffer.write(id16, true);
    buffer.write('/index\');</script>\r\n<script src="http://a.tbcdn.cn/p/snsdk/core.js"></script>\r\n', 0);
    return buffer;
};
layoutHeadXtpl.TPL_NAME = module.name;
layoutHeadXtpl.version = '5.0.0';
module.exports = layoutHeadXtpl;