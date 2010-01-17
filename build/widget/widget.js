/*
Copyright 2010, KISSY UI Library v1.0dev
MIT Licensed
build: 410 Jan 17 12:44
*/
/**
 * Widget
 * @creator     Óñ²®<lifesinger@gmail.com>
 * @depends     kissy, yui-base
 */
KISSY.add("widget", function(S) {

    /**
     * Widget Class
     * @constructor
     */
    function Widget(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Widget)) {
            return new Widget(container, config);
        }

        /**
         * the container of widget
         * @type HTMLElement
         */
        self.container = YAHOO.util.Dom.get(container);

        /**
         * config infomation
         * @type object
         */
        self.config = config || {};
    }

    S.Widget = Widget;
});
