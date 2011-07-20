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
        width:{
            view:true
        },
        height:{
            view:true
        },
        elCls:{
            view:true
        },
        elStyle:{
            view:true
        },
        elAttrs:{
            //其他属性
            view:true
        },
        elBefore:{
            view:true
        },
        el:{
            view:true
        },

        visibleMode:{
            view:true
        },
        // 默认显示，但不触发事件
        visible:{
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
