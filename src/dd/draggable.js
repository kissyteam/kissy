/**
 * dd support for kissy, drag for dd
 * @author: 承玉<yiminghe@gmail.com>
 */
KISSY.add('dd/draggable', function(S, UA, Node, Base, DDM) {

    /*
     拖放纯功能类
     */
    function Draggable() {
        Draggable.superclass.constructor.apply(this, arguments);
        this._init();
    }

    Draggable.POINT = "pointer";
    Draggable.INTERSECT = "intersect";
    Draggable.STRICT = "strict";

    Draggable.ATTRS = {
        /**
         * 拖放节点，可能指向 proxy node
         */
        node: {
            setter:function(v) {
                return Node.one(v);
            }
        },
        /*
         真实的节点
         */
        dragNode:{},

        /**
         * 是否需要遮罩跨越iframe
         */
        shim:{
            value:true
        },

        /**
         * handler 数组，注意暂时必须在 node 里面
         */
        handlers:{
            value:[]
        },
        cursor:{
            value:"move"
        },

        mode:{
            /**
             * @enum point,intersect,strict
             * @description
             *  In point mode, a Drop is targeted by the cursor being over the Target
             *  In intersect mode, a Drop is targeted by "part" of the drag node being over the Target
             *  In strict mode, a Drop is targeted by the "entire" drag node being over the Target             *
             */
            value:'point'
        }

    };

    S.extend(Draggable, Base, {

        _init: function() {
            var self = this,
                node = self.get('node'),
                handlers = self.get('handlers');
            self.set("dragNode", node);

            if (handlers.length == 0) {
                handlers[0] = node;
            }

            for (var i = 0; i < handlers.length; i++) {
                var hl = handlers[i];
                hl = S.one(hl);
                //ie 不能在其内开始选择区域
                hl.unselectable();
                if (self.get("cursor")) {
                    hl.css('cursor', 'move');
                }
            }
            node.on('mousedown', self._handleMouseDown, self);
        },

        destroy:function() {
            var self = this,
                node = self.get('node'),
                handlers = self.get('handlers');
            for (var i = 0; i < handlers.length; i++) {
                var hl = handlers[i];
                if (hl.css("cursor") == "move") {
                    hl.css("cursor", "auto");
                }
            }
            node.detach('mousedown', self._handleMouseDown, self);
            self.detach();
        },

        _check: function(t) {
            var handlers = this.get('handlers');

            for (var i = 0; i < handlers.length; i++) {
                var hl = handlers[i];
                if (hl.contains(t)
                    ||
                    //子区域内点击也可以启动
                    hl[0] == t[0]) return true;
            }
            return false;
        },

        /**
         * 鼠标按下时，查看触发源是否是属于 handler 集合，
         * 保存当前状态
         * 通知全局管理器开始作用
         * @param ev
         */
        _handleMouseDown: function(ev) {
            var self = this,
                t = new Node(ev.target);

            if (!self._check(t)) return;
            //chrome 阻止了 flash 点击？？
            //不组织的话chrome会选择
            //if (!UA.webkit) {
            //firefox 默认会拖动对象地址
            ev.preventDefault();
            //}

            DDM._start(self);

            var node = self.get("node"),
                mx = ev.pageX,
                my = ev.pageY,
                nxy = node.offset();
            self.startMousePos = self.mousePos = {
                left:mx,
                top:my
            };
            self.startNodePos = nxy;
            self._diff = {
                left:mx - nxy.left,
                top:my - nxy.top
            };
            self.set("diff", self._diff);

        },

        _move: function(ev) {
            var self = this,
                diff = self.get("diff"),
                left = ev.pageX - diff.left,
                top = ev.pageY - diff.top;
            self.mousePos = {
                left:ev.pageX,
                top:ev.pageY
            };
            self.fire("drag", {
                left:left,
                top:top
            });
            DDM.fire("drag", {
                left:left,
                top:top,
                drag:this
            });
        },

        _end: function() {
            this.fire("dragend");
            DDM.fire("dragend", {
                drag:this
            });
        },

        _start: function() {
            this.fire("dragstart");
            DDM.fire("dragstart", {
                drag:this
            });
        }
    });

    return Draggable;

},
{
    requires:["ua","node","base","dd/ddm"]
});
