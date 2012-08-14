/**
 * @fileOverview KISSY Tabs Component.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs", function (S, Component) {
    var Tabs = Component.Controller.extend({

        initializer: function () {
            var self = this,
                items,
                bar = {
                    xclass: 'tabs-bar',
                    changeType: self.get("changeType"),
                    children: []
                },
                body = {
                    xclass: 'tabs-body',
                    children: []
                },
                barChildren = bar.children,
                panels = body.children;

            if (items = self.get("items")) {
                S.each(items, function (item) {
                    barChildren.push({
                        xclass: 'tabs-tab',
                        content: item.title,
                        selected: item.selected
                    });
                    panels.push({
                        xclass: 'tabs-panel',
                        content: item.content,
                        selected: item.selected
                    });
                });
            }

            self.set("bar", bar);
            self.set("body", body);
        },



        renderUI: function () {

            var self = this,
                barOrientation = self.get("barOrientation"),
                el = self.get("el"),
                body = self.get("body"),
                bar = self.get("bar");
            bar.set("render", el);
            body.set("render", el);

            if (barOrientation) {
                body.render();
                bar.render();
            } else {
                bar.render();
                body.render();
            }

            var barChildren = bar.get("children");
            S.each(barChildren, function (barChild, i) {
                if (barChild.get("selected")) {
                    body.setSelectedPanelByIndexInternal(i);
                    bar.set("selectedItem", barChild);
                }
            });
        },

        bindUI: function () {
            var self = this,
                body = self.get("body"),
                bar = self.get("bar");

            bar.on("afterSelectedItemChange", function (e) {
                body.setSelectedPanelByIndexInternal(S.indexOf(e.newVal, bar.get("children")));
            });
        }

    }, {
        ATTRS: {

            // helper attribute
            items: {

            },
            changeType: {
                value: "click"
            },


            // real attribute
            handleMouseEvents: {
                value: false
            },
            allowTextSelection: {
                value: true
            },
            focusable: {
                value: false
            },
            bar: {
                setter: function (v) {
                    if (!(v instanceof Component.Controller)) {
                        return Component.create(v);
                    }
                },
                valueFn: function () {
                    return Component.create({
                        xclass: 'tabs-bar'
                    });
                }
            },
            body: {
                setter: function (v) {
                    if (!(v instanceof Component.Controller)) {
                        return Component.create(v);
                    }
                },
                valueFn: function () {
                    return Component.create({
                        xclass: 'tabs-body'
                    });
                }
            },
            barOrientation: {
                value: 0
            }
        }
    }, {
        xclass: 'tabs'
    });

    Tabs.Orientation = {
        TOP: 0,
        BOTTOM: 1
    };

    Tabs.changeType = {
        CLICK: "click",
        MOUSE: "mouseover"
    };

    return Tabs;
}, {
    requires: ['component', 'tabs/bar', 'tabs/body', 'tabs/tab', 'tabs/panel']
});