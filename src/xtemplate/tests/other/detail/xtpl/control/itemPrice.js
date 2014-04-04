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
            buffer.write('<div class="mod-item-property" data-spm="991222405">\n    <h2 class="mod-item-title">');
            var id0 = scope.resolve(["itemPrice", "data", "itemTitle"]);
            buffer.write(id0, true);
            buffer.write('</h2>\n\n    <div class="mod-item-meta">\n        <!-- 价格 -->\n        <div class="meta-item J_Price clearfix">\n            <div class="meta-item-hd">价&nbsp;&nbsp;格</div>\n            <div class="meta-item-bd price">\n                <em class="yuan">&yen;</em>\n                <strong>');
            var option1 = {
                escape: 1
            };
            var params2 = [];
            var id3 = scope.resolve(["itemPrice", "data", "priceSpan"]);
            params2.push(id3);
            option1.params = params2;
            option1.fn = function (scope, buffer) {

                buffer.write('\n                    ');
                var option4 = {
                    escape: 1
                };
                var params5 = [];
                var id6 = scope.resolve(["itemPrice", "data", "minPrice", "amount"]);
                params5.push(id6);
                option4.params = params5;
                var commandRet7 = callCommandUtil(engine, scope, option4, buffer, "formatPrice", 11);
                if (commandRet7 && commandRet7.isBuffer) {
                    buffer = commandRet7;
                    commandRet7 = undefined;
                }
                buffer.write(commandRet7, true);
                buffer.write('-');
                var option8 = {
                    escape: 1
                };
                var params9 = [];
                var id10 = scope.resolve(["itemPrice", "data", "maxPrice", "amount"]);
                params9.push(id10);
                option8.params = params9;
                var commandRet11 = callCommandUtil(engine, scope, option8, buffer, "formatPrice", 11);
                if (commandRet11 && commandRet11.isBuffer) {
                    buffer = commandRet11;
                    commandRet11 = undefined;
                }
                buffer.write(commandRet11, true);
                buffer.write('\n                    ');

                return buffer;
            };
            option1.inverse = function (scope, buffer) {

                buffer.write('\n                    ');
                var option12 = {
                    escape: 1
                };
                var params13 = [];
                var id14 = scope.resolve(["itemPrice", "data", "itemPrice", "amount"]);
                params13.push(id14);
                option12.params = params13;
                var commandRet15 = callCommandUtil(engine, scope, option12, buffer, "formatPrice", 13);
                if (commandRet15 && commandRet15.isBuffer) {
                    buffer = commandRet15;
                    commandRet15 = undefined;
                }
                buffer.write(commandRet15, true);
                buffer.write('');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option1, buffer, 10, payload);
            buffer.write('</strong>\n                ');
            var option16 = {
                escape: 1
            };
            var params17 = [];
            var id18 = scope.resolve(["itemPrice", "data", "specialUnit"]);
            params17.push(id18);
            option16.params = params17;
            option16.fn = function (scope, buffer) {

                buffer.write('\n                &nbsp;&nbsp;（<span>');
                var id19 = scope.resolve(["itemPrice", "data", "unitPrice"]);
                buffer.write(id19, true);
                buffer.write('');
                var id20 = scope.resolve(["itemPrice", "data", "unit"]);
                buffer.write(id20, true);
                buffer.write('</span>）');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option16, buffer, 14, payload);
            buffer.write('\n                <input type="hidden" id="itemStart" value="');
            var id21 = scope.resolve(["itemPrice", "data", "itemStarts"]);
            buffer.write(id21, true);
            buffer.write('"/>\n                <input type="hidden" id="itemEnd" value="');
            var id22 = scope.resolve(["itemPrice", "data", "itemEnds"]);
            buffer.write(id22, true);
            buffer.write('"/>\n            </div>\n        </div>\n        ');
            var option23 = {
                escape: 1
            };
            var params24 = [];
            var id25 = scope.resolve(["itemPrice", "data", "onLine"]);
            params24.push(id25);
            option23.params = params24;
            option23.fn = function (scope, buffer) {

                buffer.write('\n        ');
                var option26 = {
                    escape: 1
                };
                var params27 = [];
                var id28 = scope.resolve(["itemPrice", "data", "specialUnit"]);
                params27.push(id28);
                option26.params = params27;
                option26.fn = function (scope, buffer) {

                    buffer.write('\n        <!--净含量-->\n        <div class="meta-item clearfix">\n            <div class="meta-item-hd">\n                ');
                    var option29 = {
                        escape: 1
                    };
                    var params30 = [];
                    var id31 = scope.resolve(["itemPrice", "data", "unit"]);
                    params30.push(id31);
                    params30.push('折');
                    option29.params = params30;
                    option29.fn = function (scope, buffer) {

                        buffer.write(' 面&nbsp;&nbsp;值 ');

                        return buffer;
                    };
                    buffer = callCommandUtil(engine, scope, option29, buffer, "ifHas", 25);
                    buffer.write('\n                ');
                    var option32 = {
                        escape: 1
                    };
                    var params33 = [];
                    var id34 = scope.resolve(["itemPrice", "data", "unit"]);
                    params33.push(id34);
                    params33.push('g');
                    option32.params = params33;
                    option32.fn = function (scope, buffer) {

                        buffer.write(' 净含量 ');

                        return buffer;
                    };
                    buffer = callCommandUtil(engine, scope, option32, buffer, "ifHas", 26);
                    buffer.write('\n                ');
                    var option35 = {
                        escape: 1
                    };
                    var params36 = [];
                    var id37 = scope.resolve(["itemPrice", "data", "unit"]);
                    params36.push(id37);
                    params36.push('ml');
                    option35.params = params36;
                    option35.fn = function (scope, buffer) {

                        buffer.write(' 净含量 ');

                        return buffer;
                    };
                    buffer = callCommandUtil(engine, scope, option35, buffer, "ifHas", 27);
                    buffer.write('\n            </div>\n            <div class="meta-item-bd J_bd">\n                ');
                    var option38 = {
                        escape: 1
                    };
                    var params39 = [];
                    var id40 = scope.resolve(["itemPrice", "data", "unit"]);
                    params39.push(id40);
                    params39.push('折');
                    option38.params = params39;
                    option38.fn = function (scope, buffer) {

                        buffer.write(' <em class="yuan">&yen;</em> ');

                        return buffer;
                    };
                    buffer = callCommandUtil(engine, scope, option38, buffer, "ifHas", 30);
                    buffer.write('\n                ');
                    var id41 = scope.resolve(["itemPrice", "data", "spec"]);
                    buffer.write(id41, true);
                    buffer.write('\n                ');
                    var option42 = {
                        escape: 1
                    };
                    var params43 = [];
                    var id44 = scope.resolve(["itemPrice", "data", "unit"]);
                    params43.push(id44);
                    params43.push('g');
                    option42.params = params43;
                    option42.fn = function (scope, buffer) {

                        buffer.write(' g ');

                        return buffer;
                    };
                    buffer = callCommandUtil(engine, scope, option42, buffer, "ifHas", 32);
                    buffer.write('\n                ');
                    var option45 = {
                        escape: 1
                    };
                    var params46 = [];
                    var id47 = scope.resolve(["itemPrice", "data", "unit"]);
                    params46.push(id47);
                    params46.push('ml');
                    option45.params = params46;
                    option45.fn = function (scope, buffer) {

                        buffer.write(' ml ');

                        return buffer;
                    };
                    buffer = callCommandUtil(engine, scope, option45, buffer, "ifHas", 33);
                    buffer.write('\n            </div>\n        </div>\n        ');

                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option26, buffer, 21, payload);
                buffer.write('\n        <!--ump价格-->\n        <div class="meta-item  J_UMP hidden clearfix">\n            <div class="meta-item-hd">促&nbsp;&nbsp;销</div>\n            <div class="meta-item-bd J_bd price">\n\n            </div>\n        </div>\n\n        <!--其他优惠-->\n        <div class="meta-item hidden J_PointTxt clearfix">\n            <div class="meta-item-hd">优&nbsp;&nbsp;惠</div>\n            <div class="meta-item-bd J_bd"></div>\n        </div>\n\n        <!--增值服务-->\n        <div class="meta-item hidden J_AddService clearfix">\n            <div class="meta-item-hd">服&nbsp;&nbsp;务</div>\n            <div class="meta-item-bd J_bd"></div>\n        </div>\n\n        <!--配送-->\n        <div class="meta-item J_Logistic clearfix">\n            <div class="meta-item-hd">配&nbsp;&nbsp;送</div>\n            <div class="meta-item-bd J_bd"></div>\n        </div>\n\n        <!--销量-->\n        <div class="meta-item J_Deal clearfix">\n            <div class="meta-item-hd">销&nbsp;&nbsp;量</div>\n            <div class="meta-item-bd J_bd"></div>\n        </div>\n\n        <!--itemCommitmentModulet start-->\n        ');
                var option48 = {};
                var params49 = [];
                params49.push('./itemCommitment');
                option48.params = params49;
                require("./itemCommitment");
                option48.params[0] = module.resolve(option48.params[0]);
                var commandRet50 = includeCommand.call(engine, scope, option48, buffer, 70, payload);
                if (commandRet50 && commandRet50.isBuffer) {
                    buffer = commandRet50;
                    commandRet50 = undefined;
                }
                buffer.write(commandRet50, false);
                buffer.write('\n        <!--itemCommitmentModulet end-->\n\n        ');

                return buffer;
            };
            option23.inverse = function (scope, buffer) {

                buffer.write('\n        <div class="meta-item clearfix">\n            <div class="meta-item-hd"></div>\n            <div class="meta-item-bd J_bd">\n                <p class="tb-hint"><strong>此宝贝已下架</strong> <span><a title="为什么" href="http://service.taobao.com/support/knowledge-1102683.htm" target="_blank"><img alt="为什么" src="http://img01.taobaocdn.com/tps/i1/T1VuyiXcRkXXazG.A_-11-11.gif"></a></span></p>\n                <p class="tb-tips">1:联系卖家咨询</p>\n                ');
                var option51 = {
                    escape: 1
                };
                var params52 = [];
                var id53 = scope.resolve(["itemPrice", "data", "shopUrl"]);
                params52.push(id53);
                option51.params = params52;
                option51.fn = function (scope, buffer) {

                    buffer.write('\n                <p class="tb-tips">\n                    2:你可以<a href="');
                    var id54 = scope.resolve(["itemPrice", "data", "shopUrl"]);
                    buffer.write(id54, true);
                    buffer.write('">进入掌柜店铺</a>\n                </p>\n                ');

                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option51, buffer, 79, payload);
                buffer.write('\n            </div>\n        </div>\n        ');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option23, buffer, 20, payload);
            buffer.write('\n    </div>\n\n</div>\n');
            var option55 = {
                escape: 1
            };
            var params56 = [];
            var id57 = scope.resolve(["itemPrice", "data", "onLine"]);
            params56.push(id57);
            option55.params = params56;
            option55.fn = function (scope, buffer) {

                buffer.write('\n<div class="mod-item-action" id="J_item-action" data-spm="991222433">\n    ');
                var option58 = {
                    escape: 1
                };
                var params59 = [];
                var id60 = scope.resolve(["itemPrice", "data", "canBuy"]);
                params59.push(id60);
                option58.params = params59;
                option58.fn = function (scope, buffer) {

                    buffer.write('\n    <button type="button" class="btn-buy" id="J_btn-buy">立刻购买</button>\n    ');

                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option58, buffer, 92, payload);
                buffer.write('\n\n    ');
                var option61 = {
                    escape: 1
                };
                var params62 = [];
                var id63 = scope.resolve(["itemPrice", "data", "showCart"]);
                params62.push(id63);
                option61.params = params62;
                option61.fn = function (scope, buffer) {

                    buffer.write('\n    <button type="button" class="btn-cart" id="J_btn-cart">加入购物车</button>\n    ');

                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option61, buffer, 96, payload);
                buffer.write('\n    <!--<button type="button" class="btn-share"><i class="icon-share"></i></button>-->\n    <button type="button" class="btn-favorite"><i class="icon-favorite"></i></button>\n</div>\n<!--itemBuyModulet start-->\n');
                var option64 = {};
                var params65 = [];
                params65.push('./itemBuy');
                option64.params = params65;
                require("./itemBuy");
                option64.params[0] = module.resolve(option64.params[0]);
                var commandRet66 = includeCommand.call(engine, scope, option64, buffer, 103, payload);
                if (commandRet66 && commandRet66.isBuffer) {
                    buffer = commandRet66;
                    commandRet66 = undefined;
                }
                buffer.write(commandRet66, false);
                buffer.write('\n<!--itemBuyModulet end-->\n<!--itemPrice.dataStepModulet start-->\n');
                var option67 = {};
                var params68 = [];
                params68.push('./itemPriceStep');
                option67.params = params68;
                require("./itemPriceStep");
                option67.params[0] = module.resolve(option67.params[0]);
                var commandRet69 = includeCommand.call(engine, scope, option67, buffer, 106, payload);
                if (commandRet69 && commandRet69.isBuffer) {
                    buffer = commandRet69;
                    commandRet69 = undefined;
                }
                buffer.write(commandRet69, false);
                buffer.write('\n<!--itemPrice.dataStepModulet end-->\n');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option55, buffer, 90, payload);
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});