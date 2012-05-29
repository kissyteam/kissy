/**
 * @fileOverview io shortcut
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax", function (S, serializer, IO, XhrObject) {
    var undef = undefined;

    function get(url, data, callback, dataType, _t) {
        // data 参数可省略
        if (S.isFunction(data)) {
            dataType = callback;
            callback = data;
            data = undef;
        }

        return IO({
            type:_t || "get",
            url:url,
            data:data,
            success:callback,
            dataType:dataType
        });
    }

    // some shortcut
    S.mix(IO,

        /**
         * @lends IO
         */
        {
            XhrObject:XhrObject,
            /**
             * form serialization
             * @function
             * @param formElement {HTMLElement[]|HTMLElement|NodeList} form elements
             * @returns {String} serialized string represent form elements
             */
            serialize:serializer.serialize,

            /**
             * perform a get request
             * @function
             * @param {String} url request destination
             * @param {Object} [data] name-value object associated with this request
             * @param {Function()} callback <br/>
             * success callback when this request is done
             * with parameter <br/>
             * 1. data returned from this request with type specified by dataType <br/>
             * 2. status of this request with type String <br/>
             * 3. XhrObject of this request , for details {@link IO.XhrObject}
             * @param {String} [dataType] the type of data returns from this request
             * ("xml" or "json" or "text")
             * @returns {IO.XhrObject}
             */
            get:get,

            /**
             * preform a post request
             * @param {String} url request destination
             * @param {Object} [data] name-value object associated with this request
             * @param {Function()} callback <br/>
             * success callback when this request is done<br/>
             * with parameter<br/>
             * 1. data returned from this request with type specified by dataType<br/>
             * 2. status of this request with type String<br/>
             * 3. XhrObject of this request , for details {@link IO.XhrObject}
             * @param {String} [dataType] the type of data returns from this request
             * ("xml" or "json" or "text")
             * @returns {IO.XhrObject}
             */
            post:function (url, data, callback, dataType) {
                if (S.isFunction(data)) {
                    dataType = callback;
                    callback = data;
                    data = undef;
                }
                return get(url, data, callback, dataType, "post");
            },

            /**
             * preform a jsonp request
             * @param {String} url request destination
             * @param {Object} [data] name-value object associated with this request
             * @param {Function()} callback
             *  <br/>success callback when this request is done<br/>
             * with parameter<br/>
             * 1. data returned from this request with type specified by dataType<br/>
             * 2. status of this request with type String<br/>
             * 3. XhrObject of this request , for details {@link IO.XhrObject}
             * @returns {IO.XhrObject}
             */
            jsonp:function (url, data, callback) {
                if (S.isFunction(data)) {
                    callback = data;
                    data = undef;
                }
                return get(url, data, callback, "jsonp");
            },

            // 和 S.getScript 保持一致
            // 更好的 getScript 可以用
            /*
             IO({
             dataType:'script'
             });
             */
            getScript:S.getScript,

            /**
             * perform a get request to fetch json data from server
             * @param {String} url request destination
             * @param {Object} [data] name-value object associated with this request
             * @param {Function()} callback  <br/>success callback when this request is done<br/>
             * with parameter<br/>
             * 1. data returned from this request with type JSON<br/>
             * 2. status of this request with type String<br/>
             * 3. XhrObject of this request , for details {@link IO.XhrObject}
             * @returns {IO.XhrObject}
             */
            getJSON:function (url, data, callback) {
                if (S.isFunction(data)) {
                    callback = data;
                    data = undef;
                }
                return get(url, data, callback, "json");
            },

            /**
             * submit form without page refresh
             * @param {String} url request destination
             * @param {HTMLElement|NodeList} form element tobe submited
             * @param {Object} [data] name-value object associated with this request
             * @param {Function()} callback  <br/>success callback when this request is done<br/>
             * with parameter<br/>
             * 1. data returned from this request with type specified by dataType<br/>
             * 2. status of this request with type String<br/>
             * 3. XhrObject of this request , for details {@link IO.XhrObject}
             * @param {String} [dataType] the type of data returns from this request
             * ("xml" or "json" or "text")
             * @returns {IO.XhrObject}
             */
            upload:function (url, form, data, callback, dataType) {
                if (S.isFunction(data)) {
                    dataType = callback;
                    callback = data;
                    data = undef;
                }
                return IO({
                    url:url,
                    type:'post',
                    dataType:dataType,
                    form:form,
                    data:data,
                    success:callback
                });
            }
        });

    S.mix(S, {
        "Ajax":IO,
        "IO":IO,
        ajax:IO,
        io:IO,
        jsonp:IO.jsonp
    });

    return IO;
}, {
    requires:[
        "ajax/FormSerializer",
        "ajax/base",
        "ajax/XhrObject",
        "ajax/XhrTransport",
        "ajax/ScriptTransport",
        "ajax/jsonp",
        "ajax/form",
        "ajax/IframeTransport"]
});