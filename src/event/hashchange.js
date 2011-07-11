/**
 * @module  event-hashchange
 * @author  yiminghe@gmail.com, xiaomacji@gmail.com
 */
KISSY.add('event/hashchange', function(S, Event, DOM, UA) {

    var doc = document,
        HASH_CHANGE = 'hashchange',
        docMode = doc['documentMode'],
        ie = docMode || UA['ie'];

    // IE8以上切换浏览器模式到IE7，会导致 'onhashchange' in window === true
    if ((!( 'on' + HASH_CHANGE in window)) || ie < 8) {
        var getHash = function() {
            var url = location.href;
            return '#' + url.replace(/^[^#]*#?(.*)$/, '$1');
        },
            setup = function () {
                poll();
            },
            tearDown = function () {
                timer && clearTimeout(timer);
                timer = null;
            },
            poll = function () {
                //console.log('poll start..' + +new Date());
                var hash = getHash();

                if (hash !== lastHash) {
                    //debugger
                    hashChange(hash);
                    lastHash = hash;
                }
                timer = setTimeout(poll, 50);
            },
            hashChange = function (hash) {
                notifyHashChange(hash);
            },
            notifyHashChange = function (hash) {
                S.log("hash changed : " + hash);
                for (var i = 0; i < targets.length; i++) {
                    var t = targets[i];
                    //模拟暂时没有属性
                    Event._handle(t, {
                        type: HASH_CHANGE
                    });
                }
            },
            timer,
            targets = [],
            lastHash = getHash();

        Event.special[HASH_CHANGE] = {
            setup: function() {
                var target = this,
                    index = S.indexOf(target, targets);
                if (-1 === index) {
                    targets.push(target);
                }
                if (!timer) {
                    setup();
                }
                //不用注册dom事件
            },
            tearDown: function() {
                var target = this,
                    index = S.indexOf(target, targets);
                if (index >= 0) {
                    targets.splice(index, 1);
                }
                if (targets.length === 0) {
                    tearDown();
                }
            }
        };

        // ie6, 7, 用匿名函数来覆盖一些function
        if (ie < 8) {
            (function() {
                var iframe;

                /**
                 * 前进后退 : start -> notifyHashChange
                 * 直接输入 : poll -> hashChange -> start
                 * iframe 内容和 url 同步
                 */

                setup = function() {
                    if (!iframe) {
                        //http://www.paciellogroup.com/blog/?p=604
                        iframe = DOM.create('<iframe ' +
                            //'src="#" ' +
                            'style="display: none" ' +
                            'height="0" ' +
                            'width="0" ' +
                            'tabindex="-1" ' +
                            'title="empty"/>');
                        // Append the iframe to the documentElement rather than the body.
                        // Keeping it outside the body prevents scrolling on the initial
                        // page load
                        DOM.prepend(iframe, document.documentElement);

                        // init
                        Event.add(iframe, "load", function() {
                            Event.remove(iframe, "load");
                            // Update the iframe with the initial location hash, if any. This
                            // will create an initial history entry that the user can return to
                            // after the state has changed.
                            hashChange(getHash());
                            Event.add(iframe, "load", start);
                            poll();
                        });

                        /**
                         * 前进后退 ： start -> 触发
                         * 直接输入 : timer -> hashChange -> start -> 触发
                         * 触发统一在 start(load)
                         * iframe 内容和 url 同步
                         */
                            //后退触发点
                            //或addHistory 调用
                            //只有 start 来通知应用程序
                        function start() {
                            //console.log('iframe start load..');
                            //debugger
                            var c = S.trim(iframe.contentWindow.document.body.innerHTML);
                            var ch = getHash();

                            //后退时不等
                            //改变location则相等
                            if (c != ch) {
                                location.hash = c;
                                // 使lasthash为iframe历史， 不然重新写iframe， 会导致最新状态（丢失前进状态）
                                lastHash = c;
                            }
                            notifyHashChange(c);
                        }
                    }
                };

                hashChange = function(hash) {
                    //debugger
                    var html = '<html><body>' + hash + '</body></html>';
                    var doc = iframe.contentWindow.document;
                    try {
                        // 写入历史 hash
                        doc.open();
                        doc.write(html);
                        doc.close();
                        return true;
                    } catch (e) {
                        return false;
                    }
                };
            })();
        }
    }
}, {
    requires:["./base","dom","ua"]
});

/**
 * v1 : 2010-12-29
 * v1.1: 支持非IE，但不支持onhashchange事件的浏览器(例如低版本的firefox、safari)
 * refer : http://yiminghe.javaeye.com/blog/377867
 *         https://github.com/cowboy/jquery-hashchange
 */