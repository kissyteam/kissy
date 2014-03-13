KISSY.add(function (S, Simple, Queue) {
    if (KISSY.Feature.getCssVendorInfo('transition')) {
        Simple.run();
        Queue.run();
    }
}, {
    requires: ['src/anim/tests/specs/simple',
        'src/anim/tests/specs/queue',
        'src/anim/tests/specs/promise']
});