/**
 * @ignore
 * filter menu render
 * 1.create filter input
 * 2.change menu content element
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/filtermenu-render", function (S, Node, MenuRender) {
    var $ = Node.all,
        MENU_FILTER = "menu-filter",
        MENU_FILTER_LABEL = "menu-filter-label",
        MENU_FILTER_INPUT = "menu-filter-input",
        MENU_CONTENT = "menu-content";

    return MenuRender.extend({
        initializer:function(){
            var childrenElSelectors=this.get('childrenElSelectors');
            S.mix(childrenElSelectors,{
                labelEl:'#ks-menu-filter-label{id}',
                filterWrap:'#ks-menu-filter{id}',
                menuContent:'#ks-menu-content{id}',
                filterInput:'#ks-menu-filter-input{id}'
            });
        },

        getChildrenContainerEl: function () {
            return this.get("menuContent");
        },

        getKeyEventTarget: function () {
            return this.get("filterInput");
        },

        '_onSetLabel': function (v) {
            this.get("labelEl").html(v);
        }
    }, {
        ATTRS: {
            label: {
                sync:0
            },
            contentTpl: {
                value: '<div id="ks-menu-filter{{id}}" ' +
                    'class="{{prefixCls}}' + MENU_FILTER + '">' +
                    '<div id="ks-menu-filter-label{{id}}" ' +
                    'class="{{prefixCls}}' + MENU_FILTER_LABEL + '">' +
                    '{{label}}' +
                    '</div>' +
                    '<input id="ks-menu-filter-input{{id}}" ' +
                    'class="{{prefixCls}}' + MENU_FILTER_LABEL + '" ' +
                    'autocomplete="off" />' +
                    '</div>' +
                    '<div id="ks-menu-content{{id}}" ' +
                    'class="{{prefixCls}}' + MENU_CONTENT + '">' +
                    '</div>'
            }
        },

        HTML_PARSER: {
            labelEl: function (el) {
                return el.one("." + this.get('prefixCls') + MENU_FILTER_LABEL)
            },
            'filterWrap': function (el) {
                return el.one("." + this.get('prefixCls') + MENU_FILTER);
            },
            menuContent: function (el) {
                return el.one("." + this.get('prefixCls') + MENU_CONTENT);
            },
            filterInput: function (el) {
                return el.one("." + this.get('prefixCls') + MENU_FILTER_INPUT);
            }
        }
    });

}, {
    requires: ['node', './menu-render']
});