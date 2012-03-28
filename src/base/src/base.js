/**
 * @fileOverview attribute management and event in one
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('base', function (S, Attribute, Event) {

    /**
     * @name Base
     * @extends Event.Target
     * @extends Attribute
     * @class <p>
     * A base class which objects requiring attributes and custom event support can
     * extend. attributes configured
     * through the static {@link Base.ATTRS} property for each class
     * in the hierarchy will be initialized by Base.
     * </p>
     */
    function Base(config) {
        var c = this.constructor;

        // define
        while (c) {
            addAttrs(this, c['ATTRS']);
            c = c.superclass ? c.superclass.constructor : null;
        }
        // initial
        initAttrs(this, config);
    }


    /**
     * The default set of attributes which will be available for instances of this class, and
     * their configuration
     *
     * By default if the value is an object literal or an array it will be "shallow" cloned, to
     * protect the default value.
     *
     * @name Base.ATTRS
     * @type Object
     */


    /**
     * see {@link Attribute#set}
     * @name set
     * @memberOf Base#
     * @function
     */


    function addAttrs(host, attrs) {
        if (attrs) {
            for (var attr in attrs) {
                // 子类上的 ATTRS 配置优先
                if (attrs.hasOwnProperty(attr)) {
                    // 父类后加，父类不覆盖子类的相同设置
                    // 属性对象会 merge   a: {y:{getter:fn}}, b:{y:{value:3}}, b extends a => b {y:{value:3}}
                    host.addAttr(attr, attrs[attr], false);
                }
            }
        }
    }

    function initAttrs(host, config) {
        if (config) {
            for (var attr in config) {
                if (config.hasOwnProperty(attr)) {
                    //用户设置会调用 setter/validator 的，但不会触发属性变化事件
                    host.__set(attr, config[attr]);
                }

            }
        }
    }

    S.augment(Base, Event.Target, Attribute);

    Base.Attribute = Attribute;

    S.Base = Base;

    return Base;
}, {
    requires:["base/attribute", "event"]
});
