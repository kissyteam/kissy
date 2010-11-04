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
            if (host.get(DRAGGABLE)) {
                host.on('create', function() {
                    if (host.header) {
                        try {
                            var dd = new S.Draggable({

                                node: new S.Node(host.container),
                                handlers: [new S.Node(host.header)]
                            });
                            dd.on("drag", function(ev) {
                                host.move(ev.left, ev.top);
                            });
                        } catch(e) {
                            S.log('Required S.Draggable: ' + ex, 'warn');
                        }
                    }
                });
            }
        }
    });
}, { host: 'overlay', requires: ['dd'] });


/**
 * Note:
 * - 2010/11/03 draggable
 */