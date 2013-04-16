/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:14
*/
/**
 * @ignore
 * plugin constrain region for drag and drop
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/plugin/constrain', function (S, Base, Node) {

    var $ = Node.all,
        CONSTRAIN_EVENT = '.-ks-constrain' + S.now(),
        WIN = S.Env.host;

    /**
     * @class KISSY.DD.Plugin.Constrain
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
            if (S.isWindow(constrain[0])) {
                self.__constrainRegion = {
                    left: l = constrain.scrollLeft(),
                    top: t = constrain.scrollTop(),
                    right: l + constrain.width(),
                    bottom: t + constrain.height()
                };
            }
            else if (constrain.getDOMNode) {
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

        pluginId: 'dd/plugin/constrain',

        __constrainRegion: null,

        /**
         * start monitoring drag
         * @param {KISSY.DD.Draggable} drag
         * @private
         */
        pluginInitializer: function (drag) {
            var self = this;
            drag['on']('dragstart' + CONSTRAIN_EVENT, onDragStart, self)
                .on('dragend' + CONSTRAIN_EVENT, onDragEnd, self)
                .on('dragalign' + CONSTRAIN_EVENT, onDragAlign, self);
        },

        /**
         * stop monitoring drag
         * @param {KISSY.DD.Draggable} drag
         * @private
         */
        pluginDestructor: function (drag) {
            drag['detach'](CONSTRAIN_EVENT, {
                context: this
            });
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
                value: $(WIN),
                setter: function (v) {
                    if (v) {
                        if (v === true) {
                            return $(WIN);
                        } else if (v.nodeType || S.isWindow(v) || typeof v == 'string') {
                            return $(v);
                        }
                    }
                }
            }
        }
    });

    return Constrain;
}, {
    requires: ['base', 'node']
});
