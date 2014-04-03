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
            buffer.write('<!--tab 的 模块 模板 就是(宝贝/详情/评价/交易/推荐的那个tab)-->\n<!-- 吊顶 -->\n<div id="J_SiteNav" class="site-nav">\n    <div id="J_SiteNavBd" class="site-nav-bd">\n        <ul id="J_SiteNavBdL" class="site-nav-bd-l"></ul>\n        <ul id="J_SiteNavBdR" class="site-nav-bd-r"></ul>\n    </div>\n</div>\n<!-- 吊顶 -->\n<section id="fr-body" data-spm="991222581">\n    <nav class="fr-nav ks-scroll-view">\n        <ul class="fr-nav-ul ks-scroll-view-content">\n            <li class="fr-trigger J_Analysis" data-analysis="maininfo">宝 贝</li>\n            <li class="fr-trigger J_Analysis" data-analysis="rate">评 价<span id="J_Count-rate">(<em>-</em>)</span></li>\n            <li class="fr-trigger J_Analysis" data-analysis="deal">成 交<span id="J_Count-deal">(<em>-</em>)</span></li>\n            <li class="fr-trigger J_Analysis" data-analysis="recommend">推 荐</li>\n            <p class="line"><i class="J_line"></i></p>\n        </ul>\n    </nav>\n\n    <div class="fr-layout">\n        <div class="fr-content clearfix">\n            <!--宝贝概述-->\n            <div class="fr-panel pg-item">\n                <div class="pg-item-home">\n                    ');
            var option0 = {};
            var params1 = [];
            params1.push('./itemTabInfo');
            option0.params = params1;
            if (moduleWrap) {
                require("./itemTabInfo");
                option0.params[0] = moduleWrap.resolve(option0.params[0]);
            }
            var commandRet2 = includeCommand.call(engine, scope, option0, buffer, 26, payload);
            if (commandRet2 && commandRet2.isBuffer) {
                buffer = commandRet2;
                commandRet2 = undefined;
            }
            buffer.write(commandRet2, false);
            buffer.write('\n                </div>\n\n                <!--宝贝详情-->\n                <div class="mod-describe">\n                    ');
            var option3 = {};
            var params4 = [];
            params4.push('./itemTabDesc');
            option3.params = params4;
            if (moduleWrap) {
                require("./itemTabDesc");
                option3.params[0] = moduleWrap.resolve(option3.params[0]);
            }
            var commandRet5 = includeCommand.call(engine, scope, option3, buffer, 31, payload);
            if (commandRet5 && commandRet5.isBuffer) {
                buffer = commandRet5;
                commandRet5 = undefined;
            }
            buffer.write(commandRet5, false);
            buffer.write('\n                </div>\n\n            </div>\n\n            <!--宝贝评价-->\n            <div class="fr-panel pg-reviews">\n                ');
            var option6 = {};
            var params7 = [];
            params7.push('./itemTabRating');
            option6.params = params7;
            if (moduleWrap) {
                require("./itemTabRating");
                option6.params[0] = moduleWrap.resolve(option6.params[0]);
            }
            var commandRet8 = includeCommand.call(engine, scope, option6, buffer, 38, payload);
            if (commandRet8 && commandRet8.isBuffer) {
                buffer = commandRet8;
                commandRet8 = undefined;
            }
            buffer.write(commandRet8, false);
            buffer.write('\n            </div>\n\n            <!--宝贝成交-->\n            <div class="fr-panel pg-deal">\n                ');
            var option9 = {};
            var params10 = [];
            params10.push('./itemTabDealRecord');
            option9.params = params10;
            if (moduleWrap) {
                require("./itemTabDealRecord");
                option9.params[0] = moduleWrap.resolve(option9.params[0]);
            }
            var commandRet11 = includeCommand.call(engine, scope, option9, buffer, 43, payload);
            if (commandRet11 && commandRet11.isBuffer) {
                buffer = commandRet11;
                commandRet11 = undefined;
            }
            buffer.write(commandRet11, false);
            buffer.write('\n            </div>\n\n            <!--宝贝推荐-->\n            <div class="fr-panel pg-recommand">\n                ');
            var option12 = {};
            var params13 = [];
            params13.push('./itemTabRecommend');
            option12.params = params13;
            if (moduleWrap) {
                require("./itemTabRecommend");
                option12.params[0] = moduleWrap.resolve(option12.params[0]);
            }
            var commandRet14 = includeCommand.call(engine, scope, option12, buffer, 48, payload);
            if (commandRet14 && commandRet14.isBuffer) {
                buffer = commandRet14;
                commandRet14 = undefined;
            }
            buffer.write(commandRet14, false);
            buffer.write('\n            </div>\n\n        </div>\n    </div>\n</section>\n\n<script>\n    KISSY.use("detail/mod", function(S,Mod) {\n        Mod.add({\n            name:"detail/frame/",\n            data: {}\n        });\n    });\n</script>\n');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});