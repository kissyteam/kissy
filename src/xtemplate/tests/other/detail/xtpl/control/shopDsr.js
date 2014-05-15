/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var shopDsr = function (scope, buffer, undefined) {
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
            buffer.write('<div class="mod-shop-bd" data-spm="991222493">\r\n    <ul class="mod-shop-dsr J_DSR clearfix">\r\n        ', 0);
            var option0 = {
                escape: 1
            };
            var params1 = [];
            var id2 = scope.resolve(["shopDsr", "data", "hasDsrRecord"], 0);
            params1.push(id2);
            option0.params = params1;
            option0.fn = function (scope, buffer) {
                buffer.write('\r\n        <li>\r\n            <label title="', 0);
                var option3 = {
                    escape: 1
                };
                var params4 = [];
                var id5 = scope.resolve(["shopDsr", "data", "merchandisAvgScore"], 0);
                params4.push(id5);
                option3.params = params4;
                option3.fn = function (scope, buffer) {
                    buffer.write('', 0);
                    var id6 = scope.resolve(["shopDsr", "data", "merchandisAvgScore"], 0);
                    buffer.write(id6, true);
                    buffer.write('分', 0);
                    return buffer;
                };
                buffer = ifCommand.call(tpl, scope, option3, buffer, 5);
                buffer.write('">\r\n                描述 ', 0);
                var id7 = scope.resolve(["shopDsr", "data", "merchandisAvgScore"], 0);
                buffer.write(id7, true);
                buffer.write('\r\n            </label>\r\n            ', 0);
                var option8 = {
                    escape: 1
                };
                var params9 = [];
                var id10 = scope.resolve(["shopDsr", "data", "merchandisGapUp"], 0);
                params9.push(id10);
                option8.params = params9;
                option8.fn = function (scope, buffer) {
                    buffer.write('\r\n            <i class="rate-high"></i>', 0);
                    var id11 = scope.resolve(["shopDsr", "data", "merchandisGapString"], 0);
                    buffer.write(id11, true);
                    buffer.write('%</li>\r\n            ', 0);
                    return buffer;
                };
                option8.inverse = function (scope, buffer) {
                    buffer.write('\r\n                ', 0);
                    var option12 = {
                        escape: 1
                    };
                    var params13 = [];
                    var id14 = scope.resolve(["shopDsr", "data", "merchandisGapBottom"], 0);
                    params13.push(id14);
                    option12.params = params13;
                    option12.fn = function (scope, buffer) {
                        buffer.write('\r\n                <i class="rate-low"></i>', 0);
                        var id15 = scope.resolve(["shopDsr", "data", "merchandisGapString"], 0);
                        buffer.write(id15, true);
                        buffer.write('%</li>\r\n                ', 0);
                        return buffer;
                    };
                    option12.inverse = function (scope, buffer) {
                        buffer.write('\r\n                    ', 0);
                        var option16 = {
                            escape: 1
                        };
                        var params17 = [];
                        var id18 = scope.resolve(["shopDsr", "data", "merchandisGapFair"], 0);
                        params17.push(id18);
                        option16.params = params17;
                        option16.fn = function (scope, buffer) {
                            buffer.write('\r\n                    <i class="rate-same"></i>持平</li>\r\n                    ', 0);
                            return buffer;
                        };
                        option16.inverse = function (scope, buffer) {
                            buffer.write('\r\n                    该店铺尚未收到评价\r\n                    ', 0);
                            return buffer;
                        };
                        buffer = ifCommand.call(tpl, scope, option16, buffer, 14);
                        buffer.write('\r\n                ', 0);
                        return buffer;
                    };
                    buffer = ifCommand.call(tpl, scope, option12, buffer, 11);
                    buffer.write('\r\n            ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(tpl, scope, option8, buffer, 8);
                buffer.write('\r\n        <li>\r\n            <label title="', 0);
                var option19 = {
                    escape: 1
                };
                var params20 = [];
                var id21 = scope.resolve(["shopDsr", "data", "serviceAvgScore"], 0);
                params20.push(id21);
                option19.params = params20;
                option19.fn = function (scope, buffer) {
                    buffer.write(' ', 0);
                    var id22 = scope.resolve(["shopDsr", "data", "serviceAvgScore"], 0);
                    buffer.write(id22, true);
                    buffer.write('分 ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(tpl, scope, option19, buffer, 22);
                buffer.write('">\r\n                服务 ', 0);
                var id23 = scope.resolve(["shopDsr", "data", "serviceAvgScore"], 0);
                buffer.write(id23, true);
                buffer.write('\r\n            </label>\r\n            ', 0);
                var option24 = {
                    escape: 1
                };
                var params25 = [];
                var id26 = scope.resolve(["shopDsr", "data", "serviceGapUp"], 0);
                params25.push(id26);
                option24.params = params25;
                option24.fn = function (scope, buffer) {
                    buffer.write('\r\n            <i class="rate-high"></i>', 0);
                    var id27 = scope.resolve(["shopDsr", "data", "serviceGapString"], 0);
                    buffer.write(id27, true);
                    buffer.write('%</li>\r\n            ', 0);
                    return buffer;
                };
                option24.inverse = function (scope, buffer) {
                    buffer.write('\r\n                ', 0);
                    var option28 = {
                        escape: 1
                    };
                    var params29 = [];
                    var id30 = scope.resolve(["shopDsr", "data", "serviceGapBottom"], 0);
                    params29.push(id30);
                    option28.params = params29;
                    option28.fn = function (scope, buffer) {
                        buffer.write('\r\n                <i class="rate-low"></i>', 0);
                        var id31 = scope.resolve(["shopDsr", "data", "serviceGapString"], 0);
                        buffer.write(id31, true);
                        buffer.write('%</li>\r\n                ', 0);
                        return buffer;
                    };
                    option28.inverse = function (scope, buffer) {
                        buffer.write('\r\n                    ', 0);
                        var option32 = {
                            escape: 1
                        };
                        var params33 = [];
                        var id34 = scope.resolve(["shopDsr", "data", "serviceGapFair"], 0);
                        params33.push(id34);
                        option32.params = params33;
                        option32.fn = function (scope, buffer) {
                            buffer.write('\r\n                    <i class="rate-same"></i>持平</li>\r\n                    ', 0);
                            return buffer;
                        };
                        option32.inverse = function (scope, buffer) {
                            buffer.write('\r\n                    该店铺尚未收到评价\r\n                    ', 0);
                            return buffer;
                        };
                        buffer = ifCommand.call(tpl, scope, option32, buffer, 31);
                        buffer.write('\r\n                ', 0);
                        return buffer;
                    };
                    buffer = ifCommand.call(tpl, scope, option28, buffer, 28);
                    buffer.write('\r\n            ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(tpl, scope, option24, buffer, 25);
                buffer.write('\r\n        <li>\r\n            <label title="', 0);
                var option35 = {
                    escape: 1
                };
                var params36 = [];
                var id37 = scope.resolve(["shopDsr", "data", "consignmentAvgScore"], 0);
                params36.push(id37);
                option35.params = params36;
                option35.fn = function (scope, buffer) {
                    buffer.write('', 0);
                    var id38 = scope.resolve(["shopDsr", "data", "consignmentAvgScore"], 0);
                    buffer.write(id38, true);
                    buffer.write('分', 0);
                    return buffer;
                };
                buffer = ifCommand.call(tpl, scope, option35, buffer, 39);
                buffer.write('">\r\n                物流 ', 0);
                var id39 = scope.resolve(["shopDsr", "data", "consignmentAvgScore"], 0);
                buffer.write(id39, true);
                buffer.write('\r\n            </label>\r\n            ', 0);
                var option40 = {
                    escape: 1
                };
                var params41 = [];
                var id42 = scope.resolve(["shopDsr", "data", "consignmentGapUp"], 0);
                params41.push(id42);
                option40.params = params41;
                option40.fn = function (scope, buffer) {
                    buffer.write('\r\n            <i class="rate-high"></i>', 0);
                    var id43 = scope.resolve(["shopDsr", "data", "consignmentGapString"], 0);
                    buffer.write(id43, true);
                    buffer.write('%</li>\r\n            ', 0);
                    return buffer;
                };
                option40.inverse = function (scope, buffer) {
                    buffer.write('\r\n                ', 0);
                    var option44 = {
                        escape: 1
                    };
                    var params45 = [];
                    var id46 = scope.resolve(["shopDsr", "data", "consignmentGapBottom"], 0);
                    params45.push(id46);
                    option44.params = params45;
                    option44.fn = function (scope, buffer) {
                        buffer.write('\r\n                <i class="rate-low"></i>', 0);
                        var id47 = scope.resolve(["shopDsr", "data", "consignmentGapString"], 0);
                        buffer.write(id47, true);
                        buffer.write('%</li>\r\n                ', 0);
                        return buffer;
                    };
                    option44.inverse = function (scope, buffer) {
                        buffer.write('\r\n                    ', 0);
                        var option48 = {
                            escape: 1
                        };
                        var params49 = [];
                        var id50 = scope.resolve(["shopDsr", "data", "consignmentGapFair"], 0);
                        params49.push(id50);
                        option48.params = params49;
                        option48.fn = function (scope, buffer) {
                            buffer.write('\r\n                    <i class="rate-same"></i>持平</li>\r\n                    ', 0);
                            return buffer;
                        };
                        option48.inverse = function (scope, buffer) {
                            buffer.write('\r\n                    该店铺尚未收到评价\r\n                    ', 0);
                            return buffer;
                        };
                        buffer = ifCommand.call(tpl, scope, option48, buffer, 48);
                        buffer.write('\r\n                ', 0);
                        return buffer;
                    };
                    buffer = ifCommand.call(tpl, scope, option44, buffer, 45);
                    buffer.write('\r\n            ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(tpl, scope, option40, buffer, 42);
                buffer.write('\r\n        ', 0);
                return buffer;
            };
            option0.inverse = function (scope, buffer) {
                buffer.write('\r\n        该店铺尚未收到评价\r\n        ', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option0, buffer, 3);
            buffer.write('\r\n    </ul>\r\n</div>', 0);
            return buffer;
        };
shopDsr.TPL_NAME = module.name;
shopDsr.version = "5.0.0";
return shopDsr
});