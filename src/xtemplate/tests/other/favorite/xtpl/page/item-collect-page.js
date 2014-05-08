/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var itemCollectPage = function (scope, buffer, session, undefined) {
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
            buffer.write('<div class="mercury-cont">\n    ', 0);
            var option0 = {
                escape: 1
            };
            var params1 = [];
            var id2 = scope.resolve(["info", "hasData"], 0);
            var exp4 = !(id2);
            if ((!(id2))) {
                var id3 = scope.resolve(["info", "hasQuery"], 0);
                exp4 = !(id3);
            }
            params1.push(exp4);
            option0.params = params1;
            option0.fn = function (scope, buffer) {
                buffer.write('\n        <div class="fav-list">\n            <div class="no-fav-result clearfix">\n                <div class="no-pic">\n                    <img src="http://img01.taobaocdn.com/tps/i1/T141OmXtFXXXXfNwfm-71-78.png">\n                </div>\n                <div class="no-result-tips">\n                    <p class="big-font">你还没收藏过宝贝哦</p>\n                    <p><a target="_blank" href="http://guang.taobao.com">去随便逛逛吧</a>，看看有没有喜欢的</p>\n                </div>\n            </div>\n        </div>\n    ', 0);
                return buffer;
            };
            option0.inverse = function (scope, buffer) {
                buffer.write('\n\n        ', 0);
                var option5 = {
                    escape: 1
                };
                var params6 = [];
                params6.push('../control/section-tags-filter');
                option5.params = params6;
                require("../control/section-tags-filter");
                var callRet7
                callRet7 = includeCommand.call(engine, scope, option5, buffer, 16, session);
                if (callRet7 && callRet7.isBuffer) {
                    buffer = callRet7;
                    callRet7 = undefined;
                }
                buffer.write(callRet7, true);
                buffer.write('\n        ', 0);
                var option8 = {
                    escape: 1
                };
                var params9 = [];
                params9.push('../control/section-item-nav');
                option8.params = params9;
                require("../control/section-item-nav");
                var callRet10
                callRet10 = includeCommand.call(engine, scope, option8, buffer, 17, session);
                if (callRet10 && callRet10.isBuffer) {
                    buffer = callRet10;
                    callRet10 = undefined;
                }
                buffer.write(callRet10, true);
                buffer.write('\n\n        ', 0);
                var option11 = {
                    escape: 1
                };
                var params12 = [];
                var id13 = scope.resolve(["info", "hasData"], 0);
                params12.push(!(id13));
                option11.params = params12;
                option11.fn = function (scope, buffer) {
                    buffer.write('\n            <div class="no-fav-result clearfix">\n                <div class="no-pic">\n                    <img src="http://img01.taobaocdn.com/tps/i1/T141OmXtFXXXXfNwfm-71-78.png">\n                </div>\n                <div class="no-result-tips">\n                    ', 0);
                    var option14 = {
                        escape: 1
                    };
                    var params15 = [];
                    var id16 = scope.resolve(["queryData", "isPromotion"], 0);
                    params15.push(id16);
                    option14.params = params15;
                    option14.fn = function (scope, buffer) {
                        buffer.write('\n                        <p class="big-font">今天没有宝贝在优惠哦</p>\n                        <p>去看看<a target="_blank" href="/shop_collect_list.htm">店铺</a>都上了哪些新款吧</p>\n                    ', 0);
                        return buffer;
                    };
                    option14.inverse = function (scope, buffer) {
                        buffer.write(' ', 0);
                        var option17 = {
                            escape: 1
                        };
                        var params18 = [];
                        var id19 = scope.resolve(["queryData", "invalid"], 0);
                        params18.push(id19);
                        option17.params = params18;
                        option17.fn = function (scope, buffer) {
                            buffer.write('\n                        <p class="big-font">没有失效的宝贝哦</p>\n                        <p>去看看<a target="_blank" href="/item_collect_list.htm">收藏</a>的其他宝贝吧</p>\n                    ', 0);
                            return buffer;
                        };
                        option17.inverse = function (scope, buffer) {
                            buffer.write(' ', 0);
                            var option20 = {
                                escape: 1
                            };
                            var params21 = [];
                            var id22 = scope.resolve(["queryData", "tagname"], 0);
                            var exp23 = id22;
                            exp23 = (id22) !== ('');
                            var exp26 = exp23;
                            if (!(exp23)) {
                                var id24 = scope.resolve(["queryData", "frontCategory"], 0);
                                var exp25 = id24;
                                exp25 = (id24) > (0);
                                exp26 = exp25;
                            }
                            params21.push(exp26);
                            option20.params = params21;
                            option20.fn = function (scope, buffer) {
                                buffer.write('\n                        <p class="big-font">这个分类里还没有宝贝哦</p>\n                        <p>赶紧去<a target="_blank" href="/item_collect_list.htm">全部宝贝</a>里添加</p>\n\n                    ', 0);
                                return buffer;
                            };
                            option20.inverse = function (scope, buffer) {
                                buffer.write(' ', 0);
                                var option27 = {
                                    escape: 1
                                };
                                var params28 = [];
                                var id29 = scope.resolve(["queryData", "keyword"], 0);
                                var exp30 = id29;
                                exp30 = (id29) !== ('');
                                params28.push(exp30);
                                option27.params = params28;
                                option27.fn = function (scope, buffer) {
                                    buffer.write('\n                        <p class="big-font">你的收藏夹没有与"', 0);
                                    var id31 = scope.resolve(["queryData", "keyword"], 0);
                                    buffer.write(id31, true);
                                    buffer.write('"相关的宝贝哦</p>\n\n                        <p>看看输入的文字是否有误</p>\n\n                        <p>去掉不必要的字或词，如“的”、“什么”等</p>\n\n                        <p>调整关键字，如“移动充值”改为“移动 充值”或“移动”</p>\n\n                        <p>去看看<a target="_blank" href="/shop_collect_list.htm">店铺</a>都上了哪些新款吧</p>\n\n                    ', 0);
                                    return buffer;
                                };
                                buffer = ifCommand.call(engine, scope, option27, buffer, 35, session);
                                buffer.write('', 0);
                                return buffer;
                            };
                            buffer = ifCommand.call(engine, scope, option20, buffer, 31, session);
                            buffer.write('', 0);
                            return buffer;
                        };
                        buffer = ifCommand.call(engine, scope, option17, buffer, 28, session);
                        buffer.write('\n\n                    ', 0);
                        return buffer;
                    };
                    buffer = ifCommand.call(engine, scope, option14, buffer, 25, session);
                    buffer.write('\n                </div>\n            </div>\n\n        ', 0);
                    return buffer;
                };
                option11.inverse = function (scope, buffer) {
                    buffer.write('\n            <div id="fav-list">\n                <ul class="img-item-list J_FavList clearfix">\n\n                    ', 0);
                    buffer.write('\n                    ', 0);
                    buffer.write('\n\n                    ', 0);
                    var option32 = {
                        escape: 1
                    };
                    var params33 = [];
                    params33.push('../control/item-collect-li');
                    option32.params = params33;
                    require("../control/item-collect-li");
                    var callRet34
                    callRet34 = includeCommand.call(engine, scope, option32, buffer, 59, session);
                    if (callRet34 && callRet34.isBuffer) {
                        buffer = callRet34;
                        callRet34 = undefined;
                    }
                    buffer.write(callRet34, true);
                    buffer.write('\n                </ul>\n                <div id="loading-img">正在加载</div>\n            </div>\n        ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option11, buffer, 19, session);
                buffer.write('\n\n        ', 0);
                var option35 = {
                    escape: 1
                };
                var params36 = [];
                var id37 = scope.resolve(["pageInfo", "totalCount"], 0);
                var exp39 = id37;
                var id38 = scope.resolve(["pageInfo", "bigPageSize"], 0);
                exp39 = (id37) > (id38);
                params36.push(exp39);
                option35.params = params36;
                option35.fn = function (scope, buffer) {
                    buffer.write('\n            ', 0);
                    var option40 = {
                        escape: 1
                    };
                    var params41 = [];
                    params41.push('../control/widget-page-feed');
                    option40.params = params41;
                    require("../control/widget-page-feed");
                    var callRet42
                    callRet42 = includeCommand.call(engine, scope, option40, buffer, 66, session);
                    if (callRet42 && callRet42.isBuffer) {
                        buffer = callRet42;
                        callRet42 = undefined;
                    }
                    buffer.write(callRet42, true);
                    buffer.write('\n        ', 0);
                    return buffer;
                };
                option35.inverse = function (scope, buffer) {
                    buffer.write('\n            <div class="page-nav-box-none"></div>\n        ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option35, buffer, 65, session);
                buffer.write('\n\n    ', 0);
                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option0, buffer, 2, session);
            buffer.write('\n\n    ', 0);
            buffer.write('\n    ', 0);
            var option43 = {};
            var params44 = [];
            params44.push('../control/ad-area');
            option43.params = params44;
            require("../control/ad-area");
            var callRet45
            callRet45 = includeCommand.call(engine, scope, option43, buffer, 74, session);
            if (callRet45 && callRet45.isBuffer) {
                buffer = callRet45;
                callRet45 = undefined;
            }
            buffer.write(callRet45, false);
            buffer.write('\n</div>\n', 0);
            return buffer;
        };
itemCollectPage.TPL_NAME = module.name;
return itemCollectPage
});