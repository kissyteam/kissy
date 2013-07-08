/**
 * @ignore
 * scalable event framework for kissy (refer Dom3 Events)
 * @author yiminghe@gmail.com
 */
KISSY.add('event/base', function (S, Utils, Object, Observer, Observable) {
    /**
     * The event utility provides functions to add and remove event listeners.
     * @class KISSY.Event
     * @singleton
     */
    return {
        Utils: Utils,
        Object: Object,
        Observer: Observer,
        Observable: Observable
    };
}, {
    requires: ['./base/utils', './base/object', './base/observer', './base/observable']
});


/*
 yiminghe@gmail.com: 2012-10-24
 - 重构，新架构，自定义事件，Dom 事件分离

 yiminghe@gmail.com: 2011-12-15
 - 重构，粒度更细，新的架构

 2011-11-24
 - 自定义事件和 dom 事件操作彻底分离
 - TODO: group event from Dom3 Events

 2011-06-07
 - refer : http://www.w3.org/TR/2001/WD-Dom-Level-3-Events-20010823/events.html
 - 重构
 - eventHandler 一个元素一个而不是一个元素一个事件一个，节省内存
 - 减少闭包使用，prevent ie 内存泄露？
 - 增加 fire ，模拟冒泡处理 dom 事件
 */