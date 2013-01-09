/**
 * @ignore
 *  only one droppable instance for multiple droppable nodes
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
});