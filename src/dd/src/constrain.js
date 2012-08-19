/**
 * @fileOverview Config constrain region for drag and drop
 * @author yiminghe@gmail.com
 */
KISSY.add("dd/constrain", function (S, Base, Node) {

    var $ = Node.all,
        DESTRUCTOR_ID = "__constrain_destructors",
        stamp = S.stamp,
        MARKER = S.guid("__dd_constrain"),
        WIN = S.Env.host;

    /**
     * @class Provide ability to constrain draggable to specified region
     * @memberOf DD
     */
    function Constrain() {
        Constrain.superclass.constructor.apply(this, arguments);
        this[DESTRUCTOR_ID] = {};
    }

    function onDragStart(e) {
        var self = this,
            drag = e.drag,
            l, t, lt,
            dragNode = drag.get("dragNode"),
            constrain = self.get("constrain");
        if (constrain) {
            if (constrain === true || constrain.setTimeout) {
                var win;
                if (constrain === true) {
                    win = $(WIN);
                } else {
                    win = $(constrain);
                }
                self.__constrainRegion = {
                    left: l = win.scrollLeft(),
                    top: t = win.scrollTop(),
                    right: l + win.width(),
                    bottom: t + win.height()
                };
            }
            if (constrain.nodeType || S.isString(constrain)) {
                constrain = $(constrain);
            }
            if (constrain.getDOMNode) {
                lt = constrain.offset();
                self.__constrainRegion = {
                    left: lt.left,
                    top: lt.top,
                    right: lt.left + constrain.outerWidth(),
                    bottom: lt.top + constrain.outerHeight()
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
            __constrainRegion: null,

            /**
             * start monitoring drag
             * @param {DD.Draggable} drag
             */
            attachDrag: function (drag) {
                var self = this,
                    destructors = self[DESTRUCTOR_ID],
                    tag = stamp(drag, 0, MARKER);

                if (destructors[tag]) {
                    return self;
                }
                destructors[tag] = drag;
                drag.on("dragstart", onDragStart, self)
                    .on("dragend", onDragEnd, self)
                    .on("dragalign", onDragAlign, self);
                return self;
            },


            /**
             * stop monitoring drag
             * @param {DD.Draggable} drag
             */
            detachDrag: function (drag) {
                var self = this,
                    tag = stamp(drag, 1, MARKER),
                    destructors = self[DESTRUCTOR_ID];
                if (tag && destructors[tag]) {
                    drag.detach("dragstart", onDragStart, self)
                        .detach("dragend", onDragEnd, self)
                        .detach("dragalign", onDragAlign, self);
                    delete destructors[tag];
                }
                return self;
            },

            destroy: function () {
                var self = this,
                    destructors = S.merge(self[DESTRUCTOR_ID]);
                S.each(destructors, function (drag) {
                    self.detachDrag(drag);
                });
            }
        }, {
            ATTRS: /**
             * @lends DD.Constrain#
             */
            {
                /**
                 * constrained container
                 * @type {Boolean|HTMLElement|String}
                 */
                constrain: {
                    value: true
                }
            }
        });

    return Constrain;
}, {
    requires: ['base', 'node']
});