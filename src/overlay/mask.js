/**
 * KISSY.Mask
 * @creator     乔花<qiaohua@taobao.com>
 */
KISSY.add('mask', function(S, undefined) {

    var DOM = S.DOM,
        DISPLAY = 'display',

        defaultConfig = {
            extraCls: '',
            opacity: .6,
            shim: false
        };

    function Mask(config){
        if (!(this instanceof Mask)) {
            return new Mask(config);
        }

        config = S.merge(defaultConfig, config);

        // 共用 css
        if (!S.get('#ks-mask-style')) {
            DOM.addStyleSheet(
                '.ks-mask{position:absolute;left:0;top:0;width:100%;border:0;background:black;z-index:9998;display:none}' +
                    '.ks-shim{position:absolute;z-index:9997;border:0;display:none}',
                'ks-mask-style');
        }

        var isShim = config.shim,
            ifr = DOM.create('<iframe>', { 'class': isShim ? 'ks-shim' : 'ks-mask' + ' ' + config.extraCls });

        if(isShim) config.opacity = 0;
        else DOM.height(ifr, DOM.docHeight());

        DOM.css(ifr, 'opacity', config.opacity);

        document.body.appendChild(ifr);

        this.config = config;
        this.iframe = ifr;
    }

    S.augment(Mask, {

        show: function() {
            DOM.css(this.iframe, DISPLAY, 'block');
        },

        hide: function() {
            DOM.css(this.iframe, DISPLAY, 'none');
        },

        toggle: function() {
            var isVisible = DOM.css(this.iframe, DISPLAY) !== 'none';
            this[isVisible ? 'hide' : 'show']();
        },

        setSize: function(w, h) {
            DOM.width(this.iframe, w);
            DOM.height(this.iframe, h);
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
        }
    });

    S.Mask = Mask;
});
