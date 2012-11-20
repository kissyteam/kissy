config({
    "event/dom": {
        "alias": [
            "event/dom/base",
            Features.isTouchSupported() ? 'event/dom/touch' : 'empty'
        ]
    }
});