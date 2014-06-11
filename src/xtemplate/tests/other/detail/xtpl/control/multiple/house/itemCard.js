/** Compiled By kissy-xtemplate */
/*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
var itemCardHtml = function (scope, buffer, undefined) {
    var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
    var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
    buffer.write('', 0);
    var option0 = { escape: 1 };
    var params1 = [];
    var id2 = scope.resolve([
            'itemPrice',
            'extra'
        ], 0);
    params1.push(id2);
    option0.params = params1;
    option0.fn = function (scope, buffer) {
        buffer.write('\r\n<a class="btn-linkbtn" href="http://house.taobao.com/buyer/appointForm.htm?itemId=', 0);
        var id3 = scope.resolve([
                'itemPrice',
                'itemId'
            ], 0);
        buffer.write(id3, true);
        buffer.write('" title="\uFFFD\uFFFD\uFFFD\uFFFD\u0524\u053C"\r\n   id="J_LinkAppoint" >\uFFFD\uFFFD\uFFFD\uFFFD\u0524\u053C</a>\r\n', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option0, buffer, 1);
    return buffer;
};
itemCardHtml.TPL_NAME = module.name;
itemCardHtml.version = '5.0.0';
module.exports = itemCardHtml;