/**
 * @fileOverview storage for component's css
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uistore", function (S) {
    var uis = {
        // 不带前缀 prefixCls
        /*
         "menu" :{
         priority:0,
         ui:Menu
         }
         */
    };

    function getUIConstructorByCssClass(cls) {
        var cs = cls.split(/\s+/), p = -1, ui = null;
        for (var i = 0; i < cs.length; i++) {
            var uic = uis[cs[i]];
            if (uic && uic.priority > p) {
                ui = uic.ui;
            }
        }
        return ui;
    }

    function getCssClassByUIConstructor(constructor) {
        for (var u in uis) {
            var ui = uis[u];
            if (ui.ui == constructor) {
                return u;
            }
        }
        return 0;
    }

    function setUIConstructorByCssClass(cls, uic) {
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

    /**
     * @name UIStore
     * @memberOf Component
     */
    return {
        getCls:getCls,
        /**
         * Get css class name for this component constructor.
         * @param {Function} constructor Component's constructor.
         * @type {Function}
         * @return {String}
         */
        getCssClassByUIConstructor:getCssClassByUIConstructor,
        /**
         * Get component constructor by css class name.
         * @param {String} classNames Class names separated by space.
         * @type {Function}
         * @return {Function}
         */
        getUIConstructorByCssClass:getUIConstructorByCssClass,
        /**
         * Associate css class with component constructor.
         * @type {Function}
         * @param {String} className Component's class name.
         * @param {Function} componentConstructor Component's constructor.
         */
        setUIConstructorByCssClass:setUIConstructorByCssClass,

        /**
         * Component's constructor's priority enum.
         * Used for getCssClassByUIConstructor, when multiple component constructors are found.
         * @type Object
         */
        PRIORITY:{
            LEVEL1:10,
            LEVEL2:20,
            LEVEL3:30,
            LEVEL4:40,
            "LEVEL5":50,
            "LEVEL6":60
        }
    };
});