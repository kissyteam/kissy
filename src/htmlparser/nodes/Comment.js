/**
 * comment node (<!-- content -->)
 * @author yiminghe@gmail.com
 */
KISSY.add(function(S, Tag) {

    function Comment() {
        Comment.superclass.constructor.apply(this, arguments);
        this.nodeType = 8;
        this.nodeName = "#comment";
    }

    S.extend(Comment, Tag);

    return Comment;
}, {
    requires:['./Tag']
});