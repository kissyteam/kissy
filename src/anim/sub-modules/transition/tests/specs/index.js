if (require('feature').getCssVendorInfo('transition')) {
    require('src/anim/tests/specs/simple');
    require('src/anim/tests/specs/queue');
    require('src/anim/tests/specs/promise');
}