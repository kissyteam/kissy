/**
 * drag extension for position
 * @author:yiminghe@gmail.com
 */
KISSY.add("ext-drag", function(S) {
    S.namespace('Ext');
    function DragExt() {
        var self = this;
        self.on("bindUI", self._bindUIDragExt, self);
    }

    DragExt.ATTRS = {
        handlers:{value:[]},
        draggable:{value:true}
    };

    DragExt.prototype = {

        _uiSetHanlders:function(v) {
            if (v && v.length > 0)
                this.__drag.set("handlers", v);
        },

        _bindUIDragExt:function() {
            S.log("_bindUIDragExt");
            var self = this,el = self.get("el");
            self.__drag = new S.Draggable({
                node:el,
                handlers:self.get("handlers")
            });
        },

        _uiSetDraggable:function(v) {
            var self = this,d = self.__drag;
            if (v) {
                d.on("drag", self._dragExtAction, self);
            } else {
                d.detach("drag");
            }
        },

        _dragExtAction:function(offset) {
            this.set("xy", [offset.left,offset.top])
        }

    };

    S.Ext.Drag = DragExt;

});