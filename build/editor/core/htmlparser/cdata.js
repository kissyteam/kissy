/**
 * modified from ckeditor
 * @author <yiminghe@gmail.com>
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.Editor.add("htmlparser-cdata", function(KE) {
    /**
     * A lightweight representation of HTML text.
     * @constructor
     * @example
     */
    KE.HtmlParser.cdata = function(value) {
        /**
         * The CDATA value.
         * @type String
         * @example
         */
        this.value = value;
    };

    KE.HtmlParser.cdata.prototype = {
        /**
         * CDATA has the same type as .htmlParser.text This is
         * a constant value set to NODE_TEXT.
         * @type Number
         * @example
         */
        type : KE.NODE.NODE_TEXT,

        /**
         * Writes write the CDATA with no special manipulations.
         * @param  writer The writer to which write the HTML.
         */
        writeHtml : function(writer) {
            writer.write(this.value);
        }
    };
});