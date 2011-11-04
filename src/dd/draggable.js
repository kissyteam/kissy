/**
 * dd support for kissy, drag for dd
 * @author  yiminghe@gmail.com
 */
KISSY.add('dd/draggable', function(S, UA, Node, Base, DDM) {

    var each = S.each;

    /*
     拖放纯功能类
     */
    function Draggable() {
        var self = this;
        Draggable.superclass.constructor.apply(self, arguments);
        self._init();
    }

    Draggable['POINT'] = "point";
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
            value:[],
            getter:function(vs) {
                var self = this,
                    cursor = self.get("cursor");
                if (!vs.length) {
                    vs[0] = self.get("node");
                }
                each(vs, function(v, i) {
                    if (S.isFunction(v)) {
                        v = v.call(self);
                    }
                    if (S.isString(v) || v.nodeType) {
                        v = Node.one(v);
                    }
                    //ie 不能在其内开始选择区域
                    v.unselectable();
                    if (cursor) {
                        v.css('cursor', cursor);
                    }
                    vs[i] = v;
                });
                self.__set("handlers", vs);
                return vs;
            }
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
                node = self.get('node');
            self.set("dragNode", node);
            node.on('mousedown', self._handleMouseDown, self);
        },

        destroy:function() {
            var self = this,
                node = self.get('dragNode'),
                handlers = self.get('handlers');
            each(handlers, function(handler) {
                handler.css("cursor", "auto");
            });
            node.detach('mousedown', self._handleMouseDown, self);
            self.detach();
        },

        _check: function(t) {
            var handlers = this.get('handlers'),ret = 0;
            each(handlers, function(handler) {
                //子区域内点击也可以启动
                if (handler.contains(t) ||
                    handler[0] == t[0]) {
                    ret = 1;
                    return false;
                }
            });
            return ret;
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

            if (!self._check(t)) {
                return;
            }
            //chrome 阻止了 flash 点击？？
            //不组织的话chrome会选择
            //firefox 默认会拖动对象地址
            ev.preventDefault();
            self._prepare(ev);

        },

        _prepare:function(ev) {
            var self = this;

            DDM._start(self);

            var node = self.get("node"),
                mx = ev.pageX,
                my = ev.pageY,
                nxy = node.offset();
            self['startMousePos'] = self.mousePos = {
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
                ret,
                diff = self.get("diff"),
                left = ev.pageX - diff.left,
                top = ev.pageY - diff.top;
            self.mousePos = {
                left:ev.pageX,
                top:ev.pageY
            };
            ret = {
                left:left,
                top:top,
                pageX:ev.pageX,
                pageY:ev.pageY,
                drag:this
            };
            self.fire("drag", ret);
            DDM.fire("drag", ret);
        },

        _end: function() {
            var self = this;
            self.fire("dragend", {
                drag:self
            });
            DDM.fire("dragend", {
                drag:self
            });
        },

        _start: function() {
            var self = this;
            self.fire("dragstart", {
                drag:self
            });
            DDM.fire("dragstart", {
                drag:self
            });
        }
    });

    return Draggable;

}, {
    requires:["ua","node","base","./ddm"]
});
