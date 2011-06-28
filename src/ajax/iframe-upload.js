/**
 * non-refresh upload file with form by iframe
 * @author: yiminghe@gmail.com
 */
KISSY.add("ajax/iframe-upload", function(S, DOM, Event, io) {

    var transports = io.__transports,
        doc = document,
        defaultConfig = io.__defaultConfig;

    // iframe 内的内容就是 body.innerText
    defaultConfig.converters.text.iframe = function(text) {
        return text;
    };


    // iframe 到其他类型的转化和 text 一样
    defaultConfig.converters.iframe = defaultConfig.converters.text;

    function createIframe(xhr) {
        var id = S.guid("ajax-iframe");
        xhr.iframe = DOM.create("<iframe " +
            " id='" + id + "'" +
            // need name for target of form
            " name='" + id + "'" +
            " style='position:absolute;left:-9999px;top:-9999px;'/>");
        xhr.iframeId = id;
        DOM.prepend(xhr.iframe, doc.body || doc.documentElement);
    }

    function addDataToForm(data, form) {
        data = S.unparam(data);
        var ret = [];
        for (var d in data) {
            var e = doc.createElement("input");
            e.type = 'hidden';
            e.name = d;
            e.value = data[d];
            DOM.append(e, form);
            ret.push(e);
        }
        return ret;
    }


    function removeFieldsFromData(fields) {
        DOM.remove(fields);
    }

    function IframeTransport(xhr) {
        this.xhr = xhr;
    }

    S.augment(IframeTransport, {
            send:function() {
                //debugger
                var xhr = this.xhr,
                    c = xhr.config,
                    fields,
                    form = DOM.get(c.form);

                this.attrs = {
                    target:DOM.attr(form, "target") || "",
                    action:DOM.attr(form, "action") || ""
                };
                this.form = form;

                createIframe(xhr);

                // set target to iframe to avoid main page refresh
                DOM.attr(form, {"target": xhr.iframeId,"action": c.url});

                if (c.data) {
                    fields = addDataToForm(c.data, form);
                }

                this.fields = fields;

                var iframe = xhr.iframe;

                Event.on(iframe, "load error", this._callback, this);

                form.submit();

            },

            _callback:function(event, abort) {
                //debugger
                var form = this.form,
                    xhr = this.xhr,
                    eventType = event.type,
                    iframe = xhr.iframe;

                DOM.attr(form, this.attrs);

                if (eventType == "load") {
                    var iframeDoc = iframe.contentWindow.document;
                    xhr.responseXML = iframeDoc;
                    xhr.responseText = DOM.text(iframeDoc.body);
                    xhr.callback(200, "success");
                } else if (eventType == 'error') {
                    xhr.callback(500, "error");
                }

                removeFieldsFromData(this.fields);
                Event.detach(iframe);
                DOM.remove(iframe);

                // nullify to prevent memory leak?
                xhr.iframe = null;
            },

            abort:function() {
                this._callback(0, 1);
            }
        });

    transports['iframe'] = IframeTransport;

    return io;

}, {
        requires:["dom","event","./base"]
    });