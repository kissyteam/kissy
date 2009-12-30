/*
Copyright (c) 2010, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2009-12-30 15:58:52
Revision: 383
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
