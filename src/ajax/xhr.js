/**
 * ajax xhr transport class , route subdomain , xdr
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/xhr", function(S, io, XhrBase, SubDomain, XdrTransport) {

    var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/;

    var _XDomainRequest = window['XDomainRequest'];

    var detectXhr = XhrBase.xhr();

    if (detectXhr) {

        // slice last two pars
        // xx.taobao.com => taobao.com
        function getMainDomain(host) {
            var t = host.split('.');
            if (t.length < 2) {
                return t.join(".");
            } else {
                return t.reverse().slice(0, 2).reverse().join('.');
            }
        }

        function XhrTransport(xhrObj) {
            var c = xhrObj.config,
                xdrCfg = c['xdr'] || {};

            if (c.crossDomain) {

                var parts = c.url.match(rurl);

                // 跨子域
                if (getMainDomain(location.hostname) == getMainDomain(parts[2])) {
                    return new SubDomain(xhrObj);
                }

                /**
                 * ie>7 强制使用 flash xdr
                 */
                if (!("withCredentials" in detectXhr) &&
                    (String(xdrCfg.use) === "flash" || !_XDomainRequest)) {
                    return new XdrTransport(xhrObj);
                }
            }

            this.xhrObj = xhrObj;

            return undefined;
        }

        S.augment(XhrTransport, XhrBase.proto, {

            send:function() {
                var self = this,
                    xhrObj = self.xhrObj,
                    c = xhrObj.config;
                self.xhr = XhrBase.xhr(c.crossDomain);
                self.sendInternal();
            }

        });

        io.setupTransport("*", XhrTransport);
    }

    return io;
}, {
    requires:["./base",'./xhrbase','./subdomain',"./xdr"]
});

/**
 * 借鉴 jquery，优化使用原型替代闭包
 **/