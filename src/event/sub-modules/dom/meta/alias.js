config({
    "event/dom": {
        "alias": [
            "event/dom/base",
            Features.isTouchSupported() ? 'event/dom/touch' : '',
            Features.isDeviceMotionSupported() ? 'event/dom/shake' : '',
            Features.isHashChangeSupported() ? '' : 'event/dom/hashchange',
            Features.isIELessThan(9) ? 'event/dom/ie' : '',
            UA.ie ? '' : 'event/dom/focusin'
        ]
    }
});