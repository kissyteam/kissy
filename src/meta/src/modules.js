/*jshint indent:false, quotmark:false*/
modulex.use(['ua', 'feature'], function(UA, Feature){
var mx = modulex;
mx.config("requires",{
    "anim/base": [
        "dom",
        "querystring",
        "promise"
    ],
    "anim/timer": [
        "anim/base",
        "feature"
    ],
    "anim/transition": [
        "anim/base",
        "feature"
    ],
    "attribute": [
        "util",
        "logger-manager",
        "event-custom"
    ],
    "base": [
        "attribute"
    ],
    "button": [
        "component/control"
    ],
    "color": [
        "attribute"
    ],
    "combobox": [
        "menu",
        "io"
    ],
    "combobox/multi-word": [
        "combobox"
    ],
    "component/container": [
        "component/control"
    ],
    "component/control": [
        "node",
        "event/gesture/basic",
        "event/gesture/tap",
        "base",
        "ua",
        "feature",
        "xtemplate/runtime"
    ],
    "component/extension/align": [
        "node",
        "ua"
    ],
    "component/extension/delegate-children": [
        "component/control"
    ],
    "component/extension/shim": [
        "ua"
    ],
    "component/plugin/drag": [
        "dd"
    ],
    "component/plugin/resize": [
        "resizable"
    ],
    "cookie": [
        "util"
    ],
    "date/format": [
        "logger-manager",
        "date/gregorian"
    ],
    "date/gregorian": [
        "util",
        "i18n!date"
    ],
    "date/picker": [
        "i18n!date/picker",
        "component/control",
        "date/format",
        "date/picker-xtpl"
    ],
    "date/popup-picker": [
        "date/picker",
        "component/extension/shim",
        "component/extension/align"
    ],
    "dd": [
        "base",
        "ua",
        "node",
        "event/gesture/basic",
        "event/gesture/pan"
    ],
    "dd/plugin/constrain": [
        "base",
        "node"
    ],
    "dd/plugin/proxy": [
        "dd"
    ],
    "dd/plugin/scroll": [
        "dd"
    ],
    "editor": [
        "html-parser",
        "component/control"
    ],
    "filter-menu": [
        "menu"
    ],
    "io": [
        "dom",
        "querystring",
        "event-custom",
        "promise",
        "url",
        "ua",
        "event-dom"
    ],
    "menu": [
        "component/container",
        "component/extension/delegate-children",
        "component/extension/content-box",
        "component/extension/align",
        "component/extension/shim"
    ],
    "menubutton": [
        "button",
        "menu"
    ],
    "navigation-view": [
        "component/container",
        "component/extension/content-box"
    ],
    "navigation-view/bar": [
        "button"
    ],
    "node": [
        "util",
        "dom",
        "event-dom",
        "anim"
    ],
    "overlay": [
        "component/container",
        "component/extension/shim",
        "component/extension/align",
        "component/extension/content-box"
    ],
    "promise": [
        "util",
        "logger-manager"
    ],
    "resizable": [
        "dd"
    ],
    "resizable/plugin/proxy": [
        "base",
        "node"
    ],
    "router": [
        "util",
        "logger-manager",
        "url",
        "event-dom",
        "event-custom",
        "feature"
    ],
    "scroll-view/base": [
        "anim/timer",
        "component/container",
        "component/extension/content-box"
    ],
    "scroll-view/plugin/pull-to-refresh": [
        "base",
        "node",
        "feature"
    ],
    "scroll-view/plugin/scrollbar": [
        "component/control",
        "event/gesture/pan"
    ],
    "scroll-view/touch": [
        "scroll-view/base",
        "event/gesture/pan"
    ],
    "separator": [
        "component/control"
    ],
    "split-button": [
        "menubutton"
    ],
    "stylesheet": [
        "dom"
    ],
    "swf": [
        "dom",
        "json",
        "attribute"
    ],
    "tabs": [
        "toolbar",
        "button",
        "component/extension/content-box"
    ],
    "toolbar": [
        "component/container",
        "component/extension/delegate-children"
    ],
    "tree": [
        "component/container",
        "component/extension/content-box",
        "component/extension/delegate-children"
    ],
    "dom/base": [
        "modulex-util",
        "modulex-ua",
        "modulex-feature",
        "dom/selector"
    ],
    "dom/ie": [
        "dom/base"
    ],
    "event-base": [
        "modulex-util"
    ],
    "event-custom": [
        "modulex-util",
        "modulex-event-base"
    ],
    "event-dom/base": [
        "event-base",
        "dom",
        "ua"
    ],
    "event-dom/focusin": [
        "event-dom/base"
    ],
    "event-dom/gesture/basic": [
        "event-dom/gesture/util"
    ],
    "event-dom/gesture/edge-pan": [
        "event-dom/gesture/util"
    ],
    "event-dom/gesture/pan": [
        "event-dom/gesture/util"
    ],
    "event-dom/gesture/pinch": [
        "event-dom/gesture/util"
    ],
    "event-dom/gesture/rotate": [
        "event-dom/gesture/util"
    ],
    "event-dom/gesture/shake": [
        "event-dom/base"
    ],
    "event-dom/gesture/swipe": [
        "event-dom/gesture/util"
    ],
    "event-dom/gesture/tap": [
        "event-dom/gesture/util"
    ],
    "event-dom/gesture/util": [
        "event-dom/base",
        "feature"
    ],
    "event-dom/hashchange": [
        "event-dom/base"
    ],
    "event-dom/ie": [
        "event-dom/base"
    ],
    "event-dom/input": [
        "event-dom/base"
    ],
    "url": [
        "modulex-querystring",
        "modulex-path"
    ],
    "xtemplate": [
        "xtemplate/runtime"
    ]
});
var win = window,
    isTouchGestureSupported = Feature.isTouchGestureSupported(),
    add = mx.add,
    emptyObject = {};

function alias(name, aliasName) {
   var cfg;
   if(typeof name ==="string") {
       cfg = {};
       cfg[name] = aliasName;
   } else {
       cfg = name;
   }
   mx.config("alias", cfg);
}

alias('anim', Feature.getCssVendorInfo('transition') ? 'anim/transition' : 'anim/timer');
alias('ajax','io');
alias('scroll-view', Feature.isTouchGestureSupported() ? 'scroll-view/touch' : 'scroll-view/base');
(function () {
    function init(UA, Feature) {
        modulex.config('alias', {
            'modulex-dom': 'dom',
            'dom/selector': Feature.isQuerySelectorSupported() ? '' : 'query-selector',
            dom: [
                'dom/base',
                    UA.ieMode < 9 ? 'dom/ie' : ''
            ]
        });
    }

    if (typeof UA !== 'undefined') {
        init(UA, Feature);
    } else {
        modulex.use(['modulex-ua', 'modulex-feature'], init);
    }
})();

modulex.config('alias', {
    'modulex-event-base': 'event-base'
});
modulex.config('alias', {
    'modulex-event-custom': 'event-custom'
});
(function () {
    function init(UA, Feature) {
        modulex.config('alias', {
            'event-dom': [
                'event-dom/base',
                Feature.isHashChangeSupported() ? '' : 'event-dom/hashchange',
                    UA.ieMode < 9 ? 'event-dom/ie' : '',
                Feature.isInputEventSupported() ? '' : 'event-dom/input',
                UA.ie ? '' : 'event-dom/focusin'
            ]
        });
    }

    if (typeof UA !== 'undefined') {
        init(UA, Feature);
    } else {
        modulex.use(['ua', 'feature'], init);
    }
})();

modulex.config('alias', {
    'modulex-feature': 'feature'
});
modulex.config('alias', {
    'modulex-path': 'path'
});
modulex.config('alias', {
    'modulex-querystring': 'querystring'
});
modulex.config('alias', {
    'modulex-ua': 'ua'
});
modulex.config('alias', {
    'modulex-url': 'url'
});
modulex.config('alias', {
    'modulex-util': 'util'
});
});