/**
 * @fileOverview   web.js
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 * @description this code can only run at browser environment
 */
(function (S, undefined) {

    var win = S.Env.host,

        doc = win['document'],

        docElem = doc.documentElement,

        EMPTY = '',

        readyDefer = new S.Defer(),

        readyPromise = readyDefer.promise,

        // The number of poll times.
        POLL_RETRYS = 500,

        // The poll interval in milliseconds.
        POLL_INTERVAL = 40,

        // #id or id
        RE_IDSTR = /^#?([\w-]+)$/,

        RE_NOT_WHITE = /\S/;

    S.mix(S,
        /**
         * @lends KISSY
         */
        {


            /**
             * A crude way of determining if an object is a window
             */
            isWindow:function (o) {
                return S.type(o) === 'object'
                    && 'setInterval' in o
                    && 'document' in o
                    && o.document.nodeType == 9;
            },


            /**
             * get xml representation of data
             * @param {String} data
             */
            parseXML:function (data) {
                var xml;
                try {
                    // Standard
                    if (win.DOMParser) {
                        xml = new DOMParser().parseFromString(data, "text/xml");
                    } else { // IE
                        xml = new ActiveXObject("Microsoft.XMLDOM");
                        xml.async = "false";
                        xml.loadXML(data);
                    }
                } catch (e) {
                    S.log("parseXML error : ");
                    S.log(e);
                    xml = undefined;
                }
                if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
                    S.error("Invalid XML: " + data);
                }
                return xml;
            },

            /**
             * Evalulates a script in a global context.
             */
            globalEval:function (data) {
                if (data && RE_NOT_WHITE.test(data)) {
                    // http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
                    ( win.execScript || function (data) {
                        win[ "eval" ].call(win, data);
                    } )(data);
                }
            },

            /**
             * Specify a function to execute when the DOM is fully loaded.
             * @param fn {Function} A function to execute after the DOM is ready
             * <code>
             * KISSY.ready(function(S){ });
             * </code>
             * @return {KISSY}
             */
            ready:function (fn) {

                function f() {
                    try {
                        fn(S);
                    } catch (e) {
                        // print stack info for firefox/chrome
                        S.log(e.stack, "error");
                        if (S.Config.debug) {
                            throw e;
                        }
                    }
                }

                readyPromise.then(f);

                return this;
            },

            /**
             * Executes the supplied callback when the item with the supplied id is found.
             * @param id <String> The id of the element, or an array of ids to look for.
             * @param fn <Function> What to execute when the element is found.
             */
            available:function (id, fn) {
                id = (id + EMPTY).match(RE_IDSTR)[1];
                if (!id || !S.isFunction(fn)) {
                    return;
                }

                var retryCount = 1,
                    node,
                    timer = S.later(function () {
                        if ((node = doc.getElementById(id)) && (fn(node) || 1) ||
                            ++retryCount > POLL_RETRYS) {
                            timer.cancel();
                        }
                    }, POLL_INTERVAL, true);
            }
        });


    /**
     * Binds ready events.
     */
    function _bindReady() {
        var doScroll = docElem.doScroll,
            eventType = doScroll ? 'onreadystatechange' : 'DOMContentLoaded',
            COMPLETE = 'complete',
            fire = function () {
                readyDefer.resolve(S)
            };

        // Catch cases where ready() is called after the
        // browser event has already occurred.
        if (doc.readyState === COMPLETE) {
            return fire();
        }

        // w3c mode
        if (doc.addEventListener) {
            function domReady() {
                doc.removeEventListener(eventType, domReady, false);
                fire();
            }

            doc.addEventListener(eventType, domReady, false);

            // A fallback to window.onload, that will always work
            win.addEventListener('load', fire, false);
        }
        // IE event model is used
        else {
            function stateChange() {
                if (doc.readyState === COMPLETE) {
                    doc.detachEvent(eventType, stateChange);
                    fire();
                }
            }

            // ensure firing before onload (but completed after all inner iframes is loaded)
            // maybe late but safe also for iframes
            doc.attachEvent(eventType, stateChange);

            // A fallback to window.onload, that will always work.
            win.attachEvent('onload', fire);

            // If IE and not a frame
            // continually check to see if the document is ready
            var notframe;

            try {
                notframe = (win['frameElement'] === null);
            } catch (e) {
                S.log("get frameElement error : ");
                S.log(e);
                notframe = false;
            }

            // can not use in iframe,parent window is dom ready so doScoll is ready too
            if (doScroll && notframe) {
                function readyScroll() {
                    try {
                        // Ref: http://javascript.nwbox.com/IEContentLoaded/
                        doScroll('left');
                        fire();
                    } catch (ex) {
                        //S.log("detect document ready : " + ex);
                        setTimeout(readyScroll, POLL_INTERVAL);
                    }
                }

                readyScroll();
            }
        }
        return 0;
    }

    // If url contains '?ks-debug', debug mode will turn on automatically.
    if (location && (location.search || EMPTY).indexOf('ks-debug') !== -1) {
        S.Config.debug = true;
    }

    /**
     * bind on start
     * in case when you bind but the DOMContentLoaded has triggered
     * then you has to wait onload
     * worst case no callback at all
     */
    _bindReady();

    if (navigator.userAgent.match(/MSIE/)) {
        try {
            doc.execCommand("BackgroundImageCache", false, true);
        } catch (e) {
        }
    }

})(KISSY, undefined);
