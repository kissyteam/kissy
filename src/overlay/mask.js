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

    function Mask(config){

        if (!(this instanceof Mask)) {
            return new Mask(config);
        }

        config = S.merge(defaultConfig, config);

        var isShim = config.shim,
            ifr = DOM.create('<iframe>');

        DOM.attr(ifr, 'style', isShim ? SHIM_STYLE : MASK_STYLE + config.style);

        var tmp;
        if(isShim) config.opacity = 0;
        else {
            DOM.height(ifr, DOM.docHeight());
            if (ie6) {
                DOM.width(ifr, DOM.docWidth());
            }
            if (ie){
                tmp = DOM.create('<div>');
                DOM.attr(tmp, 'style', MASK_STYLE + config.style);
                DOM.height(tmp, DOM.docHeight());
                if (ie6) {
                    DOM.width(tmp, DOM.docWidth());
                }
            }
        }
        DOM.css(ifr, 'opacity', config.opacity);
        document.body.appendChild(ifr);

        if (tmp) {
            DOM.css(tmp, 'opacity', config.opacity);
            document.body.appendChild(tmp);
            this.layer = tmp;
        }

        this.config = config;
        this.iframe = ifr;
    }

    S.augment(Mask, {

        show: function() {
            DOM.css(this.iframe, DISPLAY, 'block');
            if (this.layer) DOM.css(this.layer, DISPLAY, 'block');
        },

        hide: function() {
            DOM.css(this.iframe, DISPLAY, 'none');
            if (this.layer) DOM.css(this.layer, DISPLAY, 'none');
        },

        toggle: function() {
            var isVisible = DOM.css(this.iframe, DISPLAY) !== 'none';
            this[isVisible ? 'hide' : 'show']();
        },

        setSize: function(w, h) {
            DOM.width(this.iframe, w);
            DOM.height(this.iframe, h);
            if (this.layer) {
                DOM.width(this.layer, w);
                DOM.height(this.layer, h);
            }
        },

        setOffset: function(x, y) {
            var offset = x;

            if (y !== undefined) {
                offset = {
                    left: x,
                    top: y
                }
            }
            DOM.offset(this.iframe, offset);
            if (this.layer) {
                DOM.offset(this.layer, offset);
            }
        }
    });

    S.Mask = Mask;
});
