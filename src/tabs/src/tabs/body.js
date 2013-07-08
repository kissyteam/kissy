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
                    newIndex = e.newVal,
                    hidePanel;
                if (children[newIndex]) {
                    if (hidePanel = children[e.prevVal]) {
                        hidePanel.set("selected", false);
                    }
                    self.selectPanelByIndex(newIndex);
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

        createChild: function (index) {
            return checkLazy(this, 'createChild', index);
        },

        renderChild: function (index) {
            return checkLazy(this, 'renderChild', index);
        },

        selectPanelByIndex: function (newIndex) {
            this.get('children')[newIndex].set("selected", true);
            if (this.get('lazyRender')) {
                // lazy render
                this.renderChild(newIndex);
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

    function checkLazy(self, method, index) {
        if (self.get('lazyRender')) {
            var c = self.get('children')[index];
            if (!c.get('selected')) {
                return c;
            }
        }
        return TabBody.superclass[method].call(self, index);
    }

    return TabBody;

}, {
    requires: ['component/container']
});