/**
 * @fileOverview storage for component's css
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uistore", function(S) {
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

    function getClsByUI(constructor) {
        for (var u in uis) {
            var ui = uis[u];
            if (ui.ui == constructor) {
                return u;
            }
        }
        return 0;
    }

    function getClsByInstance(self) {
        return getClsByUI(self.constructor);
    }

    function setUIByClass(cls, uic) {
        uis[cls] = uic;
    }


    function getCls(cls) {
        var cs = S.trim(cls).split(/\s+/);
        for (var i = 0; i < cs.length; i++) {
            if (cs[i]) {
                cs[i] = this.get("prefixCls") + cs[i];
            }
        }
        return cs.join(" ");
    }

    return {
        getCls:getCls,
        getClsByUI:getClsByUI,
        getClsByInstance:getClsByInstance,
        getUIByClass:getUIByClass,
        setUIByClass:setUIByClass,
        PRIORITY:{
            LEVEL1:10,
            LEVEL2:20,
            LEVEL3:30,
            LEVEL4:40,
            LEVEL5:50,
            LEVEL6:60
        }
    };
});