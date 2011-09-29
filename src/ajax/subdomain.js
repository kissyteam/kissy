/**
 * solve io between sub domains using proxy page
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/subdomain", function(S, XhrBase, Event, DOM) {

    var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/;

    var PROXY_PAGE = "/sub_domain_proxy.html";

    var doc = document;

    var iframeMap = {
        // hostname:{iframe: , ready:}
    };

    function SubDomain(xhrObj) {
        var self = this,
            c = xhrObj.config;
        self.xhrObj = xhrObj;
        var m = c.url.match(rurl);
        self.__hostname = m[2];
        self.__protocol = m[1];
        c.crossDomain = false;
    }


    S.augment(SubDomain, XhrBase.proto, {
        send:function() {
            var self = this,
                c = self.xhrObj.config,
                hostname = self.__hostname,
                iframe,
                iframeDesc = iframeMap[hostname];

            var proxy = PROXY_PAGE;

            if (c['xdr'] && c['xdr']['subDomain'] && c['xdr']['subDomain'].proxy) {
                proxy = c['xdr']['subDomain'].proxy;
            }

            if (iframeDesc && iframeDesc.ready) {
                self.xhr = XhrBase.xhr(0, iframeDesc.iframe.contentWindow);
                self.sendInternal();
                return;
            }
            if (!iframeDesc) {
                iframeDesc = iframeMap[hostname] = {};
                iframe = iframeDesc.iframe = document.createElement("iframe");
                DOM.css(iframe, {
                    position:'absolute',
                    left:'-9999px',
                    top:'-9999px'
                });
                DOM.prepend(iframe, doc.body || doc.documentElement);
                iframe.src = self.__protocol + "//" + hostname + proxy;
            } else {
                iframe = iframeDesc.iframe;
            }

            Event.on(iframe, "load", self._onLoad, self);

        },

        _onLoad:function() {
            var self = this,
                hostname = self.__hostname,
                iframeDesc = iframeMap[hostname];
            iframeDesc.ready = 1;
            Event.detach(iframeDesc.iframe, "load", self._onLoad, self);
            self.send();
        }
    });

    return SubDomain;

}, {
    requires:['./xhrbase','event','dom']
});