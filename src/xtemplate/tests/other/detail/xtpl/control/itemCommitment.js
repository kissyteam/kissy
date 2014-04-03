/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        var t = function (scope, S, buffer, payload, undefined) {
            var engine = this,
                moduleWrap, nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            if ("1.50" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
            }
            if (typeof module !== "undefined" && module.kissy) {
                moduleWrap = module;
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
            buffer.write('\n\n<div class="meta-item clearfix" data-spm="991222525">\n    <div class="meta-item-hd">承&nbsp;&nbsp;诺</div>\n    <div class="meta-item-bd">\n        <!--服务-->\n        ');
            var option0 = {
                escape: 1
            };
            var params1 = [];
            var id2 = scope.resolve(["itemCommitment", "data", "brokenReMail"]);
            params1.push(id2);
            option0.params = params1;
            option0.fn = function (scope, buffer) {

                buffer.write('<a target="_blank" title="破损补寄"\n                                                href="${mealServer}/cu_pr.htm?item_num_id=$!{itemCommitment.itemId}"><span class="icon-psbj"></span></a>');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option0, buffer, 7, payload);
            buffer.write('\n        ');
            var option3 = {
                escape: 1
            };
            var params4 = [];
            var id5 = scope.resolve(["itemCommitment", "data", "yunfeiXian"]);
            params4.push(id5);
            option3.params = params4;
            option3.fn = function (scope, buffer) {

                buffer.write('<a target="_blank" title="运费险"\n                                                 href="http://ju.mmstat.com/?url=http://www.taobao.com/go/act/baoxian/yunfeixian.php?ad_id=&am_id=&cm_id=&pm_id=150106180823b65f1640"><span class="icon-yfx "></span></a>');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option3, buffer, 9, payload);
            buffer.write('\n\n        ');
            var option6 = {
                escape: 1
            };
            var params7 = [];
            var id8 = scope.resolve(["itemCommitment", "data", "refundmentCommitment"]);
            params7.push(id8);
            option6.params = params7;
            option6.fn = function (scope, buffer) {

                buffer.write('<a target="_blank" title="退货承诺"\n                                                           href="${mealServer}/cu_pr.htm?item_num_id=$!{itemCommitment.itemId}"><span class="icon-thcn"></span></a>');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option6, buffer, 12, payload);
            buffer.write('\n        ');
            var option9 = {
                escape: 1
            };
            var params10 = [];
            var id11 = scope.resolve(["itemCommitment", "data", "qualityCommitment"]);
            params10.push(id11);
            option9.params = params10;
            option9.fn = function (scope, buffer) {

                buffer.write('<a target="_blank" title="品质承诺"\n                                                        href="${mealServer}/cu_pr.htm?item_num_id=$!{itemCommitment.itemId}"><span class="icon-pzcn"></span></a>');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option9, buffer, 14, payload);
            buffer.write('\n        ');
            var option12 = {
                escape: 1
            };
            var params13 = [];
            var id14 = scope.resolve(["itemCommitment", "data", "qualityAssurance"]);
            params13.push(id14);
            option12.params = params13;
            option12.fn = function (scope, buffer) {

                buffer.write('<a target="_blank" title="质量鉴定"\n                                                       href="http://www.taobao.com/go/act/sale/3cshumajd.php?ad_id=&am_id=130104775269aec13e6b&cm_id=&pm_id="><span class="icon-zj"></span></a>');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option12, buffer, 16, payload);
            buffer.write('\n        ');
            var option15 = {
                escape: 1
            };
            var params16 = [];
            var id17 = scope.resolve(["itemCommitment", "data", "textileQualityAssurance"]);
            params16.push(id17);
            option15.params = params16;
            option15.fn = function (scope, buffer) {

                buffer.write('<a target="_blank" title="质量鉴定"\n                                                              href="http://www.taobao.com/go/act/315/jiandingbuyer.php"><span class="icon-zj"></span></a>');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option15, buffer, 18, payload);
            buffer.write('\n        ');
            var option18 = {
                escape: 1
            };
            var params19 = [];
            var id20 = scope.resolve(["itemCommitment", "data", "sevenDaysRefundment"]);
            params19.push(id20);
            option18.params = params19;
            option18.fn = function (scope, buffer) {

                buffer.write('<a target="_blank"\n                                                          href="http://www.taobao.com/go/act/315/xb_20100707.php?ad_id=&am_id=1300268931aef04f0cdc&cm_id=&pm_id=#qitian" title="七天退换"><span class="icon-7tth"></span></a>');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option18, buffer, 20, payload);
            buffer.write('\n\n        ');
            var option21 = {
                escape: 1
            };
            var params22 = [];
            var id23 = scope.resolve(["itemCommitment", "data", "payForThrice"]);
            params22.push(id23);
            option21.params = params22;
            option21.fn = function (scope, buffer) {

                buffer.write('<a target="_blank"\n                                                   href="http://www.taobao.com/go/act/315/xb_20100707.php?ad_id=&am_id=1300268931aef04f0cdc&cm_id=&pm_id=#shandian" title="假一赔三"><span class="icon-zpbz"></span></a>');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option21, buffer, 23, payload);
            buffer.write('\n\n        ');
            var option24 = {
                escape: 1
            };
            var params25 = [];
            var id26 = scope.resolve(["itemCommitment", "data", "shopsThreeBags"]);
            params25.push(id26);
            option24.params = params25;
            option24.fn = function (scope, buffer) {

                buffer.write('<a target="_blank"\n                                                    href="http://itemCommitment.taobao.com/support/knowledge-1121827.htm"  title="鞋类三包"><span>鞋类三包</span></a>');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option24, buffer, 26, payload);
            buffer.write('\n\n        ');
            var option27 = {
                escape: 1
            };
            var params28 = [];
            var id29 = scope.resolve(["itemCommitment", "data", "newProducts"]);
            params28.push(id29);
            option27.params = params28;
            option27.fn = function (scope, buffer) {

                buffer.write('<a title="新品" target="_blank"\n                                                  href="http://itemCommitment.taobao.com/support/knowledge-1138476.htm7"><span class="icon-sxp"></span></a>');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option27, buffer, 29, payload);
            buffer.write('\n        ');
            var option30 = {
                escape: 1
            };
            var params31 = [];
            var id32 = scope.resolve(["itemCommitment", "data", "threecThirtydays"]);
            params31.push(id32);
            option30.params = params31;
            option30.fn = function (scope, buffer) {

                buffer.write('<a target="_blank"\n                                                       href="http://www.taobao.com/go/act/315/xb_20100707.php?ad_id=&am_id=1300268931aef04f0cdc&cm_id=&pm_id=#weixiu" title="30天维修"><span class="icon-shwx"></span></a>');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option30, buffer, 31, payload);
            buffer.write('\n\n        ');
            var option33 = {
                escape: 1
            };
            var params34 = [];
            var id35 = scope.resolve(["itemCommitment", "data", "is24HourConsignment"]);
            params34.push(id35);
            option33.params = params34;
            option33.fn = function (scope, buffer) {

                buffer.write('<a target="_blank"\n                                                        href="http://www.taobao.com/go/act/315/xb_20100707.php?ad_id=&am_id=1300268931aef04f0cdc&cm_id=&pm_id=#shandian" title="24小时发货"><span>24小时发货</span></a>');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option33, buffer, 34, payload);
            buffer.write('\n        ');
            var option36 = {
                escape: 1
            };
            var params37 = [];
            var id38 = scope.resolve(["itemCommitment", "data", "immediatelyConsignment"]);
            params37.push(id38);
            option36.params = params37;
            option36.fn = function (scope, buffer) {

                buffer.write('<a target="_blank"\n                                                             href="http://www.taobao.com/go/act/315/xb_20100707.php?ad_id=&am_id=1300268931aef04f0cdc&cm_id=&pm_id=#shandian" title="闪电发货"><span>闪电发货</span></a>');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option36, buffer, 36, payload);
            buffer.write('\n        ');
            var option39 = {
                escape: 1
            };
            var params40 = [];
            var id41 = scope.resolve(["itemCommitment", "data", "autoConsignment"]);
            params40.push(id41);
            option39.params = params40;
            option39.fn = function (scope, buffer) {

                buffer.write('<a href="http://service.taobao.com/support/knowledge-1119683.htm"\n                                                      target="_blank" title="自动发货"><span>自动发货</span></a>');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option39, buffer, 38, payload);
            buffer.write('\n        ');
            var option42 = {
                escape: 1
            };
            var params43 = [];
            var id44 = scope.resolve(["itemCommitment", "data", "virtualItem"]);
            params43.push(id44);
            option42.params = params43;
            option42.fn = function (scope, buffer) {

                buffer.write('<a href="http://service.taobao.com/support/knowledge-1119861.htm"\n                                                  target="_blank" title="虚拟物品"><span>虚拟物品</span></a>');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option42, buffer, 40, payload);
            buffer.write('\n\n        ');
            var option45 = {
                escape: 1
            };
            var params46 = [];
            var id47 = scope.resolve(["itemCommitment", "data", "charityContribute"]);
            params46.push(id47);
            option45.params = params46;
            option45.fn = function (scope, buffer) {

                buffer.write('<a target="_blank"\n                                                        href="http://itemCommitment.taobao.com/support/knowledge-1117985.htm" title="公益宝贝"><span class="icon-gy"></span></a>');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option45, buffer, 43, payload);
            buffer.write('\n\n        ');
            var option48 = {
                escape: 1
            };
            var params49 = [];
            var id50 = scope.resolve(["itemCommitment", "data", "withActivityCards"]);
            params49.push(id50);
            option48.params = params49;
            option48.fn = function (scope, buffer) {

                buffer.write('<a\n            href="http://qudao.taobao.com/channelt/s9364759a707947ed8d0282cacaa84ea5.e?productID=$!{itemCommitment.itemId}" target="_blank"><img src="http://img07.taobaocdn.com/tps/i7/T1kmNAXg8cXXXXXXXX-60-16.png"/></a>');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option48, buffer, 46, payload);
            buffer.write('\n        ');
            var option51 = {
                escape: 1
            };
            var params52 = [];
            var id53 = scope.resolve(["itemCommitment", "data", "delegateItem"]);
            params52.push(id53);
            option51.params = params52;
            option51.fn = function (scope, buffer) {

                buffer.write('<span>代购商品</span>');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option51, buffer, 48, payload);
            buffer.write('\n        ');
            var option54 = {
                escape: 1
            };
            var params55 = [];
            var id56 = scope.resolve(["itemCommitment", "data", "tccItem"]);
            params55.push(id56);
            option54.params = params55;
            option54.fn = function (scope, buffer) {

                buffer.write('<a href="http://itemCommitment.taobao.com/support/knowledge-1126791.htm"\n                                              target="_blank" title="平台代充"><img src="http://img02.taobaocdn.com/tps/i2/T1PuR3XohwXXXXXXXX-15-15.png" width="15" height="15" /></a>');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option54, buffer, 49, payload);
            buffer.write('\n        ');
            var option57 = {
                escape: 1
            };
            var params58 = [];
            var id59 = scope.resolve(["itemCommitment", "data", "installitemPrice"]);
            params58.push(id59);
            option57.params = params58;
            option57.fn = function (scope, buffer) {

                buffer.write('<a target="_blank"\n                                                       href="http://itemCommitment.taobao.com/support/help-13290.htm" title="部分城市提供配送安装服务"><span>配送安装</span></a>');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option57, buffer, 51, payload);
            buffer.write('\n\n        ');
            var option60 = {
                escape: 1
            };
            var params61 = [];
            var id62 = scope.resolve(["itemCommitment", "data", "jFB"]);
            params61.push(id62);
            option60.params = params61;
            option60.fn = function (scope, buffer) {

                buffer.write('<a href="https://jf.alipay.com/prod/rule.htm?src=jfb-tbDetail1#help1"\n                                          target="_blank" title="支持集分宝购物抵现"><span class="icon-jfb"></span></a>');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option60, buffer, 54, payload);
            buffer.write('\n    </div>\n</div>\n\n\n<div class="meta-item clearfix" data-spm="991222509">\n    <div class="meta-item-hd">支&nbsp;&nbsp;付</div>\n    <div class="meta-item-bd">\n        <!--支付方式-->\n        ');
            var option63 = {
                escape: 1
            };
            var params64 = [];
            var id65 = scope.resolve(["itemCommitment", "data", "supportXCard"]);
            params64.push(id65);
            option63.params = params64;
            option63.fn = function (scope, buffer) {

                buffer.write('\n        <a data-spm="d3" target="_blank" href="http://help.alipay.com/lab/help_detail.htm?help_id=245296" title="目前分期付款，支持：中国银行、平安银行"><span class="icon-xykzf"></span></a>\n        ');

                return buffer;
            };
            option63.inverse = function (scope, buffer) {

                buffer.write('\n        <a data-spm="d3" target="_blank" href="http://help.alipay.com/lab/help_detail.htm?help_id=245296" title="支持每月累计500元以下的小额付款"><span class="icon-xykzf"></span></a>\n        ');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option63, buffer, 64, payload);
            buffer.write('\n        ');
            var option66 = {
                escape: 1
            };
            var params67 = [];
            var id68 = scope.resolve(["itemCommitment", "data", "supportCodPay"]);
            params67.push(id68);
            option66.params = params67;
            option66.fn = function (scope, buffer) {

                buffer.write('<a href="http://www.taobao.com/go/act/sale/cod2.php"\n                                                    title="收到宝贝时，再付款给快递人员" target="_blank" ><span class="icon-hdfk"></span></a>');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option66, buffer, 69, payload);
            buffer.write('\n        <span class="icon-zfb"></span>\n    </div>\n</div>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});