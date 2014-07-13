/** Compiled By kissy-xtemplate */
/*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
var sectionTagsFilterXtpl = function (scope, buffer, undefined) {
    var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
    var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
    buffer.write('', 0);
    var option0 = { escape: 1 };
    var hash1 = {};
    hash1['frontCategoryCount'] = 0;
    option0.hash = hash1;
    var callRet2;
    callRet2 = setCommand.call(tpl, scope, option0, buffer, 1);
    if (callRet2 && callRet2.isBuffer) {
        buffer = callRet2;
        callRet2 = undefined;
    }
    buffer.write(callRet2, true);
    buffer.write('\r\n', 0);
    var option3 = { escape: 1 };
    var hash4 = {};
    hash4['tagCount'] = 0;
    option3.hash = hash4;
    var callRet5;
    callRet5 = setCommand.call(tpl, scope, option3, buffer, 2);
    if (callRet5 && callRet5.isBuffer) {
        buffer = callRet5;
        callRet5 = undefined;
    }
    buffer.write(callRet5, true);
    buffer.write('\r\n\r\n', 0);
    var option6 = { escape: 1 };
    var params7 = [];
    var id8 = scope.resolve(['frontCategoryList'], 0);
    var exp10 = id8;
    if (id8) {
        var id9 = scope.resolve([
                'frontCategoryList',
                'length'
            ], 0);
        exp10 = id9;
    }
    params7.push(exp10);
    option6.params = params7;
    option6.fn = function (scope, buffer) {
        buffer.write('\r\n    ', 0);
        var option11 = { escape: 1 };
        var hash12 = {};
        var option13 = {};
        var params14 = [];
        var id15 = scope.resolve(['frontCategoryList'], 0);
        params14.push(id15);
        params14.push('favCount');
        option13.params = params14;
        var callRet16;
        callRet16 = callFnUtil(tpl, scope, option13, buffer, ['count'], 0, 5);
        if (callRet16 && callRet16.isBuffer) {
            buffer = callRet16;
            callRet16 = undefined;
        }
        hash12['frontCategoryCount'] = callRet16;
        option11.hash = hash12;
        var callRet17;
        callRet17 = setCommand.call(tpl, scope, option11, buffer, 5);
        if (callRet17 && callRet17.isBuffer) {
            buffer = callRet17;
            callRet17 = undefined;
        }
        buffer.write(callRet17, true);
        buffer.write('\r\n', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option6, buffer, 4);
    buffer.write('\r\n\r\n', 0);
    var option18 = { escape: 1 };
    var params19 = [];
    var id20 = scope.resolve(['tagList'], 0);
    var exp22 = id20;
    if (id20) {
        var id21 = scope.resolve([
                'tagList',
                'length'
            ], 0);
        exp22 = id21;
    }
    params19.push(exp22);
    option18.params = params19;
    option18.fn = function (scope, buffer) {
        buffer.write('\r\n    ', 0);
        var option23 = { escape: 1 };
        var hash24 = {};
        var option25 = {};
        var params26 = [];
        var id27 = scope.resolve(['tagList'], 0);
        params26.push(id27);
        params26.push('favCount');
        option25.params = params26;
        var callRet28;
        callRet28 = callFnUtil(tpl, scope, option25, buffer, ['count'], 0, 9);
        if (callRet28 && callRet28.isBuffer) {
            buffer = callRet28;
            callRet28 = undefined;
        }
        hash24['tagCount'] = callRet28;
        option23.hash = hash24;
        var callRet29;
        callRet29 = setCommand.call(tpl, scope, option23, buffer, 9);
        if (callRet29 && callRet29.isBuffer) {
            buffer = callRet29;
            callRet29 = undefined;
        }
        buffer.write(callRet29, true);
        buffer.write('\r\n', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option18, buffer, 8);
    buffer.write('\r\n\r\n', 0);
    var option30 = { escape: 1 };
    var hash31 = {};
    hash31['pageTypeFlag'] = 1;
    option30.hash = hash31;
    var callRet32;
    callRet32 = setCommand.call(tpl, scope, option30, buffer, 12);
    if (callRet32 && callRet32.isBuffer) {
        buffer = callRet32;
        callRet32 = undefined;
    }
    buffer.write(callRet32, true);
    buffer.write('\r\n', 0);
    var option33 = { escape: 1 };
    var params34 = [];
    var id35 = scope.resolve([
            'info',
            'pageType'
        ], 0);
    var exp36 = id35;
    exp36 = id35 === 'shop';
    params34.push(exp36);
    option33.params = params34;
    option33.fn = function (scope, buffer) {
        buffer.write('\r\n    ', 0);
        var option37 = { escape: 1 };
        var hash38 = {};
        hash38['pageTypeFlag'] = 2;
        option37.hash = hash38;
        var callRet39;
        callRet39 = setCommand.call(tpl, scope, option37, buffer, 14);
        if (callRet39 && callRet39.isBuffer) {
            buffer = callRet39;
            callRet39 = undefined;
        }
        buffer.write(callRet39, true);
        buffer.write('\r\n', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option33, buffer, 13);
    buffer.write('\r\n\r\n<div id="fav-class">\r\n    <div class="mercury-map clearfix" data-spm="', 0);
    var id40 = scope.resolve([
            'spm',
            'tag'
        ], 0);
    buffer.write(id40, true);
    buffer.write('">\r\n        <div class="mercury-map-wrap">\r\n            <div class="mod mod-a" style="height: 24px">\r\n                <div class="mod-wrap">\r\n                    <a data-spm="', 0);
    var id41 = scope.resolve([
            'spm',
            'tagAll'
        ], 0);
    buffer.write(id41, true);
    buffer.write('"\r\n                        class="mod-link ', 0);
    var option42 = { escape: 1 };
    var params43 = [];
    var id44 = scope.resolve([
            'queryData',
            'tagname'
        ], 0);
    var exp47 = !id44;
    if (!id44) {
        var id45 = scope.resolve([
                'queryData',
                'frontCategory'
            ], 0);
        var exp46 = id45;
        exp46 = id45 < 1;
        exp47 = exp46;
    }
    params43.push(exp47);
    option42.params = params43;
    option42.fn = function (scope, buffer) {
        buffer.write('active', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option42, buffer, 23);
    buffer.write('"\r\n                        href="', 0);
    var option48 = {};
    var params49 = [];
    var id50 = scope.resolve(['pageLink'], 0);
    params49.push(id50);
    option48.params = params49;
    var callRet51;
    callRet51 = callFnUtil(tpl, scope, option48, buffer, ['resetUrl'], 0, 24);
    if (callRet51 && callRet51.isBuffer) {
        buffer = callRet51;
        callRet51 = undefined;
    }
    buffer.write(callRet51, false);
    buffer.write('">\r\n                        <span>\u5168\u90E8\u5206\u7C7B</span>\r\n\r\n                        ', 0);
    var option52 = { escape: 1 };
    var params53 = [];
    var id54 = scope.resolve(['frontCategoryCount'], 0);
    params53.push(id54);
    option52.params = params53;
    option52.fn = function (scope, buffer) {
        buffer.write('\r\n                            <b>', 0);
        var id55 = scope.resolve(['frontCategoryCount'], 0);
        buffer.write(id55, true);
        buffer.write('</b>\r\n                        ', 0);
        return buffer;
    };
    option52.inverse = function (scope, buffer) {
        buffer.write('\r\n                            <b>', 0);
        var id56 = scope.resolve(['tagCount'], 0);
        buffer.write(id56, true);
        buffer.write('</b>\r\n                        ', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option52, buffer, 27);
    buffer.write('\r\n\r\n                    </a>\r\n                </div>\r\n            </div>\r\n\r\n            ', 0);
    var option57 = { escape: 1 };
    var params58 = [];
    var id59 = scope.resolve(['tagCount'], 0);
    params58.push(!id59);
    option57.params = params58;
    option57.fn = function (scope, buffer) {
        buffer.write('\r\n            <div class="mod mod-b" style="height:24px;width:80%">\r\n            ', 0);
        return buffer;
    };
    option57.inverse = function (scope, buffer) {
        buffer.write('\r\n            <div class="mod mod-b border-right" style="height:24px">\r\n            ', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option57, buffer, 37);
    buffer.write('\r\n\r\n                <div class="mod-wrap">\r\n                    <ul>\r\n                        ', 0);
    var option60 = { escape: 1 };
    var params61 = [];
    var id62 = scope.resolve(['frontCategoryList'], 0);
    params61.push(id62);
    option60.params = params61;
    option60.fn = function (scope, buffer) {
        buffer.write('\r\n                            <li>\r\n                                ', 0);
        var option63 = { escape: 1 };
        var hash64 = {};
        var exp66 = 'frontCategory=';
        var id65 = scope.resolve(['vtdId'], 0);
        exp66 = 'frontCategory=' + id65;
        hash64['query'] = exp66;
        option63.hash = hash64;
        var callRet67;
        callRet67 = setCommand.call(tpl, scope, option63, buffer, 47);
        if (callRet67 && callRet67.isBuffer) {
            buffer = callRet67;
            callRet67 = undefined;
        }
        buffer.write(callRet67, true);
        buffer.write('\r\n                                <a data-spm="', 0);
        var id68 = scope.resolve([
                'spm',
                'tagCategory'
            ], 0);
        buffer.write(id68, true);
        buffer.write('"\r\n                                    class="mod-link ', 0);
        var option69 = { escape: 1 };
        var params70 = [];
        var id71 = scope.resolve([
                'queryData',
                'frontCategory'
            ], 0);
        var exp73 = id71;
        var id72 = scope.resolve(['vtdId'], 0);
        exp73 = id71 === id72;
        params70.push(exp73);
        option69.params = params70;
        option69.fn = function (scope, buffer) {
            buffer.write('active', 0);
            return buffer;
        };
        buffer = ifCommand.call(tpl, scope, option69, buffer, 49);
        buffer.write('"\r\n                                    href="', 0);
        var option74 = {};
        var params75 = [];
        var id76 = scope.resolve([
                'root',
                'pageLink'
            ], 0);
        params75.push(id76);
        var id77 = scope.resolve(['query'], 0);
        params75.push(id77);
        option74.params = params75;
        var callRet78;
        callRet78 = callFnUtil(tpl, scope, option74, buffer, ['resetUrl'], 0, 50);
        if (callRet78 && callRet78.isBuffer) {
            buffer = callRet78;
            callRet78 = undefined;
        }
        buffer.write(callRet78, false);
        buffer.write('"\r\n                                    title="', 0);
        var id79 = scope.resolve(['vtdName'], 0);
        buffer.write(id79, true);
        buffer.write('">\r\n                                    <span>', 0);
        var id80 = scope.resolve(['vtdName'], 0);
        buffer.write(id80, true);
        buffer.write('</span>\r\n                                    <b>', 0);
        var id81 = scope.resolve(['favCount'], 0);
        buffer.write(id81, true);
        buffer.write('</b>\r\n                                </a>\r\n                            </li>\r\n                        ', 0);
        return buffer;
    };
    buffer = eachCommand.call(tpl, scope, option60, buffer, 45);
    buffer.write('\r\n                    </ul>\r\n                </div>\r\n            </div>\r\n\r\n            ', 0);
    var option82 = { escape: 1 };
    var params83 = [];
    var id84 = scope.resolve(['tagCount'], 0);
    params83.push(id84);
    option82.params = params83;
    option82.fn = function (scope, buffer) {
        buffer.write('\r\n                <div class="mod mod-c ', 0);
        var option85 = { escape: 1 };
        var params86 = [];
        var id87 = scope.resolve(['frontCategoryCount'], 0);
        params86.push(id87);
        option85.params = params86;
        option85.fn = function (scope, buffer) {
            buffer.write('border-left', 0);
            return buffer;
        };
        buffer = ifCommand.call(tpl, scope, option85, buffer, 62);
        buffer.write('"\r\n                    style="height:24px">\r\n                    <div class="mod-wrap">\r\n                        <ul>\r\n                            ', 0);
        var option88 = { escape: 1 };
        var params89 = [];
        var id90 = scope.resolve(['tagList'], 0);
        params89.push(id90);
        option88.params = params89;
        option88.fn = function (scope, buffer) {
            buffer.write('\r\n                                <li>\r\n                                    ', 0);
            var option91 = { escape: 1 };
            var params92 = [];
            var id93 = scope.resolve(['favCount'], 0);
            var exp94 = id93;
            exp94 = id93 > 0;
            params92.push(exp94);
            option91.params = params92;
            option91.fn = function (scope, buffer) {
                buffer.write('\r\n                                        ', 0);
                var option95 = { escape: 1 };
                var hash96 = {};
                hash96['subempty'] = 'false';
                option95.hash = hash96;
                var callRet97;
                callRet97 = setCommand.call(tpl, scope, option95, buffer, 69);
                if (callRet97 && callRet97.isBuffer) {
                    buffer = callRet97;
                    callRet97 = undefined;
                }
                buffer.write(callRet97, true);
                buffer.write('\r\n                                    ', 0);
                return buffer;
            };
            option91.inverse = function (scope, buffer) {
                buffer.write('\r\n                                        ', 0);
                var option98 = { escape: 1 };
                var hash99 = {};
                hash99['subempty'] = 'true';
                option98.hash = hash99;
                var callRet100;
                callRet100 = setCommand.call(tpl, scope, option98, buffer, 71);
                if (callRet100 && callRet100.isBuffer) {
                    buffer = callRet100;
                    callRet100 = undefined;
                }
                buffer.write(callRet100, true);
                buffer.write('\r\n                                    ', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option91, buffer, 68);
            buffer.write('\r\n\r\n                                    ', 0);
            var option101 = { escape: 1 };
            var params102 = [];
            var id103 = scope.resolve(['tagDisplayName'], 0);
            params102.push(id103);
            option101.params = params102;
            option101.fn = function (scope, buffer) {
                buffer.write('\r\n                                        ', 0);
                var option104 = { escape: 1 };
                var params105 = [];
                var id106 = scope.resolve([
                        'root',
                        'queryData',
                        'tagname'
                    ], 0);
                var exp108 = id106;
                var id107 = scope.resolve(['tagname'], 0);
                exp108 = id106 === id107;
                params105.push(exp108);
                option104.params = params105;
                option104.fn = function (scope, buffer) {
                    buffer.write('\r\n                                            <span class="mod-link active"\r\n                                                data-tagname="', 0);
                    var id109 = scope.resolve(['tagDisplayName'], 0);
                    buffer.write(id109, true);
                    buffer.write('"\r\n                                                data-type="', 0);
                    var id110 = scope.resolve([
                            'root',
                            'pageTypeFlag'
                        ], 0);
                    buffer.write(id110, true);
                    buffer.write('"\r\n                                                data-empty="', 0);
                    var id111 = scope.resolve(['subempty'], 0);
                    buffer.write(id111, true);
                    buffer.write('">\r\n                                                <span class="tagname">', 0);
                    var id112 = scope.resolve(['tagDisplayName'], 0);
                    buffer.write(id112, true);
                    buffer.write('</span>\r\n                                                <span class="J_CatEditTrigger edit nmiconfont">&#x3453;</span>\r\n                                                <span class="J_CatDelTrigger del nmiconfont">&#x3570;</span>\r\n                                            </span>\r\n                                        ', 0);
                    return buffer;
                };
                option104.inverse = function (scope, buffer) {
                    buffer.write('\r\n                                            ', 0);
                    var option113 = { escape: 1 };
                    var hash114 = {};
                    var exp116 = 'tagname=';
                    var id115 = scope.resolve(['tagname'], 0);
                    exp116 = 'tagname=' + id115;
                    hash114['query'] = exp116;
                    option113.hash = hash114;
                    var callRet117;
                    callRet117 = setCommand.call(tpl, scope, option113, buffer, 85);
                    if (callRet117 && callRet117.isBuffer) {
                        buffer = callRet117;
                        callRet117 = undefined;
                    }
                    buffer.write(callRet117, true);
                    buffer.write('\r\n                                            <a  data-spm="', 0);
                    var id118 = scope.resolve([
                            'spm',
                            'tagTag'
                        ], 0);
                    buffer.write(id118, true);
                    buffer.write('"\r\n                                                class="mod-link"\r\n                                                href="', 0);
                    var option119 = { escape: 1 };
                    var params120 = [];
                    var id121 = scope.resolve([
                            'root',
                            'pageLink'
                        ], 0);
                    params120.push(id121);
                    var id122 = scope.resolve(['query'], 0);
                    params120.push(id122);
                    option119.params = params120;
                    var callRet123;
                    callRet123 = callFnUtil(tpl, scope, option119, buffer, ['resetUrl'], 0, 88);
                    if (callRet123 && callRet123.isBuffer) {
                        buffer = callRet123;
                        callRet123 = undefined;
                    }
                    buffer.write(callRet123, true);
                    buffer.write('"\r\n                                                title="', 0);
                    var id124 = scope.resolve(['tagDisplayName'], 0);
                    buffer.write(id124, true);
                    buffer.write('"\r\n                                                data-tagname="', 0);
                    var id125 = scope.resolve(['tagDisplayName'], 0);
                    buffer.write(id125, true);
                    buffer.write('"\r\n                                                data-type="', 0);
                    var id126 = scope.resolve([
                            'root',
                            'pageTypeFlag'
                        ], 0);
                    buffer.write(id126, true);
                    buffer.write('"\r\n                                                data-empty="', 0);
                    var id127 = scope.resolve(['subempty'], 0);
                    buffer.write(id127, true);
                    buffer.write('">\r\n                                                <span>', 0);
                    var id128 = scope.resolve(['tagDisplayName'], 0);
                    buffer.write(id128, true);
                    buffer.write('</span>\r\n                                                <b>', 0);
                    var id129 = scope.resolve(['favCount'], 0);
                    buffer.write(id129, true);
                    buffer.write('</b>\r\n                                            </a>\r\n                                        ', 0);
                    return buffer;
                };
                buffer = ifCommand.call(tpl, scope, option104, buffer, 75);
                buffer.write('\r\n                                    ', 0);
                return buffer;
            };
            option101.inverse = function (scope, buffer) {
                buffer.write('\r\n                                     <a  data-spm="', 0);
                var id130 = scope.resolve([
                        'spm',
                        'tagTag'
                    ], 0);
                buffer.write(id130, true);
                buffer.write('"\r\n                                         class="mod-link ', 0);
                var option131 = { escape: 1 };
                var params132 = [];
                var id133 = scope.resolve([
                        'queryData',
                        'tagname'
                    ], 0);
                params132.push(!id133);
                option131.params = params132;
                option131.fn = function (scope, buffer) {
                    buffer.write('active', 0);
                    return buffer;
                };
                buffer = ifCommand.call(tpl, scope, option131, buffer, 99);
                buffer.write('"\r\n                                         href="', 0);
                var option134 = {};
                var params135 = [];
                var id136 = scope.resolve([
                        'root',
                        'pageLink'
                    ], 0);
                params135.push(id136);
                option134.params = params135;
                var callRet137;
                callRet137 = callFnUtil(tpl, scope, option134, buffer, ['resetUrl'], 0, 100);
                if (callRet137 && callRet137.isBuffer) {
                    buffer = callRet137;
                    callRet137 = undefined;
                }
                buffer.write(callRet137, false);
                buffer.write('"\r\n                                         title="', 0);
                var id138 = scope.resolve(['tagDisplayName'], 0);
                buffer.write(id138, true);
                buffer.write('">\r\n                                        <span>\u65E0\u6807\u7B7E</span><b>', 0);
                var id139 = scope.resolve(['favCount'], 0);
                buffer.write(id139, true);
                buffer.write('</b>\r\n                                    </a>\r\n                                    ', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option101, buffer, 74);
            buffer.write('\r\n                                </li>\r\n                            ', 0);
            return buffer;
        };
        buffer = eachCommand.call(tpl, scope, option88, buffer, 66);
        buffer.write('\r\n\r\n\r\n                        </ul>\r\n                    </div>\r\n                </div>\r\n            ', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option82, buffer, 61);
    buffer.write('\r\n\r\n            <div class="mod mod-d" style="height:24px">\r\n                <div class="mod-wrap">\r\n                    ', 0);
    var option140 = { escape: 1 };
    var params141 = [];
    var id142 = scope.resolve(['frontCategoryCount'], 0);
    var exp143 = id142;
    exp143 = id142 < 7;
    var exp146 = exp143;
    if (exp143) {
        var id144 = scope.resolve(['tagCount'], 0);
        var exp145 = id144;
        exp145 = id144 < 10;
        exp146 = exp145;
    }
    params141.push(exp146);
    option140.params = params141;
    option140.fn = function (scope, buffer) {
        buffer.write('\r\n                        ', 0);
        var option147 = { escape: 1 };
        var hash148 = {};
        hash148['style'] = 'display:none';
        option147.hash = hash148;
        var callRet149;
        callRet149 = setCommand.call(tpl, scope, option147, buffer, 117);
        if (callRet149 && callRet149.isBuffer) {
            buffer = callRet149;
            callRet149 = undefined;
        }
        buffer.write(callRet149, true);
        buffer.write('\r\n                    ', 0);
        return buffer;
    };
    option140.inverse = function (scope, buffer) {
        buffer.write('\r\n                        ', 0);
        var option150 = { escape: 1 };
        var hash151 = {};
        hash151['style'] = '';
        option150.hash = hash151;
        var callRet152;
        callRet152 = setCommand.call(tpl, scope, option150, buffer, 119);
        if (callRet152 && callRet152.isBuffer) {
            buffer = callRet152;
            callRet152 = undefined;
        }
        buffer.write(callRet152, true);
        buffer.write('\r\n                    ', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option140, buffer, 116);
    buffer.write('\r\n\r\n                    <a pointname="', 0);
    var id153 = scope.resolve([
            'spm',
            'mmstattagmore'
        ], 0);
    buffer.write(id153, true);
    buffer.write('"\r\n                        class="mod-more J_TopCatMapMore J_NewPoint"\r\n                        style="', 0);
    var id154 = scope.resolve(['style'], 0);
    buffer.write(id154, true);
    buffer.write('"\r\n                        href="#">\r\n                        <span>\u66F4\u591A</span><b></b><s></s>\r\n                    </a>\r\n\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n', 0);
    return buffer;
};
sectionTagsFilterXtpl.TPL_NAME = module.name;
sectionTagsFilterXtpl.version = '5.0.0';
module.exports = sectionTagsFilterXtpl;