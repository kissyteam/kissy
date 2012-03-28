/**
 * @fileOverview non-refresh upload file with form by iframe
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/IframeTransport", function (S, DOM, Event, io) {

    var doc = S.Env.host.document,
        OK_CODE = 200,
        ERROR_CODE = 500,
        BREATH_INTERVAL = 30;

    // iframe 内的内容就是 body.innerText
    io.setupConfig({
        converters:{
            // iframe 到其他类型的转化和 text 一样
            iframe:io.getConfig().converters.text,
            text:{
                iframe:function (text) {
                    return text;
                }
            }
        }
    });

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

    function addDataToForm(data, form, serializeArray) {
        data = S.unparam(data);
        var ret = [];
        for (var d in data) {
            var isArray = S.isArray(data[d]),
                vs = S.makeArray(data[d]);
            // 数组和原生一样对待，创建多个同名输入域
            for (var i = 0; i < vs.length; i++) {
                var e = doc.createElement("input");
                e.type = 'hidden';
                e.name = d + (isArray && serializeArray ? "[]" : "");
                e.value = vs[i];
                DOM.append(e, form);
                ret.push(e);
            }
        }
        return ret;
    }


    function removeFieldsFromData(fields) {
        DOM.remove(fields);
    }

    function IframeTransport(xhrObject) {
        this.xhrObject = xhrObject;
    }

    S.augment(IframeTransport, {
        send:function () {

            var self = this,
                xhrObject = self.xhrObject,
                c = xhrObject.config,
                fields,
                form = DOM.get(c.form);

            self.attrs = {
                target:DOM.attr(form, "target") || "",
                action:DOM.attr(form, "action") || ""
            };
            self.form = form;

            createIframe(xhrObject);

            // set target to iframe to avoid main page refresh
            DOM.attr(form, {
                "target":xhrObject.iframeId,
                "action":c.url
            });

            if (c.data) {
                fields = addDataToForm(c.data, form, c.serializeArray);
            }

            self.fields = fields;

            var iframe = xhrObject.iframe;

            Event.on(iframe, "load error", self._callback, self);

            form.submit();

        },

        _callback:function (event, abort) {
            //debugger
            var self=this,
                form = self.form,
                xhrObject = self.xhrObject,
                eventType = event.type,
                iframe = xhrObject.iframe;

            // 防止重复调用 , 成功后 abort
            if (!iframe) {
                return;
            }

            DOM.attr(form, self.attrs);

            if (eventType == "load") {
                var iframeDoc = iframe.contentWindow.document;
                xhrObject.responseXML = iframeDoc;
                xhrObject.responseText = DOM.text(iframeDoc.body);
                xhrObject._xhrReady(OK_CODE, "success");
            } else if (eventType == 'error') {
                xhrObject._xhrReady(ERROR_CODE, "error");
            }

            removeFieldsFromData(this.fields);

            Event.detach(iframe);

            setTimeout(function () {
                // firefox will keep loading if not settimeout
                DOM.remove(iframe);
            }, BREATH_INTERVAL);

            // nullify to prevent memory leak?
            xhrObject.iframe = null;
        },

        abort:function () {
            this._callback({}, 1);
        }
    });

    io.setupTransport("iframe", IframeTransport);

    return io;

}, {
    requires:["dom", "event", "./base"]
});