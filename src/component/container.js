/**
 * container can delegate event for its children
 * @author yiminghe@gmail.com
 */
KISSY.add("component/container", function(S, UIBase, MC) {

    return UIBase.create(MC, {
        bindUI:function() {
            var self = this,
                view = self.get("view"),
                el = view.get("el");
            el.on("mousedown mouseup mouseover mouseout", self._handleChildMouseEvents, self);
        },
        _handleChildMouseEvents:function(e) {
            var control = this.getOwnerControl(e.target);
            if (control) {
                // Child control identified; forward the event.
                switch (e.type) {
                    case "mousedown":
                        control._handleMouseDown(e);
                        break;
                    case "mouseup":
                        control._handleMouseUp(e);
                        break;
                    case "mouseover":
                        control._handleMouseOver(e);
                        break;
                    case "mouseout":
                        control._handleMouseOut(e);
                        break;
                }
            }
        },
        getOwnerControl:function(node) {
            var self = this,children = self.get("children"),
                len = children.length,elem = this.get('view').get("el")[0];
            while (node && node !== elem) {
                for (var i = 0; i < len; i++) {
                    if (children[i].get("view").get("el")[0] === node) {
                        return children[i];
                    }
                }
                node = node.parentNode;
            }
            return null;
        }

    });

}, {
    requires:['uibase','./modelcontrol']
});