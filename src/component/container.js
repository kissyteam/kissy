/**
 * container can delegate event for its children
 * @author yiminghe@gmail.com
 */
KISSY.add("component/container", function(S, UIBase, MC, UIStore, DelegateChildren, DecorateChildren) {
    /**
     * 多继承，容器也是组件，具备代理儿子事件以及递归装饰儿子的功能
     */
    return UIBase.create(MC, [DelegateChildren,DecorateChildren]);

}, {
    requires:['uibase','./modelcontrol','./uistore','./delegatechildren','./decoratechildren']
});