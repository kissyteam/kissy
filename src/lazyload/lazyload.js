/**
 * KISSY.Lazyload 图片延迟加载组件
 *
 * lazyload.js
 * requires: yahoo-dom-event
 *
 * @author lifesinger@gmail.com
 */

var KISSY = window.KISSY || {};

/**
 * 图片延迟加载组件
 * @class Lazyload
 * @requires YAHOO.util.Dom
 * @requires YAHOO.util.Event
 * @constructor
 */
KISSY.Lazyload = (function() {
    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,

        /**
         * 默认配置
         */
        defaultConfig = {
            /**
             * 当前视窗往下，diff px 外的图片延迟加载
             */
            diff: 200,

            /**
             * 占位指示图
             */
            placeholder: "loading.gif"
        };

    function Lazyload(id, config) {

        // Allow instantiation without the new operator
        if (!(this instanceof Lazyload)) {
            new Lazyload(id, config);
        }

        /**
         * 图片所在容器，默认为 document
         * @type HTMLElement
         */
        this.container = Dom.get(id) || document;

        /**
         * 配置参数
         * @type Object
         */
        this.config = Lang.merge(defaultConfig, config || {});

        // init
        this._init();
    };

    Lazyload.prototype = {
        /**
         * 初始化
         * @protected
         */
        _init: function() {

        },
        
        constructor: Lazyload
    };

    return Lazyload;
})();
