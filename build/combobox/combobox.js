/*
Copyright (c) 2009, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2009-09-16 22:52:18
Revision: 148
*/
/**
 * KISSY.ComboBox 选择框组件
 *
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     yahoo-dom-event
 */

var KISSY = window.KISSY || {};

(function() {
    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,

        TMPL_CAPTION = '<div class="kissy-combobox-caption" style="width:{width}">' +
                          '<input type="text" autocomplete="off" />' +
                          '<span class="kissy-combobox-trigger"></span>' +
                      '</div>',
        TMPL_DROPLIST = '<div class="kissy-combobx-droplist" style="width:{width};max-height:{max-height}">' +
                           '<ol>' +
                               '<li>{option}</li>' +
                           '</ol>' +
                       '</div>',

        tmplDiv = document.createElement("div"), // 通用 el 容器

        defaultConfig = {

            /**
             * 复合框的宽度
             */
            width: "150px",

            /**
             * 下拉列表的宽度，默认和头部保持一致
             */
            dropListWidth: "150px",

            /**
             * 下拉列表的最大高度，默认取 300px = 20行 * 15px
             */
            dropListHeight: "300px"
        };

    /**
     * 选择框组件
     * @class ComboBox
     * @constructor
     */
    var ComboBox = function(el, config) {
        // Factory or constructor
        if (!(this instanceof arguments.callee)) {
            return new arguments.callee(el, config);
        }

        /**
         * 相关联的初始 dom 元素
         * @type {HTMLElement} 可能为 select 元素或 input 元素
         * TODO: 目前只考虑 orgEl 为 select 的情况
         */
        this.orgEl = Dom.get(el);

        /**
         * 配置参数
         * @type {object}
         */
        this.config = Lang.merge(defaultConfig, config || {});

        /**
         * 复合框的头部
         * @type {HTMLElement}
         */
        //this.caption

        /**
         * 复合框的下拉列表
         * @type {HTMLElement}
         */
        // this.dropList

        this._init();
    };

    Lang.augmentObject(ComboBox.prototype, {

        _init: function() {
            this._renderUI();
        },

        _renderUI: function() {
            this._renderCaption();
            this._renderDropList();
        },

        _renderCaption: function() {
            var config = this.config, orgEl = this.orgEl,
                caption;

            tmplDiv.innerHTML = TMPL_CAPTION
                    .replace("{width}", config.width);

            caption = tmplDiv.firstChild;
            orgEl.parentNode.insertBefore(caption, orgEl);

            this.caption = caption;
        },

        _renderDropList: function() {
            var config = this.config, dropList;

            tmplDiv.innerHTML = TMPL_DROPLIST
                    .replace("{width}", config.dropListWidth)
                    .replace("{max-height}", config.dropListHeight);

            dropList = tmplDiv.firstChild;
            document.body.appendChild(dropList);

            this.dropList = dropList;
        }

    });

    KISSY.ComboBox = ComboBox;
})();
