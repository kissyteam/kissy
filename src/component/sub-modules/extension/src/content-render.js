/**
 * common content box render
 * @author yiminghe@gmail.com
 */
KISSY.add('component/extension/content-render', function (S) {

    function ContentRender() {
        S.mix(this.get('childrenElSelectors'), {
            contentEl: '#ks-content{id}'
        });
    }

    ContentRender.prototype = {
        getChildrenContainerEl: function () {
            return this.get('contentEl');
        },
        _onSetContent: function (v) {
            var contentEl = this.get('contentEl');
            contentEl.html(v);
            // ie needs to set unselectable attribute recursively
            if (S.UA.ie < 9 && !this.get('allowTextSelection')) {
                contentEl.unselectable();
            }
        }
    };

    S.mix(ContentRender, {
        ATTRS: {
            contentTpl:{
                value:'<div id="ks-content{{id}}" ' +
                    'class="{{prefixCls}}content {{getCssClassWithState "content"}}">' +
                    '{{{content}}}' +
                    '</div>'
            },
            content: {
                sync: 0
            }
        },
        HTML_PARSER: {
            content: function (el) {
                return el.one('.' + this.get('prefixCls') + 'content').html();
            },
            contentEl: function (el) {
                return el.one('.' + this.get('prefixCls') + 'content')
            }
        }
    });

    ContentRender.ContentTpl=ContentRender.ATTRS.contentTpl.value;

    return ContentRender;
});