/**
 * Provides a swf based storage implementation.
 */

KISSY.add('swfstore', function(S, undefined) {

    var UA = S.UA, Cookie = S.Cookie,
        SWFSTORE = 'swfstore',
        doc = document,
        SP = SWFStore.prototype;

    /**
     * Class for the YUI SWFStore util.
     * @constructor
     * @param el {String|HTMLElement} Container element for the Flash Player instance.
     * @param {String} swfUrl The URL of the SWF to be embedded into the page.
     * @param shareData {Boolean} Whether or not data should be shared across browsers
     * @param useCompression {Boolean} Container element for the Flash Player instance.
     */
    function SWFStore(el, swfUrl, shareData, useCompression) {
        var browser = 'other',
            cookie = Cookie.get(SWFSTORE),
            params;

        // convert booleans to strings for flashvars compatibility
        shareData = (shareData !== undefined ? shareData : true) + '';
        useCompression = (useCompression !== undefined ? useCompression : true) + '';

        // browser detection
        if (UA.ie) browser = 'ie';
        else if (UA.gecko) browser = 'gecko';
        else if (UA.webkit) browser = 'webkit';
        else if (UA.opera) browser = 'opera';

        // set cookie
        if (!cookie || cookie === 'null') {
            Cookie.set(SWFSTORE, (cookie = Math.round(Math.random() * Math.PI * 100000)));
        }

        params = {
            version: 9.115,
            useExpressInstall: false,
            fixedAttributes: {
                allowScriptAccess:'always',
                allowNetworking:'all',
                scale:'noScale'
            },
            flashVars: {
                allowedDomain : doc.location.hostname,
                shareData: shareData,
                browser: cookie,
                useCompression: useCompression
            }
        };

        this.embeddedSWF = new S.SWF(el, swfUrl || 'swfstore.swf', params);
    }

    // events
    S.each(['on', 'detach'], function(methodName) {
        SP[methodName] = function(type, fn) {
            this.embeddedSWF[methodName](type, fn);
        }
    });

    S.augment(SWFStore, {
        /**
         * Saves data to local storage. It returns a String that can
         * be one of three values: 'true' if the storage succeeded; 'false' if the user
         * has denied storage on their machine or storage space allotted is not sufficient.
         * <p>The size limit for the passed parameters is ~40Kb.</p>
         * @param data {Object} The data to store
         * @param location {String} The name of the 'cookie' or store
         * @return {Boolean} Whether or not the save was successful
         */
        setItem: function(location, data) {
            if (typeof data === 'string') {
                // double encode strings to prevent parsing error
                // http://yuilibrary.com/projects/yui2/ticket/2528593
                data = data.replace(/\\/g, '\\\\');
            }
            return this.embeddedSWF.callSWF('setItem', [location, data]);
        }
    });

    S.each([
        'getShareData', 'setShareData',
        'hasAdequateDimensions',
        'getUseCompression', 'setUseCompression',
        'getValueAt', 'getNameAt', 'getTypeAt',
        'getValueOf', 'getTypeOf',
        'getItems', 'removeItem', 'removeItemAt',
        'getLength', 'calculateCurrentSize', 'getModificationDate',
        'setSize', 'displaySettings',
        'clear'
    ], function(methodName) {
        SWFStore.prototype[methodName] = function() {
            return this.embeddedSWF.callSWF(methodName, S.makeArray(arguments));
        }
    });

    S.SWFStore = SWFStore;
});

/**
 * TODO:
 *   - 所有事件和方法的 test cases
 *   - 存储超过最大值时，会自动进行什么操作?
 *   - 当数据有变化时，自动通知各个页面的功能
 */