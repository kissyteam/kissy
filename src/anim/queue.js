/**
 * queue of anim objects
 * @author yiminghe@gmail.com
 */
KISSY.add("anim/queue", function(S, DOM) {

    var /*队列集合容器*/
        keyCollection = S.guid("ks-queue-" + S.now() + "-"),
        /*默认队列*/
        key = S.guid("ks-queue-" + S.now() + "-"),
        processing = "...";

    function getQueue(elem, name, readOnly) {
        name = name || key;

        var qu,
            quCollection = DOM.data(elem, keyCollection);

        if (!quCollection && !readOnly) {
            DOM.data(elem, keyCollection, quCollection = {});
        }

        if (quCollection) {
            qu = quCollection[name];
            if (!qu && !readOnly) {
                qu = quCollection[name] = [];
            }
        }

        return qu;
    }

    function removeQueue(elem, name) {
        name = name || key;
        var quCollection = DOM.data(elem, keyCollection);
        if (quCollection) {
            delete quCollection[name];
        }
        if (S.isEmptyObject(quCollection)) {
            DOM.removeData(elem, keyCollection);
        }
    }

    var q = {

        queue:function(anim) {
            var elem = anim.elem,
                name = anim.config.queue,
                qu = getQueue(elem, name);
            qu.push(anim);
            if (qu[0] !== processing) {
                q.dequeue(anim);
            }
            return qu;
        },

        remove:function(anim) {
            var elem = anim.elem,
                name = anim.config.queue,
                qu = getQueue(elem, name, 1),index;
            if (qu) {
                index = S.indexOf(anim, qu);
                if (index > -1) {
                    qu.splice(index, 1);
                }
            }
        },

        removeQueues:function(elem) {
            DOM.removeData(elem, keyCollection);
        },

        removeQueue:removeQueue,

        /**
         * get collection of queues
         */
        getQueues:function(elem) {
            return DOM.data(elem, keyCollection);
        },

        dequeue:function(anim) {
            var elem = anim.elem,
                name = anim.config.queue,
                qu = getQueue(elem, name, 1),
                nextAnim = qu && qu.shift();

            if (nextAnim == processing) {
                nextAnim = qu.shift();
            }

            if (nextAnim) {
                qu.unshift(processing);
                nextAnim._runInternal();
            } else {
                // remove queue data
                removeQueue(elem, name);
            }
        }

    };
    return q;
}, {
    requires:['dom']
});