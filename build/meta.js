/*jshint indent:false, quotmark:false*/
modulex.use(['ua', 'feature'], function(UA, Feature){
var mx = modulex;
mx.config("requires",{
    "attribute": [
        "modulex-util",
        "modulex-event-custom"
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
    "anim/base": [
        "dom",
        "promise",
        "util"
    ],
    "anim/timer": [
        "anim/base",
        "feature"
    ],
    "anim/transition": [
        "anim/base",
        "feature"
    ],
    "base": [
        "attribute"
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
    "io": [
        "util",
        "dom",
        "querystring",
        "event-custom",
        "promise",
        "url",
        "ua",
        "event-dom"
    ],
    "url": [
        "modulex-querystring",
        "modulex-path"
    ],
    "xtemplate": [
        "xtemplate/runtime"
    ]
});
modulex.config('alias', {
    'modulex-attribute': 'attribute'
});
modulex.config('alias', {
    'modulex-dom': 'dom',
    'dom/selector': Feature.isQuerySelectorSupported() ? '' : 'query-selector',
    dom: [
        'dom/base',
            UA.ieMode < 9 ? 'dom/ie' : ''
    ]
});
modulex.config('alias', {
    'modulex-event-base': 'event-base'
});
modulex.config('alias', {
    'modulex-event-custom': 'event-custom'
});
modulex.config('alias', {
    'modulex-feature': 'feature'
});
modulex.config('alias', {
    'anim': Feature.getCssVendorInfo('transition') ? 'anim/transition' : 'anim/timer'
});
modulex.config('alias', {
    'modulex-attribute': 'attribute'
});
modulex.config('alias', {
    'modulex-base': 'base'
});
modulex.config('alias', {
    'modulex-color': 'color'
});
modulex.config('alias', {
    'modulex-dom': 'dom',
    'dom/selector': Feature.isQuerySelectorSupported() ? '' : 'query-selector',
    dom: [
        'dom/base',
            UA.ieMode < 9 ? 'dom/ie' : ''
    ]
});
modulex.config('alias', {
    'modulex-event-base': 'event-base'
});
modulex.config('alias', {
    'modulex-event-custom': 'event-custom'
});
modulex.config('alias', {
    'event-dom': [
        'event-dom/base',
        Feature.isHashChangeSupported() ? '' : 'event-dom/hashchange',
            UA.ieMode < 9 ? 'event-dom/ie' : '',
        Feature.isInputEventSupported() ? '' : 'event-dom/input',
        UA.ie ? '' : 'event-dom/focusin'
    ]
});
modulex.config('alias', {
    'modulex-feature': 'feature'
});
modulex.config('alias', {
    'modulex-path': 'path'
});
modulex.config('alias', {
    'modulex-promise': 'event-custom'
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
modulex.config('alias', {
    'modulex-path': 'path'
});
modulex.config('alias', {
    'modulex-promise': 'event-custom'
});
modulex.config('alias', {
    'modulex-querystring': 'querystring'
});
modulex.config('alias', {
    'modulex-ua': 'ua'
});
modulex.config('alias', {
    'modulex-util': 'util'
});
});