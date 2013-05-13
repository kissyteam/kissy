/**
 * @ignore
 * KISSY Overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/overlay-render", function (S, XTemplate, Component, Extension, Loading, Close, Mask) {

    var UA = S.UA;

    return Component.Render.extend([
        UA['ie'] === 6 ? Extension.Shim.Render : null,
        Extension.Position.Render,
        Loading,
        Close,
        Mask
    ], {
        initializer: function () {
            this.get('childrenElSelectors')['contentEl'] = '#{prefixCls}contentbox{id}';
        },
        createDom: function () {
            if (!this.get('contentEl')) {
                var contentEl = S.all(new XTemplate(this.get('contentTpl')).render({
                    prefixCls: this.get('prefixCls'),
                    content: ''
                }));
                contentEl.append(this.get('el').contents());
                this.setInternal('contentEl', contentEl);
                this.get('el').append(contentEl);
            }
        },
        getChildrenContainerEl: function () {
            return this.get('contentEl');
        }
    }, {
        ATTRS: {
            contentTpl: {
                value: '<div ' +
                    'id="{{prefixCls}}contentbox{{id}}" ' +
                    'class="{{prefixCls}}contentbox ' +
                    '{{prefixCls}}overlay-contentbox">' +
                    '{{content}}</div>'
            }
        }
    });

}, {
    requires: [
        'xtemplate',
        "component/base",
        'component/extension',
        './extension/loading-render',
        './extension/close-render',
        './extension/mask-render'
    ]
});

/**
 * @ignore
 * 2010-11-09 2010-11-10 yiminghe@gmail.com重构，attribute-base-uibase-Overlay ，采用 UIBase.create
 */
