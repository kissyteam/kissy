/**
 * common aria for switchable and stop autoplay if necessary
 * @author:yiminghe@gmail.com
 */
KISSY.add("switchable/aria", function(S, DOM, Event, Switchable) {
    DOM = S.DOM;
    Event = S.Event;
    Switchable = S.Switchable;


    var oldIE = !document.documentElement.hasAttribute;
    var hasAttr = oldIE ?
        function(selector, name) {
            name = name.toLowerCase();
            var el = DOM.get(selector);
            var $attr = el.getAttributeNode(name);
            return !!( $attr && $attr.specified );
        }
        :
        function(selector, name) {
            name = name.toLowerCase();
            var el = DOM.get(selector);
            return el.hasAttribute(name);
        };
    Switchable.Plugins.push({
        name:'aria',
        init:function(self) {
            if (!self.config.aria) return;

            var container = self.container;

            Event.on(container, "focusin", _contentFocusin, self);

            Event.on(container, "focusout", _contentFocusout, self);
        }
    });


    function _contentFocusin() {
        this.stop && this.stop();
        /**
         * !TODO
         * tab 到时滚动到当前
         */
    }

    function _contentFocusout() {
        this.start && this.start();
    }

    var default_focus = ["a","input","button","object"];
    var oriTabIndex = "oriTabIndex";
    Switchable.Aria = {

        setTabIndex:function(root, v) {
            root.tabIndex = v;
            DOM.query("*", root).each(function(n) {
                var nodeName = n.nodeName.toLowerCase();
                // a 需要被禁止或者恢复
                if (S.inArray(nodeName, default_focus)) {
                    if (!hasAttr(n, oriTabIndex)) {
                        DOM.attr(n, oriTabIndex, n.tabIndex)
                    }
                    //恢复原来
                    if (v != -1) {
                        n.tabIndex = DOM.attr(n, oriTabIndex);
                    } else {
                        n.tabIndex = v;
                    }
                }
            });
        }
    };

},{
    host:'switchable'
});