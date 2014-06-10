/**
 * @ignore
 * fake document fragment
 * @author yiminghe@gmail.com
 */

var Tag = require('./tag');
var util = require('util');
function Fragment() {
    this.childNodes = [];
    this.nodeType = 9;
    this.nodeName = '#fragment';
}

util.extend(Fragment, Tag, {
    writeHtml: function (writer, filter) {
        this.__filter = filter;
        this.isChildrenFiltered = 0;
        if (filter) {
            filter.onFragment(this);
        }
        this._writeChildrenHTML(writer);
    }
});

module.exports = Fragment;