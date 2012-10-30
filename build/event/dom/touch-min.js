/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Oct 31 00:14
*/
KISSY.add("event/dom/touch",function(f,g){var b=g.Gesture,e=f.Features,a,c,d;e.isTouchSupported?(a="touchstart",c="touchmove",d="touchend"):e.isMsPointerEnabled&&(a="MSPointerDown",c="MSPointerMove",d="MSPointerUp");a&&(b.startEvent=a,b.moveEvent=c,b.endEvent=d)},{requires:["event/dom/base"]});
