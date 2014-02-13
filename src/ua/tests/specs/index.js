/**
 * Path spec for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var UA = require('ua');
    describe('ua', function () {
        if (!UA.ie) {
            it('recoginize webkit', function () {
                var userAgent = 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1700.41 Safari/537.36';
                var ua = UA.getDescriptorFromUserAgent(userAgent);
                expect(ua.webkit).toBe(537.36);
                expect(ua.safari).toBeUndefined();
                expect(ua.chrome).toBe(32.0170041);
            });

            // https://github.com/kissyteam/kissy/issues/545
            it('recoginize xiaomi', function () {
                var userAgent = 'Xiaomi_2013061_TD/V1 Linux/3.4.5 Android/4.2.1 Release/09.18.2013 Browser/AppleWebKit534.30 ' +
                    'Mobile Safari/534.30 MBBMS/2.2 System/Android 4.2.1 XiaoMi/MiuiBrowser/1.0';
                var ua = UA.getDescriptorFromUserAgent(userAgent);
                expect(ua.webkit).toBe(534.30);
                expect(ua.safari).toBe(534.30);
            });
        }
    });
});