/**
 * @ignore
 * render base class for kissy
 * @author yiminghe@gmail.com
 * refer: http://martinfowler.com/eaaDev/uiArchs.html
 */
KISSY.add("component/controller/render", function (S, RenderProcess, XTemplate, RenderTpl, Manager) {

    var ON_SET = '_onSet',
        trim = S.trim,
        $ = S.all,
        UA = S.UA,
        startTpl = RenderTpl,
        endTpl = '</div>',
        doc = S.Env.host.document,
        HTML_PARSER = 'HTML_PARSER';

    function pxSetter(v) {
        if (typeof v == 'number') {
            v += 'px';
        }
        return v;
    }

    function applyParser(srcNode, parser, controller) {
        var view = this,
            p, v, ret;

        // 从 parser 中，默默设置属性，不触发事件
        // html parser 优先，超过 js 配置值
        for (p in parser) {
            v = parser[p];
            // 函数
            if (S.isFunction(v)) {
                // html parser 放弃
                ret = v.call(view, srcNode);
                if (ret !== undefined) {
                    controller.setInternal(p, ret);
                }
            }
            // 单选选择器
            else if (typeof v == 'string') {
                controller.setInternal(p, srcNode.one(v));
            }
            // 多选选择器
            else if (S.isArray(v) && v[0]) {
                controller.setInternal(p, srcNode.all(v[0]))
            }
        }
    }

    function normalExtras(extras) {
        if (!extras) {
            extras = [''];
        }
        if (typeof extras == "string") {
            extras = extras.split(/\s+/);
        }
        return extras;
    }

    function prefixExtra(prefixCls, componentCls, extras) {
        var cls = '',
            i = 0,
            l = extras.length,
            e,
            prefix = prefixCls + componentCls;
        for (; i < l; i++) {
            e = extras[i];
            e = e ? ('-' + e) : e;
            cls += ' ' + prefix + e;
        }
        return cls;
    }

    function onSetAttrChange(e) {
        var self = this,
            method;
        // ignore bubbling
        if (e.target == self.controller) {
            method = self[ON_SET + e.type.slice(5).slice(0, -6)];
            method.call(self, e.newVal, e);
        }
    }

    /**
     * @ignore
     * Base Render class for KISSY Component.
     */
    return RenderProcess.extend({

        isRender: 1,

        beforeCreateDom: function (renderData) {
            var self = this,
                controller = self.controller,
                width,
                height,
                visible,
                elAttrs = controller.get('elAttrs'),
                cls = controller.get('elCls'),
                disabled,
                attrs = controller['getAttrs'](),
                a,
                attr,
                elStyle = controller.get('elStyle'),
                zIndex,
                elCls = controller.get('elCls');

            for (a in attrs) {
                attr = attrs[a];
                if (attr.view) {
                    renderData[a] = controller.get(a);
                }
            }

            width = renderData.width;
            height = renderData.height;
            visible = renderData.visible;
            zIndex = renderData.zIndex;

            if (width) {
                elStyle.width = pxSetter(width);
            }
            if (height) {
                elStyle.height = pxSetter(height);
            }
            if (zIndex) {
                elStyle['z-index'] = zIndex;
            }

            if (!visible) {
                elCls.push(self.getBaseCssClasses('hidden'));
            }

            if (disabled = controller.get('disabled')) {
                cls.push(self.getBaseCssClasses('disabled'));
                elAttrs['aria-disabled'] = 'true';
            }
            if (controller.get('highlighted')) {
                cls.push(self.getBaseCssClasses('hover'));
            }
            if (controller.get('focusable')) {
                elAttrs['hideFocus'] = 'true';
                elAttrs['tabindex'] = disabled ? '-1' : '0';
            }
        },

        /**
         * @ignore
         * 只负责建立节点，如果是 decorate 过来的，甚至内容会丢失
         * 通过 render 来重建原有的内容
         */
        createDom: function () {
            var self = this,
                controller = self.controller,
                renderData = self.renderData,
                el, tpl, html;

            tpl = startTpl + self.get('contentTpl') + endTpl;

            html = new XTemplate(tpl, {
                commands: {
                    getBaseCssClasses: function (scope, option) {
                        return self.getBaseCssClasses(option.params[0]);
                    }
                }
            }).render(renderData);

            el = $(html);

            var childrenElSelectors = self.childrenElSelectors,
                childName,
                selector;

            for (childName in childrenElSelectors) {
                selector = childrenElSelectors[childName];
                if (typeof selector === "function") {
                    controller.setInternal(childName, selector(el));
                } else {
                    controller.setInternal(childName,
                        el.all(S.substitute(selector, self.renderData)));
                }
            }

            controller.setInternal("el", controller.el = self.el = el);
        },

        decorateDom: function (srcNode) {
            var self = this,
                c = self.constructor,
                controller = self.controller,
                len, p, constructorChains;

            if (!srcNode.attr('id')) {
                srcNode.attr('id', controller.get('id'));
            }

            constructorChains = self['collectConstructorChains']();

            // 从父类到子类开始从 html 读取属性
            for (len = constructorChains.length - 1; len >= 0; len--) {
                c = constructorChains[len];
                if (p = c.HTML_PARSER) {
                    applyParser.call(self, srcNode, p, controller);
                }
            }
            controller.setInternal("el", controller.el = self.el = srcNode);
        },

        renderUI: function () {
            var self = this;
            var controller = self.controller;
            // 新建的节点才需要摆放定位
            if (!controller.get('srcNode')) {
                var render = controller.get('render'),
                    el = controller.el,
                    renderBefore = controller.get('elBefore');
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

        bindUI: function () {
            var self = this;
            var controller = self.controller;
            var attrs = controller['getAttrs']();
            var attrName, attrCfg;
            for (attrName in attrs) {
                attrCfg = attrs[attrName];
                var ucName = S.ucfirst(attrName);
                var attrChangeFn = self[ON_SET + ucName];
                if (attrCfg.view && attrChangeFn) {
                    // 通知 render 处理
                    controller.on("after" + ucName + "Change", onSetAttrChange, self);
                }
            }
        },

        destructor: function () {
            if (this.el) {
                this.el.remove();
            }
        },

        /**
         * Get component's constructor from KISSY Node.
         * @param prefixCls
         * @param {KISSY.NodeList} childNode Child component's root node.
         */
        'getComponentConstructorByNode': function (prefixCls, childNode) {
            var cls = childNode[0].className;
            // 过滤掉特定前缀
            if (cls) {
                cls = cls.replace(new RegExp("\\b" + prefixCls, "ig"), "");
                return Manager.getConstructorByXClass(cls);
            }
            return null;
        },

        getComponentCssClasses: function () {
            var self = this;
            if (self.componentCssClasses) {
                return self.componentCssClasses;
            }
            var controller = self.controller,
                constructor = controller.constructor,
                xclass,
                re = [];
            while (constructor && !constructor.prototype.hasOwnProperty('isController')) {
                xclass = constructor.xclass;
                if (xclass) {
                    re.push(xclass);
                }
                constructor = constructor.superclass &&
                    constructor.superclass.constructor;
            }
            return self.componentCssClasses = re;
        },

        /**
         * Get all css class name to be applied to the root element of this component for given extra class names.
         * the css class names are prefixed with component name.
         * @param extras {String[]|String} class names without prefixCls and current component class name.
         */
        getBaseCssClasses: function (extras) {
            extras = normalExtras(extras);
            var componentCssClasses = this.getComponentCssClasses(),
                i = 0,
                controller = this.get('controller'),
                cls = '',
                l = componentCssClasses.length,
                prefixCls = controller.prefixCls;
            for (; i < l; i++) {
                cls += prefixExtra(prefixCls, componentCssClasses[i], extras);
            }
            return trim(cls);
        },

        /**
         * Get full class name (with prefix) for current component
         * @param extras {String[]|String} class names without prefixCls and current component class name.
         * @method
         * @return {String} class name with prefixCls and current component class name.
         */
        getBaseCssClass: function (extras) {
            return trim(prefixExtra(
                this.controller.prefixCls,
                this.getComponentCssClasses()[0],
                normalExtras(extras)
            ));
        },

        /**
         * Returns the dom element which is responsible for listening keyboard events.
         * @return {KISSY.NodeList}
         * @ignore
         */
        getKeyEventTarget: function () {
            return this.el;
        },

        '_onSetWidth': function (w) {
            this.el.width(w);
        },

        _onSetHeight: function (h) {
            this.el.height(h);
        },

        '_onSetContent': function (c) {
            var el = this.el;
            el.html(c);
            // ie needs to set unselectable attribute recursively
            if (UA.ie < 9 && !this.get('allowTextSelection')) {
                el.unselectable();
            }
        },

        _onSetVisible: function (visible) {
            var self = this,
                el = self.el,
                hiddenCls = self.getBaseCssClasses('hidden');
            if (visible) {
                el.removeClass(hiddenCls);
            } else {
                el.addClass(hiddenCls);
            }
        },

        /**
         * @ignore
         */
        _onSetHighlighted: function (v) {
            var self = this,
                componentCls = self.getBaseCssClasses("hover"),
                el = self.el;
            el[v ? 'addClass' : 'removeClass'](componentCls);
        },

        /**
         * @ignore
         */
        _onSetDisabled: function (v) {
            var self = this,
                controller = self.controller,
                componentCls = self.getBaseCssClasses("disabled"),
                el = self.el;
            el[v ? 'addClass' : 'removeClass'](componentCls)
                .attr("aria-disabled", v);
            if (controller.get("focusable")) {
                //不能被 tab focus 到
                self.getKeyEventTarget().attr("tabindex", v ? -1 : 0);
            }
        },
        /**
         * @ignore
         */
        '_onSetActive': function (v) {
            var self = this,
                componentCls = self.getBaseCssClasses("active");
            self.el[v ? 'addClass' : 'removeClass'](componentCls)
                .attr("aria-pressed", !!v);
        },
        /**
         * @ignore
         */
        _onSetFocused: function (v) {
            var self = this,
                el = self.el,
                componentCls = self.getBaseCssClasses("focused");
            el[v ? 'addClass' : 'removeClass'](componentCls);
        },

        '_onSetZIndex': function (x) {
            this.el.css("z-index", x);
        },

        '_onSetX': function (x) {
            this.el.offset({
                left: x
            });
        },

        '_onSetY': function (y) {
            this.el.offset({
                top: y
            });
        }
    }, {

        /**
         * Create a new class which extends RenderProcess .
         * @param {Function[]} extensions Class constructors for extending.
         * @param {Object} px Object to be mixed into new class 's prototype.
         * @param {Object} sx Object to be mixed into new class.
         * @static
         * @return {KISSY.Component.RenderProcess} A new class which extends RenderProcess .
         */
        extend: function extend(extensions, px, sx) {
            var baseClass = this,
                parsers = {};

            var newClass = RenderProcess.extend.apply(baseClass, arguments);

            if (S.isArray(extensions)) {
                // [ex1,ex2]，扩展类后面的优先，ex2 定义的覆盖 ex1 定义的
                // 主类最优先
                S.each(extensions['concat'](newClass), function (ext) {
                    if (ext) {
                        // 合并 HTML_PARSER 到主类
                        S.each(ext.HTML_PARSER, function (v, name) {
                            parsers[name] = v;
                        });
                    }
                });
                newClass[HTML_PARSER] = parsers;
            }

            newClass.extend = extend;

            return newClass;
        },

        //  screen state
        ATTRS: {
            controller: {
                setter: function (v) {
                    this.controller = v;
                }
            },
            contentTpl: {
                value: '{{{content}}}'
            }
        },
        HTML_PARSER: {
            id: function (el) {
                var id = el[0].id;
                return id ? id : undefined;
            },
            content: function (el) {
                return el.html();
            },
            disabled: function (el) {
                return el.hasClass(this.getBaseCssClass("disabled"));
            }
        },
        name: 'render'
    });

    /**
     * Parse attribute from existing dom node.
     * @static
     * @protected
     * @property HTML_PARSER
     * @member KISSY.Component
     *
     * for example:
     *     @example
     *     Overlay.HTML_PARSER={
     *          // el: root element of current component.
     *          "isRed":function(el){
     *              return el.hasClass("ks-red");
     *          }
     *      };
     */
}, {
    requires: ['./render-process', 'xtemplate',
        './render-tpl', 'component/manager']
});