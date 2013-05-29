/**
 * @ignore
 * storage for component
 * @author yiminghe@gmail.com
 */
KISSY.add("component/base/manager", function () {

    var basePriority = 0,
        uis = {
            // 不带前缀 prefixCls
            /*
             "menu" :{
             priority:0,
             constructor:Menu
             }
             */
        };

    function getConstructorByXClass(cls) {
        var cs = cls.split(/\s+/),
            p = -1,
            t,
            i,
            uic,
            ui = null;
        for (i = 0; i < cs.length; i++) {
            uic = uis[cs[i]];
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

    // later registered component has high priority
    function setConstructorByXClass(cls, uic) {
        uis[cls] = {
            constructor: uic,
            priority: basePriority++
        };
    }

    var componentInstances = {};

    /**
     * @class KISSY.Component.Manager
     * @member Component
     * @singleton
     * Manage component metadata.
     */
    var Manager = {

        __instances: componentInstances,

        /**
         * associate id with component
         * @param {String} id
         * @param {KISSY.Component.Controller} component
         */
        addComponent: function (id, component) {
            componentInstances[id] = component;
        },

        /**
         * remove association id with component
         * @param {String} id
         */
        removeComponent: function (id) {
            delete componentInstances[id];
        },

        /**
         * get component by id
         * @param {String} id
         * @return {KISSY.Component.Controller}
         */
        'getComponent': function (id) {
            return componentInstances[id];
        },

        /**
         * Get css class name for this component constructor.
         * @param {Function} constructor Component's constructor.
         * @return {String}
         * @method
         */
        getXClassByConstructor: getXClassByConstructor,
        /**
         * Get component constructor by css class name.
         * @param {String} classNames Class names separated by space.
         * @return {Function}
         * @method
         */
        getConstructorByXClass: getConstructorByXClass,
        /**
         * Associate css class with component constructor.
         * @param {String} className Component's class name.
         * @param {Function} componentConstructor Component's constructor.
         * @method
         */
        setConstructorByXClass: setConstructorByXClass
    };

    return Manager;
});