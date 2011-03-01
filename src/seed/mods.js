/**
 * 声明 kissy 核心中所包含的模块，动态加载时将直接从 core.js 中加载核心模块
 * @author:yiminghe@gmail.com
 */
(function(S, undef) {
    S.config({
        combine:{
            core:['dom','ua','event','node','json','ajax','anim','base','cookie']
        }
    });
})(KISSY);