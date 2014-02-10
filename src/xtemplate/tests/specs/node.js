KISSY.add(function (S, require) {
    var XTemplateNodeJs = require('xtemplate/nodejs');

    var path = S.config('packages').src.uri
        .resolve('../src/xtemplate/tests/specs/xtpls/')
        .getPath();

    S.config('packages', {
        nodejsXtemplate: {
            ignorePackageNameInUri: 1,
            base: path
        }
    });

    describe('xtemplate on nodejs', function () {
        it('can load from file', function () {
            var xtemplate = XTemplateNodeJs.loadFromModuleName('nodejsXtemplate/a-xtpl');

            expect(xtemplate.render({
                a: 1,
                d:3,
                b: {
                    c:2
                }
            })).toBe('123');
        });

        it('custom command works', function () {
            var xtemplate = XTemplateNodeJs.loadFromModuleName('nodejsXtemplate/custom-command',{
                commands:{
                    command:function(){
                        return 'yiminghe';
                    }
                }
            });
            expect(xtemplate.render()).toBe('i am yiminghe!');
        });
    });
});