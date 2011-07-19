KISSY.add("component/uistore", function() {
    var uis = {
        // 不带前缀 prefixCls
        /*
         "menu" :{
         priority:0,
         ui:Menu
         }
         */
    };

    function getUIByClass(cls) {
        var cs = cls.split(/\s+/),p = -1,ui = null;
        for (var i = 0; i < cs.length; i++) {
            var uic = uis[cs[i]];
            if (uic && uic.priority > p) {
                ui = uic.ui;
            }
        }
        return ui;
    }

    function setUIByClass(cls, uic) {
        uis[cls] = uic;
    }

    return {
        getUIByClass:getUIByClass,
        setUIByClass:setUIByClass
    };
});