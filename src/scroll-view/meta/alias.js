config({
    "scroll-view": {
        "alias": [
            Features.isTouchEventSupported()||Features.isMsPointerSupported()
            ? 'scroll-view/drag' : 'scroll-view/base'
        ]
    }
});