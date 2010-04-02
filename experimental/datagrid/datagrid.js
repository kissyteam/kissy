/**
 * DataGrid
 * @creator     沉鱼<fool2fish@gmail.com>
 * @depends     yahoo-dom-event, kissy-core
 */

/**
 * DataGrid功能点：
 * 1、数据源
 * 2、定义表头
 * 3  定义列
 * 4、用户自定义显示列
 * 5、增删改
 * 6、其他单条操作
 * 7、其他批量操作
 * 8、单选、多选、全选、反选功能
 * 9、服务器端翻页
 * 10、服务器端排序
 * 11、条目展开
 * 12、高亮某行代码
 */

KISSY.add("datagrid", function(S) {

    var Y = YAHOO.util, Dom = Y.Dom, Lang = YAHOO.lang,
        doc=document,

        ; 

    /**
     * DataGrid
     * @constructor
     */
    function DataGrid(container,datasourceUri,config){
        var self=this;
         /**
         * the container of widget
         * @type HTMLElement
         */
        this.container=S.get(container);
        this.dataList=dataList;
    }

    S.mix(DataGrid.prototype,{
        _preTbodyEl:null,
        _curTbodyEl:null,
        _selectType:null,
        datasouceShema:null,
        tableEl:null,
        /**
         * theadDef=[
         *      [
         *          {label:''},
         *          {label:'name',colspan:2},
         *          {label:''}
         *      ]，
         *      [
         *          {label:}
         *          {label:'index'},
         *          {label:'realname'},
         *          {label:'nickname'},
         *          {label:'homepage'}
         *      ]
         * ]
         */
        theadDef:null,
        /**
         * columnDef=[
         *      {field:'idx'},
         *      {field:'realname'},
         *      {field:'nickname'},
         *      {field:['pagename','pageurl'],render:function(field){...]}
         *      {coltype:COL_EXTRA}
         * ]
         */
        columnDef:null,
        /**
         * fieldDef={
         *      index:{},
         *      realname:{},
         *      nickname:{},
         *      pagename:{},
         *      pageurl:{}
         * }
         */
        fieldDef:null,
        paginationEl:null,
        init:function(){
            
        },
        rowStyleRender:function(){},
        renderThead:function(){},
        renderTbody:function(){},
        renderPagenation:function(){},
        update:function(){},
        append:function(){},
        addRecord:function(){},
        modifyRecord:function(){},
        deleteRecord:function(){},
        moveRecord:function(){},
        select:function(){},
        selectAll:function(){},
        deselectAll:function(){},
        selectInverse:function(){},
        getSelectedRecord:function(){}
    });

    DataGrid.Config={
        
    };

    /**
     * 获取一段HTML字符串前导标签的标签名
     * @param str
     */
    function getLeadingTagName(str){
        var m = str.match(/^\s*<(\w+)/);
        if(m){
            return m[1].toLowerCase();
        }else{
            alert('your html string is illegal.');
            return null;
        }
    }

    /**
     * 将一段HTML字符串转换成DOM元素，并返回该元素
     * @param str
     */
    function convertStrToEl(str){
        var tagName=getLeadingTagName(str);
        if(!tagName){
            alert('Your html string is illegal.');
            return;
        }
        var tableElPresuffix={pre:'<table class="wrapper">',suf:'</table>'};
        var tagPresuffix={
            colgroup:tableElPresuffix,
            thead:tableElPresuffix,
            tbody:tableElPresuffix,
            tr:tableElPresuffix,
            th:{pre:'<table><tr class="wrapper">',suf:'</tr></table>'},
            td:{pre:'<table><tr class="wrapper">',suf:'</tr></table>'},
            tfoot:tableElPresuffix
        };
        if(!tagPresuffix[tagName]) tagPresuffix[tagName]={pre:'<div class="wrapper">',suf:'</div>'};
        var tempNode=document.createElement('div');
            tempNode.innerHTML=tagPresuffix[tagName].pre + str + tagPresuffix[tagName].suf;
        var wrapper=Dom.getElementsByClassName('wrapper','*',tempNode)[0];
        var docFragment=document.createDocumentFragment();
        while(Dom.getFirstChild(wrapper)){
            docFragment.appendChild(Dom.getFirstChild(wrapper));    
        }
        return docFragment;
    }

    S.DataGrid = DataGrid;
});
