/**
 * 里层包裹层定义，适合mask以及shim
 * @author:yiminghe@gmail.com
 */
KISSY.add("uibase-contentbox", function(S) {

    S.namespace("UIBase");
    var Node = S.Node;

    function ContentBox() {
        S.log("contentbox init");
    }

    ContentBox.ATTRS = {
        //内容容器节点
        contentEl:{},
        contentElAttrs:{},
        contentTagName:{value:"div"},
        //层内容
        content:{}
    };


    ContentBox.HTML_PARSER = {
        contentEl:".ks-contentbox"
    };

    ContentBox.prototype = {
        __syncUI:function() {
            S.log("_syncUIContentBox");
        },
        __bindUI:function() {
            S.log("_bindUIContentBox");
        },
        __renderUI:function() {
            S.log("_renderUIContentBox");
            var self = this,
                contentEl = self.get("contentEl"),
                el = self.get("el");
            if (!contentEl) {
                var elChildren = S.makeArray(el[0].childNodes);
                contentEl = new Node("<" +
                    self.get("contentTagName") +
                    " class='ks-contentbox'>").appendTo(el);
                for (var i = 0; i < elChildren.length; i++) {
                    contentEl.append(elChildren[i]);
                }
                self.set("contentEl", contentEl);
            }
        },
        _uiSetContentElAttrs:function(attrs) {
            S.log("_uiSetContentElAttrs");
            if (attrs) {
                this.get("contentEl").attr(attrs);
            }
        },
        _uiSetContent:function(c) {
            S.log("_uiSetContent");
            if (c !== undefined) {
                this.get("contentEl").html(c);
            }
        },

        __destructor:function() {
            S.log("contentbox __destructor");
        }
    };

    S.UIBase.ContentBox = ContentBox;
});