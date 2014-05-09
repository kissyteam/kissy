/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var sectionItemNav = function (scope, buffer, undefined) {
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
            buffer.write('<div id="fav-select" data-spm="', 0);
            var id0 = scope.resolve(["spm", "channel"], 0);
            buffer.write(id0, true);
            buffer.write('">\r\n    <div class="fav-select-one">\r\n        ', 0);
            var option1 = {
                escape: 1
            };
            var params2 = [];
            var id3 = scope.resolve(["queryData", "isPromotion"], 0);
            var exp5 = !(id3);
            if ((!(id3))) {
                var id4 = scope.resolve(["queryData", "invalid"], 0);
                exp5 = !(id4);
            }
            params2.push(exp5);
            option1.params = params2;
            option1.fn = function (scope, buffer) {
                buffer.write('\r\n            ', 0);
                var option6 = {
                    escape: 1
                };
                var hash7 = {};
                hash7["current"] = 'current';
                option6.hash = hash7;
                var callRet8
                callRet8 = setCommand.call(tpl, scope, option6, buffer, 4);
                if (callRet8 && callRet8.isBuffer) {
                    buffer = callRet8;
                    callRet8 = undefined;
                }
                buffer.write(callRet8, true);
                buffer.write('\r\n        ', 0);
                return buffer;
            };
            option1.inverse = function (scope, buffer) {
                buffer.write('\r\n            ', 0);
                var option9 = {
                    escape: 1
                };
                var hash10 = {};
                hash10["current"] = '';
                option9.hash = hash10;
                var callRet11
                callRet11 = setCommand.call(tpl, scope, option9, buffer, 6);
                if (callRet11 && callRet11.isBuffer) {
                    buffer = callRet11;
                    callRet11 = undefined;
                }
                buffer.write(callRet11, true);
                buffer.write('\r\n        ', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option1, buffer, 3);
            buffer.write('\r\n\r\n        <a  data-spm="', 0);
            var id12 = scope.resolve(["spm", "channelAll"], 0);
            buffer.write(id12, true);
            buffer.write('"\r\n            class="J_YDHook ', 0);
            var id13 = scope.resolve(["current"], 0);
            buffer.write(id13, true);
            buffer.write('"\r\n            href="', 0);
            var option14 = {};
            var params15 = [];
            var id16 = scope.resolve(["pageLink"], 0);
            params15.push(id16);
            params15.push('invalid=false&isPromotion=false');
            option14.params = params15;
            var callRet17
            callRet17 = callFnUtil(tpl, scope, option14, buffer, ["queryUrl"], 0, 11);
            if (callRet17 && callRet17.isBuffer) {
                buffer = callRet17;
                callRet17 = undefined;
            }
            buffer.write(callRet17, false);
            buffer.write('"\r\n            data-yd-txt="宝贝变动一目了然，浏览管理更方便!" data-yd-name="yd003" >全部宝贝</a>\r\n\r\n        <a  data-spm="', 0);
            var id18 = scope.resolve(["spm", "channelPromotion"], 0);
            buffer.write(id18, true);
            buffer.write('"\r\n            class="', 0);
            var option19 = {
                escape: 1
            };
            var params20 = [];
            var id21 = scope.resolve(["queryData", "isPromotion"], 0);
            params20.push(id21);
            option19.params = params20;
            option19.fn = function (scope, buffer) {
                buffer.write('current', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option19, buffer, 15);
            buffer.write('"\r\n            href="', 0);
            var option22 = {};
            var params23 = [];
            var id24 = scope.resolve(["pageLink"], 0);
            params23.push(id24);
            params23.push('invalid=false&isPromotion=true');
            option22.params = params23;
            var callRet25
            callRet25 = callFnUtil(tpl, scope, option22, buffer, ["queryUrl"], 0, 16);
            if (callRet25 && callRet25.isBuffer) {
                buffer = callRet25;
                callRet25 = undefined;
            }
            buffer.write(callRet25, false);
            buffer.write('">\r\n\r\n            优惠\r\n            ', 0);
            var option26 = {
                escape: 1
            };
            var params27 = [];
            var id28 = scope.resolve(["filterCount", "filterPromotion"], 0);
            var exp29 = id28;
            exp29 = (id28) > (0);
            params27.push(exp29);
            option26.params = params27;
            option26.fn = function (scope, buffer) {
                buffer.write('\r\n                <span class="num">', 0);
                var id30 = scope.resolve(["filterCount", "filterPromotion"], 0);
                buffer.write(id30, true);
                buffer.write('</span>\r\n            ', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option26, buffer, 19);
            buffer.write('\r\n        </a>\r\n\r\n        <a  data-spm="', 0);
            var id31 = scope.resolve(["spm", "channelInvalid"], 0);
            buffer.write(id31, true);
            buffer.write('"\r\n            class="', 0);
            var option32 = {
                escape: 1
            };
            var params33 = [];
            var id34 = scope.resolve(["queryData", "invalid"], 0);
            params33.push(id34);
            option32.params = params33;
            option32.fn = function (scope, buffer) {
                buffer.write('current', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option32, buffer, 25);
            buffer.write('"\r\n            href="', 0);
            var option35 = {};
            var params36 = [];
            var id37 = scope.resolve(["pageLink"], 0);
            params36.push(id37);
            params36.push('invalid=true&isPromotion=false');
            option35.params = params36;
            var callRet38
            callRet38 = callFnUtil(tpl, scope, option35, buffer, ["queryUrl"], 0, 26);
            if (callRet38 && callRet38.isBuffer) {
                buffer = callRet38;
                callRet38 = undefined;
            }
            buffer.write(callRet38, false);
            buffer.write('">\r\n            已失效\r\n            ', 0);
            var option39 = {
                escape: 1
            };
            var params40 = [];
            var id41 = scope.resolve(["filterCount", "filterInvalid"], 0);
            var exp42 = id41;
            exp42 = (id41) > (0);
            params40.push(exp42);
            option39.params = params40;
            option39.fn = function (scope, buffer) {
                buffer.write('\r\n                <span class="num">', 0);
                var id43 = scope.resolve(["filterCount", "filterInvalid"], 0);
                buffer.write(id43, true);
                buffer.write('</span>\r\n            ', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option39, buffer, 28);
            buffer.write('\r\n        </a>\r\n\r\n        <a href="', 0);
            var option44 = {};
            var params45 = [];
            params45.push('/item_collect_for_same_shop.htm');
            option44.params = params45;
            var callRet46
            callRet46 = callFnUtil(tpl, scope, option44, buffer, ["queryUrl"], 0, 33);
            if (callRet46 && callRet46.isBuffer) {
                buffer = callRet46;
                callRet46 = undefined;
            }
            buffer.write(callRet46, false);
            buffer.write('">\r\n            同店宝贝\r\n            <i class="new"></i>\r\n        </a>\r\n\r\n    </div>\r\n\r\n    <div class="fav-select-two" >\r\n        ', 0);
            var option47 = {
                escape: 1
            };
            var params48 = [];
            var id49 = scope.resolve(["queryData", "orderby"], 0);
            var exp52 = !(id49);
            if (!(!(id49))) {
                var id50 = scope.resolve(["queryData", "orderby"], 0);
                var exp51 = id50;
                exp51 = (id50) === ('timedown');
                exp52 = exp51;
            }
            params48.push(exp52);
            option47.params = params48;
            option47.fn = function (scope, buffer) {
                buffer.write('\r\n            <a  data-spm="', 0);
                var id53 = scope.resolve(["spm", "channelAddtime"], 0);
                buffer.write(id53, true);
                buffer.write('"\r\n                class="current"\r\n                href="', 0);
                var option54 = {};
                var params55 = [];
                var id56 = scope.resolve(["pageLink"], 0);
                params55.push(id56);
                params55.push('orderby=timeup');
                option54.params = params55;
                var callRet57
                callRet57 = callFnUtil(tpl, scope, option54, buffer, ["queryUrl"], 0, 44);
                if (callRet57 && callRet57.isBuffer) {
                    buffer = callRet57;
                    callRet57 = undefined;
                }
                buffer.write(callRet57, false);
                buffer.write('">\r\n                收藏时间<i class="sort-asc"></i>\r\n            </a>\r\n        ', 0);
                return buffer;
            };
            option47.inverse = function (scope, buffer) {
                buffer.write('\r\n            <a  data-spm="', 0);
                var id58 = scope.resolve(["spm", "channelAddtime"], 0);
                buffer.write(id58, true);
                buffer.write('"\r\n                class="current"\r\n                href="', 0);
                var option59 = {};
                var params60 = [];
                var id61 = scope.resolve(["pageLink"], 0);
                params60.push(id61);
                params60.push('orderby=timedown');
                option59.params = params60;
                var callRet62
                callRet62 = callFnUtil(tpl, scope, option59, buffer, ["queryUrl"], 0, 50);
                if (callRet62 && callRet62.isBuffer) {
                    buffer = callRet62;
                    callRet62 = undefined;
                }
                buffer.write(callRet62, false);
                buffer.write('">\r\n                收藏时间<i class="sort-desc"></i>\r\n            </a>\r\n        ', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option47, buffer, 41);
            buffer.write('\r\n    </div>\r\n\r\n    <div class="icon-show">\r\n        ', 0);
            var option63 = {
                escape: 1
            };
            var hash64 = {};
            var exp66 = 'invalid=';
            var id65 = scope.resolve(["queryData", "invalid"], 0);
            exp66 = ('invalid=') + (id65);
            var exp67 = exp66;
            exp67 = (exp66) + ('&isPromotion=');
            var exp69 = exp67;
            var id68 = scope.resolve(["queryData", "isPromotion"], 0);
            exp69 = (exp67) + (id68);
            hash64["queryStr"] = exp69;
            option63.hash = hash64;
            var callRet70
            callRet70 = setCommand.call(tpl, scope, option63, buffer, 57);
            if (callRet70 && callRet70.isBuffer) {
                buffer = callRet70;
                callRet70 = undefined;
            }
            buffer.write(callRet70, true);
            buffer.write('\r\n\r\n\r\n        ', 0);
            var option71 = {
                escape: 1
            };
            var params72 = [];
            var id73 = scope.resolve(["pageName"], 0);
            var exp74 = id73;
            exp74 = (id73) === ('item-collect');
            params72.push(exp74);
            option71.params = params72;
            option71.fn = function (scope, buffer) {
                buffer.write('\r\n            <a  data-spm="', 0);
                var id75 = scope.resolve(["spm", "channelItemList"], 0);
                buffer.write(id75, true);
                buffer.write('"\r\n                class="fav-btn list"\r\n                href="', 0);
                var option76 = {};
                var params77 = [];
                params77.push('/item_collect_list.htm');
                var id78 = scope.resolve(["queryStr"], 0);
                params77.push(id78);
                option76.params = params77;
                var callRet79
                callRet79 = callFnUtil(tpl, scope, option76, buffer, ["queryUrl"], 0, 63);
                if (callRet79 && callRet79.isBuffer) {
                    buffer = callRet79;
                    callRet79 = undefined;
                }
                buffer.write(callRet79, false);
                buffer.write('"\r\n                title="列表模式" >列表</a>\r\n\r\n            <a  data-spm="', 0);
                var id80 = scope.resolve(["spm", "channelItemBigImg"], 0);
                buffer.write(id80, true);
                buffer.write('"\r\n                class="fav-btn big-pic disabled"\r\n                href="javascript:void();"  title="大图模式" >大图</a>\r\n\r\n        ', 0);
                return buffer;
            };
            option71.inverse = function (scope, buffer) {
                buffer.write('\r\n            <a  data-spm="', 0);
                var id81 = scope.resolve(["spm", "channelItemList"], 0);
                buffer.write(id81, true);
                buffer.write('"\r\n                class="fav-btn list disabled"\r\n                href="javascript:void();"  title="列表模式" >列表</a>\r\n\r\n            <a data-spm="', 0);
                var id82 = scope.resolve(["spm", "channelItemBigImg"], 0);
                buffer.write(id82, true);
                buffer.write('"\r\n                class="fav-btn big-pic"\r\n                href="', 0);
                var option83 = {};
                var params84 = [];
                params84.push('/item_collect.htm');
                var id85 = scope.resolve(["queryStr"], 0);
                params84.push(id85);
                option83.params = params84;
                var callRet86
                callRet86 = callFnUtil(tpl, scope, option83, buffer, ["queryUrl"], 0, 77);
                if (callRet86 && callRet86.isBuffer) {
                    buffer = callRet86;
                    callRet86 = undefined;
                }
                buffer.write(callRet86, false);
                buffer.write('"\r\n                title="大图模式" >大图</a>\r\n        ', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option71, buffer, 60);
            buffer.write('\r\n\r\n    </div>\r\n</div>\r\n\r\n<div id="fav-controller" class="grid" data-spm="', 0);
            var id87 = scope.resolve(["spm", "action"], 0);
            buffer.write(id87, true);
            buffer.write('">\r\n    <div class="con-fixed-box">\r\n        <input type="checkbox" value="1" class="g-u select-all J_SelectAll" id="select-all"/>\r\n        <label class="g-u J_NewPoint" for="select-all" pointname="', 0);
            var id88 = scope.resolve(["spm", "mmSelectDall"], 0);
            buffer.write(id88, true);
            buffer.write('">全选</label>\r\n        <a class="g-u del-favs J_DelFavs J_NewPoint" href="#delFavs" pointname="', 0);
            var id89 = scope.resolve(["spm", "mmDelete"], 0);
            buffer.write(id89, true);
            buffer.write('"> <span class="miconfont">&#356</span>删除</a>\r\n        <a class="g-u add-classes J_AddFavsClass J_NewPoint" href="#" pointname="', 0);
            var id90 = scope.resolve(["spm", "mmAddClass"], 0);
            buffer.write(id90, true);
            buffer.write('"><span class="miconfont">&#244</span>分类</a>\r\n\r\n        ', 0);
            var option91 = {
                escape: 1
            };
            var params92 = [];
            var id93 = scope.resolve(["pageInfo", "totalCount"], 0);
            var exp95 = id93;
            var id94 = scope.resolve(["pageInfo", "bigPageSize"], 0);
            exp95 = (id93) > (id94);
            params92.push(exp95);
            option91.params = params92;
            option91.fn = function (scope, buffer) {
                buffer.write('\r\n            ', 0);
                var option96 = {
                    escape: 1
                };
                var params97 = [];
                params97.push('./widget-page-direction');
                option96.params = params97;
                require("./widget-page-direction");
                var callRet98
                callRet98 = includeCommand.call(tpl, scope, option96, buffer, 92);
                if (callRet98 && callRet98.isBuffer) {
                    buffer = callRet98;
                    callRet98 = undefined;
                }
                buffer.write(callRet98, true);
                buffer.write('\r\n        ', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option91, buffer, 91);
            buffer.write('\r\n\r\n    </div>\r\n</div>\r\n', 0);
            return buffer;
        };
sectionItemNav.TPL_NAME = module.name;
sectionItemNav.version = "5.0.0";
return sectionItemNav
});