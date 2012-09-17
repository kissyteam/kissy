/**
 * bubble or tip view for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("bubbleview", function () {
    var S = KISSY,
        UA = S.UA,
        KE = S.Editor,
        Event = S.Event,
        DOM = S.DOM;

    if (KE.BubbleView) {
        S.log("attach bubbleview more", "warn");
        return;
    }

    var BubbleView = S.require("uibase").create(KE.Overlay, [], {
        renderUI:function () {
            var el = this.get("el");
            el.addClass("ke-bubbleview-bubble");
        },
        show:function () {
            var el = this.get("el");
            el.css("visibility", "hidden");
            el.stop(1);
            el.css("display", 'none');
            this.set("visible", true);
            el.fadeIn(0.3);
        },
        hide:function () {
            var el = this.get("el");
            el.css("visibility", "hidden");
            el.stop(1);
            this.set("visible", false);
        },
        destructor:function () {
            KE.Utils.destroyRes.call(this);
        }
    }, {
        ATTRS:{
            focus4e:{
                value:false
            },
            "zIndex":{
                value:KE.baseZIndex(KE.zIndexManager.BUBBLE_VIEW)
            }
        }
    });

    var holder = {};

    function inRange(t, b, r) {
        return t <= r && b >= r;
    }

    /**
     * 是否两个bubble上下重叠？
     * @param b1
     * @param b2
     */
    function overlap(b1, b2) {
        var b1_top = b1.get("y"), b1_bottom = b1_top + b1.get("el")[0].offsetHeight;

        var b2_top = b2.get("y"), b2_bottom = b2_top + b2.get("el")[0].offsetHeight;

        return inRange(b1_top, b1_bottom, b2_bottom) || inRange(b1_top, b1_bottom, b2_top);
    }

    /**
     * 得到依附在同一个节点上的所有bubbleview中的最下面一个
     * @param self
     */
    function getTopPosition(self) {
        var archor = null;
        for (var p in holder) {
            if (holder.hasOwnProperty(p)) {
                var h = holder[p];
                if (h.bubble) {
                    if (self != h.bubble
                        && h.bubble.get("visible")
                        && overlap(self, h.bubble)
                        ) {
                        if (!archor) {
                            archor = h.bubble;
                        } else if (archor.get("y") < h.bubble.get("y")) {
                            archor = h.bubble;
                        }
                    }
                }
            }
        }
        return archor;
    }

    function getXy(bubble, editor) {

        var el = bubble._selectedEl;

        if (!el) {
            //S.log("bubble already detached from el");
            return undefined;
        }

        var editorWin = editor.iframe[0].contentWindow;

        var iframeXY = editor.iframe.offset(),
            top = iframeXY.top,
            left = iframeXY.left,
            right = left + DOM.width(editorWin),
            bottom = top + DOM.height(editorWin),
            elXY = el._4e_getOffset(document),
            elTop = elXY.top,
            elLeft = elXY.left,
            elRight = elLeft + el.width(),
            elBottom = elTop + el.height();

        var x, y;

        // ie 图片缩放框大于编辑区域底部，bubble 点击不了了，干脆不显示
        if (S.UA.ie &&
            el[0].nodeName.toLowerCase() == 'img' &&
            elBottom > bottom) {
            return undefined;
        }

        // 对其下边
        // el 位于编辑区域，下边界超了编辑区域下边界
        if (elBottom > bottom && elTop < bottom) {
            // 别挡着滚动条
            y = bottom - 30;
        }
        // el bottom 在编辑区域内
        else if (elBottom > top && elBottom < bottom) {
            y = elBottom;
        }

        // 同上，对齐左边
        if (elRight > left && elLeft < left) {
            x = left;
        } else if (elLeft > left && elLeft < right) {
            x = elLeft;
        }

        if (x !== undefined && y !== undefined) {
            return [x, y];
        }
        return undefined;
    }

    function getInstance(pluginName) {
        var h = holder[pluginName];
        if (!h.bubble) {
            h.bubble = new BubbleView();
            h.bubble.render();
            if (h.cfg.init) {
                h.cfg.init.call(h.bubble);
            }
        }
        return h.bubble;
    }


    BubbleView.destroy = function (pluginName) {
        var h = holder[pluginName];
        if (h && h.bubble) {
            h.bubble.destroy();
            h.bubble = null;
        }
    };

    BubbleView.attach = function (cfg) {
        var pluginName = cfg.pluginName,
            cfgDef = holder[pluginName];
        S.mix(cfg, cfgDef.cfg, false);
        var pluginContext = cfg.pluginContext,
            func = cfg.func,
            editor = cfg.editor,
            bubble = cfg.bubble;
        // 借鉴google doc tip提示显示
        editor.on("selectionChange", function (ev) {
            var elementPath = ev.path,
                elements = elementPath.elements,
                a,
                lastElement;
            if (elementPath && elements) {
                lastElement = elementPath.lastElement;
                if (!lastElement) {
                    return;
                }
                a = func(lastElement);
                if (a) {
                    bubble = getInstance(pluginName);
                    bubble._selectedEl = a;
                    bubble._plugin = pluginContext;
                    // 重新触发 bubble show事件
                    bubble.hide();
                    // 等所有bubble hide 再show
                    S.later(onShow, 10);
                } else if (bubble) {
                    bubble._selectedEl = bubble._plugin = null;
                    onHide();
                }
            }
        });
        //代码模式下就消失
        //!TODO 耦合---
        function onHide() {
            if (bubble) {
                bubble.hide();
                Event.remove(editorWin, "scroll", onScroll);
            }
        }

        editor.on("sourcemode", onHide);

        var editorWin = editor.iframe[0].contentWindow;

        function showImmediately() {

            var xy = getXy(bubble, editor);
            if (xy) {
                bubble.set("xy", xy);
                var archor = getTopPosition(bubble);
                if (!archor) {
                } else {
                    xy[1] = archor.get("y") + archor.get("el")[0].offsetHeight;
                    bubble.set("xy", xy);
                }
                if (!bubble.get("visible")) {
                    bubble.show();
                } else {
                    S.log("already show by selectionChange");
                }
            }
        }

        var bufferScroll = KE.Utils.buffer(showImmediately, undefined, 350);


        function onScroll() {
            if (!bubble._selectedEl) {
                return;
            }
            if (bubble) {
                var el = bubble.get("el");
                bubble.hide();
            }
            bufferScroll();
        }

        function onShow() {
            Event.on(editorWin, "scroll", onScroll);
            showImmediately();
        }
    };

    BubbleView.register = function (cfg) {
        var pluginName = cfg.pluginName;
        holder[pluginName] = holder[pluginName] || {
            cfg:cfg
        };
        if (cfg.editor) {
            BubbleView.attach(cfg);
        }
    };

    KE.BubbleView = BubbleView;
}, {
    attach:false,
    requires:["overlay"]
});