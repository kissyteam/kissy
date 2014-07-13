/**
 * @ignore queue data structure
 * @author yiminghe@gmail.com
 */

var Dom = require('dom');
var util = require('util');
var // 队列集合容器
    queueCollectionKey = util.guid('ks-queue-' + util.now() + '-'),
// 默认队列
    queueKey = util.guid('ks-queue-' + util.now() + '-'),
    Q;

function getQueue(node, name, readOnly) {
    name = name || queueKey;

    var qu,
        quCollection = Dom.data(node, queueCollectionKey);

    if (!quCollection && !readOnly) {
        Dom.data(node, queueCollectionKey, quCollection = {});
    }

    if (quCollection) {
        qu = quCollection[name];
        if (!qu && !readOnly) {
            qu = quCollection[name] = [];
        }
    }

    return qu;
}

Q = {
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
            index = util.indexOf(item, qu);
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

    clearQueues: function (node) {
        Dom.removeData(node, queueCollectionKey);
    },

    clearQueue: function clearQueue(node, queue) {
        queue = queue || queueKey;
        var quCollection = Dom.data(node, queueCollectionKey);
        if (quCollection) {
            delete quCollection[queue];
        }
        if (util.isEmptyObject(quCollection)) {
            Dom.removeData(node, queueCollectionKey);
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

module.exports = Q;