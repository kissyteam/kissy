/**
 * Grids BigBang Script by lifesinger@gmail.com
 */

YUI().use("dd", function(Y) {

    // 扩展 Y
    Y.getDOMNode = function(id) {
        return document.getElementById(id.replace(/^#?(.*)$/, "$1"));
    };

    // 共用变量
    var page, content, ROW_TMPL;

    var BigBang = {
        /**
         * 初始化
         */
        init: function() {
            var self = this;
            page = Y.get("#page");
            content = Y.get("#content");

            // 切换页面宽度
            Y.on("change", function() {
                self.switchPageWidth(this.get("value"));
            }, "#page-width");

            // 添加行，添加列，删除行，删除列
            ROW_TMPL  = Y.getDOMNode("#row-tmpl").innerHTML;
            content.delegate("click", function(e) {
                var button = e.currentTarget;

                if(button.getAttribute("id") === "add-row") {
                    self.insertRow(Y.Node.getDOMNode(button.ancestor()));

                } else if(button.hasClass("del-row")) {
                    self.removeRow(button.ancestor(".layout"));

                } else if(button.hasClass("add-col")) {
                    self.addCol(button);

                } else if(button.hasClass("del-col")) {

                }
            }, "span");
        },

        /**
         * 切换页面宽度
         */
        switchPageWidth: function(type) {
            switch (type) {
                case "950":
                case "750":
                    page.setAttribute("class", "w" + type);
                    content.removeAttribute("class");
                    break;
                case "auto":
                    page.removeAttribute("class");
                    content.removeAttribute("class");
                    break;
                case "hamburger":
                    page.removeAttribute("class");
                    content.setAttribute("class", "w950");
                    break;
            }
        },

        /**
         * 插入行
         */
        insertRow: function(where) {
            content.insert(ROW_TMPL, where);
        },

        /**
         * 删除行
         */
        removeRow: function(row) {
            row.remove();
        },

        /**
         * 插入列
         */
        addCol: function(position) {
            if(position.ancestor(".col-main")) {
                
            }
        }
    };

    Y.on("domready", function() { BigBang.init(); });
});