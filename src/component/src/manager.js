/**
 * @fileOverview storage for component's css
 * @author yiminghe@gmail.com
 */
KISSY.add("component/manager", function (S) {
    var uis = {
        // 不带前缀 prefixCls
        /*
         "menu" :{
         priority:0,
         constructor:Menu
         }
         */
    };

    function getConstructorByXClass(cls) {
        var cs = cls.split(/\s+/), p = -1, t, ui = null;
        for (var i = 0; i < cs.length; i++) {
            var uic = uis[cs[i]];
            if (uic && (t = uic.priority) > p) {
                p = t;
                ui = uic.constructor;
            }
        }
        return ui;
    }

    function getXClassByConstructor(constructor) {
        for (var u in uis) {
            var ui = uis[u];
            if (ui.constructor == constructor) {
                return u;
            }
        }
        return 0;
    }

    function setConstructorByXClass(cls, uic) {
        if (S.isFunction(uic)) {
            uis[cls] = {
                constructor:uic,
                priority:0
            };
        } else {
            uic.priority = uic.priority || 0;
            uis[cls] = uic;
        }
    }


    function getCssClassWithPrefix(cls) {
        var cs = S.trim(cls).split(/\s+/);
        for (var i = 0; i < cs.length; i++) {
            if (cs[i]) {
                cs[i] = this.get("prefixCls") + cs[i];
            }
        }
        return cs.join(" ");
    }

    /**
     * @name Manager
     * @namespace
     * @memberOf Component
     */
    var Manager = /** @lends Component.Manager */{
        getCssClassWithPrefix:getCssClassWithPrefix,
        /**
         * Get css class name for this component constructor.
         * @param {Function} constructor Component's constructor.
         * @type {Function}
         * @return {String}
         * @function
         */
        getXClassByConstructor:getXClassByConstructor,
        /**
         * Get component constructor by css class name.
         * @param {String} classNames Class names separated by space.
         * @type {Function}
         * @return {Function}
         * @function
         */
        getConstructorByXClass:getConstructorByXClass,
        /**
         * Associate css class with component constructor.
         * @type {Function}
         * @param {String} className Component's class name.
         * @param {Function} componentConstructor Component's constructor.
         * @function
         */
        setConstructorByXClass:setConstructorByXClass
    };

    Manager.getCssClassWithPrefix = getCssClassWithPrefix;

    return Manager;
});