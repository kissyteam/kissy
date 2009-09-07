/**
 * KISSY.ComboBox 选择框组件
 *
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     yahoo-dom-event
 */

var KISSY = window.KISSY || {};

(function() {
    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,

        defaultConfig = {

        };

    /**
     * 选择框组件
     * @class ComboBox
     * @constructor
     */
    var ComboBox = function(el, config) {
        // Factory or constructor
        if (!(this instanceof arguments.callee)) {
            return new arguments.callee(containers, config);
        }

        /**
         * 配置参数
         * @type Object
         */
        this.config = Lang.merge(defaultConfig, config || {});
    };

    Lang.augmentObject(ComboBox.prototype, {
        /**
         * 初始化
         * @protected
         */
        _init: function() {
        }
    });

    KISSY.ComboBox = ComboBox;
})();
