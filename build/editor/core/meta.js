/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Jul 30 19:14
*/
/**
 * Module meta require info for KISSY Editor.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/core/meta", function () {

    var map = {
            "back-color":['../color/btn', './cmd'],
            "local-storage":["../flash-bridge/"],
            "bold":['../font/ui', './cmd'],
            "draft":["../local-storage/", '../menubutton/'],
            "flash":['../flash-common/baseClass', '../flash-common/utils'],
            "font-family":['../font/ui', './cmd'],
            "font-size":['../font/ui', './cmd'],
            "fore-color":['../color/btn', './cmd'],
            "heading":['./cmd'],
            "image":['../button/', '../bubble/', '../contextmenu/', '../dialog-loader/'],
            "indent":['./cmd'],
            "ordered-list":['../list-utils/btn', './cmd'],
            "unordered-list":['../list-utils/btn', './cmd'],
            "italic":['../font/ui', './cmd'],
            "justify-center":['./cmd'],
            "justify-left":['./cmd'],
            "justify-right":['./cmd'],
            "link":['../bubble/', './utils', '../dialog-loader/'],
            "maximize":['./cmd'],
            "multiple-upload":['../dialog-loader/'],
            "outdent":['./cmd'],
            "overlay":['dd', '../focus-fix/'],
            "pageBreak":["../fake-objects/"],
            "removeFormat":['./cmd', '../button/'],
            "resize":['dd'],
            "menubutton":['menubutton'],
            "smiley":['../overlay/'],
            "sourcearea":['../button/'],
            "strike-through":['../font/ui', './cmd'],
            "table":['../dialog-loader/', '../contextmenu/'],
            "underline":['../font/ui', './cmd'],
            "undo":['./btn', './cmd'],
            "contextmenu":['menu', '../focus-fix/'],
            "video":['../flash-common/utils', '../flash-common/baseClass'],
            "xiami-music":['../flash-common/baseClass', '../flash-common/utils']
        },
        m,
        m2,
        map2 = {
            "back-color/cmd":['../color/cmd'],
            "bold/cmd":['../font/cmd'],
            "color/btn":['../button/', '../overlay/', '../dialog-loader/'],
            "color/color-picker/dialog":['../../overlay/'],
            "dent-utils/cmd":['../list-utils/'],
            "flash/dialog":['../flash-common/utils', '../overlay/', '../menubutton/'],
            "flash-common/baseClass":['../contextmenu/', '../bubble/', '../dialog-loader/', './utils'],
            "font/ui":['../button/', '../menubutton/'],
            "font-family/cmd":['../font/cmd'],
            "font-size/cmd":['../font/cmd'],
            "fore-color/cmd":['../color/cmd'],
            "image/dialog":['../overlay/', 'switchable', '../menubutton/'],
            "indent/cmd":['../dent-utils/cmd'],
            "ordered-list/cmd":['../list-utils/cmd'],
            "unordered-list/cmd":['../list-utils/cmd'],
            "italic/cmd":['../font/cmd'],
            "justify-center/cmd":['../justify-utils/cmd'],
            "justify-left/cmd":['../justify-utils/cmd'],
            "justify-right/cmd":['../justify-utils/cmd'],
            "link/dialog":['../overlay/', './utils'],
            "list-utils/btn":['../button/'],
            "list-utils/cmd":['../list-utils/'],
            "multiple-upload/dialog":['../progressbar/', '../overlay/', '../flash-bridge/', '../local-storage/'],
            "outdent/cmd":['../dent-utils/cmd'],
            "strike-through/cmd":['../font/cmd'],
            "table/dialog":['../overlay/', '../menubutton/'],
            "underline/cmd":['../font/cmd'],
            "undo/btn":['../button/'],
            "video/dialog":['../flash/dialog', '../menubutton/'],
            "xiami-music/dialog":['../flash/dialog', '../menubutton/']
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
