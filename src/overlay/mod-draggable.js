/**
 * Overlay Draggable Plugin
 * @author 乔花<qiaohua@taobao.com>
 */

KISSY.add('overlay-draggable', function(S) {
    var Overlay = S.Overlay,
        DRAGGABLE = 'draggable';

    S.mix(Overlay.ATTRS, {
        draggable: {
            value: false
        }
    });

    Overlay.Plugins.push({
        name: DRAGGABLE,
        init: function(host) {

            host.on('create', function() {
                var self = this;
                if (self.get(DRAGGABLE)) {
                    setDraggable(self, true);
                }

                self.on('afterDraggableChange', function(e) {
                    setDraggable(self, e.newVal);
                });
            });
        }
    });


    function setDraggable(elem, f) {
        if (!elem.header) return;

        try {
            if (f) {
                if (elem._dd) return;

                var dd = new S.Draggable({
                    node: new S.Node(elem.container),
                    handlers: [new S.Node(elem.header)]
                });
                dd.on('drag', function(ev) {
                    elem.move(ev.left, ev.top);
                });

                elem._dd = dd;
            } else {
                if (!elem._dd) return;

                // 取消 draggable and else
                elem._dd.remove('drag');
            }
        } catch(e) {
            S.log('Required S.Draggable: ' + ex, 'warn');
        }
    }
}, { host: 'overlay', requires: ['dd'] });


/**
 * Note:
 * - 2010/11/03 draggable
 */