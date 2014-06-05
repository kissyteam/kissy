/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 5 23:30
*/
/*
combined modules:
url
*/
KISSY.add('url', [
    'querystring',
    'path'
], function (S, require, exports, module) {
    var querystring = require('querystring');
    var undef;
    var Path = require('path');
    var reDisallowedInProtocolOrAuth = /[#\/\?@]/g, reDisallowedInPathName = /[#\?]/g, reDisallowedInQuery = /[#@]/g, reDisallowedInHash = /#/g, URI_SPLIT_REG = new RegExp('^' + '([\\w\\d+.-]+:)?' + '(?://' + '(?:([^/?#@]*)@)?' + '(' + '[\\w\\d\\-\\u0100-\\uffff.+%]*' + '|' + '\\[[^\\]]+\\]' + ')' + '(?::([0-9]+))?' + ')?' + '([^?#]+)?' + '(\\?[^#]*)?' + '(#.*)?' + '$'), REG_INFO = {
            protocol: 1,
            auth: 2,
            hostname: 3,
            port: 4,
            pathname: 5,
            search: 6,
            hash: 7
        };
    function needDoubleSlash(str) {
        if (str.slice(0 - 1) === ':') {
            str = str.slice(0, -1);
        }
        return str === 'http' || str === 'https' || str === 'ftp' || str === 'gopher' || str === 'file';
    }
    function padding2(str) {
        return str.length === 1 ? '0' + str : str;
    }
    function encodeSpecialChars(str, specialCharsReg) {
        return encodeURI(str).replace(specialCharsReg, function (m) {
            return '%' + padding2(m.charCodeAt(0).toString(16));
        });
    }
    var url = {
            parse: function (str, parseQueryString) {
                var m = str.match(URI_SPLIT_REG) || [], ret = {};
                for (var part in REG_INFO) {
                    ret[part] = m[REG_INFO[part]];
                }
                if (ret.protocol) {
                    ret.protocol = ret.protocol.toLowerCase();
                }
                if (ret.hostname) {
                    ret.hostname = ret.hostname.toLowerCase();
                }
                var protocol = ret.protocol;
                if (protocol && !needDoubleSlash(protocol.slice(0, -1))) {
                    if (str.lastIndexOf(protocol + '//') === -1) {
                        str = str.slice(0, protocol.length) + '//' + str.slice(protocol.length);
                        return url.parse(str, parseQueryString);
                    }
                } else {
                    if (ret.hostname && !ret.pathname) {
                        ret.pathname = '/';
                    }
                }
                ret.path = ret.pathname;
                if (ret.search) {
                    ret.path += ret.search;
                }
                ret.host = ret.hostname;
                if (ret.port) {
                    ret.host = ret.hostname + ':' + ret.port;
                }
                if (ret.search) {
                    ret.query = ret.search.substring(1);
                }
                if (parseQueryString && ret.query) {
                    ret.query = querystring.parse(ret.query);
                }
                ret.href = url.format(ret);
                return ret;
            },
            format: function (url, serializeArray) {
                var host = url.host;
                if (host === undef) {
                    host = url.hostname;
                    if (url.port) {
                        host += ':' + url.port;
                    }
                }
                var search = url.search;
                var query = url.query;
                if (search === undef && query !== undef) {
                    if (typeof query !== 'string') {
                        query = querystring.stringify(query, undef, undef, serializeArray);
                    }
                    search = '?' + query;
                }
                if (search && search.charAt(0) !== '?') {
                    search = '?' + search;
                }
                var hash = url.hash || '';
                if (hash && hash.charAt(0) !== '#') {
                    hash = '#' + hash;
                }
                var pathname = url.pathname || '';
                var out = [], protocol, auth;
                if (protocol = url.protocol) {
                    if (protocol.slice(0 - 1) !== ':') {
                        protocol += ':';
                    }
                    out.push(encodeSpecialChars(protocol, reDisallowedInProtocolOrAuth));
                }
                if (host !== undef) {
                    if (protocol && needDoubleSlash(protocol)) {
                        out.push('//');
                    }
                    if (auth = url.auth) {
                        out.push(encodeSpecialChars(auth, reDisallowedInProtocolOrAuth));
                        out.push('@');
                    }
                    out.push(encodeURIComponent(host));
                }
                if (pathname) {
                    out.push(encodeSpecialChars(pathname, reDisallowedInPathName));
                }
                if (search) {
                    out.push(encodeSpecialChars(search, reDisallowedInQuery));
                }
                if (hash) {
                    out.push('#' + encodeSpecialChars(hash.substring(1), reDisallowedInHash));
                }
                return out.join('');
            },
            resolve: function (from, to) {
                var override = 0, lastSlashIndex, order = [
                        'protocol',
                        'auth',
                        'host',
                        'pathname',
                        'search',
                        'hash'
                    ], target = {};
                from = url.parse(from);
                to = url.parse(to);
                for (var i = 0; i < order.length; i++) {
                    var o = order[i];
                    if (override) {
                        target[o] = to[o];
                        continue;
                    } else {
                        target[o] = from[o];
                    }
                    if (o === 'pathname') {
                        var pathname = to.pathname;
                        if (pathname) {
                            override = 1;
                            if (pathname.charAt(0) !== '/') {
                                if (target.hostname && !target.pathname) {
                                    pathname = '/' + pathname;
                                } else if (target.pathname) {
                                    if (pathname.slice(0 - 2) === '/.' || pathname.slice(0 - 3) === '/..' || pathname === '.' || pathname === '..') {
                                        pathname = pathname + '/';
                                    }
                                    lastSlashIndex = target.pathname.lastIndexOf('/');
                                    if (lastSlashIndex !== -1) {
                                        pathname = target.pathname.slice(0, lastSlashIndex + 1) + pathname;
                                    }
                                }
                            }
                            target.pathname = Path.normalize(pathname);
                        }
                    } else if (o === 'search') {
                        if (to.search) {
                            target.search = to.search;
                            override = 1;
                        }
                    } else if (to[o]) {
                        override = override || target[o] !== to[o];
                        target[o] = to[o];
                    }
                }
                return url.format(target);
            }
        };
    module.exports = url;
});

