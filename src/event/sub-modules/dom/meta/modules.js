config({
    "event/dom": {
        "alias": [
            "event/dom/base",
            Features.isMsPointerEnabled || Features.isTouchSupported ? 'event/dom/touch' : 'empty'
        ]
    }
});