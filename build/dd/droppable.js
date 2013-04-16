/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:14
*/
/**
 * @ignore
 * droppable for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/droppable/base', function (S, Node, RichBase, DD) {

        var DDM = DD.DDM,
            PREFIX_CLS = DDM.PREFIX_CLS;

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
         * @extends KISSY.RichBase
         * Make a node droppable.
         */
        return RichBase.extend({

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
                return domNode == dragNode ||
                    domNode == proxyNode
                    ? null : node;
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
                }

            }
        });

    },
    { requires: ['node', 'rich-base', 'dd/base'] });/**
 * @ignore
 * only one droppable instance for multiple droppable nodes
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/droppable/delegate', function (S, DD, Droppable, DOM, Node) {


    var DDM = DD.DDM;

    function dragStart() {
        var self = this,
            container = self.get('container'),
            allNodes = [],
            selector = self.get('selector');
        container.all(selector).each(function (n) {
            // 2012-05-18: 缓存高宽，提高性能
            DDM.cacheWH(n);
            allNodes.push(n);
        });
        self.__allNodes = allNodes;
    }

    /**
     * @class KISSY.DD.DroppableDelegate
     * @extend KISSY.DD.Droppable
     * Make multiple nodes droppable under a container using only one droppable instance.
     */
    var DroppableDelegate = Droppable.extend({

            initializer: function () {
                // 提高性能，拖放开始时缓存代理节点
                DDM.on('dragstart', dragStart, this);
            },

            /**
             * get droppable node by delegation
             * @protected
             */
            getNodeFromTarget: function (ev, dragNode, proxyNode) {
                var pointer = {
                        left: ev.pageX,
                        top: ev.pageY
                    },
                    self = this,
                    allNodes = self.__allNodes,
                    ret = 0,
                    vArea = Number.MAX_VALUE;


                if (allNodes) {

                    S.each(allNodes, function (n) {
                        var domNode = n[0];
                        // 排除当前拖放的元素以及代理节点
                        if (domNode === proxyNode || domNode === dragNode) {
                            return;
                        }
                        var r = DDM.region(n);
                        if (DDM.inRegion(r, pointer)) {
                            // 找到面积最小的那个
                            var a = DDM.area(r);
                            if (a < vArea) {
                                vArea = a;
                                ret = n;
                            }
                        }
                    });
                }

                if (ret) {
                    self.setInternal('lastNode', self.get('node'));
                    self.setInternal('node', ret);
                }

                return ret;
            },

            _handleOut: function () {
                var self = this;
                DroppableDelegate.superclass._handleOut.apply(self, arguments);
                self.setInternal('node', 0);
                self.setInternal('lastNode', 0);
            },

            _handleOver: function (ev) {
                var self = this,
                    node = self.get('node'),
                    superOut = DroppableDelegate.superclass._handleOut,
                    superOver = DroppableDelegate.superclass._handleOver,
                    superEnter = DroppableDelegate.superclass._handleEnter,
                    lastNode = self.get('lastNode');

                if (lastNode[0] !== node[0]) {

                    // 同一个 drop 对象内委托的两个可 drop 节点相邻，先通知上次的离开
                    self.setInternal('node', lastNode);
                    superOut.apply(self, arguments);

                    // 再通知这次的进入
                    self.setInternal('node', node);
                    superEnter.call(self, ev);
                } else {
                    superOver.call(self, ev);
                }
            },

            _end: function () {
                var self = this;
                DroppableDelegate.superclass._end.apply(self, arguments);
                self.setInternal('node', 0);
            }
        },
        {
            ATTRS: {

                /**
                 * last droppable target node.
                 * @property lastNode
                 * @private
                 */
                /**
                 * @ignore
                 */
                lastNode: {
                },

                /**
                 * a selector query to get the children of container to make droppable elements from.
                 * usually as for tag.cls.
                 * @cfg {String} selector
                 */
                /**
                 * @ignore
                 */
                selector: {
                },

                /**
                 * a selector query to get the container to listen for mousedown events on.
                 * All 'draggable selector' should be a child of this container
                 * @cfg {String|HTMLElement} container
                 */
                /**
                 * @ignore
                 */
                container: {
                    setter: function (v) {
                        return Node.one(v);
                    }
                }
            }
        });

    return DroppableDelegate;
}, {
    requires: ['dd/base', './base', 'dom', 'node']
});/**
 * @ignore
 * droppable for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/droppable', function (S, DD, Droppable, DroppableDelegate) {
    Droppable.Delegate = DroppableDelegate;
    DD.Droppable = Droppable;
    DD.DroppableDelegate = DroppableDelegate;
    return Droppable;
}, { requires: ['dd/base', './droppable/base', './droppable/delegate'] });
