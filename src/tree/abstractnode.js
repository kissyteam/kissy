/**
 * abstraction of tree node ,root and other node will extend it
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/abstractnode", function(S, UIBase, Component) {

    UIBase.create(Component.ModelControl,{
        
    },{
        ATTRS:{
            /**
             * 节点字内容
             * @type String
             */
            content:{view:true},
            /**
             * 是否选中
             * @type Boolean
             */
            selected:{view:true},
            /**
             * html title
             * @type String
             */
            tooltip:{view:true},

            /**
             * depth of node
             */
            depth:{view:true}
        }
    });

}, {
    requires:['uibase','component']
});