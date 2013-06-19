/**
 * @ignore
 * Body for tab panels.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/body", function (S, Container, Extension, undefined) {

    var TabBody = Container.extend({

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
        },

        syncUI: function () {
            var self = this,
                children = self.get("children");
            S.each(children, function (c, i) {
                if (c.get("selected")) {
                    self.set("selectedPanelIndex", i);
                    return false;
                }
                return undefined;
            });
        },

        renderChild: function (index) {
            if (this.get('lazyRender')) {
                var c = this.get('children')[index];
                if (!c.get('selected')) {
                    return c;
                }
            }
            return TabBody.superclass.renderChild.apply(this, arguments);
        },

        selectPanel: function (showPanel) {
            showPanel.set("selected", true);
            if (this.get('lazyRender')) {
                // lazy render
                this.renderChild(showPanel);
            }
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
            lazyRender: {
            },
            handleMouseEvents: {
                value: false
            },
            defaultChildCfg: {
                value: {
                    xclass: 'tabs-panel'
                }
            }
        },
        xclass: 'tabs-body'
    });

    return TabBody;

}, {
    requires: ['component/container']
});