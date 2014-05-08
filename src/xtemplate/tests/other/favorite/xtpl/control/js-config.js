/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var jsConfig = function (scope, buffer, session, undefined) {
            var engine = this,
                nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            var callFnUtil = utils["callFn"],
                callCommandUtil = utils["callCommand"],
                eachCommand = nativeCommands["each"],
                withCommand = nativeCommands["with"],
                ifCommand = nativeCommands["if"],
                setCommand = nativeCommands["set"],
                includeCommand = nativeCommands["include"],
                parseCommand = nativeCommands["parse"],
                extendCommand = nativeCommands["extend"],
                blockCommand = nativeCommands["block"],
                macroCommand = nativeCommands["macro"],
                debuggerCommand = nativeCommands["debugger"];
            if ("5.0.0" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
            }
            buffer.write('', 0);
            var option0 = {
                escape: 1
            };
            var params1 = [];
            var id2 = scope.resolve(["pageInfo", "totalCount"], 0);
            var exp4 = id2;
            var id3 = scope.resolve(["pageInfo", "bigPageSize"], 0);
            exp4 = (id2) > (id3);
            params1.push(exp4);
            option0.params = params1;
            option0.fn = function (scope, buffer) {
                buffer.write('\n    ', 0);
                var option5 = {
                    escape: 1
                };
                var hash6 = {};
                var id7 = scope.resolve(["pageInfo", "bigPageSize"], 0);
                hash6["totalItem"] = id7;
                option5.hash = hash6;
                var callRet8
                callRet8 = setCommand.call(engine, scope, option5, buffer, 2, session);
                if (callRet8 && callRet8.isBuffer) {
                    buffer = callRet8;
                    callRet8 = undefined;
                }
                buffer.write(callRet8, true);
                buffer.write('\n', 0);
                return buffer;
            };
            option0.inverse = function (scope, buffer) {
                buffer.write('\n    ', 0);
                var option9 = {
                    escape: 1
                };
                var hash10 = {};
                var id11 = scope.resolve(["pageInfo", "totalCount"], 0);
                var exp13 = id11;
                var id12 = scope.resolve(["queryData", "startrow"], 0);
                exp13 = (id11) - (id12);
                hash10["totalItem"] = exp13;
                option9.hash = hash10;
                var callRet14
                callRet14 = setCommand.call(engine, scope, option9, buffer, 4, session);
                if (callRet14 && callRet14.isBuffer) {
                    buffer = callRet14;
                    callRet14 = undefined;
                }
                buffer.write(callRet14, true);
                buffer.write('\n', 0);
                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option0, buffer, 1, session);
            buffer.write('\n\n<script>\n    window._alimm_spmact_on_ = 1;\n    window.g_config = {\n        toolbar: false,\n        appId: 2222,\n        collectedItemIndex: 1,\n        loadItemUrl: \'', 0);
            var option15 = {};
            var params16 = [];
            params16.push('/nodejs/item_collect_chunk.htm');
            params16.push('needNav=false');
            option15.params = params16;
            var callRet17
            callRet17 = callFnUtil(engine, scope, option15, buffer, ["queryUrl"], 0, 13);
            if (callRet17 && callRet17.isBuffer) {
                buffer = callRet17;
                callRet17 = undefined;
            }
            buffer.write(callRet17, false);
            buffer.write('\',\n        _tb_token_: \'', 0);
            var id18 = scope.resolve(["_tb_token_"], 0);
            buffer.write(id18, true);
            buffer.write('\',\n        deleteItemUrl: \'/json/DeleteCollection.htm?_tb_token_=', 0);
            var id19 = scope.resolve(["_tb_token_"], 0);
            buffer.write(id19, true);
            buffer.write('\',\n        restoreItemUrl: \'/json/restoreCollection.htm\',\n        delRemarkUrl: \'/json/DeleteNote.htm?_tb_token_=', 0);
            var id20 = scope.resolve(["_tb_token_"], 0);
            buffer.write(id20, true);
            buffer.write('\',\n        delUPUrl: \'/json/CancelTop.htm?_tb_token_=', 0);
            var id21 = scope.resolve(["_tb_token_"], 0);
            buffer.write(id21, true);
            buffer.write('\',\n        getAddClassUrl: \'/json/detail_class_list.htm\',\n        postAddClassUrl: \'/json/add_class.htm\',\n        editClassUrl: \'/json/edit_class.htm\',\n        classdelUrl: \'/json/del_class.htm\',\n        imgListRec: \'/itemapi/tabInfos.htm\',\n        classPoint:3,\n        totalItem: ', 0);
            var id22 = scope.resolve(["totalItem"], 0);
            buffer.write(id22, true);
            buffer.write(',\n        pageName: \'', 0);
            var id23 = scope.resolve(["info", "jsmod"], 0);
            buffer.write(id23, true);
            buffer.write('\',\n        bigPageSize: ', 0);
            var id24 = scope.resolve(["pageInfo", "bigPageSize"], 0);
            buffer.write(id24, true);
            buffer.write(', \n        spmHongbao : \'', 0);
            var id25 = scope.resolve(["spm", "hongbao"], 0);
            buffer.write(id25, true);
            buffer.write('\',\n        spmHongbaoHb : \'', 0);
            var id26 = scope.resolve(["spm", "hongbaoHb"], 0);
            buffer.write(id26, true);
            buffer.write('\',\n        spmHongbaoYh : \'', 0);
            var id27 = scope.resolve(["spm", "hongbaoYh"], 0);
            buffer.write(id27, true);
            buffer.write('\',\n        favType : \'1\',\n        postExitClassUrl : \'/json/del_item_class.htm\',\n        ap_mods:{\n            jstracker:[ .01 ]\n        },\n        isAsyncPage: true\n    };\n</script>\n', 0);
            return buffer;
        };
jsConfig.TPL_NAME = module.name;
return jsConfig
});