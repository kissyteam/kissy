/**
 * @ignore
 * 里层包裹层定义， 适合mask以及shim
 * @author yiminghe@gmail.com
 */
KISSY.add('component/extension/content-box-render', function (S, Node, DOM) {

    function ContentBoxRender() {
    }

    /*
     ! contentEl 只能由组件动态生成
     */
    // for augment, no need constructor
    ContentBoxRender.prototype = {
        __createDom: function () {
            var self = this,
                contentEl,
                el = self.get('el'),
                contentCls = self.getCssClassWithState('contentbox'),
                childNodes = el[0].childNodes,
                css = self.getCssClassWithPrefix('contentbox') +
                    (contentCls ? (' ' + contentCls) : contentCls),
                c = childNodes.length && DOM._nodeListToFragment(childNodes);

            // 产生新的 contentEl
            contentEl = Node.all('<div class="' + css + '"></div>');

            if (c) {
                contentEl.append(c);
            }

            el.append(contentEl);

            self.setInternal('contentEl', contentEl);
        }
    };

    return ContentBoxRender;
}, {
    requires: ['node', 'dom']
});