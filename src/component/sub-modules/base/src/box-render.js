/**
 * @ignore
 * Box
 * @author yiminghe@gmail.com
 */
KISSY.add('component/base/box-render', function (S, Node, XTemplate) {

    var $ = S.all,
        UA = S.UA,
        startTpl = '<div id="ks-component{{id}}"' +
            ' class="{{getCssClassWithState ""}} ' +

            '{{#if visible}}' +
            '{{getCssClassWithState "shown"}} ' +
            '{{else}}' +
            '{{getCssClassWithState "hidden"}} ' +
            '{{/if}}' +

            '{{#if elCls}}' +
            '{{#each elCls}}' +
            ' {{.}} ' +
            '{{/each}}' +
            '{{/if}} ' +

            '"' +

            '{{#if elAttrs}}' +
            '{{#each elAttrs}}' +
            ' {{xkey}}="{{.}}" ' +
            '{{/each}} ' +
            '{{/if}}' +

            'style="' +

            '{{#if elStyle}}' +
            '{{#each elStyle}}' +
            ' {{xkey}}:{{.}}; ' +
            '{{/each}}' +
            '{{/if}} ' +

            '{{#if width}}' +
            'width:{{width}};' +
            '{{/if}}' +

            '{{#if height}}' +
            'height:{{height}};' +
            '{{/if}}' +

            '"' +
            '>',
        endTpl = '</div>',
        doc = S.Env.host.document;

    function BoxRender() {
    }

    BoxRender.ATTRS = {

        id: {
        },

        el: {},

        // 构建时批量生成，不需要执行单个
        elCls: {
            sync: 0,
            setter: function (v) {
                if (typeof v == 'string') {
                    v = v.split(/\s+/);
                }
                return v;
            }
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
                el, tpl, html;
            if (!(el = self.get('srcNode'))) {
                tpl = startTpl +
                    self.get('contentTpl') +
                    endTpl;
                html = new XTemplate(tpl, {
                    commands: {
                        getCssClassWithState: function (scope, option) {
                            return self.getCssClassWithState(option.params[0]);
                        }
                    }
                }).render(self.get('renderData'));
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
                el[0].id = ('ks-component' + S.guid());
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
            var self = this,
                el = self.get('el');
            // srcNode 时不重新渲染 content
            // 防止内部有改变，而 content 则是老的 html 内容
            el.html(c);
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
    requires: ['node', 'xtemplate']
});
