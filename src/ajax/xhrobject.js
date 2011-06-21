/**
 * encapsulation of xhr object
 */
KISSY.add("ajax/xhrobject", function(S, Event) {

    var
        // get individual response header from responseheader str
        rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg;

    function XhrObject() {
        S.mix(this, {
                // 结构化数据，如 json
                data:null,
                config:{},
                timeoutTimer:null,
                responseText:null,
                responseXML:null,
                responseHeadersString:"",
                responseHeaders:null,
                requestHeaders:{},
                readyState:0,
                //internal state
                state:0,
                statusText:null,
                status:0,
                transport:null
            });
    }

    S.augment(XhrObject, Event.Target, {
            // Caches the header
            setRequestHeader: function(name, value) {
                this.requestHeaders[ name ] = value;
                return this;
            },

            // Raw string
            getAllResponseHeaders: function() {
                return this.state === 2 ? this.responseHeadersString : null;
            },

            // Builds headers hashtable if needed
            getResponseHeader: function(key) {
                var match;
                if (this.state === 2) {
                    if (!this.responseHeaders) {
                        this.responseHeaders = {};
                        while (( match = rheaders.exec(this.responseHeadersString) )) {
                            this.responseHeaders[ match[1] ] = match[ 2 ];
                        }
                    }
                    match = this.responseHeaders[ key];
                }
                return match === undefined ? null : match;
            },

            // Overrides response content-type header
            overrideMimeType: function(type) {
                if (!this.state) {
                    this.mimeType = type;
                }
                return this;
            },

            // Cancel the request
            abort: function(statusText) {
                statusText = statusText || "abort";
                if (this.transport) {
                    this.transport.abort(statusText);
                }
                this.statusText = statusText;
                return this;
            }
        }
    );

    return XhrObject;
}, {
        requires:["event"]
    });