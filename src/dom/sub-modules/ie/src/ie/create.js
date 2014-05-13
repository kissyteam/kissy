/**
 * @ignore
 * ie create hack
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var util = require('util');
    var Dom = require('dom/base');
    // wierd ie cloneNode fix from jq
    Dom._fixCloneAttributes = function (src, dest) {
        // clearAttributes removes the attributes, which we don't want,
        // but also removes the attachEvent events, which we *do* want
        if (dest.clearAttributes) {
            dest.clearAttributes();
        }

        // mergeAttributes, in contrast, only merges back on the
        // original attributes, not the events
        if (dest.mergeAttributes) {
            dest.mergeAttributes(src);
        }

        var nodeName = dest.nodeName.toLowerCase(),
            srcChildren = src.childNodes;

        var type = (src.type || '').toLowerCase();
        var srcValue, srcChecked;

        // IE6-8 fail to clone children inside object elements that use
        // the proprietary classid attribute value (rather than the type
        // attribute) to identify the type of content to display
        if (nodeName === 'object' && !dest.childNodes.length) {
            for (var i = 0; i < srcChildren.length; i++) {
                dest.appendChild(srcChildren[i].cloneNode(true));
            }
        } else if (nodeName === 'input' && (type === 'checkbox' || type === 'radio')) {
            // IE6-8 fails to persist the checked state of a cloned checkbox
            // or radio button. Worse, IE6-7 fail to give the cloned element
            // a checked appearance if the defaultChecked value isn't also set
            srcChecked = src.checked;
            if (srcChecked) {
                dest.defaultChecked = dest.checked = srcChecked;
            }

            // IE6-7 get confused and end up setting the value of a cloned
            // checkbox/radio button to an empty string instead of 'on'
            srcValue = src.value;
            if (dest.value !== srcValue) {
                dest.value = srcValue;
            }
        } else if (nodeName === 'option') {
            // IE6-8 fails to return the selected option to the default selected
            // state when cloning options
            dest.selected = src.defaultSelected;
        } else if (nodeName === 'input' || nodeName === 'textarea') {
            // IE6-8 fails to set the defaultValue to the correct value when
            // cloning other types of input fields
            dest.defaultValue = src.defaultValue;
            // textarea will not keep value if not deep clone
            dest.value = src.value;
        }

        // Event data gets referenced instead of copied if the expando
        // gets copied too
        // 自定义 data 根据参数特殊处理，expando 只是个用于引用的属性
        dest.removeAttribute(Dom.__EXPANDO);
    };

    var creators = Dom._creators,
        defaultCreator = Dom._defaultCreator,
        R_TBODY = /<tbody/i;

    // IE7- adds TBODY when creating thead/tfoot/caption/col/colgroup elements
    if (require('ua').ieMode < 8) {
        // fix #88
        // https://github.com/kissyteam/kissy/issues/88 : spurious tbody in ie<8
        creators.table = function (html, ownerDoc) {
            var frag = defaultCreator(html, ownerDoc),
                hasTBody = R_TBODY.test(html);
            if (hasTBody) {
                return frag;
            }
            var table = frag.firstChild,
                tableChildren = util.makeArray(table.childNodes);
            util.each(tableChildren, function (c) {
                if (Dom.nodeName(c) === 'tbody' && !c.childNodes.length) {
                    table.removeChild(c);
                }
            });
            return frag;
        };
    }
});