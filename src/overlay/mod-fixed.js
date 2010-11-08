/**
 * Overlay Fixed Plugin
 * @author 乔花<qiaohua@taobao.com>
 */
KISSY.add('overlay-fixed', function(S) {
    var DOM = S.DOM,
        Overlay = S.Overlay,
        FIXED = 'fixed', POSITION = 'position', ABSOLUTE = 'absolute',
        ie6 = S.UA.ie === 6, rf, body = document.body;

    S.mix(Overlay.ATTRS, {
        fixed: {
            value: false
        }
    });

    Overlay.Plugins.push({
        name: FIXED,
        init: function(host) {
            host.on('create', function() {
                var self = this;
                setFixed(self, self.get(FIXED));
            });
        }
    });

    /**
     * IE6 下 position: fixed
     * @see http://www.cnblogs.com/cloudgamer/archive/2010/10/11/AlertBox.html
     */
    function RepairFixed() {
    }

    S.augment(RepairFixed, {
        create: function() {
            var self = this;

            body = document.body;
            if (body.currentStyle.backgroundAttachment !== FIXED) {
                if (body.currentStyle.backgroundImage === "none") {
                    body.runtimeStyle.backgroundRepeat = "no-repeat";
                    body.runtimeStyle.backgroundImage = "url(about:blank)";
                }
                body.runtimeStyle.backgroundAttachment = FIXED;
            }

            self.container = document.createElement("<div class=" + "ks-overlay-" + FIXED + " style='position:absolute;border:0;padding:0;margin:0;overflow:hidden;background:transparent;top:expression((document).documentElement.scrollTop);left:expression((document).documentElement.scrollLeft);width:expression((document).documentElement.clientWidth);height:expression((document).documentElement.clientHeight);display:block;'>");
            body.appendChild(self.container);

            self.create = undefined;
        },
        add: function(elem) {
            var self = this;

            self.create && self.create();

            // 将 Overlay 及相关元素搬到 fixed 容器中
            if (elem.shim) {
                self.container.appendChild(elem.shim.iframe);
            }
            self.container.appendChild(elem.container);
        }
    });

    function setFixed(elem, f) {
        if (!(elem.container && f)) return;

        // 更新left/top
        var old;
        old = DOM.offset(elem.container);
        DOM.offset(elem.container, {
            left: old.left - DOM.scrollLeft(),
            top: old.top - DOM.scrollTop()
        });

        DOM.css(elem.container, POSITION, ie6 ? ABSOLUTE : FIXED);
        if (ie6) {
            if (!rf) {
                rf = new RepairFixed();
            }
            rf.add(elem);
        }
    }
}, { host: 'overlay' });

/**
 * Note:
 * - 2010/11/04  加入 fixed 支持
 */