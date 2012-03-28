KISSY.add("dd/constrain", function (S, Base, Node) {

    var $ = Node.all, WIN = S.Env.host;

    /**
     * @class Provide ability to constrain draggable to specified region
     * @memberOf DD
     */
    function Constrain() {
        Constrain.superclass.constructor.apply(this, arguments);
    }

    function onDragStart(e) {
        var self = this,
            drag = e.drag,
            l, t, lt,
            dragNode = drag.get("dragNode"),
            constrain = self.get("constrain");
        if (constrain) {
            if (constrain === true) {
                var win = $(WIN);
                self.__constrainRegion = {
                    left:l = win.scrollLeft(),
                    top:t = win.scrollTop(),
                    right:l + win.width(),
                    bottom:t + win.height()
                };
            }
            if (constrain.nodeType || S.isString(constrain)) {
                constrain = $(constrain);
            }
            if (constrain.getDOMNode) {
                lt = constrain.offset();
                self.__constrainRegion = {
                    left:lt.left,
                    top:lt.top,
                    right:lt.left + constrain.outerWidth(),
                    bottom:lt.top + constrain.outerHeight()
                };
            } else if (S.isPlainObject(constrain)) {
                self.__constrainRegion = constrain;
            }
            if (self.__constrainRegion) {
                self.__constrainRegion.right -= dragNode.outerWidth();
                self.__constrainRegion.bottom -= dragNode.outerHeight();
            }
        }
    }

    function onDragAlign(e) {
        var self = this,
            info = e.info,
            l = info.left,
            t = info.top,
            constrain = self.__constrainRegion;
        if (constrain) {
            info.left = Math.min(Math.max(constrain.left, l), constrain.right);
            info.top = Math.min(Math.max(constrain.top, t), constrain.bottom);
        }
    }

    function onDragEnd() {
        this.__constrainRegion = null;
    }

    S.extend(Constrain, Base,
        /**
         * @lends DD.Constrain#
         */
        {
            __constrainRegion:null,

            /**
             * start monitoring drag
             * @param {DD.Draggable} drag
             */
            attach:function (drag) {
                var self = this;
                drag.on("dragstart", onDragStart, self)
                    .on("dragend", onDragEnd, self)
                    .on("dragalign", onDragAlign, self);
            },


            /**
             * stop monitoring drag
             * @param {DD.Draggable} drag
             */
            unAttach:function (drag) {
                var self = this;
                drag.detach("dragstart", onDragStart, self)
                    .detach("dragend", onDragEnd, self)
                    .detach("dragalign", onDragAlign, self);
            }
        }, {
            ATTRS:/**
             * @lends DD.Constrain#
             */
            {
                /**
                 * constrained container
                 * @type {boolean|HTMLElement|String}
                 */
                constrain:{
                    value:true
                }
            }
        });

    return Constrain;
}, {
    requires:['base', 'node']
});