/**
 * @fileOverview abstract class for tag and text , comment .. etc
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/nodes/Node", function(S) {

    function Node(page, startPosition, endPosition) {
        this.parentNode = null;
        this.page = page;
        this.startPosition = startPosition;
        this.endPosition = endPosition;
        this.nodeName = null;
        this.previousSibling = null;
        this.nextSibling = null;

        if (S.Config.debug) {
            this.toHtmlContent = this.toHtml();
        }
    }

    Node.prototype = {
        toHtml:function() {
            if (this.page && this.page.getText) {
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