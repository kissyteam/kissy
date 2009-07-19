/**
 * KISSY.Editor 富文本编辑器
 * editor.js
 * requires: yahoo-dom-event
 * @author lifesinger@gmail.com
 */

var KISSY = window.KISSY || {};

/**
 * @class Editor
 * @requires YAHOO.util.Dom
 * @requires YAHOO.util.Event
 * @constructor
 * @param {string|HTMLElement} textarea
 * @param {object} config
 */
KISSY.Editor = function(textarea, config) {
    return new KISSY.Editor.Instance(textarea, config);
};

KISSY.Editor.version = "0.1";
KISSY.Editor.lang = {};
