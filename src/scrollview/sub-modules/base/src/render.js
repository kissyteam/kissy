/**
 * scrollview render
 * @author yiminghe@gmail.com
 */
KISSY.add('scrollview/base/render', function (S, Component, Extension) {

    return Component.Render.extend([Extension.ContentBox.Render], {

        renderUI: function () {
            this._contentEl = this.get('contentEl');
        },

        '_onSetScrollLeft': function (v) {
            this._contentEl[0].style.left = -v + 'px';
        },

        '_onSetScrollTop': function (v) {
            this._contentEl[0].style.top = -v + 'px';
        }

    }, {
        ATTRS: {
            scrollLeft: {
                value: 0
            },
            scrollTop: {
                value: 0
            }
        }
    })


}, {
    requires: ['component/base', 'component/extension']
});