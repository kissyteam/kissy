/**
 * @ignore
 * 里层包裹层定义， 适合mask以及shim
 * @author yiminghe@gmail.com
 */
KISSY.add('component/extension/content-box-render', function () {

    function ContentBoxRender() {
        this.set('startTpl', this.get('startTpl') +
            '<div id="{{prefixCls}}contentbox{{id}}" ' +
            'class="{{prefixCls}}contentbox' +
            ' {{getCssClassWithState "contentbox"}}">');
        this.set('endTpl', '</div>' + this.get('endTpl'));
        this.get('childrenElSelectors')['contentEl']='#{prefixCls}contentbox{id}';
    }

    ContentBoxRender.prototype = {
        __createDom: function () {
            var self = this,
                el = self.get('el');
            self.setInternal('contentEl', el.first());
        }
    };

    return ContentBoxRender;
}, {
    requires: ['node', 'dom']
});