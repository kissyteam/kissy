/*
Copyright 2013, KISSY v1.40dev
MIT Licensed
build time: Sep 11 12:52
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 event
*/

/**
 * @ignore
 * event facade for event module.contains custom dom and touch event
 * @author yiminghe@gmail.com
 */
KISSY.add('event', function (S, DomEvent, CustomEvent) {

    // compatibility

    S.EventTarget = CustomEvent.Target;

    return S.Event = S.merge(DomEvent, CustomEvent);

}, {
    requires: ['event/dom', 'event/custom']
});

