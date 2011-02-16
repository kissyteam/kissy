KISSY.add("uibase", function(S, UIBase,Align,Box,Close,Contrain,Contentbox,Drag,Loading,
    Mask,Position,Shim,Resize,StdMod) {
    S.mix(UIBase,{
        Align:Align,
        Box:Box,
        Close:Close,
        Contrain:Contrain,
        Contentbox:Contentbox,
        Drag:Drag,
        Loading:Loading,
        Mask:Mask,
        Position:Position,
        Shim:Shim,
        Resize:Resize,
        StdMod:StdMod
    });
    return UIBase;
}, {
    requires:["uibase/base",
        "uibase/align",
        "uibase/box",
        "uibase/close",
        "uibase/constrain",
        "uibase/contentbox",
        "uibase/drag",
        "uibase/loading",
        "uibase/mask",
        "uibase/position",
        "uibase/shim",
        "uibase/resize",
        "uibase/stdmod"]
});