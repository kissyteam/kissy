/**
 * @ignore
 * common render for node
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Container = require('component/container');
    var TreeNodeTpl = require('./node-xtpl');
    var ContentRenderExtension = require('component/extension/content-render');

    var SELECTED_CLS = 'selected',
        COMMON_EXPAND_EL_CLS = 'expand-icon-{t}',
        EXPAND_ICON_EL_FILE_CLS = [
            COMMON_EXPAND_EL_CLS
        ].join(' '),
        EXPAND_ICON_EL_FOLDER_EXPAND_CLS = [
            COMMON_EXPAND_EL_CLS + 'minus'
        ].join(' '),
        EXPAND_ICON_EL_FOLDER_COLLAPSE_CLS = [
            COMMON_EXPAND_EL_CLS + 'plus'
        ].join(' '),
        ICON_EL_FILE_CLS = [
            'file-icon'
        ].join(' '),
        ICON_EL_FOLDER_EXPAND_CLS = [
            'expanded-folder-icon'
        ].join(' '),
        ICON_EL_FOLDER_COLLAPSE_CLS = [
            'collapsed-folder-icon'
        ].join(' '),
        ROW_EL_CLS = 'row',
        CHILDREN_CLS = 'children',
        CHILDREN_CLS_L = 'lchildren',
        CHECK_CLS = 'checked',
        ALL_STATES_CLS = 'checked0 checked1 checked2';

    return Container.getDefaultRender().extend([ContentRenderExtension], {

        beforeCreateDom: function (renderData, childrenElSelectors) {
            S.mix(renderData.elAttrs, {
                role: 'tree-node',
                'aria-labelledby': 'ks-content' + renderData.id,
                'aria-expanded': renderData.expanded ? 'true' : 'false',
                'aria-selected': renderData.selected ? 'true' : 'false',
                'aria-level': renderData.depth,
                'title': renderData.tooltip
            });
            S.mix(childrenElSelectors, {
                expandIconEl: '#ks-tree-node-expand-icon-{id}',
                rowEl: '#ks-tree-node-row-{id}',
                iconEl: '#ks-tree-node-icon-{id}',
                childrenEl: '#ks-tree-node-children-{id}',
                checkIconEl: '#ks-tree-node-checked-{id}'
            });
        },

        refreshCss: function (isNodeSingleOrLast, isNodeLeaf) {
            var self = this,
                control = self.control,
                iconEl = control.get('iconEl'),
                iconElCss,
                expandElCss,
                expandIconEl = control.get('expandIconEl'),
                childrenEl = control.get('childrenEl');

            if (isNodeLeaf) {
                iconElCss = ICON_EL_FILE_CLS;
                expandElCss = EXPAND_ICON_EL_FILE_CLS;
            } else {
                var expanded = control.get('expanded');
                if (expanded) {
                    iconElCss = ICON_EL_FOLDER_EXPAND_CLS;
                    expandElCss = EXPAND_ICON_EL_FOLDER_EXPAND_CLS;
                } else {
                    iconElCss = ICON_EL_FOLDER_COLLAPSE_CLS;
                    expandElCss = EXPAND_ICON_EL_FOLDER_COLLAPSE_CLS;
                }
            }

            iconEl[0].className = self.getBaseCssClasses(iconElCss);
            expandIconEl[0].className = self.getBaseCssClasses(
                S.substitute(expandElCss, {
                    't': isNodeSingleOrLast ? 'l' : 't'
                })
            );
            childrenEl[0].className =
                self.getBaseCssClasses((isNodeSingleOrLast ?
                    CHILDREN_CLS_L : CHILDREN_CLS));
        },

        _onSetExpanded: function (v) {
            var self = this,
                childrenEl = self.control.get('childrenEl');
            childrenEl[v ? 'show' : 'hide']();
            self.el.setAttribute('aria-expanded', v);
        },

        _onSetSelected: function (v) {
            var self = this,
                rowEl = self.control.get('rowEl');
            rowEl[v ? 'addClass' : 'removeClass'](self.getBaseCssClasses(SELECTED_CLS));
            self.el.setAttribute('aria-selected', v);
        },

        '_onSetDepth': function (v) {
            this.el.setAttribute('aria-level', v);
        },

        _onSetCheckState: function (s) {
            var self = this,
                checkCls = self.getBaseCssClasses(CHECK_CLS).split(/\s+/).join(s + ' ') + s,
                checkIconEl = self.control.get('checkIconEl');
            checkIconEl.removeClass(self.getBaseCssClasses(ALL_STATES_CLS))
                .addClass(checkCls);
        },

        getChildrenContainerEl: function () {
            return this.control.get('childrenEl');
        }
    }, {
        ATTRS: {
            contentTpl: {
                value: TreeNodeTpl
            }
        },

        HTML_PARSER: {
            rowEl: function (el) {
                return el.one('.' + this.getBaseCssClass(ROW_EL_CLS));
            },
            childrenEl: function (el) {
                return el.one('.' + this.getBaseCssClass(CHILDREN_CLS));
            },
            isLeaf: function (el) {
                var self = this;
                if (el.hasClass(self.getBaseCssClass('leaf'))) {
                    return true;
                } else if (el.hasClass(self.getBaseCssClass('folder'))) {
                    return false;
                }
                return undefined;
            },
            expanded: function (el) {
                return el.one('.' + this.getBaseCssClass(CHILDREN_CLS))
                    .css('display') !== 'none';
            },
            expandIconEl: function (el) {
                return el.one('.' + this.getBaseCssClass('expand-icon'));
            },
            checkState: function (el) {
                var checkIconEl = el.one('.' + this.getBaseCssClass(CHECK_CLS));
                if (checkIconEl) {
                    var allStates = ALL_STATES_CLS.split(/\s+/);
                    for (var i = 0; i < allStates.length; i++) {
                        if (checkIconEl.hasClass(this.getBaseCssClass(allStates[i]))) {
                            return i;
                        }
                    }
                }
                return 0;
            },
            iconEl: function (el) {
                return el.one('.' + this.getBaseCssClass('icon'));
            },
            checkIconEl: function (el) {
                return el.one('.' + this.getBaseCssClass(CHECK_CLS));
            }
        }
    });
});