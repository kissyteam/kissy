/**
 * @fileOverview common render for node
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/basenodeRender", function (S, Node, Component, DOM) {
    var $ = Node.all,
        LABEL_CLS = "ks-tree-item-content",
        FILE_CLS = "ks-tree-file-icon",
        FILE_EXPAND = "ks-tree-expand-icon-{t}",
        FOLDER_EXPAND = FILE_EXPAND + "minus",
        FOLDER_COLLAPSED = FILE_EXPAND + "plus",
        INLINE_BLOCK = " ks-inline-block",
        FOLDER_ICON_EXPANDED = "ks-tree-expanded-folder-icon",
        FOLDER_ICON_COLLAPSED = "ks-tree-collapsed-folder-icon",
        CHILDREN_CLS = "ks-tree-children",
        CHILDREN_CLS_L = "ks-tree-lchildren",
        EXPAND_ICON_CLS = "ks-tree-expand-icon",
        ICON_CLS = "ks-tree-icon",
        LEAF_CLS = "tree-item-leaf",
        NOT_LEAF_CLS = "ks-tree-item-folder",
        ROW_CLS = "ks-tree-row";

    return Component.Render.extend({

        _computeClass:function (children, parent) {
            var self = this,
                expanded = self.get("expanded"),
                isLeaf = self.get("isLeaf"),
                iconEl = self.get("iconEl"),
                expandIconEl = self.get("expandIconEl"),
                childrenEl = self.get("childrenEl"),
                expand_cls = [ICON_CLS, EXPAND_ICON_CLS, ""].join(" "),
                icon_cls = [ICON_CLS, FILE_CLS, ""].join(" ") + INLINE_BLOCK,
                folder_cls = [ ICON_CLS, expanded ? FOLDER_ICON_EXPANDED : FOLDER_ICON_COLLAPSED, ""].join(" ") + INLINE_BLOCK,
                last = !parent || parent.get("children")[parent.get("children").length - 1].get("view") == self;
            // 强制指定了 isLeaf，否则根据儿子节点集合自动判断
            if (isLeaf === false || (isLeaf === undefined && children.length)) {
                iconEl.attr("class", folder_cls);
                if (expanded) {
                    expand_cls += FOLDER_EXPAND;
                } else {
                    expand_cls += FOLDER_COLLAPSED;
                }
                expandIconEl.attr("class", S.substitute(expand_cls, {
                    "t":last ? "l" : "t"
                }) + INLINE_BLOCK);
            } else
            //if (isLeaf !== false && (isLeaf ==true || !children.length))
            {
                iconEl.attr("class", icon_cls);
                expandIconEl.attr("class", S.substitute((expand_cls + FILE_EXPAND), {
                    "t":last ? "l" : "t"
                }) + INLINE_BLOCK);
            }
            childrenEl && childrenEl.attr("class", (last ? CHILDREN_CLS_L : CHILDREN_CLS));

        },

        createDom:function () {
            var self = this,
                el = self.get("el"),
                id,
                rowEl,
                contentEl = self.get("contentEl");

            rowEl = $("<div class='" + ROW_CLS + "'/>");

            id = S.guid('tree-item');

            self.__set("rowEl", rowEl);

            var expandIconEl = $("<div/>")
                .appendTo(rowEl);

            var iconEl = $("<div />")
                .appendTo(rowEl);

            contentEl.appendTo(rowEl);

            el.attr({
                "role":"treeitem",
                "aria-labelledby":id
            }).prepend(rowEl);

            self.__set("expandIconEl", expandIconEl);
            self.__set("iconEl", iconEl);

        },

        _uiSetExpanded:function (v) {
            var self = this,
                childrenEl = self.get("childrenEl");
            if (childrenEl) {
                if (!v) {
                    childrenEl.hide();
                } else if (v) {
                    childrenEl.show();
                }
            }
            self.get("el").attr("aria-expanded", v);
        },

        _uiSetSelected:function (v) {
            var self = this,
                classes = self.getComponentCssClassWithState("-selected"),
            // selected 放在 row 上，防止由于子选择器而干扰节点的子节点显示
            // .selected .label {background:xx;}
                rowEl = self.get("rowEl");
            rowEl[v ? "addClass" : "removeClass"](classes);
            self.get("el").attr("aria-selected", v);
        },

        _uiSetDepth:function (v) {
            this.get("el").attr("aria-level", v);
        },

        _uiSetAriaSize:function (v) {
            this.get("el").attr("aria-setsize", v);
        },

        _uiSetAriaPosInSet:function (v) {
            this.get("el").attr("aria-posinset", v);
        },

        _uiSetTooltip:function (v) {
            this.get("el").attr("title", v);
        },

        /**
         * 内容容器节点，子树节点都插到这里
         * 默认调用 Component.Render.prototype.getContentElement 为当前节点的容器
         * 而对于子树节点，它有自己的子树节点容器（单独的div），而不是儿子都直接放在自己的容器里面
         * @override
         * @return {NodeList}
         */
        getContentElement:function () {
            var self = this;
            if (self.get("childrenEl")) {
                return self.get("childrenEl");
            }
            var c = $("<div " + (self.get("expanded") ? "" : "style='display:none'")
                + " role='group'><" + "/div>")
                .appendTo(self.get("el"));
            self.__set("childrenEl", c);
            return c;
        }
    }, {
        ATTRS:{
            ariaSize:{},
            ariaPosInSet:{},
            childrenEl:{},
            expandIconEl:{},
            tooltip:{},
            iconEl:{},
            expanded:{
                value:false
            },
            rowEl:{},
            depth:{
                value:0
            },
            contentEl:{
                valueFn:function(){
                    return $("<span id='" + S.guid("tree-item") + "' class='" + LABEL_CLS + "'/>");
                }
            },
            isLeaf:{},
            selected:{}
        },

        HTML_PARSER:{
            childrenEl:function (el) {
                return el.children("." + CHILDREN_CLS);
            },
            contentEl:function (el) {
                return el.children("." + LABEL_CLS);
            },
            isLeaf:function (el) {
                var self = this;
                if (el.hasClass(self.getCssClassWithPrefix(LEAF_CLS))) {
                    return true;
                }
                if (el.hasClass(self.getCssClassWithPrefix(NOT_LEAF_CLS))) {
                    return false;
                }
            },
            expanded:function (el) {
                var children = el.one("." + "ks-tree-children");
                if (!children) {
                    return false;
                }
                return children.css("display") != "none";
            }
        }

    });

}, {
    requires:['node', 'component', 'dom']
});