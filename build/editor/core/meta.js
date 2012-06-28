/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 28 20:23
*/
/**
 * Module meta require info for KISSY Editor.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/core/meta", function () {

    var map = {
            "backColor":['../color/btn', './cmd'],
            "localStorage":["../flashBridge/"],
            "bold":['../font/ui', './cmd'],
            "draft":["../localStorage/", '../menubutton/'],
            "flash":['../flashCommon/baseClass', '../flashCommon/utils'],
            "fontFamily":['../font/ui', './cmd'],
            "fontSize":['../font/ui', './cmd'],
            "foreColor":['../color/btn', './cmd'],
            "heading":['./cmd'],
            "image":['../button/', '../bubble/', '../contextmenu/', '../dialogLoader/'],
            "indent":['./cmd'],
            "orderedList":['../listUtils/btn', './cmd'],
            "unorderedList":['../listUtils/btn', './cmd'],
            "italic":['../font/ui', './cmd'],
            "justifyCenter":['./cmd'],
            "justifyLeft":['./cmd'],
            "justifyRight":['./cmd'],
            "link":['../bubble/', './utils', '../dialogLoader/'],
            "maximize":['./cmd'],
            "multipleUpload":['../dialogLoader/'],
            "outdent":['./cmd'],
            "overlay":['dd', '../focusFix/'],
            "pageBreak":["../fakeObjects/"],
            "removeFormat":['./cmd', '../button/'],
            "resize":['dd'],
            "menubutton":['menubutton'],
            "smiley":['../overlay/'],
            "sourceArea":['../button/'],
            "strikeThrough":['../font/ui', './cmd'],
            "table":['../dialogLoader/', '../contextmenu/'],
            "underline":['../font/ui', './cmd'],
            "undo":['./btn', './cmd'],
            "contextmenu":['menu', '../focusFix/'],
            "video":['../flashCommon/utils', '../flashCommon/baseClass'],
            "xiamiMusic":['../flashCommon/baseClass', '../flashCommon/utils']
        },
        m,
        m2,
        map2 = {
            "backColor/cmd":['../color/cmd'],
            "bold/cmd":['../font/cmd'],
            "color/btn":['../button/', '../overlay/', '../dialogLoader/'],
            "color/colorPicker/dialog":['../../overlay/'],
            "dentUtils/cmd":['../listUtils/'],
            "flash/dialog":['../flashCommon/utils', '../overlay/', '../menubutton/'],
            "flashCommon/baseClass":['../contextmenu/', '../bubble/', '../dialogLoader/', './utils'],
            "font/ui":['../button/', '../menubutton/'],
            "fontFamily/cmd":['../font/cmd'],
            "fontSize/cmd":['../font/cmd'],
            "foreColor/cmd":['../color/cmd'],
            "image/dialog":['../overlay/', 'switchable', '../menubutton/'],
            "indent/cmd":['../dentUtils/cmd'],
            "orderedList/cmd":['../listUtils/cmd'],
            "unorderedList/cmd":['../listUtils/cmd'],
            "italic/cmd":['../font/cmd'],
            "justifyCenter/cmd":['../justifyUtils/cmd'],
            "justifyLeft/cmd":['../justifyUtils/cmd'],
            "justifyRight/cmd":['../justifyUtils/cmd'],
            "link/dialog":['../overlay/', './utils'],
            "listUtils/btn":['../button/'],
            "listUtils/cmd":['../listUtils/'],
            "multipleUpload/dialog":['../progressbar/', '../overlay/', '../flashBridge/', '../localStorage/'],
            "outdent/cmd":['../dentUtils/cmd'],
            "strikeThrough/cmd":['../font/cmd'],
            "table/dialog":['../overlay/', '../menubutton/'],
            "underline/cmd":['../font/cmd'],
            "undo/btn":['../button/'],
            "video/dialog":['../flash/dialog', '../menubutton/'],
            "xiamiMusic/dialog":['../flash/dialog', '../menubutton/']
        }, newMap = {};

    for (m in map) {
        m2 = "editor/plugin/" + m + "/index";
        newMap[m2] = {
            requires:map[m]
        };
    }

    for (m in map2) {
        m2 = "editor/plugin/" + m;
        newMap[m2] = {
            requires:map2[m]
        };
    }

    KISSY.add(newMap);

});
