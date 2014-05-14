/**
 * utils for router
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var utils;
    var DomEvent = require('event/dom');

    function removeVid(str) {
        return str.replace(/__ks-vid=.+$/, '');
    }

    function getVidFromHash(hash) {
        var m;
        if ((m = hash.match(/__ks-vid=(.+)$/))) {
            return parseInt(m[1], 10);
        }
        return 0;
    }

    function getFragment(url) {
        var m = url.match(/#(.+)$/);
        return m && m[1] || '';
    }

    utils = {
        endWithSlash: function (str) {
            return str.charAt(str.length - 1) === '/';
        },

        startWithSlash: function (str) {
            return str.charAt(0) === '/';
        },

        removeEndSlash: function (str) {
            if (this.endWithSlash(str)) {
                str = str.substring(0, str.length - 1);
            }
            return str;
        },

        removeStartSlash: function (str) {
            if (this.startWithSlash(str)) {
                str = str.substring(1);
            }
            return str;
        },

        addEndSlash: function (str) {
            return this.removeEndSlash(str) + '/';
        },

        addStartSlash: function (str) {
            if (str) {
                return '/' + this.removeStartSlash(str);
            } else {
                return str;
            }
        },

        // get full path from fragment for html history
        getFullPath: function (fragment, urlRoot) {
            return location.protocol + '//' + location.host +
                this.removeEndSlash(urlRoot) + this.addStartSlash(fragment);
        },

        equalsIgnoreSlash: function (str1, str2) {
            str1 = this.removeEndSlash(str1);
            str2 = this.removeEndSlash(str2);
            return str1 === str2;
        },

        getHash: function (url) {
            // 不能 location.hash
            // 1.
            // http://xx.com/#yy?z=1
            // ie6 => location.hash = #yy
            // 其他浏览器 => location.hash = #yy?z=1
            // 2.
            // #!/home/q={%22thedate%22:%2220121010~20121010%22}
            // firefox 15 => #!/home/q={"thedate":"20121010~20121010"}
            // !! :(
            return removeVid(getFragment(url).replace(/^!/, '')).replace(DomEvent.REPLACE_HISTORY, '');
        },

        removeVid: removeVid,

        hasVid: function (str) {
            return str.indexOf('__ks-vid=') !== -1;
        },

        addVid: function (str, vid) {
            return str + '__ks-vid=' + vid;
        },

        getVidFromUrlWithHash: function (url) {
            return getVidFromHash(getFragment(url));
        },

        getVidFromHash: getVidFromHash
    };
    return utils;
});