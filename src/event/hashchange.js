/**
 * @module  event-hashchange
 * @author  yiminghe@gmail.com , xiaomacji@gmail.com
 */
KISSY.add('event/hashchange', function(S, Event, DOM, UA) {

    var ie = docMode || UA['ie'],
        HASH_CHANGE = 'hashchange';

    // IE8以上切换浏览器模式到IE7，会导致 'onhashchange' in window === true
    // 1. 不支持 hashchange 事件，支持 hash 导航(opera??)：定时器监控
    // 2. 不支持 hashchange 事件，不支持 hash 导航(ie67) : iframe + 定时器
    if ((!( 'on' + HASH_CHANGE in window)) || ie < 8) {

        var POLL_INTERVAL = 50,
            doc = document,
            win = window,
            IFRAME_TEMPLATE = "<html><title>" + (doc.title || "") +
                " - {hash}</title><body>{hash}</body></html>",
            docMode = doc['documentMode'],
            getHash = function() {
                // ie 返回 "" ，其他返回 "#"
                // return location.hash ?
                var url = location.href;
                return '#' + url.replace(/^[^#]*#?(.*)$/, '$1');
            },
            timer,

            lastHash = getHash(),

            poll = function () {
                var hash = getHash();
                if (hash !== lastHash) {
                    hashChange(hash);
                    lastHash = hash;
                }
                timer = setTimeout(poll, POLL_INTERVAL);
            },

            hashChange = ie < 8 ? function(hash) {
                //debugger
                var html = S.substitute(IFRAME_TEMPLATE, {
                    hash: hash
                }),
                    doc = iframe.contentWindow.document;
                try {
                    // 写入历史 hash
                    doc.open();
                    doc.write(html);
                    doc.close();
                    return true;
                } catch (e) {
                    S.log('doc write error : ');
                    S.log(e);
                    return false;
                }
            } : function () {
                notifyHashChange();
            },

            notifyHashChange = function () {
                //S.log("hash changed : " + hash);
                Event.fire(win, HASH_CHANGE);
            },
            setup = function () {
                if (!timer) {
                    poll();
                }
            },
            tearDown = function () {
                timer && clearTimeout(timer);
                timer = null;
            },
            iframe;

        // ie6, 7, 覆盖一些function
        if (ie < 8) {

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

                    // init，第一次触发，以后都是 start
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
                        //S.log('iframe start load..');
                        //debugger
                        var c = S.trim(DOM.html(iframe.contentWindow.document.body));
                        var ch = getHash();

                        //后退时不等
                        //改变location则相等
                        if (c != ch) {
                            location.hash = c;
                            // 使lasthash为iframe历史， 不然重新写iframe， 会导致最新状态（丢失前进状态）
                            lastHash = c;
                        }
                        notifyHashChange();
                    }
                }
            };

            tearDown = function() {
                timer && clearTimeout(timer);
                timer = null;
                Event.detach(iframe);
                DOM.remove(iframe);
                iframe = null;
            };
        }

        Event.special[HASH_CHANGE] = {
            setup: function() {
                if (this !== win) {
                    return;
                }
                // 不用注册 dom 事件
                setup();
            },
            tearDown: function() {
                if (this !== win) {
                    return;
                }
                tearDown();
            }
        };
    }
}, {
    requires:["./base","dom","ua"]
});

/**
 * 已知 bug :
 * - ie67 有时后退后取得的 location.hash 不和地址栏一致，导致必须后退两次才能触发 hashchange
 *
 * v1 : 2010-12-29
 * v1.1: 支持非IE，但不支持onhashchange事件的浏览器(例如低版本的firefox、safari)
 * refer : http://yiminghe.javaeye.com/blog/377867
 *         https://github.com/cowboy/jquery-hashchange
 */