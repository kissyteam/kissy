/**
 * abstract class for tag and text , comment .. etc
 * @author yiminghe@gmail.com
 */
KISSY.add(function() {

    function Node(page, startPosition, endPosition) {
        this.parentNode = null;
        this.page = page;
        this.startPosition = startPosition;
        this.endPosition = endPosition;
        this.nodeName = null;
        this.previousSibling = null;
        this.nextSibling = null;
        // whether has been closed by its end tag
        this.closed = false;
        this.closedStartPosition = -1;
        this.closedEndPosition = -1;
    }

    Node.prototype = {



        toHtml:function() {
            if (this.page) {
                return this.page.getText(this.startPosition, this.endPosition);
            }
        },
        toString:function() {
            var ret = [];
            ret.push(this.nodeName + "  [" + this.startPosition + ":" + this.endPosition + "]\n");
            ret.push(this.toHtml());
            return ret.join("");
        }
    };

    return Node;
});