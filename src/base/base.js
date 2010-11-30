/**
 * @module  Base
 * @author  lifesinger@gmail.com, yiminghe@gmail.com
 */
KISSY.add('base', function (S) {

    /*
     * Base for class-based component
     */
    function Base(config) {
        S.Attribute.call(this);
        var c = this.constructor;

        // define
        while (c) {
            __addAttrs(this, c['ATTRS']);
            c = c.superclass ? c.superclass.constructor : null;
        }

        // initial
        __initAttrs(this, config);
    }

    var __addAttrs = function(host, attrs) {
        if (attrs) {
            for (var attr in attrs) {
                // 子类上的 ATTRS 配置优先
                if (attrs.hasOwnProperty(attr) && !host.hasAttr(attr)) {
                    host.addAttr(attr, attrs[attr]);
                }
            }
        }
    };

    var __initAttrs = function(host, config) {
        if (config) {
            for (var attr in config) {
                if (config.hasOwnProperty(attr))
                    host.__set(attr, config[attr]);
            }
        }
    };

    S.augment(Base, S.EventTarget, S.Attribute);
    S.Base = Base;
});
