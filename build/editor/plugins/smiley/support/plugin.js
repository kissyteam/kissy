/**
 * emotion icon from wangwang
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("smiley/support", function() {
    var S = KISSY,
        Event = S.Event,
        KE = S.Editor,
        DOM = S.DOM;

    DOM.addStyleSheet('.ke-smiley-sprite {'
        + ' background: url("http://a.tbcdn.cn/sys/wangwang/smiley/sprite.png") no-repeat scroll -1px 0 transparent;'
        + ' height: 235px;'
        + ' width: 288px;'
        + ' margin: 5px;'
        + 'zoom: 1;'
        + ' overflow: hidden;'
        + '}'
        + '.ke-smiley-sprite a {'
        + '   width: 24px;'
        + 'height: 24px;'
        + ' border: 1px solid white;'
        + ' float: left;'
        + '}'
        + '.ke-smiley-sprite a:hover {'
        + ' border: 1px solid #808080;'
        + '}'
        , "smiley");

    var smiley_markup;

    function initMarkup() {
        if (smiley_markup) return smiley_markup;
        smiley_markup = "<div class='ke-smiley-sprite'>";
        for (var i = 0; i <= 98; i++) {
            smiley_markup += "<a href='#' " +
                "data-icon='http://a.tbcdn.cn/sys/wangwang/smiley/48x48/" + i + ".gif'>" +
                "</a>"
        }
        smiley_markup += "</div>";
        return smiley_markup;
    }

    var addRes = KE.Utils.addRes,
        destroyRes = KE.Utils.destroyRes;

    KE.SmileySupport = {
        _selectSmiley:function(ev) {
            ev.halt();
            var self = this,editor = self.editor;
            var t = new S.Node(ev.target),
                icon;
            if (t._4e_name() == "a"
                && (icon = t.attr("data-icon"))) {
                var img = new S.Node("<img " +
                    "alt='' src='" +
                    icon + "'/>", null,
                    editor.document);
                editor.insertElement(img);
                this.smileyWin.hide();
            }
        },
        _hidePanel:function(ev) {
            var self = this,
                el = self.btn.get("el"),
                t = new S.Node(ev.target),
                smileyWin = self.smileyWin;
            //当前按钮点击无效
            if (el._4e_equals(t) || el.contains(t)) {
                return;
            }
            smileyWin.hide();
        },
        _prepare:function() {
            var self = this,
                cfg = self.cfg,
                el = self.btn,
                editor = self.editor;
            var smiley_markup = initMarkup();
            self.smileyWin = new KE.Overlay({
                content:smiley_markup,
                focus4e:false,
                width:"297px",
                autoRender:true,
                elCls:"ks-popup",
                zIndex:KE.baseZIndex(KE.zIndexManager.POPUP_MENU),
                mask:false
            });
            var smileyWin = self.smileyWin;
            self.smileyPanel = smileyWin.get("contentEl");
            smileyWin.on("show", el.bon, el);
            smileyWin.on("hide", el.boff, el);
            self.smileyPanel.on("click", cfg._selectSmiley, self);
            Event.on(document, "click", cfg._hidePanel, self);
            Event.on(editor.document, "click", cfg._hidePanel, self);
            self.cfg._prepare = self.cfg._real;
            addRes.call(self, self.smileyWin, self.smileyPanel, function() {
                Event.remove(document, "click", cfg._hidePanel, self);
                Event.remove(editor.document, "click", cfg._hidePanel, self);
            });
            self.call("_real");
        },
        _real:function() {
            var self = this,
                el = self.btn.get("el"),
                xy = el.offset();
            xy.top += el.height() + 5;
            if (xy.left + self.smileyPanel.width() > DOM.viewportWidth() - 60) {
                xy.left = DOM.viewportWidth() - self.smileyPanel.width() - 60;
            }
            self.smileyWin.set("xy", [xy.left,xy.top]);
            self.smileyWin.show();
        },
        offClick:function() {
            var self = this;
            KE.use("overlay", function() {
                self.call("_prepare");
            });
        },
        onClick:function() {
            this.smileyWin && this.smileyWin.hide();
        },
        destroy:function() {
            var self = this;
            destroyRes.call(self);
        }
    };
}, {
    attach:false
});