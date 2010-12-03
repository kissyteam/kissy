/**
 * drag extension for position
 * @author: 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase-drag", function(S) {
    S.namespace('UIBase');
    function Drag() {
        //S.log("drag init");
    }

    Drag.ATTRS = {
        handlers:{value:[]},
        draggable:{value:true}
    };

    Drag.prototype = {

        _uiSetHandlers:function(v) {
            //S.log("_uiSetHanlders");
            if (v && v.length > 0 && this.__drag)
                this.__drag.set("handlers", v);
        },

        __syncUI:function() {
            //S.log("_syncUIDragExt");
        },

        __renderUI:function() {
            //S.log("_renderUIDragExt");
        },

        __bindUI:function() {
            //S.log("_bindUIDragExt");
            var self = this,
                el = self.get("el");
            if (self.get("draggable")&&S.Draggable    )
                self.__drag = new S.Draggable({
                    node:el,
                    handlers:self.get("handlers")
                });
        },

        _uiSetDraggable:function(v) {
            //S.log("_uiSetDraggable");
            var self = this,
                d = self.__drag;
            if (!d) return;
            if (v) {
                d.detach("drag");
                d.on("drag", self._dragExtAction, self);
            } else {
                d.detach("drag");
            }
        },

        _dragExtAction:function(offset) {
            this.set("xy", [offset.left,offset.top])
        },
        /**
         *
         */
        __destructor:function() {
            //S.log("DragExt __destructor");
            var d = this.__drag;
            d && d.destroy();
        }

    };

    S.UIBase.Drag = Drag;

},{
    host:"uibase"
});