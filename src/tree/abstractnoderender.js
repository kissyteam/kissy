/**
 * common render for node
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/abstractnoderender", function(S, Node, UIBase, Component) {
    var $ = Node.all;
    var LABEL_CLS = "tree-item-label",
        FOLDER_CLS = "tree-expanded-folder-icon",
        FILE_CLS = "tree-file-icon",
        FILE_EXPAND = "tree-expand-icon-t",
        FOLDER_EXPAND = FILE_EXPAND + "minus",
        FOLDER_COLLAPSED = FILE_EXPAND + "plus",
        INLINE_BLOCK = "inline-block",
        SELECTED_CLS = "tree-item-selected",
        ITEM_CLS = "tree-item",
        CHILDREN_CLS = "tree-children",
        EXPAND_ICON_CLS = "tree-expand-icon",
        ICON_CLS = "tree-icon",
        ROW_CLS = "tree-row";
    return UIBase.create(Component.Render, {
        renderUI:function() {
            this.get("el").addClass(this.getCls(ITEM_CLS));
        },

        _checkIcon:function(children) {
            var expandIconEl = this.get("expandIconEl"),
                iconEl = this.get("iconEl"),
                expand = this.getCls(FOLDER_EXPAND),
                collpased = this.getCls(FOLDER_COLLAPSED),
                cls = this.get("expanded") ? expand : collpased;
            if (children.length) {
                iconEl.removeClass(this.getCls(FILE_CLS))
                    .addClass(this.getCls(FOLDER_CLS));
                expandIconEl.removeClass(this.getCls(FILE_EXPAND))
                    .addClass(cls);
            } else {
                expandIconEl.removeClass(cls);
            }
        },

        createDom:function() {
            var el = this.get("el"),
                children = el.children();
            var rowEl = $("<div class='" + this.getCls(ROW_CLS) + "'/>"),
                id = S.guid('tree-item');
            var expandIconEl = $("<div class='" + this.getCls(INLINE_BLOCK + " "
                + ICON_CLS + " "
                + EXPAND_ICON_CLS + " " + FILE_EXPAND) + "'/>")
                .appendTo(rowEl);
            var iconEl = $("<div class='" + this.getCls(INLINE_BLOCK + " "
                + ICON_CLS + " " + FILE_CLS) + "'/>")
                .appendTo(rowEl);
            var labelEl = $("<span id='" + id + "' class='" + this.getCls(LABEL_CLS) + "'/>").appendTo(rowEl)
                .append(children);
            el.attr({
                "role":"treeitem",
                "aria-labelledby":id
            }).append(rowEl);
            this.set("labelEl", labelEl);
            this.set("expandIconEl", expandIconEl);
            this.set("iconEl", iconEl);
            this.set("rowEl", rowEl);
        },

        _uiSetExpanded:function(v) {
            var expandIconEl = this.get("expandIconEl"),
                childrenEl = this.get("childrenEl"),
                expand = this.getCls(FOLDER_EXPAND),
                collpased = this.getCls(FOLDER_COLLAPSED);
            if (!v && expandIconEl.hasClass(expand)) {
                expandIconEl.removeClass(expand).addClass(collpased);
                childrenEl.hide();
            } else if (v && expandIconEl.hasClass(collpased)) {
                expandIconEl.removeClass(collpased).addClass(expand);
                childrenEl.show();
            }
        },

        _uiSetContent:function(c) {
            this.get("labelEl").html(c);
        },

        _uiSetDepth:function(v) {
            this.get("el").attr("aria-level", v);
        },

        _uiSetAriaSize:function(v) {
            this.get("el").attr("aria-setsize", v);
        },

        _uiSetAriaPosInSet:function(v) {
            this.get("el").attr("aria-posinset", v);
        },

        _uiSetSelected:function(v) {
            var self = this,
                // selected 放在 row 上，防止由于子选择器而干扰节点的子节点显示
                // .selected .label {background:xx;}
                el = self.get("rowEl");
            el[v ? "addClass" : "removeClass"](self.getCls(SELECTED_CLS));
        },

        getContentElement:function() {
            if (this.get("childrenEl")) {
                return this.get("childrenEl");
            }
            var c = $("<div " + (!this.get("expanded") ? "style='display:none'" : "") + " role='group'" +
                " class='" + this.getCls(CHILDREN_CLS + "'>"))
                .appendTo(this.get("el"));
            this.set("childrenEl", c);
            return c;
        }
    }, {
        ATTRS:{
            ariaSize:{},
            ariaPosInSet:{},
            childrenEl:{},
            expandIconEl:{},
            iconEl:{},
            rowEl:{},
            selected:{},
            expanded:{},
            depth:{
                value:0
            },
            labelEl:{},
            content:{}
        }
    });

}, {
    requires:['node','uibase','component']
});