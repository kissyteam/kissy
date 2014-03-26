/**
 * @ignore
 * get cursor position of input
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Node = require('node');
    var $ = Node.all,
        FAKE_DIV_HTML = '<div style="' +
            'z-index:-9999;' +
            'overflow:hidden;' +
            'position: fixed;' +
            'left:-9999px;' +
            'top:-9999px;' +
            'opacity:0;' +
            // firefox default normal,need to force to use pre-wrap
            'white-space:pre-wrap;' +
            'word-wrap:break-word;' +
            '"></div>',
        FAKE_DIV,
        MARKER = '<span>' +
            // must has content
            // or else <br/><span></span> can not get right coordinates
            'x' +
            '</span>',
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
        var fake = FAKE_DIV;
        if (!fake) {
            fake = $(FAKE_DIV_HTML);
        }
        if (String(elem[0].type.toLowerCase()) === 'textarea') {
            fake.css('width', elem.css('width'));
        } else {
            // input does not wrap at all
            fake.css('width', 9999);
        }
        S.each(STYLES, function (s) {
            fake.css(s, elem.css(s));
        });
        if (!FAKE_DIV) {
            fake.insertBefore(elem[0].ownerDocument.body.firstChild);
        }
        FAKE_DIV = fake;
        return fake;
    }

    findSupportInputScrollLeft = function () {
        var doc = document,
            input = $('<input>');
        input.css({
            width: 1,
            position: 'absolute',
            left: -9999,
            top: -9999
        });
        input.val('123456789');
        input.appendTo(doc.body);
        input[0].focus();
        supportInputScrollLeft = (input[0].scrollLeft > 0);
        input.remove();
        findSupportInputScrollLeft = S.noop;
    };

    // firefox not support, chrome support
    supportInputScrollLeft = false;

    return function (elem) {
        var $elem = $(elem);
        elem = $elem[0];
        var doc = elem.ownerDocument,
            $doc = $(doc),
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
                left: range.boundingLeft + elemScrollLeft +
                    $doc.scrollLeft(),
                top: range.boundingTop + elemScrollTop +
                    range.boundingHeight + $doc.scrollTop()
            };
        }

        elemOffset = $elem.offset();

        // input does not has scrollLeft
        // so just get the position of the beginning of input
        if (!supportInputScrollLeft && elem.type !== 'textarea') {
            elemOffset.top += elem.offsetHeight;
            return elemOffset;
        }

        fake = getFakeDiv($elem);

        selectionStart = elem.selectionStart;

        fake.html(S.escapeHtml(elem.value.substring(0, selectionStart - 1)) +
            // marker
            MARKER);

        // can not set fake to scrollTop，marker is always at bottom of marker
        // when cursor at the middle of textarea , error occurs
        // fake.scrollTop = elemScrollTop;
        // fake.scrollLeft = elemScrollLeft;
        offset = elemOffset;

        // offset.left += 500;
        fake.offset(offset);
        marker = fake.last();
        offset = marker.offset();
        offset.top += marker.height();
        // at the start of textarea , just fetch marker's left
        if (selectionStart > 0) {
            offset.left += marker.width();
        }

        // so minus scrollTop/Left
        offset.top -= elemScrollTop;
        offset.left -= elemScrollLeft;

        // offset.left -= 500;
        return offset;
    };
});