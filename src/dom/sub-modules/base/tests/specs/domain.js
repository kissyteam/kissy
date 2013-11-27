/**
 * tc for src/api.js
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Dom) {
    var UA = S.UA;
    describe('domain api', function () {

        it('isCustomDomain works', function () {
            expect(Dom.isCustomDomain()).toBe(false);
        });
        it('getEmptyIframeSrc works', function () {
            var ret = Dom.getEmptyIframeSrc();
            var expected;
            if (UA.ie && Dom.isCustomDomain()) {
                expected = 'javascript:void(function(){' + encodeURIComponent(
                    'document.open();' +
                        "document.domain='" +
                        document.domain
                        + "';" +
                        'document.close();') + '}())';
            } else {
                expected = '';
            }
            expect(ret).toBe(expected);
        });
    });
}, {
    requires: ['dom']
});