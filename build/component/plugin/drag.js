/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:14
*/
/**
 * @ignore
 * drag plugin for kissy component
 * @author yiminghe@gmail.com
 */
KISSY.add('component/plugin/drag', function (S, RichBase, DD) {

    /**
     * drag plugin for kissy component
     *
     *      @example
     *      KISY.use('overlay,component/plugin/drag,dd/plugin/proxy',
     *      function(S,Overlay,DragPlugin,ProxyPlugin){
     *        var o =new Overlay.Dialog({
     *          plugins:[
     *              new DragPlugin({
     *                  handles: [function(){ return o.get('header'); }],
     *                  plugins: [ProxyPlugin]
     *              })
     *          ]
     *        })
     *        // or
     *        o.plug(new DragPlugin({
     *          handles:[function(){ return o.get('header'); }]
     *        });
     *      });
     *
     *
     * @class KISSY.Component.Plugin.Drag
     * @extends KISSY.DD.Draggable
     */
    return DD.Draggable.extend({

        pluginId: 'component/plugin/drag',

        pluginBindUI: function (component) {
            var el = component.get('el'),
                self = this;
            self.set('node', el);
            // sync
            self.on("dragend", function () {
                var offset = el.offset();
                component.setInternal('xy', [offset.left, offset.top]);
            });
        },

        pluginDestructor: function () {
            this.destroy();
        }

    }, {
        ATTRS: {
            move: {
                value: 1
            },
            groups: {
                value: false
            }
        }
    });

}, {
    requires: ['rich-base', 'dd/base']
});
