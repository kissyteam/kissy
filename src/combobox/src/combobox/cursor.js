/**
 * @ignore
 * get cursor position of input
 * @author yiminghe@gmail.com
 */
KISSY.add('combobox/cursor', function (S, DOM) {

    var FAKE_DIV_HTML = "<div style='" +
            "z-index:-9999;" +
            "overflow:hidden;" +
            "position: fixed;" +
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
            'height',
            'fontFamily',
            'fontSize',
            'fontWeight',
            'fontVariant',
            'fontStyle'
        ],
        supportInputScrollLeft,
        findSupportInputScrollLeft;

    function getFakeDiv(elem) {
        var fake = FAKE_DIV, body;
        if (!fake) {
            fake = DOM.create(FAKE_DIV_HTML);
        }
        if (String(elem.type) == 'textarea') {
            DOM.css(fake, "width", DOM.css(elem, "width"));
        } else {
            // input does not wrap at all
            DOM.css(fake, "width", 9999);
        }
        S.each(STYLES, function (s) {
            DOM.css(fake, s, DOM.css(elem, s));
        });
        if (!FAKE_DIV) {
            body = elem.ownerDocument.body;
            body.insertBefore(fake, body.firstChild);
        }
        FAKE_DIV = fake;
        return fake;
    }

    findSupportInputScrollLeft = function () {
        var doc = document,
            input = DOM.create("<input>");
        DOM.css(input, {
            width: 1,
            position: "absolute",
            left: -9999,
            top: -9999
        });
        input.value = "123456789";
        doc.body.appendChild(input);
        input.focus();
        supportInputScrollLeft = !!(input.scrollLeft > 0);
        DOM.remove(input);
        findSupportInputScrollLeft = S.noop;
    };

    // firefox not support, chrome support
    supportInputScrollLeft = false;

    return function (elem) {
        elem = DOM.get(elem);
        var doc = elem.ownerDocument,
            elemOffset,
            range,
            fake,
            selectionStart,
            offset,
            marker,
            elemScrollTop = elem.scrollTop,
            elemScrollLeft = elem.scrollLeft;
        if (doc.selection) {
            range = doc.selection.createRange();
            return {
                // http://msdn.microsoft.com/en-us/library/ie/ms533540(v=vs.85).aspx
                // or simple range.offsetLeft for textarea
                left: range.boundingLeft + elemScrollLeft + DOM.scrollLeft(),
                top: range.boundingTop + elemScrollTop + range.boundingHeight + DOM.scrollTop()
            };
        }

        elemOffset = DOM.offset(elem);

        // input does not has scrollLeft
        // so just get the position of the beginning of input
        if (!supportInputScrollLeft && elem.type != 'textarea') {
            elemOffset.top += elem.offsetHeight;
            return elemOffset;
        }

        fake = getFakeDiv(elem);

        selectionStart = elem.selectionStart;

        fake.innerHTML = S.escapeHTML(elem.value.substring(0, selectionStart - 1)) +
            // marker
            MARKER;

        // can not set fake to scrollTop，marker is always at bottom of marker
        // when cursor at the middle of textarea , error occurs
        // fake.scrollTop = elemScrollTop;
        // fake.scrollLeft = elemScrollLeft;
        offset = elemOffset;

        // offset.left += 500;
        DOM.offset(fake, offset);
        marker = fake.lastChild;
        offset = DOM.offset(marker);
        offset.top += DOM.height(marker);
        // at the start of textarea , just fetch marker's left
        if (selectionStart > 0) {
            offset.left += DOM.width(marker);
        }

        // so minus scrollTop/Left
        offset.top -= elemScrollTop;
        offset.left -= elemScrollLeft;

        // offset.left -= 500;
        return offset;
    };
}, {
    requires: ['dom']
});