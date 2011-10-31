/**
 * @fileoverview KISSY.Template Node.
 * @author 文河<wenhe@taobao.com>
 */
KISSY.add('template/node', function(S, Template, Node) {
    var $ = Node.all;
    S.mix(S, {
        tmpl: function(selector, data) {
            return $(Template($(selector).html()).render(data));
        }
    });

}, {requires:["./base",'node']});
