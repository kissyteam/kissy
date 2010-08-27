/**
 * Popup
 * @creator     乔花<qiaohua@taobao.com>
 * @date        2010.08.25
 * @version     1.0
 */
KISSY.add('popup', function(S) {

    var defaultConfig = {
        triggerType: 'mouse',
        align: {
            node: '', 
            x: 'r', 
            y: 'c', 
            inner: false, 
            offset: 10
        }
    };

    /**
     * Popup Class
     * @constructor
     */
    function Popup(trigger, cfg) {
        var self = this;

        if (!(self instanceof Popup)) {
            return new Popup(trigger, cfg);
        }
        Popup.superclass.constructor.call(self, trigger, S.merge(defaultConfig, cfg));
    }

    S.extend(Popup, S.Overlay);
    S.Popup = Popup;

}, { host: 'overlay' } );
