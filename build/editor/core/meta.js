/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 31 22:01
*/
KISSY.add("editor/core/meta", function () {

    var map = {
            "backColor":['../color/btn', './cmd'],
            "localStorage":["../flashBridge/"],
            "bold":['../font/ui', './cmd'],
            "draft":["../localStorage/", '../select/'],
            "flash":['../flashCommon/baseClass', '../flashCommon/utils'],
            "fontFamily":['../font/ui', './cmd'],
            "fontSize":['../font/ui', './cmd'],
            "foreColor":['../color/btn', './cmd'],
            "heading":['./cmd'],
            "image":['../button/', '../bubbleview/', '../contextmenu/', '../dialogLoader/'],
            "indent":['./cmd'],
            "insertOrderedList":['../listUtils/btn', './cmd'],
            "insertUnorderedList":['../listUtils/btn', './cmd'],
            "italic":['../font/ui', './cmd'],
            "justifyCenter":['./cmd'],
            "justifyLeft":['./cmd'],
            "justifyRight":['./cmd'],
            "link":['../bubbleview/', './utils', '../dialogLoader/'],
            "maximize":['./cmd'],
            "multipleUpload":['../dialogLoader/'],
            "outdent":['./cmd'],
            "overlay":['./focus', 'dd'],
            "pageBreak":["../fakeObjects/"],
            "removeFormat":['./cmd', '../button/'],
            "resize":['dd'],
            "smiley":['../overlay/'],
            "sourceArea":['../button/'],
            "strikeThrough":['../font/ui', './cmd'],
            "table":['../dialogLoader/', '../contextmenu/'],
            "underline":['../font/ui', './cmd'],
            "undo":['./btn', './cmd'],
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
            "flash/dialog":['../flashCommon/utils', '../overlay/', '../select/'],
            "flashCommon/baseClass":['../contextmenu/', '../bubbleview/', '../dialogLoader/', './utils'],
            "font/ui":['../button/', '../select/'],
            "fontFamily/cmd":['../font/cmd'],
            "fontSize/cmd":['../font/cmd'],
            "foreColor/cmd":['../color/cmd'],
            "image/dialog":['../overlay/', 'switchable', '../select/'],
            "indent/cmd":['../dentUtils/cmd'],
            "insertOrderedList/cmd":['../listUtils/cmd'],
            "insertUnorderedList/cmd":['../listUtils/cmd'],
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
            "table/dialog":['../overlay/', '../select/'],
            "underline/cmd":['../font/cmd'],
            "undo/btn":['../button/'],
            "video/dialog":['../flash/dialog', '../select/'],
            "xiamiMusic/dialog":['../flash/dialog', '../select/']
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
