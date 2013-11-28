KISSY.use("anim,node,button",function(S,Anim,Node,Button){
    var $ = Node.all;

    // 创建几个状态的按钮
    var start = new Button({
        content: "开始"
    }), endCurrent = new Button({
        content: "停止当前动画并继续下一个动画"
    }), endCurrentNext = new Button({
        content: "停止当前动画到终态并继续下一个动画"
    }), endCurrentNextStop = new Button({
        content: "停止当前动画并停止所有动画"
    }), endAll = new Button({
        content: "停止当前动画到终态后停止所有动画"
    });
    start.render();endCurrent.render();endCurrentNext.render();endCurrentNextStop.render();endAll.render();

    // 动画对象
    var obj = $("#animObj"),container = obj.parent(),
        objWidth = obj.outerWidth(), containerWidth = container.outerWidth(),
        objHeight = obj.outerHeight(), containerHeight = container.outerHeight(),
        //containerOffset = container.offset(),
        containerOffset = {left: parseInt(container.css('left')), top: parseInt(container.css('top'))},
        adjustCls = function() {
            obj.removeClass(cls[clsIdx]);
            obj.addClass(cls[++clsIdx]);
            if (clsIdx % 4 === 0) {
                start.set('disabled', false);
                clsIdx = 0;
                obj.addClass(cls[clsIdx]);
            }
        },
        commonCfg = {
            duration: 3,
            queue: 'my',
            complete: adjustCls
        },
        cls = ['right', 'down', 'left', 'up'],
        clsIdx = 0;

    // 设置初始状态
    obj.css({
        left: containerOffset.left - objWidth/2,
        top: containerOffset.top - objHeight/2
    }).addClass(cls[clsIdx]);

    // 事件绑定
    start.on('click', function() {
        start.set('disabled', true);
        // 向右
        obj.animate({
            left: containerOffset.left + containerWidth - objWidth/2
        }, commonCfg).
        // 向下
        animate({
            top: containerOffset.top + containerHeight - objHeight/2
        }, commonCfg).
        // 向左
        animate({
            left: containerOffset.left  - objWidth/2
        }, commonCfg).
        // 向上
        animate({
            top: containerOffset.top - objHeight/2
        }, commonCfg);
    });


    endCurrent.on('click', function() {
        adjustCls();

        obj.stop(); // 0, 0
    });
    endCurrentNext.on('click', function() {
        obj.stop(1); // 1, 0
    });
    endCurrentNextStop.on('click', function() {
        obj.stop(0, 1); // 0, 1
    });
    endAll.on('click', function() {
        obj.stop(1, 1); // 1, 1
    });

});
