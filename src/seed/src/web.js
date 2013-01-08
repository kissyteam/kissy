/**
 * @ignore
 * @fileOverview web.js
 * @author lifesinger@gmail.com, yiminghe@gmail.com
 * @description this code can only run at browser environment
 */
(function (S, undefined) {

    var win = S.Env.host,

        UA= S.UA,

        doc = win['document'],

        docElem = doc && doc.documentElement,

        location = win.location,

        EMPTY = '',

        readyDefer = new S.Defer(),

        readyPromise = readyDefer.promise,

    // The number of poll times.
        POLL_RETIRES = 500,

    // The poll interval in milliseconds.
        POLL_INTERVAL = 40,

    // #id or id
        RE_IDSTR = /^#?([\w-]+)$/,

        RE_NOT_WHITE = /\S/;

    S.mix(S, {


        /**
         * A crude way of determining if an object is a window
         * @member KISSY
         */
        isWindow: function (obj) {
            return obj != null && obj == obj.window;
        },


        /**
         * get xml representation of data
         * @param {String} data
         * @member KISSY
         */
        parseXML: function (data) {
            // already a xml
            if (data.documentElement) {
                return data;
            }
            var xml;
            try {
                // Standard
                if (win['DOMParser']) {
                    xml = new DOMParser().parseFromString(data, 'text/xml');
                } else { // IE
                    xml = new ActiveXObject('Microsoft.XMLDOM');
                    xml.async = false;
                    xml.loadXML(data);
                }
            } catch (e) {
                S.log('parseXML error : ');
                S.log(e);
                xml = undefined;
            }
            if (!xml || !xml.documentElement || xml.getElementsByTagName('parsererror').length) {
                S.error('Invalid XML: ' + data);
            }
            return xml;
        },

        /**
         * Evaluates a script in a global context.
         * @member KISSY
         */
        globalEval: function (data) {
            if (data && RE_NOT_WHITE.test(data)) {
                // http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
                // http://msdn.microsoft.com/en-us/library/ie/ms536420(v=vs.85).aspx always return null
                ( win.execScript || function (data) {
                    win[ 'eval' ].call(win, data);
                } )(data);
            }
        },

        /**
         * Specify a function to execute when the DOM is fully loaded.
         * @param fn {Function} A function to execute after the DOM is ready
         *
         * for example:
         *      @example
         *      KISSY.ready(function(S){});
         *
         * @chainable
         * @member KISSY
         */
        ready: function (fn) {

            readyPromise.then(fn);

            return this;
        },

        /**
         * Executes the supplied callback when the item with the supplied id is found.
         * @param id <String> The id of the element, or an array of ids to look for.
         * @param fn <Function> What to execute when the element is found.
         * @member KISSY
         */
        available: function (id, fn) {
            id = (id + EMPTY).match(RE_IDSTR)[1];
            if (!id || !S.isFunction(fn)) {
                return;
            }

            var retryCount = 1,
                node,
                timer = S.later(function () {
                    if ((node = doc.getElementById(id)) && (fn(node) || 1) ||
                        ++retryCount > POLL_RETIRES) {
                        timer.cancel();
                    }
                }, POLL_INTERVAL, true);
        }
    });

    /**
     * Binds ready events.
     * @ignore
     */
    function _bindReady() {
        var doScroll = docElem && docElem.doScroll,
            eventType = doScroll ? 'onreadystatechange' : 'DOMContentLoaded',
            COMPLETE = 'complete',
            fire = function () {
                readyDefer.resolve(S)
            };

        // Catch cases where ready() is called after the
        // browser event has already occurred.
        if (!doc || doc.readyState === COMPLETE) {
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
                S.log('get frameElement error : ');
                S.log(e);
                notframe = false;
            }

            // can not use in iframe,parent window is dom ready so doScroll is ready too
            if (doScroll && notframe) {
                function readyScroll() {
                    try {
                        // Ref: http://javascript.nwbox.com/IEContentLoaded/
                        doScroll('left');
                        fire();
                    } catch (ex) {
                        //S.log('detect document ready : ' + ex);
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


//     bind on start
//     in case when you bind but the DOMContentLoaded has triggered
//     then you has to wait onload
//     worst case no callback at all
    _bindReady();

    if (UA.ie) {
        try {
            doc.execCommand('BackgroundImageCache', false, true);
        } catch (e) {
        }
    }

})(KISSY, undefined);
