/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Dec 5 02:23
*/
/**
 * @ignore
 * @fileOverview plugin constrain region for drag and drop
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/constrain', function (S, Base, Node, DD) {

    var $ = Node.all,
        CONSTRAIN_EVENT = '.-ks-constrain' + S.now(),
        WIN = S.Env.host;

    /**
     * @class KISSY.DD.Constrain
     * @extends KISSY.Base
     * Constrain plugin to provide ability to constrain draggable to specified region
     */
    function Constrain() {
        Constrain.superclass.constructor.apply(this, arguments);
    }

    function onDragStart(e) {
        var self = this,
            drag = e.drag,
            l, t, lt,
            dragNode = drag.get('dragNode'),
            constrain = self.get('constrain');
        if (constrain) {
            if (constrain === true || constrain.setTimeout) {
                var win;
                if (constrain === true) {
                    win = $(WIN);
                } else {
                    win = $(constrain);
                }
                self.__constrainRegion = {
                    left: l = win.scrollLeft(),
                    top: t = win.scrollTop(),
                    right: l + win.width(),
                    bottom: t + win.height()
                };
            }
            if (constrain.nodeType || typeof constrain == 'string') {
                constrain = $(constrain);
            }
            if (constrain.getDOMNode) {
                lt = constrain.offset();
                self.__constrainRegion = {
                    left: lt.left,
                    top: lt.top,
                    right: lt.left + constrain.outerWidth(),
                    bottom: lt.top + constrain.outerHeight()
                };
            } else if (S.isPlainObject(constrain)) {
                self.__constrainRegion = constrain;
            }
            if (self.__constrainRegion) {
                self.__constrainRegion.right -= dragNode.outerWidth();
                self.__constrainRegion.bottom -= dragNode.outerHeight();
            }
        }
    }

    function onDragAlign(e) {
        var self = this,
            info = {},
            l = e.left,
            t = e.top,
            constrain = self.__constrainRegion;
        if (constrain) {
            info.left = Math.min(Math.max(constrain.left, l), constrain.right);
            info.top = Math.min(Math.max(constrain.top, t), constrain.bottom);
            e.drag.setInternal('actualPos', info);
        }
    }

    function onDragEnd() {
        this.__constrainRegion = null;
    }

    S.extend(Constrain, Base, {

        pluginId: 'dd/constrain',

        __constrainRegion: null,

        /**
         * start monitoring drag
         * @param {KISSY.DD.Draggable} drag
         * @private
         */
        initializer: function (drag) {
            var self=this;
            drag['on']('dragstart' + CONSTRAIN_EVENT, onDragStart, self)
                .on('dragend' + CONSTRAIN_EVENT, onDragEnd, self)
                .on('dragalign' + CONSTRAIN_EVENT, onDragAlign, self);
        },

        attachDrag: function (drag) {
            S.log('dd.constrain.attachDrag is deprecated, call plug on drag please', 'warn');
            this.initializer(drag);
        },

        detachDrag: function (drag) {
            S.log('dd.constrain.detachDrag is deprecated, call unplug/destroy on drag please', 'warn');
            this.destructor(drag);
        },


        /**
         * stop monitoring drag
         * @param {KISSY.DD.Draggable} drag
         * @private
         */
        destructor: function (drag) {
            drag['detach'](CONSTRAIN_EVENT,{
                context:this
            });
        },

        destroy: function () {
            S.log('dd.constrain.destroy is deprecated, call unplug/destroy on drag please', 'warn');
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
                value: true
            }
        }
    });

    DD.Constrain = Constrain;

    return Constrain;
}, {
    requires: ['base', 'node', 'dd/base']
});
