/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:43
*/
/*
 Combined modules by KISSY Module Compiler: 

 path
*/

KISSY.add("path", [], function(S) {
  var splitPathRe = /^(\/?)([\s\S]+\/(?!$)|\/)?((?:\.{1,2}$|[\s\S]+?)?(\.[^.\/]*)?)$/;
  function filter(arr, fn, context) {
    var ret = [];
    S.each(arr, function(item, i, arr) {
      if(fn.call(context || this, item, i, arr)) {
        ret.push(item)
      }
    });
    return ret
  }
  function normalizeArray(parts, allowAboveRoot) {
    var up = 0, i = parts.length - 1, newParts = [], last;
    for(;i >= 0;i--) {
      last = parts[i];
      if(last !== ".") {
        if(last === "..") {
          up++
        }else {
          if(up) {
            up--
          }else {
            newParts[newParts.length] = last
          }
        }
      }
    }
    if(allowAboveRoot) {
      for(;up--;up) {
        newParts[newParts.length] = ".."
      }
    }
    newParts = newParts.reverse();
    return newParts
  }
  var Path = S.Path = {resolve:function() {
    var resolvedPath = "", resolvedPathStr, i, args = arguments, path, absolute = 0;
    for(i = args.length - 1;i >= 0 && !absolute;i--) {
      path = args[i];
      if(typeof path !== "string" || !path) {
        continue
      }
      resolvedPath = path + "/" + resolvedPath;
      absolute = path.charAt(0) === "/"
    }
    resolvedPathStr = normalizeArray(filter(resolvedPath.split("/"), function(p) {
      return!!p
    }), !absolute).join("/");
    return(absolute ? "/" : "") + resolvedPathStr || "."
  }, normalize:function(path) {
    var absolute = path.charAt(0) === "/", trailingSlash = path.slice(0 - 1) === "/";
    path = normalizeArray(filter(path.split("/"), function(p) {
      return!!p
    }), !absolute).join("/");
    if(!path && !absolute) {
      path = "."
    }
    if(path && trailingSlash) {
      path += "/"
    }
    return(absolute ? "/" : "") + path
  }, join:function() {
    var args = Array.prototype.slice.call(arguments);
    return Path.normalize(filter(args, function(p) {
      return p && typeof p === "string"
    }).join("/"))
  }, relative:function(from, to) {
    from = Path.normalize(from);
    to = Path.normalize(to);
    var fromParts = filter(from.split("/"), function(p) {
      return!!p
    }), path = [], sameIndex, sameIndex2, toParts = filter(to.split("/"), function(p) {
      return!!p
    }), commonLength = Math.min(fromParts.length, toParts.length);
    for(sameIndex = 0;sameIndex < commonLength;sameIndex++) {
      if(fromParts[sameIndex] !== toParts[sameIndex]) {
        break
      }
    }
    sameIndex2 = sameIndex;
    while(sameIndex < fromParts.length) {
      path.push("..");
      sameIndex++
    }
    path = path.concat(toParts.slice(sameIndex2));
    path = path.join("/");
    return path
  }, basename:function(path, ext) {
    var result = path.match(splitPathRe) || [], basename;
    basename = result[3] || "";
    if(ext && basename && basename.slice(ext.length * -1) === ext) {
      basename = basename.slice(0, -1 * ext.length)
    }
    return basename
  }, dirname:function(path) {
    var result = path.match(splitPathRe) || [], root = result[1] || "", dir = result[2] || "";
    if(!root && !dir) {
      return"."
    }
    if(dir) {
      dir = dir.substring(0, dir.length - 1)
    }
    return root + dir
  }, extname:function(path) {
    return(path.match(splitPathRe) || [])[4] || ""
  }};
  return Path
});

