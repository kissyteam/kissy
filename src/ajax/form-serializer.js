/**
 * form data  serialization util
 * @author: yiminghe@gmail.com
 */
KISSY.add("ajax/form-serializer", function(S, DOM) {
    var enc = encodeURIComponent;
    return {
        serialize:function(form) {
            form = DOM.get(form);
            var data = [];
            S.each(form.elements, function(e) {
                var d = e.disabled;
                //必须编码
                if (!d) {
                    data.push(enc(e.name) + "=" + enc(DOM.val(e)));
                }
            });
            return data.join("&");
        }
    };
}, {
        requires:['dom']
    });