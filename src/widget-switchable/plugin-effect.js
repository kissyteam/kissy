/**
 * Switchable Effect Plugin
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy, yui-base, yui-animation, widget, widget-switchable
 */
KISSY.add("widget-switchable-effect", function(S) {

    var Y = YAHOO.util, Dom = Y.Dom,
        SWITCHABLE = "switchable",
        BLOCK = "block", NONE = "none",
        OPACITY = "opacity", Z_INDEX = "z-index",
        RELATIVE = "relative", ABSOLUTE = "absolute",
        SCROLLX = "scrollx", SCROLLY = "scrolly", FADE = "fade",
        Switchable = S.Switchable;

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        effectType: NONE, // "scrollx", "scrolly", "fade"
        animDuration: .5, // 开启切换效果时，切换的时长
        animEasing: Y.Easing.easeNone, // easing method

        panelSize: [] // 卡盘 panel 的宽高。一般不需要设定此值
        // 只有当无法正确获取高宽时，才需要设定
        // 比如父级元素 display: none 时，无法获取到 offsetWidth, offsetHeight
    });

    /**
     * 定义效果集
     */
    var effects = {

        // 最朴素的显示/隐藏效果
        none: function(fromEl, toEl, callback) {
            fromEl.style.display = NONE;
            toEl.style.display = BLOCK;
            callback();
        },

        // 淡隐淡现效果
        fade: function(fromEl, toEl, callback) {
            var self = this, cfg = self.config[SWITCHABLE];
            if (self.anim) self.anim.stop();

            // 首先显示下一张
            Dom.setStyle(toEl, OPACITY, 1);

            // 动画切换
            self.anim = new Y.Anim(fromEl, {opacity: {to: 0}}, cfg.animDuration, cfg.animEasing);
            self.anim.onComplete.subscribe(function() {
                self.anim = null; // free

                // 切换 z-index
                Dom.setStyle(toEl, Z_INDEX, 9);
                Dom.setStyle(fromEl, Z_INDEX, 1);

                callback();
            });
            self.anim.animate();
        },

        // 水平/垂直滚动效果
        scroll: function(fromEl, toEl, callback, index) {
            var self = this, cfg = self.config[SWITCHABLE],
                isX = cfg.effectType === SCROLLX,
                diff = self.panelSize[isX ? 0 : 1] * index,
                attributes = {};

            attributes[isX ? "left" : "top"] = { to: -diff };

            if (self.anim) self.anim.stop();
            self.anim = new Y.Anim(self.content, attributes, cfg.animDuration, cfg.animEasing);
            self.anim.onComplete.subscribe(function() {
                self.anim = null; // free
                callback();
            });
            self.anim.animate();
        }
    };
    effects[SCROLLX] = effects[SCROLLY] = effects.scroll;

    /**
     * 织入初始化函数：根据 effectType，调整初始状态
     */
    S.weave(function() {
        var self = this, cfg = self.config[SWITCHABLE],
            type = cfg.effectType, panels = self.panels,
            i, len = self.triggers.length,
            activeIndex = self.activeIndex;

        // 1. 获取高宽
        self.panelSize = [
            cfg.panelSize[0] || panels[0].offsetWidth,
            cfg.panelSize[0] || panels[0].offsetHeight
            ];
        // 注：所有 panel 的尺寸应该相同
        //    最好指定第一个 panel 的 width 和 height，因为 Safari 下，图片未加载时，读取的 offsetHeight 等值会不对

        // 2. 初始化 panels 样式
        if (type === NONE) {
            // 默认情况，只显示 activePanel
            for (i = 0; i < len; i++) {
                panels[i].style.display = i === activeIndex ? BLOCK : NONE;
            }

        } else { // type = scrollx, scrolly, fade

            // 这些特效需要将 panels 都显示出来
            for (i = 0; i < len; i++) {
                panels[i].style.display = BLOCK;
            }

            switch (type) {
                // 如果是滚动效果
                case SCROLLX:
                case SCROLLY:
                    // 设置定位信息，为滚动效果做铺垫
                    self.container.style.position = RELATIVE;
                    self.content.style.position = ABSOLUTE;

                    // 水平排列
                    if (type === SCROLLX) {
                        Dom.setStyle(panels, "float", "left");

                        // 设置最大宽度，以保证有空间让 panels 水平排布
                        this.content.style.width = self.panelSize[0] * len + "px";
                    }
                    break;

                // 如果是透明效果，则初始化透明
                case FADE:
                    for (i = 0; i < len; i++) {
                        Dom.setStyle(panels[i], OPACITY, i === self.activeIndex ? 1 : 0);
                        panels[i].style.position = ABSOLUTE;
                        panels[i].style.zIndex = i === self.activeIndex ? 9 : 1;
                    }
                    break;
            }
        }

        // 3. 在 CSS 里，需要给 container 设定高宽和 overflow: hidden
        //    nav 的 cls 由 CSS 指定

    }, "after", Switchable, "_initSwitchable");

    /**
     * 覆盖切换方法
     */
    S.mix(Switchable, {
       /**
         * 切换内容
         */
        _switchPanel: function(fromEl, toEl, index) {
            var self = this, cfg = self.config[SWITCHABLE];

            effects[cfg.effectType].call(self, fromEl, toEl, function() {
                // fire event
                self.fireEvent("onSwitch", index);
            }, index);
        }
    });
});
