
(function(config,Features,UA){
config({
'editor/plugin/back-color': {requires: ['editor','editor/plugin/color/btn','editor/plugin/back-color/cmd']}
});
config({
'editor/plugin/back-color/cmd': {requires: ['editor/plugin/color/cmd']}
});
config({
'editor/plugin/bold': {requires: ['editor','editor/plugin/font/ui','editor/plugin/bold/cmd']}
});
config({
'editor/plugin/bold/cmd': {requires: ['editor','editor/plugin/font/cmd']}
});
config({
'editor/plugin/bubble': {requires: ['overlay','editor']}
});
config({
'editor/plugin/button': {requires: ['editor','button']}
});
config({
'editor/plugin/checkbox-source-area': {requires: ['editor']}
});
config({
'editor/plugin/code': {requires: ['editor','editor/plugin/dialog-loader']}
});
config({
'editor/plugin/code/dialog': {requires: ['editor','editor/plugin/dialog','menubutton']}
});
config({
'editor/plugin/color/btn': {requires: ['editor','editor/plugin/button','editor/plugin/overlay','editor/plugin/dialog-loader']}
});
config({
'editor/plugin/color/cmd': {requires: ['editor']}
});
config({
'editor/plugin/color/dialog': {requires: ['editor','editor/plugin/dialog']}
});
config({
'editor/plugin/contextmenu': {requires: ['editor','menu','editor/plugin/focus-fix']}
});
config({
'editor/plugin/dent-cmd': {requires: ['editor','editor/plugin/list-utils']}
});
config({
'editor/plugin/dialog-loader': {requires: ['overlay','editor']}
});
config({
'editor/plugin/dialog': {requires: ['editor','overlay','editor/plugin/focus-fix','dd/plugin/constrain','component/plugin/drag']}
});
config({
'editor/plugin/draft': {requires: ['editor','editor/plugin/local-storage','overlay','editor/plugin/menubutton']}
});
config({
'editor/plugin/drag-upload': {requires: ['editor']}
});
config({
'editor/plugin/element-path': {requires: ['editor']}
});
config({
'editor/plugin/fake-objects': {requires: ['editor']}
});
config({
'editor/plugin/flash-bridge': {requires: ['swf','editor']}
});
config({
'editor/plugin/flash-common/base-class': {requires: ['editor','editor/plugin/contextmenu','editor/plugin/bubble','editor/plugin/dialog-loader','editor/plugin/flash-common/utils']}
});
config({
'editor/plugin/flash-common/utils': {requires: ['swf']}
});
config({
'editor/plugin/flash': {requires: ['editor','editor/plugin/flash-common/base-class','editor/plugin/flash-common/utils','editor/plugin/fake-objects']}
});
config({
'editor/plugin/flash/dialog': {requires: ['editor','editor/plugin/flash-common/utils','editor/plugin/dialog','editor/plugin/menubutton']}
});
config({
'editor/plugin/focus-fix': {requires: ['editor']}
});
config({
'editor/plugin/font-family': {requires: ['editor','editor/plugin/font/ui','editor/plugin/font-family/cmd']}
});
config({
'editor/plugin/font-family/cmd': {requires: ['editor','editor/plugin/font/cmd']}
});
config({
'editor/plugin/font-size': {requires: ['editor','editor/plugin/font/ui','editor/plugin/font-size/cmd']}
});
config({
'editor/plugin/font-size/cmd': {requires: ['editor','editor/plugin/font/cmd']}
});
config({
'editor/plugin/font/cmd': {requires: ['editor']}
});
config({
'editor/plugin/font/ui': {requires: ['editor','editor/plugin/button','editor/plugin/menubutton']}
});
config({
'editor/plugin/fore-color': {requires: ['editor','editor/plugin/color/btn','editor/plugin/fore-color/cmd']}
});
config({
'editor/plugin/fore-color/cmd': {requires: ['editor/plugin/color/cmd']}
});
config({
'editor/plugin/heading': {requires: ['editor','editor/plugin/heading/cmd']}
});
config({
'editor/plugin/heading/cmd': {requires: ['editor']}
});
config({
'editor/plugin/image': {requires: ['editor','editor/plugin/button','editor/plugin/bubble','editor/plugin/contextmenu','editor/plugin/dialog-loader']}
});
config({
'editor/plugin/image/dialog': {requires: ['io','editor','editor/plugin/dialog','tabs','editor/plugin/menubutton']}
});
config({
'editor/plugin/indent': {requires: ['editor','editor/plugin/indent/cmd']}
});
config({
'editor/plugin/indent/cmd': {requires: ['editor','editor/plugin/dent-cmd']}
});
config({
'editor/plugin/italic': {requires: ['editor','editor/plugin/font/ui','editor/plugin/italic/cmd']}
});
config({
'editor/plugin/italic/cmd': {requires: ['editor','editor/plugin/font/cmd']}
});
config({
'editor/plugin/justify-center': {requires: ['editor','editor/plugin/justify-center/cmd']}
});
config({
'editor/plugin/justify-center/cmd': {requires: ['editor/plugin/justify-cmd']}
});
config({
'editor/plugin/justify-cmd': {requires: ['editor']}
});
config({
'editor/plugin/justify-left': {requires: ['editor','editor/plugin/justify-left/cmd']}
});
config({
'editor/plugin/justify-left/cmd': {requires: ['editor/plugin/justify-cmd']}
});
config({
'editor/plugin/justify-right': {requires: ['editor','editor/plugin/justify-right/cmd']}
});
config({
'editor/plugin/justify-right/cmd': {requires: ['editor/plugin/justify-cmd']}
});
config({
'editor/plugin/link': {requires: ['editor','editor/plugin/bubble','editor/plugin/link/utils','editor/plugin/dialog-loader','editor/plugin/button']}
});
config({
'editor/plugin/link/dialog': {requires: ['editor','editor/plugin/dialog','editor/plugin/link/utils']}
});
config({
'editor/plugin/link/utils': {requires: ['editor']}
});
config({
'editor/plugin/list-utils': {requires: ['editor']}
});
config({
'editor/plugin/list-utils/btn': {requires: ['editor','editor/plugin/button','editor/plugin/menubutton']}
});
config({
'editor/plugin/list-utils/cmd': {requires: ['editor','editor/plugin/list-utils']}
});
config({
'editor/plugin/local-storage': {requires: ['editor','overlay','editor/plugin/flash-bridge']}
});
config({
'editor/plugin/maximize': {requires: ['editor','editor/plugin/maximize/cmd']}
});
config({
'editor/plugin/maximize/cmd': {requires: ['editor']}
});
config({
'editor/plugin/menubutton': {requires: ['editor','menubutton']}
});
config({
'editor/plugin/multiple-upload': {requires: ['editor','editor/plugin/dialog-loader']}
});
config({
'editor/plugin/multiple-upload/dialog': {requires: ['editor','component/plugin/drag','editor/plugin/progressbar','editor/plugin/dialog','editor/plugin/flash-bridge','editor/plugin/local-storage','swf']}
});
config({
'editor/plugin/ordered-list': {requires: ['editor','editor/plugin/list-utils/btn','editor/plugin/ordered-list/cmd']}
});
config({
'editor/plugin/ordered-list/cmd': {requires: ['editor','editor/plugin/list-utils/cmd']}
});
config({
'editor/plugin/outdent': {requires: ['editor','editor/plugin/outdent/cmd']}
});
config({
'editor/plugin/outdent/cmd': {requires: ['editor','editor/plugin/dent-cmd']}
});
config({
'editor/plugin/overlay': {requires: ['editor','overlay','editor/plugin/focus-fix']}
});
config({
'editor/plugin/page-break': {requires: ['editor','editor/plugin/fake-objects']}
});
config({
'editor/plugin/remove-format': {requires: ['editor','editor/plugin/remove-format/cmd','editor/plugin/button']}
});
config({
'editor/plugin/remove-format/cmd': {requires: ['editor']}
});
config({
'editor/plugin/resize': {requires: ['editor','dd/base']}
});
config({
'editor/plugin/separator': {requires: ['editor']}
});
config({
'editor/plugin/smiley': {requires: ['editor','editor/plugin/overlay']}
});
config({
'editor/plugin/source-area': {requires: ['editor','editor/plugin/button']}
});
config({
'editor/plugin/strike-through': {requires: ['editor','editor/plugin/font/ui','editor/plugin/strike-through/cmd']}
});
config({
'editor/plugin/strike-through/cmd': {requires: ['editor','editor/plugin/font/cmd']}
});
config({
'editor/plugin/table': {requires: ['editor','editor/plugin/dialog-loader','editor/plugin/contextmenu']}
});
config({
'editor/plugin/table/dialog': {requires: ['editor','editor/plugin/dialog','editor/plugin/menubutton']}
});
config({
'editor/plugin/underline': {requires: ['editor','editor/plugin/font/ui','editor/plugin/underline/cmd']}
});
config({
'editor/plugin/underline/cmd': {requires: ['editor','editor/plugin/font/cmd']}
});
config({
'editor/plugin/undo': {requires: ['editor','editor/plugin/undo/btn','editor/plugin/undo/cmd']}
});
config({
'editor/plugin/undo/btn': {requires: ['editor','editor/plugin/button']}
});
config({
'editor/plugin/undo/cmd': {requires: ['editor']}
});
config({
'editor/plugin/unordered-list': {requires: ['editor','editor/plugin/list-utils/btn','editor/plugin/unordered-list/cmd']}
});
config({
'editor/plugin/unordered-list/cmd': {requires: ['editor','editor/plugin/list-utils/cmd']}
});
config({
'editor/plugin/video': {requires: ['editor','editor/plugin/flash-common/utils','editor/plugin/flash-common/base-class','editor/plugin/fake-objects']}
});
config({
'editor/plugin/video/dialog': {requires: ['editor','editor/plugin/flash/dialog','editor/plugin/menubutton']}
});
config({
'editor/plugin/word-filter': {requires: ['htmlparser']}
});
config({
'editor/plugin/xiami-music': {requires: ['editor','editor/plugin/flash-common/base-class','editor/plugin/flash-common/utils','editor/plugin/fake-objects']}
});
config({
'editor/plugin/xiami-music/dialog': {requires: ['editor','editor/plugin/flash/dialog','editor/plugin/menubutton']}
});

                })(function(c){
                KISSY.config('modules', c);
                },KISSY.Features,KISSY.UA);
            