/**
 * UIBase.Box
 * @author 承玉<yiminghe@gmail.com>
 */
KISSY.add('uibase/box', function() {


    function Box() {
    }

    Box.ATTRS = {
        html: {
            view:true,
            sync:false
        },
        // 宽度
        width:{
            view:true
        },
        // 高度
        height:{
            view:true
        },
        // 容器的 class
        elCls:{
            view:true
        },
        // 容器的行内样式
        elStyle:{
            view:true
        },
        // 其他属性
        elAttrs:{
            //其他属性
            view:true
        },
        // 插入到该元素前
        elBefore:{
            view:true
        },
        el:{
            view:true
        },

        // 渲染该组件的目的容器
        render:{
            view:true
        },

        visibleMode:{
            value:"display",
            view:true
        },
        // 默认显示，但不触发事件
        visible:{
            view:true
        },

        // 从已存在节点开始渲染
        srcNode:{
            view:true
        }
    };


    Box.HTML_PARSER = {
        el:function(srcNode) {
            /**
             * 如果需要特殊的对现有元素的装饰行为
             */
            if (this.decorateInternal) {
                this.decorateInternal(srcNode);
            }
            return srcNode;
        }
    };

    Box.prototype = {

        _uiSetVisible:function(isVisible) {
            var self = this;
            self.fire(isVisible ? "show" : "hide");
        },


        /**
         * 显示 Overlay
         */
        show: function() {
            var self = this;
            self.render();
            self.set("visible", true);
        },

        /**
         * 隐藏
         */
        hide: function() {
            this.set("visible", false);
        }
    };

    return Box;
});
