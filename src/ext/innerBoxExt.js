/**
 * 里层包裹层定义，适合mask以及shim
 * @author:yiminghe@gmail.com
 */
KISSY.add("ext-innerbox", function(S) {

    S.namespace("Ext");
    var Node = S.Node;

    function InnerBox() {
        var self = this;
        self.on("renderUI", self._renderUIOverlayExt, self);
    }

    InnerBox.ATTRS = {
        //内容容器节点
        contentEl:{},
        //层内容
        content:{}
    };


    InnerBox.HTML_PARSER = {
        contentEl:".ks-innerbox-content"
    };

    InnerBox.prototype = {
        _renderUIOverlayExt:function() {
            var self = this,
                contentEl = self.get("contentEl"),
                el = self.get("el");
            if (!contentEl) {
                contentEl = new Node("<div class='ks-innerbox-content'>").appendTo(el);
                self.set("contentEl", contentEl);
            }
        },

        _uiSetContent:function(c) {
            if (c !== undefined) {
                this.get("contentEl").html(c);
            }
        }
    };

    S.Ext.InnerBox = InnerBox;
});