/**
 * Uri class for KISSY.
 * @author yiminghe@gmail.com
 */
(function (S, undefined) {

    var // from closure library
        URI_SPLIT_REG = new RegExp(
            '^' +
                '([^:/?#.]+:)' + // protocol - ignore special characters
                // used by other URL parts such as :,
                // ?, /, #, and .

                '(?://' +
                '(?:([^/?#]*)@)?' + // userInfo
                '([\\w\\d\\-\\u0100-\\uffff.%]*)' + // hostname - restrict to letters,
                // digits, dashes, dots, percent
                // escapes, and unicode characters.
                '(?::([0-9]+))?' + // port
                ')?' +
                '([^?#]+)?' + // path
                '(?:\\?([^#]*))?' + // query
                '(#.*)?' + // hash
                '$'),

        Path = S.Path,

        REG_INFO = {
            protocol:1,
            userInfo:2,
            hostname:3,
            port:4,
            pathname:5,
            query:6,
            hash:7
        };

    function parseQuery(self) {
        if (!self._queryMap) {
            self._queryMap = S.unparam(self._query);
        }
    }

    /**
     * @class
     * Query data structure.
     * @param {String} query encoded query string(without question mask).
     * @memberOf KISSY.Uri
     */
    function Query(query) {
        this._query = query || "";
    }


    Query.prototype =
    /**
     * @lends KISSY.Uri.Query#
     */
    {
        constructor:Query,

        clone:function () {
            return new Query(this.toString());
        },

        /**
         * Return parameter value corresponding to current key
         * @param {String} key
         */
        get:function (key) {
            var self = this;
            parseQuery(self);
            return self._queryMap[key];
        },

        /**
         * Set parameter value corresponding to current key
         * @param {String} key
         * @param value
         */
        set:function (key, value) {
            var self = this;
            parseQuery(self);
            self._queryMap[key] = value;
            return self;
        },

        /**
         * Remove parameter with specified name.
         * @param {String} key
         */
        remove:function (key) {
            var self = this;
            parseQuery(self);
            delete self._queryMap[key];
            return self;

        },

        /**
         * Add parameter value corresponding to current key
         * @param {String} key
         * @param value
         */
        add:function (key, value) {
            var self = this,
                currentValue;
            parseQuery(self);
            currentValue = self._query[key];
            if (currentValue === undefined) {
                currentValue = value;
            } else {
                currentValue = [].concat(currentValue).concat(value);
            }
            self._queryMap[key] = currentValue;
            return self;
        },

        /**
         * Serialize query to string.
         * @param {Boolean} [serializeArray=true]
         * whether append [] to key name when value 's type is array
         */
        toString:function (serializeArray) {
            var self = this;
            parseQuery(self);
            return S.param(self._queryMap, undefined, undefined, serializeArray);
        }
    };

    function padding2(str) {
        return str.length == 1 ? "0" + str : str;
    }

    // www.ta#bao.com // => www.ta.com/#bao.com
    // www.ta%23bao.com
    function encodeSpecialChars(str, specialCharsReg) {
        // encodeURI( ) is intended to encode complete URIs,
        // the following ASCII punctuation characters,
        // which have special meaning in URIs, are not escaped either:
        // ; / ? : @ & = + $ , #
        return encodeURI(str).replace(specialCharsReg, function (m) {
            return "%" + padding2(m.charCodeAt(0).toString(16));
        });
    }

    var reDisallowedInProtocolOrUserInfo = /[#\/\?@]/g,
        reDisallowedInPathName = /[\#\?]/g,
        reDisallowedInQuery = /[\#\?@]/g,
        reDisallowedInHash = /#/g;

    /**
     * @class
     * Uri class for KISSY.
     * Most of its interfaces are same with window.location.
     * @param {String} [uriStr] Encoded uri string.
     * @memberOf KISSY
     */
    function Uri(uriStr) {
        var m, self = this;

        S.mix(self,
            /**
             * @lends KISSY.Uri#
             */
            {
                /**
                 * protocol such as "http:". aka scheme
                 * @type String
                 */
                protocol:"",
                /**
                 * User credentials such as "yiminghe:gmail"
                 * @type {String}
                 */
                userInfo:"",
                /**
                 * hostname such as "docs.kissyui.com". aka domain
                 * @type {String}
                 */
                hostname:"",
                /**
                 * Port such as "8080"
                 * @type {String}
                 */
                port:"",
                /**
                 * pathname such as "/index.htm"
                 * @type {String}
                 */
                pathname:"",
                /**
                 * Query object for search string. aka search
                 * @type {KISSY.Uri.Query}
                 */
                query:"",
                /**
                 * Hash fragment such as "#!/test/2". aka fragment
                 */
                hash:""
            });

        if (uriStr) {
            m = uriStr.match(URI_SPLIT_REG);
            S.each(REG_INFO, function (index, key) {
                self[key] = m[index] || "";
            });
            self.query = new Query(self.query);
        }
    }

    Uri.prototype =
    /**
     * @lends KISSY.Uri#
     */
    {

        constructor:Uri,

        /**
         * Return a cloned new instance.
         * @return {KISSY.Uri}
         */
        clone:function () {
            var uri = new Uri(), self = this;
            S.each(REG_INFO, function (index, key) {
                uri[key] = self[key];
            });
            uri.query = uri.query.clone();
        },


        /**
         * return a resolved uri corresponding to current uri
         * @param {KISSY.Uri} relativeUri
         * @example
         * <code>
         *   this: "http://y/yy/z.com?t=1#v=2"
         *   "https:/y/" => "https:/y/"
         *   "//foo" => "http://foo"
         *   "foo" => "http://y/yy/foo"
         *   "/foo" => "http://y/foo"
         *   "?foo" => "http://y/yy/z.com?foo"
         *   "#foo" => http://y/yy/z.com?t=1#foo"
         * </code>
         * @return {KISSY.Uri}
         */
        resolve:function (relativeUri) {

            var self = this,
                override = 0,
                order = ["protocol", "userInfo", "hostname", "port", "pathname", "query", "hash"],
                ret = self.clone();

            S.each(order, function (o) {
                if (o == "pathname") {
                    // relativeUri does not set for protocol/userInfo/hostname/port
                    if (override) {
                        ret[o] = relativeUri[o];
                    } else {
                        var pathname = relativeUri.pathname;
                        if (pathname) {
                            override = 1;
                            if (!S.startsWith(path, "/")) {
                                if (ret.hostname && !ret.pathname) {
                                    // RFC 3986, section 5.2.3, case 1
                                    pathname = "/" + pathname;
                                } else if (ret.pathname) {
                                    // RFC 3986, section 5.2.3, case 2
                                    var lastSlashIndex = ret.pathname.lastIndexOf('/');
                                    if (lastSlashIndex != -1) {
                                        pathname = ret.pathname.slice(0, lastSlashIndex + 1) + path;
                                    }
                                }
                            }
                            // remove .. / .
                            ret.pathname = Path.normalize(pathname);
                        }
                    }
                } else if (o == "query") {
                    if (override || relativeUri.query.toString()) {
                        ret.query = relativeUri.query.clone();
                        override = 1;
                    }
                } else if (self[o]) {
                    if (override || relativeUri[o]) {
                        ret[o] = relativeUri[o];
                        override = 1;
                    }
                }
            });
        },

        /**
         * Return hostname
         * @return {String}
         */
        getHostname:function () {
            return this.hostname;
        },

        /**
         * Set hostname
         * @param {String} hostname
         * @return this
         */
        setHostname:function (hostname) {
            this.hostname = hostname;
            return this;
        },

        /**
         * Set user info
         * @param {String} userInfo
         * @return this
         */
        setUserInfo:function (userInfo) {
            this.userInfo = userInfo;
            return this;
        },

        /**
         * Get user info
         * @return {String}
         */
        getUserInfo:function () {
            return this.userInfo;
        },

        /**
         * Set port
         * @param {String} port
         * @return this
         */
        setPort:function (port) {
            this.port = port;
            return this;
        },

        /**
         * Get port
         * @return {String}
         */
        getPort:function () {
            return this.port;
        },

        /**
         * Set pathname
         * @param {string} pathname
         * @return this
         */
        setPathname:function (pathname) {
            this.pathname = pathname;
            return this;
        },

        /**
         * Get pathname
         * @return {String}
         */
        getPathname:function () {
            return this.pathname;
        },

        /**
         * Set query
         * @param {String|KISSY.Uri.Query} query
         * @return this
         */
        setQuery:function (query) {
            if (S.isString(query)) {
                if (S.startsWith(query, "?")) {
                    query = query.slice(1);
                }
                query = new Query(encodeSpecialChars(query, reDisallowedInQuery));
            }
            this.query = query;
            return this;
        },

        /**
         * Get query
         * @return {KISSY.Uri.Query}
         */
        getQuery:function () {
            return this.query;
        },

        /**
         * Get hash
         * @return {String}
         */
        getHash:function () {
            return this.hash;
        },

        /**
         * Set hash
         * @param {String} hash
         * @return this
         */
        setHash:function (hash) {
            if (!S.startsWith(hash, "#")) {
                hash = "#" + hash;
            }
            this.hash = hash;
            return this;
        },

        /**
         * Judge whether two uri has same domain.
         * @param {KISSY.Uri} other
         * @return {Boolean}
         */
        hasSameDomainAs:function (other) {
            var self = this;
            // port and hostname has to be same
            return self.hostname == other.hostname &&
                self.protocol == other.protocol &&
                self.port == other.port;
        },

        /**
         * serialize to string
         * @param {boolean} [serializeArray=true]
         * whether append [] to key name when value 's type is array
         * @return {String}
         */
        toString:function (serializeArray) {

            var out = [], self = this,
                protocol,
                hostname,
                pathname,
                port,
                hash,
                query,
                userInfo;

            if (protocol = self.protocol) {
                out.push(encodeSpecialChars(protocol, reDisallowedInProtocolOrUserInfo));
            }

            if (hostname = self.hostname) {
                out.push("//");
                if (userInfo = self.userInfo) {
                    out.push(encodeSpecialChars(userInfo, reDisallowedInProtocolOrUserInfo)).push("@");
                }

                out.push(encodeURIComponent(hostname));

                if (port = self.port) {
                    out.push(":").push(port);
                }
            }

            if (pathname = self.pathname) {
                if (hostname && !S.startsWith(pathname, "/")) {
                    pathname = "/" + pathname;
                }

                out.push(encodeSpecialChars(pathname, reDisallowedInPathName));
            }

            if (query = self.query) {
                out.push("?").push(query.toString(serializeArray));
            }

            if (hash = self.hash) {
                out.push("#").push(encodeSpecialChars(hash.slice(1), reDisallowedInHash))
            }

            return out.join("");
        }
    };

    Uri.Query = Query;

    S.Uri = Uri;

})(KISSY);
/**
 * Refer
 *  - http://www.ietf.org/rfc/rfc3986.txt
 *  - http://en.wikipedia.org/wiki/URI_scheme
 */