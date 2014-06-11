/** Compiled By kissy-xtemplate */
/*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
var adAreaXtpl = function (scope, buffer, undefined) {
    var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
    var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
    buffer.write('<div class="page-footer-hidden">\r\n\r\n    ', 0);
    buffer.write('\r\n    ', 0);
    var option0 = { escape: 1 };
    var params1 = [];
    params1.push('p4p/favorite_new.php');
    option0.params = params1;
    var callRet2;
    callRet2 = callFnUtil(tpl, scope, option0, buffer, ['tms'], 0, 4);
    if (callRet2 && callRet2.isBuffer) {
        buffer = callRet2;
        callRet2 = undefined;
    }
    buffer.write(callRet2, true);
    buffer.write('\r\n\r\n\r\n    ', 0);
    buffer.write('\r\n    ', 0);
    var option3 = { escape: 1 };
    var params4 = [];
    var id5 = scope.resolve(['pageName'], 0);
    var exp6 = id5;
    exp6 = id5 === 'shop-collect';
    params4.push(exp6);
    option3.params = params4;
    option3.fn = function (scope, buffer) {
        buffer.write('\r\n        ', 0);
        var option7 = { escape: 1 };
        var params8 = [];
        params8.push('relationrecommend/shop_list_recommend.php');
        option7.params = params8;
        var callRet9;
        callRet9 = callFnUtil(tpl, scope, option7, buffer, ['tms'], 0, 9);
        if (callRet9 && callRet9.isBuffer) {
            buffer = callRet9;
            callRet9 = undefined;
        }
        buffer.write(callRet9, true);
        buffer.write('\r\n    ', 0);
        return buffer;
    };
    option3.inverse = function (scope, buffer) {
        buffer.write('\r\n        ', 0);
        var option10 = { escape: 1 };
        var params11 = [];
        params11.push('relationrecommend/item_list_recommend.php');
        option10.params = params11;
        var callRet12;
        callRet12 = callFnUtil(tpl, scope, option10, buffer, ['tms'], 0, 11);
        if (callRet12 && callRet12.isBuffer) {
            buffer = callRet12;
            callRet12 = undefined;
        }
        buffer.write(callRet12, true);
        buffer.write('\r\n    ', 0);
        return buffer;
    };
    buffer = ifCommand.call(tpl, scope, option3, buffer, 8);
    buffer.write('\r\n\r\n    ', 0);
    buffer.write('\r\n    <div class="fav-zuanshi" >\r\n        <div id="zuanshiAds">\r\n            <ul class="zuanshi-ads-trigger">\r\n                <li class="on"></li>\r\n                <li></li>\r\n            </ul>\r\n            <ul class="zuanshi-ads-content">\r\n                <li>\r\n                    <script>\r\n                        document.write(\'<a style="display:none!important" id="tanx-a-mm_12852562_1778064_11271842"></a>\');\r\n                        tanx_s = document.createElement("script");\r\n                        tanx_s.type = "text/javascript";\r\n                        tanx_s.charset = "gbk";\r\n                        tanx_s.id = "tanx-s-mm_12852562_1778064_11271842";\r\n                        tanx_s.async = true;\r\n                        tanx_s.src = "http://p.tanx.com/ex?i=mm_12852562_1778064_11271842";\r\n                        document.getElementsByTagName("head")[0].appendChild(tanx_s);\r\n                    </script>\r\n                </li>\r\n                <li style="display:none;">\r\n                    <script>\r\n                        document.write(\'<a style="display:none!important" id="tanx-a-mm_12852562_1778064_11271851"></a>\');\r\n                        tanx_s = document.createElement("script");\r\n                        tanx_s.type = "text/javascript";\r\n                        tanx_s.charset = "gbk";\r\n                        tanx_s.id = "tanx-s-mm_12852562_1778064_11271851";\r\n                        tanx_s.async = true;\r\n                        tanx_s.src = "http://p.tanx.com/ex?i=mm_12852562_1778064_11271851";\r\n                        document.getElementsByTagName("head")[0].appendChild(tanx_s);\r\n                    </script>\r\n                </li>\r\n            </ul>\r\n        </div>\r\n\r\n        <script>\r\n            KISSY.use(\'switchable\', function (S, Switchable) {\r\n                new Switchable(\'#zuanshiAds\', {\r\n                    navCls: \'zuanshi-ads-trigger\',\r\n                    contentCls: \'zuanshi-ads-content\',\r\n                    activeTriggerCls: \'on\',\r\n                    autoplay: true,\r\n                    interval: 4,\r\n                    effect: \'fade\',\r\n                    duration: 0.3,\r\n                    easing: \'easeOut\'\r\n                });\r\n            });\r\n        </script>\r\n        <div class="fav-zuanshi-small">\r\n            <script>\r\n                document.write(\'<a style="display:none!important" id="tanx-a-mm_12852562_1778064_14286432"></a>\');\r\n                tanx_s = document.createElement("script");\r\n                tanx_s.type = "text/javascript";\r\n                tanx_s.charset = "gbk";\r\n                tanx_s.id = "tanx-s-mm_12852562_1778064_14286432";\r\n                tanx_s.async = true;\r\n                tanx_s.src = "http://p.tanx.com/ex?i=mm_12852562_1778064_14286432";\r\n                document.getElementsByTagName("head")[0].appendChild(tanx_s);\r\n            </script>\r\n        </div>\r\n    </div>\r\n</div>\r\n', 0);
    return buffer;
};
adAreaXtpl.TPL_NAME = module.name;
adAreaXtpl.version = '5.0.0';
module.exports = adAreaXtpl;