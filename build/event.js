/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 22 19:30
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 event
*/

/**
 * event facade for event module.contains custom dom and touch event
 */
KISSY.add('event', function (S, DomEvent, CustomEvent) {

    // compatibility

    S.EventTarget = CustomEvent.Target;

    return S.Event = S.merge(DomEvent, CustomEvent);

}, {
    requires: ['event/dom', 'event/custom']
});

