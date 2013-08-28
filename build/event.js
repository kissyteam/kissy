/*
Copyright 2013, KISSY v1.40dev
MIT Licensed
build time: Aug 28 18:23
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

