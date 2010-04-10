/*
Copyright 2010, KISSY UI Library v1.0.5
MIT Licensed
build: 548 Apr 9 23:53
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
            // TODO: rename
            flashvars = 'YUISwfId=' + id + '&YUIBridgeCallback=' + EVENT_HANDLER,
            ret = '<object ';

        self.id = id;
        SWF.instances[id] = self;

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
            self.swf = S.get('#' + id);
        }
    }

    /**
     * The static collection of all instances of the SWFs on the page.
     * @static
     */
    SWF.instances = (S.SWF || { }).instances || { };

    /**
     * Handles an event coming from within the SWF and delegate it to a specific instance of SWF.
     * @static
     */
    SWF.eventHandler = function(swfId, event) {
        SWF.instances[swfId]._eventHandler(event);
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
            if (self.swf[func]) {
                return self.swf[func].apply(self.swf, args || []);
            }
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
        doc = document;

    /**
     * Class for the YUI SWFStore util.
     * @constructor
     * @param {String} swfUrl The URL of the SWF to be embedded into the page.
     * @param container {String|HTMLElement} Container element for the Flash Player instance.
     * @param shareData {Boolean} Whether or not data should be shared across browsers
     * @param useCompression {Boolean} Container element for the Flash Player instance
     */
    function SWFStore(swfUrl, container, shareData, useCompression) {
        var browser = 'other',
            cookie = Cookie.get(SWFSTORE),
            params,
            self = this;

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

        // 如果没有传入，就自动生成
        if(!container) {
            // 注：container 的 style 不能有 visibility:hidden or display: none, 否则异常
            container = new S.Node('<div style="height:0;width:0;overflow:hidden"></div>').appendTo(doc.body)[0];
        }
        self.embeddedSWF = new S.SWF(container, swfUrl || 'swfstore.swf', params);

        // 让 flash fired events 能通知到 swfstore
        self.embeddedSWF._eventHandler = function(event) {
            S.SWF.prototype._eventHandler.call(self, event);
        }
    }

    // events support
    S.augment(SWFStore, S.EventTarget);

    // methods
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
            if (typeof data === 'string') { // 快速通道
                // double encode strings to prevent parsing error
                // http://yuilibrary.com/projects/yui2/ticket/2528593
                data = data.replace(/\\/g, '\\\\');
            } else {
                data = S.JSON.stringify(data) + ''; // 比如：stringify(undefined) = undefined, 强制转换为字符串
            }

            // 当 name 为空值时，目前会触发 swf 的内部异常，此处不允许空键值
            if ((location = S.trim(location + ''))) {
                try {
                    return this.embeddedSWF.callSWF('setItem', [location, data]);
                }
                catch(e) { // 当 swf 异常时，进一步捕获信息
                    this.fire('error', { message: e });
                }
            }
        }
    });

    S.each([
        'getValueAt', 'getNameAt', //'getTypeAt',
        'getValueOf', //'getTypeOf',
        'getItems', 'getLength',
        'removeItem', 'removeItemAt', 'clear',
        //'getShareData', 'setShareData',
        //'getUseCompression', 'setUseCompression',
        'calculateCurrentSize', 'hasAdequateDimensions', 'setSize',
        'getModificationDate', 'displaySettings'
    ], function(methodName) {
        SWFStore.prototype[methodName] = function() {
            try {
                return this.embeddedSWF.callSWF(methodName, S.makeArray(arguments));
            }
            catch(e) { // 当 swf 异常时，进一步捕获信息
                this.fire('error', { message: e });
            }
        }
    });

    S.SWFStore = SWFStore;
});

/**
 * NOTES:
 *
 *  - [2010-04-09] yubo: 去掉 getTypeAt, getTypeOf, getShareData 等无用和调用
 *     概率很小的接口，宁愿少几个接口，也不为了功能而功能
 *
 * TODO:
 *   - 广播功能：当数据有变化时，自动通知各个页面
 *   - Bug: 点击 Remove, 当 name 不存在时，会将最后一条删除
 *   - container 的 overflow:hidden 是否有必要?
 */
