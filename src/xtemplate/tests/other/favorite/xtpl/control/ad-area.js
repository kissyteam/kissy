/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
        var adArea = function (scope, buffer, session, undefined) {
            var engine = this,
                nativeCommands = engine.nativeCommands,
                utils = engine.utils;
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
            if ("5.0.0" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
            }
            buffer.write('<div class="page-footer-hidden">\n\n    ', 0);
            buffer.write('\n    ', 0);
            var option0 = {
                escape: 1
            };
            var params1 = [];
            params1.push('p4p/favorite_new.php');
            option0.params = params1;
            var callRet2
            callRet2 = callFnUtil(engine, scope, option0, buffer, ["tms"], 0, 4);
            if (callRet2 && callRet2.isBuffer) {
                buffer = callRet2;
                callRet2 = undefined;
            }
            buffer.write(callRet2, true);
            buffer.write('\n\n\n    ', 0);
            buffer.write('\n    ', 0);
            var option3 = {
                escape: 1
            };
            var params4 = [];
            var id5 = scope.resolve(["pageName"], 0);
            var exp6 = id5;
            exp6 = (id5) === ('shop-collect');
            params4.push(exp6);
            option3.params = params4;
            option3.fn = function (scope, buffer) {
                buffer.write('\n        ', 0);
                var option7 = {
                    escape: 1
                };
                var params8 = [];
                params8.push('relationrecommend/shop_list_recommend.php');
                option7.params = params8;
                var callRet9
                callRet9 = callFnUtil(engine, scope, option7, buffer, ["tms"], 0, 9);
                if (callRet9 && callRet9.isBuffer) {
                    buffer = callRet9;
                    callRet9 = undefined;
                }
                buffer.write(callRet9, true);
                buffer.write('\n    ', 0);
                return buffer;
            };
            option3.inverse = function (scope, buffer) {
                buffer.write('\n        ', 0);
                var option10 = {
                    escape: 1
                };
                var params11 = [];
                params11.push('relationrecommend/item_list_recommend.php');
                option10.params = params11;
                var callRet12
                callRet12 = callFnUtil(engine, scope, option10, buffer, ["tms"], 0, 11);
                if (callRet12 && callRet12.isBuffer) {
                    buffer = callRet12;
                    callRet12 = undefined;
                }
                buffer.write(callRet12, true);
                buffer.write('\n    ', 0);
                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option3, buffer, 8, session);
            buffer.write('\n\n    ', 0);
            buffer.write('\n    <div class="fav-zuanshi" >\n        <div id="zuanshiAds">\n            <ul class="zuanshi-ads-trigger">\n                <li class="on"></li>\n                <li></li>\n            </ul>\n            <ul class="zuanshi-ads-content">\n                <li>\n                    <script>\n                        document.write(\'<a style="display:none!important" id="tanx-a-mm_12852562_1778064_11271842"></a>\');\n                        tanx_s = document.createElement("script");\n                        tanx_s.type = "text/javascript";\n                        tanx_s.charset = "gbk";\n                        tanx_s.id = "tanx-s-mm_12852562_1778064_11271842";\n                        tanx_s.async = true;\n                        tanx_s.src = "http://p.tanx.com/ex?i=mm_12852562_1778064_11271842";\n                        document.getElementsByTagName("head")[0].appendChild(tanx_s);\n                    </script>\n                </li>\n                <li style="display:none;">\n                    <script>\n                        document.write(\'<a style="display:none!important" id="tanx-a-mm_12852562_1778064_11271851"></a>\');\n                        tanx_s = document.createElement("script");\n                        tanx_s.type = "text/javascript";\n                        tanx_s.charset = "gbk";\n                        tanx_s.id = "tanx-s-mm_12852562_1778064_11271851";\n                        tanx_s.async = true;\n                        tanx_s.src = "http://p.tanx.com/ex?i=mm_12852562_1778064_11271851";\n                        document.getElementsByTagName("head")[0].appendChild(tanx_s);\n                    </script>\n                </li>\n            </ul>\n        </div>\n\n        <script>\n            KISSY.use(\'switchable\', function (S, Switchable) {\n                new Switchable(\'#zuanshiAds\', {\n                    navCls: \'zuanshi-ads-trigger\',\n                    contentCls: \'zuanshi-ads-content\',\n                    activeTriggerCls: \'on\',\n                    autoplay: true,\n                    interval: 4,\n                    effect: \'fade\',\n                    duration: 0.3,\n                    easing: \'easeOut\'\n                });\n            });\n        </script>\n        <div class="fav-zuanshi-small">\n            <script>\n                document.write(\'<a style="display:none!important" id="tanx-a-mm_12852562_1778064_14286432"></a>\');\n                tanx_s = document.createElement("script");\n                tanx_s.type = "text/javascript";\n                tanx_s.charset = "gbk";\n                tanx_s.id = "tanx-s-mm_12852562_1778064_14286432";\n                tanx_s.async = true;\n                tanx_s.src = "http://p.tanx.com/ex?i=mm_12852562_1778064_14286432";\n                document.getElementsByTagName("head")[0].appendChild(tanx_s);\n            </script>\n        </div>\n    </div>\n</div>\n', 0);
            return buffer;
        };
adArea.TPL_NAME = module.name;
return adArea
});