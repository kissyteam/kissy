/**
 * @fileOverview 里层包裹层定义，适合mask以及shim
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/contentboxrender", function (S, Node, BoxRender) {


    function ContentBoxRender() {
    }

    ContentBoxRender.ATTRS = {
        contentEl:{},
        contentElAttrs:{},
        contentElCls:{},
        contentElStyle:{},
        contentTagName:{
            value:"div"
        },
        content:{
            sync:false
        }
    };

    /*
     ! contentEl 只能由组件动态生成
     */
    ContentBoxRender.HTML_PARSER = {
        content:function (el) {
            return el[0].innerHTML;
        }
    };

    var constructEl = BoxRender.construct;

    ContentBoxRender.prototype = {

        // no need ,shift create work to __createDom
        __renderUI:function () {
        },

        __createDom:function () {
            var self = this,
                contentEl,
                c = self.get("content"),
                el = self.get("el"),
                html = "",
                elChildren = S.makeArray(el[0].childNodes);

            if (elChildren.length) {
                html = el[0].innerHTML
            }

            // el html 和 c 相同，直接 append el的子节点
            if (c == html) {
                c = "";
            }

            contentEl = new Node(constructEl(
                self.get("prefixCls") + "contentbox "
                    + (self.get("contentElCls") || ""),
                self.get("contentElStyle"),
                undefined,
                undefined,
                self.get("contentTagName"),
                self.get("contentElAttrs"),
                c));

            contentEl.appendTo(el);

            self.__set("contentEl", contentEl);
            // on content,then read from box el
            if (!c) {
                for (var i = 0, l = elChildren.length; i < l; i++) {
                    contentEl.append(elChildren[i]);
                }
            } else if (typeof c !== 'string') {
                contentEl.append(c);
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
            if (typeof c == "string") {
                this.get("contentEl").html(c);
            } else {
                this.get("contentEl").empty().append(c);
            }
        }
    };

    return ContentBoxRender;
}, {
    requires:["node", "./boxrender"]
});