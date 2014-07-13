/** Compiled By kissy-xtemplate */
/*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
var jsConfigXtpl = function (scope, buffer, undefined) {
    var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
    var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
    buffer.write('', 0);
    var option0 = { escape: 1 };
    var params1 = [];
    var id2 = scope.resolve([
            'pageInfo',
            'totalCount'
        ], 0);
    var exp4 = id2;
    var id3 = scope.resolve([
            'pageInfo',
            'bigPageSize'
        ], 0);
    exp4 = id2 > id3;
    params1.push(exp4);
    option0.params = params1;
    option0.fn = function (scope, buffer) {
        buffer.write('\r\n    ', 0);
        var option5 = { escape: 1 };
        var hash6 = {};
        var id7 = scope.resolve([
                'pageInfo',
                'bigPageSize'
            ], 0);
        hash6['totalItem'] = id7;
        option5.hash = hash6;
        var callRet8;
        callRet8 = setCommand.call(tpl, scope, option5, buffer, 2);
        if (callRet8 && callRet8.isBuffer) {
            buffer = callRet8;
            callRet8 = undefined;
        }
        buffer.write(callRet8, true);
        buffer.write('\r\n', 0);
        return buffer;
    };
    option0.inverse = function (scope, buffer) {
        buffer.write('\r\n    ', 0);
        var option9 = { escape: 1 };
        var hash10 = {};
        var id11 = scope.resolve([
                'pageInfo',
                'totalCount'
            ], 0);
        var exp13 = id11;
        var id12 = scope.resolve([
                'queryData',
                'startrow'
            ], 0);
        exp13 = id11 - id12;
        hash10['totalItem'] = exp13;
        option9.hash = hash10;
        var callRet14;
        callRet14 = setCommand.call(tpl, scope, option9, buffer, 4);
        if (callRet14 && callRet14.isBuffer) {
            buffer = callRet14;
            callRet14 = undefined;
        }
        buffer.write(callRet14, true);
        buffer.write('\r\n', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option0, buffer, 1);
    buffer.write('\r\n\r\n<script>\r\n    window._alimm_spmact_on_ = 1;\r\n    window.g_config = {\r\n        toolbar: false,\r\n        appId: 2222,\r\n        collectedItemIndex: 1,\r\n        loadItemUrl: \'', 0);
    var option15 = {};
    var params16 = [];
    params16.push('/nodejs/item_collect_chunk.htm');
    params16.push('needNav=false');
    option15.params = params16;
    var callRet17;
    callRet17 = callFnUtil(tpl, scope, option15, buffer, ['queryUrl'], 0, 13);
    if (callRet17 && callRet17.isBuffer) {
        buffer = callRet17;
        callRet17 = undefined;
    }
    buffer.write(callRet17, false);
    buffer.write('\',\r\n        _tb_token_: \'', 0);
    var id18 = scope.resolve(['_tb_token_'], 0);
    buffer.write(id18, true);
    buffer.write('\',\r\n        deleteItemUrl: \'/json/DeleteCollection.htm?_tb_token_=', 0);
    var id19 = scope.resolve(['_tb_token_'], 0);
    buffer.write(id19, true);
    buffer.write('\',\r\n        restoreItemUrl: \'/json/restoreCollection.htm\',\r\n        delRemarkUrl: \'/json/DeleteNote.htm?_tb_token_=', 0);
    var id20 = scope.resolve(['_tb_token_'], 0);
    buffer.write(id20, true);
    buffer.write('\',\r\n        delUPUrl: \'/json/CancelTop.htm?_tb_token_=', 0);
    var id21 = scope.resolve(['_tb_token_'], 0);
    buffer.write(id21, true);
    buffer.write('\',\r\n        getAddClassUrl: \'/json/detail_class_list.htm\',\r\n        postAddClassUrl: \'/json/add_class.htm\',\r\n        editClassUrl: \'/json/edit_class.htm\',\r\n        classdelUrl: \'/json/del_class.htm\',\r\n        imgListRec: \'/itemapi/tabInfos.htm\',\r\n        classPoint:3,\r\n        totalItem: ', 0);
    var id22 = scope.resolve(['totalItem'], 0);
    buffer.write(id22, true);
    buffer.write(',\r\n        pageName: \'', 0);
    var id23 = scope.resolve([
            'info',
            'jsmod'
        ], 0);
    buffer.write(id23, true);
    buffer.write('\',\r\n        bigPageSize: ', 0);
    var id24 = scope.resolve([
            'pageInfo',
            'bigPageSize'
        ], 0);
    buffer.write(id24, true);
    buffer.write(', \r\n        spmHongbao : \'', 0);
    var id25 = scope.resolve([
            'spm',
            'hongbao'
        ], 0);
    buffer.write(id25, true);
    buffer.write('\',\r\n        spmHongbaoHb : \'', 0);
    var id26 = scope.resolve([
            'spm',
            'hongbaoHb'
        ], 0);
    buffer.write(id26, true);
    buffer.write('\',\r\n        spmHongbaoYh : \'', 0);
    var id27 = scope.resolve([
            'spm',
            'hongbaoYh'
        ], 0);
    buffer.write(id27, true);
    buffer.write('\',\r\n        favType : \'1\',\r\n        postExitClassUrl : \'/json/del_item_class.htm\',\r\n        ap_mods:{\r\n            jstracker:[ .01 ]\r\n        },\r\n        isAsyncPage: true\r\n    };\r\n</script>\r\n', 0);
    return buffer;
};
jsConfigXtpl.TPL_NAME = module.name;
jsConfigXtpl.version = '5.0.0';
module.exports = jsConfigXtpl;