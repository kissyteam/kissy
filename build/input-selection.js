/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Apr 11 12:26
*/
/**
 * normalize selection getter/setter in textarea/input
 * @author yiminghe@gmail.com
 */
KISSY.add("input-selection", function (S, DOM) {
    var propHooks = DOM._propHooks;

    if (typeof S.Env.host.document.createElement("input").selectionEnd != "number") {
        // S.log("fix selectionEnd/Start !");
        // note :
        // in ie textarea can not set selectionStart or selectionEnd between '\r' and '\n'
        // else kissy will move start to one step backward and move end to one step forword
        // 1\r^\n2\r^\n3
        // =>
        // 1^\r\n2\r\n^3
        propHooks.selectionStart = {
            set:function (elem, start) {
                var selectionRange = getSelectionRange(elem),
                    inputRange = getInputRange(elem);
                if (inputRange.inRange(selectionRange)) {
                    var end = getStartEnd(elem, 1)[1],
                        diff = getMovedDistance(elem, start, end);
                    selectionRange.collapse(false);
                    selectionRange.moveStart('character', -diff);
                    if (start > end) {
                        selectionRange.collapse(true);
                    }
                    selectionRange.select();
                }
            },
            get:function (elem) {
                return getStartEnd(elem)[0];
            }
        };

        propHooks.selectionEnd = {
            set:function (elem, end) {
                var selectionRange = getSelectionRange(elem),
                    inputRange = getInputRange(elem);
                if (inputRange.inRange(selectionRange)) {
                    var start = getStartEnd(elem)[0],
                        diff = getMovedDistance(elem, start, end);
                    selectionRange.collapse(true);
                    selectionRange.moveEnd('character', diff);
                    if (start > end) {
                        selectionRange.collapse(false);
                    }
                    selectionRange.select();

                }
            },
            get:function (elem) {
                return getStartEnd(elem, 1)[1];
            }
        };

        /**
         * @param elem
         * @param [includeEnd]
         */
        function getStartEnd(elem, includeEnd) {
            var start = 0,
                end = 0,
                selectionRange = getSelectionRange(elem),
                inputRange = getInputRange(elem);
            if (inputRange.inRange(selectionRange)) {
                inputRange.setEndPoint('EndToStart', selectionRange);
                start = getRangeText(elem, inputRange).length;
                if (includeEnd) {
                    end = start + getRangeText(elem, selectionRange).length;
                }
            }
            return [start, end];
        }

        function getSelectionRange(elem) {
            return  elem.ownerDocument.selection.createRange();
        }

        function getInputRange(elem) {
            // buggy textarea , can not pass inRange test
            if (elem.type == 'textarea') {
                var range = elem.document.body.createTextRange();
                range.moveToElementText(elem);
                return range;
            } else {
                return elem.createTextRange();
            }
        }

        // moveEnd("character",1) will jump "\r\n" at one step
        function getMovedDistance(elem, s, e) {
            var start = Math.min(s, e);
            var end = Math.max(s, e);
            if (start == end) {
                return 0;
            }
            if (elem.type == "textarea") {
                var l = elem.value.substring(start, end).replace(/\r\n/g, '\n').length;
                if (s > e) {
                    l = -l;
                }
                return l;
            } else {
                return e - s;
            }
        }

        // range.text will not contain "\r\n" if "\r\n" if "\r\n" is at end of this range
        function getRangeText(elem, range) {
            if (elem.type == "textarea") {
                var ret = range.text,
                    testRange = range.duplicate();

                // consider end \r\n
                if (testRange.compareEndPoints('StartToEnd', testRange) == 0) {
                    return ret;
                }

                testRange.moveEnd('character', -1);
                if (testRange.text == ret) {
                    ret += '\r\n';
                }

                return ret;
            } else {
                return range.text;
            }
        }
    }

    var FAKE = "<div style='" +
        "z-index:-9999;" +
        "overflow:hidden;" +
        "position: absolute;" +
        "left:-9999px;" +
        "top:-9999px;" +
        "opacity:0;" +
        // firefox default normal,need to force to use pre-wrap
        "white-space:pre-wrap;" +
        "word-wrap:break-word;" +
        "'></div>",
        FAKE_DIV,
        MARKER = "<span>" +
            // must has content
            // or else <br/><span></span> can not get right coordinates
            "x" +
            "</span>",
        STYLES = [
            'paddingLeft',
            'paddingTop', 'paddingBottom',
            'paddingRight',
            'marginLeft',
            'marginTop',
            'marginBottom',
            'marginRight',
            'borderLeftStyle',
            'borderTopStyle',
            'borderBottomStyle',
            'borderRightStyle',
            'borderLeftWidth',
            'borderTopWidth',
            'borderBottomWidth',
            'borderRightWidth',
            'line-height',
            'outline',
            'width',
            'height',
            'fontFamily',
            'fontSize',
            'fontWeight',
            'fontVariant',
            'fontStyle'
        ];

    propHooks.KsCursorOffset = {
        get:function (elem) {
            var doc = elem.ownerDocument, offset,
                elemScrollTop = elem.scrollTop,
                elemScrollLeft = elem.scrollLeft;
            if (doc.selection) {
                var range = doc.selection.createRange();
                return {
                    // http://msdn.microsoft.com/en-us/library/ie/ms533540(v=vs.85).aspx
                    // or simple range.offsetLeft for textarea
                    left:range.boundingLeft + elemScrollLeft,
                    top:range.boundingTop + elemScrollTop
                };
            }

            var fake;

            if (!FAKE_DIV) {
                fake = DOM.create(FAKE);
                S.each(STYLES, function (s) {
                    DOM.css(fake, s, DOM.css(elem, s));
                });
            } else {
                fake = FAKE_DIV;
            }

            var selectionStart = elem.selectionStart;

            fake.innerHTML = S.escapeHTML(elem.value.substring(0, selectionStart)) +
                // marker
                MARKER;

//            S.log(selectionStart);
//            S.log(fake.innerHTML);
//            S.log(elemScrollTop);
            if (!FAKE_DIV) {
                DOM.prepend(fake, doc.body);
                FAKE_DIV = fake;
            }
            // can not set fake to scrollTop，marker is always at bottom of marker
            // when cursor at the middle of textarea , error occurs
            // fake.scrollTop = elemScrollTop;
            // fake.scrollLeft = elemScrollLeft;
            offset = DOM.offset(elem);
            // offset.left += 500;
            DOM.offset(fake, offset);
            var marker = fake.lastChild;
            offset = DOM.offset(marker);
            offset.top += DOM.height(marker);
            // so minus scrollTop/Left
            offset.top -= elemScrollTop;
            offset.left -= elemScrollLeft;
            // offset.left -= 500;
            return offset;
        }
    };
}, {
    requires:['dom']
});
