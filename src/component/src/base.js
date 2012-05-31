/**
 * Setup component namespace.
 * @author yiminghe@gmail.com
 */
KISSY.add("component/base", function (S, UIBase, UIStore) {
    /**
     * @name Component
     * @namespace
     */
    var Component = {
        UIStore:UIStore,
        UIBase:UIBase
    };

    function extend() {
        var args = S.makeArray(arguments),
            ret,
            last = args[args.length - 1];
        args.unshift(this);
        if (last.xclass) {
            args.pop();
            args.push(last.xclass);
        }
        ret = UIBase.create.apply(UIBase, args);
        if (last.xclass) {
            UIStore.setUIConstructorByCssClass(last.xclass, {
                ui:ret,
                priority:last.priority
            });
        }
        ret.extend = extend;
        return ret;
    }

    /**
     * Shortcut for {@link Component.UIBase.create}.
     * @function
     */
    Component.define = function () {
        var args = S.makeArray(arguments), cls;
        cls = args.shift();
        return extend.apply(cls, args);
    }

    return Component;
}, {
    requires:['./uibase', './uistore']
});