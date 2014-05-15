/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var itemBuy = function (scope, buffer, undefined) {
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
            var option0 = {
                escape: 1
            };
            var params1 = [];
            var id2 = scope.resolve(["itemBuy", "data", "closed"], 0);
            params1.push(!(id2));
            option0.params = params1;
            option0.fn = function (scope, buffer) {
                buffer.write('\r\n<form id="J_FrmBid" name="bidForm" action="', 0);
                var id3 = scope.resolve(["itemBuy", "data", "buyUrl"], 0);
                buffer.write(id3, true);
                buffer.write('" method="post">\r\n    <input type="hidden" value="" name="tb_token" id="J_frmTokenField" />\r\n    <input id="J_ireferer" type="hidden" name="item_url_refer" value="" />\r\n    <input type="hidden" name="item_id" value="', 0);
                var id4 = scope.resolve(["itemBuy", "data", "itemId"], 0);
                buffer.write(id4, true);
                buffer.write('" />\r\n    <input type="hidden" name="item_id_num" value="', 0);
                var id5 = scope.resolve(["itemBuy", "data", "itemId"], 0);
                buffer.write(id5, true);
                buffer.write('" />\r\n    <input type="hidden" name="auction_type" value="', 0);
                var id6 = scope.resolve(["itemBuy", "data", "auctionType"], 0);
                buffer.write(id6, true);
                buffer.write('" />\r\n    <input type="hidden" name="from" value="item_detail" />\r\n    <input type="hidden" name="frm" value="" id="J_From" />\r\n    ', 0);
                var option7 = {
                    escape: 1
                };
                var params8 = [];
                var id9 = scope.resolve(["itemBuy", "data", "limitPromotion"], 0);
                params8.push(id9);
                option7.params = params8;
                option7.fn = function (scope, buffer) {
                    buffer.write('<input type="hidden"\r\n                                                name="detailIsLimit" value="', 0);
                    var id10 = scope.resolve(["itemBuy", "data", "limitPromotion"], 0);
                    buffer.write(id10, true);
                    buffer.write('" />', 0);
                    return buffer;
                };
                buffer = ifCommand.call(tpl, scope, option7, buffer, 10);
                buffer.write('\r\n    <input type="hidden" name="current_price" value= "', 0);
                var id11 = scope.resolve(["itemBuy", "data", "reservePrice"], 0);
                buffer.write(id11, true);
                buffer.write('" />\r\n    <input type="hidden" name="activity" value="', 0);
                var id12 = scope.resolve(["itemBuy", "data", "activity"], 0);
                buffer.write(id12, true);
                buffer.write('"/>\r\n    <input type="hidden" name="auto_post1" value="', 0);
                var id13 = scope.resolve(["itemBuy", "data", "autoPostType"], 0);
                buffer.write(id13, true);
                buffer.write('" />\r\n    <input type="hidden" id="quantity" name="quantity" value="1"/>\r\n    <input type="hidden" id="skuId" name="skuId" value="" autocomplete="false"/>\r\n    <input type="hidden" id="skuInfo" name="skuInfo" value=""/>\r\n    <input type="hidden" id="J_TBuyerFrom" name="buyer_from" value="', 0);
                var id14 = scope.resolve(["itemBuy", "data", "buyerFrom"], 0);
                buffer.write(id14, true);
                buffer.write('"/>\r\n    <input type="hidden" id="J_ChargeTypeId" name="chargeTypeId" value=""/>\r\n    ', 0);
                var option15 = {
                    escape: 1
                };
                var params16 = [];
                var id17 = scope.resolve(["itemBuy", "data", "skil"], 0);
                params16.push(id17);
                option15.params = params16;
                option15.fn = function (scope, buffer) {
                    buffer.write('\r\n    <input type="hidden" id="J_secKills" name="" value="" />\r\n    ', 0);
                    return buffer;
                };
                option15.inverse = function (scope, buffer) {
                    buffer.write('\r\n    ', 0);
                    var option18 = {
                        escape: 1
                    };
                    var params19 = [];
                    var id20 = scope.resolve(["itemBuy", "data", "tKA"], 0);
                    params19.push(id20);
                    option18.params = params19;
                    option18.fn = function (scope, buffer) {
                        buffer.write('\r\n    <input type="hidden" id="J_secKills" name="" value="" />\r\n    <input type="hidden" name="answer" value="" id="J_Answer"/>\r\n    <input type="hidden" name="secKillEncryptStr" value="" id="J_Sign" />\r\n    <input type="hidden" name="event_submit_do_buy" value="1" />\r\n    <input type="hidden" name="action" value="buynow/secKillBuyNowAction" />\r\n    ', 0);
                        return buffer;
                    };
                    buffer = ifCommand.call(tpl, scope, option18, buffer, 23);
                    buffer.write('\r\n    ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(tpl, scope, option15, buffer, 20);
                buffer.write('\r\n    ', 0);
                var option21 = {
                    escape: 1
                };
                var params22 = [];
                var id23 = scope.resolve(["itemBuy", "data", "externalShop"], 0);
                params22.push(id23);
                option21.params = params22;
                option21.fn = function (scope, buffer) {
                    buffer.write('\r\n    ', 0);
                    var option24 = {
                        escape: 1
                    };
                    var params25 = [];
                    var id26 = scope.resolve(["itemBuy", "data", "showShoppingCartButton"], 0);
                    params25.push(id26);
                    option24.params = params25;
                    option24.fn = function (scope, buffer) {
                        buffer.write('\r\n    <input type="hidden" name="shop_id" value="', 0);
                        var id27 = scope.resolve(["itemBuy", "data", "shopId"], 0);
                        buffer.write(id27, true);
                        buffer.write('"/>\r\n    ', 0);
                        return buffer;
                    };
                    buffer = ifCommand.call(tpl, scope, option24, buffer, 32);
                    buffer.write('\r\n    ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(tpl, scope, option21, buffer, 31);
                buffer.write('\r\n    ', 0);
                var option28 = {
                    escape: 1
                };
                var params29 = [];
                var id30 = scope.resolve(["itemBuy", "data", "referTg"], 0);
                params29.push(id30);
                option28.params = params29;
                option28.fn = function (scope, buffer) {
                    buffer.write('<input type="hidden" name="key" value="', 0);
                    var id31 = scope.resolve(["itemBuy", "data", "key"], 0);
                    buffer.write(id31, true);
                    buffer.write('" />', 0);
                    return buffer;
                };
                buffer = ifCommand.call(tpl, scope, option28, buffer, 36);
                buffer.write('\r\n    ', 0);
                var option32 = {
                    escape: 1
                };
                var params33 = [];
                var id34 = scope.resolve(["itemBuy", "data", "buytraceid"], 0);
                params33.push(id34);
                option32.params = params33;
                option32.fn = function (scope, buffer) {
                    buffer.write('\r\n    <input type="hidden" name="buytraceid" value="', 0);
                    var id35 = scope.resolve(["itemBuy", "data", "buytraceid"], 0);
                    buffer.write(id35, true);
                    buffer.write('" />\r\n    ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(tpl, scope, option32, buffer, 37);
                buffer.write('\r\n</form>\r\n', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option0, buffer, 1);
            return buffer;
        };
itemBuy.TPL_NAME = module.name;
itemBuy.version = "5.0.0";
return itemBuy
});