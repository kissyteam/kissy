/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:16
*/
/**
 * drag file support for html5 file&dd
 * @author yiminghe@gmail.com
 * @refer: http://www.html5rocks.com/tutorials/file/filesystem/
 *         http://yiminghe.iteye.com/blog/848613
 */
KISSY.add("editor/plugin/drag-upload", function (S, Editor) {
    var Node = S.Node,
        Event = S.Event,
        Utils = Editor.Utils,
        DOM = S.DOM;

    function dragUpload(config) {
        this.config = config || {};
    }

    S.augment(dragUpload, {
        pluginRenderUI: function (editor) {
            var cfg = this.config,
                fileInput = cfg['fileInput'] || "Filedata",
                sizeLimit = cfg['sizeLimit'] || Number['MAX_VALUE'],
                serverParams = cfg['serverParams'] || {},
                serverUrl = cfg['serverUrl'] || "",
                suffix = cfg['suffix'] || "png,jpg,jpeg,gif",
                suffix_reg = new RegExp(suffix.split(/,/).join("|") + "$", "i"),

                inserted = {}, startMonitor = false;

            function nodeInsert(ev) {
                var oe = ev['originalEvent'],
                    t = oe.target;
                if (DOM.nodeName(t) == "img" && t.src.match(/^file:\/\//)) {
                    inserted[t.src] = t;
                }
            }

            editor.docReady(function () {
                var document = editor.get("document")[0];
                Event.on(document, "dragenter", function () {
                    //firefox 会插入伪数据
                    if (!startMonitor) {
                        Event.on(document, "DOMNodeInserted", nodeInsert);
                        startMonitor = true;
                    }
                });

                Event.on(document, "drop", function (ev) {
                    Event.remove(document, "DOMNodeInserted", nodeInsert);
                    startMonitor = false;
                    ev.halt();
                    ev = ev['originalEvent'];

                    var archor, ap;
                    /**
                     * firefox 会自动添加节点
                     */
                    if (!S.isEmptyObject(inserted)) {
                        S.each(inserted, function (el) {
                            if (DOM.nodeName(el) == "img") {
                                archor = el.nextSibling;
                                ap = el.parentNode;
                                DOM.remove(el);
                            }
                        });
                        inserted = {};
                    } else {
                        // 空行里拖放肯定没问题，其他在文字中间可能不准确
                        ap = document.elementFromPoint(ev.clientX, ev.clientY);
                        archor = ap.lastChild;
                    }

                    var dt = ev['dataTransfer'];
                    dt.dropEffect = "copy";
                    var files = dt['files'];
                    if (!files) {
                        return;
                    }
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i], name = file.name, size = file.size;
                        if (!name.match(suffix_reg)) {
                            continue;
                        }
                        if (size / 1000 > sizeLimit) {
                            continue;
                        }
                        var img = new Node("<img " + "src='" +
                            Utils.debugUrl("theme/tao-loading.gif")
                            + "'" + "/>");
                        var nakeImg = img[0];
                        ap.insertBefore(nakeImg, archor);
                        var np = nakeImg.parentNode, np_name = DOM.nodeName(np);
                        // 防止拖放导致插入到 body 以外
                        if (np_name == "head"
                            || np_name == "html") {
                            DOM.insertBefore(nakeImg, document.body.firstChild);
                        }

                        fileUpload(file, img);
                    }
                });
            });


            if (window['XMLHttpRequest'] && !XMLHttpRequest.prototype.sendAsBinary) {
                XMLHttpRequest.prototype.sendAsBinary = function (dataStr, contentType) {
                    // chrome12 引入 WebKitBlobBuilder
                    var bb = new (window['BlobBuilder'] || window['WebKitBlobBuilder'])();
                    var len = dataStr.length;
                    var data = new window['Uint8Array'](len);
                    for (var i = 0; i < len; i++) {
                        data[i] = dataStr['charCodeAt'](i);
                    }
                    bb.append(data.buffer);
                    this.send(bb['getBlob'](contentType));
                }
            }

            /**
             *
             * @param img loading 占位图片
             * @param file 真实数据
             */
            function fileUpload(file, img) {

                var reader = new window['FileReader']();
                //chrome 不支持 addEventListener("load")
                reader.onload = function (ev) {
                    // Please report improvements to: marco.buratto at tiscali.it
                    var fileName = file.name,
                        fileData = ev.target['result'],
                        boundary = "----kissy-editor-yiminghe",
                        xhr = new XMLHttpRequest();

                    xhr.open("POST", serverUrl, true);
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4) {
                            if (xhr.status == 200 || xhr.status == 304) {
                                if (xhr.responseText != "") {
                                    var info = window['JSON'].parse(xhr.responseText);
                                    img[0].src = info['imgUrl'];
                                }
                            } else {
                                alert("服务器端出错！");
                                img.remove();

                            }
                            xhr.onreadystatechange = null;
                        }
                    };

                    var body = "\r\n--" + boundary + "\r\n";
                    body += "Content-Disposition: form-data; name=\"" +
                        fileInput + "\"; filename=\"" + encodeURIComponent(fileName) + "\"\r\n";
                    body += "Content-Type: " + (file.type || "application/octet-stream") + "\r\n\r\n";
                    body += fileData + "\r\n";
                    serverParams = Editor.Utils.normParams(serverParams);
                    for (var p in serverParams) {

                        body += "--" + boundary + "\r\n";
                        body += "Content-Disposition: form-data; name=\"" +
                            p + "\"\r\n\r\n";
                        body += serverParams[p] + "\r\n";

                    }
                    body += "--" + boundary + "--";

                    xhr.setRequestHeader("Content-Type",
                        "multipart/form-data, boundary=" + boundary);
                    // simulate a file MIME POST request.

                    xhr.sendAsBinary("Content-Type: multipart/form-data; boundary=" +
                        boundary + "\r\nContent-Length: " + body.length
                        + "\r\n" + body + "\r\n");
                    reader.onload = null;
                };
                reader['readAsBinaryString'](file);
            }
        }
    });

    return dragUpload;
}, {
    requires: ['editor']
});
