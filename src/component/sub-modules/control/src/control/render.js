/**
 * @ignore
 * render base class for kissy
 * @author yiminghe@gmail.com
 * refer: http://martinfowler.com/eaaDev/uiArchs.html
 */
KISSY.add(function (S, require) {
    var Node = require('node');
    var XTemplateRuntime = require('xtemplate/runtime');
    var ComponentProcess = require('./process');
    var RenderTpl = require('./render-xtpl');
    var Manager = require('component/manager');

    var ON_SET = '_onSet',
        trim = S.trim,
        $ = Node.all,
        UA = S.UA,
        startTpl = RenderTpl,
        endTpl = '</div>',
        doc = S.Env.host.document,
        HTML_PARSER = 'HTML_PARSER';

    function pxSetter(v) {
        if (typeof v === 'number') {
            v += 'px';
        }
        return v;
    }

    function applyParser(srcNode, parser, control) {
        var view = this,
            p, v, ret;

        // 从 parser 中，默默设置属性，不触发事件
        // html parser 优先，超过 js 配置值
        for (p in parser) {
            v = parser[p];
            // 函数
            if (typeof v === 'function') {
                // html parser 放弃
                ret = v.call(view, srcNode);
                if (ret !== undefined) {
                    control.setInternal(p, ret);
                }
            }
            // 单选选择器
            else if (typeof v === 'string') {
                control.setInternal(p, srcNode.one(v));
            }
            // 多选选择器
            else if (S.isArray(v) && v[0]) {
                control.setInternal(p, srcNode.all(v[0]));
            }
        }
    }

    function normalExtras(extras) {
        if (!extras) {
            extras = [''];
        }
        if (typeof extras === 'string') {
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
        if (e.target === self.control) {
            method = self[ON_SET + e.type.slice(5).slice(0, -6)];
            method.call(self, e.newVal, e);
        }
    }

    // scope option
    function getBaseCssClassesCmd() {
        return this.config.view.getBaseCssClasses(arguments[1].params[0]);
    }

    function getBaseCssClassCmd() {
        return this.config.view.getBaseCssClass(arguments[1].params[0]);
    }

    function findComponentCss(css, prefixCls) {
        var csses = css.split(/\s+/);
        var newCss = [];
        for (var i = 0, l = csses.length; i < l; i++) {
            var c = S.trim(csses[i]);
            if (c && S.startsWith(c, prefixCls)) {
                newCss.push(c.substring(prefixCls.length));
            }
        }
        return newCss.join(' ');
    }

    /**
     * Base Render class for KISSY Component.
     * @class KISSY.Component.Control.Process
     * @private
     */
    return ComponentProcess.extend({
        isRender: true,

        createInternal: function () {
            var self = this,
                srcNode = self.control.get('srcNode');

            if (srcNode) {
                // decorate from existing dom structure
                self.decorateDom(srcNode);
            } else {
                self.callSuper();
            }
        },

        beforeCreateDom: function (renderData) {
            var self = this,
                control = self.control,
                width,
                height,
                visible,
                elAttrs = control.get('elAttrs'),
                cls = control.get('elCls'),
                disabled,
                attrs = control.getAttrs(),
                a,
                attr,
                elStyle = control.get('elStyle'),
                zIndex,
                elCls = control.get('elCls');

            for (a in attrs) {
                attr = attrs[a];
                if (attr.view) {
                    renderData[a] = control.get(a);
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

            if ((disabled = control.get('disabled'))) {
                cls.push(self.getBaseCssClasses('disabled'));
                elAttrs['aria-disabled'] = 'true';
            }
            if (control.get('highlighted')) {
                cls.push(self.getBaseCssClasses('hover'));
            }
            if (control.get('focusable')) {
                // ie9 support outline
                if (UA.ieMode < 9) {
                    elAttrs.hideFocus = 'true';
                }
                elAttrs.tabindex = disabled ? '-1' : '0';
            }
        },

        createDom: function () {
            var self = this;
            self.beforeCreateDom(
                self.renderData = {},
                self.childrenElSelectors = {},
                self.renderCommands = {
                    getBaseCssClasses: getBaseCssClassesCmd,
                    getBaseCssClass: getBaseCssClassCmd
                }
            );

            var control = self.control,
                html;
            html = self.renderTpl(startTpl) + self.renderTpl(self.get('contentTpl')) + endTpl;
            control.setInternal('el', self.$el = $(html));
            self.el = self.$el[0];
            self.fillChildrenElsBySelectors();
        },

        decorateDom: function (srcNode) {
            var self = this,
                control = self.control;
            if (!srcNode.attr('id')) {
                srcNode.attr('id', control.get('id'));
            }
            applyParser.call(self, srcNode, self.constructor.HTML_PARSER, control);
            control.setInternal('el', self.$el = srcNode);
            self.el = srcNode[0];
        },

        renderUI: function () {
            var self = this,
                control = self.control,
                el = self.$el;

            // need to insert created dom into body
            if (!control.get('srcNode')) {
                var render = control.get('render'),
                    renderBefore = control.get('elBefore');
                if (renderBefore) {
                    el.insertBefore(renderBefore, undefined);
                } else if (render) {
                    el.appendTo(render, undefined);
                } else {
                    el.appendTo(doc.body, undefined);
                }
            }
        },

        bindUI: function () {
            var self = this;
            var control = self.control;
            var attrs = control.getAttrs();
            var attrName, attrCfg;
            for (attrName in attrs) {
                attrCfg = attrs[attrName];
                var ucName = S.ucfirst(attrName);
                var attrChangeFn = self[ON_SET + ucName];
                if (attrCfg.view && attrChangeFn) {
                    // 通知 render 处理
                    control.on('after' + ucName + 'Change', onSetAttrChange, self);
                }
            }
        },

        destructor: function () {
            if (this.$el) {
                this.$el.remove();
            }
        },

        $: function (selector) {
            return this.$el.all(selector);
        },

        fillChildrenElsBySelectors: function (childrenElSelectors) {
            var self = this,
                el = self.$el,
                control = self.control,
                childName,
                selector;

            childrenElSelectors = childrenElSelectors || self.childrenElSelectors;

            for (childName in childrenElSelectors) {
                selector = childrenElSelectors[childName];
                if (typeof selector === 'function') {
                    control.setInternal(childName, selector(el));
                } else {
                    control.setInternal(childName,
                        self.$(S.substitute(selector, self.renderData)));
                }
                delete childrenElSelectors[childName];
            }
        },

        renderTpl: function (tpl, renderData, renderCommands) {
            var self = this;
            renderData = renderData || self.renderData;
            renderCommands = renderCommands || self.renderCommands;
            var XTemplate = self.get('xtemplate');
            return new XTemplate(tpl, {
                control: self.control,
                view: self,
                commands: renderCommands
            }).render(renderData);
        },

        /**
         * Get component's constructor from KISSY Node.
         * @param prefixCls
         * @param {KISSY.NodeList} childNode Child component's root node.
         */
        getComponentConstructorByNode: function (prefixCls, childNode) {
            var cls = childNode[0].className;
            // 过滤掉特定前缀
            if (cls) {
                var componentCss = findComponentCss(cls,prefixCls);
                return Manager.getConstructorByXClass(componentCss);
            }
            return null;
        },

        getComponentCssClasses: function () {
            var self = this;
            if (self.componentCssClasses) {
                return self.componentCssClasses;
            }
            var control = self.control,
                constructor = control.constructor,
                xclass,
                re = [];
            while (constructor && !constructor.prototype.hasOwnProperty('isControl')) {
                xclass = constructor.xclass;
                if (xclass) {
                    re.push(xclass);
                }
                constructor = constructor.superclass &&
                    constructor.superclass.constructor;
            }
            self.componentCssClasses = re;
            return re;
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
                control = this.get('control'),
                cls = '',
                l = componentCssClasses.length,
                prefixCls = control.get('prefixCls');
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
                this.control.get('prefixCls'),
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
            return this.$el;
        },

        '_onSetWidth': function (w) {
            this.$el.width(w);
        },

        _onSetHeight: function (h) {
            this.$el.height(h);
        },

        '_onSetContent': function (c) {
            var el = this.$el;
            el.html(c);
            // ie needs to set unselectable attribute recursively
            if (!this.get('allowTextSelection')) {
                el.unselectable();
            }
        },

        _onSetVisible: function (visible) {
            var self = this,
                el = self.$el,
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
                componentCls = self.getBaseCssClasses('hover'),
                el = self.$el;
            el[v ? 'addClass' : 'removeClass'](componentCls);
        },

        /**
         * @ignore
         */
        _onSetDisabled: function (v) {
            var self = this,
                control = self.control,
                componentCls = self.getBaseCssClasses('disabled'),
                el = self.$el;
            el[v ? 'addClass' : 'removeClass'](componentCls)
                .attr('aria-disabled', v);
            if (control.get('focusable')) {
                //不能被 tab focus 到
                self.getKeyEventTarget().attr('tabindex', v ? -1 : 0);
            }
        },
        /**
         * @ignore
         */
        '_onSetActive': function (v) {
            var self = this,
                componentCls = self.getBaseCssClasses('active');
            self.$el[v ? 'addClass' : 'removeClass'](componentCls)
                .attr('aria-pressed', !!v);
        },
        /**
         * @ignore
         */
        _onSetFocused: function (v) {
            var self = this,
                el = self.$el,
                componentCls = self.getBaseCssClasses('focused');
            el[v ? 'addClass' : 'removeClass'](componentCls);
        },

        '_onSetZIndex': function (x) {
            this.$el.css('z-index', x);
        }
    }, {
        __hooks__: {
            decorateDom: ComponentProcess.prototype.__getHook('__decorateDom'),
            beforeCreateDom: ComponentProcess.prototype.__getHook('__beforeCreateDom')
        },

        /**
         * Create a new class which extends ComponentProcess .
         * @param {Function[]} extensions Class constructors for extending.
         * @param {Object} px Object to be mixed into new class 's prototype.
         * @param {Object} sx Object to be mixed into new class.
         * @static
         * @return {KISSY.Component.Process} A new class which extends ComponentProcess .
         */
        extend: function extend(extensions, px, sx) {
            /*jshint unused: false*/
            var SuperClass = this,
                NewClass,
                parsers = {};
            NewClass = ComponentProcess.extend.apply(SuperClass, arguments);
            NewClass[HTML_PARSER] = NewClass[HTML_PARSER] || {};
            if (S.isArray(extensions)) {
                // [ex1,ex2]，扩展类后面的优先，ex2 定义的覆盖 ex1 定义的
                // 主类最优先
                S.each(extensions.concat(NewClass), function (ext) {
                    if (ext) {
                        // 合并 HTML_PARSER 到主类
                        S.each(ext.HTML_PARSER, function (v, name) {
                            parsers[name] = v;
                        });
                    }
                });
                NewClass[HTML_PARSER] = parsers;
            }
            S.mix(NewClass[HTML_PARSER], SuperClass[HTML_PARSER], false);
            NewClass.extend = extend;
            return NewClass;
        },

        //  screen state
        ATTRS: {
            control: {
                setter: function (v) {
                    this.control = v;
                }
            },
            xtemplate: {
                value: XTemplateRuntime
            },
            contentTpl: {
                value: function (scope) {
                    return scope.get('content') || '';
                }
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
                return el.hasClass(this.getBaseCssClass('disabled'));
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
});