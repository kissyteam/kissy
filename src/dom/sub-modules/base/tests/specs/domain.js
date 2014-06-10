/**
 * tc for src/api.js
 * @author yiminghe@gmail.com
 */

    var Dom = require('dom');
    var UA = require('ua');
    describe('domain api', function () {
        it('isCustomDomain works', function () {
            expect(Dom.isCustomDomain()).toBe(false);
        });

        it('getEmptyIframeSrc works', function () {
            var ret = Dom.getEmptyIframeSrc();
            var expected;
            var t = 'javascript';
            if (UA.ie && Dom.isCustomDomain()) {
                expected = t + ':' + 'void(function(){' + encodeURIComponent(
                    'document.open();' +
                        'document.domain="' +
                        document.domain + '";' +
                        'document.close();') + '}())';
            } else {
                expected = '';
            }
            expect(ret).toBe(expected);
        });
    });
