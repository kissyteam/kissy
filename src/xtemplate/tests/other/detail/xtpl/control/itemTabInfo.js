/** Compiled By kissy-xtemplate */
/*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
var itemTabInfoHtml = function (scope, buffer, undefined) {
    var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
    var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
    buffer.write('<!--\u5546\u54C1\u6982\u8981-->\r\n<div class="mod-item-title mod-item-title-h1">', 0);
    var id0 = scope.resolve([
            'itemTabInfo',
            'data',
            'itemTitle'
        ], 0);
    buffer.write(id0, true);
    buffer.write('</div>\r\n\r\n<section class="pg-index">\r\n    <!--\u4E3B\u56FE-->\r\n    <div class="pg-index-col1">\r\n        <!--\u7126\u70B9\u5927\u56FE-->\r\n        ', 0);
    var option1 = {};
    var params2 = [];
    params2.push('./itemPic');
    option1.params = params2;
    require('./itemPic');
    var callRet3;
    callRet3 = includeCommand.call(tpl, scope, option1, buffer, 8);
    if (callRet3 && callRet3.isBuffer) {
        buffer = callRet3;
        callRet3 = undefined;
    }
    buffer.write(callRet3, false);
    buffer.write('\r\n    </div>\r\n    <!--\u4E3B\u56FE end-->\r\n\r\n    <!-- \u5B9D\u8D1D\u4FE1\u606F-->\r\n    <div class="pg-index-col2" id="J_property">\r\n        <div class="mod-property">\r\n            ', 0);
    var option4 = {};
    var params5 = [];
    params5.push('./itemPrice');
    option4.params = params5;
    require('./itemPrice');
    var callRet6;
    callRet6 = includeCommand.call(tpl, scope, option4, buffer, 15);
    if (callRet6 && callRet6.isBuffer) {
        buffer = callRet6;
        callRet6 = undefined;
    }
    buffer.write(callRet6, false);
    buffer.write('\r\n            <!--\u5E97\u94FA\u4FE1\u606F-->\r\n            ', 0);
    var option7 = {};
    var params8 = [];
    params8.push('./shopInfo');
    option7.params = params8;
    require('./shopInfo');
    var callRet9;
    callRet9 = includeCommand.call(tpl, scope, option7, buffer, 17);
    if (callRet9 && callRet9.isBuffer) {
        buffer = callRet9;
        callRet9 = undefined;
    }
    buffer.write(callRet9, false);
    buffer.write('\r\n        </div>\r\n    </div>\r\n    <!-- \u5B9D\u8D1D\u4FE1\u606F end-->\r\n\r\n</section>\r\n<!--\u5546\u54C1\u6982\u8981 end-->\r\n\r\n<script>\r\n    KISSY.use("detail/mod", function(S,Mod) {\r\n        Mod.add({\r\n            name:"detail/maininfo/",\r\n            data:{\r\n                panel:"#J_property"\r\n            }\r\n        });\r\n    });\r\n</script>\r\n\r\n\r\n', 0);
    return buffer;
};
itemTabInfoHtml.TPL_NAME = module.name;
itemTabInfoHtml.version = '5.0.0';
module.exports = itemTabInfoHtml;