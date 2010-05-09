/**
 * SWF UA info
 * author: lifesinger@gmail.com
 */
KISSY.add('swf-ua', function(S) {

    function getFlashVersion() {
        var version = 0,
            sF = 'ShockwaveFlash',
            mF = navigator.mimeTypes['application/x-shockwave-flash'],
            ax6, eP;

        if (mF) {
            if ((eP = mF['enabledPlugin'])) {
                version = numerify(
                    eP.description
                        .replace(/\s[rd]/g, '.')
                        .replace(/[a-z\s]+/ig, '')
                        .split('.')
                    );
            }
        } else {
            try {
                ax6 = new ActiveXObject(sF + '.' + sF + '.6');
                ax6.AllowScriptAccess = 'always';
            } catch(e) {
                if (ax6 !== null) {
                    version = 6.0;
                }
            }

            if (version === 0) {
                try {
                    version = numerify(
                        new ActiveXObject(sF + '.' + sF)
                            ['GetVariable']('$version')
                            .replace(/[A-Za-z\s]+/g, '')
                            .split(',')
                        );
                } catch (e) {
                }
            }
        }

        return parseFloat(version);
    }

    function numerify(arr) {
        var ret = arr[0] + '.';
        switch (arr[2].toString().length) {
            case 1:
                ret += '00';
                break;
            case 2:
                ret += '0';
                break;
        }
        return (ret += arr[2]);
    }

    S.UA.flash = getFlashVersion();
});

/**
 * NOTES:
 *
 *  - getFlashVersion 函数中，存在 new ActiveX 和 try catch, 比较耗费性能，需要进一步测试和优化。
 *
 */
