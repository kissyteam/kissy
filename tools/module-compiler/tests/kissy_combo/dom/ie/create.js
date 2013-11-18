/**
 * ie create hack
 * @author yiminghe@gmail.com
 */
KISSY.add('dom/ie/create', function (S, DOM) {

    // wierd ie cloneNode fix from jq
    DOM._fixCloneAttributes = function (src, dest) {

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

        // IE6-8 fail to clone children inside object elements that use
        // the proprietary classid attribute value (rather than the type
        // attribute) to identify the type of content to display
        if (nodeName === 'object' && !dest.childNodes.length) {
            for (var i = 0; i < srcChildren.length; i++) {
                dest.appendChild(srcChildren[i].cloneNode(true));
            }
            // dest.outerHTML = src.outerHTML;
        } else if (nodeName === 'input' && (src.type === 'checkbox' || src.type === 'radio')) {
            // IE6-8 fails to persist the checked state of a cloned checkbox
            // or radio button. Worse, IE6-7 fail to give the cloned element
            // a checked appearance if the defaultChecked value isn't also set
            if (src.checked) {
                dest['defaultChecked'] = dest.checked = src.checked;
            }

            // IE6-7 get confused and end up setting the value of a cloned
            // checkbox/radio button to an empty string instead of 'on'
            if (dest.value !== src.value) {
                dest.value = src.value;
            }

            // IE6-8 fails to return the selected option to the default selected
            // state when cloning options
        } else if (nodeName === 'option') {
            dest.selected = src.defaultSelected;
            // IE6-8 fails to set the defaultValue to the correct value when
            // cloning other types of input fields
        } else if (nodeName === 'input' || nodeName === 'textarea') {
            dest.defaultValue = src.defaultValue;
        }

        // Event data gets referenced instead of copied if the expando
        // gets copied too
        // 自定义 data 根据参数特殊处理，expando 只是个用于引用的属性
        dest.removeAttribute(DOM.__EXPANDO);
    };

    var creators = DOM._creators,
        defaultCreator = DOM._defaultCreator,
        R_TBODY = /<tbody/i;

    // IE7- adds TBODY when creating thead/tfoot/caption/col/colgroup elements
    if (S.UA.ie < 8) {
        // fix #88
        // https://github.com/kissyteam/kissy/issues/88 : spurious tbody in ie<8
        creators.table = function (html, ownerDoc) {
            var frag = defaultCreator(html, ownerDoc),
                hasTBody = R_TBODY.test(html);
            if (hasTBody) {
                return frag;
            }
            var table = frag.firstChild,
                tableChildren = S.makeArray(table.childNodes);
            S.each(tableChildren, function (c) {
                if (DOM.nodeName(c) == 'tbody' && !c.childNodes.length) {
                    table.removeChild(c);
                }
            });
            return frag;
        };
    }
}, {
    requires: ['dom/base']
});
