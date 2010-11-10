/**
 * 里层包裹层定义，适合mask以及shim
 * @author:yiminghe@gmail.com
 */
KISSY.add("ext-contentbox", function(S) {

    S.namespace("Ext");
    var Node = S.Node;

    function ContentBox() {
        var self = this;
        self.on("renderUI", self._renderUIOverlayExt, self);
    }

    ContentBox.ATTRS = {
        //内容容器节点
        contentEl:{},
        //层内容
        content:{}
    };


    ContentBox.HTML_PARSER = {
        contentEl:".ks-contentbox-content"
    };

    ContentBox.prototype = {
        _renderUIOverlayExt:function() {
            S.log("_renderUIContentBox");
            var self = this,
                contentEl = self.get("contentEl"),
                el = self.get("el");
            if (!contentEl) {
                contentEl = new Node("<div class='ks-contentbox-content'>").appendTo(el);
                self.set("contentEl", contentEl);
            }
        },

        _uiSetContent:function(c) {
            if (c !== undefined) {
                this.get("contentEl").html(c);
            }
        }
    };

    S.Ext.ContentBox = ContentBox;
});