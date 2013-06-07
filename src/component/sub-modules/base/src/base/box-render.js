/**
 * @ignore
 * Box
 * @author yiminghe@gmail.com
 */
KISSY.add('component/base/box-render', function (S, Node, XTemplate, BoxTpl) {

    var $ = S.all,
        UA = S.UA,
        startTpl = BoxTpl,
        endTpl = '</div>',
        doc = S.Env.host.document;

    function pxSetter(v) {
        if (typeof v == 'number') {
            v += 'px';
        }
        return v;
    }

    function BoxRender() {

        var self = this,
            width,
            height,
            style = self.get('elStyle'),
            elCls = self.get('elCls'),
            visible;

        if (!self.get('srcNode')) {
            var attrs = self.getAttrs(),
                a,
                attr,
                renderData = self.get('renderData');

            for (a in attrs) {
                attr = attrs[a];
                if (a != 'renderData' && !(a in renderData)) {
                    renderData[a] = self.get(a);
                }
            }
            width = renderData.width;
            height = renderData.height;
            visible = renderData.visible;

            if (width) {
                style.width = pxSetter(width);
            }

            if (height) {
                style.height = pxSetter(height);
            }

            if (!visible) {
                elCls.push(self.getBaseCssClasses('hidden'));
            }
        }

    }

    BoxRender.ATTRS = {

        id: {
        },

        el: {},

        // 构建时批量生成，不需要执行单个
        elCls: {
            sync: 0

        },

        elStyle: {
            sync: 0
        },

        width: {
            sync: 0
        },

        height: {
            sync: 0
        },

        elAttrs: {
            sync: 0
        },

        // renderBefore
        elBefore: {
            sync: 0
        },

        render: {},

        visible: {
            sync: 0
        },

        contentTpl: {
            value: '{{{content}}}'
        },

        renderData: {},

        childrenElSelectors: {
            value: {}
        }
    };

    BoxRender.HTML_PARSER = {
        id: function (el) {
            var id = el[0].id;
            return id ? id : undefined;
        },
        content: function (el) {
            return el.html();
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
                renderData = self.get('renderData'),
                el, tpl, html;

            if (!(el = self.get('srcNode'))) {

                tpl = startTpl +
                    self.get('contentTpl') +
                    endTpl;

                html = new XTemplate(tpl, {
                    commands: {
                        getBaseCssClasses: function (scope, option) {
                            return self.getBaseCssClasses(option.params[0]);
                        }
                    }
                }).render(renderData);

                el = $(html);

                var childrenElSelectors = self.get('childrenElSelectors');

                for (var childName in childrenElSelectors) {
                    var selector = childrenElSelectors[childName];
                    if (typeof selector === "function") {
                        self.setInternal(childName, selector(el));
                    } else {
                        self.setInternal(childName,
                            el.all(S.substitute(selector, this.get('renderData'))));
                    }
                }
            } else if ((el = $(el)) && !el[0].id) {
                el[0].id = self.get('id');
            }
            self.setInternal("el", el);
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

        '_onSetWidth': function (w) {
            this.get('el').width(w);
        },

        _onSetHeight: function (h) {
            var self = this;
            self.get('el').height(h);
        },

        '_onSetContent': function (c) {
            var el = this.get('el');
            el.html(c);
            // ie needs to set unselectable attribute recursively
            if (UA.ie < 9 && !this.get('allowTextSelection')) {
                el.unselectable();
            }
        },

        _onSetVisible: function (visible) {
            var self = this,
                el = self.get('el'),
                hiddenCls = self.getBaseCssClasses('hidden');
            if (visible) {
                el.removeClass(hiddenCls);
            } else {
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
    requires: ['node', 'xtemplate', './box-tpl']
});
