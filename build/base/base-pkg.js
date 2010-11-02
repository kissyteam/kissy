/*
Copyright 2010, KISSY UI Library v1.1.5
MIT Licensed
build time: Nov 2 13:10
*/
/**
 * @module  Base
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
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

        // define
        while (c) {
            if ((attrs = c[ATTRS])) {
                for (attr in attrs) {
                    // 子类上的 ATTRS 配置优先
                    if (attrs.hasOwnProperty(attr) && !host.hasAttr(attr)) {
                        host.addAttr(attr, attrs[attr]);
                    }
                }
            }
            c = c.superclass ? c.superclass.constructor : null;
        }

        // initial
        if (config) {
            for (attr in config) {
                if (config.hasOwnProperty(attr))
                    host.__set(attr, config[attr]);
            }
        }
    }

    S.augment(Base, S.EventTarget, S.Attribute);
    S.Base = Base;
});
