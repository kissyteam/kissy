/**
 * @fileoverview KISSY.Template Node.
 * @author 文河<wenhe@taobao.com>
 */
KISSY.add('template-node', function(S, undefined) {

    S.mix(S, {
        // S.one('#temlate').tmpl({a: 'a'}).appendTo(target);
        tmpl: function(selector, data) {
            return S.one(S.DOM.create(S.Template(S.one(selector).html()).render(data)));
        }
    });

}, {host: 'template'});
