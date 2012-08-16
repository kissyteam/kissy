/**
 * @fileOverview form data  serialization util
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/FormSerializer", function (S, DOM) {
    var rselectTextarea = /^(?:select|textarea)/i,
        rCRLF = /\r?\n/g,
        FormSerializer,
        rinput = /^(?:color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i;

    function normalizeCRLF(v) {
        return v.replace(rCRLF, "\r\n");
    }

    return FormSerializer = {
        /*
         序列化表单元素
         @param {String|HTMLElement[]|HTMLElement|NodeList} forms
         */
        serialize: function (forms, serializeArray) {
            // 名值键值对序列化,数组元素名字前不加 []
            return S.param(FormSerializer.getFormData(forms), undefined, undefined,
                serializeArray || false);
        },

        getFormData: function (forms) {
            var elements = [], data = {};
            S.each(DOM.query(forms), function (el) {
                // form 取其表单元素集合
                // 其他直接取自身
                var subs = el.elements ? S.makeArray(el.elements) : [el];
                elements.push.apply(elements, subs);
            });
            // 对表单元素进行过滤，具备有效值的才保留
            elements = S.filter(elements, function (el) {
                // 有名字
                return el.name &&
                    // 不被禁用
                    !el.disabled &&
                    (
                        // radio,checkbox 被选择了
                        el.checked ||
                            // select 或者 textarea
                            rselectTextarea.test(el.nodeName) ||
                            // input 类型
                            rinput.test(el.type)
                        );

                // 这样子才取值
            });
            S.each(elements, function (el) {
                var val = DOM.val(el), vs;

                // 字符串换行平台归一化
                if (S.isArray(val)) {
                    val = S.map(val, normalizeCRLF);
                } else {
                    val = normalizeCRLF(val);
                }

                vs = data[el.name];
                if (!vs) {
                    data[el.name] = val;
                    return;
                }
                if (vs && !S.isArray(vs)) {
                    // 多个元素重名时搞成数组
                    vs = data[el.name] = [vs];
                }
                vs.push.apply(vs, S.makeArray(val));
            });
            return data;
        }
    };
}, {
    requires: ['dom']
});