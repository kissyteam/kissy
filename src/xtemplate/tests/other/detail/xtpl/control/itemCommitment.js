/** Compiled By kissy-xtemplate */
/*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
var itemCommitmentHtml = function (scope, buffer, undefined) {
    var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
    var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
    buffer.write('\r\n\r\n<div class="meta-item clearfix" data-spm="991222525">\r\n    <div class="meta-item-hd">\u627F&nbsp;&nbsp;\u8BFA</div>\r\n    <div class="meta-item-bd">\r\n        <!--\u670D\u52A1-->\r\n        ', 0);
    var option0 = { escape: 1 };
    var params1 = [];
    var id2 = scope.resolve([
            'itemCommitment',
            'data',
            'brokenReMail'
        ], 0);
    params1.push(id2);
    option0.params = params1;
    option0.fn = function (scope, buffer) {
        buffer.write('<a target="_blank" title="\u7834\u635F\u8865\u5BC4"\r\n                                                href="${mealServer}/cu_pr.htm?item_num_id=$!{itemCommitment.itemId}"><span class="icon-psbj"></span></a>', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option0, buffer, 7);
    buffer.write('\r\n        ', 0);
    var option3 = { escape: 1 };
    var params4 = [];
    var id5 = scope.resolve([
            'itemCommitment',
            'data',
            'yunfeiXian'
        ], 0);
    params4.push(id5);
    option3.params = params4;
    option3.fn = function (scope, buffer) {
        buffer.write('<a target="_blank" title="\u8FD0\u8D39\u9669"\r\n                                                 href="http://ju.mmstat.com/?url=http://www.taobao.com/go/act/baoxian/yunfeixian.php?ad_id=&am_id=&cm_id=&pm_id=150106180823b65f1640"><span class="icon-yfx "></span></a>', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option3, buffer, 9);
    buffer.write('\r\n\r\n        ', 0);
    var option6 = { escape: 1 };
    var params7 = [];
    var id8 = scope.resolve([
            'itemCommitment',
            'data',
            'refundmentCommitment'
        ], 0);
    params7.push(id8);
    option6.params = params7;
    option6.fn = function (scope, buffer) {
        buffer.write('<a target="_blank" title="\u9000\u8D27\u627F\u8BFA"\r\n                                                           href="${mealServer}/cu_pr.htm?item_num_id=$!{itemCommitment.itemId}"><span class="icon-thcn"></span></a>', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option6, buffer, 12);
    buffer.write('\r\n        ', 0);
    var option9 = { escape: 1 };
    var params10 = [];
    var id11 = scope.resolve([
            'itemCommitment',
            'data',
            'qualityCommitment'
        ], 0);
    params10.push(id11);
    option9.params = params10;
    option9.fn = function (scope, buffer) {
        buffer.write('<a target="_blank" title="\u54C1\u8D28\u627F\u8BFA"\r\n                                                        href="${mealServer}/cu_pr.htm?item_num_id=$!{itemCommitment.itemId}"><span class="icon-pzcn"></span></a>', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option9, buffer, 14);
    buffer.write('\r\n        ', 0);
    var option12 = { escape: 1 };
    var params13 = [];
    var id14 = scope.resolve([
            'itemCommitment',
            'data',
            'qualityAssurance'
        ], 0);
    params13.push(id14);
    option12.params = params13;
    option12.fn = function (scope, buffer) {
        buffer.write('<a target="_blank" title="\u8D28\u91CF\u9274\u5B9A"\r\n                                                       href="http://www.taobao.com/go/act/sale/3cshumajd.php?ad_id=&am_id=130104775269aec13e6b&cm_id=&pm_id="><span class="icon-zj"></span></a>', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option12, buffer, 16);
    buffer.write('\r\n        ', 0);
    var option15 = { escape: 1 };
    var params16 = [];
    var id17 = scope.resolve([
            'itemCommitment',
            'data',
            'textileQualityAssurance'
        ], 0);
    params16.push(id17);
    option15.params = params16;
    option15.fn = function (scope, buffer) {
        buffer.write('<a target="_blank" title="\u8D28\u91CF\u9274\u5B9A"\r\n                                                              href="http://www.taobao.com/go/act/315/jiandingbuyer.php"><span class="icon-zj"></span></a>', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option15, buffer, 18);
    buffer.write('\r\n        ', 0);
    var option18 = { escape: 1 };
    var params19 = [];
    var id20 = scope.resolve([
            'itemCommitment',
            'data',
            'sevenDaysRefundment'
        ], 0);
    params19.push(id20);
    option18.params = params19;
    option18.fn = function (scope, buffer) {
        buffer.write('<a target="_blank"\r\n                                                          href="http://www.taobao.com/go/act/315/xb_20100707.php?ad_id=&am_id=1300268931aef04f0cdc&cm_id=&pm_id=#qitian" title="\u4E03\u5929\u9000\u6362"><span class="icon-7tth"></span></a>', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option18, buffer, 20);
    buffer.write('\r\n\r\n        ', 0);
    var option21 = { escape: 1 };
    var params22 = [];
    var id23 = scope.resolve([
            'itemCommitment',
            'data',
            'payForThrice'
        ], 0);
    params22.push(id23);
    option21.params = params22;
    option21.fn = function (scope, buffer) {
        buffer.write('<a target="_blank"\r\n                                                   href="http://www.taobao.com/go/act/315/xb_20100707.php?ad_id=&am_id=1300268931aef04f0cdc&cm_id=&pm_id=#shandian" title="\u5047\u4E00\u8D54\u4E09"><span class="icon-zpbz"></span></a>', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option21, buffer, 23);
    buffer.write('\r\n\r\n        ', 0);
    var option24 = { escape: 1 };
    var params25 = [];
    var id26 = scope.resolve([
            'itemCommitment',
            'data',
            'shopsThreeBags'
        ], 0);
    params25.push(id26);
    option24.params = params25;
    option24.fn = function (scope, buffer) {
        buffer.write('<a target="_blank"\r\n                                                    href="http://itemCommitment.taobao.com/support/knowledge-1121827.htm"  title="\u978B\u7C7B\u4E09\u5305"><span>\u978B\u7C7B\u4E09\u5305</span></a>', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option24, buffer, 26);
    buffer.write('\r\n\r\n        ', 0);
    var option27 = { escape: 1 };
    var params28 = [];
    var id29 = scope.resolve([
            'itemCommitment',
            'data',
            'newProducts'
        ], 0);
    params28.push(id29);
    option27.params = params28;
    option27.fn = function (scope, buffer) {
        buffer.write('<a title="\u65B0\u54C1" target="_blank"\r\n                                                  href="http://itemCommitment.taobao.com/support/knowledge-1138476.htm7"><span class="icon-sxp"></span></a>', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option27, buffer, 29);
    buffer.write('\r\n        ', 0);
    var option30 = { escape: 1 };
    var params31 = [];
    var id32 = scope.resolve([
            'itemCommitment',
            'data',
            'threecThirtydays'
        ], 0);
    params31.push(id32);
    option30.params = params31;
    option30.fn = function (scope, buffer) {
        buffer.write('<a target="_blank"\r\n                                                       href="http://www.taobao.com/go/act/315/xb_20100707.php?ad_id=&am_id=1300268931aef04f0cdc&cm_id=&pm_id=#weixiu" title="30\u5929\u7EF4\u4FEE"><span class="icon-shwx"></span></a>', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option30, buffer, 31);
    buffer.write('\r\n\r\n        ', 0);
    var option33 = { escape: 1 };
    var params34 = [];
    var id35 = scope.resolve([
            'itemCommitment',
            'data',
            'is24HourConsignment'
        ], 0);
    params34.push(id35);
    option33.params = params34;
    option33.fn = function (scope, buffer) {
        buffer.write('<a target="_blank"\r\n                                                        href="http://www.taobao.com/go/act/315/xb_20100707.php?ad_id=&am_id=1300268931aef04f0cdc&cm_id=&pm_id=#shandian" title="24\u5C0F\u65F6\u53D1\u8D27"><span>24\u5C0F\u65F6\u53D1\u8D27</span></a>', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option33, buffer, 34);
    buffer.write('\r\n        ', 0);
    var option36 = { escape: 1 };
    var params37 = [];
    var id38 = scope.resolve([
            'itemCommitment',
            'data',
            'immediatelyConsignment'
        ], 0);
    params37.push(id38);
    option36.params = params37;
    option36.fn = function (scope, buffer) {
        buffer.write('<a target="_blank"\r\n                                                             href="http://www.taobao.com/go/act/315/xb_20100707.php?ad_id=&am_id=1300268931aef04f0cdc&cm_id=&pm_id=#shandian" title="\u95EA\u7535\u53D1\u8D27"><span>\u95EA\u7535\u53D1\u8D27</span></a>', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option36, buffer, 36);
    buffer.write('\r\n        ', 0);
    var option39 = { escape: 1 };
    var params40 = [];
    var id41 = scope.resolve([
            'itemCommitment',
            'data',
            'autoConsignment'
        ], 0);
    params40.push(id41);
    option39.params = params40;
    option39.fn = function (scope, buffer) {
        buffer.write('<a href="http://service.taobao.com/support/knowledge-1119683.htm"\r\n                                                      target="_blank" title="\u81EA\u52A8\u53D1\u8D27"><span>\u81EA\u52A8\u53D1\u8D27</span></a>', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option39, buffer, 38);
    buffer.write('\r\n        ', 0);
    var option42 = { escape: 1 };
    var params43 = [];
    var id44 = scope.resolve([
            'itemCommitment',
            'data',
            'virtualItem'
        ], 0);
    params43.push(id44);
    option42.params = params43;
    option42.fn = function (scope, buffer) {
        buffer.write('<a href="http://service.taobao.com/support/knowledge-1119861.htm"\r\n                                                  target="_blank" title="\u865A\u62DF\u7269\u54C1"><span>\u865A\u62DF\u7269\u54C1</span></a>', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option42, buffer, 40);
    buffer.write('\r\n\r\n        ', 0);
    var option45 = { escape: 1 };
    var params46 = [];
    var id47 = scope.resolve([
            'itemCommitment',
            'data',
            'charityContribute'
        ], 0);
    params46.push(id47);
    option45.params = params46;
    option45.fn = function (scope, buffer) {
        buffer.write('<a target="_blank"\r\n                                                        href="http://itemCommitment.taobao.com/support/knowledge-1117985.htm" title="\u516C\u76CA\u5B9D\u8D1D"><span class="icon-gy"></span></a>', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option45, buffer, 43);
    buffer.write('\r\n\r\n        ', 0);
    var option48 = { escape: 1 };
    var params49 = [];
    var id50 = scope.resolve([
            'itemCommitment',
            'data',
            'withActivityCards'
        ], 0);
    params49.push(id50);
    option48.params = params49;
    option48.fn = function (scope, buffer) {
        buffer.write('<a\r\n            href="http://qudao.taobao.com/channelt/s9364759a707947ed8d0282cacaa84ea5.e?productID=$!{itemCommitment.itemId}" target="_blank"><img src="http://img07.taobaocdn.com/tps/i7/T1kmNAXg8cXXXXXXXX-60-16.png"/></a>', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option48, buffer, 46);
    buffer.write('\r\n        ', 0);
    var option51 = { escape: 1 };
    var params52 = [];
    var id53 = scope.resolve([
            'itemCommitment',
            'data',
            'delegateItem'
        ], 0);
    params52.push(id53);
    option51.params = params52;
    option51.fn = function (scope, buffer) {
        buffer.write('<span>\u4EE3\u8D2D\u5546\u54C1</span>', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option51, buffer, 48);
    buffer.write('\r\n        ', 0);
    var option54 = { escape: 1 };
    var params55 = [];
    var id56 = scope.resolve([
            'itemCommitment',
            'data',
            'tccItem'
        ], 0);
    params55.push(id56);
    option54.params = params55;
    option54.fn = function (scope, buffer) {
        buffer.write('<a href="http://itemCommitment.taobao.com/support/knowledge-1126791.htm"\r\n                                              target="_blank" title="\u5E73\u53F0\u4EE3\u5145"><img src="http://img02.taobaocdn.com/tps/i2/T1PuR3XohwXXXXXXXX-15-15.png" width="15" height="15" /></a>', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option54, buffer, 49);
    buffer.write('\r\n        ', 0);
    var option57 = { escape: 1 };
    var params58 = [];
    var id59 = scope.resolve([
            'itemCommitment',
            'data',
            'installitemPrice'
        ], 0);
    params58.push(id59);
    option57.params = params58;
    option57.fn = function (scope, buffer) {
        buffer.write('<a target="_blank"\r\n                                                       href="http://itemCommitment.taobao.com/support/help-13290.htm" title="\u90E8\u5206\u57CE\u5E02\u63D0\u4F9B\u914D\u9001\u5B89\u88C5\u670D\u52A1"><span>\u914D\u9001\u5B89\u88C5</span></a>', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option57, buffer, 51);
    buffer.write('\r\n\r\n        ', 0);
    var option60 = { escape: 1 };
    var params61 = [];
    var id62 = scope.resolve([
            'itemCommitment',
            'data',
            'jFB'
        ], 0);
    params61.push(id62);
    option60.params = params61;
    option60.fn = function (scope, buffer) {
        buffer.write('<a href="https://jf.alipay.com/prod/rule.htm?src=jfb-tbDetail1#help1"\r\n                                          target="_blank" title="\u652F\u6301\u96C6\u5206\u5B9D\u8D2D\u7269\u62B5\u73B0"><span class="icon-jfb"></span></a>', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option60, buffer, 54);
    buffer.write('\r\n    </div>\r\n</div>\r\n\r\n\r\n<div class="meta-item clearfix" data-spm="991222509">\r\n    <div class="meta-item-hd">\u652F&nbsp;&nbsp;\u4ED8</div>\r\n    <div class="meta-item-bd">\r\n        <!--\u652F\u4ED8\u65B9\u5F0F-->\r\n        ', 0);
    var option63 = { escape: 1 };
    var params64 = [];
    var id65 = scope.resolve([
            'itemCommitment',
            'data',
            'supportXCard'
        ], 0);
    params64.push(id65);
    option63.params = params64;
    option63.fn = function (scope, buffer) {
        buffer.write('\r\n        <a data-spm="d3" target="_blank" href="http://help.alipay.com/lab/help_detail.htm?help_id=245296" title="\u76EE\u524D\u5206\u671F\u4ED8\u6B3E\uFF0C\u652F\u6301\uFF1A\u4E2D\u56FD\u94F6\u884C\u3001\u5E73\u5B89\u94F6\u884C"><span class="icon-xykzf"></span></a>\r\n        ', 0);
        return buffer;
    };
    option63.inverse = function (scope, buffer) {
        buffer.write('\r\n        <a data-spm="d3" target="_blank" href="http://help.alipay.com/lab/help_detail.htm?help_id=245296" title="\u652F\u6301\u6BCF\u6708\u7D2F\u8BA1500\u5143\u4EE5\u4E0B\u7684\u5C0F\u989D\u4ED8\u6B3E"><span class="icon-xykzf"></span></a>\r\n        ', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option63, buffer, 64);
    buffer.write('\r\n        ', 0);
    var option66 = { escape: 1 };
    var params67 = [];
    var id68 = scope.resolve([
            'itemCommitment',
            'data',
            'supportCodPay'
        ], 0);
    params67.push(id68);
    option66.params = params67;
    option66.fn = function (scope, buffer) {
        buffer.write('<a href="http://www.taobao.com/go/act/sale/cod2.php"\r\n                                                    title="\u6536\u5230\u5B9D\u8D1D\u65F6\uFF0C\u518D\u4ED8\u6B3E\u7ED9\u5FEB\u9012\u4EBA\u5458" target="_blank" ><span class="icon-hdfk"></span></a>', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option66, buffer, 69);
    buffer.write('\r\n        <span class="icon-zfb"></span>\r\n    </div>\r\n</div>', 0);
    return buffer;
};
itemCommitmentHtml.TPL_NAME = module.name;
itemCommitmentHtml.version = '5.0.0';
module.exports = itemCommitmentHtml;