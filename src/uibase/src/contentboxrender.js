/**
 * @fileOverview 里层包裹层定义，适合mask以及shim
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/contentboxrender", function (S, Node, BoxRender) {

    function ContentBox() {
    }

    ContentBox.ATTRS = {
        // 内容容器节点
        contentEl:{},
        contentElAttrs:{},
        contentElCls:{},
        contentElStyle:{},
        contentTagName:{
            value:"div"
        },
        //层内容
        content:{
            sync:false
        }
    };

    /**
     * ! contentEl 只能由组件动态生成
     */
    ContentBox.HTML_PARSER = {
        content:function (el) {
            return el.html();
        }
    };

    var constructEl = BoxRender.construct;

    ContentBox.prototype = {

        // no need ,shift create work to __createDom
        __renderUI:function () {
        },

        __createDom:function () {
            var self = this,
                contentEl,
                c,
                el = self.get("el"),
                elChildren = S.makeArray(el[0].childNodes);
            contentEl = new Node(constructEl(
                self.get("prefixCls") + "contentbox "
                    + (self.get("contentElCls") || ""),
                self.get("contentElStyle"),
                undefined,
                undefined,
                self.get("contentTagName"),
                self.get("contentElAttrs"),
                c = self.get("content"))).appendTo(el);
            self.__set("contentEl", contentEl);
            // on content,then read from box el
            if (!c && elChildren.length) {
                for (var i = 0, l = elChildren.length; i < l; i++) {
                    contentEl.append(elChildren[i]);
                }
            }
        },

        _uiSetContentElCls:function (cls) {
            this.get("contentEl").addClass(cls);
        },
        _uiSetContentElAttrs:function (attrs) {
            this.get("contentEl").attr(attrs);
        },
        _uiSetContentElStyle:function (v) {
            this.get("contentEl").css(v);
        },
        _uiSetContent:function (c) {
            this.get("contentEl").html(c);
        }
    };

    return ContentBox;
}, {
    requires:["node", "./boxrender"]
});