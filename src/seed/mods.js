/**
 * 声明 kissy 核心中所包含的模块，动态加载时将直接从 core.js 中加载核心模块
 * @description: 为了和 1.1.7 及以前版本保持兼容，务实与创新，兼容与革新 ！
 * @author:yiminghe@gmail.com
 */
(function(S, undef) {
    S.config({
        combine:{
            core:['dom','ua','event','node','json','ajax','anim','base','cookie']
        }
    });
})(KISSY);