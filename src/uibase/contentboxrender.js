/**
 * 里层包裹层定义，适合mask以及shim
 * @author:yiminghe@gmail.com
 */
KISSY.add("uibase/contentboxrender", function(S, Node) {

    function ContentBox() {
    }

    ContentBox.ATTRS = {
        //内容容器节点
        contentEl:{},
        contentElAttrs:{},
        contentElStyle:{},
        contentTagName:{value:"div"},
        //层内容
        content:{}
    };


    ContentBox.HTML_PARSER = {
        contentEl:".ks-contentbox"
    };

    ContentBox.prototype = {

        __renderUI:function() {

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
            attrs && this.get("contentEl").attr(attrs);
        },
        _uiSetContentElStyle:function(v) {
            v && this.get("contentEl").css(v);
        },
        _uiSetContent:function(c) {
            if (S['isString'](c)) {
                this.get("contentEl").html(c);
            } else if (c !== undefined) {
                this.get("contentEl").html("");
                this.get("contentEl").append(c);
            }
        }
    };

    return ContentBox;
}, {
    requires:["node"]
});