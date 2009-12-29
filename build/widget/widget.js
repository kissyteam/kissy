/*
Copyright (c) 2009, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2009-12-29 17:38:49
Revision: 373
*/
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
