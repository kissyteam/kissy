/**
 * @fileOverview container can delegate event for its children
 * @author yiminghe@gmail.com
 */
KISSY.add("component/container", function (S, UIBase, Controller, UIStore, DelegateChildren, DecorateChildren) {
    /**
     * 多继承，容器也是组件，具备代理儿子事件以及递归装饰儿子的功能
     * @name Container
     * @constructor
     * @extends Component.Controller
     * @memberOf Component
     */
    return UIBase.create(Controller, [DelegateChildren, DecorateChildren]);

}, {
    requires:['uibase', './Controller', './uistore', './delegatechildren', './decoratechildren']
});