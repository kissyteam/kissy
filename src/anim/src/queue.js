/**
 * @ignore
 *  queue of anim objects
 * @author yiminghe@gmail.com
 */
KISSY.add('anim/queue', function (S, DOM) {

    var // 队列集合容器
        queueCollectionKey = S.guid('ks-queue-' + S.now() + '-'),
    // 默认队列
        queueKey = S.guid('ks-queue-' + S.now() + '-'),
    // 当前队列是否有动画正在执行
        processing = '...';

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

    function removeQueue(el, name) {
        name = name || queueKey;
        var quCollection = DOM.data(el, queueCollectionKey);
        if (quCollection) {
            delete quCollection[name];
        }
        if (S.isEmptyObject(quCollection)) {
            DOM.removeData(el, queueCollectionKey);
        }
    }

    var q = {

        queueCollectionKey: queueCollectionKey,

        queue: function (anim) {
            var el = anim.config.el,
                name = anim.config.queue,
                qu = getQueue(el, name);
            qu.push(anim);
            if (qu[0] !== processing) {
                q.dequeue(anim);
            }
            return qu;
        },

        remove: function (anim) {
            var el = anim.config.el,
                name = anim.config.queue,
                qu = getQueue(el, name, 1), index;
            if (qu) {
                index = S.indexOf(anim, qu);
                if (index > -1) {
                    qu.splice(index, 1);
                }
            }
        },

        removeQueues: function (el) {
            DOM.removeData(el, queueCollectionKey);
        },

        removeQueue: removeQueue,

        dequeue: function (anim) {
            var el = anim.config.el,
                name = anim.config.queue,
                qu = getQueue(el, name, 1),
                nextAnim = qu && qu.shift();

            if (nextAnim == processing) {
                nextAnim = qu.shift();
            }

            if (nextAnim) {
                qu.unshift(processing);
                nextAnim._runInternal();
            } else {
                // remove queue data
                removeQueue(el, name);
            }
        }

    };
    return q;
}, {
    requires: ['dom']
});