/**
 * Widget
 * @module      widget
 * @creator     Óñ²®<lifesinger@gmail.com>
 * @depends     kissy, yui-base
 */
KISSY.add("widget", function(S) {

    var Y = YAHOO.util, Dom = Y.Dom;

    /**
     * Widget Class
     * @constructor
     */
    function Widget(container) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Widget)) {
            return new Widget(container);
        }

        /**
         * the container of widget
         * @type HTMLElement
         */
        self.container = Dom.get(container);

        /**
         * config infomation
         * @type object
         */
        self.config = {};
    }

    S.Widget = Widget;
});
