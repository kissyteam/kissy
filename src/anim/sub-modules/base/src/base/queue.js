/**
 * @ignore queue data structure
 * @author yiminghe@gmail.com
 */
KISSY.add('anim/base/queue', function (S, DOM) {

    var // 队列集合容器
        queueCollectionKey = S.guid('ks-queue-' + S.now() + '-'),
    // 默认队列
        queueKey = S.guid('ks-queue-' + S.now() + '-'),
        Q;

    function getQueue(node, name, readOnly) {
        name = name || queueKey;

        var qu,
            quCollection = DOM.data(node, queueCollectionKey);

        if (!quCollection && !readOnly) {
            DOM.data(node, queueCollectionKey, quCollection = {});
        }

        if (quCollection) {
            qu = quCollection[name];
            if (!qu && !readOnly) {
                qu = quCollection[name] = [];
            }
        }

        return qu;
    }

    return Q = {

        queueCollectionKey: queueCollectionKey,

        queue: function (node, queue, item) {
            var qu = getQueue(node, queue);
            qu.push(item);
            return qu;
        },

        remove: function (node, queue, item) {
            var qu = getQueue(node, queue, 1),
                index;
            if (qu) {
                index = S.indexOf(item, qu);
                if (index > -1) {
                    qu.splice(index, 1);
                }
            }
            if (qu && !qu.length) {
                // remove queue data
                Q.clearQueue(node, queue);
            }
            return qu;
        },

        'clearQueues': function (node) {
            DOM.removeData(node, queueCollectionKey);
        },

        clearQueue: function clearQueue(node, queue) {
            queue = queue || queueKey;
            var quCollection = DOM.data(node, queueCollectionKey);
            if (quCollection) {
                delete quCollection[queue];
            }
            if (S.isEmptyObject(quCollection)) {
                DOM.removeData(node, queueCollectionKey);
            }
        },

        dequeue: function (node, queue) {
            var qu = getQueue(node, queue, 1);
            if (qu) {
                qu.shift();
                if (!qu.length) {
                    // remove queue data
                    Q.clearQueue(node, queue);
                }
            }
            return qu;
        }

    };
}, {
    requires: ['dom']
});