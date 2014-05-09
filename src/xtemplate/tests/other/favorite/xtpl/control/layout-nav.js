/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var layoutNav = function (scope, buffer, undefined) {
            var tpl = this,
                nativeCommands = tpl.root.nativeCommands,
                utils = tpl.root.utils;
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
            buffer.write('', 0);
            buffer.write('\r\n', 0);
            var option0 = {
                escape: 1
            };
            var hash1 = {};
            var id2 = scope.resolve(["pageLink"], 0);
            hash1["searchLink"] = id2;
            option0.hash = hash1;
            var callRet3
            callRet3 = setCommand.call(tpl, scope, option0, buffer, 2);
            if (callRet3 && callRet3.isBuffer) {
                buffer = callRet3;
                callRet3 = undefined;
            }
            buffer.write(callRet3, true);
            buffer.write('\r\n', 0);
            var option4 = {
                escape: 1
            };
            var hash5 = {};
            var id6 = scope.resolve(["pageLink"], 0);
            hash5["itemlink"] = id6;
            option4.hash = hash5;
            var callRet7
            callRet7 = setCommand.call(tpl, scope, option4, buffer, 3);
            if (callRet7 && callRet7.isBuffer) {
                buffer = callRet7;
                callRet7 = undefined;
            }
            buffer.write(callRet7, true);
            buffer.write('\r\n', 0);
            var option8 = {
                escape: 1
            };
            var hash9 = {};
            var id10 = scope.resolve(["pageLink"], 0);
            hash9["logolink"] = id10;
            option8.hash = hash9;
            var callRet11
            callRet11 = setCommand.call(tpl, scope, option8, buffer, 4);
            if (callRet11 && callRet11.isBuffer) {
                buffer = callRet11;
                callRet11 = undefined;
            }
            buffer.write(callRet11, true);
            buffer.write('\r\n\r\n\r\n', 0);
            var option12 = {
                escape: 1
            };
            var hash13 = {};
            hash13["isItemPage"] = true;
            option12.hash = hash13;
            var callRet14
            callRet14 = setCommand.call(tpl, scope, option12, buffer, 7);
            if (callRet14 && callRet14.isBuffer) {
                buffer = callRet14;
                callRet14 = undefined;
            }
            buffer.write(callRet14, true);
            buffer.write('\r\n\r\n\r\n', 0);
            var option15 = {
                escape: 1
            };
            var params16 = [];
            var id17 = scope.resolve(["queryData", "keyword"], 0);
            params16.push(id17);
            option15.params = params16;
            option15.fn = function (scope, buffer) {
                buffer.write('\r\n    ', 0);
                var option18 = {
                    escape: 1
                };
                var hash19 = {};
                var id20 = scope.resolve(["searchLink"], 0);
                hash19["searchUrl"] = id20;
                option18.hash = hash19;
                var callRet21
                callRet21 = setCommand.call(tpl, scope, option18, buffer, 11);
                if (callRet21 && callRet21.isBuffer) {
                    buffer = callRet21;
                    callRet21 = undefined;
                }
                buffer.write(callRet21, true);
                buffer.write('\r\n', 0);
                return buffer;
            };
            option15.inverse = function (scope, buffer) {
                buffer.write('\r\n    ', 0);
                var option22 = {
                    escape: 1
                };
                var params23 = [];
                var id24 = scope.resolve(["isItemPage"], 0);
                params23.push(id24);
                option22.params = params23;
                option22.fn = function (scope, buffer) {
                    buffer.write('\r\n        ', 0);
                    var option25 = {
                        escape: 1
                    };
                    var hash26 = {};
                    hash26["searchUrl"] = 'http://s.taobao.com/search';
                    option25.hash = hash26;
                    var callRet27
                    callRet27 = setCommand.call(tpl, scope, option25, buffer, 14);
                    if (callRet27 && callRet27.isBuffer) {
                        buffer = callRet27;
                        callRet27 = undefined;
                    }
                    buffer.write(callRet27, true);
                    buffer.write('\r\n    ', 0);
                    return buffer;
                };
                option22.inverse = function (scope, buffer) {
                    buffer.write('\r\n        ', 0);
                    var option28 = {
                        escape: 1
                    };
                    var hash29 = {};
                    hash29["searchUrl"] = 'http://s.taobao.com/search?app=shopsearch';
                    option28.hash = hash29;
                    var callRet30
                    callRet30 = setCommand.call(tpl, scope, option28, buffer, 16);
                    if (callRet30 && callRet30.isBuffer) {
                        buffer = callRet30;
                        callRet30 = undefined;
                    }
                    buffer.write(callRet30, true);
                    buffer.write('\r\n    ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(tpl, scope, option22, buffer, 13);
                buffer.write('\r\n\r\n', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option15, buffer, 10);
            buffer.write('\r\n\r\n<div id="fav-tab">\r\n    <div id="fav-tab-bd">\r\n        <div data-spm="', 0);
            var id31 = scope.resolve(["spm", "tab"], 0);
            buffer.write(id31, true);
            buffer.write('" id="fav-tab-menu" class="clearfix floatleft">\r\n\r\n            <a class="fav-logo" href="', 0);
            var id32 = scope.resolve(["logolink"], 0);
            buffer.write(id32, true);
            buffer.write('">\r\n                <img src="http://gtms01.alicdn.com/tps/i1/T1gbUrFeVaXXXO7MrX-136-28.png">\r\n            </a>\r\n\r\n            <a class="item-page ', 0);
            var option33 = {
                escape: 1
            };
            var params34 = [];
            var id35 = scope.resolve(["isItemPage"], 0);
            params34.push(id35);
            option33.params = params34;
            option33.fn = function (scope, buffer) {
                buffer.write('current', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option33, buffer, 29);
            buffer.write('"\r\n                href="/item_collect.htm" data-spm="', 0);
            var id36 = scope.resolve(["spm", "baobei"], 0);
            buffer.write(id36, true);
            buffer.write('">宝贝收藏</a>\r\n\r\n            <a class="shop-page ', 0);
            var option37 = {
                escape: 1
            };
            var params38 = [];
            var id39 = scope.resolve(["isItemPage"], 0);
            params38.push(!(id39));
            option37.params = params38;
            option37.fn = function (scope, buffer) {
                buffer.write('current', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option37, buffer, 32);
            buffer.write('"\r\n                href="/shop_collect_list.htm?itemtype=0"\r\n                data-spm="', 0);
            var id40 = scope.resolve(["spm", "shop"], 0);
            buffer.write(id40, true);
            buffer.write('">店铺收藏</a>\r\n\r\n            <a class="tab-link tab-p3" target="_blank"\r\n                href="http://trade.taobao.com/trade/itemlist/list_bought_items.htm"\r\n                data-spm="', 0);
            var id41 = scope.resolve(["spm", "buyBaobei"], 0);
            buffer.write(id41, true);
            buffer.write('">已买到的宝贝</a>\r\n\r\n            <a class="tab-link tab-p2" target="_blank"\r\n                href="/bought_shop_list.htm?itemtype=0"\r\n                data-spm="', 0);
            var id42 = scope.resolve(["spm", "buyShop"], 0);
            buffer.write(id42, true);
            buffer.write('">购买过的店铺</a>\r\n\r\n            <a class="tab-link tab-p1" target="_blank"\r\n                href="http://lu.taobao.com/newMyPath.htm"\r\n                data-spm="', 0);
            var id43 = scope.resolve(["spm", "browser"], 0);
            buffer.write(id43, true);
            buffer.write('">我的足迹</a>\r\n\r\n            <a class="tab-link tab-p4" target="_blank"\r\n                href="http://i.taobao.com/my_taobao.htm"\r\n                data-spm="', 0);
            var id44 = scope.resolve(["spm", "myTaobao"], 0);
            buffer.write(id44, true);
            buffer.write('">我的淘宝</a>\r\n        </div>\r\n\r\n        <div class="fav-search" data-spm="', 0);
            var id45 = scope.resolve(["spm", "search"], 0);
            buffer.write(id45, true);
            buffer.write('">\r\n            <div class="search" id="J_Search" role="search">\r\n                <div class="search-triggers">\r\n                    <ul id="J_SearchTab" class="ks-switchable-nav">\r\n\r\n                        ', 0);
            var option46 = {
                escape: 1
            };
            var hash47 = {};
            hash47["isItemPage"] = true;
            option46.hash = hash47;
            var callRet48
            callRet48 = setCommand.call(tpl, scope, option46, buffer, 58);
            if (callRet48 && callRet48.isBuffer) {
                buffer = callRet48;
                callRet48 = undefined;
            }
            buffer.write(callRet48, true);
            buffer.write('\r\n                        ', 0);
            var option49 = {
                escape: 1
            };
            var params50 = [];
            var id51 = scope.resolve(["pageName"], 0);
            var exp52 = id51;
            exp52 = (id51) === ('shop-collect');
            params50.push(exp52);
            option49.params = params50;
            option49.fn = function (scope, buffer) {
                buffer.write('\r\n                            ', 0);
                var option53 = {
                    escape: 1
                };
                var hash54 = {};
                hash54["isItemPage"] = false;
                option53.hash = hash54;
                var callRet55
                callRet55 = setCommand.call(tpl, scope, option53, buffer, 60);
                if (callRet55 && callRet55.isBuffer) {
                    buffer = callRet55;
                    callRet55 = undefined;
                }
                buffer.write(callRet55, true);
                buffer.write('\r\n                        ', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option49, buffer, 59);
            buffer.write('\r\n\r\n                        ', 0);
            var option56 = {
                escape: 1
            };
            var params57 = [];
            var id58 = scope.resolve(["isItemPage"], 0);
            var exp59 = id58;
            exp59 = (id58) === (true);
            params57.push(exp59);
            option56.params = params57;
            option56.fn = function (scope, buffer) {
                buffer.write('\r\n                            ', 0);
                var option60 = {
                    escape: 1
                };
                var params61 = [];
                var id62 = scope.resolve(["queryData", "keyword"], 0);
                params61.push(id62);
                option60.params = params61;
                option60.fn = function (scope, buffer) {
                    buffer.write('\r\n                                ', 0);
                    var option63 = {
                        escape: 1
                    };
                    var hash64 = {};
                    var id65 = scope.resolve(["spm", "shoucangsearchbutton"], 0);
                    hash64["searchspm"] = id65;
                    option63.hash = hash64;
                    var callRet66
                    callRet66 = setCommand.call(tpl, scope, option63, buffer, 65);
                    if (callRet66 && callRet66.isBuffer) {
                        buffer = callRet66;
                        callRet66 = undefined;
                    }
                    buffer.write(callRet66, true);
                    buffer.write('\r\n                                <li class="J_SearchTab selected" \r\n                                    data-action="', 0);
                    var id67 = scope.resolve(["searchlink"], 0);
                    buffer.write(id67, true);
                    buffer.write('" \r\n                                    data-spm="', 0);
                    var id68 = scope.resolve(["spm", "shoucangsearchbutton"], 0);
                    buffer.write(id68, true);
                    buffer.write('">\r\n                                        <a href="', 0);
                    var id69 = scope.resolve(["searchLink"], 0);
                    buffer.write(id69, true);
                    buffer.write('" \r\n                                            pointname="', 0);
                    var id70 = scope.resolve(["spm", "mmstatsearchfav"], 0);
                    buffer.write(id70, true);
                    buffer.write('" \r\n                                            class="J_NewPoint" >\r\n                                        收藏</a>\r\n                                </li>\r\n                                <li class="J_SearchTab J_SearchTab_Q" \r\n                                    data-defaultpage="nogo"  \r\n                                    data-action="http://s.taobao.com/search"  \r\n                                    data-searchtype="item" \r\n                                    data-spm="', 0);
                    var id71 = scope.resolve(["spm", "quanzhansearchbutton"], 0);
                    buffer.write(id71, true);
                    buffer.write('">\r\n                                        <a pointname="', 0);
                    var id72 = scope.resolve(["spm", "mmstatsearchtb"], 0);
                    buffer.write(id72, true);
                    buffer.write('" \r\n                                            href="http://s.taobao.com/search" \r\n                                            class="J_NewPoint" >\r\n                                        淘宝</a>\r\n                                </li>\r\n                            ', 0);
                    return buffer;
                };
                option60.inverse = function (scope, buffer) {
                    buffer.write('\r\n                                ', 0);
                    var option73 = {
                        escape: 1
                    };
                    var hash74 = {};
                    var id75 = scope.resolve(["spm", "quanzhansearchbutton"], 0);
                    hash74["searchspm"] = id75;
                    option73.hash = hash74;
                    var callRet76
                    callRet76 = setCommand.call(tpl, scope, option73, buffer, 85);
                    if (callRet76 && callRet76.isBuffer) {
                        buffer = callRet76;
                        callRet76 = undefined;
                    }
                    buffer.write(callRet76, true);
                    buffer.write('\r\n                                <li class="J_SearchTab J_SearchTab_Q  selected" \r\n                                    data-defaultpage="nogo"  \r\n                                    data-action="http://s.taobao.com/search"  \r\n                                    data-searchtype="item" \r\n                                    data-spm="', 0);
                    var id77 = scope.resolve(["spm", "quanzhansearchbutton"], 0);
                    buffer.write(id77, true);
                    buffer.write('">\r\n                                        <a pointname="', 0);
                    var id78 = scope.resolve(["spm", "mmstatsearchtb"], 0);
                    buffer.write(id78, true);
                    buffer.write('" \r\n                                            href="http://s.taobao.com/search" \r\n                                            class="J_NewPoint" >\r\n                                        淘宝</a>\r\n                                </li>\r\n                                <li data-action="', 0);
                    var id79 = scope.resolve(["searchlink"], 0);
                    buffer.write(id79, true);
                    buffer.write('"  \r\n                                    class="J_SearchTab" \r\n                                    data-spm="', 0);
                    var id80 = scope.resolve(["spm", "shoucangsearchbutton"], 0);
                    buffer.write(id80, true);
                    buffer.write('">\r\n                                        <a href="', 0);
                    var id81 = scope.resolve(["searchLink"], 0);
                    buffer.write(id81, true);
                    buffer.write('" \r\n                                            pointname="', 0);
                    var id82 = scope.resolve(["spm", "mmstatsearchfav"], 0);
                    buffer.write(id82, true);
                    buffer.write('" \r\n                                            class="J_NewPoint" >\r\n                                        收藏</a>\r\n                                 </li>\r\n                            ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(tpl, scope, option60, buffer, 64);
                buffer.write('\r\n                        ', 0);
                return buffer;
            };
            option56.inverse = function (scope, buffer) {
                buffer.write('\r\n                            ', 0);
                var option83 = {
                    escape: 1
                };
                var params84 = [];
                var id85 = scope.resolve(["queryData", "keyword"], 0);
                params84.push(id85);
                option83.params = params84;
                option83.fn = function (scope, buffer) {
                    buffer.write('\r\n                                ', 0);
                    var option86 = {
                        escape: 1
                    };
                    var hash87 = {};
                    var id88 = scope.resolve(["spm", "shoucangsearchbutton"], 0);
                    hash87["searchspm"] = id88;
                    option86.hash = hash87;
                    var callRet89
                    callRet89 = setCommand.call(tpl, scope, option86, buffer, 107);
                    if (callRet89 && callRet89.isBuffer) {
                        buffer = callRet89;
                        callRet89 = undefined;
                    }
                    buffer.write(callRet89, true);
                    buffer.write('\r\n                                <li data-action="/shop_collect_list.htm?itemtype=0"  \r\n                                    class="J_SearchTab selected" \r\n                                    data-spm="', 0);
                    var id90 = scope.resolve(["spm", "shoucangsearchbutton"], 0);
                    buffer.write(id90, true);
                    buffer.write('">\r\n                                        <a href="/shop_collect_list.htm?itemtype=0" \r\n                                            pointname="', 0);
                    var id91 = scope.resolve(["spm", "mmstatsearchfav"], 0);
                    buffer.write(id91, true);
                    buffer.write('" \r\n                                            class="J_NewPoint" >\r\n                                        收藏</a>\r\n                                </li>\r\n                                <li class="J_SearchTab J_SearchTab_Q" \r\n                                    data-searchtype="shop" \r\n                                    data-action="http://s.taobao.com/search?app=shopsearch" \r\n                                    data-defaultpage="nogo"  \r\n                                    data-spm="', 0);
                    var id92 = scope.resolve(["spm", "quanzhansearchbutton"], 0);
                    buffer.write(id92, true);
                    buffer.write('">\r\n                                        <a pointname="', 0);
                    var id93 = scope.resolve(["spm", "mmstatsearchtb"], 0);
                    buffer.write(id93, true);
                    buffer.write('" \r\n                                            href="http://s.taobao.com/search?app=shopsearch" \r\n                                            class="J_NewPoint" >\r\n                                        淘宝</a>\r\n                                </li>\r\n                            ', 0);
                    return buffer;
                };
                option83.inverse = function (scope, buffer) {
                    buffer.write('\r\n                                ', 0);
                    var option94 = {
                        escape: 1
                    };
                    var hash95 = {};
                    var id96 = scope.resolve(["spm", "quanzhansearchbutton"], 0);
                    hash95["searchspm"] = id96;
                    option94.hash = hash95;
                    var callRet97
                    callRet97 = setCommand.call(tpl, scope, option94, buffer, 127);
                    if (callRet97 && callRet97.isBuffer) {
                        buffer = callRet97;
                        callRet97 = undefined;
                    }
                    buffer.write(callRet97, true);
                    buffer.write('\r\n                                <li class="J_SearchTab J_SearchTab_Q selected" \r\n                                    data-searchtype="shop"  \r\n                                    data-action="http://s.taobao.com/search?app=shopsearch" \r\n                                    data-defaultpage="nogo" \r\n                                    data-spm="', 0);
                    var id98 = scope.resolve(["spm", "quanzhansearchbutton"], 0);
                    buffer.write(id98, true);
                    buffer.write('">\r\n                                        <a pointname="', 0);
                    var id99 = scope.resolve(["spm", "mmstatsearchtb"], 0);
                    buffer.write(id99, true);
                    buffer.write('" \r\n                                            href="http://s.taobao.com/search?app=shopsearch" \r\n                                            class="J_NewPoint" >\r\n                                        淘宝</a>\r\n                                </li>\r\n                                <li data-action="/shop_collect_list.htm?itemtype=0" \r\n                                    class="J_SearchTab" \r\n                                    data-spm="', 0);
                    var id100 = scope.resolve(["spm", "shoucangsearchbutton"], 0);
                    buffer.write(id100, true);
                    buffer.write('">\r\n                                        <a href="/shop_collect_list.htm?itemtype=0" \r\n                                            pointname="', 0);
                    var id101 = scope.resolve(["spm", "mmstatsearchfav"], 0);
                    buffer.write(id101, true);
                    buffer.write('" \r\n                                            class="J_NewPoint" >\r\n                                        收藏</a>\r\n                                 </li>\r\n                            ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(tpl, scope, option83, buffer, 106);
                buffer.write('\r\n                        ', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option56, buffer, 63);
            buffer.write('\r\n\r\n                    </ul>\r\n\r\n                    <i> <em></em> <span></span> </i>\r\n                </div>\r\n\r\n                <div class="search-panel search-sns-panel-field">\r\n                    <form class="search-panel-focused" id="J_TSearchForm" name="search" action="', 0);
            var id102 = scope.resolve(["searchUrl"], 0);
            buffer.write(id102, true);
            buffer.write('" target="_top">\r\n                        <input name="_tb_token_" type="hidden" value="', 0);
            var id103 = scope.resolve(["_tb_token_"], 0);
            buffer.write(id103, true);
            buffer.write('">\r\n                        <div class="search-button">\r\n                            <button type="submit" class="btn-search">搜 索</button>\r\n                        </div>\r\n                        <div class="search-panel-fields">\r\n                            <input id="q" name="q" accesskey="s" autofocus="true" autocomplete="off" x-webkit-speech="" x-webkit-grammar="builtin:translate" placeholder="想搜收藏夹？点左侧小箭头" value="', 0);
            var id104 = scope.resolve(["queryData", "keyword"], 0);
            buffer.write(id104, true);
            buffer.write('" >\r\n                        </div>\r\n                        <input id ="J_SearchSpm" type="hidden" name="spm" value="', 0);
            var id105 = scope.resolve(["searchspm"], 0);
            buffer.write(id105, true);
            buffer.write('">\r\n                       </form>\r\n                   </div>\r\n              </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n', 0);
            return buffer;
        };
layoutNav.TPL_NAME = module.name;
layoutNav.version = "5.0.0";
return layoutNav
});