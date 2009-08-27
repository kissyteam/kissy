
KISSY.Editor.add("core~dom", function(E) {

    var UA = YAHOO.env.ua;

    E.Dom = {

        /**
         * 获取元素的文本内容
         */
        getText: function(el) {
            return el ? (el.textContent || '') : '';
        },

        /**
         * 让元素不可选，解决 ie 下 selection 丢失的问题
         */
        setItemUnselectable: function(el) {
            var arr, i, len, n, a;

            arr = el.getElementsByTagName("*");
            for (i = -1, len = arr.length; i < len; ++i) {
                a = (i == -1) ? el : arr[i];

                n = a.nodeName;
                if (n && n != "INPUT") {
                    a.setAttribute("unselectable", "on");
                }
            }

            return el;
        }
    };

    // for ie
    if (UA.ie) {
        E.Dom.getText = function(el) {
            return el ? (el.innerText || '') : '';
        };
    }

});
