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
         * @param key {String} The name of the 'cookie' or store
         * @return {Boolean} Whether or not the save was successful
         */
        setItem: function(key, data) {
            if (typeof data === 'string') { // 快速通道
                // double encode strings to prevent parsing error
                // http://yuilibrary.com/projects/yui2/ticket/2528593
                data = data.replace(/\\/g, '\\\\');
            } else {
                data = S.JSON.stringify(data) + ''; // 比如：stringify(undefined) = undefined, 强制转换为字符串
            }

            // 当 name 为空值时，目前会触发 swf 的内部异常，此处不允许空键值
            if ((key = S.trim(key + ''))) {
                try {
                    return this.embeddedSWF.callSWF('setItem', [key, data]);
                }
                catch(e) { // 当 swf 异常时，进一步捕获信息
                    this.fire('error', { message: e });
                }
            }
        },

        /**
         * alias for getVauleOf
         */
        getItem: function(key) {
            return this.embeddedSWF.callSWF('getValueOf', [key]);
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
 *   - Bug: shareData 关闭时，Chrome 和 IE 重启后，会清空数据库
 *   - Bug: 点击 Remove, 当 name 不存在时，会将最后一条删除
 *   - container 的 overflow:hidden 是否有必要?
 */
