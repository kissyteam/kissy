/**
 * common content box render
 * @author yiminghe@gmail.com
 */
KISSY.add('component/extension/content-render', function (S) {

    function ContentRender() {
    }

    ContentRender.prototype = {
        __beforeCreateDom:function(renderData,childrenElSelectors){
            S.mix(childrenElSelectors, {
                contentEl: '#ks-content-{id}'
            });
        },
        getChildrenContainerEl: function () {
            return this.controller.get('contentEl');
        },
        _onSetContent: function (v) {
            var controller=this.controller,
                contentEl = controller.get('contentEl');
            contentEl.html(v);
            // ie needs to set unselectable attribute recursively
            if (S.UA.ie < 9 && !controller.get('allowTextSelection')) {
                contentEl.unselectable();
            }
        }
    };

    S.mix(ContentRender, {
        ATTRS: {
            contentTpl:{
                value:'<div id="ks-content-{{id}}" ' +
                    'class="{{getBaseCssClasses "content"}}">' +
                    '{{{content}}}' +
                    '</div>'
            }
        },
        HTML_PARSER: {
            content: function (el) {
                return el.one('.'+this.getBaseCssClass('content')).html();
            },
            contentEl: function (el) {
                return el.one('.'+this.getBaseCssClass('content'));
            }
        }
    });

    ContentRender.ContentTpl=ContentRender.ATTRS.contentTpl.value;

    return ContentRender;
});