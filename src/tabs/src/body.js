/**
 * @ignore
 * Body for tab panels.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/body", function (S, Component, undefined) {

    var TabBody = Component.Container.extend({

        renderUI: function () {
            var self = this,
                children = self.get("children");
            S.each(children, function (c, i) {
                if (c.isController && c.get("selected")) {
                    self.set("selectedPanelIndex", i);
                    return false;
                }
                return undefined;
            });
        },

        renderChild: function (c) {
            if (this.get('lazyRender')) {
                if (c.isController && !c.get('selected')) {
                    return c;
                }
                if (!c.isController && !c.selected) {
                    return c;
                }
            }
            return TabBody.superclass.renderChild.apply(this, arguments);
        },

        selectPanel: function (showPanel) {
            if (showPanel.isController) {
                showPanel.set("selected", true);
            } else {
                showPanel.selected = true;
            }
            if (this.get('lazyRender')) {
                // lazy render
                this.renderChild(showPanel);
            }
        },

        bindUI: function () {
            var self = this;
            self.on("afterSelectedPanelIndexChange", function (e) {
                var showPanel,
                    children = self.get('children'),
                    hidePanel;
                if (showPanel = children[e.newVal]) {
                    if (hidePanel = children[e.prevVal]) {
                        hidePanel.set("selected", false);
                    }
                    self.selectPanel(showPanel);
                }
            });
        }

    }, {
        ATTRS: {
            selectedPanelIndex: {
            },
            allowTextSelection: {
                value: true
            },
            focusable: {
                value: false
            },
            lazyRender: {},
            handleMouseEvents: {
                value: false
            },
            delegateChildren: {
                value: false
            },
            defaultChildCfg: {
                value: {
                    xclass: 'tabs-panel'
                }
            }
        }
    }, {
        xclass: 'tabs-body'
    });

    return TabBody;
}, {
    requires: ['component/base']
});