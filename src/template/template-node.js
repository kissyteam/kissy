/**
 * @fileoverview KISSY.Template Node.
 * @author 文河<wenhe@taobao.com>
 */
KISSY.add('template/template-node', function(S, undefined) {

    S.mix(S, {
        tmpl: function(selector, data) {
            return S.one(S.DOM.create(S.Template(S.one(selector).html()).render(data)));
        }
    });

}, {requires:["./template"]});
