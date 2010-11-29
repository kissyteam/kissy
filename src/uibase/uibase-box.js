/**
 * UIBase.Box
 * @author: 承玉<yiminghe@gmail.com>
 */
KISSY.add('uibase-box', function(S) {

    var doc = document,
        Node = S.Node,
        CONTAINER = 'container'; // CC 压缩时会内联，和 YC 相比，体积增大了，囧

    function Box() {
        this.on('renderUI', this._renderUIBox);
    }

    Box.ATTRS = {
        // 容器元素
        container: {
            setter: function(v) {
                if (S.isString(v))
                    return S.one(v);
            }
        },

        // 容器 class
        containerCls: {
        },

        // 容器的内联样式
        containerStyle: {
        },

        // 容器宽度
        width: {
        },

        // 容器高度
        height: {
        },

        // 容器的 innerHTML
        html: {
            // 内容, 默认为 undefined, 不设置
            value: false
        }
    };

    Box.HTML_PARSER = {
        container: function(srcNode) {
            return srcNode;
        }
    };

    Box.prototype = {

        _renderUIBox: function() {
            var self = this,
                render = S.one(self.get('render') || doc.body),
                container = self.get(CONTAINER);

            if (!container) {
                container = new Node('<div>');
                render.prepend(container);
                self.set(CONTAINER, container);
            }
        },

        _uiSetContainerCls: function(cls) {
            if (cls) {
                this.get(CONTAINER).addClass(cls);
            }
        },

        _uiSetContainerStyle: function(style) {
            if (style) {
                this.get(CONTAINER).css(style);
            }
        },

        _uiSetWidth: function(w) {
            if (w) {
                this.get(CONTAINER).width(w);
            }
        },

        _uiSetHeight: function(h) {
            if (h) {
                this.get(CONTAINER).height(h);
            }
        },

        _uiSetHtml: function(c) {
            if (c !== false){
                this.get(CONTAINER).html(c);
            }
        },

        __destructor:function() {
            S.log('UIBase.Box.__destructor');
            var container = this.get(CONTAINER);
            if (container) {
                container.detach();
                container.remove();
            }
        }
    };

    S.UIBase.Box = Box;
});
