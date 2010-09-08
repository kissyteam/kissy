/**
 * Popup
 * @creator     乔花<qiaohua@taobao.com>
 * @date        2010.08.25
 * @version     1.0
 */
KISSY.add('popup', function(S) {

    var defaultConfig = {
        align: {
            node: 'trigger',
            points: ['cr', 'ct'],
            offset: 10
        }
    };

    /**
     * Popup Class
     * @constructor
     */
    function Popup(container, config) {
        var self = this;

        if (!(self instanceof Popup)) {
            return new Popup(container, config);
        }
        Popup.superclass.constructor.call(self, container, S.merge(defaultConfig, config));
    }

    S.extend(Popup, S.Overlay);
    S.Popup = Popup;

}, { host: 'overlay' } );

/**
 * NOTES:
 *  201008
 *      - 在Overlay基础上扩展Popup
 *  TODO:
 *      -
 */


