/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        var t = function (scope, buffer, payload, undefined) {
            var engine = this,
                nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            if ("1.50" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
            }
            var callCommandUtil = utils.callCommand,
                eachCommand = nativeCommands.each,
                withCommand = nativeCommands["with"],
                ifCommand = nativeCommands["if"],
                setCommand = nativeCommands.set,
                includeCommand = nativeCommands.include,
                parseCommand = nativeCommands.parse,
                extendCommand = nativeCommands.extend,
                blockCommand = nativeCommands.block,
                macroCommand = nativeCommands.macro,
                debuggerCommand = nativeCommands["debugger"];
            buffer.write('');
            var option0 = {
                escape: 1
            };
            var params1 = [];
            var id2 = scope.resolve(["itemBuy", "data", "closed"]);
            params1.push(!(id2));
            option0.params = params1;
            option0.fn = function (scope, buffer) {

                buffer.write('\n<form id="J_FrmBid" name="bidForm" action="');
                var id3 = scope.resolve(["itemBuy", "data", "buyUrl"]);
                buffer.write(id3, true);
                buffer.write('" method="post">\n    <input type="hidden" value="" name="tb_token" id="J_frmTokenField" />\n    <input id="J_ireferer" type="hidden" name="item_url_refer" value="" />\n    <input type="hidden" name="item_id" value="');
                var id4 = scope.resolve(["itemBuy", "data", "itemId"]);
                buffer.write(id4, true);
                buffer.write('" />\n    <input type="hidden" name="item_id_num" value="');
                var id5 = scope.resolve(["itemBuy", "data", "itemId"]);
                buffer.write(id5, true);
                buffer.write('" />\n    <input type="hidden" name="auction_type" value="');
                var id6 = scope.resolve(["itemBuy", "data", "auctionType"]);
                buffer.write(id6, true);
                buffer.write('" />\n    <input type="hidden" name="from" value="item_detail" />\n    <input type="hidden" name="frm" value="" id="J_From" />\n    ');
                var option7 = {
                    escape: 1
                };
                var params8 = [];
                var id9 = scope.resolve(["itemBuy", "data", "limitPromotion"]);
                params8.push(id9);
                option7.params = params8;
                option7.fn = function (scope, buffer) {

                    buffer.write('<input type="hidden"\n                                                name="detailIsLimit" value="');
                    var id10 = scope.resolve(["itemBuy", "data", "limitPromotion"]);
                    buffer.write(id10, true);
                    buffer.write('" />');

                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option7, buffer, 10, payload);
                buffer.write('\n    <input type="hidden" name="current_price" value= "');
                var id11 = scope.resolve(["itemBuy", "data", "reservePrice"]);
                buffer.write(id11, true);
                buffer.write('" />\n    <input type="hidden" name="activity" value="');
                var id12 = scope.resolve(["itemBuy", "data", "activity"]);
                buffer.write(id12, true);
                buffer.write('"/>\n    <input type="hidden" name="auto_post1" value="');
                var id13 = scope.resolve(["itemBuy", "data", "autoPostType"]);
                buffer.write(id13, true);
                buffer.write('" />\n    <input type="hidden" id="quantity" name="quantity" value="1"/>\n    <input type="hidden" id="skuId" name="skuId" value="" autocomplete="false"/>\n    <input type="hidden" id="skuInfo" name="skuInfo" value=""/>\n    <input type="hidden" id="J_TBuyerFrom" name="buyer_from" value="');
                var id14 = scope.resolve(["itemBuy", "data", "buyerFrom"]);
                buffer.write(id14, true);
                buffer.write('"/>\n    <input type="hidden" id="J_ChargeTypeId" name="chargeTypeId" value=""/>\n    ');
                var option15 = {
                    escape: 1
                };
                var params16 = [];
                var id17 = scope.resolve(["itemBuy", "data", "skil"]);
                params16.push(id17);
                option15.params = params16;
                option15.fn = function (scope, buffer) {

                    buffer.write('\n    <input type="hidden" id="J_secKills" name="" value="" />\n    ');

                    return buffer;
                };
                option15.inverse = function (scope, buffer) {

                    buffer.write('\n    ');
                    var option18 = {
                        escape: 1
                    };
                    var params19 = [];
                    var id20 = scope.resolve(["itemBuy", "data", "tKA"]);
                    params19.push(id20);
                    option18.params = params19;
                    option18.fn = function (scope, buffer) {

                        buffer.write('\n    <input type="hidden" id="J_secKills" name="" value="" />\n    <input type="hidden" name="answer" value="" id="J_Answer"/>\n    <input type="hidden" name="secKillEncryptStr" value="" id="J_Sign" />\n    <input type="hidden" name="event_submit_do_buy" value="1" />\n    <input type="hidden" name="action" value="buynow/secKillBuyNowAction" />\n    ');

                        return buffer;
                    };
                    buffer = ifCommand.call(engine, scope, option18, buffer, 23, payload);
                    buffer.write('\n    ');

                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option15, buffer, 20, payload);
                buffer.write('\n    ');
                var option21 = {
                    escape: 1
                };
                var params22 = [];
                var id23 = scope.resolve(["itemBuy", "data", "externalShop"]);
                params22.push(id23);
                option21.params = params22;
                option21.fn = function (scope, buffer) {

                    buffer.write('\n    ');
                    var option24 = {
                        escape: 1
                    };
                    var params25 = [];
                    var id26 = scope.resolve(["itemBuy", "data", "showShoppingCartButton"]);
                    params25.push(id26);
                    option24.params = params25;
                    option24.fn = function (scope, buffer) {

                        buffer.write('\n    <input type="hidden" name="shop_id" value="');
                        var id27 = scope.resolve(["itemBuy", "data", "shopId"]);
                        buffer.write(id27, true);
                        buffer.write('"/>\n    ');

                        return buffer;
                    };
                    buffer = ifCommand.call(engine, scope, option24, buffer, 32, payload);
                    buffer.write('\n    ');

                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option21, buffer, 31, payload);
                buffer.write('\n    ');
                var option28 = {
                    escape: 1
                };
                var params29 = [];
                var id30 = scope.resolve(["itemBuy", "data", "referTg"]);
                params29.push(id30);
                option28.params = params29;
                option28.fn = function (scope, buffer) {

                    buffer.write('<input type="hidden" name="key" value="');
                    var id31 = scope.resolve(["itemBuy", "data", "key"]);
                    buffer.write(id31, true);
                    buffer.write('" />');

                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option28, buffer, 36, payload);
                buffer.write('\n    ');
                var option32 = {
                    escape: 1
                };
                var params33 = [];
                var id34 = scope.resolve(["itemBuy", "data", "buytraceid"]);
                params33.push(id34);
                option32.params = params33;
                option32.fn = function (scope, buffer) {

                    buffer.write('\n    <input type="hidden" name="buytraceid" value="');
                    var id35 = scope.resolve(["itemBuy", "data", "buytraceid"]);
                    buffer.write(id35, true);
                    buffer.write('" />\n    ');

                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option32, buffer, 37, payload);
                buffer.write('\n</form>\n');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option0, buffer, 1, payload);
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});