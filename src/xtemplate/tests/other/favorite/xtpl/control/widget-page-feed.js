/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var widgetPageFeed = function (scope, buffer, undefined) {
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
            buffer.write('<div class="page-nav-box grid">\r\n    <div class="page-nav g-u">\r\n\r\n        ', 0);
            var option0 = {
                escape: 1
            };
            var hash1 = {};
            var id2 = scope.resolve(["pageInfo", "bigTotalPage"], 0);
            hash1["totalpage"] = id2;
            option0.hash = hash1;
            var callRet3
            callRet3 = setCommand.call(tpl, scope, option0, buffer, 4);
            if (callRet3 && callRet3.isBuffer) {
                buffer = callRet3;
                callRet3 = undefined;
            }
            buffer.write(callRet3, true);
            buffer.write('\r\n        ', 0);
            var option4 = {
                escape: 1
            };
            var params5 = [];
            var id6 = scope.resolve(["totalpage"], 0);
            var exp7 = id6;
            exp7 = (id6) > (100);
            params5.push(exp7);
            option4.params = params5;
            option4.fn = function (scope, buffer) {
                buffer.write('\r\n            ', 0);
                var option8 = {
                    escape: 1
                };
                var hash9 = {};
                hash9["totalpage"] = 100;
                option8.hash = hash9;
                var callRet10
                callRet10 = setCommand.call(tpl, scope, option8, buffer, 6);
                if (callRet10 && callRet10.isBuffer) {
                    buffer = callRet10;
                    callRet10 = undefined;
                }
                buffer.write(callRet10, true);
                buffer.write('\r\n        ', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option4, buffer, 5);
            buffer.write('\r\n\r\n        ', 0);
            var option11 = {
                escape: 1
            };
            var hash12 = {};
            var id13 = scope.resolve(["pageInfo", "bigPageNum"], 0);
            hash12["currentpage"] = id13;
            option11.hash = hash12;
            var callRet14
            callRet14 = setCommand.call(tpl, scope, option11, buffer, 9);
            if (callRet14 && callRet14.isBuffer) {
                buffer = callRet14;
                callRet14 = undefined;
            }
            buffer.write(callRet14, true);
            buffer.write('\r\n        ', 0);
            var option15 = {
                escape: 1
            };
            var hash16 = {};
            var id17 = scope.resolve(["currentpage"], 0);
            var exp18 = id17;
            exp18 = (id17) - (1);
            hash16["prepage"] = exp18;
            option15.hash = hash16;
            var callRet19
            callRet19 = setCommand.call(tpl, scope, option15, buffer, 10);
            if (callRet19 && callRet19.isBuffer) {
                buffer = callRet19;
                callRet19 = undefined;
            }
            buffer.write(callRet19, true);
            buffer.write('\r\n        ', 0);
            var option20 = {
                escape: 1
            };
            var hash21 = {};
            var id22 = scope.resolve(["currentpage"], 0);
            var exp23 = id22;
            exp23 = (id22) + (1);
            hash21["nextpage"] = exp23;
            option20.hash = hash21;
            var callRet24
            callRet24 = setCommand.call(tpl, scope, option20, buffer, 11);
            if (callRet24 && callRet24.isBuffer) {
                buffer = callRet24;
                callRet24 = undefined;
            }
            buffer.write(callRet24, true);
            buffer.write('\r\n        ', 0);
            var option25 = {
                escape: 1
            };
            var hash26 = {};
            var id27 = scope.resolve(["pageInfo", "bigPageSize"], 0);
            hash26["pagesize"] = id27;
            option25.hash = hash26;
            var callRet28
            callRet28 = setCommand.call(tpl, scope, option25, buffer, 12);
            if (callRet28 && callRet28.isBuffer) {
                buffer = callRet28;
                callRet28 = undefined;
            }
            buffer.write(callRet28, true);
            buffer.write('\r\n\r\n\r\n        ', 0);
            var option29 = {
                escape: 1
            };
            var params30 = [];
            var id31 = scope.resolve(["nextpage"], 0);
            var exp33 = id31;
            var id32 = scope.resolve(["totalpage"], 0);
            exp33 = (id31) > (id32);
            params30.push(exp33);
            option29.params = params30;
            option29.fn = function (scope, buffer) {
                buffer.write('\r\n            ', 0);
                var option34 = {
                    escape: 1
                };
                var hash35 = {};
                var id36 = scope.resolve(["totalpage"], 0);
                hash35["defaultpage"] = id36;
                option34.hash = hash35;
                var callRet37
                callRet37 = setCommand.call(tpl, scope, option34, buffer, 16);
                if (callRet37 && callRet37.isBuffer) {
                    buffer = callRet37;
                    callRet37 = undefined;
                }
                buffer.write(callRet37, true);
                buffer.write('\r\n        ', 0);
                return buffer;
            };
            option29.inverse = function (scope, buffer) {
                buffer.write('\r\n            ', 0);
                var option38 = {
                    escape: 1
                };
                var hash39 = {};
                var id40 = scope.resolve(["nextpage"], 0);
                hash39["defaultpage"] = id40;
                option38.hash = hash39;
                var callRet41
                callRet41 = setCommand.call(tpl, scope, option38, buffer, 18);
                if (callRet41 && callRet41.isBuffer) {
                    buffer = callRet41;
                    callRet41 = undefined;
                }
                buffer.write(callRet41, true);
                buffer.write('\r\n        ', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option29, buffer, 15);
            buffer.write('\r\n\r\n\r\n\r\n        <div class="dpl-paginator g-u" data-spm="', 0);
            var id42 = scope.resolve(["spm", "pageBottom"], 0);
            buffer.write(id42, true);
            buffer.write('">\r\n            ', 0);
            buffer.write('\r\n            ', 0);
            var option43 = {
                escape: 1
            };
            var params44 = [];
            var id45 = scope.resolve(["prepage"], 0);
            var exp46 = id45;
            exp46 = (id45) > (0);
            params44.push(exp46);
            option43.params = params44;
            option43.fn = function (scope, buffer) {
                buffer.write('\r\n                <a  data-spm="', 0);
                var id47 = scope.resolve(["spm", "pageBottomPrevious"], 0);
                buffer.write(id47, true);
                buffer.write('"\r\n                    class="J_PrevPage dpl-paginator-pre J_HotPoint"\r\n                    href="', 0);
                var option48 = {};
                var params49 = [];
                var id50 = scope.resolve(["prepage"], 0);
                params49.push(id50);
                option48.params = params49;
                var callRet51
                callRet51 = callFnUtil(tpl, scope, option48, buffer, ["pageUrl"], 0, 28);
                if (callRet51 && callRet51.isBuffer) {
                    buffer = callRet51;
                    callRet51 = undefined;
                }
                buffer.write(callRet51, false);
                buffer.write('" hidefocus="true">\r\n                    <span class="dpl-paginator-arrow-left"></span>\r\n                </a>\r\n\r\n            ', 0);
                return buffer;
            };
            option43.inverse = function (scope, buffer) {
                buffer.write('\r\n                <a  class="J_PrevPage dpl-paginator-pre J_HotPoint disabled"\r\n                    href="javascript:void();" hidefocus="true">\r\n                    <span class="dpl-paginator-arrow-left"></span>\r\n                </a>\r\n            ', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option43, buffer, 25);
            buffer.write('\r\n\r\n\r\n            ', 0);
            var option52 = {
                escape: 1
            };
            var params53 = [];
            var id54 = scope.resolve(["totalpage"], 0);
            var exp55 = id54;
            exp55 = (id54) < (11);
            params53.push(exp55);
            option52.params = params53;
            option52.fn = function (scope, buffer) {
                buffer.write('\r\n                ', 0);
                var option56 = {
                    escape: 1
                };
                var params57 = [];
                var option58 = {};
                var params59 = [];
                params59.push(1);
                var id60 = scope.resolve(["totalpage"], 0);
                params59.push(id60);
                option58.params = params59;
                var callRet61
                callRet61 = callFnUtil(tpl, scope, option58, buffer, ["range"], 0, 41);
                if (callRet61 && callRet61.isBuffer) {
                    buffer = callRet61;
                    callRet61 = undefined;
                }
                params57.push(callRet61);
                option56.params = params57;
                option56.fn = function (scope, buffer) {
                    buffer.write('\r\n                    ', 0);
                    var option62 = {
                        escape: 1
                    };
                    var params63 = [];
                    var id64 = scope.resolve(["this"], 0);
                    var exp66 = id64;
                    var id65 = scope.resolve(["root", "currentpage"], 0);
                    exp66 = (id64) === (id65);
                    params63.push(exp66);
                    option62.params = params63;
                    option62.fn = function (scope, buffer) {
                        buffer.write('\r\n                        <span class="dpl-paginator-curr J_HotPoint">', 0);
                        var id67 = scope.resolve(["this"], 0);
                        buffer.write(id67, true);
                        buffer.write('</span>\r\n                    ', 0);
                        return buffer;
                    };
                    option62.inverse = function (scope, buffer) {
                        buffer.write('\r\n                        <a  data-spm="', 0);
                        var id68 = scope.resolve(["spm", "pageBottomPageNum"], 0);
                        buffer.write(id68, true);
                        buffer.write('"\r\n                            class="J_HotPoint" hidefocus="true"\r\n                            href="', 0);
                        var option69 = {};
                        var params70 = [];
                        var id71 = scope.resolve(["this"], 0);
                        params70.push(id71);
                        option69.params = params70;
                        var callRet72
                        callRet72 = callFnUtil(tpl, scope, option69, buffer, ["pageUrl"], 0, 47);
                        if (callRet72 && callRet72.isBuffer) {
                            buffer = callRet72;
                            callRet72 = undefined;
                        }
                        buffer.write(callRet72, false);
                        buffer.write('" >', 0);
                        var id73 = scope.resolve(["this"], 0);
                        buffer.write(id73, true);
                        buffer.write('\r\n                        </a>\r\n                    ', 0);
                        return buffer;
                    };
                    buffer = ifCommand.call(tpl, scope, option62, buffer, 42);
                    buffer.write('\r\n                ', 0);
                    return buffer;
                };
                buffer = eachCommand.call(tpl, scope, option56, buffer, 41);
                buffer.write('\r\n            ', 0);
                return buffer;
            };
            option52.inverse = function (scope, buffer) {
                buffer.write('\r\n                ', 0);
                var option74 = {
                    escape: 1
                };
                var hash75 = {};
                var id76 = scope.resolve(["totalpage"], 0);
                var exp77 = id76;
                exp77 = (id76) - (2);
                hash75["aft3"] = exp77;
                option74.hash = hash75;
                var callRet78
                callRet78 = setCommand.call(tpl, scope, option74, buffer, 52);
                if (callRet78 && callRet78.isBuffer) {
                    buffer = callRet78;
                    callRet78 = undefined;
                }
                buffer.write(callRet78, true);
                buffer.write('\r\n                ', 0);
                var option79 = {
                    escape: 1
                };
                var hash80 = {};
                var id81 = scope.resolve(["totalpage"], 0);
                var exp82 = id81;
                exp82 = (id81) - (3);
                hash80["aft4"] = exp82;
                option79.hash = hash80;
                var callRet83
                callRet83 = setCommand.call(tpl, scope, option79, buffer, 53);
                if (callRet83 && callRet83.isBuffer) {
                    buffer = callRet83;
                    callRet83 = undefined;
                }
                buffer.write(callRet83, true);
                buffer.write('\r\n                ', 0);
                var option84 = {
                    escape: 1
                };
                var hash85 = {};
                var id86 = scope.resolve(["totalpage"], 0);
                var exp87 = id86;
                exp87 = (id86) - (4);
                hash85["aft5"] = exp87;
                option84.hash = hash85;
                var callRet88
                callRet88 = setCommand.call(tpl, scope, option84, buffer, 54);
                if (callRet88 && callRet88.isBuffer) {
                    buffer = callRet88;
                    callRet88 = undefined;
                }
                buffer.write(callRet88, true);
                buffer.write('\r\n\r\n                ', 0);
                var option89 = {
                    escape: 1
                };
                var params90 = [];
                var option91 = {};
                var params92 = [];
                params92.push(1);
                params92.push(3);
                option91.params = params92;
                var callRet93
                callRet93 = callFnUtil(tpl, scope, option91, buffer, ["range"], 0, 56);
                if (callRet93 && callRet93.isBuffer) {
                    buffer = callRet93;
                    callRet93 = undefined;
                }
                params90.push(callRet93);
                option89.params = params90;
                option89.fn = function (scope, buffer) {
                    buffer.write('\r\n                    ', 0);
                    var option94 = {
                        escape: 1
                    };
                    var params95 = [];
                    var id96 = scope.resolve(["this"], 0);
                    var exp98 = id96;
                    var id97 = scope.resolve(["root", "currentpage"], 0);
                    exp98 = (id96) === (id97);
                    params95.push(exp98);
                    option94.params = params95;
                    option94.fn = function (scope, buffer) {
                        buffer.write('\r\n                        <span class="dpl-paginator-curr J_HotPoint" >', 0);
                        var id99 = scope.resolve(["this"], 0);
                        buffer.write(id99, true);
                        buffer.write('</span>\r\n                    ', 0);
                        return buffer;
                    };
                    option94.inverse = function (scope, buffer) {
                        buffer.write('\r\n                        <a  data-spm="', 0);
                        var id100 = scope.resolve(["spm", "pageBottomPageNum"], 0);
                        buffer.write(id100, true);
                        buffer.write('"\r\n                            class="J_HotPoint" hidefocus="true"\r\n                            href="', 0);
                        var option101 = {};
                        var params102 = [];
                        var id103 = scope.resolve(["this"], 0);
                        params102.push(id103);
                        option101.params = params102;
                        var callRet104
                        callRet104 = callFnUtil(tpl, scope, option101, buffer, ["pageUrl"], 0, 62);
                        if (callRet104 && callRet104.isBuffer) {
                            buffer = callRet104;
                            callRet104 = undefined;
                        }
                        buffer.write(callRet104, false);
                        buffer.write('" >', 0);
                        var id105 = scope.resolve(["this"], 0);
                        buffer.write(id105, true);
                        buffer.write('\r\n                        </a>\r\n                    ', 0);
                        return buffer;
                    };
                    buffer = ifCommand.call(tpl, scope, option94, buffer, 57);
                    buffer.write('\r\n                ', 0);
                    return buffer;
                };
                buffer = eachCommand.call(tpl, scope, option89, buffer, 56);
                buffer.write('\r\n\r\n                ', 0);
                var option106 = {
                    escape: 1
                };
                var params107 = [];
                var option108 = {};
                var params109 = [];
                var id110 = scope.resolve(["prepage"], 0);
                params109.push(id110);
                var id111 = scope.resolve(["nextpage"], 0);
                params109.push(id111);
                option108.params = params109;
                var callRet112
                callRet112 = callFnUtil(tpl, scope, option108, buffer, ["range"], 0, 67);
                if (callRet112 && callRet112.isBuffer) {
                    buffer = callRet112;
                    callRet112 = undefined;
                }
                params107.push(callRet112);
                option106.params = params107;
                option106.fn = function (scope, buffer) {
                    buffer.write('\r\n                    ', 0);
                    var option113 = {
                        escape: 1
                    };
                    var params114 = [];
                    var id115 = scope.resolve(["currentpage"], 0);
                    var exp116 = id115;
                    exp116 = (id115) > (5);
                    params114.push(exp116);
                    option113.params = params114;
                    option113.fn = function (scope, buffer) {
                        buffer.write('\r\n                        ', 0);
                        var option117 = {
                            escape: 1
                        };
                        var params118 = [];
                        var id119 = scope.resolve(["this"], 0);
                        var exp121 = id119;
                        var id120 = scope.resolve(["root", "prepage"], 0);
                        exp121 = (id119) === (id120);
                        params118.push(exp121);
                        option117.params = params118;
                        option117.fn = function (scope, buffer) {
                            buffer.write('\r\n                            <span class="dpl-paginator-break J_HotPoint" >...</span>\r\n                        ', 0);
                            return buffer;
                        };
                        buffer = ifCommand.call(tpl, scope, option117, buffer, 69);
                        buffer.write('\r\n\r\n                        ', 0);
                        var option122 = {
                            escape: 1
                        };
                        var params123 = [];
                        var id124 = scope.resolve(["currentpage"], 0);
                        var exp126 = id124;
                        var id125 = scope.resolve(["aft5"], 0);
                        exp126 = (id124) < (id125);
                        params123.push(exp126);
                        option122.params = params123;
                        option122.fn = function (scope, buffer) {
                            buffer.write('\r\n                            ', 0);
                            var option127 = {
                                escape: 1
                            };
                            var params128 = [];
                            var id129 = scope.resolve(["this"], 0);
                            var exp131 = id129;
                            var id130 = scope.resolve(["root", "currentpage"], 0);
                            exp131 = (id129) === (id130);
                            params128.push(exp131);
                            option127.params = params128;
                            option127.fn = function (scope, buffer) {
                                buffer.write('\r\n                                <span class="dpl-paginator-curr J_HotPoint" >', 0);
                                var id132 = scope.resolve(["this"], 0);
                                buffer.write(id132, true);
                                buffer.write('</span>\r\n                            ', 0);
                                return buffer;
                            };
                            option127.inverse = function (scope, buffer) {
                                buffer.write('\r\n                                <a  data-spm="', 0);
                                var id133 = scope.resolve(["spm", "pageBottomPageNum"], 0);
                                buffer.write(id133, true);
                                buffer.write('"\r\n                                    class="J_HotPoint" hidefocus="true"\r\n                                    href="', 0);
                                var option134 = {};
                                var params135 = [];
                                var id136 = scope.resolve(["this"], 0);
                                params135.push(id136);
                                option134.params = params135;
                                var callRet137
                                callRet137 = callFnUtil(tpl, scope, option134, buffer, ["pageUrl"], 0, 79);
                                if (callRet137 && callRet137.isBuffer) {
                                    buffer = callRet137;
                                    callRet137 = undefined;
                                }
                                buffer.write(callRet137, false);
                                buffer.write('">', 0);
                                var id138 = scope.resolve(["this"], 0);
                                buffer.write(id138, true);
                                buffer.write('\r\n                                </a>\r\n                            ', 0);
                                return buffer;
                            };
                            buffer = ifCommand.call(tpl, scope, option127, buffer, 74);
                            buffer.write('\r\n\r\n                            ', 0);
                            var option139 = {
                                escape: 1
                            };
                            var params140 = [];
                            var id141 = scope.resolve(["this"], 0);
                            var exp143 = id141;
                            var id142 = scope.resolve(["root", "nextpage"], 0);
                            exp143 = (id141) === (id142);
                            params140.push(exp143);
                            option139.params = params140;
                            option139.fn = function (scope, buffer) {
                                buffer.write('\r\n                                <span class="dpl-paginator-break J_HotPoint" >...</span>\r\n                            ', 0);
                                return buffer;
                            };
                            buffer = ifCommand.call(tpl, scope, option139, buffer, 83);
                            buffer.write('\r\n                        ', 0);
                            return buffer;
                        };
                        option122.inverse = function (scope, buffer) {
                            buffer.write('\r\n                            ', 0);
                            var option144 = {
                                escape: 1
                            };
                            var params145 = [];
                            var id146 = scope.resolve(["this"], 0);
                            var exp148 = id146;
                            var id147 = scope.resolve(["aft3"], 0);
                            exp148 = (id146) < (id147);
                            params145.push(exp148);
                            option144.params = params145;
                            option144.fn = function (scope, buffer) {
                                buffer.write('\r\n                                ', 0);
                                var option149 = {
                                    escape: 1
                                };
                                var params150 = [];
                                var id151 = scope.resolve(["this"], 0);
                                var exp153 = id151;
                                var id152 = scope.resolve(["root", "currentpage"], 0);
                                exp153 = (id151) === (id152);
                                params150.push(exp153);
                                option149.params = params150;
                                option149.fn = function (scope, buffer) {
                                    buffer.write('\r\n                                    <span class="dpl-paginator-curr J_HotPoint" >', 0);
                                    var id154 = scope.resolve(["this"], 0);
                                    buffer.write(id154, true);
                                    buffer.write('</span>\r\n                                ', 0);
                                    return buffer;
                                };
                                option149.inverse = function (scope, buffer) {
                                    buffer.write('\r\n                                    <a  data-spm="', 0);
                                    var id155 = scope.resolve(["spm", "pageBottomPageNum"], 0);
                                    buffer.write(id155, true);
                                    buffer.write('"\r\n                                        class="J_HotPoint" hidefocus="true"\r\n                                        href="', 0);
                                    var option156 = {};
                                    var params157 = [];
                                    var id158 = scope.resolve(["this"], 0);
                                    params157.push(id158);
                                    option156.params = params157;
                                    var callRet159
                                    callRet159 = callFnUtil(tpl, scope, option156, buffer, ["pageUrl"], 0, 93);
                                    if (callRet159 && callRet159.isBuffer) {
                                        buffer = callRet159;
                                        callRet159 = undefined;
                                    }
                                    buffer.write(callRet159, false);
                                    buffer.write('" >', 0);
                                    var id160 = scope.resolve(["this"], 0);
                                    buffer.write(id160, true);
                                    buffer.write('</a>\r\n                                ', 0);
                                    return buffer;
                                };
                                buffer = ifCommand.call(tpl, scope, option149, buffer, 88);
                                buffer.write('\r\n                            ', 0);
                                return buffer;
                            };
                            buffer = ifCommand.call(tpl, scope, option144, buffer, 87);
                            buffer.write('\r\n                        ', 0);
                            return buffer;
                        };
                        buffer = ifCommand.call(tpl, scope, option122, buffer, 73);
                        buffer.write('\r\n                    ', 0);
                        return buffer;
                    };
                    option113.inverse = function (scope, buffer) {
                        buffer.write('\r\n                        ', 0);
                        var option161 = {
                            escape: 1
                        };
                        var params162 = [];
                        var id163 = scope.resolve(["this"], 0);
                        var exp164 = id163;
                        exp164 = (id163) > (3);
                        params162.push(exp164);
                        option161.params = params162;
                        option161.fn = function (scope, buffer) {
                            buffer.write('\r\n                            ', 0);
                            var option165 = {
                                escape: 1
                            };
                            var params166 = [];
                            var id167 = scope.resolve(["this"], 0);
                            var exp169 = id167;
                            var id168 = scope.resolve(["root", "currentpage"], 0);
                            exp169 = (id167) === (id168);
                            params166.push(exp169);
                            option165.params = params166;
                            option165.fn = function (scope, buffer) {
                                buffer.write('\r\n                                <span class="dpl-paginator-curr J_HotPoint">', 0);
                                var id170 = scope.resolve(["this"], 0);
                                buffer.write(id170, true);
                                buffer.write('</span>\r\n                            ', 0);
                                return buffer;
                            };
                            option165.inverse = function (scope, buffer) {
                                buffer.write('\r\n                                <a  data-spm="', 0);
                                var id171 = scope.resolve(["spm", "pageBottomPageNum"], 0);
                                buffer.write(id171, true);
                                buffer.write('"\r\n                                    class="J_HotPoint" hidefocus="true"\r\n                                    href="', 0);
                                var option172 = {};
                                var params173 = [];
                                var id174 = scope.resolve(["this"], 0);
                                params173.push(id174);
                                option172.params = params173;
                                var callRet175
                                callRet175 = callFnUtil(tpl, scope, option172, buffer, ["pageUrl"], 0, 104);
                                if (callRet175 && callRet175.isBuffer) {
                                    buffer = callRet175;
                                    callRet175 = undefined;
                                }
                                buffer.write(callRet175, false);
                                buffer.write('">', 0);
                                var id176 = scope.resolve(["this"], 0);
                                buffer.write(id176, true);
                                buffer.write('</a>\r\n                            ', 0);
                                return buffer;
                            };
                            buffer = ifCommand.call(tpl, scope, option165, buffer, 99);
                            buffer.write('\r\n                            ', 0);
                            var option177 = {
                                escape: 1
                            };
                            var params178 = [];
                            var id179 = scope.resolve(["this"], 0);
                            var exp181 = id179;
                            var id180 = scope.resolve(["root", "nextpage"], 0);
                            exp181 = (id179) === (id180);
                            params178.push(exp181);
                            option177.params = params178;
                            option177.fn = function (scope, buffer) {
                                buffer.write('\r\n                                <span class="dpl-paginator-break J_HotPoint" >...</span>\r\n                            ', 0);
                                return buffer;
                            };
                            buffer = ifCommand.call(tpl, scope, option177, buffer, 106);
                            buffer.write('\r\n                        ', 0);
                            return buffer;
                        };
                        option161.inverse = function (scope, buffer) {
                            buffer.write('\r\n                            ', 0);
                            var option182 = {
                                escape: 1
                            };
                            var params183 = [];
                            var id184 = scope.resolve(["this"], 0);
                            var exp186 = id184;
                            var id185 = scope.resolve(["root", "nextpage"], 0);
                            exp186 = (id184) === (id185);
                            params183.push(exp186);
                            option182.params = params183;
                            option182.fn = function (scope, buffer) {
                                buffer.write('\r\n                                <span class="dpl-paginator-break J_HotPoint" >...</span>\r\n                            ', 0);
                                return buffer;
                            };
                            buffer = ifCommand.call(tpl, scope, option182, buffer, 110);
                            buffer.write('\r\n                        ', 0);
                            return buffer;
                        };
                        buffer = ifCommand.call(tpl, scope, option161, buffer, 98);
                        buffer.write('\r\n                    ', 0);
                        return buffer;
                    };
                    buffer = ifCommand.call(tpl, scope, option113, buffer, 68);
                    buffer.write('\r\n                ', 0);
                    return buffer;
                };
                buffer = eachCommand.call(tpl, scope, option106, buffer, 67);
                buffer.write('\r\n\r\n                ', 0);
                var option187 = {
                    escape: 1
                };
                var params188 = [];
                var option189 = {};
                var params190 = [];
                var id191 = scope.resolve(["aft3"], 0);
                params190.push(id191);
                var id192 = scope.resolve(["totalpage"], 0);
                params190.push(id192);
                option189.params = params190;
                var callRet193
                callRet193 = callFnUtil(tpl, scope, option189, buffer, ["range"], 0, 117);
                if (callRet193 && callRet193.isBuffer) {
                    buffer = callRet193;
                    callRet193 = undefined;
                }
                params188.push(callRet193);
                option187.params = params188;
                option187.fn = function (scope, buffer) {
                    buffer.write('\r\n                    ', 0);
                    var option194 = {
                        escape: 1
                    };
                    var params195 = [];
                    var id196 = scope.resolve(["this"], 0);
                    var exp198 = id196;
                    var id197 = scope.resolve(["root", "currentpage"], 0);
                    exp198 = (id196) === (id197);
                    params195.push(exp198);
                    option194.params = params195;
                    option194.fn = function (scope, buffer) {
                        buffer.write('\r\n                        <span class="dpl-paginator-curr J_HotPoint">', 0);
                        var id199 = scope.resolve(["this"], 0);
                        buffer.write(id199, true);
                        buffer.write('</span>\r\n                    ', 0);
                        return buffer;
                    };
                    option194.inverse = function (scope, buffer) {
                        buffer.write('\r\n                        <a  data-spm="', 0);
                        var id200 = scope.resolve(["spm", "pageBottomPageNum"], 0);
                        buffer.write(id200, true);
                        buffer.write('"\r\n                            class="J_HotPoint" hidefocus="true"\r\n                            href="', 0);
                        var option201 = {};
                        var params202 = [];
                        var id203 = scope.resolve(["this"], 0);
                        params202.push(id203);
                        option201.params = params202;
                        var callRet204
                        callRet204 = callFnUtil(tpl, scope, option201, buffer, ["pageUrl"], 0, 123);
                        if (callRet204 && callRet204.isBuffer) {
                            buffer = callRet204;
                            callRet204 = undefined;
                        }
                        buffer.write(callRet204, false);
                        buffer.write('" >', 0);
                        var id205 = scope.resolve(["this"], 0);
                        buffer.write(id205, true);
                        buffer.write('</a>\r\n                    ', 0);
                        return buffer;
                    };
                    buffer = ifCommand.call(tpl, scope, option194, buffer, 118);
                    buffer.write('\r\n                ', 0);
                    return buffer;
                };
                buffer = eachCommand.call(tpl, scope, option187, buffer, 117);
                buffer.write('\r\n            ', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option52, buffer, 40);
            buffer.write('\r\n\r\n\r\n            ', 0);
            buffer.write('\r\n\r\n            ', 0);
            var option206 = {
                escape: 1
            };
            var params207 = [];
            var id208 = scope.resolve(["nextpage"], 0);
            var exp211 = id208;
            var id209 = scope.resolve(["totalpage"], 0);
            var exp210 = id209;
            exp210 = (id209) + (1);
            exp211 = (id208) < (exp210);
            params207.push(exp211);
            option206.params = params207;
            option206.fn = function (scope, buffer) {
                buffer.write('\r\n                <a data-spm="', 0);
                var id212 = scope.resolve(["spm", "pageBottomNext"], 0);
                buffer.write(id212, true);
                buffer.write('"\r\n                    class="dpl-paginator-next J_NextPage J_HotPoint"\r\n                    href="', 0);
                var option213 = {};
                var params214 = [];
                var id215 = scope.resolve(["nextpage"], 0);
                params214.push(id215);
                option213.params = params214;
                var callRet216
                callRet216 = callFnUtil(tpl, scope, option213, buffer, ["pageUrl"], 0, 134);
                if (callRet216 && callRet216.isBuffer) {
                    buffer = callRet216;
                    callRet216 = undefined;
                }
                buffer.write(callRet216, false);
                buffer.write('" hidefocus="true">\r\n                        <span class="dpl-paginator-arrow-right"></span>\r\n                </a>\r\n            ', 0);
                return buffer;
            };
            option206.inverse = function (scope, buffer) {
                buffer.write('\r\n                <a hidefocus="true" href="javascript:void();" class="dpl-paginator-next J_NextPage J_HotPoint disabled" ><span class="dpl-paginator-arrow-right"></span></a>\r\n            ', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option206, buffer, 131);
            buffer.write('\r\n        </div>\r\n\r\n        ', 0);
            buffer.write('\r\n        <div class="g-u page-jump-form">\r\n            共', 0);
            var id217 = scope.resolve(["totalpage"], 0);
            buffer.write(id217, true);
            buffer.write('页 到第\r\n            <input type="text" class="page-number J_PageNumber" name="pageNumber" value="', 0);
            var id218 = scope.resolve(["defaultpage"], 0);
            buffer.write(id218, true);
            buffer.write('"/>\r\n            页\r\n            <input type="button" href="#pageJump" class="sys-btn g-u page-jump J_PageJump J_HotPoint J_NewPoint" pointname="', 0);
            var id219 = scope.resolve(["spm", "mmpageBottomButton"], 0);
            buffer.write(id219, true);
            buffer.write('" value="跳转" data-spm="', 0);
            var id220 = scope.resolve(["spm", "pageBottomButton"], 0);
            buffer.write(id220, true);
            buffer.write('">\r\n            <span class="dpl-paginator-pages">', 0);
            var id221 = scope.resolve(["page"], 0);
            buffer.write(id221, true);
            buffer.write('/', 0);
            var id222 = scope.resolve(["totalpage"], 0);
            buffer.write(id222, true);
            buffer.write('</span>\r\n        </div>\r\n    </div>\r\n</div>\r\n', 0);
            return buffer;
        };
widgetPageFeed.TPL_NAME = module.name;
widgetPageFeed.version = "5.0.0";
return widgetPageFeed
});