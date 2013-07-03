/**
 * common content box render
 * @author yiminghe@gmail.com
 */
KISSY.add('component/extension/content-render', function (S) {

    function shortcut(self) {
        var control = self.control;
        var contentEl = control.get('contentEl');
        self.$contentEl=control.$contentEl = contentEl;
        self.contentEl=control.contentEl = contentEl[0];
    }

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
            return this.control.$contentEl;
        },

        _onSetContent: function (v) {
            var control = this.control,
                contentEl = control.$contentEl;
            contentEl.html(v);
            // ie needs to set unselectable attribute recursively
            if (S.UA.ie < 9 && !control.get('allowTextSelection')) {
                contentEl.unselectable();
            }
        }
    };

    S.mix(ContentRender, {
        ATTRS: {
            contentTpl: {
                value: '<div id="ks-content-{{id}}" ' +
                    'class="{{getBaseCssClasses "content"}}">' +
                    '{{{content}}}' +
                    '</div>'
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