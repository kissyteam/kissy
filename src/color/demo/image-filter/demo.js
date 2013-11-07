KISSY.use('node,overlay', function (S, Node, Overlay) {
    var $ = Node.all;
    var overlay = new Overlay({
        content: $('#loading').html(),
        mask: true,
        align: {
            points: ['cc', 'cc']
        }
    });
    var canvas = $('#canvas')[0];
    var upload = $('#upload');
    var filter = $('#filter');
    var download = $('#download');
    var h = $('#h');
    var s = $('#s');
    var l = $('#l');
    var restore = $('#restore');
    var ctx = canvas.getContext('2d');
    var tmpCanvas = document.createElement('canvas');
    var tmpCtx = tmpCanvas.getContext('2d');
    var originalImage;
    var originalImageData;
    var originalWidth;
    var originalHeight;

//        var blob = new Blob(Array.prototype.map.call(
//                document.querySelectorAll(
//                        "script[type=\"text\/js-worker\"]"),
//                function (oScript) {
//                    return oScript.textContent;
//                }), {type: "text/javascript"});
//
//        var worker = new Worker(window.URL.createObjectURL(blob));

    var worker = new Worker('worker.js');

    worker.postMessage({
        host: location.host
    });

    worker.onmessage = function (e) {
        if (e.data.complete) {
            upload[0].disabled = false;
            return;
        }
        if (e.data.log) {
            S.log(e.data.log);
            return;
        }
        if (window[e.data.callback]) {
            window[e.data.callback](e.data.data);
        }
    };

    function createImageData(w, h) {
        return tmpCtx.createImageData(w, h);
    }

    function filterImage(percentage) {
        var pixels = createImageData(originalWidth, originalHeight);
        var callback = 'callback' + S.now();
        window[callback] = function (data) {
            overlay.hide();
            var pixelsData = pixels.data;
            for (var i = 0; i < data.length; i++) {
                pixelsData[i] = data[i];
            }
            ctx.putImageData(pixels, 0, 0);
            download.attr('href', canvas.toDataURL());
            delete window[callback];
        };
        overlay.show();
        worker.postMessage({
            data: originalImageData,
            callback: callback,
            percentage: percentage
        });
    }

    filter.on('click', function () {
        filterImage({
            h: h.val() / 100,
            s: s.val() / 100,
            l: l.val() / 100
        });
    });

    restore.on('click', function () {
        ctx.putImageData(originalImage, 0, 0);
        download.attr('href', canvas.toDataURL());
    });

    upload.on('change', function () {
        var f = this.files[0];
        // Only process image files.
        if (!f.type.match(/image.*/)) {
            return;
        }

        var reader = new FileReader();
        // Closure to capture the file information.
        reader.onload = (function (theFile) {
            return function (e) {
                var img = new Image();
                // tainted canvas
                //img.crossOrigin = "Anonymous";
                img.title = theFile.name;
                img.src = e.target.result;
                download.attr('download', theFile.name);

                //img.src='http://localhost:9999/kissy/src/color/demo/backdrop.png';
                img.onload = function () {
                    restore[0].disabled = filter[0].disabled = h[0].disabled =
                        s[0].disabled = l[0].disabled = false;
                    h[0].value = s[0].value = l[0].value = 100;
                    originalWidth = canvas.width = img.width;
                    originalHeight = canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    originalImage = ctx.getImageData(0, 0, originalWidth, originalHeight);
                    originalImageData = originalImage.data;
                    download.attr('href', canvas.toDataURL());
                };
            };
        })(f);

        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
    });
});