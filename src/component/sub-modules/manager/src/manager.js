/**
 * @ignore
 * storage for component
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S) {

    var basePriority = 0,
        Manager,
    // 不带前缀 prefixCls
    /*
     'menu' :{
     constructor:Menu
     }
     */
        uis = {},
        componentInstances = {};

    /**
     * @class KISSY.Component.Manager
     * @member Component
     * @singleton
     * Manage component metadata.
     */
    Manager = {

        __instances: componentInstances,

        /**
         * associate id with component
         * @param {String} id
         * @param {KISSY.Component.Control} component
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
         * @return {KISSY.Component.Control}
         */
        'getComponent': function (id) {
            return componentInstances[id];
        },

        /**
         * Create a component instance using json with xclass.
         * @param {Object|KISSY.Component.Control} component Component's json notation with xclass attribute.
         * @param {String} component.xclass Component to be newed 's xclass.
         * @param {KISSY.Component.Control} parent Component From which new component generated will inherit prefixCls
         * if component 's prefixCls is undefined.
         * @member KISSY.Component
         * @return KISSY.Component.Control
         *
         *  for example:
         *
         *      create({
     *          xclass:'menu',
     *          children:[{
     *              xclass:'menuitem',
     *              content:"1"
     *          }]
     *      })
         */
        'createComponent': function (component, parent) {
            var ChildConstructor,
                xclass;
            if (component) {
                if (!component.isControl && parent) {
                    if (!component.prefixCls) {
                        component.prefixCls = parent.get('prefixCls');
                    }
                    if (!component.xclass && component.prefixXClass) {
                        component.xclass = component.prefixXClass;
                        if (component.xtype) {
                            component.xclass += '-' + component.xtype;
                        }
                    }
                }
                if (!component.isControl && (xclass = component.xclass)) {
                    ChildConstructor = Manager.getConstructorByXClass(xclass);
                    if (!ChildConstructor) {
                        S.error('can not find class by xclass desc : ' + xclass);
                    }
                    component = new ChildConstructor(component);
                }
                if (component.isControl && parent) {
                    component.setInternal('parent', parent);
                }
            }
            return component;
        },
        /**
         * Get component constructor by css class name.
         * @param {String} classNames Class names separated by space.
         * @return {Function}
         * @method
         */
        getConstructorByXClass: function (classNames) {
            var cs = classNames.split(/\s+/),
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
        },
        /**
         * Associate css class with component constructor.
         * @param {String} className Component's class name.
         * @param {Function} ComponentConstructor Component's constructor.
         * @method
         */
        setConstructorByXClass: function (className, ComponentConstructor) {
            uis[className] = {
                constructor: ComponentConstructor,
                priority: basePriority++
            };
        }
    };

    return Manager;
});