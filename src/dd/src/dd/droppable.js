/**
 * @ignore
 * droppable for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S,require) {
    var Node = require('node'),
        DDM = require('./ddm'),
        Base = require('base');

    var PREFIX_CLS = DDM.PREFIX_CLS;

    function validDrop(dropGroups, dragGroups) {
        if (dragGroups === true) {
            return 1;
        }
        for (var d in dropGroups) {
            if (dragGroups[d]) {
                return 1;
            }
        }
        return 0;
    }

    /**
     * @class KISSY.DD.Droppable
     * @extends KISSY.Base
     * Make a node droppable.
     */
    return Base.extend({
        initializer: function () {
            var self = this;
            self.addTarget(DDM);

            /**
             * fired after a draggable leaves a droppable
             * @event dropexit
             * @member KISSY.DD.DDM
             * @param e
             * @param e.drag current draggable object
             * @param e.drop current droppable object
             */

            /**
             *
             * fired after a draggable leaves a droppable
             * @event dropexit
             * @member KISSY.DD.Droppable
             * @param e
             * @param e.drag current draggable object
             * @param e.drop current droppable object
             */


            /**
             * fired after a draggable object mouseenter a droppable object
             * @event dropenter
             * @member KISSY.DD.DDM
             * @param e
             * @param e.drag current draggable object
             * @param e.drop current droppable object
             */

            /**
             * fired after a draggable object mouseenter a droppable object
             * @event dropenter
             * @member KISSY.DD.Droppable
             * @param e
             * @param e.drag current draggable object
             * @param e.drop current droppable object
             */


            /**
             *
             * fired after a draggable object mouseover a droppable object
             * @event dropover
             * @member KISSY.DD.DDM
             * @param e
             * @param e.drag current draggable object
             * @param e.drop current droppable object
             */

            /**
             *
             * fired after a draggable object mouseover a droppable object
             * @event dropover
             * @member KISSY.DD.Droppable
             * @param e
             * @param e.drag current draggable object
             * @param e.drop current droppable object
             */


            /**
             *
             * fired after drop a draggable onto a droppable object
             * @event drophit
             * @member KISSY.DD.DDM
             * @param e
             * @param e.drag current draggable object
             * @param e.drop current droppable object
             */

            /**
             *
             * fired after drop a draggable onto a droppable object
             * @event drophit
             * @member KISSY.DD.Droppable
             * @param e
             * @param e.drag current draggable object
             * @param e.drop current droppable object
             */

            DDM._regDrop(this);
        },
        /**
         * Get drop node from target
         * @protected
         */
        getNodeFromTarget: function (ev, dragNode, proxyNode) {
            var node = this.get('node'),
                domNode = node[0];
            // 排除当前拖放和代理节点
            return domNode === dragNode ||
                domNode === proxyNode ? null : node;
        },

        _active: function () {
            var self = this,
                drag = DDM.get('activeDrag'),
                node = self.get('node'),
                dropGroups = self.get('groups'),
                dragGroups = drag.get('groups');
            if (validDrop(dropGroups, dragGroups)) {
                DDM._addValidDrop(self);
                // 委托时取不到节点
                if (node) {
                    node.addClass(PREFIX_CLS + 'drop-active-valid');
                    DDM.cacheWH(node);
                }
            } else if (node) {
                node.addClass(PREFIX_CLS + 'drop-active-invalid');
            }
        },

        _deActive: function () {
            var node = this.get('node');
            if (node) {
                node.removeClass(PREFIX_CLS + 'drop-active-valid')
                    .removeClass(PREFIX_CLS + 'drop-active-invalid');
            }
        },

        __getCustomEvt: function (ev) {
            return S.mix({
                drag: DDM.get('activeDrag'),
                drop: this
            }, ev);
        },

        _handleOut: function () {
            var self = this,
                ret = self.__getCustomEvt();
            self.get('node').removeClass(PREFIX_CLS + 'drop-over');

            // html5 => dragleave
            self.fire('dropexit', ret);
        },

        _handleEnter: function (ev) {
            var self = this,
                e = self.__getCustomEvt(ev);
            e.drag._handleEnter(e);
            self.get('node').addClass(PREFIX_CLS + 'drop-over');
            self.fire('dropenter', e);
        },


        _handleOver: function (ev) {
            var self = this,
                e = self.__getCustomEvt(ev);
            e.drag._handleOver(e);
            self.fire('dropover', e);
        },

        _end: function () {
            var self = this,
                ret = self.__getCustomEvt();
            self.get('node').removeClass(PREFIX_CLS + 'drop-over');
            self.fire('drophit', ret);
        },

        /**
         * make this droppable' element undroppable
         * @private
         */
        destructor: function () {
            DDM._unRegDrop(this);
        }
    }, {
        name: 'Droppable',

        ATTRS: {
            /**
             * droppable element
             * @cfg {String|HTMLElement|KISSY.NodeList} node
             * @member KISSY.DD.Droppable
             */
            /**
             * droppable element
             * @type {KISSY.NodeList}
             * @property node
             * @member KISSY.DD.Droppable
             */
            /**
             * @ignore
             */
            node: {
                setter: function (v) {
                    if (v) {
                        return Node.one(v);
                    }
                }
            },

            /**
             * groups this droppable object belongs to.
             * @cfg {Object|Boolean} groups
             * @member KISSY.DD.Droppable
             */
            /**
             * @ignore
             */
            groups: {
                value: {

                }
            },

            /**
             * whether droppable is disabled
             * @type {Boolean}
             * @property disabled
             * @member KISSY.DD.Droppable
             */
            /**
             * @ignore
             */
            disabled:{

            }
        }
    });
});