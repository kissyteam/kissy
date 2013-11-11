KISSY.add(function (S, Simple, Queue) {
    Simple.run();
    Queue.run();
}, {
    requires: ['src/anim/tests/specs/simple',
        'src/anim/tests/specs/queue',
        'src/anim/tests/specs/promise',
        './promise',
        './frame', './pause', './scroll', './svg']
});