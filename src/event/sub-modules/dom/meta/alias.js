config({
    'event/dom': {
        alias: [
            'event/dom/base',
            Features.isTouchGestureSupported() ?
                'event/dom/touch' : '',
            Features.isDeviceMotionSupported() ?
                'event/dom/shake' : '',
            Features.isHashChangeSupported() ?
                '' : 'event/dom/hashchange',
            UA.ieMode < 9 ?
                'event/dom/ie' : '',
            Features.isInputEventSupported() ?
                '' : 'event/dom/input',
            UA.ie ? '' : 'event/dom/focusin'
        ]
    }
});