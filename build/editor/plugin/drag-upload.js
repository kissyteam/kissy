/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:20
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/drag-upload
*/

KISSY.add("editor/plugin/drag-upload", ["editor", "event"], function(S, require) {
  var Editor = require("editor");
  var Event = require("event");
  var Node = S.Node, Utils = Editor.Utils, Dom = S.DOM;
  function dragUpload(config) {
    this.config = config || {}
  }
  S.augment(dragUpload, {pluginRenderUI:function(editor) {
    var cfg = this.config, fileInput = cfg.fileInput || "Filedata", sizeLimit = cfg.sizeLimit || Number.MAX_VALUE, serverParams = cfg.serverParams || {}, serverUrl = cfg.serverUrl || "", suffix = cfg.suffix || "png,jpg,jpeg,gif", suffixReg = new RegExp(suffix.split(/,/).join("|") + "$", "i"), inserted = {}, startMonitor = false;
    function nodeInsert(ev) {
      var oe = ev.originalEvent, t = oe.target;
      if(Dom.nodeName(t) === "img" && t.src.match(/^file:\/\//)) {
        inserted[t.src] = t
      }
    }
    editor.docReady(function() {
      var document = editor.get("document")[0];
      Event.on(document, "dragenter", function() {
        if(!startMonitor) {
          Event.on(document, "DOMNodeInserted", nodeInsert);
          startMonitor = true
        }
      });
      Event.on(document, "drop", function(ev) {
        Event.remove(document, "DOMNodeInserted", nodeInsert);
        startMonitor = false;
        ev.halt();
        ev = ev.originalEvent;
        var archor, ap;
        if(!S.isEmptyObject(inserted)) {
          S.each(inserted, function(el) {
            if(Dom.nodeName(el) === "img") {
              archor = el.nextSibling;
              ap = el.parentNode;
              Dom.remove(el)
            }
          });
          inserted = {}
        }else {
          ap = document.elementFromPoint(ev.clientX, ev.clientY);
          archor = ap.lastChild
        }
        var dt = ev.dataTransfer;
        dt.dropEffect = "copy";
        var files = dt.files;
        if(!files) {
          return
        }
        for(var i = 0;i < files.length;i++) {
          var file = files[i], name = file.name, size = file.size;
          if(!name.match(suffixReg)) {
            continue
          }
          if(size / 1E3 > sizeLimit) {
            continue
          }
          var img = new Node("<img " + 'src="' + Utils.debugUrl("theme/tao-loading.gif") + '"/>');
          var nakeImg = img[0];
          ap.insertBefore(nakeImg, archor);
          var np = nakeImg.parentNode, npName = Dom.nodeName(np);
          if(npName === "head" || npName === "html") {
            Dom.insertBefore(nakeImg, document.body.firstChild)
          }
          fileUpload(file, img)
        }
      })
    });
    if(window.XMLHttpRequest && !XMLHttpRequest.prototype.sendAsBinary) {
      XMLHttpRequest.prototype.sendAsBinary = function(dataStr, contentType) {
        var bb;
        if(window.BlobBuilder) {
          bb = new window.BlobBuilder
        }else {
          bb = window.WebKitBlobBuilder()
        }
        var len = dataStr.length;
        var data = new window.Uint8Array(len);
        for(var i = 0;i < len;i++) {
          data[i] = dataStr.charCodeAt(i)
        }
        bb.append(data.buffer);
        this.send(bb.getBlob(contentType))
      }
    }
    function fileUpload(file, img) {
      var reader = new window.FileReader;
      reader.onload = function(ev) {
        var fileName = file.name, fileData = ev.target.result, boundary = "----kissy-editor-yiminghe", xhr = new XMLHttpRequest;
        xhr.open("POST", serverUrl, true);
        xhr.onreadystatechange = function() {
          if(xhr.readyState === 4) {
            if(xhr.status === 200 || xhr.status === 304) {
              if(xhr.responseText !== "") {
                var info = S.parseJson(xhr.responseText);
                img[0].src = info.imgUrl
              }
            }else {
              window.alert("\u670d\u52a1\u5668\u7aef\u51fa\u9519\uff01");
              img.remove()
            }
            xhr.onreadystatechange = null
          }
        };
        var body = "\r\n--" + boundary + "\r\n";
        body += "Content-Disposition: form-data; name='" + fileInput + "'; filename='" + encodeURIComponent(fileName) + "'\r\n";
        body += "Content-Type: " + (file.type || "application/octet-stream") + "\r\n\r\n";
        body += fileData + "\r\n";
        serverParams = Editor.Utils.normParams(serverParams);
        for(var p in serverParams) {
          body += "--" + boundary + "\r\n";
          body += "Content-Disposition: form-data; name='" + p + "'\r\n\r\n";
          body += serverParams[p] + "\r\n"
        }
        body += "--" + boundary + "--";
        xhr.setRequestHeader("Content-Type", "multipart/form-data, boundary=" + boundary);
        xhr.sendAsBinary("Content-Type: multipart/form-data; boundary=" + boundary + "\r\nContent-Length: " + body.length + "\r\n" + body + "\r\n");
        reader.onload = null
      };
      reader.readAsBinaryString(file)
    }
  }});
  return dragUpload
});

