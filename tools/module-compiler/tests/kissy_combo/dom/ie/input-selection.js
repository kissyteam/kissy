/**
 * handle input selection and cursor position ie hack
 * @author yiminghe@gmail.com
 */
KISSY.add('dom/ie/input-selection', function (S, DOM) {
    var propHooks = DOM._propHooks;
    // S.log("fix selectionEnd/Start !");
    // note :
    // in ie textarea can not set selectionStart or selectionEnd between '\r' and '\n'
    // else kissy will move start to one step backward and move end to one step forword
    // 1\r^\n2\r^\n3
    // =>
    // 1^\r\n2\r\n^3
    propHooks.selectionStart = {
        set: function (elem, start) {
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
        get: function (elem) {
            return getStartEnd(elem)[0];
        }
    };

    propHooks.selectionEnd = {
        set: function (elem, end) {
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
        get: function (elem) {
            return getStartEnd(elem, 1)[1];
        }
    };

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
}, {
    requires: ['dom/base']
});
