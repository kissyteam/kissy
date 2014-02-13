config({
    'event/dom': {
        alias: [
            'event/dom/base',
            Feature.isTouchGestureSupported() ?
                'event/dom/touch' : '',
            Feature.isDeviceMotionSupported() ?
                'event/dom/shake' : '',
            Feature.isHashChangeSupported() ?
                '' : 'event/dom/hashchange',
            UA.ieMode < 9 ?
                'event/dom/ie' : '',
            Feature.isInputEventSupported() ?
                '' : 'event/dom/input',
            UA.ie ? '' : 'event/dom/focusin'
        ]
    }
});