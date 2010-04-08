/*
Copyright 2010, KISSY UI Library v1.0.5
MIT Licensed
build: 532 Apr 8 08:24
*/
/**
 * SWF UA info
 * author: lifesinger@gmail.com
 */

KISSY.add('swf-ua', function(S) {

    var UA = S.UA,
        version = 0, sF = 'ShockwaveFlash',
        ax6, mF, eP;

    if (UA.ie) {
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
                        .GetVariable('$version')
                        .replace(/[A-Za-z\s]+/g, '')
                        .split(',')
                    );

            } catch (e) {
            }
        }
    } else {
        if ((mF = navigator.mimeTypes['application/x-shockwave-flash'])) {
            if ((eP = mF.enabledPlugin)) {
                version = numerify(
                    eP.description
                        .replace(/\s[rd]/g, '.')
                        .replace(/[a-z\s]+/ig, '')
                        .split('.')
                    );
            }
        }
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

    UA.flash = parseFloat(version);
});
/**
 * The SWF utility is a tool for embedding Flash applications in HTML pages.
 * author: lifesinger@gmail.com
 */

KISSY.add('swf', function(S) {

    var UA = S.UA,
        uid = S.now(),

        VERSION = 10.22,
        CID = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000',
        TYPE = 'application/x-shockwave-flash',
        EXPRESS_INSTALL_URL = 'http://fpdownload.macromedia.com/pub/flashplayer/update/current/swf/autoUpdater.swf?' + uid,
        EVENT_HANDLER = 'KISSY.SWF.eventHandler',

        possibleAttributes = {align:'', allowNetworking:'', allowScriptAccess:'', base:'', bgcolor:'', menu:'', name:'', quality:'', salign:'', scale:'', tabindex:'', wmode:''};


    /**
     * Creates the SWF instance and keeps the configuration data
     *
     * @constructor
     * @param {String|HTMLElement} el The id of the element, or the element itself that the SWF will be inserted into.
     *        The width and height of the SWF will be set to the width and height of this container element.
     * @param {Object} params (optional) Configuration parameters for the Flash application and values for Flashvars
     *        to be passed to the SWF.
     */
    function SWF(el, swfUrl, params) {
        var self = this,
            id = 'ks-swf-' + uid++,
            flashVersion = parseFloat(params.version) || VERSION,
            isFlashVersionRight = UA.flash >= flashVersion,
            canExpressInstall = UA.flash >= 8.0,
            shouldExpressInstall = canExpressInstall && params.useExpressInstall && !isFlashVersionRight,
            flashUrl = (shouldExpressInstall) ? EXPRESS_INSTALL_URL : swfUrl,
            // TODO: rename to ks
            flashvars = 'YUISwfId=' + id + '&YUIBridgeCallback=' + EVENT_HANDLER,
            ret = '<object ';

        // TODO: 确认以下三个私有变量是否有用
        self._queue = [];
        self._events =  {};
        self._configs =  {};

        self._id = id;
        SWF._instances[id] = self;

        if ((el = S.get(el)) && (isFlashVersionRight || shouldExpressInstall) && flashUrl) {
            ret += 'id="' + id + '" ';

            if (UA.ie) {
                ret += 'classid="' + CID + '" '
            } else {
                ret += 'type="' + TYPE + '" data="' + flashUrl + '" ';
            }

            ret += 'width="100%" height="100%">';

            if (UA.ie) {
                ret += '<param name="movie" value="' + flashUrl + '"/>';
            }

            for (var attr in params.fixedAttributes) {
                if (possibleAttributes.hasOwnProperty(attr)) {
                    ret += '<param name="' + attr + '" value="' + params.fixedAttributes[attr] + '"/>';
                }
            }

            for (var flashvar in params.flashVars) {
                var fvar = params.flashVars[flashvar];
                if (typeof fvar === 'string') {
                    flashvars += "&" + flashvar + "=" + encodeURIComponent(fvar);
                }
            }

            ret += '<param name="flashVars" value="' + flashvars + '"/>';
            ret += "</object>";

            el.innerHTML = ret;
            self._swf = S.get('#' + id);
        }
    }

    /**
     * The static collection of all instances of the SWFs on the page.
     * @static
     */
    SWF._instances = (S.SWF || { })._instances || { };

    /**
     * Handles an event coming from within the SWF and delegate it to a specific instance of SWF.
     * @static
     */
    SWF.eventHandler = function(swfId, event) {
        SWF._instances[swfId]._eventHandler(event);
    };

    S.augment(SWF, S.EventTarget);

    S.augment(SWF, {

        _eventHandler: function(event) {
            var self = this,
                type = event.type;
            
            if (type === 'log') {
                S.log(event.message);
            } else if(type) {
                self.fire(type, event);
            }
        },

        /**
         * Calls a specific function exposed by the SWF's ExternalInterface.
         * @param func {string} the name of the function to call
         * @param args {array} the set of arguments to pass to the function.
         */
        callSWF: function (func, args) {
            var self = this;
            if (self._swf[func]) {
                return self._swf[func].apply(self._swf, args || []);
            }
        },

        /**
         * Public accessor to the unique name of the SWF instance.
         * @return {String} Unique name of the SWF instance.
         */
        toString: function() {
            return 'SWF ' + this._id;
        }
    });

    S.SWF = SWF;
});
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