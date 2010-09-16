/**
 * KISSY Mask
 * @creator     乔花<qiaohua@taobao.com>
 */
KISSY.add('mask', function(S, undefined) {

    var DOM = S.DOM,
        DISPLAY = 'display',
        ie = S.UA.ie,
        ie6 = ie === 6,

        MASK_STYLE = 'position:absolute;left:0;top:0;width:100%;border:0;background:black;z-index:9998;display:none;',
        SHIM_STYLE = 'position:absolute;z-index:9997;border:0;display:none;',

        defaultConfig = {
            shim: false,
            opacity: .6,
            style: ''
        };
    /*
     * Mask Class
     * @constructor
     * attached members：
     *   - this.iframe
     *   - this.config
     *   - this.layer
     */
    function Mask(config){

        if (!(this instanceof Mask)) {
            return new Mask(config);
        }

        config = S.merge(defaultConfig, config);

        var isShim = config.shim,
            style = isShim ? SHIM_STYLE : MASK_STYLE + config.style,
            opacity = isShim ? 0 : config.opacity,
            ifr = createMaskElem('<iframe>', style, opacity, !isShim);

        if (!isShim && ie) this.layer = createMaskElem('<div>', style, opacity, true);

        this.config = config;
        this.iframe = ifr;
    }

    S.augment(Mask, {

        show: function() {
            DOM.show([this.iframe, this.layer]);
        },

        hide: function() {
            DOM.hide([this.iframe, this.layer]);
        },

        toggle: function() {
            var isVisible = DOM.css(this.iframe, DISPLAY) !== 'none';
            this[isVisible ? 'hide' : 'show']();
        },

        setSize: function(w, h) {
            setSize(this.iframe, w, h);
            setSize(this.layer, w, h);
        },

        setOffset: function(x, y) {
            var offset = x;

            if (y !== undefined) {
                offset = {
                    left: x,
                    top: y
                }
            }
            DOM.offset([this.iframe, this.layer], offset);
        }
    });

    function createMaskElem(tag, style, opacity, setWH) {
        var elem = DOM.create(tag);

        DOM.attr(elem, 'style', style);
        DOM.css(elem, 'opacity', opacity);

        if (setWH) {
            DOM.height(elem, DOM.docHeight());
            if (ie6) {
                DOM.width(elem, DOM.docWidth());
            }
        }

        document.body.appendChild(elem);
        return elem;
    }

    function setSize(elem, w, h) {
        if (elem) {
            DOM.width(elem, w);
            DOM.height(elem, h);
        }
    }

    S.Mask = Mask;
});
