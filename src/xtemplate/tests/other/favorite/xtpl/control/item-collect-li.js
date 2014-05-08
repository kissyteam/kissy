/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var itemCollectLi = function (scope, buffer, session, undefined) {
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
            var id2 = scope.resolve(["favList"], 0);
            params1.push(id2);
            option0.params = params1;
            option0.fn = function (scope, buffer) {
                buffer.write('\n\n', 0);
                var option3 = {
                    escape: 1
                };
                var hash4 = {};
                hash4["couponExists"] = false;
                option3.hash = hash4;
                var callRet5
                callRet5 = setCommand.call(engine, scope, option3, buffer, 3, session);
                if (callRet5 && callRet5.isBuffer) {
                    buffer = callRet5;
                    callRet5 = undefined;
                }
                buffer.write(callRet5, true);
                buffer.write('\n\n', 0);
                var option6 = {
                    escape: 1
                };
                var params7 = [];
                var id8 = scope.resolve(["externalData", "coupon", "exists"], 0);
                params7.push(id8);
                option6.params = params7;
                option6.fn = function (scope, buffer) {
                    buffer.write('\n    ', 0);
                    var option9 = {
                        escape: 1
                    };
                    var hash10 = {};
                    hash10["couponExists"] = true;
                    option9.hash = hash10;
                    var callRet11
                    callRet11 = setCommand.call(engine, scope, option9, buffer, 6, session);
                    if (callRet11 && callRet11.isBuffer) {
                        buffer = callRet11;
                        callRet11 = undefined;
                    }
                    buffer.write(callRet11, true);
                    buffer.write('\n    ', 0);
                    var option12 = {
                        escape: 1
                    };
                    var hash13 = {};
                    var id14 = scope.resolve(["externalData", "coupon"], 0);
                    hash13["couponData"] = id14;
                    option12.hash = hash13;
                    var callRet15
                    callRet15 = setCommand.call(engine, scope, option12, buffer, 7, session);
                    if (callRet15 && callRet15.isBuffer) {
                        buffer = callRet15;
                        callRet15 = undefined;
                    }
                    buffer.write(callRet15, true);
                    buffer.write('\n', 0);
                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option6, buffer, 5, session);
                buffer.write('\n\n<li class="g-u J_FavListItem ', 0);
                var option16 = {
                    escape: 1
                };
                var params17 = [];
                var id18 = scope.resolve(["couponExists"], 0);
                params17.push(id18);
                option16.params = params17;
                option16.fn = function (scope, buffer) {
                    buffer.write('has-1212icon', 0);
                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option16, buffer, 10, session);
                buffer.write('" data-item-type="1" data-item-id="', 0);
                var id19 = scope.resolve(["favId"], 0);
                buffer.write(id19, true);
                buffer.write('"\n    data-ownerid="', 0);
                var id20 = scope.resolve(["sellerId"], 0);
                buffer.write(id20, true);
                buffer.write('" data-spm="', 0);
                var id21 = scope.resolve(["spm", "itemArea"], 0);
                buffer.write(id21, true);
                buffer.write('">\n    <div class="img-controller-box J_FavImgController">\n        <div class="img-controller-box-t">\n            <a href="', 0);
                var id22 = scope.resolve(["config", "detailUrl"], 0);
                buffer.write(id22, true);
                buffer.write('?id=', 0);
                var id23 = scope.resolve(["favId"], 0);
                buffer.write(id23, true);
                buffer.write('&_u=', 0);
                var id24 = scope.resolve(["itemEncode"], 0);
                buffer.write(id24, true);
                buffer.write('" class="img" target="_blank" data-spm="', 0);
                var id25 = scope.resolve(["spm", "cardPicUrl"], 0);
                buffer.write(id25, true);
                buffer.write('"\n               title="', 0);
                var id26 = scope.resolve(["itemTitle"], 0);
                buffer.write(id26, true);
                buffer.write('">\n                ', 0);
                var option27 = {
                    escape: 1
                };
                var params28 = [];
                var id29 = scope.resolve(["itemPic"], 0);
                params28.push(id29);
                option27.params = params28;
                option27.fn = function (scope, buffer) {
                    buffer.write('\n                    <img src="', 0);
                    var option30 = {
                        escape: 1
                    };
                    var params31 = [];
                    var id32 = scope.resolve(["itemPic"], 0);
                    params31.push(id32);
                    params31.push('210x210');
                    var id33 = scope.resolve(["config", "imgServer"], 0);
                    params31.push(id33);
                    option30.params = params31;
                    var callRet34
                    callRet34 = callFnUtil(engine, scope, option30, buffer, ["imgUrl"], 0, 17);
                    if (callRet34 && callRet34.isBuffer) {
                        buffer = callRet34;
                        callRet34 = undefined;
                    }
                    buffer.write(callRet34, true);
                    buffer.write('" alt="', 0);
                    var id35 = scope.resolve(["itemTitle"], 0);
                    buffer.write(id35, true);
                    buffer.write('">\n                ', 0);
                    return buffer;
                };
                option27.inverse = function (scope, buffer) {
                    buffer.write('\n                    <img src="http://image.taobao.com/newshop/nopicture.gif" alt="', 0);
                    var id36 = scope.resolve(["itemTitle"], 0);
                    buffer.write(id36, true);
                    buffer.write('">\n                ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option27, buffer, 16, session);
                buffer.write('\n\n            </a>\n        </div>\n        <div class="pop-rec J_PopRec"></div>\n\n        <div class="findsame-btn">\n            <a class="findsame-link" href="/external/itemGallery.htm?id=', 0);
                var id37 = scope.resolve(["favId"], 0);
                buffer.write(id37, true);
                buffer.write('&cat=1" target="_blank" data-spm="', 0);
                var id38 = scope.resolve(["spm", "cardXiangSi"], 0);
                buffer.write(id38, true);
                buffer.write('">\n                <span class="findsame-icon nmiconfont">&#x3433;</span>\n                <span class="findsame-txt">相似/搭配</span>\n            </a>\n        </div>\n        <div class="old-data-del">\n            ', 0);
                var option39 = {
                    escape: 1
                };
                var params40 = [];
                var id41 = scope.resolve(["isTop"], 0);
                params40.push(id41);
                option39.params = params40;
                option39.fn = function (scope, buffer) {
                    buffer.write('\n                <a class="cancel-up J_CanselUp J_NewPoint" href="#" data-spm="', 0);
                    var id42 = scope.resolve(["spm", "itemCancelTop"], 0);
                    buffer.write(id42, true);
                    buffer.write('" pointname="tbscj.22.29">取消置顶</a>\n            ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option39, buffer, 33, session);
                buffer.write('\n\n            ', 0);
                var option43 = {
                    escape: 1
                };
                var params44 = [];
                var id45 = scope.resolve(["note"], 0);
                params44.push(id45);
                option43.params = params44;
                option43.fn = function (scope, buffer) {
                    buffer.write('\n                <div class="remark J_Remark">\n                    <span title="', 0);
                    var id46 = scope.resolve(["note"], 0);
                    buffer.write(id46, true);
                    buffer.write('">', 0);
                    var option47 = {
                        escape: 1
                    };
                    var params48 = [];
                    var id49 = scope.resolve(["note"], 0);
                    params48.push(id49);
                    option47.params = params48;
                    var callRet50
                    callRet50 = callFnUtil(engine, scope, option47, buffer, ["richText"], 0, 39);
                    if (callRet50 && callRet50.isBuffer) {
                        buffer = callRet50;
                        callRet50 = undefined;
                    }
                    buffer.write(callRet50, true);
                    buffer.write('</span>\n                    <span class="del-mark J_DelRemark J_NewPoint" data-spm="', 0);
                    var id51 = scope.resolve(["spm", "itemDelNote"], 0);
                    buffer.write(id51, true);
                    buffer.write('" pointname="tbscj.22.28">X</span>\n                </div>\n            ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option43, buffer, 37, session);
                buffer.write('\n\n        </div>\n    </div>\n    <div class="img-item-title">\n        <input class="J_ItemSelect chk J_NewPoint" type="checkbox" data-spm="', 0);
                var id52 = scope.resolve(["spm", "itemTitle"], 0);
                buffer.write(id52, true);
                buffer.write('" pointname="tbscj.22.21">\n\n        ', 0);
                var option53 = {
                    escape: 1
                };
                var params54 = [];
                var id55 = scope.resolve(["itemType"], 0);
                var exp56 = id55;
                exp56 = (id55) === (2);
                params54.push(exp56);
                option53.params = params54;
                option53.fn = function (scope, buffer) {
                    buffer.write('\n            <img src="http://gtms03.alicdn.com/tps/i3/T1DgeGFdNbXXbXX2Hb-24-18.png">\n        ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option53, buffer, 49, session);
                buffer.write('\n\n\n        <a title="', 0);
                var id57 = scope.resolve(["itemTitle"], 0);
                buffer.write(id57, true);
                buffer.write('" target="_blank" href="', 0);
                var id58 = scope.resolve(["config", "detailUrl"], 0);
                buffer.write(id58, true);
                buffer.write('?id=', 0);
                var id59 = scope.resolve(["favId"], 0);
                buffer.write(id59, true);
                buffer.write('&_u=', 0);
                var id60 = scope.resolve(["itemEncode"], 0);
                buffer.write(id60, true);
                buffer.write('"\n           data-spm="', 0);
                var id61 = scope.resolve(["spm", "cardTitle"], 0);
                buffer.write(id61, true);
                buffer.write('">\n           ', 0);
                var id62 = scope.resolve(["itemTitle"], 0);
                buffer.write(id62, true);
                buffer.write('\n        </a>\n    </div>\n\n    ', 0);
                var option63 = {
                    escape: 1
                };
                var params64 = [];
                var id65 = scope.resolve(["couponExists"], 0);
                var exp67 = id65;
                if ((id65)) {
                    var id66 = scope.resolve(["couponData"], 0);
                    exp67 = id66;
                }
                params64.push(exp67);
                option63.params = params64;
                option63.fn = function (scope, buffer) {
                    buffer.write('\n        <div class="item-1212-info">\n            <span  class="icon-1212-hb-min J_Hongbao" data-id="', 0);
                    var id68 = scope.resolve(["couponData", "sellerId"], 0);
                    buffer.write(id68, true);
                    buffer.write('" data-itemid="', 0);
                    var id69 = scope.resolve(["couponData", "itemId"], 0);
                    buffer.write(id69, true);
                    buffer.write('" href="', 0);
                    var id70 = scope.resolve(["couponData", "applyCouponUrl"], 0);
                    buffer.write(id70, true);
                    buffer.write('" data-spm="', 0);
                    var id71 = scope.resolve(["spm", "itemCoupon"], 0);
                    buffer.write(id71, true);
                    buffer.write('"></span>\n        </div>\n    ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option63, buffer, 60, session);
                buffer.write('\n\n    ', 0);
                var option72 = {
                    escape: 1
                };
                var params73 = [];
                var id74 = scope.resolve(["isInvalid"], 0);
                params73.push(id74);
                option72.params = params73;
                option72.fn = function (scope, buffer) {
                    buffer.write('\n        <div class="knockdown">\n            <span class="knockdown-tips">宝贝失效了</span>\n        </div>\n    ', 0);
                    return buffer;
                };
                option72.inverse = function (scope, buffer) {
                    buffer.write('\n        <div class="price-container">\n            ', 0);
                    var option75 = {
                        escape: 1
                    };
                    var params76 = [];
                    params76.push('./item-price');
                    option75.params = params76;
                    require("./item-price");
                    var callRet77
                    callRet77 = includeCommand.call(engine, scope, option75, buffer, 72, session);
                    if (callRet77 && callRet77.isBuffer) {
                        buffer = callRet77;
                        callRet77 = undefined;
                    }
                    buffer.write(callRet77, true);
                    buffer.write('\n        </div>\n    ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option72, buffer, 66, session);
                buffer.write('\n\n\n\n    <div class="item-controller">\n        <a class="J_ItemClass fav-item-class miconfont" href="#" title="分类">&#244</a>|\n\n        <a class="J_FavDel fav-item-del miconfont J_NewPoint" href="#" title="删除" pointname="tbscj.22.36">&#356</a>|\n\n        <a class="goto-shop miconfont"\n           href="', 0);
                var id78 = scope.resolve(["config", "shopUrl"], 0);
                buffer.write(id78, true);
                buffer.write('?user_number_id=', 0);
                var id79 = scope.resolve(["sellerId"], 0);
                buffer.write(id79, true);
                buffer.write('"\n           target="_blank" title="进入店铺" data-spm="', 0);
                var id80 = scope.resolve(["spm", "itemShop"], 0);
                buffer.write(id80, true);
                buffer.write('">&#346</a>\n\n           ', 0);
                var option81 = {
                    escape: 1
                };
                var params82 = [];
                var id83 = scope.resolve(["canAddCart"], 0);
                params82.push(id83);
                option81.params = params82;
                option81.fn = function (scope, buffer) {
                    buffer.write('\n               |<a class="J_AddToCartBtnTgr cart-icon miconfont J_NewPoint" pointname="tbscj.22.39" title="加入购物车" href="#">&#365</a>\n           ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option81, buffer, 87, session);
                buffer.write('\n\n    </div>\n\n</li>\n', 0);
                return buffer;
            };
            buffer = eachCommand.call(engine, scope, option0, buffer, 1, session);
            buffer.write('\n', 0);
            return buffer;
        };
itemCollectLi.TPL_NAME = module.name;
return itemCollectLi
});