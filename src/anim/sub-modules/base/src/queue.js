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

    function getQueue(el, name, readOnly) {
        name = name || queueKey;

        var qu,
            quCollection = DOM.data(el, queueCollectionKey);

        if (!quCollection && !readOnly) {
            DOM.data(el, queueCollectionKey, quCollection = {});
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

        queue: function (el, queue, item) {
            var qu = getQueue(el, queue);
            qu.push(item);
            return qu;
        },

        remove: function (el, queue, item) {
            var qu = getQueue(el, queue, 1),
                index;
            if (qu) {
                index = S.indexOf(item, qu);
                if (index > -1) {
                    qu.splice(index, 1);
                }
            }
            if (qu && !qu.length) {
                // remove queue data
                Q.clearQueue(el, queue);
            }
            return qu;
        },

        'clearQueues': function (el) {
            DOM.removeData(el, queueCollectionKey);
        },

        clearQueue: function clearQueue(el, queue) {
            queue = queue || queueKey;
            var quCollection = DOM.data(el, queueCollectionKey);
            if (quCollection) {
                delete quCollection[queue];
            }
            if (S.isEmptyObject(quCollection)) {
                DOM.removeData(el, queueCollectionKey);
            }
        },

        dequeue: function (el, queue) {
            var qu = getQueue(el, queue, 1);
            if (qu) {
                qu.shift();
                if (!qu.length) {
                    // remove queue data
                    Q.clearQueue(el, queue);
                }
            }
            return qu;
        }

    };
}, {
    requires: ['dom']
});