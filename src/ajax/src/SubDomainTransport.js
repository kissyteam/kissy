/**
 * @fileOverview solve io between sub domains using proxy page
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/SubDomainTransport", function (S, XhrTransportBase, Event, DOM) {

    var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,
        PROXY_PAGE = "/sub_domain_proxy.html",
        doc = S.Env.host.document,
        iframeMap = {
            // hostname:{iframe: , ready:}
        };

    function SubDomainTransport(xhrObj) {
        var self = this,
            c = xhrObj.config;
        self.xhrObj = xhrObj;
        c.crossDomain = false;
    }


    S.augment(SubDomainTransport, XhrTransportBase.proto, {
        // get nativeXhr from iframe document
        // not from current document directly like XhrTransport
        send:function () {
            var self = this,
                c = self.xhrObj.config,
                uri = c.uri,
                hostname = uri.getHostname(),
                iframe,
                iframeUri,
                iframeDesc = iframeMap[hostname];

            var proxy = PROXY_PAGE;

            if (c['xdr'] && c['xdr']['subDomain'] && c['xdr']['subDomain'].proxy) {
                proxy = c['xdr']['subDomain'].proxy;
            }

            if (iframeDesc && iframeDesc.ready) {
                self.nativeXhr = XhrTransportBase.nativeXhr(0, iframeDesc.iframe.contentWindow);
                if (self.nativeXhr) {
                    self.sendInternal();
                } else {
                    S.error("document.domain not set correctly!");
                }
                return;
            }

            if (!iframeDesc) {
                iframeDesc = iframeMap[hostname] = {};
                iframe = iframeDesc.iframe = doc.createElement("iframe");
                DOM.css(iframe, {
                    position:'absolute',
                    left:'-9999px',
                    top:'-9999px'
                });
                DOM.prepend(iframe, doc.body || doc.documentElement);
                iframeUri = new S.Uri();
                iframeUri.setScheme(uri.getScheme());
                iframeUri.setHostname(hostname);
                iframeUri.setPath(proxy);
                iframe.src = iframeUri.toString();
            } else {
                iframe = iframeDesc.iframe;
            }

            Event.on(iframe, "load", _onLoad, self);

        }
    });

    function _onLoad() {
        var self = this,
            c = self.xhrObj.config,
            uri = c.uri,
            hostname = uri.getHostname(),
            iframeDesc = iframeMap[hostname];
        iframeDesc.ready = 1;
        Event.detach(iframeDesc.iframe, "load", _onLoad, self);
        self.send();
    }

    return SubDomainTransport;

}, {
    requires:['./XhrTransportBase', 'event', 'dom']
});