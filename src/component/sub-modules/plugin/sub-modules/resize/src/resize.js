/**
 * @ignore
 * resize plugin for kissy component
 * @author yiminghe@gmail.com
 */
KISSY.add('component/plugin/resize', function (S, Resize) {

    /**
     * resize plugin for kissy component
     *
     *      @example
     *      var o =new Overlay.Dialog({
     *          plugins:[
     *              new ResizePlugin({
     *                  handles: ['t','tr']
     *              })
     *          ]
     *      })
     *      // or
     *      o.plug(new ResizePlugin({
     *          handles: ['t','tr']
     *      });
     *
     *
     * @class KISSY.Component.Plugin.Resize
     * @extends KISSY.Resizable
     */
    return Resize.extend({
        pluginBindUI: function (component) {
            var el = component.get('el'),
                self = this;
            self.set('node', el);
            // sync
            self.on('resizeEnd', function () {
                var offset = el.offset();
                component.setInternal('xy', [offset.left, offset.top]);
                component.setInternal('width', el.width());
                component.setInternal('height', el.height());
            });
        },
        pluginDestructor: function () {
            this.destroy();
        }
    });

}, {
    requires: ['resizable']
});