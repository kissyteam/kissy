/**
 * @ignore
 * Box
 * @author yiminghe@gmail.com
 */
KISSY.add('component/base/box-render', function (S) {

    var $ = S.all,
        UA = S.UA,
        elTpl = '<div class="{cls}"></div>',
        doc = S.Env.host.document;

    function BoxRender() {
    }

    BoxRender.ATTRS = {
        el: {},

        // 构建时批量生成，不需要执行单个
        elCls: {},

        elStyle: {},

        width: {},

        height: {},

        elAttrs: {},

        content: {},

        // renderBefore
        elBefore: {},

        render: {},

        visible: {},

        contentEl: {
            valueFn: function () {
                return this.get('el');
            }
        }
    };

    BoxRender.HTML_PARSER = {
        el: function (srcNode) {
            return srcNode;
        },
        content: function (el) {
            var contentEl = this.get('contentEl') || el;
            return contentEl.html();
        }
    };

    // for augment, no need constructor
    BoxRender.prototype = {
        /**
         * @ignore
         * 只负责建立节点，如果是 decorate 过来的，甚至内容会丢失
         * 通过 render 来重建原有的内容
         */
        __createDom: function () {
            var self = this,
                el,
                cls = self.getCssClassWithState(),
                contentEl;
            if (!(el = self.get('srcNode'))) {
                contentEl = self.get('contentEl');
                el = $(S.substitute(elTpl, {
                    cls: cls
                }));
                if (contentEl) {
                    el.append(contentEl);
                }
                self.setInternal('el', el);
                if (!contentEl) {
                    // 没取到,这里设下值, uiSet 时可以 set('content')  取到
                    self.setInternal('contentEl', el);
                }
            } else {
                el.addClass(cls);
            }
        },

        __renderUI: function () {
            var self = this;
            // 新建的节点才需要摆放定位
            if (!self.get('srcNode')) {
                var render = self.get('render'),
                    el = self.get('el'),
                    renderBefore = self.get('elBefore');
                if (renderBefore) {
                    el.insertBefore(renderBefore, /**
                     @type Node
                     @ignore
                     */undefined);
                } else if (render) {
                    el.appendTo(render, undefined);
                } else {
                    el.appendTo(doc.body, undefined);
                }
            }
        },

        _onSetElAttrs: function (attrs) {
            this.get('el').attr(attrs);
        },

        _onSetElCls: function (cls) {
            this.get('el').addClass(cls);
        },

        _onSetElStyle: function (style) {
            this.get('el').css(style);
        },

        '_onSetWidth': function (w) {
            this.get('el').width(w);
        },

        _onSetHeight: function (h) {
            var self = this;
            self.get('el').height(h);
        },

        '_onSetContent': function (c) {
            var self = this,
                el = self.get('contentEl');
            // srcNode 时不重新渲染 content
            // 防止内部有改变，而 content 则是老的 html 内容
            if (self.get('srcNode') && !self.get('rendered')) {
            } else {
                if (typeof c == 'string') {
                    el.html(c);
                } else if (c) {
                    el.empty().append(c);
                }
            }
            // ie needs to set unselectable attribute recursively
            if (UA.ie < 9 && !self.get('allowTextSelection')) {
                el.unselectable(/**
                 @type HTMLElement
                 @ignore
                 */undefined);
            }
        },

        _onSetVisible: function (visible) {
            var self = this,
                el = self.get('el'),
                shownCls = self.getCssClassWithState('shown'),
                hiddenCls = self.getCssClassWithState('hidden');
            if (visible) {
                el.removeClass(hiddenCls);
                el.addClass(shownCls);
            } else {
                el.removeClass(shownCls);
                el.addClass(hiddenCls);
            }
        },

        __destructor: function () {
            var el = this.get('el');
            if (el) {
                el.remove();
            }
        }
    };

    return BoxRender;
}, {
    requires: ['node']
});
