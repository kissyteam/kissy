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