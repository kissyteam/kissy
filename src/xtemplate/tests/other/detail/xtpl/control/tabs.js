/** Compiled By kissy-xtemplate */
/*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
var tabsHtml = function (scope, buffer, undefined) {
    var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
    var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
    buffer.write('<!--tab \u7684 \u6A21\u5757 \u6A21\u677F \u5C31\u662F(\u5B9D\u8D1D/\u8BE6\u60C5/\u8BC4\u4EF7/\u4EA4\u6613/\u63A8\u8350\u7684\u90A3\u4E2Atab)-->\r\n<!-- \u540A\u9876 -->\r\n<div id="J_SiteNav" class="site-nav">\r\n    <div id="J_SiteNavBd" class="site-nav-bd">\r\n        <ul id="J_SiteNavBdL" class="site-nav-bd-l"></ul>\r\n        <ul id="J_SiteNavBdR" class="site-nav-bd-r"></ul>\r\n    </div>\r\n</div>\r\n<!-- \u540A\u9876 -->\r\n<section id="fr-body" data-spm="991222581">\r\n    <nav class="fr-nav ks-scroll-view">\r\n        <ul class="fr-nav-ul ks-scroll-view-content">\r\n            <li class="fr-trigger J_Analysis" data-analysis="maininfo">\u5B9D \u8D1D</li>\r\n            <li class="fr-trigger J_Analysis" data-analysis="rate">\u8BC4 \u4EF7<span id="J_Count-rate">(<em>-</em>)</span></li>\r\n            <li class="fr-trigger J_Analysis" data-analysis="deal">\u6210 \u4EA4<span id="J_Count-deal">(<em>-</em>)</span></li>\r\n            <li class="fr-trigger J_Analysis" data-analysis="recommend">\u63A8 \u8350</li>\r\n            <p class="line"><i class="J_line"></i></p>\r\n        </ul>\r\n    </nav>\r\n\r\n    <div class="fr-layout">\r\n        <div class="fr-content clearfix">\r\n            <!--\u5B9D\u8D1D\u6982\u8FF0-->\r\n            <div class="fr-panel pg-item">\r\n                <div class="pg-item-home">\r\n                    ', 0);
    var option0 = {};
    var params1 = [];
    params1.push('./itemTabInfo');
    option0.params = params1;
    require('./itemTabInfo');
    var callRet2;
    callRet2 = includeCommand.call(tpl, scope, option0, buffer, 26);
    if (callRet2 && callRet2.isBuffer) {
        buffer = callRet2;
        callRet2 = undefined;
    }
    buffer.write(callRet2, false);
    buffer.write('\r\n                </div>\r\n\r\n                <!--\u5B9D\u8D1D\u8BE6\u60C5-->\r\n                <div class="mod-describe">\r\n                    ', 0);
    var option3 = {};
    var params4 = [];
    params4.push('./itemTabDesc');
    option3.params = params4;
    require('./itemTabDesc');
    var callRet5;
    callRet5 = includeCommand.call(tpl, scope, option3, buffer, 31);
    if (callRet5 && callRet5.isBuffer) {
        buffer = callRet5;
        callRet5 = undefined;
    }
    buffer.write(callRet5, false);
    buffer.write('\r\n                </div>\r\n\r\n            </div>\r\n\r\n            <!--\u5B9D\u8D1D\u8BC4\u4EF7-->\r\n            <div class="fr-panel pg-reviews">\r\n                ', 0);
    var option6 = {};
    var params7 = [];
    params7.push('./itemTabRating');
    option6.params = params7;
    require('./itemTabRating');
    var callRet8;
    callRet8 = includeCommand.call(tpl, scope, option6, buffer, 38);
    if (callRet8 && callRet8.isBuffer) {
        buffer = callRet8;
        callRet8 = undefined;
    }
    buffer.write(callRet8, false);
    buffer.write('\r\n            </div>\r\n\r\n            <!--\u5B9D\u8D1D\u6210\u4EA4-->\r\n            <div class="fr-panel pg-deal">\r\n                ', 0);
    var option9 = {};
    var params10 = [];
    params10.push('./itemTabDealRecord');
    option9.params = params10;
    require('./itemTabDealRecord');
    var callRet11;
    callRet11 = includeCommand.call(tpl, scope, option9, buffer, 43);
    if (callRet11 && callRet11.isBuffer) {
        buffer = callRet11;
        callRet11 = undefined;
    }
    buffer.write(callRet11, false);
    buffer.write('\r\n            </div>\r\n\r\n            <!--\u5B9D\u8D1D\u63A8\u8350-->\r\n            <div class="fr-panel pg-recommand">\r\n                ', 0);
    var option12 = {};
    var params13 = [];
    params13.push('./itemTabRecommend');
    option12.params = params13;
    require('./itemTabRecommend');
    var callRet14;
    callRet14 = includeCommand.call(tpl, scope, option12, buffer, 48);
    if (callRet14 && callRet14.isBuffer) {
        buffer = callRet14;
        callRet14 = undefined;
    }
    buffer.write(callRet14, false);
    buffer.write('\r\n            </div>\r\n\r\n        </div>\r\n    </div>\r\n</section>\r\n\r\n<script>\r\n    KISSY.use("detail/mod", function(S,Mod) {\r\n        Mod.add({\r\n            name:"detail/frame/",\r\n            data: {}\r\n        });\r\n    });\r\n</script>\r\n', 0);
    return buffer;
};
tabsHtml.TPL_NAME = module.name;
tabsHtml.version = '5.0.0';
module.exports = tabsHtml;