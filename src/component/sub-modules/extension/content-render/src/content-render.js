/**
 * @ignore
 * common content box render
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S,require) {
    var ContentTpl=require('component/extension/content-xtpl');

    function shortcut(self) {
        var control = self.control;
        var contentEl = control.get('contentEl');
        self.$contentEl = control.$contentEl = contentEl;
        self.contentEl = control.contentEl = contentEl[0];
    }

    /**
     * content-render extension for component system
     * @class KISSY.Component.Extension.ContentRender
     */
    function ContentRender() {
    }

    ContentRender.prototype = {
        __beforeCreateDom: function (renderData, childrenElSelectors) {
            S.mix(childrenElSelectors, {
                contentEl: '#ks-content-{id}'
            });
        },

        __createDom: function () {
            shortcut(this);
        },

        __decorateDom: function () {
            shortcut(this);
        },

        getChildrenContainerEl: function () {
            // can not use $contentEl, maybe called by decorateDom method
            return this.control.get('contentEl');
        },

        _onSetContent: function (v) {
            var control = this.control,
                contentEl = control.$contentEl;
            contentEl.html(v);
            // ie needs to set unselectable attribute recursively
            if (!control.get('allowTextSelection')) {
                contentEl.unselectable();
            }
        }
    };

    S.mix(ContentRender, {
        ATTRS: {
            contentTpl: {
                value: ContentTpl
            }
        },
        HTML_PARSER: {
            content: function (el) {
                return el.one('.' + this.getBaseCssClass('content')).html();
            },
            contentEl: function (el) {
                return el.one('.' + this.getBaseCssClass('content'));
            }
        }
    });

    return ContentRender;
});