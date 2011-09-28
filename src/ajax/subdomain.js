/**
 * solve io between subdomains using proxy page
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/subdomain", function(S, XhrBase, Event) {

    var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/;

    var iframeMap = {
        // hostname:{iframe: , ready:}
    };

    function SubDomain(xhrObj) {
        this.xhrObj = xhrObj;
        var c = xhrObj.config;
        this.__hostname = c.url.match(rurl)[1];
        c.crossDomain = false;
    }


    S.augment(SubDomain, XhrBase.proto, {
        send:function() {
            var c = this.xhrObj.config,
                hostname = this.__hostname,
                iframe,
                iframeDesc = iframeMap[hostname];
            if (iframeDesc && iframeDesc.ready) {
                this.xhr = XhrBase.xhr(iframeDesc.iframe.contentWindow);
                this.sendInternal();
                return;
            }
            if (!iframeDesc) {
                iframeDesc = iframeMap[hostname] = iframeMap[hostname] || {};
                iframe = iframeDesc.iframe = document.createElement("iframe");
                iframe.style.left = iframe.style.top = "-9999px";
                iframe.src = c['xdr']['subDomain'].proxy;
            }

            Event.on(iframe, "load", this._onLoad, this);

        },

        _onLoad:function() {
            var hostname = this.__hostname;
            var iframeDesc = iframeMap[hostname];
            iframeDesc.ready = 1;
            Event.detach(iframeDesc.iframe, "load", this._onLoad, this);
            this.send();
        }
    });

    return SubDomain;

}, {
    requires:['./xhrbase','event']
});