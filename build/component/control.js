/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 2 12:39
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 component/control/common-process
 component/control/process
 component/control/render-process
 component/control/render-tpl
 component/control/render
 component/control
*/

/**
 * @ignore
 * common process for control and render
 * @author yiminghe@gmail.com
 */
KISSY.add('component/control/common-process', function (S, RichBase, Promise) {

    var Defer = Promise.Defer,
        noop = S.noop;

    function syncUIs(self) {
        /**
         * @event beforeSyncUI
         * fired before component 's internal state is synchronized.
         * @param {KISSY.Event.CustomEventObject} e
         */

        self.fire('beforeSyncUI');
        self.callMethodByHierarchy("syncUI", "__syncUI");
        self.callPluginsMethod("syncUI");

        /**
         * @event afterSyncUI
         * fired after component 's internal state is synchronized.
         * @param {KISSY.Event.CustomEventObject} e
         */
        self.fire('afterSyncUI');
    }

    /**
     * @class KISSY.Component.CommonProcess
     * @extends KISSY.RichBase
     */
    var CommonProcess = RichBase.extend({

        bindInternal: noop,

        syncInternal: noop,

        initializer: function () {
            this._createdDefer = new Defer();
            this._renderedDefer = new Defer();
        },

        'onCreated': function (fn) {
            return this._createdDefer.promise.then(fn);
        },

        onRendered: function (fn) {
            return this._renderedDefer.promise.then(fn);
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
                self.callMethodByHierarchy("renderUI", "__renderUI");
                self.callPluginsMethod("renderUI");

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
                CommonProcess.superclass.bindInternal.call(self);
                self.callMethodByHierarchy("bindUI", "__bindUI");
                self.callPluginsMethod("bindUI");

                /**
                 * @event afterBindUI
                 * fired when component 's internal event is bind.
                 * @param {KISSY.Event.CustomEventObject} e
                 */
                self.fire('afterBindUI');

                CommonProcess.superclass.syncInternal.call(self);
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

        plug: function () {
            var self = this,
                p,
                plugins = self.get('plugins');
            CommonProcess.superclass.plug.apply(self, arguments);
            p = plugins[plugins.length - 1];
            if (self.get('rendered')) {
                // plugin does not support decorate
                p.pluginCreateDom && p.pluginCreateDom(self);
                p.pluginRenderUI && p.pluginRenderUI(self);
                p.pluginBindUI && p.pluginBindUI(self);
                p.pluginSyncUI && p.pluginSyncUI(self);
            } else if (self.get('created')) {
                p.pluginCreateDom && p.pluginCreateDom(self);
            }
            return self;
        }

    }, {

        name: 'CommonProcess',

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
                value: false,
                setter: function (v) {
                    if (v) {
                        this._createdDefer.resolve(this);
                    }
                }
            }
        }
    });

    return CommonProcess;
}, {
    requires: ['rich-base', 'promise']
});
/**
 * @ignore
 * ControlProcess for component
 * @author yiminghe@gmail.com
 */
KISSY.add('component/control/process', function (S, CommonProcess) {

    /**
     * @class KISSY.Component.ControlProcess
     * @extends KISSY.Component.CommonProcess
     */
    var ControlProcess = CommonProcess.extend({

        /**
         * create dom structure of this component (delegate to render).
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
                self.callMethodByHierarchy("createDom", "__createDom");
                self.callPluginsMethod("createDom");

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

        destroy: function () {
            if (this.get('created')) {
                ControlProcess.superclass.destroy.apply(this, arguments);
            }
        }

    }, {
        name: 'ControlProcess'
    });

    return ControlProcess;
}, {
    requires: ['./common-process']
});
/**
 * @ignore
 *
 * 2013.06.18 note:
 *  - RenderProcess/ControlProcess 流程化渲染过程定义
 *
 * Refer:
 *  - http://martinfowler.com/eaaDev/uiArchs.html
 *
 * render 和 create 区别
 *  - render 包括 create ，以及把生成的节点放在 document 中
 *  - create 仅仅包括创建节点
 **/
/**
 * @ignore
 * render process for component
 * @author yiminghe@gmail.com
 */
KISSY.add('component/control/render-process', function (S, CommonProcess) {

    /**
     * @class KISSY.Component.RenderProcess
     * @extends KISSY.Component.CommonProcess
     */
    var RenderProcess = CommonProcess.extend({

        /**
         * Create dom structure of this component.
         * @chainable
         */
        create: function () {
            var self = this;
            if (!self.get("created")) {
                self.callMethodByHierarchy("beforeCreateDom",
                    "__beforeCreateDom",
                    [self.renderData = {}, self.childrenElSelectors = {}]);
                self.callMethodByHierarchy("createDom", "__createDom");
                self.callPluginsMethod("createDom");
                self.setInternal("created", true);
            }
            return self;
        },

        /**
         * decorate from existing dom structure
         * @param srcNode
         * @returns {*}
         */
        decorate: function (srcNode) {
            var self = this;
            if (!self.get("created")) {
                self.callMethodByHierarchy("decorateDom", "__decorateDom",
                    [srcNode]);
                self.callPluginsMethod("createDom");
                self.setInternal("created", true);
            }
            return self;
        }
    }, {
        name: 'RenderProcess'
    });

    return RenderProcess;
}, {
    requires: ['./common-process']
});
/*
  Generated by kissy-tpl2mod.
*/
KISSY.add('component/control/render-tpl',
'<div id="{{id}}" class="{{getBaseCssClasses ""}} {{#each elCls}} {{.}} {{/each}} " {{#each elAttrs}} {{xkey}}="{{.}}" {{/each}} style=" {{#each elStyle}} {{xkey}}:{{.}}; {{/each}} ">');
/**
 * @ignore
 * render base class for kissy
 * @author yiminghe@gmail.com
 * refer: http://martinfowler.com/eaaDev/uiArchs.html
 */
KISSY.add("component/control/render", function (S, RenderProcess, XTemplate, RenderTpl, Manager) {

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

    function applyParser(srcNode, parser, control) {
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

    /**
     * @ignore
     * Base Render class for KISSY Component.
     */
    return RenderProcess.extend({

        isRender: true,

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
                control = self.control,
                tpl, html;

            tpl = startTpl + self.get('contentTpl') + endTpl;
            html = self.renderTpl(tpl);
            control.setInternal("el", self.$el = $(html));
            self.el = self.$el[0];
            self.fillChildrenElsBySelectors();
        },

        decorateDom: function (srcNode) {
            var self = this,
                c = self.constructor,
                control = self.control,
                len, p, constructorChains;

            if (!srcNode.attr('id')) {
                srcNode.attr('id', control.get('id'));
            }

            constructorChains = self['collectConstructorChains']();

            // 从父类到子类开始从 html 读取属性
            for (len = constructorChains.length - 1; len >= 0; len--) {
                c = constructorChains[len];
                if (p = c.HTML_PARSER) {
                    applyParser.call(self, srcNode, p, control);
                }
            }
            control.setInternal("el", self.$el = srcNode);
            self.el = srcNode[0];
        },

        renderUI: function () {
            var self = this,
                control = self.control,
                el = self.$el;

            // 新建的节点才需要摆放定位
            if (!control.get('srcNode')) {
                var render = control.get('render'),
                    renderBefore = control.get('elBefore');
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

        syncUI: function () {

        },

        destructor: function () {
            this.$el.remove();
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
                        el.all(S.substitute(selector, self.renderData)));
                }
                delete childrenElSelectors[childName];
            }
        },

        renderTpl: function (tpl, renderData) {
            var self = this;
            renderData = renderData || self.renderData;
            return new XTemplate(tpl, {
                commands: {
                    getBaseCssClasses: function (scope, option) {
                        return self.getBaseCssClasses(option.params[0]);
                    }
                }
            }).render(renderData);
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
                prefixCls = control.prefixCls;
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
                this.control.prefixCls,
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
            control: {
                setter: function (v) {
                    this.control = v;
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
/**
 * @ignore
 * Base Control class for KISSY Component.
 * @author yiminghe@gmail.com
 */
KISSY.add("component/control", function (S, Node, ControlProcess, Manager, Render, undefined) {

    var ie = S.Env.host.document.documentMode || S.UA.ie,
        Features = S.Features,
        Gesture = Node.Gesture,
        isTouchEventSupported = Features.isTouchEventSupported();

    /**
     * Base Control class for KISSY Component.
     * @extends KISSY.Component.RenderProcess
     * @class KISSY.Component.Control
     */
    var Control = ControlProcess.extend({

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
             * @public
             * @member KISSY.Component.Control
             */
            isControl: true,

            initializer: function () {
                // shortcut
                this.prefixCls = this.get('prefixCls');
            },

            /**
             * Constructor(or get) view object to create ui elements.
             * @protected
             */
            createDom: function () {
                var self = this,
                    Render = self.get('xrender'),
                    view = self.get('view'),
                    srcNode = self.get('srcNode'),
                    id = self.get("id"),
                    el;
                // initialize view
                // allow custom view instance
                if (view) {
                    view.set('control', self);
                } else {
                    self.set('view', view = new Render({
                        control: self
                    }));
                }
                if (srcNode) {
                    view.decorate(srcNode);
                } else {
                    view.create();
                }
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
                Control.superclass.sync.apply(this, arguments);
                this.view.sync();
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
             * @param {KISSY.Event.DOMEventObject} ev Dom event to handle.
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
             * @param {KISSY.Event.DOMEventObject} ev Dom event to handle.
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
             * @param {KISSY.Event.DOMEventObject} ev Dom event to handle.
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
             * @param {KISSY.Event.DOMEventObject} ev Dom event to handle.
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
             * @param {KISSY.Event.DOMEventObject} ev Dom event to handle.
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
             * @param {KISSY.Event.DOMEventObject} ev Dom event to handle.
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
             * @param {KISSY.Event.DOMEventObject} ev Dom event to handle.
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
             * @param {KISSY.Event.DOMEventObject} ev Dom event to handle.
             */
            handleClickInternal: function (ev) {
            },

            /**
             * @protected
             */
            destructor: function () {
                // remove instance from manager
                Manager.removeComponent(this.get('id'));
                this.view.destroy();
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

        newClass = ControlProcess.extend.apply(baseClass, args);

        if (xclass) {
            Manager.setConstructorByXClass(xclass, newClass);
        }

        newClass.extend = extend;

        return newClass;
    };

    return Control;
}, {
    requires: ['node', './control/process', 'component/manager', './control/render']
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

