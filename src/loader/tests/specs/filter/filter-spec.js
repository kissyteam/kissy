// --no-module-wrap--
describe('filter', function () {
    var S = KISSY;
    afterEach(function () {
        S.clearLoader();
    });
    it('works', function () {
        S.config({
            packages: {
                'pkg-a': {
                    filter: 'debug',
                    base: '../specs/packages-groups/pkg-a'
                },
                'pkg-b': {
                    base: '../specs/packages-groups/pkg-b'
                }
            }
        });
        expect(S.getModule('pkg-a/a').getUrl()).toBe(S.getPackage('pkg-a').getBase() + 'a-debug.js');
        expect(S.getModule('pkg-b/b').getUrl()).toBe(S.getPackage('pkg-b').getBase() + 'b.js');
    });
});