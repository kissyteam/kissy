
KISSY.Editor.add("plugins~maximize", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event,
        TYPE = E.PLUGIN_TYPE,
        MAXIMIZE_MODE_CLS = "kissy-editor-maximize-mode";

    E.addPlugin("maximize", {
        /**
         * 种类：普通按钮
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * 编辑器容器
         */
        container: null,

        /**
         * 容器的父节点
         */
        containerParentNode: null,

        /**
         * 初始化
         */
        init: function() {
            this.container = this.editor.container;
            this.containerParentNode = this.container.parentNode;
        },

        /**
         * 响应函数
         */
        exec: function() {
            var container = this.container;

            if(Dom.hasClass(container, MAXIMIZE_MODE_CLS)) {
                this.containerParentNode.appendChild(container);
                Dom.removeClass(container, MAXIMIZE_MODE_CLS);
            } else {
                document.body.appendChild(container);
                Dom.addClass(container, MAXIMIZE_MODE_CLS);
            }

        }
    });

 });
