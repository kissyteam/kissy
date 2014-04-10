/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        var t = function (scope, buffer, payload, undefined) {
            var engine = this,
                nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            if ("5.0.0" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
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
            buffer.write('<div class="mod-shop-bd" data-spm="991222493">\n    <ul class="mod-shop-dsr J_DSR clearfix">\n        ');
            var option0 = {
                escape: 1
            };
            var params1 = [];
            var id2 = scope.resolve(["shopDsr", "data", "hasDsrRecord"]);
            params1.push(id2);
            option0.params = params1;
            option0.fn = function (scope, buffer) {

                buffer.write('\n        <li>\n            <label title="');
                var option3 = {
                    escape: 1
                };
                var params4 = [];
                var id5 = scope.resolve(["shopDsr", "data", "merchandisAvgScore"]);
                params4.push(id5);
                option3.params = params4;
                option3.fn = function (scope, buffer) {

                    buffer.write('');
                    var id6 = scope.resolve(["shopDsr", "data", "merchandisAvgScore"]);
                    buffer.write(id6, true);
                    buffer.write('分');

                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option3, buffer, 5, payload);
                buffer.write('">\n                描述 ');
                var id7 = scope.resolve(["shopDsr", "data", "merchandisAvgScore"]);
                buffer.write(id7, true);
                buffer.write('\n            </label>\n            ');
                var option8 = {
                    escape: 1
                };
                var params9 = [];
                var id10 = scope.resolve(["shopDsr", "data", "merchandisGapUp"]);
                params9.push(id10);
                option8.params = params9;
                option8.fn = function (scope, buffer) {

                    buffer.write('\n            <i class="rate-high"></i>');
                    var id11 = scope.resolve(["shopDsr", "data", "merchandisGapString"]);
                    buffer.write(id11, true);
                    buffer.write('%</li>\n            ');

                    return buffer;
                };
                option8.inverse = function (scope, buffer) {

                    buffer.write('\n                ');
                    var option12 = {
                        escape: 1
                    };
                    var params13 = [];
                    var id14 = scope.resolve(["shopDsr", "data", "merchandisGapBottom"]);
                    params13.push(id14);
                    option12.params = params13;
                    option12.fn = function (scope, buffer) {

                        buffer.write('\n                <i class="rate-low"></i>');
                        var id15 = scope.resolve(["shopDsr", "data", "merchandisGapString"]);
                        buffer.write(id15, true);
                        buffer.write('%</li>\n                ');

                        return buffer;
                    };
                    option12.inverse = function (scope, buffer) {

                        buffer.write('\n                    ');
                        var option16 = {
                            escape: 1
                        };
                        var params17 = [];
                        var id18 = scope.resolve(["shopDsr", "data", "merchandisGapFair"]);
                        params17.push(id18);
                        option16.params = params17;
                        option16.fn = function (scope, buffer) {

                            buffer.write('\n                    <i class="rate-same"></i>持平</li>\n                    ');

                            return buffer;
                        };
                        option16.inverse = function (scope, buffer) {

                            buffer.write('\n                    该店铺尚未收到评价\n                    ');

                            return buffer;
                        };
                        buffer = ifCommand.call(engine, scope, option16, buffer, 14, payload);
                        buffer.write('\n                ');

                        return buffer;
                    };
                    buffer = ifCommand.call(engine, scope, option12, buffer, 11, payload);
                    buffer.write('\n            ');

                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option8, buffer, 8, payload);
                buffer.write('\n        <li>\n            <label title="');
                var option19 = {
                    escape: 1
                };
                var params20 = [];
                var id21 = scope.resolve(["shopDsr", "data", "serviceAvgScore"]);
                params20.push(id21);
                option19.params = params20;
                option19.fn = function (scope, buffer) {

                    buffer.write('');
                    var id22 = scope.resolve(["shopDsr", "data", "serviceAvgScore"]);
                    buffer.write(id22, false);
                    buffer.write('分');

                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option19, buffer, 22, payload);
                buffer.write('">\n                服务 ');
                var id23 = scope.resolve(["shopDsr", "data", "serviceAvgScore"]);
                buffer.write(id23, true);
                buffer.write('\n            </label>\n            ');
                var option24 = {
                    escape: 1
                };
                var params25 = [];
                var id26 = scope.resolve(["shopDsr", "data", "serviceGapUp"]);
                params25.push(id26);
                option24.params = params25;
                option24.fn = function (scope, buffer) {

                    buffer.write('\n            <i class="rate-high"></i>');
                    var id27 = scope.resolve(["shopDsr", "data", "serviceGapString"]);
                    buffer.write(id27, true);
                    buffer.write('%</li>\n            ');

                    return buffer;
                };
                option24.inverse = function (scope, buffer) {

                    buffer.write('\n                ');
                    var option28 = {
                        escape: 1
                    };
                    var params29 = [];
                    var id30 = scope.resolve(["shopDsr", "data", "serviceGapBottom"]);
                    params29.push(id30);
                    option28.params = params29;
                    option28.fn = function (scope, buffer) {

                        buffer.write('\n                <i class="rate-low"></i>');
                        var id31 = scope.resolve(["shopDsr", "data", "serviceGapString"]);
                        buffer.write(id31, true);
                        buffer.write('%</li>\n                ');

                        return buffer;
                    };
                    option28.inverse = function (scope, buffer) {

                        buffer.write('\n                    ');
                        var option32 = {
                            escape: 1
                        };
                        var params33 = [];
                        var id34 = scope.resolve(["shopDsr", "data", "serviceGapFair"]);
                        params33.push(id34);
                        option32.params = params33;
                        option32.fn = function (scope, buffer) {

                            buffer.write('\n                    <i class="rate-same"></i>持平</li>\n                    ');

                            return buffer;
                        };
                        option32.inverse = function (scope, buffer) {

                            buffer.write('\n                    该店铺尚未收到评价\n                    ');

                            return buffer;
                        };
                        buffer = ifCommand.call(engine, scope, option32, buffer, 31, payload);
                        buffer.write('\n                ');

                        return buffer;
                    };
                    buffer = ifCommand.call(engine, scope, option28, buffer, 28, payload);
                    buffer.write('\n            ');

                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option24, buffer, 25, payload);
                buffer.write('\n        <li>\n            <label title="');
                var option35 = {
                    escape: 1
                };
                var params36 = [];
                var id37 = scope.resolve(["shopDsr", "data", "consignmentAvgScore"]);
                params36.push(id37);
                option35.params = params36;
                option35.fn = function (scope, buffer) {

                    buffer.write('');
                    var id38 = scope.resolve(["shopDsr", "data", "consignmentAvgScore"]);
                    buffer.write(id38, true);
                    buffer.write('分');

                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option35, buffer, 39, payload);
                buffer.write('">\n                物流 ');
                var id39 = scope.resolve(["shopDsr", "data", "consignmentAvgScore"]);
                buffer.write(id39, true);
                buffer.write('\n            </label>\n            ');
                var option40 = {
                    escape: 1
                };
                var params41 = [];
                var id42 = scope.resolve(["shopDsr", "data", "consignmentGapUp"]);
                params41.push(id42);
                option40.params = params41;
                option40.fn = function (scope, buffer) {

                    buffer.write('\n            <i class="rate-high"></i>');
                    var id43 = scope.resolve(["shopDsr", "data", "consignmentGapString"]);
                    buffer.write(id43, true);
                    buffer.write('%</li>\n            ');

                    return buffer;
                };
                option40.inverse = function (scope, buffer) {

                    buffer.write('\n                ');
                    var option44 = {
                        escape: 1
                    };
                    var params45 = [];
                    var id46 = scope.resolve(["shopDsr", "data", "consignmentGapBottom"]);
                    params45.push(id46);
                    option44.params = params45;
                    option44.fn = function (scope, buffer) {

                        buffer.write('\n                <i class="rate-low"></i>');
                        var id47 = scope.resolve(["shopDsr", "data", "consignmentGapString"]);
                        buffer.write(id47, true);
                        buffer.write('%</li>\n                ');

                        return buffer;
                    };
                    option44.inverse = function (scope, buffer) {

                        buffer.write('\n                    ');
                        var option48 = {
                            escape: 1
                        };
                        var params49 = [];
                        var id50 = scope.resolve(["shopDsr", "data", "consignmentGapFair"]);
                        params49.push(id50);
                        option48.params = params49;
                        option48.fn = function (scope, buffer) {

                            buffer.write('\n                    <i class="rate-same"></i>持平</li>\n                    ');

                            return buffer;
                        };
                        option48.inverse = function (scope, buffer) {

                            buffer.write('\n                    该店铺尚未收到评价\n                    ');

                            return buffer;
                        };
                        buffer = ifCommand.call(engine, scope, option48, buffer, 48, payload);
                        buffer.write('\n                ');

                        return buffer;
                    };
                    buffer = ifCommand.call(engine, scope, option44, buffer, 45, payload);
                    buffer.write('\n            ');

                    return buffer;
                };
                buffer = ifCommand.call(engine, scope, option40, buffer, 42, payload);
                buffer.write('\n        ');

                return buffer;
            };
            option0.inverse = function (scope, buffer) {

                buffer.write('\n        该店铺尚未收到评价\n        ');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option0, buffer, 3, payload);
            buffer.write('\n    </ul>\n</div>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});