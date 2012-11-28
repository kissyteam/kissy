/**
 * @ignore
 * @fileOverview ajax xhr transport class, route subdomain, xdr
 * @author yiminghe@gmail.com
 */
KISSY.add('ajax/xhr-transport', function (S, io, XhrTransportBase, SubDomainTransport, XdrFlashTransport, undefined) {

    var win = S.Env.host,
        _XDomainRequest = XhrTransportBase._XDomainRequest,
        detectXhr = XhrTransportBase.nativeXhr();

    if (detectXhr) {

        // xx.taobao.com => taobao.com
        // xx.sina.com.cn => sina.com.cn
        function getMainDomain(host) {
            var t = host.split('.'),
                len = t.length,
                limit = len > 3 ? 3 : 2;
            if (len < limit) {
                return t.join('.');
            } else {
                return t.reverse().slice(0, limit).reverse().join('.');
            }
        }

        /**
         * @class
         * @ignore
         */
        function XhrTransport(io) {
            var c = io.config,
                url = c.url,
                crossDomain = c.crossDomain,
                self = this,
                xdrCfg = c['xdr'] || {},
                subDomain = xdrCfg.subDomain = xdrCfg.subDomain || {};

            self.io = io;

            if (crossDomain) {
                // 跨子域
                if (getMainDomain(location.hostname) == getMainDomain(c.uri.getHostname())) {
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
                if (!('withCredentials' in detectXhr) &&
                    (String(xdrCfg.use) === 'flash' || !_XDomainRequest)) {
                    return new XdrFlashTransport(io);
                }
            }

            S.log('crossDomain: ' + crossDomain + ', use XhrTransport for: ' + url);
            self.nativeXhr = XhrTransportBase.nativeXhr(crossDomain);
            return undefined;
        }

        S.augment(XhrTransport, XhrTransportBase.proto, {

            send: function () {
                this.sendInternal();
            }

        });

        io.setupTransport('*', XhrTransport);
    }

    return io;
}, {
    requires: ['./base', './xhr-transport-base', './sub-domain-transport', './xdr-flash-transport']
});

/*
 2012-11-28 note ie port problem:
 - ie 的 xhr 可以跨端口发请求，例如 localhost:8888 发请求到 localhost:9999
 - ie iframe 间访问不设置 document.domain 完全不考虑 port！
 - localhost:8888 访问 iframe 内的 localhost:9999

 CORS : http://www.nczonline.net/blog/2010/05/25/cross-domain-ajax-with-cross-origin-resource-sharing/
 */