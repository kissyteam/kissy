/**
 * common render for node
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/abstractnoderender", function(S, Node, UIBase, Component) {
    var $ = Node.all,

        LABEL_CLS = "tree-item-label",
        FILE_CLS = "tree-file-icon",
        FILE_EXPAND = "tree-expand-icon-{t}",
        FOLDER_EXPAND = FILE_EXPAND + "minus",
        FOLDER_COLLAPSED = FILE_EXPAND + "plus",


        INLINE_BLOCK = "inline-block",
        SELECTED_CLS = "tree-item-selected",
        ITEM_CLS = "tree-item",

        FOLDER_ICON_EXPANED = "tree-expanded-folder-icon",
        FOLDER_ICON_COLLAPSED = "tree-collapsed-folder-icon",

        CHILDREN_CLS = "tree-children",
        CHILDREN_CLS_L = "tree-lchildren",

        EXPAND_ICON_CLS = "tree-expand-icon",
        ICON_CLS = "tree-icon",
        ROW_CLS = "tree-row";

    return UIBase.create(Component.Render, {
        renderUI:function() {
            this.get("el").addClass(this.getCls(ITEM_CLS));
        },

        _computeClass:function(children, parent,cause) {
            S.log("hi "+cause+": " + this.get("content"));
            var expanded = this.get("expanded"),
                expand_cls = [INLINE_BLOCK,ICON_CLS,EXPAND_ICON_CLS,""].join(" "),
                icon_cls = this.getCls([INLINE_BLOCK,ICON_CLS,FILE_CLS,""].join(" ")),
                folder_cls = this.getCls(
                    [INLINE_BLOCK,ICON_CLS,expanded ? FOLDER_ICON_EXPANED : FOLDER_ICON_COLLAPSED,""].join(" ")),
                last = !parent ||
                    parent.get("children")[parent.get("children").length - 1].get("view") == this;
            if (children.length) {
                this.set("iconElCls", folder_cls);
                if (expanded) {
                    expand_cls += FOLDER_EXPAND;
                } else {
                    expand_cls += FOLDER_COLLAPSED;
                }
                this.set("expandIconElCls", this.getCls(S.substitute(expand_cls, {
                    "t":last ? "l" : "t"
                })));
            } else {
                this.set("iconElCls", icon_cls);
                this.set("expandIconElCls", this.getCls(S.substitute((expand_cls + FILE_EXPAND), {
                    "t":last ? "l" : "t"
                })));
            }
            this.set("childrenElCls", this.getCls(last ? CHILDREN_CLS_L : CHILDREN_CLS));
        },

        _uiSetChildrenElCls:function(v) {
            this.get("childrenEl") && this.get("childrenEl").attr("class", v);
        },

        _uiSetExpandIconElCls:function(v) {
            this.get("expandIconEl").attr("class", v);
        },

        _uiSetIconElCls:function(v) {
            this.get("iconEl").attr("class", v);
        },

        createDom:function() {
            var el = this.get("el"),
                children = el.children();
            var rowEl = $("<div class='" + this.getCls(ROW_CLS) + "'/>"),
                id = S.guid('tree-item');
            var expandIconEl = $("<div/>")
                .appendTo(rowEl);
            var iconEl = $("<div />")
                .appendTo(rowEl);
            var labelEl = $("<span id='" + id + "' class='" + this.getCls(LABEL_CLS) + "'/>")
                .appendTo(rowEl)
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
            var childrenEl = this.get("childrenEl");
            if (childrenEl) {
                if (!v) {
                    childrenEl.hide();
                } else if (v) {
                    childrenEl.show();
                }
            }
            this.get("el").attr("aria-expanded", v);
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
                rowEl = self.get("rowEl");
            rowEl[v ? "addClass" : "removeClass"](self.getCls(SELECTED_CLS));
        },

        getContentElement:function() {
            if (this.get("childrenEl")) {
                return this.get("childrenEl");
            }
            var c = $("<div " + (!this.get("expanded") ? "style='display:none'" : "")
                + " role='group'></div>")
                .appendTo(this.get("el"));
            this.set("childrenEl", c);
            return c;
        }
    }, {
        ATTRS:{
            childrenElCls:{},
            expandIconElCls:{},
            iconElCls:{},
            ariaSize:{},
            ariaPosInSet:{},
            childrenEl:{},
            expandIconEl:{},
            iconEl:{},
            rowEl:{},
            selected:{},
            expanded:{
                value:false
            },
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