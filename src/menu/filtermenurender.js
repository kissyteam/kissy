/**
 * filter menu render
 * 1.create filter input
 * 2.change menu contentelement
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/filtermenurender", function(S, Node, UIBase, MenuRender) {
    var $ = Node.all,
        MENU_FILTER = "{prefixCls}menu-filter",
        MENU_CONTENT = "{prefixCls}menu-content";

    function getCls(self, str) {
        return S.substitute(str, {
            prefixCls:self.get("prefixCls")
        });
    }

    return UIBase.create(MenuRender, {
        getContentElement:function() {
            return this._menuContent;
        },

        getKeyEventTarget:function() {
            return this._filterInput;
        },
        createDom:function() {
            var contentEl = MenuRender.prototype.getContentElement.call(this);
            var filterWrap = $("<div class='" + getCls(this, MENU_FILTER) + "'/>").appendTo(contentEl);
            this._labelEl = $("<div/>").appendTo(filterWrap);
            this._filterInput = $("<input autocomplete='off'/>").appendTo(filterWrap);
            this._menuContent = $("<div class='" + getCls(this, MENU_CONTENT) + "'/>").appendTo(contentEl);
        },

        _uiSetLabel:function(v) {
            this._labelEl.html(v);
        }
    }, {
        ATTRS:{
            /* 过滤输入框的提示 */
            label:{}
        }
    });

}, {
    requires:['node','uibase','./menurender']
});