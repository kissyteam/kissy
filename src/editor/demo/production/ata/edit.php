<!doctype html>
<html>
<head>
    <meta charset="utf-8"/>
    <meta name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-touch-fullscreen" content="yes">
    <meta name="viewport" content="width = device-width,initial-scale = 1.0">
    <title>KISSY Editor Test</title>
    <link href="/kissy/build/css/dpl/base.css" rel="stylesheet"/>
    <link href="/kissy/build/editor/theme/cool/editor.css" rel="stylesheet"/>
</head>
<body>
<h1 style="font-size: 2em;text-align: center;margin: 2em;">KISSY Editor For ATA</h1>

<form action="detail.php" method="post">

    <div id="container" style="margin: 10px 30px;">
        <div id="editor">
            <textarea class="ks-editor-textarea" name="content" style='width:500px;height:300px;'>
                <?php
                        if(isset($_POST['content'])){
                            echo htmlspecialchars($_POST['content']);
                        }
                       ?>
            </textarea>
        </div>
    </div>

    <div style="margin: 10px 30px;">
        <input type="submit"/>
    </div>

</form>

<script src="/kissy/build/seed.js" data-config="{combine:true}"></script>
<script>
    (function () {
        KISSY.use("editor", function (S, Editor) {

            var cfg = {
                attachForm: true,
                baseZIndex: 10000,
                srcNode: "#editor",
                width: '100%',
                height: "400px"
            };

            var plugins = (
                    "source-area" +
                            ",code" +
                            ",separator" +
                            ",bold" +
                            ",italic," +
                            "font-family," +
                            "font-size," +
                            "strike-through," +
                            "underline," +
                            "separator" +
                            ",image" +
                            ",link" +
                            ",fore-color" +
                            ",back-color" +
                            ",resize" +
                            ",draft" +
                            ",undo" +
                            ",indent" +
                            ",outdent" +
                            ",unordered-list" +
                            ",ordered-list" +
                            ",element-path" +
                            ",page-break" +
                            ",preview" +
                            ",maximize" +
                            ",remove-format" +
                            ",heading" +
                            ",justify-left" +
                            ",justify-center" +
                            ",justify-right" +
                            ",table" +
                            ",smiley" +
                            ",flash" +
                            ",xiami-music" +
                            ",multiple-upload" +
                            ",video" +
                            ",drag-upload"
                    ).split(",");

            var fullPlugins = [];

            S.each(plugins, function (p, i) {
                fullPlugins[i] = "editor/plugin/" + p + "/";
            });

            var pluginConfig = {
                link: {
                    target: "_blank"
                },
                "image": {
                    upload: {
                        serverUrl: "xx.php",
                        suffix: "png,jpg,jpeg,gif",
                        fileInput: "Filedata"
                    }
                },
                "flash": {
                    "defaultWidth": "300",
                    "defaultHeight": "300"
                },
                "multiple-upload": {
                    serverUrl: "upload.jss",
                    "previewWidth": "80px"
                },
                "video": {
                    urlCfg: [
                        {
                            reg: /tudou\.com/i,
                            url: "http://bangpai.taobao.com/json/getTudouVideo.htm",
                            paramName: "url"
                        }
                    ],
                    "urlTip": "请输入优酷网、土豆网、酷7网的视频播放页链接...",
                    "providers": [
                        {
                            // 允许白名单
                            reg: /taohua\.com/i,
                            //默认高宽
                            width: 480,
                            height: 400,
                            detect: function (url) {
                                return url;
                            }
                        },
                        {
                            reg: /youku\.com/i,
                            width: 480,
                            height: 400,
                            detect: function (url) {
                                var m = url.match(/id_([^.]+)\.html$/);
                                if (m) {
                                    return "http://player.youku.com/player.php/sid/" + m[1] + "/v.swf";
                                }
                                m = url.match(/v_playlist\/([^.]+)\.html$/);
                                if (m) {
                                    return;
                                    //return "http://player.youku.com/player.php/sid/" + m[1] + "/v.swf";
                                }
                                return url;
                            }
                        },
                        {
                            reg: /tudou\.com/i,
                            width: 480,
                            height: 400,
                            detect: function (url) {
                                return url;
                            }
                        },
                        {
                            reg: /ku6\.com/i,
                            width: 480,
                            height: 400,
                            detect: function (url) {
                                var m = url.match(/show[^\/]*\/([^.]+)\.html$/);
                                if (m) {
                                    return "http://player.ku6.com/refer/" + m[1] + "/v.swf";
                                }
                                return url;
                            }
                        }
                    ]
                },
                "draft": {
                    interval: 5,
                    limit: 10,
                    "helpHTML": "<div " +
                            "style='width:200px;'>" +
                            "<div style='padding:5px;'>草稿箱能够自动保存您最新编辑的内容，" +
                            "如果发现内容丢失，" +
                            "请选择恢复编辑历史</div></div>"
                },
                "resize": {
                },
                "drag-upload": {
                    suffix: "png,jpg,jpeg,gif",
                    fileInput: "Filedata",
                    sizeLimit: 1000,
                    serverUrl: "upload.jss"
                }
            };

            KISSY.use(fullPlugins, function (S) {
                var args = S.makeArray(arguments);

                args.shift();

                S.each(args, function (arg, i) {
                    var argStr = plugins[i], cfg;
                    if (cfg = pluginConfig[argStr]) {
                        args[i] = new arg(cfg);
                    }
                });

                cfg.plugins = args;
                var editor = new Editor(cfg).render();
            });

        });
    })();
</script>
</body>
</html>