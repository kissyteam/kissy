/*jshint indent:false, quotmark:false*/
(function(S){
S.config("requires",{
    "anim/base": [
        "dom",
        "promise"
    ],
    "anim/timer": [
        "anim/base"
    ],
    "anim/transition": [
        "anim/base"
    ],
    "attribute": [
        "event/custom"
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
        "event/gesture/base",
        "event/gesture/tap",
        "component/manager",
        "base",
        "xtemplate/runtime"
    ],
    "component/extension/align": [
        "node"
    ],
    "component/extension/content-box": [
        "component/extension/content-xtpl"
    ],
    "component/extension/delegate-children": [
        "component/manager",
        "event/gesture/base",
        "event/gesture/tap"
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
    "date/format": [
        "date/gregorian"
    ],
    "date/gregorian": [
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
        "node",
        "base",
        "event/gesture/base",
        "event/gesture/drag"
    ],
    "dd/plugin/constrain": [
        "node",
        "base"
    ],
    "dd/plugin/proxy": [
        "dd"
    ],
    "dd/plugin/scroll": [
        "dd"
    ],
    "dom": [
        "ua"
    ],
    "dom/base": [
        "ua"
    ],
    "dom/class-list": [
        "dom/base"
    ],
    "dom/ie": [
        "dom/base"
    ],
    "dom/selector": [
        "dom/basic"
    ],
    "editor": [
        "html-parser",
        "component/control"
    ],
    "event/base": [
        "util"
    ],
    "event/custom": [
        "event/base"
    ],
    "event/dom/base": [
        "event/base",
        "dom"
    ],
    "event/dom/focusin": [
        "event/dom/base"
    ],
    "event/dom/hashchange": [
        "event/dom/base"
    ],
    "event/dom/ie": [
        "event/dom/base"
    ],
    "event/dom/input": [
        "event/dom/base"
    ],
    "event/gesture/base": [
        "event/gesture/util"
    ],
    "event/gesture/drag": [
        "event/gesture/util"
    ],
    "event/gesture/edge-drag": [
        "event/gesture/util"
    ],
    "event/gesture/pinch": [
        "event/gesture/util"
    ],
    "event/gesture/rotate": [
        "event/gesture/util"
    ],
    "event/gesture/shake": [
        "event/dom/base"
    ],
    "event/gesture/swipe": [
        "event/gesture/util"
    ],
    "event/gesture/tap": [
        "event/gesture/util"
    ],
    "event/gesture/util": [
        "event/dom/base"
    ],
    "feature": [
        "ua"
    ],
    "filter-menu": [
        "menu"
    ],
    "io": [
        "dom",
        "event/custom",
        "promise",
        "uri",
        "event/dom"
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
        "dom",
        "event/dom",
        "anim"
    ],
    "overlay": [
        "component/container",
        "component/extension/shim",
        "component/extension/align",
        "component/extension/content-box"
    ],
    "path": [
        "util"
    ],
    "resizable": [
        "dd"
    ],
    "resizable/plugin/proxy": [
        "node",
        "base"
    ],
    "router": [
        "event/dom",
        "uri",
        "event/custom"
    ],
    "scroll-view/base": [
        "anim/timer",
        "component/container",
        "component/extension/content-box"
    ],
    "scroll-view/plugin/pull-to-refresh": [
        "base"
    ],
    "scroll-view/plugin/scrollbar": [
        "component/control",
        "event/gesture/drag"
    ],
    "scroll-view/touch": [
        "scroll-view/base",
        "event/gesture/drag"
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
        "button"
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
    "ua": [
        "util"
    ],
    "uri": [
        "path"
    ],
    "xtemplate": [
        "xtemplate/compiler"
    ],
    "xtemplate/compiler": [
        "xtemplate/runtime"
    ],
    "xtemplate/runtime": [
        "util"
    ]
});
var Feature = S.Feature,
    UA = S.UA,
    win = window,
    isTouchGestureSupported = Feature.isTouchGestureSupported(),
    add = S.add,
    emptyObject = {};

function alias(name, aliasName) {
   var cfg;
   if(typeof name ==="string") {
       cfg = {};
       cfg[name] = aliasName;
   } else {
       cfg = name;
   }
   S.config("alias", cfg);
}

alias('anim', Feature.getCssVendorInfo('transition') ? 'anim/transition' : 'anim/timer');
alias({
    'dom/basic': [
        'dom/base',
        UA.ieMode < 9 ? 'dom/ie' : '',
        Feature.isClassListSupported() ? '' : 'dom/class-list'
    ],
    dom: [
        'dom/basic',
        Feature.isQuerySelectorSupported() ? '' : 'dom/selector'
    ]
});
alias('event/dom', [
    'event/dom/base',
    Feature.isHashChangeSupported() ? '' : 'event/dom/hashchange',
        UA.ieMode < 9 ? 'event/dom/ie' : '',
    Feature.isInputEventSupported() ? '' : 'event/dom/input',
    UA.ie ? '' : 'event/dom/focusin'
]);
if (!isTouchGestureSupported) {
    add('event/gesture/edge-drag', emptyObject);
}

if (!isTouchGestureSupported) {
    add('event/gesture/pinch', emptyObject);
}

if (!isTouchGestureSupported) {
    add('event/gesture/rotate', emptyObject);
}

if (!win.DeviceMotionEvent) {
    add('event/gesture/shake', emptyObject);
}

if (!isTouchGestureSupported) {
    add('event/gesture/swipe', emptyObject);
}

alias('scroll-view', Feature.isTouchGestureSupported() ? 'scroll-view/touch' : 'scroll-view/base');
})(KISSY);