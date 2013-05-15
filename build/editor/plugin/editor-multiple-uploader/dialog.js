/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: May 15 16:34
*/
/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: May 15 16:34
*/
/**
 * editor-multiple-uploader dialog
 * @author yiminghe@gmail.com，minghe36@gmail.com
 */
KISSY.add("editor/plugin/editor-multiple-uploader/dialog", function (S,Node, Editor,DragPlugin,Dialog4E,Uploader,EditorMultipleUploader,Auth,ProBars) {
    var $ = Node;

    function MultiUploadDialog(editor, config) {
        this.editor = editor;
        this.config = config;
        Editor.Utils.lazyRun(this, "_prepareShow", "_realShow");
    }


    S.augment(MultiUploadDialog, {
        addRes: Editor.Utils.addRes,
        destroy: Editor.Utils.destroyRes,
        /**
         * 显示弹出层
         */
        show:function(){
            var self = this;
            var editor = self.editor;
            var prefixCls = editor.get('prefixCls');
            if(!self.dialog){
                //实例化弹出层
                self.dialog = new Dialog4E({
                    headerContent: "批量上传",
                    mask: false,
                    plugins: [
                        new DragPlugin({
                            handlers: ['.ks-editor-stdmod-header']
                        })
                    ],
                    focus4e: false,
                    width: "600px"
                }).render();

                self.addRes(self.dialog);
                self._append();
            }
            var dialog = self.dialog;
            dialog.show();
            self._renderUploader();
        },
        /**
         * 添加上传组件的html结构
         * @private
         */
        _append:function(){
            var self = this;
            var dialog = self.dialog;
            if(!dialog) return self;

            var $body = dialog.get("body");
            var tpl = self.config.tpl;
            if(!tpl) return self;

            $body.html(tpl);

            return self;
        },
        /**
         * 实例化上传组件
         * @private
         */
        _renderUploader:function(){
            var self = this;
            var config = self.config;
            if(self.uploader) return false;
            var uploader = new Uploader(config.target,config);
            self.uploader = uploader;
            //使用主题
            uploader.theme(new EditorMultipleUploader({
                queueTarget:config.queueTarget
            }))
            //验证插件
            uploader.plug(new Auth(config.auth || {}))
                //进度条集合
                .plug(new ProBars({isHide:false}))
            ;

            var $ = S.Node.all;
            var $queueWrapper = $('.J_UploaderQueueWrapper');
            var $insert = $('.J_InsertContent');
            $insert.on('click',self._insertHandler,self);
            uploader.on('add',function(ev){
                if($queueWrapper.css('display') == 'none'){
                    $queueWrapper.fadeIn(0.5);
                }
            })
            uploader.on('remove',function(ev){
                if(!uploader.get('queue').get('files').length){
                    $queueWrapper.fadeOut(0.5);
                }
            })
            var queue = uploader.get('queue');
            $('.J_ClearQueue').on('click',function(ev){
                ev.preventDefault();
                queue.clear();
            })
            $('.J_StartUpload').on('click',function(){
                uploader.uploadFiles('waiting');
            })
        },
        /**
         * 点击全部插入后触发
         * @private
         */
        _insertHandler:function(){
            var self = this;
            var editor = self.editor;
            var editorDoc = editor.get("document")[0];
            var uploader = self.uploader;
            var queue = uploader.get('queue');
            var files = queue.getFiles('success');
            if(!files.length){
                alert('不存在成功上传的图片！');
                return false;
            }
            S.each(files,function(file){
                var url = file.result.url;
                // chrome refer empty in empty src iframe
                new Image().src = url;
                editor.insertElement($("<p>&nbsp;<img src='" + url + "'/>&nbsp;</p>", editorDoc));

                queue.remove(file.id);
            })
        }
    });

    return MultiUploadDialog;
}, {
    requires: ['node','editor',
        'component/plugin/drag',
        '../dialog',
        'gallery/uploader/1.4/',
        'gallery/uploader/1.4/themes/editorMultipleUploader/',
        'gallery/uploader/1.4/plugins/auth/auth',
        'gallery/uploader/1.4/plugins/proBars/proBars',
        'gallery/uploader/1.4/themes/editorMultipleUploader/style.css'
    ]
});
