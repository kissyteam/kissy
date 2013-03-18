/**
 * @ignore
 * special house for special events
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/special', function () {
    var undefined = undefined;
    return {

        load: {
            // defaults to bubbles as custom event
            bubbles: false
        },
        click: {
            // use native click for correct check state order
            fire: function () {
                var target = this;
                if (String(target.type) === "checkbox" && target.click && target.nodeName.toLowerCase() == 'input') {
                    target.click();
                    return false;
                }
                return undefined;
            }
        },
        focus: {
            bubbles: false,
            // guarantee fire blur first
            fire: function () {
                var target = this;
                if (target.ownerDocument) {
                    if (target !== target.ownerDocument.activeElement && target.focus) {
                        target.focus();
                        return false;
                    }
                }
                return undefined;
            }
        },
        blur: {
            bubbles: false,
            // guarantee fire blur first
            fire: function () {
                var target = this;
                if (target.ownerDocument) {
                    if (target === target.ownerDocument.activeElement && target.blur) {
                        target.blur();
                        return false;
                    }
                }
                return undefined;
            }
        }

    };
});