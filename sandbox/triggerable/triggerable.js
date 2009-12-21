/**
 * Triggerable
 * @module      triggerable
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy-core, yahoo-dom-event
 */
KISSY.add("triggerable", function(S) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        win = window, doc = document,

        defaultConfig = {
        };

    /**
     * Triggerable
     * @constructor
     */
    function Triggerable(triggers, panels, config) {
        // factory or constructor
        if (!(this instanceof arguments.callee)) {
            return new arguments.callee(triggers, panels, config);
        }

        /**
         * 触发
         * @type HTMLElement
         */
        this.container = Dom.get(container);

        /**
         * 配置参数
         * @type Object
         */
        this.config = S.merge(defaultConfig, config || {});

        this._init();
    }

    S.mix(TriggerableView.prototype, {

        /**
         * 初始化
         * @protected
         */
        _init: function() {
        }
    });

    S.Triggerable = Triggerable;
});
