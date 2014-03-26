KISSY.add(function (S, require) {
    if (S.Feature.getCssVendorInfo('transition')) {
        require('src/anim/tests/specs/simple');
        require('src/anim/tests/specs/queue');
        require('src/anim/tests/specs/promise');
    }
});