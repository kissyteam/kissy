/**
 * @ignore
 * io xhr transport class, route subdomain, xdr
 * @author yiminghe@gmail.com
 */
KISSY.add('io/xhr-transport', function (S, IO, XhrTransportBase, SubDomainTransport, XdrFlashTransport) {

    var win = S.Env.host,
        doc = win.document,
        _XDomainRequest = XhrTransportBase._XDomainRequest;

    function isSubDomain(hostname) {
        // phonegap does not have doc.domain
        return doc.domain && S.endsWith(hostname, doc.domain);
    }

    /**
     * @class
     * @ignore
     */
    function XhrTransport(io) {
        var c = io.config,
            crossDomain = c.crossDomain,
            self = this,
            xhr,
            xdrCfg = c['xdr'] || {},
            subDomain = xdrCfg.subDomain = xdrCfg.subDomain || {};

        self.io = io;

        if (crossDomain && !XhrTransportBase.supportCORS) {
            // 跨子域
            if (isSubDomain(c.uri.getHostname())) {
                // force to not use sub domain transport
                if (subDomain.proxy !== false) {
                    return new SubDomainTransport(io);
                }
            }

            /*
             ie>7 通过配置 use='flash' 强制使用 flash xdr
             使用 withCredentials 检测是否支持 CORS
             http://hacks.mozilla.org/2009/07/cross-site-xmlhttprequest-with-cors/
             */
            if ((String(xdrCfg.use) === 'flash' || !_XDomainRequest)) {
                return new XdrFlashTransport(io);
            }
        }

        xhr = self.nativeXhr = XhrTransportBase.nativeXhr(crossDomain);
        S.log('crossDomain: ' + crossDomain + ', use ' + (_XDomainRequest && (xhr instanceof _XDomainRequest) ? 'XDomainRequest' : 'XhrTransport') + ' for: ' + c.url);

        return self;
    }

    S.augment(XhrTransport, XhrTransportBase.proto, {

        send: function () {
            this.sendInternal();
        }

    });

    IO['setupTransport']('*', XhrTransport);

    return IO;
}, {
    requires: ['./base', './xhr-transport-base', './sub-domain-transport', './xdr-flash-transport']
});

/*
 2012-11-28 note ie port problem:
 - ie 的 xhr 可以跨端口发请求，例如 localhost:8888 发请求到 localhost:9999
 - ie iframe 间访问不设置 document.domain 完全不考虑 port！
 - localhost:8888 访问 iframe 内的 localhost:9999

 CORS : http://www.nczonline.net/blog/2010/05/25/cross-domain-io-with-cross-origin-resource-sharing/
 */