/**
 * filter menu render
 * 1.create filter input
 * 2.change menu contentelement
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/filtermenurender", function(S, Node, UIBase, MenuRender) {
    var $ = Node.all,
        MENU_FILTER = "{prefixCls}menu-filter",
        MENU_FILTER_LABEL = "{prefixCls}menu-filter-label",
        MENU_CONTENT = "{prefixCls}menu-content";

    function getCls(self, str) {
        return S.substitute(str, {
            prefixCls:self.get("prefixCls")
        });
    }

    return UIBase.create(MenuRender, {
        getContentElement:function() {
            return this.get("menuContent");
        },

        getKeyEventTarget:function() {
            return this.get("filterInput");
        },
        createDom:function() {
            var self = this;
            var contentEl = MenuRender.prototype.getContentElement.call(this);
            var filterWrap = self.get("filterWrap");
            if (!filterWrap) {
                self.set("filterWrap",
                    filterWrap = $("<div class='" + getCls(this, MENU_FILTER) + "'/>")
                        .appendTo(contentEl));
            }
            if (!this.get("labelEl")) {
                this.set("labelEl",
                    $("<div class='" + getCls(this, MENU_FILTER_LABEL) + "'/>").appendTo(filterWrap));
            }
            if (!self.get("filterInput")) {
                self.set("filterInput", $("<input autocomplete='off'/>").appendTo(filterWrap));
            }
            if (!self.get("menuContent")) {
                self.set("menuContent",
                    $("<div class='" + getCls(this, MENU_CONTENT) + "'/>").appendTo(contentEl));
            }
        },

        _uiSetLabel:function(v) {
            this.get("labelEl").html(v);
        }
    }, {

        ATTRS:{
            /* 过滤输入框的提示 */
            label:{}
        },

        HTML_PARSER:{
            labelEl:function(el) {
                return el.one("." + getCls(this, MENU_FILTER))
                    .one("." + getCls(this, MENU_FILTER_LABEL))
            },
            filterWrap:function(el) {
                return el.one("." + getCls(this, MENU_FILTER));
            },
            menuContent:function(el) {
                return el.one("." + getCls(this, MENU_CONTENT));
            },
            filterInput:function(el) {
                return el.one("." + getCls(this, MENU_FILTER)).one("input");
            }
        }
    });

}, {
    requires:['node','uibase','./menurender']
});