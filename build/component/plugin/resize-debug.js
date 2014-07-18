/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 13:53
*/
/*
combined modules:
component/plugin/resize
*/
KISSY.add('component/plugin/resize', ['resizable'], function (S, require, exports, module) {
    /**
 * @ignore
 * resize plugin for kissy component
 * @author yiminghe@gmail.com
 */
    var Resizable = require('resizable');    /**
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
    module.exports = Resizable.extend({
        pluginBindUI: function (component) {
            var $el = component.$el, self = this;
            self.set('node', $el);
            self.set('prefixCls', component.get('prefixCls'));    // sync
            // sync
            self.on('resizeEnd', function () {
                var offset = $el.offset();
                component.setInternal('xy', [
                    offset.left,
                    offset.top
                ]);
                component.setInternal('width', $el.width());
                component.setInternal('height', $el.height());
            });
        },
        pluginDestructor: function () {
            this.destroy();
        }
    });
});
