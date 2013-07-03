/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:56
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 event
*/

/**
 * event facade for event module.contains custom dom and touch event
 */
KISSY.add('event', function (S, DOMEvent, CustomEvent) {

    // compatibility

    S.EventTarget = CustomEvent.Target;

    return S.Event = S.merge(DOMEvent, CustomEvent);

}, {
    requires: ['event/dom', 'event/custom']
});

