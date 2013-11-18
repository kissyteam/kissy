/**
 * ie create hack
 * @author yiminghe@gmail.com
 */
KISSY.add('dom/ie/insertion', function (S, DOM) {

    var UA = S.UA;

    if (UA.ie < 8) {

        /*
         ie 6,7 lose checked status when append to dom
         var c=S.all('<input />');
         c.attr('type','radio');
         c.attr('checked',true);
         S.all('#t').append(c);
         alert(c[0].checked);
         */
        DOM._fixInsertionChecked = function fixChecked(ret) {
            for (var i = 0; i < ret.length; i++) {
                var el = ret[i];
                if (el.nodeType == DOM.NodeType.DOCUMENT_FRAGMENT_NODE) {
                    fixChecked(el.childNodes);
                } else if (DOM.nodeName(el) == 'input') {
                    fixCheckedInternal(el);
                } else if (el.nodeType == DOM.NodeType.ELEMENT_NODE) {
                    var cs = el.getElementsByTagName('input');
                    for (var j = 0; j < cs.length; j++) {
                        fixChecked(cs[j]);
                    }
                }
            }
        };

        function fixCheckedInternal(el) {
            if (el.type === 'checkbox' || el.type === 'radio') {
                // after insert, in ie6/7 checked is decided by defaultChecked !
                el.defaultChecked = el.checked;
            }
        }

    }


}, {
    requires: ['dom/base']
});
