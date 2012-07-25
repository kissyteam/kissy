/**
 * Port Node Path Utils For KISSY.
 * Note: Only posix mode.
 * @author yiminghe@gmail.com
 */
(function (S) {

    /**
     * @namespace
     * Path Utils For KISSY from nodejs
     * @name Path
     * @memberOf KISSY
     */
    var Path = {},
    // [root, dir, basename, ext]
        splitPathRe = /^(\/?)([\s\S]+\/(?!$)|\/)?((?:\.{1,2}$|[\s\S]+?)?(\.[^.\/]*)?)$/;

    KISSY.Path = Path;

    /**
     * Remove .. and . in path array
     * @param parts
     * @param allowAboveRoot
     * @return {*}
     */
    function normalizeArray(parts, allowAboveRoot) {
        // level above root
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
            var last = parts[i];
            if (last == ".") {
                parts.splice(i, 1);
            } else if (last === "..") {
                parts.splice(i, 1);
                up++;
            } else if (up) {
                parts.splice(i, 1);
                up--;
            }
        }

        // if allow above root, has to add ..
        if (allowAboveRoot) {
            for (; up--; up) {
                parts.unshift("..");
            }
        }

        return parts;
    }

    S.mix(Path,
        /**
         * @lends KISSY.Path
         */
        {

            /**
             * resolve([from ...], to)
             * @return {String} Resolved path.
             */
            resolve:function () {

                var resolvedPath = "",
                    resolvedPathStr,
                    i,
                    args = S.makeArray(arguments),
                    path,
                    absolute = 0;

                for (i = args.length - 1; i >= 0 && !absolute; i--) {
                    path = args[i];
                    if (typeof path != "string" || !path) {
                        continue;
                    }
                    resolvedPath = path + "/" + resolvedPath;
                    absolute = path.charAt(0) == "/";
                }

                resolvedPathStr = normalizeArray(S.filter(resolvedPath.split("/"), function (p) {
                    return !!p;
                }), !absolute).join("/");

                return ((absolute ? "/" : "") + resolvedPathStr) || ".";
            },

            /**
             * normalize .. and . in path
             * @param {String} path Path tobe normalized
             * @example
             * <code>
             * "x/y/../z" => "x/z"
             * "x/y/z/../" => "x/y/"
             * </code>
             * @return {String}
             */
            normalize:function (path) {
                var absolute = path.charAt(0) == "/",
                    trailingSlash = path.slice(-1) == "/";

                path = normalizeArray(S.filter(path.split("/"), function (p) {
                    return !!p;
                }), !absolute).join("/");

                if (!path && !absolute) {
                    path = ".";
                }

                if (path && trailingSlash) {
                    path += "/";
                }


                return (absolute ? "/" : "") + path;
            },

            /**
             * join([path ...]) and normalize
             * @return {String}
             */
            join:function () {
                var args = S.makeArray(arguments);
                return Path.normalize(S.filter(args,function (p) {
                    return p && (typeof p == "string");
                }).join("/"));
            },

            /**
             * Get string which is to relative to from
             * @param {String} from
             * @param {String} to
             * @example
             * <code>
             * relative("x/","x/y/z") => "y/z"
             * relative("x/t/z","x/") => "../../"
             * </code>
             * @return {String}
             */
            relative:function (from, to) {
                from = Path.normalize(from);
                to = Path.normalize(to);

                var fromParts = S.filter(from.split("/"), function (p) {
                        return !!p;
                    }),
                    path = [],
                    sameIndex,
                    sameIndex2,
                    toParts = S.filter(to.split("/"), function (p) {
                        return !!p;
                    }), commonLength = Math.min(fromParts.length, toParts.length);

                for (sameIndex = 0; sameIndex < commonLength; sameIndex++) {
                    if (fromParts[sameIndex] != toParts[sameIndex]) {
                        break;
                    }
                }

                sameIndex2 = sameIndex;

                while (sameIndex < fromParts.length) {
                    path.push("..");
                    sameIndex++;
                }

                path = path.concat(toParts.slice(sameIndex2));

                path = path.join("/");

                return path;
            },

            /**
             * Get base name of path
             * @param {String} path
             * @param {String} [ext] ext to be stripped from result returned.
             * @return {String}
             */
            basename:function (path, ext) {
                var result = path.match(splitPathRe) || [];
                result = result[3] || "";
                if (ext && result && result.slice(-1 * ext.length) == ext) {
                    result = result.slice(0, -1 * ext.length);
                }
                return result;
            },

            /**
             * Get dirname of path
             * @return {String}
             */
            dirname:function (path) {
                var result = path.match(splitPathRe) || [],
                    root = result[1] || "",
                    dir = result[2] || "";

                if (!root && !dir) {
                    // No dirname
                    return '.';
                }

                if (dir) {
                    // It has a dirname, strip trailing slash
                    dir = dir.substring(0, dir.length - 1);
                }

                return root + dir;
            },

            /**
             * Get extension name of file in path
             * @param {String} path
             * @return {String}
             */
            extname:function (path) {
                return (path.match(splitPathRe) || [])[4] || "";
            }

        });

})(KISSY);
/**
 * Refer
 *  - https://github.com/joyent/node/blob/master/lib/path.js
 */