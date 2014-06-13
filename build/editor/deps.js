/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:58
*/
/*jshint indent:false, quotmark:false*/
KISSY.use(['ua', 'feature'], function(S, UA, Feature){
S.config("requires",{
    "editor": [
        "util",
        "logger-manager",
        "node",
        "xtemplate/runtime",
        "ua",
        "html-parser",
        "component/control",
        "dom"
    ],
    "editor/plugin/back-color": [
        "editor/plugin/color/btn",
        "editor/plugin/back-color/cmd"
    ],
    "editor/plugin/back-color/cmd": [
        "editor/plugin/color/cmd"
    ],
    "editor/plugin/bold": [
        "editor/plugin/font/ui",
        "editor/plugin/bold/cmd"
    ],
    "editor/plugin/bold/cmd": [
        "editor/plugin/font/cmd"
    ],
    "editor/plugin/bubble": [
        "overlay",
        "editor"
    ],
    "editor/plugin/button": [
        "editor",
        "button"
    ],
    "editor/plugin/checkbox-source-area": [
        "editor"
    ],
    "editor/plugin/code": [
        "editor/plugin/button",
        "editor/plugin/dialog-loader"
    ],
    "editor/plugin/code/dialog": [
        "menubutton",
        "editor/plugin/dialog"
    ],
    "editor/plugin/color/btn": [
        "editor/plugin/button",
        "editor/plugin/overlay",
        "editor/plugin/dialog-loader"
    ],
    "editor/plugin/color/cmd": [
        "editor"
    ],
    "editor/plugin/color/dialog": [
        "editor/plugin/dialog"
    ],
    "editor/plugin/contextmenu": [
        "menu",
        "editor/plugin/focus-fix",
        "event/dom"
    ],
    "editor/plugin/dent-cmd": [
        "editor",
        "editor/plugin/list-utils"
    ],
    "editor/plugin/dialog": [
        "overlay",
        "editor/plugin/focus-fix",
        "dd/plugin/constrain",
        "component/plugin/drag"
    ],
    "editor/plugin/dialog-loader": [
        "editor",
        "overlay"
    ],
    "editor/plugin/draft": [
        "json",
        "event/dom",
        "editor/plugin/local-storage",
        "editor/plugin/menubutton"
    ],
    "editor/plugin/drag-upload": [
        "editor",
        "event/dom"
    ],
    "editor/plugin/element-path": [
        "editor"
    ],
    "editor/plugin/fake-objects": [
        "editor"
    ],
    "editor/plugin/flash": [
        "editor/plugin/flash-common/base-class",
        "editor/plugin/fake-objects",
        "editor/plugin/button"
    ],
    "editor/plugin/flash/dialog": [
        "editor/plugin/flash-common/utils",
        "editor/plugin/dialog",
        "editor/plugin/menubutton"
    ],
    "editor/plugin/flash-bridge": [
        "editor",
        "swf",
        "event/custom"
    ],
    "editor/plugin/flash-common/base-class": [
        "editor/plugin/flash-common/utils",
        "base",
        "editor/plugin/dialog-loader",
        "editor/plugin/bubble",
        "editor/plugin/contextmenu"
    ],
    "editor/plugin/flash-common/utils": [
        "swf",
        "dom",
        "node"
    ],
    "editor/plugin/focus-fix": [
        "editor"
    ],
    "editor/plugin/font/cmd": [
        "editor"
    ],
    "editor/plugin/font/ui": [
        "editor/plugin/button",
        "editor/plugin/menubutton"
    ],
    "editor/plugin/font-family": [
        "editor/plugin/font/ui",
        "editor/plugin/font-family/cmd"
    ],
    "editor/plugin/font-family/cmd": [
        "editor/plugin/font/cmd"
    ],
    "editor/plugin/font-size": [
        "editor/plugin/font/ui",
        "editor/plugin/font-size/cmd"
    ],
    "editor/plugin/font-size/cmd": [
        "editor/plugin/font/cmd"
    ],
    "editor/plugin/fore-color": [
        "editor/plugin/color/btn",
        "editor/plugin/fore-color/cmd"
    ],
    "editor/plugin/fore-color/cmd": [
        "editor/plugin/color/cmd"
    ],
    "editor/plugin/heading": [
        "editor/plugin/menubutton",
        "editor/plugin/heading/cmd"
    ],
    "editor/plugin/heading/cmd": [
        "editor"
    ],
    "editor/plugin/image": [
        "editor/plugin/button",
        "editor/plugin/bubble",
        "editor/plugin/contextmenu",
        "editor/plugin/dialog-loader"
    ],
    "editor/plugin/image/dialog": [
        "io",
        "editor/plugin/dialog",
        "tabs",
        "editor/plugin/menubutton"
    ],
    "editor/plugin/indent": [
        "editor/plugin/indent/cmd",
        "editor/plugin/button"
    ],
    "editor/plugin/indent/cmd": [
        "editor/plugin/dent-cmd"
    ],
    "editor/plugin/italic": [
        "editor/plugin/font/ui",
        "editor/plugin/italic/cmd"
    ],
    "editor/plugin/italic/cmd": [
        "editor/plugin/font/cmd"
    ],
    "editor/plugin/justify-center": [
        "editor/plugin/justify-center/cmd",
        "editor/plugin/button"
    ],
    "editor/plugin/justify-center/cmd": [
        "editor/plugin/justify-cmd"
    ],
    "editor/plugin/justify-cmd": [
        "editor"
    ],
    "editor/plugin/justify-left": [
        "editor/plugin/justify-left/cmd",
        "editor/plugin/button"
    ],
    "editor/plugin/justify-left/cmd": [
        "editor/plugin/justify-cmd"
    ],
    "editor/plugin/justify-right": [
        "editor/plugin/justify-right/cmd",
        "editor/plugin/button"
    ],
    "editor/plugin/justify-right/cmd": [
        "editor/plugin/justify-cmd"
    ],
    "editor/plugin/link": [
        "editor/plugin/button",
        "editor/plugin/bubble",
        "editor/plugin/link/utils",
        "editor/plugin/dialog-loader"
    ],
    "editor/plugin/link/dialog": [
        "editor/plugin/dialog",
        "editor/plugin/link/utils"
    ],
    "editor/plugin/link/utils": [
        "editor"
    ],
    "editor/plugin/list-utils": [
        "node",
        "dom",
        "ua"
    ],
    "editor/plugin/list-utils/btn": [
        "editor/plugin/button",
        "editor/plugin/menubutton"
    ],
    "editor/plugin/list-utils/cmd": [
        "editor",
        "editor/plugin/list-utils"
    ],
    "editor/plugin/local-storage": [
        "overlay",
        "editor/plugin/flash-bridge"
    ],
    "editor/plugin/maximize": [
        "editor/plugin/maximize/cmd",
        "editor/plugin/button"
    ],
    "editor/plugin/maximize/cmd": [
        "editor",
        "event/dom"
    ],
    "editor/plugin/menubutton": [
        "editor",
        "menubutton"
    ],
    "editor/plugin/ordered-list": [
        "editor/plugin/list-utils/btn",
        "editor/plugin/ordered-list/cmd"
    ],
    "editor/plugin/ordered-list/cmd": [
        "editor/plugin/list-utils/cmd"
    ],
    "editor/plugin/outdent": [
        "editor/plugin/button",
        "editor/plugin/outdent/cmd"
    ],
    "editor/plugin/outdent/cmd": [
        "editor/plugin/dent-cmd"
    ],
    "editor/plugin/overlay": [
        "overlay",
        "editor/plugin/focus-fix"
    ],
    "editor/plugin/page-break": [
        "editor/plugin/fake-objects",
        "editor/plugin/button"
    ],
    "editor/plugin/preview": [
        "editor/plugin/button"
    ],
    "editor/plugin/progressbar": [
        "base",
        "util",
        "node"
    ],
    "editor/plugin/remove-format": [
        "editor/plugin/button",
        "editor/plugin/remove-format/cmd"
    ],
    "editor/plugin/remove-format/cmd": [
        "editor"
    ],
    "editor/plugin/resize": [
        "dd",
        "node",
        "util"
    ],
    "editor/plugin/separator": [
        "node"
    ],
    "editor/plugin/smiley": [
        "editor/plugin/overlay",
        "editor/plugin/button"
    ],
    "editor/plugin/source-area": [
        "editor/plugin/button"
    ],
    "editor/plugin/strike-through": [
        "editor/plugin/font/ui",
        "editor/plugin/strike-through/cmd"
    ],
    "editor/plugin/strike-through/cmd": [
        "editor/plugin/font/cmd"
    ],
    "editor/plugin/table": [
        "editor/plugin/dialog-loader",
        "editor/plugin/contextmenu",
        "editor/plugin/button"
    ],
    "editor/plugin/table/dialog": [
        "editor/plugin/dialog",
        "editor/plugin/menubutton"
    ],
    "editor/plugin/underline": [
        "editor/plugin/font/ui",
        "editor/plugin/underline/cmd"
    ],
    "editor/plugin/underline/cmd": [
        "editor/plugin/font/cmd"
    ],
    "editor/plugin/undo": [
        "editor/plugin/undo/btn",
        "editor/plugin/undo/cmd"
    ],
    "editor/plugin/undo/btn": [
        "editor/plugin/button"
    ],
    "editor/plugin/undo/cmd": [
        "editor"
    ],
    "editor/plugin/unordered-list": [
        "editor/plugin/list-utils/btn",
        "editor/plugin/unordered-list/cmd"
    ],
    "editor/plugin/unordered-list/cmd": [
        "editor/plugin/list-utils/cmd"
    ],
    "editor/plugin/video": [
        "editor/plugin/flash-common/base-class",
        "editor/plugin/fake-objects",
        "editor/plugin/button"
    ],
    "editor/plugin/video/dialog": [
        "io",
        "editor/plugin/flash/dialog"
    ],
    "editor/plugin/word-filter": [
        "html-parser",
        "util",
        "node",
        "ua"
    ],
    "editor/plugin/xiami-music": [
        "editor/plugin/flash-common/base-class",
        "editor/plugin/fake-objects",
        "editor/plugin/button"
    ],
    "editor/plugin/xiami-music/dialog": [
        "editor/plugin/flash/dialog"
    ]
});
});
