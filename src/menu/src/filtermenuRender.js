/**
 * @fileOverview filter menu render
 * 1.create filter input
 * 2.change menu contentelement
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/filtermenuRender", function (S, Node, MenuRender) {
    var $ = Node.all,
        MENU_FILTER = "ks-menu-filter",
        MENU_FILTER_LABEL = "ks-menu-filter-label",
        MENU_CONTENT = "ks-menu-content";

    return MenuRender.extend({
        getContentElement:function () {
            return this.get("menuContent");
        },

        getKeyEventTarget:function () {
            return this.get("filterInput");
        },
        createDom:function () {
            var self = this;
            var contentEl = MenuRender.prototype.getContentElement.call(this);
            var filterWrap = self.get("filterWrap");
            if (!filterWrap) {
                self.set("filterWrap",
                    filterWrap = $("<div class='" + MENU_FILTER + "'/>")
                        .appendTo(contentEl, undefined));
            }
            if (!this.get("labelEl")) {
                this.set("labelEl",
                    $("<div class='" + MENU_FILTER_LABEL + "'/>")
                        .appendTo(filterWrap, undefined));
            }
            if (!self.get("filterInput")) {
                self.set("filterInput", $("<input autocomplete='off'/>")
                    .appendTo(filterWrap, undefined));
            }
            if (!self.get("menuContent")) {
                self.set("menuContent",
                    $("<div class='" + MENU_CONTENT + "'/>")
                        .appendTo(contentEl, undefined));
            }
        },

        _uiSetLabel:function (v) {
            this.get("labelEl").html(v);
        }
    }, {

        ATTRS:{
            /* 过滤输入框的提示 */
            label:{}
        },

        HTML_PARSER:{
            labelEl:function (el) {
                return el.one("." + MENU_FILTER).one("." + MENU_FILTER_LABEL)
            },
            filterWrap:function (el) {
                return el.one("." + MENU_FILTER);
            },
            menuContent:function (el) {
                return el.one("." + MENU_CONTENT);
            },
            filterInput:function (el) {
                return el.one("." + MENU_FILTER).one("input");
            }
        }
    });

}, {
    requires:['node', './menuRender']
});