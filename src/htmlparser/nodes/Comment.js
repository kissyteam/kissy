KISSY.add(function(S, Node) {

    function Comment() {
        Comment.superclass.constructor.apply(this, arguments);
        this.nodeType = 8;
        this.nodeName = "#comment";
    }

    S.extend(Comment, Node);

    return Comment;
}, {
    requires:['./Node']
});