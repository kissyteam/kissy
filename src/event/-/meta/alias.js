alias('event/dom', [
    'event/dom/base',
    Feature.isHashChangeSupported() ? '' : 'event/dom/hashchange',
        UA.ieMode < 9 ? 'event/dom/ie' : '',
    Feature.isInputEventSupported() ? '' : 'event/dom/input',
    UA.ie ? '' : 'event/dom/focusin'
]);