/**
 * view for button , double div for pseudo-round corner
 * @author yiminghe@gmail.com
 */
KISSY.add("button/customrender", function(S, Node, UIBase, Css3Render) {
    //双层 div 模拟圆角

    var CONTENT_CLS = "inline-block custom-button-outer-box",
        INNER_CLS = "inline-block custom-button-inner-box";


    return UIBase.create(Css3Render, {

            __css_tag:"custom",

            /**
             *  modelcontrol 会在 create 后进行 unselectable，需要所有的节点创建工作放在 createDom 中
             */
            createDom:function() {
                var self = this,
                    el = self.get("el"),
                    contentEl = self.get("contentEl"),
                    id = S.guid('ks-button-labelby');
                //按钮的描述节点在最内层，其余都是装饰
                contentEl.addClass(self.getCls(CONTENT_CLS));
                var elChildren = S.makeArray(contentEl[0].childNodes);
                var innerEl = new Node("<div id='" + id + "' " +
                    "class='" + self.getCls(INNER_CLS) + "'/>").appendTo(contentEl);
                // content 由 contentboxrender 处理
                for (var i = 0; i < elChildren.length; i++) {
                    innerEl.append(elChildren[i]);
                }
                el.attr("aria-labelledby", id);
                self.set("innerEl", innerEl);
            }
            ,

            /**
             * 内容移到内层
             * @override
             * @param v
             */
            _uiSetContent:function(v) {
                var innerEl = this.get("innerEl");
                innerEl.html("");
                v && innerEl.append(v);
            }
        }, {
            /**
             * @inheritedDoc
             * content:{}
             */
            innerEL:{}
        }
    );
}, {
    requires:['node','uibase','./css3render']
});