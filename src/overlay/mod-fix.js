/**
 * Overlay Fix Plugin
 * @author 乔花<qiaohua@taobao.com>
 */

KISSY.add('overlay-fix', function(S) {
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

                if (self.get(FIXED)) {
                    setFixed(self, true);
                }

                self.on('afterFixedChange', function(e) {
                    setFixed(self, e.newVal);
                });
            });
        }
    });

    /**
     * IE6 下 position: fixed
     * @param config
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

            body.appendChild(self.container);// or DOM.insertBefore(self.container, body.childNodes[0]);
            self.create = self.empty;
        },
        empty: function() {
        },
        add: function(elem) {
            var self = this;

            self.create();
            
            // 备份原来的父亲
            elem._parent = elem.container.parentNode;

            // 将 Overlay 及相关元素搬到 fixed 容器中
            if (elem.shim) {
                self.container.appendChild(elem.shim.iframe);
                //elem.shim.iframe.runtimeStyle.position = ABSOLUTE;
            }

            self.container.appendChild(elem.container);
            //elem.container.runtimeStyle.position = ABSOLUTE;
        },

        /**
         * 取消 elem 的 fixed 设置
         * @param elem
         */
        remove: function(elem) {
            var parent;

            // 将 Overlay 搬到原来的 parent 中
            if (elem.container.parentNode === this.container) {
                parent = elem._parent || body;

                parent.appendChild(elem.container);
                //elem.container.runtimeStyle.position = ABSOLUTE;
                if (elem.shim) {
                    elem.shim && parent.appendChild(elem.shim.iframe);
                    //elem.shim.iframe.runtimeStyle.position = ABSOLUTE;
                }

                elem._parent = undefined;
            }
            // 这里保留 fixed 层
        }
    });

    function setFixed(elem, f) {
        if (!elem.container) return;

        // 更新left/top
        updatePosition(elem, f);

        if (f) {
            if (!ie6) {
                DOM.css(elem.container, POSITION, FIXED);
            } else {
                DOM.css(elem.container, POSITION, ABSOLUTE);

                if (!rf) {
                    rf = new RepairFixed();
                }
                rf.add(elem);
            }
        } else {
            if (!ie6) {
                DOM.css(elem.container, POSITION, ABSOLUTE);
            } else {
                rf.remove(elem);
            }
        }
    }

    function updatePosition(elem, f) {
        var old;
        
        old = DOM.offset(elem.container);
        DOM.offset(elem.container, {
            left: old.left + (f ? -DOM.scrollLeft() : DOM.scrollLeft()),
            top: old.top + (f ? -DOM.scrollTop() : DOM.scrollTop())});
    }

}, { host: 'overlay' });


/**
 * Note:
 * - 2010/11/04  加入 fixed 支持
 */