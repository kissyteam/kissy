/**
 * drag extension for position
 * @author:yiminghe@gmail.com
 */
KISSY.add("ext-drag", function(S) {
    S.namespace('Ext');
    function DragExt() {
         S.log("drag init");
        var self = this;
        self.on("bindUI", self._bindUIDragExt, self);
        self.on("renderUI", self._renderUIDragExt, self);
        self.on("syncUIUI", self._syncUIDragExt, self);
    }

    DragExt.ATTRS = {
        handlers:{value:[]},
        draggable:{value:true}
    };

    DragExt.prototype = {

        _uiSetHandlers:function(v) {
            S.log("_uiSetHanlders");
            if (v && v.length > 0)
                this.__drag.set("handlers", v);
        },

        _syncUIDragExt:function() {
            S.log("_syncUIDragExt");
        },

        _renderUIDragExt:function() {
            S.log("_renderUIDragExt");
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
            S.log("_uiSetDraggable");
            var self = this,d = self.__drag;
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
            S.log("DragExt __destructor");
            var d = this.__drag;
            d&&d.destroy();
        }

    };

    S.Ext.Drag = DragExt;

});