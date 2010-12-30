/**
 * @module  event-hashchange for ie6,7
 * @author  yiminghe@gmail.com
 */
KISSY.add('event-hashchange', function(S) {

    var Event = S.Event,
        ie = document['documentMode'] || S.UA['ie'];

    // 让 ie6,7 支持 hashchange
    if (ie < 8) {
        var timer;

        var startIE = function () {
            //S.log("init ie6,7 hashchange");

            /**
             * 前进后退 ： start -> timer
             * 直接输入 : timer -> addHistory -> start
             * 触发统一在 start(load)
             * iframe 内容和 url 同步
             */
            //http://www.paciellogroup.com/blog/?p=604
            var iframe = S.DOM.create('<iframe ' +
                'src="javascript:0" ' +
                'style="display:none" ' +
                'height="0" ' +
                'width="0" ' +
                'tabindex="-1" ' +
                'title="empty"/>');
            // Append the iframe to the documentElement rather than the body.
            // Keeping it outside the body prevents scrolling on the initial
            // page load
            S.DOM.prepend(iframe, document.documentElement);
            var h = 0,
                location = window.location;
            //初始化
            function init() {
                //debugger
                Event.remove(iframe, "load");
                // Update the iframe with the initial location hash, if any. This
                // will create an initial history entry that the user can return to
                // after the state has changed.
                addHistory(location.hash || "#");
                Event.add(iframe, "load", start);
                check();
            }

            Event.add(iframe, "load", init);

            //后退触发点
            //或addHistory 调用
            function start() {
                //debugger
                var c = S.trim(iframe.contentWindow.document.body.innerHTML);
                var ch = location.hash || "#";
                //后退时不等
                //改变location则相等
                if (c != ch) {
                    //设为相等，但是这是不希望触发hashchange
                    location.hash = c;
                }
                notifyHashChange();
            }

            function addHistory(archor) {
                //debugger
                var html = '<html><body>' + archor + '</body></html>';
                var doc = iframe.contentWindow.document;
                try {
                    doc.open();
                    doc.write(html);
                    doc.close();
                    return true;
                } catch (e) {
                    return false;
                }
            }

            function check() {
                timer = setTimeout(function() {
                    var c = S.trim(iframe.contentWindow.document.body.innerHTML);
                    var ch = location.hash || "#";
                    if (c != ch) {
                        addHistory(ch);
                    }
                    //S.log("monitor ie6,7 hashchange!");
                    check();
                }, 500);
            }


            startIE = check;
        },stopIE = function() {
            clearTimeout(timer);
            timer = null;
        };

        function notifyHashChange() {

            for (var i = 0; i < targets.length; i++) {
                var t = targets[i];
                //模拟暂时没有属性
                Event._handle(t, {type:"hashchange"});
            }
        }

        var targets = [];

        Event.special["hashchange"] = {
            //不用注册dom事件
            fix: false,
            init: function(target) {
                var index = S.indexOf(target, target);
                if (index == -1)
                    targets.push(target);
                if (!timer) {
                    startIE();
                }
            },
            destroy: function(target, type) {

                var events = Event.__getEvents(target);
                if (!events[type]) {
                    var index = S.indexOf(target, targets);
                    if (index >= 0)
                        targets.splice(index, 1);
                }
                if (targets.length == 0) {
                    stopIE();
                }
            }
        }
    }
});

/**
 * v1 : 2010-12-29
 * refer : http://yiminghe.javaeye.com/blog/377867
 */
