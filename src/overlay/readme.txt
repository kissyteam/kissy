Overlay 调研报告


应用场景
 - 页面上的覆盖层, 如, 普通遮罩层;
 - 弹出对话框层; 


同类组件
1. YUI3 , `Overlay <http://developer.yahoo.com/yui/3/overlay/>`_
 * new Y.Overlay(cfg);
 * 扩展于Widget, DOM基本结构包含hd,bd,ft;
 * 提供 位置相关属性(x, y, xy, centered), zIndex, align, shim(加iframe, IE6下默认true), constrain(固定在可视区域中间);
 * 提供 与修改对应 Attributes 的方法, 主要有 内容(WidgetStdMod), 位置(WidgetPosition, WidgetPositionConstrain), 大小这几个方面的方法;
 * WidgetPositionAlign, 提供 Align, 支持对齐到某个元素, 整个可视区域, 特定位置上;
 * WidgetStack, 提供 Stacking, 需要zIndex和shim支持, 当有多个 Overlay 时, 某个层获得焦点时, 将其置于顶层(对应方法 bringToTop )
 * 自定义事件 xyChange, bodyContentChange, 
 * Overlay相关的Plugin, 通过 overlay.plug(XXX, cfg)/ overlay.unplug(XXX) 使用:
    # StdModIO, 提供标准的输入输出, 包含initializer, destructor, formator, 在Overly中实例化为overlay.io;
    # Animation, 提供Overly的动画展现效果, animHidden/animVisible定义如何展现;


2. JQuery UI, 没有提供 Overlay , 但提供了所有组件的基类 Widget, 扩展出 `Dialog <http://docs.jquery.com/UI/Dialog>`_ , 和相关组件, 如 Draggable(拖拽), Droppable, Resizable.
 * JQuery Core + Widget + Position + Dialog, 压缩后21K;
 * `Widget <http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.4/jquery-ui.js>`_ , 所有组件的基类, 提供 create, destroy, enable, disable等通用方法;
 * 使用 $(id).dialog();
   # 提供 定制宽高度, resize, 位置, 是否模态窗口, 可拖拽, 支持 按钮;
   # 提供的方法有 destroy, open, close, enable, disable, moveToTop, stack, 这些都是类似窗口最基本的方法;
   # 自定义事件有 open, close, beforeClose, focus, drag 等;



3. Mootools, 由 moord 提供的 `overlay.js <http://www.moord.it/documentation/constructors>`_ 
 * 77.3K (未压缩, 包含依赖文件), 但纯 Overlay 仅100多行;
 * new Overlay() 创建 overlay 对象;
 * 提供 创建, 删除 Overlay, 设置 颜色深浅 透明度, 功能比较简单;
 * 基于Overlay扩展的组件有 virtual box , 弹出层功能:
   # virtual-base 为基类;
   # 扩展有 virtual-box (基本的box),  virtual-ajax (请求之后显示内容), virtual-html (动态设置html内容);
   # virtual box 系列 提供 设置动画效果, 自定义样式, 位置居中等选项, 提供 onShow, onClose, onNext, onPrev 自定义事件;



4. Dojo 的 Dijit 提供了 `digit.Dialog <http://dojotoolkit.org/reference-guide/dijit/Dialog.html>`_ .
 * Dialog+DialogUnderlay 共22K, 不包含一些依赖库.
 * new dijit.Dialog(cfg);
 * 支持resize, 拖拽, 表单操作, 和其他类似, 不重复讲了;
 * 焦点的处理;



功能点分析
- 数据层: 
    * 内容的可自定义设置:
        # 独立设置 hd, bd, ft 三部分内容;X
        # 
    * 后台请求过来的动态数据;
        # 表单数据;
        # iframe;
        # ajax;
    * 数据解析及格式化:
        # json;
        # formator;
- 展现层: 
    * 大小:
        # 设置宽度/高度;X
        # resize;
    * 位置:
        # 绝对位置;X
        # 相对于元素的位置;X
        # zIndex, shim X, stack;
    * 对齐:
        # 相对于元素的对齐;X
        # 在容器或可视区域内的对齐;X
    * 动画:
        # 主要是在显示/隐藏Overlay时的动画效果, 直接利用kissy/anim, 类似 switchable 的 plugin-effect;

- 其他:
    * 支持按钮?
    * Drag + Drop?



初步想法
1) S.Overlay(参考自ds中的dialog.js/dialogable.js)
- Constructor, new S.Overlay(cfg)
    * cfg: 配置信息; X
    * 返回 Overlay 实例; X

- Config
    * srcNode: 元素节点, 默认为null, 新建一个节点;X
    * head: 'header';X
    * body: 'body';X
    * foot: 'footer';X
    * url: 不设置时为静态数据, 设置时请求数据后替换body;

    * width/height: 宽度/高度信息;X
    * align: {}; X
        # node 触发元素'', 指定元素isString, 可视区域null; X
        # x: l, c, r, or interger    X
        # y: t, c, b, or interger    X
        # inner: [x, y]              X
        # offset: [x, y]             X
    * mask: 显示低层;                X
    * shim: 针对IE6必备;             X
    * zIndex: 多个层时叠放次序;
    * scroll: 是否固定在可视区域中;  X
    
- Method
    * setBody;      X
    * setPosition;  X
    * setSize;      X
    
    * show;         X
    * hide;         X
    * center;       X
    * bringToTop;

- Event X
    * afterInit;
    * afterFirstRender;
    * changeBody;
    * changeHeader;
    * changeFooter;
    * center;
    * changePosition;
    * onShow;
    * onHide;

2) S.Overlay.Effect
3) S.Overlay.Request
4) S.Dialog
    * setHeader;    X
    * setBody;      X
5) S.Popup: 和Overlay一致
6) S.Mask:  和Overlay一致





















http://10.1.6.138:8080/qcbin/start_a.htm

S.Overlay.create = function(trigger, cfg) {
    var ret = [];
    if (S.isString(trigger)) {
        S.each(DOM.query(trigger), function(t) {
            ret.push(new Overlay(t, cfg));
        });
        return ret.length === 1 ? ret[0] : ret;
    }
    return null;
}
