/**
 * @ignore
 * @fileOverview non-refresh upload file with form by iframe
 * @author  yiminghe@gmail.com
 */
KISSY.add('ajax/iframe-transport', function (S, DOM, Event, io) {

    var doc = S.Env.host.document,
        OK_CODE = 200,
        ERROR_CODE = 500,
        BREATH_INTERVAL = 30;

    // iframe 内的内容就是 body.innerText
    io.setupConfig({
        converters: {
            // iframe 到其他类型的转化和 text 一样
            iframe: io.getConfig().converters.text,
            text: {
                // fake type, just mirror
                iframe: function (text) {
                    return text;
                }
            },
            xml: {
                // fake type, just mirror
                iframe: function (xml) {
                    return xml;
                }
            }
        }
    });

    function createIframe(xhr) {
        var id = S.guid('ajax-iframe'),
            iframe,
            src = DOM.getEmptyIframeSrc();

        iframe = xhr.iframe = DOM.create('<iframe ' +
            // ie6 need this when cross domain
            (src ? (' src="' + src + '" ') : '') +
            ' id="' + id + '"' +
            // need name for target of form
            ' name="' + id + '"' +
            ' style="position:absolute;left:-9999px;top:-9999px;"/>');

        DOM.prepend(iframe, doc.body || doc.documentElement);
        return iframe;
    }

    function addDataToForm(query, form, serializeArray) {
        var ret = [], isArray, vs, i, e, keys = query.keys();
        S.each(keys, function (k) {
            var data = query.get(k);
            isArray = S.isArray(data);
            vs = S.makeArray(data);
            // 数组和原生一样对待，创建多个同名输入域
            for (i = 0; i < vs.length; i++) {
                e = doc.createElement('input');
                e.type = 'hidden';
                e.name = k + (isArray && serializeArray ? '[]' : '');
                e.value = vs[i];
                DOM.append(e, form);
                ret.push(e);
            }
        });
        return ret;
    }

    function removeFieldsFromData(fields) {
        DOM.remove(fields);
    }

    function IframeTransport(io) {
        this.io = io;
    }

    S.augment(IframeTransport, {
        send: function () {

            var self = this,
                io = self.io,
                c = io.config,
                fields,
                iframe,
                query = c.query,
                form = DOM.get(c.form);

            self.attrs = {
                target: DOM.attr(form, 'target') || '',
                action: DOM.attr(form, 'action') || '',
                // enctype 区分 iframe 与 serialize
                //encoding:DOM.attr(form, 'encoding'),
                //enctype:DOM.attr(form, 'enctype'),
                method: DOM.attr(form, 'method')
            };
            self.form = form;

            iframe = createIframe(io);

            // set target to iframe to avoid main page refresh
            DOM.attr(form, {
                target: iframe.id,
                action: c.uri.toString(c.serializeArray),
                method: 'post'
                //enctype:'multipart/form-data',
                //encoding:'multipart/form-data'
            });

            if (query.count()) {
                fields = addDataToForm(query, form, c.serializeArray);
            }

            self.fields = fields;
            // ie6 need a setTimeout to avoid handling load triggered if set iframe src
            setTimeout(function () {
                Event.on(iframe, 'load error', self._callback, self);
                form.submit();
            }, 10);

        },

        _callback: function (event/*, abort*/) {
            var self = this,
                form = self.form,
                io = self.io,
                eventType = event.type,
                iframeDoc,
                iframe = io.iframe;

            // 防止重复调用 , 成功后 abort
            if (!iframe) {
                return;
            }

            DOM.attr(form, self.attrs);

            removeFieldsFromData(this.fields);

            Event.detach(iframe);

            setTimeout(function () {
                // firefox will keep loading if not set timeout
                DOM.remove(iframe);
            }, BREATH_INTERVAL);

            // nullify to prevent memory leak?
            io.iframe = null;

            if (eventType == 'load') {
                iframeDoc = iframe.contentWindow.document;
                // ie<9
                if (iframeDoc && iframeDoc.body) {
                    io.responseText = S.trim(DOM.text(iframeDoc.body));
                    // ie still can retrieve xml 's responseText
                    if (S.startsWith(io.responseText, '<?xml')) {
                        io.responseText = undefined;
                    }
                }
                // ie<9
                // http://help.dottoro.com/ljbcjfot.php
                // http://msdn.microsoft.com/en-us/library/windows/desktop/ms766512(v=vs.85).aspx
                /*
                 In Internet Explorer, XML documents can also be embedded into HTML documents with the xml HTML elements.
                 To get an XMLDocument object that represents the embedded XML data island,
                 use the XMLDocument property of the xml element.
                 Note that the support for the XMLDocument property has been removed in Internet Explorer 9.
                 */
                if (iframeDoc && iframeDoc['XMLDocument']) {
                    io.responseXML = iframeDoc['XMLDocument'];
                }
                // ie9 firefox chrome
                else {
                    io.responseXML = iframeDoc;
                }

                io._ioReady(OK_CODE, 'success');
            } else if (eventType == 'error') {
                io._ioReady(ERROR_CODE, 'error');
            }
        },

        abort: function () {
            this._callback({});
        }
    });

    io.setupTransport('iframe', IframeTransport);

    return io;

}, {
    requires: ['dom', 'event', './base']
});