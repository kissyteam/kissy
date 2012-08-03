/**
 * flash base for all flash-based plugin
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("flash/support", function () {
    var S = KISSY,
        KE = S.Editor,
        UA = S.UA,
        Event = S.Event,
        ContextMenu = KE.ContextMenu,
        Node = S.Node,
        BubbleView = KE.BubbleView,
        CLS_FLASH = 'ke_flash',
        TYPE_FLASH = 'flash',
        flashUtils = KE.Utils.flash;

    /**
     * 写成类的形式而不是一个简单的button命令配置，为了可以override
     * 所有基于 flash 的插件基类，使用 template 模式抽象
     * @param editor
     */
    function Flash(editor) {
        var self = this;
        self.editor = editor;
        self._init();
    }

    S.augment(Flash, {

        /**
         * 配置信息，用于子类覆盖
         * @override
         */
        _config:function () {
            var self = this;
            self._cls = CLS_FLASH;
            self._type = TYPE_FLASH;
            self._contextMenu = contextMenu;
            self._flashRules = ["img." + CLS_FLASH];
        },
        _init:function () {
            this._config();
            var self = this,
                editor = self.editor,
                myContexts = {},
                contextMenu = self._contextMenu;
            //右键功能关联到编辑器实例
            if (contextMenu) {
                for (var f in contextMenu) {
                    (function (f) {
                        myContexts[f] = function () {
                            contextMenu[f](self);
                        }
                    })(f);
                }
            }
            //注册右键，contextmenu时检测
            self._contextMenu = ContextMenu.register({
                editor:editor,
                rules:self._flashRules,
                width:"120px",
                funcs:myContexts
            });

            //注册泡泡，selectionChange时检测
            BubbleView.attach({
                pluginName:self._type,
                editor:self.editor,
                pluginContext:self
            });
            //注册双击，双击时检测
            Event.on(editor.document, "dblclick", self._dbclick, self);
        },

        /**
         * 子类覆盖，如何从flash url得到合适的应用表示地址
         * @override
         * @param r flash 元素
         */
        _getFlashUrl:function (r) {
            return flashUtils.getUrl(r);
        },
        /**
         * 更新泡泡弹出的界面，子类覆盖
         * @override
         * @param tipurl
         * @param selectedFlash
         */
        _updateTip:function (tipurl, selectedFlash) {
            var self = this,
                editor = self.editor,
                r = editor.restoreRealElement(selectedFlash);
            if (!r) return;
            var url = self._getFlashUrl(r);
            //tipurl.html(url);
            tipurl.attr("href", url);
        },

        //根据图片标志触发本插件应用
        _dbclick:function (ev) {
            var self = this, t = new Node(ev.target);
            if (t._4e_name() === "img" && t.hasClass(self._cls)) {
                self.show(null, t);
                ev.halt();
            }
        },

        show:function (ev, selected) {
            var self = this,
                editor = self.editor;
            editor.showDialog(self._type + "/dialog", [selected]);
        },

        destroy:function () {
            var self = this,
                editor = self.editor;
            self._contextMenu.destroy();
            BubbleView.destroy(self._type);
            Event.remove(editor.document, "dblclick", self._dbclick, self);
            editor.destroyDialog(self._type + "/dialog");
        }
    });

    KE.Flash = Flash;

    /**
     * tip初始化，所有共享一个tip
     */
    var tipHtml = ' <a ' +
        'class="ke-bubbleview-url" ' +
        'target="_blank" ' +
        'href="#">{label}</a>   |   '
        + ' <span class="ke-bubbleview-link ke-bubbleview-change">编辑</span>   |   '
        + ' <span class="ke-bubbleview-link ke-bubbleview-remove">删除</span>';

    /**
     * 泡泡判断是否选择元素符合
     * @param node
     */
    function checkFlash(node) {
        return node._4e_name() === 'img' &&
            (!!node.hasClass(CLS_FLASH)) &&
            node;
    }

    /**
     * 注册一个泡泡
     * @param pluginName
     * @param label
     * @param checkFlash
     */
    Flash.registerBubble = function (pluginName, label, checkFlash) {

        BubbleView.register({
            pluginName:pluginName,
            func:checkFlash,
            init:function () {
                var bubble = this,
                    el = bubble.get("contentEl");
                el.html(S.substitute(tipHtml, {
                    label:label
                }));
                var tipurl = el.one(".ke-bubbleview-url"),
                    tipchange = el.one(".ke-bubbleview-change"),
                    tipremove = el.one(".ke-bubbleview-remove");
                //ie focus not lose
                KE.Utils.preventFocus(el);

                tipchange.on("click", function (ev) {
                    //回调show，传入选中元素
                    bubble._plugin.show(null, bubble._selectedEl);
                    ev.halt();
                });

                tipremove.on("click", function (ev) {
                    var flash = bubble._plugin;
                    //chrome remove 后会没有焦点
                    if (UA['webkit']) {
                        var r = flash.editor.getSelection().getRanges();
                        r && r[0] && (r[0].collapse(true) || true) && r[0].select();
                    }
                    bubble._selectedEl._4e_remove();
                    bubble.hide();
                    flash.editor.notifySelectionChange();
                    ev.halt();
                });
                KE.Utils.addRes.call(bubble, tipchange, tipremove);

                /*
                 位置变化，在显示前就设置内容，防止ie6 iframe遮罩不能正确大小
                 */
                bubble.on("show", function () {

                    var a = bubble._selectedEl,
                        flash = bubble._plugin;
                    if (!a)return;
                    flash._updateTip(tipurl, a);
                });
            }
        });
    };


    Flash.registerBubble("flash", "在新窗口查看", checkFlash);
    Flash.checkFlash = checkFlash;

    //右键功能列表
    var contextMenu = {
        "Flash属性":function (cmd) {
            var editor = cmd.editor,
                selection = editor.getSelection(),
                startElement = selection && selection.getStartElement(),
                flash = checkFlash(startElement);
            if (flash) {
                cmd.show(null, flash);
            }
        }
    };

    Flash.CLS_FLASH = CLS_FLASH;
    Flash.TYPE_FLASH = TYPE_FLASH;

    Flash.Insert = function (editor, src, attrs, _cls, _type, callback) {
        var nodeInfo = flashUtils.createSWF(src, {
            attrs:attrs
        }, editor.document),
            real = nodeInfo.el,
            substitute = editor.createFakeElement ?
                editor.createFakeElement(real,
                    _cls || 'ke_flash',
                    _type || 'flash',
                    true,
                    nodeInfo.html,
                    attrs) :
                real;
        editor.insertElement(substitute, null, callback);
    };

    KE.Flash = Flash;

}, {
    attach:false,
    requires:["bubbleview", "contextmenu", "flashutils"]
});