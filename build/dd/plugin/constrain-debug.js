/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 13:54
*/
/*
combined modules:
dd/plugin/constrain
*/
KISSY.add('dd/plugin/constrain', [
    'base',
    'util',
    'node'
], function (S, require, exports, module) {
    /**
 * @ignore
 * plugin constrain region for drag and drop
 * @author yiminghe@gmail.com
 */
    var Base = require('base');
    var util = require('util');
    var $ = require('node'), CONSTRAIN_EVENT = '.-ks-constrain' + util.now(), WIN = window;
    function onDragStart(e) {
        var self = this, drag = e.drag, l, t, lt, dragNode = drag.get('dragNode'), constrain = self.get('constrain');
        if (constrain) {
            if (util.isWindow(constrain[0])) {
                self.__constrainRegion = {
                    left: l = constrain.scrollLeft(),
                    top: t = constrain.scrollTop(),
                    right: l + constrain.width(),
                    bottom: t + constrain.height()
                };
            } else if (constrain.getDOMNode) {
                lt = constrain.offset();
                self.__constrainRegion = {
                    left: lt.left,
                    top: lt.top,
                    right: lt.left + constrain.outerWidth(),
                    bottom: lt.top + constrain.outerHeight()
                };
            } else if (util.isPlainObject(constrain)) {
                self.__constrainRegion = constrain;
            }
            if (self.__constrainRegion) {
                self.__constrainRegion.right -= dragNode.outerWidth();
                self.__constrainRegion.bottom -= dragNode.outerHeight();
            }
        }
    }
    function onDragAlign(e) {
        var self = this, info = {}, l = e.left, t = e.top, constrain = self.__constrainRegion;
        if (constrain) {
            info.left = Math.min(Math.max(constrain.left, l), constrain.right);
            info.top = Math.min(Math.max(constrain.top, t), constrain.bottom);
            e.drag.setInternal('actualPos', info);
        }
    }
    function onDragEnd() {
        this.__constrainRegion = null;
    }    /**
 * @class KISSY.DD.Plugin.Constrain
 * @extends KISSY.Base
 * Constrain plugin to provide ability to constrain draggable to specified region
 */
    /**
 * @class KISSY.DD.Plugin.Constrain
 * @extends KISSY.Base
 * Constrain plugin to provide ability to constrain draggable to specified region
 */
    module.exports = Base.extend({
        pluginId: 'dd/plugin/constrain',
        __constrainRegion: null,
        /**
     * start monitoring drag
     * @param {KISSY.DD.Draggable} drag
     * @private
     */
        pluginInitializer: function (drag) {
            var self = this;
            drag.on('dragstart' + CONSTRAIN_EVENT, onDragStart, self).on('dragend' + CONSTRAIN_EVENT, onDragEnd, self).on('dragalign' + CONSTRAIN_EVENT, onDragAlign, self);
        },
        /**
     * stop monitoring drag
     * @param {KISSY.DD.Draggable} drag
     * @private
     */
        pluginDestructor: function (drag) {
            drag.detach(CONSTRAIN_EVENT, { context: this });
        }
    }, {
        ATTRS: {
            /**
         * constrained container.
         * @type {Boolean|HTMLElement|String}
         * @property constrain
         */
            /**
         * constrained container. true stands for viewport.
         * Defaults: true.
         * @cfg {Boolean|HTMLElement|String} constrain
         */
            /**
         * @ignore
         */
            constrain: {
                valueFn: function () {
                    return $(WIN);
                },
                setter: function (v) {
                    if (v) {
                        if (v === true) {
                            return $(WIN);
                        } else if (v.nodeType || util.isWindow(v) || typeof v === 'string') {
                            return $(v);
                        }
                    }
                    return v;
                }
            }
        }
    });
});


