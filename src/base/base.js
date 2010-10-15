/**
 * @module  Base
 * @author  lifesinger@gmail.com
 */
KISSY.add('base', function (S) {

    /*
     * Base for class-based component
     */
    function Base(config) {
        initATTRS(this, config);
    }

    /**
     * init attr using constructors ATTRS meta info
     */
    function initATTRS(host, config) {
        var c = host.constructor, attr, attrs, ATTRS = 'ATTRS';

        while (c) {
            if ((attrs = c[ATTRS])) {
                for (attr in attrs) {
                    // 子类上的 ATTRS 配置优先
                    if (attrs.hasOwnProperty(attr) && !host.hasAttr(attr)) {
                        if (config && (attr in config)) {
                            attrs[attr].value = config[attr];
                        }
                        host.addAttr(attr, attrs[attr]);
                    }
                }
            }
            c = c.superclass ? c.superclass.constructor : null;
        }
    }

    S.augment(Base, S.EventTarget, S.Attribute);
    S.Base = Base;
});
