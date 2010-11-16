/**
 * 里层包裹层定义，适合mask以及shim
 * @author:yiminghe@gmail.com
 */
KISSY.add("ext-contentbox", function(S) {

    S.namespace("Ext");
    var Node = S.Node;

    function ContentBox() {
         S.log("contentbox init");
        var self = this;
        self.on("renderUI", self._renderUIContentBox, self);
        self.on("syncUI", self._syncUIContentBox, self);
        self.on("bindUI", self._bindUIContentBox, self);
    }

    ContentBox.ATTRS = {
        //内容容器节点
        contentEl:{},
        //层内容
        content:{}
    };


    ContentBox.HTML_PARSER = {
        contentEl:".ks-contentbox"
    };

    ContentBox.prototype = {
        _syncUIContentBox:function() {
            S.log("_syncUIContentBox");
        },
        _bindUIContentBox:function() {
            S.log("_bindUIContentBox");
        },
        _renderUIContentBox:function() {
            S.log("_renderUIContentBox");
            var self = this,
                contentEl = self.get("contentEl"),
                el = self.get("el");
            if (!contentEl) {
                contentEl = new Node("<div class='ks-contentbox'>").appendTo(el);
                self.set("contentEl", contentEl);
            }
        },

        _uiSetContent:function(c) {
            S.log("_uiSetContent");
            if (c !== undefined) {
                this.get("contentEl").html(c);
            }
        },

        __destructor:function(){
            S.log("contentbox __destructor");
        }
    };

    S.Ext.ContentBox = ContentBox;
});