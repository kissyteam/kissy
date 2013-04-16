# overlay

## 1.4

 [!] hide() 不会设置行内样式 visibility:hidden，只会加上样式 ks-overlay-hidden，请用样式控制隐藏与否（可支持 css3 动画），例如
    .ks-overlay-hidden {
        visibility: hidden;
    }

    .ks-overlay-mask-hidden {
        display: none;
    }

    .ks-overlay-shown {
        visibility: visible;
    }

    .ks-overlay-mask-shown{
        display: block;
    }