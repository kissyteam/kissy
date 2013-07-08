# overlay

## 1.4

 [!] hide() 不会设置行内样式 visibility:hidden，只会加上样式 ks-overlay-hidden，请用样式控制隐藏与否（可支持 css3 动画），例如

    .ks-overlay-hidden {
        visibility: hidden;
    }

    .ks-overlay-mask-hidden {
        display: none;
    }

 [!] srcNode 时 html 结构必须包含 content 节点
 [!] content/bodyContent/ 等属性值只允许字符串类型
 [!] ks-contentbox 样式名更改为 ks-overlay-content ks-dialog-content
 [!] 去除样式 ks-ext-position，ks-ext-close 为 ks-dialog-close