/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:19
*/
/**
 * Add ul/ol button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/ordered-list", function (S, Editor, ListButton, ListCmd) {

    function orderedList() {
    }

    S.augment(orderedList, {
        pluginRenderUI: function (editor) {
            ListCmd.init(editor);

            ListButton.init(editor, {
                cmdType: "insertOrderedList",
                buttonId: 'orderedList',
                menu: {
                    width: 75,
                    children: [
                        {
                            content: '1,2,3...',
                            value: 'decimal'
                        },
                        {
                            content: 'a,b,c...',
                            value: 'lower-alpha'
                        },
                        {
                            content: 'A,B,C...',
                            value: 'upper-alpha'
                        },
                        // ie 678 not support!
//                        {
//                            content: 'α,β,γ...',
//                            value: 'lower-greek'
//                        },
//
//                        {
//                            content: 'Α,Β,Γ...',
//                            value: 'upper-greek'
//                        },

                        {
                            content: 'i,ii,iii...',
                            value: 'lower-roman'
                        },

                        {
                            content: 'I,II,III...',
                            value: 'upper-roman'
                        }
                    ]
                },
                tooltip: '有序列表'
            });
        }
    });

    return orderedList;
}, {
    requires: ['editor', './list-utils/btn', './ordered-list/cmd']
});
