/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jun 19 14:00
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 component/extension/content-render
*/

/**
 * common content box render
 * @author yiminghe@gmail.com
 */
KISSY.add('component/extension/content-render', function (S) {

    function ContentRender() {
        S.mix(this.get('childrenElSelectors'), {
            contentEl: '#ks-content-{id}'
        });
    }

    ContentRender.prototype = {
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

