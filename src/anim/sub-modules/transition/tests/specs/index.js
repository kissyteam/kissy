KISSY.add(function (S, Simple, Queue) {
    S.config('anim/useTransition', true);
    Simple.run();
    Queue.run();
}, {
    requires: ['src/anim/tests/specs/simple',
        'src/anim/tests/specs/queue',
        'src/anim/tests/specs/promise']
});