KISSY.add(function (S, require) {
    var XTemplateNodeJs = require('xtemplate/nodejs');

    describe('xtemplate on nodejs', function () {
        it('can load from file', function () {
            var path = S.config('packages').src.baseUri
                .resolve('src/xtemplate/tests/other/nodejs/')
                .getPath();

            S.config('packages', {
                nodejsXtemplate: {
                    ignorePackageNameInUri: 1,
                    base: path
                }
            });

            var xtemplate = XTemplateNodeJs.loadFromModuleName('nodejsXtemplate/a');

            expect(xtemplate.render({
                n: 3
            })).toBe('12345');
        });
    });
});