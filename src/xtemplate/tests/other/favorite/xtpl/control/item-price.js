/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var itemPrice = function (scope, buffer, undefined) {
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
            var id2 = scope.resolve(["promotionPrice"], 0);
            params1.push(id2);
            option0.params = params1;
            option0.fn = function (scope, buffer) {
                buffer.write('\r\n    ', 0);
                var option3 = {
                    escape: 1
                };
                var hash4 = {};
                var option5 = {};
                var params6 = [];
                var id7 = scope.resolve(["promotionPrice"], 0);
                params6.push(id7);
                option5.params = params6;
                var callRet8
                callRet8 = callFnUtil(tpl, scope, option5, buffer, ["formatPrice"], 0, 2);
                if (callRet8 && callRet8.isBuffer) {
                    buffer = callRet8;
                    callRet8 = undefined;
                }
                hash4["promotionPriceStr"] = callRet8;
                option3.hash = hash4;
                var callRet9
                callRet9 = setCommand.call(tpl, scope, option3, buffer, 2);
                if (callRet9 && callRet9.isBuffer) {
                    buffer = callRet9;
                    callRet9 = undefined;
                }
                buffer.write(callRet9, true);
                buffer.write('\r\n    ', 0);
                var option10 = {
                    escape: 1
                };
                var hash11 = {};
                var option12 = {};
                var params13 = [];
                var id14 = scope.resolve(["originPrice"], 0);
                params13.push(id14);
                option12.params = params13;
                var callRet15
                callRet15 = callFnUtil(tpl, scope, option12, buffer, ["formatPrice"], 0, 3);
                if (callRet15 && callRet15.isBuffer) {
                    buffer = callRet15;
                    callRet15 = undefined;
                }
                hash11["originPriceStr"] = callRet15;
                option10.hash = hash11;
                var callRet16
                callRet16 = setCommand.call(tpl, scope, option10, buffer, 3);
                if (callRet16 && callRet16.isBuffer) {
                    buffer = callRet16;
                    callRet16 = undefined;
                }
                buffer.write(callRet16, true);
                buffer.write('\r\n\r\n', 0);
                return buffer;
            };
            option0.inverse = function (scope, buffer) {
                buffer.write(' ', 0);
                var option17 = {
                    escape: 1
                };
                var params18 = [];
                var id19 = scope.resolve(["originPrice"], 0);
                var exp21 = id19;
                var id20 = scope.resolve(["collectPrice"], 0);
                exp21 = (id19) < (id20);
                params18.push(exp21);
                option17.params = params18;
                option17.fn = function (scope, buffer) {
                    buffer.write('\r\n    ', 0);
                    var option22 = {
                        escape: 1
                    };
                    var hash23 = {};
                    var option24 = {};
                    var params25 = [];
                    var id26 = scope.resolve(["originPrice"], 0);
                    params25.push(id26);
                    option24.params = params25;
                    var callRet27
                    callRet27 = callFnUtil(tpl, scope, option24, buffer, ["formatPrice"], 0, 6);
                    if (callRet27 && callRet27.isBuffer) {
                        buffer = callRet27;
                        callRet27 = undefined;
                    }
                    hash23["promotionPriceStr"] = callRet27;
                    option22.hash = hash23;
                    var callRet28
                    callRet28 = setCommand.call(tpl, scope, option22, buffer, 6);
                    if (callRet28 && callRet28.isBuffer) {
                        buffer = callRet28;
                        callRet28 = undefined;
                    }
                    buffer.write(callRet28, true);
                    buffer.write('\r\n    ', 0);
                    var option29 = {
                        escape: 1
                    };
                    var hash30 = {};
                    var option31 = {};
                    var params32 = [];
                    var id33 = scope.resolve(["collectPrice"], 0);
                    params32.push(id33);
                    option31.params = params32;
                    var callRet34
                    callRet34 = callFnUtil(tpl, scope, option31, buffer, ["formatPrice"], 0, 7);
                    if (callRet34 && callRet34.isBuffer) {
                        buffer = callRet34;
                        callRet34 = undefined;
                    }
                    hash30["originPriceStr"] = callRet34;
                    option29.hash = hash30;
                    var callRet35
                    callRet35 = setCommand.call(tpl, scope, option29, buffer, 7);
                    if (callRet35 && callRet35.isBuffer) {
                        buffer = callRet35;
                        callRet35 = undefined;
                    }
                    buffer.write(callRet35, true);
                    buffer.write('\r\n\r\n', 0);
                    return buffer;
                };
                option17.inverse = function (scope, buffer) {
                    buffer.write('\r\n    ', 0);
                    var option36 = {
                        escape: 1
                    };
                    var hash37 = {};
                    hash37["promotionPriceStr"] = '';
                    option36.hash = hash37;
                    var callRet38
                    callRet38 = setCommand.call(tpl, scope, option36, buffer, 10);
                    if (callRet38 && callRet38.isBuffer) {
                        buffer = callRet38;
                        callRet38 = undefined;
                    }
                    buffer.write(callRet38, true);
                    buffer.write('\r\n    ', 0);
                    var option39 = {
                        escape: 1
                    };
                    var hash40 = {};
                    var option41 = {};
                    var params42 = [];
                    var id43 = scope.resolve(["originPrice"], 0);
                    params42.push(id43);
                    option41.params = params42;
                    var callRet44
                    callRet44 = callFnUtil(tpl, scope, option41, buffer, ["formatPrice"], 0, 11);
                    if (callRet44 && callRet44.isBuffer) {
                        buffer = callRet44;
                        callRet44 = undefined;
                    }
                    hash40["originPriceStr"] = callRet44;
                    option39.hash = hash40;
                    var callRet45
                    callRet45 = setCommand.call(tpl, scope, option39, buffer, 11);
                    if (callRet45 && callRet45.isBuffer) {
                        buffer = callRet45;
                        callRet45 = undefined;
                    }
                    buffer.write(callRet45, true);
                    buffer.write('\r\n', 0);
                    return buffer;
                };
                buffer = ifCommand.call(tpl, scope, option17, buffer, 5);
                buffer.write('', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option0, buffer, 1);
            buffer.write('\r\n\r\n', 0);
            var option46 = {
                escape: 1
            };
            var hash47 = {};
            var option48 = {};
            var callRet49
            callRet49 = callFnUtil(tpl, scope, option48, buffer, ["pricePromotion"], 0, 14);
            if (callRet49 && callRet49.isBuffer) {
                buffer = callRet49;
                callRet49 = undefined;
            }
            hash47["promotionAvailable"] = callRet49;
            option46.hash = hash47;
            var callRet50
            callRet50 = setCommand.call(tpl, scope, option46, buffer, 14);
            if (callRet50 && callRet50.isBuffer) {
                buffer = callRet50;
                callRet50 = undefined;
            }
            buffer.write(callRet50, true);
            buffer.write('\r\n', 0);
            var option51 = {
                escape: 1
            };
            var hash52 = {};
            var option53 = {};
            var callRet54
            callRet54 = callFnUtil(tpl, scope, option53, buffer, ["priceCssTag"], 0, 15);
            if (callRet54 && callRet54.isBuffer) {
                buffer = callRet54;
                callRet54 = undefined;
            }
            hash52["priceCssTag"] = callRet54;
            option51.hash = hash52;
            var callRet55
            callRet55 = setCommand.call(tpl, scope, option51, buffer, 15);
            if (callRet55 && callRet55.isBuffer) {
                buffer = callRet55;
                callRet55 = undefined;
            }
            buffer.write(callRet55, true);
            buffer.write('\r\n', 0);
            var option56 = {
                escape: 1
            };
            var hash57 = {};
            var option58 = {};
            var callRet59
            callRet59 = callFnUtil(tpl, scope, option58, buffer, ["priceLabel"], 0, 16);
            if (callRet59 && callRet59.isBuffer) {
                buffer = callRet59;
                callRet59 = undefined;
            }
            hash57["priceLabel"] = callRet59;
            option56.hash = hash57;
            var callRet60
            callRet60 = setCommand.call(tpl, scope, option56, buffer, 16);
            if (callRet60 && callRet60.isBuffer) {
                buffer = callRet60;
                callRet60 = undefined;
            }
            buffer.write(callRet60, true);
            buffer.write('\r\n', 0);
            var option61 = {
                escape: 1
            };
            var hash62 = {};
            var option63 = {};
            var callRet64
            callRet64 = callFnUtil(tpl, scope, option63, buffer, ["priceName"], 0, 17);
            if (callRet64 && callRet64.isBuffer) {
                buffer = callRet64;
                callRet64 = undefined;
            }
            hash62["priceName"] = callRet64;
            option61.hash = hash62;
            var callRet65
            callRet65 = setCommand.call(tpl, scope, option61, buffer, 17);
            if (callRet65 && callRet65.isBuffer) {
                buffer = callRet65;
                callRet65 = undefined;
            }
            buffer.write(callRet65, true);
            buffer.write('\r\n\r\n<div class="g_price-box">\r\n    ', 0);
            var option66 = {
                escape: 1
            };
            var params67 = [];
            var id68 = scope.resolve(["promotionAvailable"], 0);
            params67.push(id68);
            option66.params = params67;
            option66.fn = function (scope, buffer) {
                buffer.write('\r\n        ', 0);
                var option69 = {
                    escape: 1
                };
                var params70 = [];
                var id71 = scope.resolve(["priceCssTag"], 0);
                var exp72 = id71;
                exp72 = (id71) !== ('j');
                params70.push(exp72);
                option69.params = params70;
                option69.fn = function (scope, buffer) {
                    buffer.write('\r\n            <div data-title="', 0);
                    var id73 = scope.resolve(["priceLabel"], 0);
                    buffer.write(id73, true);
                    buffer.write('"\r\n                 class="J_PriceIcon picon-', 0);
                    var id74 = scope.resolve(["priceCssTag"], 0);
                    buffer.write(id74, true);
                    buffer.write('">\r\n                ', 0);
                    var id75 = scope.resolve(["priceName"], 0);
                    buffer.write(id75, true);
                    buffer.write('\r\n            </div>\r\n        ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(tpl, scope, option69, buffer, 21);
                buffer.write('\r\n        <div class="g_price">\r\n            <span>&yen;</span>\r\n            <strong>', 0);
                var id76 = scope.resolve(["promotionPriceStr"], 0);
                buffer.write(id76, true);
                buffer.write('</strong>\r\n        </div>\r\n    ', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option66, buffer, 20);
            buffer.write('\r\n\r\n    <div class="g_price ', 0);
            var option77 = {
                escape: 1
            };
            var params78 = [];
            var id79 = scope.resolve(["promotionAvailable"], 0);
            params78.push(id79);
            option77.params = params78;
            option77.fn = function (scope, buffer) {
                buffer.write('g_price-original', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option77, buffer, 33);
            buffer.write('">\r\n        ', 0);
            var option80 = {
                escape: 1
            };
            var params81 = [];
            var id82 = scope.resolve(["promotionAvailable"], 0);
            params81.push(id82);
            option80.params = params81;
            option80.fn = function (scope, buffer) {
                buffer.write('\r\n            <span>', 0);
                var id83 = scope.resolve(["originPriceStr"], 0);
                buffer.write(id83, true);
                buffer.write('</span>\r\n        ', 0);
                return buffer;
            };
            option80.inverse = function (scope, buffer) {
                buffer.write('\r\n            <span>&yen;</span>\r\n            <strong class="c3">', 0);
                var id84 = scope.resolve(["originPriceStr"], 0);
                buffer.write(id84, true);
                buffer.write('</strong>\r\n        ', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option80, buffer, 34);
            buffer.write('\r\n    </div>\r\n\r\n    ', 0);
            var option85 = {
                escape: 1
            };
            var params86 = [];
            var id87 = scope.resolve(["promotionAvailable"], 0);
            var exp90 = id87;
            if ((id87)) {
                var id88 = scope.resolve(["priceCssTag"], 0);
                var exp89 = id88;
                exp89 = (id88) === ('j');
                exp90 = exp89;
            }
            params86.push(exp90);
            option85.params = params86;
            option85.fn = function (scope, buffer) {
                buffer.write('\r\n        <div data-title="', 0);
                var id91 = scope.resolve(["priceLabel"], 0);
                buffer.write(id91, true);
                buffer.write('"\r\n             class="J_PriceIcon picon-', 0);
                var id92 = scope.resolve(["priceCssTag"], 0);
                buffer.write(id92, true);
                buffer.write('">\r\n            ', 0);
                var id93 = scope.resolve(["priceName"], 0);
                buffer.write(id93, true);
                buffer.write('\r\n        </div>\r\n    ', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option85, buffer, 42);
            buffer.write('\r\n\r\n</div>\r\n', 0);
            return buffer;
        };
itemPrice.TPL_NAME = module.name;
itemPrice.version = "5.0.0";
return itemPrice
});