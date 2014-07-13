/** Compiled By kissy-xtemplate */
/*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
var itemPriceHtml = function (scope, buffer, undefined) {
    var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
    var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
    buffer.write('<div class="mod-item-property" data-spm="991222405">\r\n    <h2 class="mod-item-title">', 0);
    var id0 = scope.resolve([
            'itemPrice',
            'data',
            'itemTitle'
        ], 0);
    buffer.write(id0, true);
    buffer.write('</h2>\r\n\r\n    <div class="mod-item-meta">\r\n        <!-- \u4EF7\u683C -->\r\n        <div class="meta-item J_Price clearfix">\r\n            <div class="meta-item-hd">\u4EF7&nbsp;&nbsp;\u683C</div>\r\n            <div class="meta-item-bd price">\r\n                <em class="yuan">&yen;</em>\r\n                <strong>', 0);
    var option1 = { escape: 1 };
    var params2 = [];
    var id3 = scope.resolve([
            'itemPrice',
            'data',
            'priceSpan'
        ], 0);
    params2.push(id3);
    option1.params = params2;
    option1.fn = function (scope, buffer) {
        buffer.write('\r\n                    ', 0);
        var option4 = { escape: 1 };
        var params5 = [];
        var id6 = scope.resolve([
                'itemPrice',
                'data',
                'minPrice',
                'amount'
            ], 0);
        params5.push(id6);
        option4.params = params5;
        var callRet7;
        callRet7 = callFnUtil(tpl, scope, option4, buffer, ['formatPrice'], 0, 11);
        if (callRet7 && callRet7.isBuffer) {
            buffer = callRet7;
            callRet7 = undefined;
        }
        buffer.write(callRet7, true);
        buffer.write('-', 0);
        var option8 = { escape: 1 };
        var params9 = [];
        var id10 = scope.resolve([
                'itemPrice',
                'data',
                'maxPrice',
                'amount'
            ], 0);
        params9.push(id10);
        option8.params = params9;
        var callRet11;
        callRet11 = callFnUtil(tpl, scope, option8, buffer, ['formatPrice'], 0, 11);
        if (callRet11 && callRet11.isBuffer) {
            buffer = callRet11;
            callRet11 = undefined;
        }
        buffer.write(callRet11, true);
        buffer.write('\r\n                    ', 0);
        return buffer;
    };
    option1.inverse = function (scope, buffer) {
        buffer.write('\r\n                    ', 0);
        var option12 = { escape: 1 };
        var params13 = [];
        var id14 = scope.resolve([
                'itemPrice',
                'data',
                'itemPrice',
                'amount'
            ], 0);
        params13.push(id14);
        option12.params = params13;
        var callRet15;
        callRet15 = callFnUtil(tpl, scope, option12, buffer, ['formatPrice'], 0, 13);
        if (callRet15 && callRet15.isBuffer) {
            buffer = callRet15;
            callRet15 = undefined;
        }
        buffer.write(callRet15, true);
        buffer.write('', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option1, buffer, 10);
    buffer.write('</strong>\r\n                ', 0);
    var option16 = { escape: 1 };
    var params17 = [];
    var id18 = scope.resolve([
            'itemPrice',
            'data',
            'specialUnit'
        ], 0);
    params17.push(id18);
    option16.params = params17;
    option16.fn = function (scope, buffer) {
        buffer.write('\r\n                &nbsp;&nbsp;\uFF08<span>', 0);
        var id19 = scope.resolve([
                'itemPrice',
                'data',
                'unitPrice'
            ], 0);
        buffer.write(id19, true);
        buffer.write('', 0);
        var id20 = scope.resolve([
                'itemPrice',
                'data',
                'unit'
            ], 0);
        buffer.write(id20, true);
        buffer.write('</span>\uFF09', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option16, buffer, 14);
    buffer.write('\r\n                <input type="hidden" id="itemStart" value="', 0);
    var id21 = scope.resolve([
            'itemPrice',
            'data',
            'itemStarts'
        ], 0);
    buffer.write(id21, true);
    buffer.write('"/>\r\n                <input type="hidden" id="itemEnd" value="', 0);
    var id22 = scope.resolve([
            'itemPrice',
            'data',
            'itemEnds'
        ], 0);
    buffer.write(id22, true);
    buffer.write('"/>\r\n            </div>\r\n        </div>\r\n        ', 0);
    var option23 = { escape: 1 };
    var params24 = [];
    var id25 = scope.resolve([
            'itemPrice',
            'data',
            'onLine'
        ], 0);
    params24.push(id25);
    option23.params = params24;
    option23.fn = function (scope, buffer) {
        buffer.write('\r\n        ', 0);
        var option26 = { escape: 1 };
        var params27 = [];
        var id28 = scope.resolve([
                'itemPrice',
                'data',
                'specialUnit'
            ], 0);
        params27.push(id28);
        option26.params = params27;
        option26.fn = function (scope, buffer) {
            buffer.write('\r\n        <!--\u51C0\u542B\u91CF-->\r\n        <div class="meta-item clearfix">\r\n            <div class="meta-item-hd">\r\n                ', 0);
            var option29 = { escape: 1 };
            var params30 = [];
            var id31 = scope.resolve([
                    'itemPrice',
                    'data',
                    'unit'
                ], 0);
            params30.push(id31);
            params30.push('\u6298');
            option29.params = params30;
            option29.fn = function (scope, buffer) {
                buffer.write(' \u9762&nbsp;&nbsp;\u503C ', 0);
                return buffer;
            };
            buffer = callCommandUtil(tpl, scope, option29, buffer, ['ifHas'], 25);
            buffer.write('\r\n                ', 0);
            var option32 = { escape: 1 };
            var params33 = [];
            var id34 = scope.resolve([
                    'itemPrice',
                    'data',
                    'unit'
                ], 0);
            params33.push(id34);
            params33.push('g');
            option32.params = params33;
            option32.fn = function (scope, buffer) {
                buffer.write(' \u51C0\u542B\u91CF ', 0);
                return buffer;
            };
            buffer = callCommandUtil(tpl, scope, option32, buffer, ['ifHas'], 26);
            buffer.write('\r\n                ', 0);
            var option35 = { escape: 1 };
            var params36 = [];
            var id37 = scope.resolve([
                    'itemPrice',
                    'data',
                    'unit'
                ], 0);
            params36.push(id37);
            params36.push('ml');
            option35.params = params36;
            option35.fn = function (scope, buffer) {
                buffer.write(' \u51C0\u542B\u91CF ', 0);
                return buffer;
            };
            buffer = callCommandUtil(tpl, scope, option35, buffer, ['ifHas'], 27);
            buffer.write('\r\n            </div>\r\n            <div class="meta-item-bd J_bd">\r\n                ', 0);
            var option38 = { escape: 1 };
            var params39 = [];
            var id40 = scope.resolve([
                    'itemPrice',
                    'data',
                    'unit'
                ], 0);
            params39.push(id40);
            params39.push('\u6298');
            option38.params = params39;
            option38.fn = function (scope, buffer) {
                buffer.write(' <em class="yuan">&yen;</em> ', 0);
                return buffer;
            };
            buffer = callCommandUtil(tpl, scope, option38, buffer, ['ifHas'], 30);
            buffer.write('\r\n                ', 0);
            var id41 = scope.resolve([
                    'itemPrice',
                    'data',
                    'spec'
                ], 0);
            buffer.write(id41, true);
            buffer.write('\r\n                ', 0);
            var option42 = { escape: 1 };
            var params43 = [];
            var id44 = scope.resolve([
                    'itemPrice',
                    'data',
                    'unit'
                ], 0);
            params43.push(id44);
            params43.push('g');
            option42.params = params43;
            option42.fn = function (scope, buffer) {
                buffer.write(' g ', 0);
                return buffer;
            };
            buffer = callCommandUtil(tpl, scope, option42, buffer, ['ifHas'], 32);
            buffer.write('\r\n                ', 0);
            var option45 = { escape: 1 };
            var params46 = [];
            var id47 = scope.resolve([
                    'itemPrice',
                    'data',
                    'unit'
                ], 0);
            params46.push(id47);
            params46.push('ml');
            option45.params = params46;
            option45.fn = function (scope, buffer) {
                buffer.write(' ml ', 0);
                return buffer;
            };
            buffer = callCommandUtil(tpl, scope, option45, buffer, ['ifHas'], 33);
            buffer.write('\r\n            </div>\r\n        </div>\r\n        ', 0);
            return buffer;
        };
        buffer = ifCommand.call(tpl, scope, option26, buffer, 21);
        buffer.write('\r\n        <!--ump\u4EF7\u683C-->\r\n        <div class="meta-item  J_UMP hidden clearfix">\r\n            <div class="meta-item-hd">\u4FC3&nbsp;&nbsp;\u9500</div>\r\n            <div class="meta-item-bd J_bd price">\r\n\r\n            </div>\r\n        </div>\r\n\r\n        <!--\u5176\u4ED6\u4F18\u60E0-->\r\n        <div class="meta-item hidden J_PointTxt clearfix">\r\n            <div class="meta-item-hd">\u4F18&nbsp;&nbsp;\u60E0</div>\r\n            <div class="meta-item-bd J_bd"></div>\r\n        </div>\r\n\r\n        <!--\u589E\u503C\u670D\u52A1-->\r\n        <div class="meta-item hidden J_AddService clearfix">\r\n            <div class="meta-item-hd">\u670D&nbsp;&nbsp;\u52A1</div>\r\n            <div class="meta-item-bd J_bd"></div>\r\n        </div>\r\n\r\n        <!--\u914D\u9001-->\r\n        <div class="meta-item J_Logistic clearfix">\r\n            <div class="meta-item-hd">\u914D&nbsp;&nbsp;\u9001</div>\r\n            <div class="meta-item-bd J_bd"></div>\r\n        </div>\r\n\r\n        <!--\u9500\u91CF-->\r\n        <div class="meta-item J_Deal clearfix">\r\n            <div class="meta-item-hd">\u9500&nbsp;&nbsp;\u91CF</div>\r\n            <div class="meta-item-bd J_bd"></div>\r\n        </div>\r\n\r\n        <!--itemCommitmentModulet start-->\r\n        ', 0);
        var option48 = {};
        var params49 = [];
        params49.push('./itemCommitment');
        option48.params = params49;
        require('./itemCommitment');
        var callRet50;
        callRet50 = includeCommand.call(tpl, scope, option48, buffer, 70);
        if (callRet50 && callRet50.isBuffer) {
            buffer = callRet50;
            callRet50 = undefined;
        }
        buffer.write(callRet50, false);
        buffer.write('\r\n        <!--itemCommitmentModulet end-->\r\n\r\n        ', 0);
        return buffer;
    };
    option23.inverse = function (scope, buffer) {
        buffer.write('\r\n        <div class="meta-item clearfix">\r\n            <div class="meta-item-hd"></div>\r\n            <div class="meta-item-bd J_bd">\r\n                <p class="tb-hint"><strong>\u6B64\u5B9D\u8D1D\u5DF2\u4E0B\u67B6</strong> <span><a title="\u4E3A\u4EC0\u4E48" href="http://service.taobao.com/support/knowledge-1102683.htm" target="_blank"><img alt="\u4E3A\u4EC0\u4E48" src="http://img01.taobaocdn.com/tps/i1/T1VuyiXcRkXXazG.A_-11-11.gif"></a></span></p>\r\n                <p class="tb-tips">1:\u8054\u7CFB\u5356\u5BB6\u54A8\u8BE2</p>\r\n                ', 0);
        var option51 = { escape: 1 };
        var params52 = [];
        var id53 = scope.resolve([
                'itemPrice',
                'data',
                'shopUrl'
            ], 0);
        params52.push(id53);
        option51.params = params52;
        option51.fn = function (scope, buffer) {
            buffer.write('\r\n                <p class="tb-tips">\r\n                    2:\u4F60\u53EF\u4EE5<a href="', 0);
            var id54 = scope.resolve([
                    'itemPrice',
                    'data',
                    'shopUrl'
                ], 0);
            buffer.write(id54, true);
            buffer.write('">\u8FDB\u5165\u638C\u67DC\u5E97\u94FA</a>\r\n                </p>\r\n                ', 0);
            return buffer;
        };
        buffer = ifCommand.call(tpl, scope, option51, buffer, 79);
        buffer.write('\r\n            </div>\r\n        </div>\r\n        ', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option23, buffer, 20);
    buffer.write('\r\n    </div>\r\n\r\n</div>\r\n', 0);
    var option55 = { escape: 1 };
    var params56 = [];
    var id57 = scope.resolve([
            'itemPrice',
            'data',
            'onLine'
        ], 0);
    params56.push(id57);
    option55.params = params56;
    option55.fn = function (scope, buffer) {
        buffer.write('\r\n<div class="mod-item-action" id="J_item-action" data-spm="991222433">\r\n    ', 0);
        var option58 = { escape: 1 };
        var params59 = [];
        var id60 = scope.resolve([
                'itemPrice',
                'data',
                'canBuy'
            ], 0);
        params59.push(id60);
        option58.params = params59;
        option58.fn = function (scope, buffer) {
            buffer.write('\r\n    <button type="button" class="btn-buy" id="J_btn-buy">\u7ACB\u523B\u8D2D\u4E70</button>\r\n    ', 0);
            return buffer;
        };
        buffer = ifCommand.call(tpl, scope, option58, buffer, 92);
        buffer.write('\r\n\r\n    ', 0);
        var option61 = { escape: 1 };
        var params62 = [];
        var id63 = scope.resolve([
                'itemPrice',
                'data',
                'showCart'
            ], 0);
        params62.push(id63);
        option61.params = params62;
        option61.fn = function (scope, buffer) {
            buffer.write('\r\n    <button type="button" class="btn-cart" id="J_btn-cart">\u52A0\u5165\u8D2D\u7269\u8F66</button>\r\n    ', 0);
            return buffer;
        };
        buffer = ifCommand.call(tpl, scope, option61, buffer, 96);
        buffer.write('\r\n    <!--<button type="button" class="btn-share"><i class="icon-share"></i></button>-->\r\n    <button type="button" class="btn-favorite"><i class="icon-favorite"></i></button>\r\n</div>\r\n<!--itemBuyModulet start-->\r\n', 0);
        var option64 = {};
        var params65 = [];
        params65.push('./itemBuy');
        option64.params = params65;
        require('./itemBuy');
        var callRet66;
        callRet66 = includeCommand.call(tpl, scope, option64, buffer, 103);
        if (callRet66 && callRet66.isBuffer) {
            buffer = callRet66;
            callRet66 = undefined;
        }
        buffer.write(callRet66, false);
        buffer.write('\r\n<!--itemBuyModulet end-->\r\n<!--itemPrice.dataStepModulet start-->\r\n', 0);
        var option67 = {};
        var params68 = [];
        params68.push('./itemPriceStep');
        option67.params = params68;
        require('./itemPriceStep');
        var callRet69;
        callRet69 = includeCommand.call(tpl, scope, option67, buffer, 106);
        if (callRet69 && callRet69.isBuffer) {
            buffer = callRet69;
            callRet69 = undefined;
        }
        buffer.write(callRet69, false);
        buffer.write('\r\n<!--itemPrice.dataStepModulet end-->\r\n', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option55, buffer, 90);
    return buffer;
};
itemPriceHtml.TPL_NAME = module.name;
itemPriceHtml.version = '5.0.0';
module.exports = itemPriceHtml;