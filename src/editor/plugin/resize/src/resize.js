/**
 * @ignore
 * resize functionality
 * @author yiminghe@gmail.com
 */

var DD = require('dd');
var $ = require('node');
var util = require('util');

function Resize(config) {
    this.config = config || {};
}

Resize.prototype = {
    pluginRenderUI: function (editor) {
        var Draggable = DD.Draggable,
            statusBarEl = editor.get('statusBarEl'),
            cfg = this.config,
            direction = cfg.direction || ['x', 'y'];

        var cursor = 'se-resize';

        if (direction.length === 1) {
            if (direction[0] === 'x') {
                cursor = 'e-resize';
            } else {
                cursor = 's-resize';
            }
        }

        var resizer = $('<div class="' + editor.get('prefixCls') +
            'editor-resizer" style="cursor: ' + cursor +
            '"></div>').appendTo(statusBarEl);

        //最大化时就不能缩放了
        editor.on('maximizeWindow', function () {
            resizer.css('display', 'none');
        });

        editor.on('restoreWindow', function () {
            resizer.css('display', '');
        });

        var d = new Draggable({
                node: resizer,
                groups: false
            }),
            height = 0,
            width = 0,
            heightEl = editor.get('el'),
            widthEl = editor.get('el');

        d.on('dragstart', function () {
            height = heightEl.height();
            width = widthEl.width();
            editor.fire('resizeStart');
        });

        d.on('drag', function (e) {
            if (util.inArray('y', direction)) {
                editor.set('height', height + e.deltaY);
            }
            if (util.inArray('x', direction)) {
                editor.set('width', width + e.deltaX);
            }
            editor.fire('resize');
        });

        editor.on('destroy', function () {
            d.destroy();
            resizer.remove();
        });
    }
};

module.exports = Resize;
