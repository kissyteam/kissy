/*
Copyright 2013, KISSY v1.40dev
MIT Licensed
build time: Sep 17 17:00
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 component/control/process
 component/control/render-xtpl
 component/control/render
 component/control
*/

/**
 * @ignore
 * render process for control and render
 * @author yiminghe@gmail.com
 */
KISSY.add('component/control/process', function (S, Base, Promise) {
    var Defer = Promise.Defer,
        __getHook = Base.prototype.__getHook,
        noop = S.noop;

    /**
     * @class KISSY.Component.Process
     * @extends KISSY.Base
     */
    var ComponentProcess = Base.extend({
        bindInternal: noop,

        syncInternal: noop,

        initializer: function () {
            this._renderedDefer = new Defer();
        },

        createDom: noop,

        renderUI: noop,

        bindUI: noop,

        syncUI: noop,

        onRendered: function (fn) {
            return this._renderedDefer.promise.then(fn);
        },

        /**
         * create dom structure of this component
         * (control will delegate to render).
         * @chainable
         */
        create: function () {
            var self = this;
            if (!self.get("created")) {
                /**
                 * @event beforeCreateDom
                 * fired before root node is created
                 * @param {KISSY.Event.CustomEventObject} e
                 */
                self.fire('beforeCreateDom');
                self.createInternal();
                self.__callPluginsMethod('pluginCreateDom');
                /**
                 * @event afterCreateDom
                 * fired when root node is created
                 * @param {KISSY.Event.CustomEventObject} e
                 */
                self.fire('afterCreateDom');

                self.setInternal("created", true);
            }
            return self;
        },

        createInternal: function () {
            this.createDom();
        },

        /**
         * Put dom structure of this component to document, bind event and sync attribute.
         * @chainable
         */
        render: function () {
            var self = this;
            // 是否已经渲染过
            if (!self.get("rendered")) {
                self.create();

                /**
                 * @event beforeRenderUI
                 * fired when root node is ready
                 * @param {KISSY.Event.CustomEventObject} e
                 */

                self.fire('beforeRenderUI');
                self.renderUI();
                self.__callPluginsMethod('pluginRenderUI');

                /**
                 * @event afterRenderUI
                 * fired after root node is rendered into dom
                 * @param {KISSY.Event.CustomEventObject} e
                 */
                self.fire('afterRenderUI');

                /**
                 * @event beforeBindUI
                 * fired before component 's internal event is bind.
                 * @param {KISSY.Event.CustomEventObject} e
                 */

                self.fire('beforeBindUI');
                ComponentProcess.superclass.bindInternal.call(self);
                self.bindUI();
                self.__callPluginsMethod('pluginBindUI');
                /**
                 * @event afterBindUI
                 * fired when component 's internal event is bind.
                 * @param {KISSY.Event.CustomEventObject} e
                 */
                self.fire('afterBindUI');

                ComponentProcess.superclass.syncInternal.call(self);
                syncUIs(self);

                self.setInternal("rendered", true);
            }
            return self;
        },

        /**
         * sync attribute value
         */
        sync: function () {
            syncUIs(this);
        },

        plug: function (plugin) {
            var self = this,
                p,
                plugins = self.get('plugins');
            self.callSuper(plugin);
            p = plugins[plugins.length - 1];
            if (self.get('rendered')) {
                // plugin does not support decorate
                p['pluginCreateDom'] && p['pluginCreateDom'](self);
                p.pluginRenderUI && p.pluginRenderUI(self);
                p.pluginBindUI && p.pluginBindUI(self);
                p.pluginSyncUI && p.pluginSyncUI(self);
            } else if (self.get('created')) {
                p['pluginCreateDom'] && p['pluginCreateDom'](self);
            }
            return self;
        }

    }, {
        __hooks__: {
            createDom: __getHook('__createDom'),
            renderUI: __getHook('__renderUI'),
            bindUI: __getHook('__bindUI'),
            syncUI: __getHook('__syncUI')
        },

        name: 'ComponentProcess',

        ATTRS: {
            /**
             * Whether this component is rendered.
             * @type {Boolean}
             * @property rendered
             * @readonly
             */
            /**
             * @ignore
             */
            rendered: {
                value: false,
                setter: function (v) {
                    if (v) {
                        this._renderedDefer.resolve(this);
                    }
                }
            },
            /**
             * Whether this component 's dom structure is created.
             * @type {Boolean}
             * @property created
             * @readonly
             */
            /**
             * @ignore
             */
            created: {
                value: false
            }
        }
    });

    function syncUIs(self) {
        /**
         * @event beforeSyncUI
         * fired before component 's internal state is synchronized.
         * @param {KISSY.Event.CustomEventObject} e
         */
        self.fire('beforeSyncUI');
        self.syncUI();
        self.__callPluginsMethod('pluginSyncUI');
        /**
         * @event afterSyncUI
         * fired after component 's internal state is synchronized.
         * @param {KISSY.Event.CustomEventObject} e
         */
        self.fire('afterSyncUI');
    }

    return ComponentProcess;
}, {
    requires: ['base', 'promise']
});
/**
 * @ignore
 *
 * 2013.06.18 note:
 *  - ComponentProcess 流程化渲染过程定义
 *
 * Refer:
 *  - http://martinfowler.com/eaaDev/uiArchs.html
 *
 * render 和 create 区别
 *  - render 包括 create ，以及把生成的节点放在 document 中
 *  - create 仅仅包括创建节点
 **/
/*
  Generated by kissy-xtemplate.*/
KISSY.add('component/control/render-xtpl', function () {
    return function (scopes, S, undefined) {
        var buffer = "",
            config = this.config,
            engine = this,
            utils = config.utils;
        var runBlockCommandUtil = utils["runBlockCommand"],
            getExpressionUtil = utils["getExpression"],
            getPropertyOrRunCommandUtil = utils["getPropertyOrRunCommand"];
        buffer += '<div id="';
        var id0 = getPropertyOrRunCommandUtil(engine, scopes, {}, "id", 0, 1, undefined, false);
        buffer += getExpressionUtil(id0, true);
        buffer += '"\r\n class="';
        var config2 = {};
        var params3 = [];
        params3.push('');
        config2.params = params3;
        var id1 = getPropertyOrRunCommandUtil(engine, scopes, config2, "getBaseCssClasses", 0, 2, true, undefined);
        buffer += id1;
        buffer += '\r\n';
        var config4 = {};
        var params5 = [];
        var id6 = getPropertyOrRunCommandUtil(engine, scopes, {}, "elCls", 0, 3, undefined, true);
        params5.push(id6);
        config4.params = params5;
        config4.fn = function (scopes) {
            var buffer = "";
            buffer += '\r\n ';
            var id7 = getPropertyOrRunCommandUtil(engine, scopes, {}, ".", 0, 4, undefined, false);
            buffer += getExpressionUtil(id7, true);
            buffer += '  \r\n';
            return buffer;
        };
        buffer += runBlockCommandUtil(engine, scopes, config4, "each", 3);
        buffer += '\r\n"\r\n\r\n';
        var config8 = {};
        var params9 = [];
        var id10 = getPropertyOrRunCommandUtil(engine, scopes, {}, "elAttrs", 0, 8, undefined, true);
        params9.push(id10);
        config8.params = params9;
        config8.fn = function (scopes) {
            var buffer = "";
            buffer += ' \r\n ';
            var id11 = getPropertyOrRunCommandUtil(engine, scopes, {}, "xindex", 0, 9, undefined, false);
            buffer += getExpressionUtil(id11, true);
            buffer += '="';
            var id12 = getPropertyOrRunCommandUtil(engine, scopes, {}, ".", 0, 9, undefined, false);
            buffer += getExpressionUtil(id12, true);
            buffer += '"\r\n';
            return buffer;
        };
        buffer += runBlockCommandUtil(engine, scopes, config8, "each", 8);
        buffer += '\r\n\r\nstyle="\r\n';
        var config13 = {};
        var params14 = [];
        var id15 = getPropertyOrRunCommandUtil(engine, scopes, {}, "elStyle", 0, 13, undefined, true);
        params14.push(id15);
        config13.params = params14;
        config13.fn = function (scopes) {
            var buffer = "";
            buffer += ' \r\n ';
            var id16 = getPropertyOrRunCommandUtil(engine, scopes, {}, "xindex", 0, 14, undefined, false);
            buffer += getExpressionUtil(id16, true);
            buffer += ':';
            var id17 = getPropertyOrRunCommandUtil(engine, scopes, {}, ".", 0, 14, undefined, false);
            buffer += getExpressionUtil(id17, true);
            buffer += ';\r\n';
            return buffer;
        };
        buffer += runBlockCommandUtil(engine, scopes, config13, "each", 13);
        buffer += '\r\n">';
        return buffer;
    }
});
/**
 * @ignore
 * render base class for kissy
 * @author yiminghe@gmail.com
 * refer: http://martinfowler.com/eaaDev/uiArchs.html
 */
KISSY.add("component/control/render", function (S, Node, XTemplateRuntime, ComponentProcess, RenderTpl, Manager) {
    var ON_SET = '_onSet',
        trim = S.trim,
        $ = Node.all,
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
            else if (typeof v == 'string') {
                control.setInternal(p, srcNode.one(v));
            }
            // 多选选择器
            else if (S.isArray(v) && v[0]) {
                control.setInternal(p, srcNode.all(v[0]))
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
        if (e.target == self.control) {
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
                attrs = control['getAttrs'](),
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

            if (disabled = control.get('disabled')) {
                cls.push(self.getBaseCssClasses('disabled'));
                elAttrs['aria-disabled'] = 'true';
            }
            if (control.get('highlighted')) {
                cls.push(self.getBaseCssClasses('hover'));
            }
            if (control.get('focusable')) {
                if (UA.ie) {
                    elAttrs['hideFocus'] = 'true';
                }
                elAttrs['tabindex'] = disabled ? '-1' : '0';
            }
        },

        createDom: function () {
            var self = this;
            self['beforeCreateDom'](
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
            control.setInternal("el", self.$el = $(html));
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
            control.setInternal("el", self.$el = srcNode);
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
                    el['insertBefore'](renderBefore, undefined);
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
            var attrs = control['getAttrs']();
            var attrName, attrCfg;
            for (attrName in attrs) {
                attrCfg = attrs[attrName];
                var ucName = S.ucfirst(attrName);
                var attrChangeFn = self[ON_SET + ucName];
                if (attrCfg.view && attrChangeFn) {
                    // 通知 render 处理
                    control.on("after" + ucName + "Change", onSetAttrChange, self);
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
                if (typeof selector === "function") {
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
            if (UA.ie < 9 && !this.get('allowTextSelection')) {
                el['unselectable']();
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
                componentCls = self.getBaseCssClasses("hover"),
                el = self.$el;
            el[v ? 'addClass' : 'removeClass'](componentCls);
        },

        /**
         * @ignore
         */
        _onSetDisabled: function (v) {
            var self = this,
                control = self.control,
                componentCls = self.getBaseCssClasses("disabled"),
                el = self.$el;
            el[v ? 'addClass' : 'removeClass'](componentCls)
                .attr("aria-disabled", v);
            if (control.get("focusable")) {
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
            self.$el[v ? 'addClass' : 'removeClass'](componentCls)
                .attr("aria-pressed", !!v);
        },
        /**
         * @ignore
         */
        _onSetFocused: function (v) {
            var self = this,
                el = self.$el,
                componentCls = self.getBaseCssClasses("focused");
            el[v ? 'addClass' : 'removeClass'](componentCls);
        },

        '_onSetZIndex': function (x) {
            this.$el.css("z-index", x);
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
            var SuperClass = this,
                NewClass,
                parsers = {};
            NewClass = ComponentProcess.extend.apply(SuperClass, arguments);
            NewClass[HTML_PARSER] = NewClass[HTML_PARSER] || {};
            if (S.isArray(extensions)) {
                // [ex1,ex2]，扩展类后面的优先，ex2 定义的覆盖 ex1 定义的
                // 主类最优先
                S.each(extensions['concat'](NewClass), function (ext) {
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
                value: function (scopes) {
                    return scopes && scopes[scopes.length - 1].content || '';
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
    requires: [
        'node',
        'xtemplate/runtime',
        './process',
        './render-xtpl',
        'component/manager'
    ]
});
/**
 * @ignore
 * Base Control class for KISSY Component.
 * @author yiminghe@gmail.com
 */
KISSY.add("component/control", function (S, Node, ComponentProcess, Manager, Render, undefined) {
    var ie = S.Env.host.document.documentMode || S.UA.ie,
        Features = S.Features,
        Gesture = Node.Gesture,
        isTouchEventSupported = Features.isTouchEventSupported();

    /**
     * Base Control class for KISSY Component.
     * @extends KISSY.Component.Process
     * @class KISSY.Component.Control
     */
    var Control = ComponentProcess.extend({
            /**
             * mark current instance as control instance.
             *
             * access this property directly.
             *
             * for example:
             *
             *      menu.isControl // => true
             *
             * @type {Boolean}
             * @member KISSY.Component.Control
             */
            isControl: true,

            /**
             * Constructor(or get) view object to create ui elements.
             * @protected
             */
            createDom: function () {
                var self = this,
                    Render = self.get('xrender'),
                    view = self.get('view'),
                    id = self.get("id"),
                    el;
                // initialize view
                // allow custom view instance
                if (view) {
                    view.set('control', self);
                } else {
                    self.set('view', this.view = view = new Render({
                        control: self
                    }));
                }
                view.create();
                el = view.getKeyEventTarget();
                if (!self.get("allowTextSelection")) {
                    el.unselectable();
                }
                // after retrieve id from srcNode
                Manager.addComponent(id, self);
            },

            /**
             * Call view object to render ui elements.
             * @protected
             *
             */
            renderUI: function () {
                this.view.render();
            },

            bindUI: function () {
                var self = this,
                    el = self.view.getKeyEventTarget();

                if (self.get('focusable')) {
                    // remove smart outline in ie
                    // set outline in style for other standard browser
                    el.on("focus", self.handleFocus, self)
                        .on("blur", self.handleBlur, self)
                        .on("keydown", self.handleKeydown, self);
                }

                if (self.get('handleMouseEvents')) {
                    el = self.$el;

                    if (!isTouchEventSupported) {
                        el.on("mouseenter", self.handleMouseEnter, self)
                            .on("mouseleave", self.handleMouseLeave, self)
                            .on("contextmenu", self.handleContextMenu, self)
                    }

                    el.on(Gesture.start, self.handleMouseDown, self)
                        .on(Gesture.end, self.handleMouseUp, self)
                        // consider touch environment
                        .on(Gesture.tap, self.handleClick, self);
                    if (Gesture.cancel) {
                        el.on(Gesture.cancel, self.handleMouseUp, self);
                    }

                    // click quickly only trigger click and dblclick in ie<9
                    // others click click dblclick
                    if (ie && ie < 9) {
                        el.on("dblclick", self.handleDblClick, self);
                    }
                }
            },

            sync: function () {
                var self = this;
                self.fire('beforeSyncUI');
                self.syncUI();
                self.view.sync();
                self.__callPluginsMethod("pluginSyncUI");
                self.fire('afterSyncUI');
            },

            createComponent: function (cfg, parent) {
                return Manager.createComponent(cfg, parent || this);
            },

            '_onSetFocused': function (v) {
                var target = this.view.getKeyEventTarget()[0];
                if (v) {
                    target.focus();
                } else {
                    // force to move focus if just this.set('focused',false);
                    // do not changed focus if changed by other component focus
                    if (target.ownerDocument.activeElement == target) {
                        target.ownerDocument.body.focus();
                    }
                }
            },

            '_onSetX': function (x) {
                this.$el.offset({
                    left: x
                });
            },

            '_onSetY': function (y) {
                this.$el.offset({
                    top: y
                });
            },

            _onSetVisible: function (v) {
                // do not fire event at render phrase
                this.fire(v ? "show" : "hide");
            },

            /**
             * show component
             * @chainable
             */
            show: function () {
                var self = this;
                self.render();
                self.set("visible", true);
                return self;
            },

            /**
             * hide component
             * @chainable
             */
            hide: function () {
                var self = this;
                self.set("visible", false);
                return self;
            },

            focus: function () {
                if (this.get('focusable')) {
                    this.set('focused', true);
                }
            },

            blur: function () {
                if (this.get('focusable')) {
                    this.set('focused', false);
                }
            },

            move: function (x, y) {
                this.set({
                    x: x,
                    y: y
                });
            },

            handleDblClick: function (ev) {
                if (!this.get('disabled')) {
                    this.handleDblClickInternal(ev);
                }
            },

            /**
             * Hack click in ie<9 by handling dblclick events.
             * By default, this performs its associated action by calling
             * {@link KISSY.Component.Control#handleClickInternal}.
             * @protected
             * @param {KISSY.Event.DomEventObject} ev Dom event to handle.
             */
            handleDblClickInternal: function (ev) {
                this.handleClickInternal(ev);
            },

            handleMouseEnter: function (ev) {
                if (!this.get('disabled')) {
                    this.handleMouseEnterInternal(ev);
                }
            },

            /**
             * Handle mouseenter events. If the component is not disabled, highlights it.
             * @protected
             * @param {KISSY.Event.DomEventObject} ev Dom event to handle.
             */
            handleMouseEnterInternal: function (ev) {
                this.set("highlighted", !!ev);
            },

            handleMouseLeave: function (ev) {
                if (!this.get('disabled')) {
                    this.handleMouseLeaveInternal(ev);
                }
            },

            /**
             * Handle mouseleave events. If the component is not disabled, de-highlights it.
             * @protected
             * @param {KISSY.Event.DomEventObject} ev Dom event to handle.
             */
            handleMouseLeaveInternal: function (ev) {
                var self = this;
                self.set("active", false);
                self.set("highlighted", !ev);
            },

            handleMouseDown: function (ev) {
                if (!this.get('disabled')) {

                    this.handleMouseDownInternal(ev);
                }
            },

            /**
             * Handles mousedown events. If the component is not disabled,
             * If the component is activeable, then activate it.
             * If the component is focusable, then focus it,
             * else prevent it from receiving keyboard focus.
             * @protected
             * @param {KISSY.Event.DomEventObject} ev Dom event to handle.
             */
            handleMouseDownInternal: function (ev) {
                var self = this,
                    n,
                    isMouseActionButton = ev['which'] == 1;
                if (isMouseActionButton || isTouchEventSupported) {
                    if (self.get("activeable")) {
                        self.set("active", true);
                    }
                    if (self.get("focusable")) {
                        self.focus();
                    }
                    if (!self.get("allowTextSelection")) {
                        // firefox /chrome 不会引起焦点转移
                        n = ev.target.nodeName;
                        n = n && n.toLowerCase();
                        // do not prevent focus when click on editable element
                        if (n != "input" && n != "textarea") {
                            ev['preventDefault']();
                        }
                    }
                }
            },

            handleMouseUp: function (ev) {
                if (!this.get('disabled')) {
                    this.handleMouseUpInternal(ev);
                }
            },

            /**
             * Handles mouseup events.
             * If this component is not disabled, performs its associated action by calling
             * {@link KISSY.Component.Control#handleClickInternal}, then deactivates it.
             * @protected
             * @param {KISSY.Event.DomEventObject} ev Dom event to handle.
             */
            handleMouseUpInternal: function (ev) {
                var self = this;
                // 左键
                if (self.get("active") && (ev['which'] == 1 || isTouchEventSupported)) {
                    self.set("active", false);
                }
            },

            handleContextMenu: function (ev) {
                if (!this.get('disabled')) {
                    this.handleContextMenuInternal(ev);
                }
            },

            /**
             * Handles context menu.
             * @protected
             * @param {KISSY.Event.DomEventObject} ev Dom event to handle.
             */
            handleContextMenuInternal: function (ev) {
            },

            handleFocus: function () {
                if (!this.get('disabled')) {
                    this.handleFocusInternal();
                }
            },

            /**
             * Handles focus events. Style focused class.
             * @protected
             */
            handleFocusInternal: function () {
                this.focus();
                this.fire("focus");
            },

            handleBlur: function () {
                if (!this.get('disabled')) {
                    this.handleBlurInternal();
                }
            },

            /**
             * Handles blur events. Remove focused class.
             * @protected
             */
            handleBlurInternal: function () {
                this.blur();
                this.fire("blur");
            },

            handleKeydown: function (ev) {
                var self = this;
                if (!this.get('disabled') && self.handleKeyDownInternal(ev)) {
                    ev['halt']();
                    return true;
                }
                return undefined;
            },

            /**
             * Handle enter keydown event to {@link KISSY.Component.Control#handleClickInternal}.
             * @protected
             * @param {KISSY.Event.DomEventObject} ev Dom event to handle.
             */
            handleKeyDownInternal: function (ev) {
                if (ev['keyCode'] == Node.KeyCode.ENTER) {
                    return this.handleClickInternal(ev);
                }
                return undefined;
            },

            handleClick: function (ev) {
                if (!this.get('disabled')) {
                    this.handleClickInternal(ev);
                }
            },

            /**
             * Performs the appropriate action when this component is activated by the user.
             * @protected
             * @param {KISSY.Event.DomEventObject} ev Dom event to handle.
             */
            handleClickInternal: function (ev) {
            },

            /**
             * @protected
             */
            destructor: function () {
                // remove instance from manager
                Manager.removeComponent(this.get('id'));
                if (this.view) {
                    this.view.destroy();
                }
            }
        },
        {
            name: 'control',

            ATTRS: {
                id: {
                    view: 1,
                    valueFn: function () {
                        return S.guid('ks-component');
                    }
                },

                /**
                 * component's html content. Note: content and srcNode can not be set both!
                 * @type {String|KISSY.NodeList}
                 * @property content
                 */
                /**
                 * component's html content. Note: content and srcNode can not be set both!
                 * @cfg {String|KISSY.NodeList} content
                 */
                /**
                 * @ignore
                 */
                content: {
                    view: 1,
                    value: ''
                },

                /**
                 * component's width
                 * @type {Number|String}
                 * @property width
                 */
                /**
                 * component's width
                 * @cfg {Number|String} width
                 */
                /**
                 * @ignore
                 */
                width: {
                    view: 1
                },

                /**
                 * component's height
                 * @type {Number|String}
                 * @property height
                 */
                /**
                 * component's height
                 * @cfg {Number|String} height
                 */
                /**
                 * @ignore
                 */
                height: {
                    view: 1
                },

                /**
                 * css class of component's root element
                 * @cfg {String} elCls
                 */
                /**
                 * @ignore
                 */
                elCls: {
                    view: 1,
                    value: [],
                    setter: function (v) {
                        if (typeof v == 'string') {
                            v = v.split(/\s+/);
                        }
                        return v || [];
                    }
                },

                /**
                 * name-value pair css style of component's root element
                 * @cfg {Object} elStyle
                 */
                /**
                 * @ignore
                 */
                elStyle: {
                    view: 1,
                    value: {}
                },

                /**
                 * name-value pair attribute of component's root element
                 * @cfg {Object} elAttrs
                 */
                /**
                 * @ignore
                 */
                elAttrs: {
                    view: 1,
                    value: {}
                },

                /**
                 * archor element where component insert before
                 * @cfg {KISSY.NodeList} elBefore
                 */
                /**
                 * @ignore
                 */
                elBefore: {
                },

                /**
                 * root element of current component
                 * @type {KISSY.NodeList}
                 * @readonly
                 * @property el
                 */
                /**
                 * @ignore
                 */
                el: {
                    setter: function (el) {
                        // shortcut
                        this.$el = el;
                        this.el = el[0];
                    }
                },


                /**
                 * Horizontal axis
                 * @type {Number}
                 * @property x
                 */
                /**
                 * Horizontal axis
                 * @cfg {Number} x
                 */
                /**
                 * @ignore
                 */
                x: {
                },

                /**
                 * Vertical axis
                 * @type {Number}
                 * @property y
                 */
                /**
                 * Vertical axis
                 * @cfg {Number} y
                 */
                /**
                 * @ignore
                 */
                y: {
                },

                /**
                 * Horizontal and vertical axis.
                 * @ignore
                 * @type {Number[]}
                 */
                /**
                 * @ignore
                 */
                xy: {
                    setter: function (v) {
                        var self = this,
                            xy = S.makeArray(v);
                        if (xy.length) {
                            xy[0] && self.set("x", xy[0]);
                            xy[1] && self.set("y", xy[1]);
                        }
                        return v;
                    },
                    getter: function () {
                        return [this.get("x"), this.get("y")];
                    }
                },

                /**
                 * z-index value.
                 * @type {Number}
                 * @property zIndex
                 */
                /**
                 * z-index value.
                 * @cfg {Number} zIndex
                 */
                /**
                 * @ignore
                 */
                zIndex: {
                    view: 1
                },

                /**
                 * archor element where component append to
                 * @cfg {KISSY.NodeList} render
                 */
                /**
                 * @ignore
                 */
                render: {
                },

                /**
                 * whether this component is visible after created.
                 *
                 * will add/remove css class {prefix}{component}-hidden to component's root el.
                 *
                 * @cfg {Boolean} visible
                 */
                /**
                 * whether this component is visible.
                 *
                 * will add/remove css class {prefix}{component}-hidden to component's root el.
                 *
                 * @type {Boolean}
                 * @property visible
                 */
                /**
                 * @ignore
                 */
                visible: {
                    sync: 0,
                    value: true,
                    view: 1
                },

                /**
                 * kissy node or css selector to find the first match node
                 *
                 * parsed for configuration values,
                 * passed to component's HTML_PARSER definition
                 * @cfg {KISSY.NodeList|String} srcNode
                 *
                 */
                /**
                 * @ignore
                 */
                srcNode: {
                    setter: function (v) {
                        return Node.all(v);
                    }
                },

                /**
                 * Enables or disables mouse event handling for the component.
                 * Containers may set this attribute to disable mouse event handling
                 * in their child component.
                 *
                 * Defaults to: true.
                 *
                 * @cfg {Boolean} handleMouseEvents
                 * @protected
                 */
                /**
                 * @ignore
                 */
                handleMouseEvents: {
                    value: true
                },

                /**
                 * Whether this component can get focus.
                 *
                 * Defaults to: true.
                 *
                 * @protected
                 * @cfg {Boolean} focusable
                 */
                /**
                 * @ignore
                 */
                focusable: {
                    value: true,
                    view: 1
                },

                /**
                 * 1. Whether allow select this component's text.<br/>
                 * 2. Whether not to lose last component's focus if click current one (set false).
                 *
                 * Defaults to: false
                 *
                 * @cfg {Boolean} allowTextSelection
                 * @protected
                 */
                /**
                 * @ignore
                 */
                allowTextSelection: {
                    // 和 focusable 分离
                    // grid 需求：容器允许选择里面内容
                    value: false
                },

                /**
                 * Whether this component can be activated.
                 *
                 * Defaults to: true.
                 *
                 * @cfg {Boolean} activeable
                 * @protected
                 */
                /**
                 * @ignore
                 */
                activeable: {
                    value: true
                },

                /**
                 * Whether this component has focus.
                 * @type {Boolean}
                 * @property focused
                 */
                /**
                 * Whether this component has focus on initialization.
                 * @cfg {Boolean} focused
                 */
                /**
                 * @ignore
                 */
                focused: {
                    view: 1
                },

                /**
                 * Whether this component is activated.
                 * @type {Boolean}
                 * @property active
                 */
                /**
                 * @ignore
                 */
                active: {
                    view: 1,
                    value: false
                },

                /**
                 * Whether this component is highlighted.
                 * @type {Boolean}
                 * @property highlighted
                 */
                /**
                 * @ignore
                 */
                highlighted: {
                    view: 1,
                    value: false
                },

                /**
                 * This component's prefix css class.
                 * @cfg {String} prefixCls
                 */
                /**
                 * @ignore
                 */
                prefixCls: {
                    view: 1,
                    value: S.config('component/prefixCls') || 'ks-'
                },
                /**
                 * This component's prefix xclass. Only be used in cfg.
                 * To use this property as 'xclass' when not specified 'xclass' and 'xtype'
                 * @cfg {String} prefixXClass
                 */
                /**
                 * @ignore
                 */
                prefixXClass: {
                },
                /**
                 * This component's xtype, xclass = prefixXClass + xtype.
                 * @cfg {String} prefixXClass
                 */

                /**
                 * This component's parent component.
                 * @type {KISSY.Component.Control}
                 * @property parent
                 * @readonly
                 */
                /**
                 * This component's parent component.
                 * @cfg {KISSY.Component.Control} parent
                 */
                /**
                 * @ignore
                 */
                parent: {
                    setter: function (p, prev) {
                        if (prev = this.get('parent')) {
                            this.removeTarget(prev);
                        }
                        if (p) {
                            this.addTarget(p);
                        }
                    }
                },

                /**
                 * Whether this component is disabled.
                 * @type {Boolean}
                 * @property disabled
                 */
                /**
                 * Whether this component is disabled.
                 * @cfg {Boolean} disabled
                 */
                /**
                 * @ignore
                 */
                disabled: {
                    view: 1,
                    value: false
                },

                /**
                 * Render class.
                 * @protected
                 * @cfg {*} xrender
                 */
                /**
                 * @ignore
                 */
                xrender: {
                    value: Render
                },

                view: {
                    setter: function (v) {
                        this.view = v;
                    }
                }
            }
        });

    function getDefaultRender() {
        var attrs,
            constructor = this;
        do {
            attrs = constructor.ATTRS;
            constructor = constructor.superclass;
        } while (!attrs || !attrs.xrender);
        return attrs.xrender.value;
    }

    Control.getDefaultRender = getDefaultRender;

    Control.extend = function extend(extensions, px, sx) {
        var args = S.makeArray(arguments),
            baseClass = this,
            xclass,
            newClass,
            argsLen = args.length,
            last = args[argsLen - 1];

        if (xclass = last.xclass) {
            last.name = xclass;
        }

        newClass = ComponentProcess.extend.apply(baseClass, args);

        if (xclass) {
            Manager.setConstructorByXClass(xclass, newClass);
        }

        newClass.extend = extend;
        newClass.getDefaultRender = getDefaultRender;

        return newClass;
    };

    return Control;
}, {
    requires: [
        'node',
        './control/process',
        'component/manager',
        './control/render'
    ]
});
/*

 yiminghe@gmail.com - 2012.10.31
 - 考虑触屏，绑定 Event.Gesture.tap 为主行为事件
 - handleMouseDown/up 对应 Gesture.start/end


 事件冒泡机制
 - child 组件的冒泡源配置为其所属的 parent
 - 性能考虑:不是 child 的所有事件都冒泡到 parent，要具体配置哪些事件需要冒泡

 view 和 control 的平行关系
 - control 初始化 -> initializer -> new view()
 - control createDom -> createDom -> view.createDom()
 - control renderUI -> renderUI -> view.render()


 控制层元属性配置中 view 的作用
 - 如果没有属性变化处理函数，自动生成属性变化处理函数，自动转发给 view 层
 - 如果没有指定 view 层实例，在生成默认 view 实例时，所有用户设置的 view 的属性都转到默认 view 实例中


 observer synchronization, model 分成两类
 - view 负责监听 view 类 model 变化更新界面
 - control 负责监听 control 类变化改变逻辑



 problem: Observer behavior is hard to understand and debug
 because it's implicit behavior.

 Keeping screen state and session state synchronized is an important task
 Data Binding.

 In general data binding gets tricky
 because if you have to avoid cycles where a change to the control,
 changes the record set, which updates the control,
 which updates the record set....
 The flow of usage helps avoid these -
 we load from the session state to the screen when the screen is opened,
 after that any changes to the screen state propagate back to the session state.
 It's unusual for the session state to be updated directly once the screen is up.
 As a result data binding might not be entirely bi-directional -
 just confined to initial upload and
 then propagating changes from the controls to the session state.

 Refer
 - http://martinfowler.com/eaaDev/uiArchs.html

 */

