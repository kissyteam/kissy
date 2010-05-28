/**
 * DataGrid
 * @creator     沉鱼<fool2fish@gmail.com>
 * @depends     kissy-core, yui2-yahoo-dom-event, yui2-connection
 */

/**
 * 1、定制列宽
 * 2、浏览时固定表头
 * 3、自定义选中高亮
 * 4、修改loading
 * 5、及时编辑
 * 6、增删改
 */

KISSY.add("datagrid", function(S) {

    var DOM = S.DOM, Event = S.Event, YDOM = YAHOO.util.Dom,
        doc = document,
        //class前缀
        CLS_PREFIX = 'ks-datagrid-';

    /**
     * DataGrid
     * @constructor
     * @param container 放置表格的容器
     * @param datasource 数据源的uri
     */
    function DataGrid(container, datasource) {

        /**************************************************************************************************************
         * 处理参数
         *************************************************************************************************************/

        var self = this ;

        /**
         * 定义容器
         */
        self.container = S.get(container);
        DOM.addClass(self.container, 'ks-datagrid');

        /**
         *记录数据源uri(只接受json形式的返回数据)
         */
        self._datasourceUri = datasource;

        /**************************************************************************************************************
         * 属性
         *************************************************************************************************************/

        /***************************************************
         * 数据源
         **************************************************/

        /**
         * 定义datasource，指定datasource里各字段的用途
         * 默认值见 DataGrid.datasourceDef
         */
        //self.datasourceDef=null;

        /**
         * 请求数据的方式
         */
        self.connectMethod = 'post';

        /**
         * 记录最近一次查询类请求发送的数据
         */
        //self._latestQueryData='';

        /**
         * 数据源
         */
        //self._liveData=null;

        /**
         * 数据源中的列表数据
         */
        //self._listData=null;

        /***************************************************
         * 表格定义
         **************************************************/

        /**
         * 定义列，用于渲染，如不定义，则自动根据返回数据输出表格
         * 例：
         * columnDef=[
         *      {label:'',xType:COL_EXPAND},
         *      {label:'',xType:COL_CHECKBOX},
         *      {label:'各种可排序列',children:[
         *          {label:'可排序列',sortable:true,field:'index'},
         *          {label:'升序列',sortable:true,field:'age'}
         *      ]},
         *      {label:'字段渲染',children:[
         *          {label:'单一字段',field:'name'},
         *          {label:'复合字段',field:['nickname','homepage'],parser:funtion('nickname','homepage'){...}}
         *      ]},
         *      {label:'',xType:COL_EXTRA,field:[...],parser:function(){...}}
         * ]
         */
        //self.columnDef=null;

        /**
         * 总列数
         */
        //self._columnAmount=null;

        /**
         * 解析columnDef后得到的表头列定义
         */
        //self._theadColDef=null;

        /**
         * 解析columnDef后得到的表身普通列定义
         */
        //self._colDef=null;

        /**
         * 解析columnDef后得到的表身扩展列定义
         */
        //self._colExtraDef=null;

        /**
         * 解析columnDef后得到的选择列定义
         */
        //self._colSelectDef=null;

        /***************************************************
         * 表格元素
         **************************************************/

        /**
         * 表格元素
         */
        self.tableEl = DataGrid.create('<table class="'+ CLS_PREFIX + 'table"></table>',self.container);
        
        /**
         * colgroup元素
         */
        //self._colgroupEl=null;

        /**
         * 表头
         */
        //self._theadEl=null;

        /**
         * 触发排序的th元素集合
         */
        self._sortTrigger = [];

        /**
         * 当前排序的th
         */
        //self._curSortTrigger=null;

        /**
         * 触发全选的元素
         */
        //self._selectAllTrigger=null;

        /**
         * tbody
         */
        //self._tbodyEl=null;

        /**
         * tbody的行元素集合
         */
        self._rowElArr = [];

        /**
         * 显示loading状态的元素
         */
        self._loadingEl = DataGrid.create('<div class="ks-datagrid-loading" style="display:none;"><div class="ks-datagrid-loading-mask"></div><div class="ks-datagrid-loading-icon"></div></div>');
        S.ready(function(){doc.body.appendChild(self._loadingEl);});

        /***************************************************
         * 翻页
         **************************************************/

        /**
         * 翻页设置
         * 默认值见 DataGrid.paginationDef
         */
        //self.paginationDef=null;

        /**
         * 翻页元素
         */
        //self._paginationEl=null;
    }

    S.augment(DataGrid, S.EventTarget);

    S.mix(DataGrid, {

        /**
         * 将给定的字符串转换成DOM元素，并append到指定的context中
         * @param str
         * @param context
         * @return 转换得到的DOM元素
         */
        create:function(str, context) {
            str = S.trim(str);
            var tagName = getLeadingTagName(str);
            if (!tagName) {
                alert('Illegal input in function "DataGrid.create" .');
                return null;
            }
            tagName = ' ' + tagName + ' ';
            var CLS_WRAPPER = 'ks-datagrid-wrapper',
                tag1 = ' colgroup thead tbody tfoot ',
                tag2 = ' th td ',
                prefix = '<div class="' + CLS_WRAPPER + '">',
                suffix = '</div>';
            if (tag1.indexOf(tagName) > -1) {
                prefix = '<table class="' + CLS_WRAPPER + '">';
                suffix = '</table>';
            } else if (tag2.indexOf(tagName) > -1) {
                prefix = '<table><tr class="' + CLS_WRAPPER + '">';
                suffix = '</tr></table>';
            //tr元素一定要放到tbody里，否则浏览器会自动给tr外面加个tbody
            } else if(tagName == ' tr '){
                prefix = '<table><tbody class="' + CLS_WRAPPER + '">';
                suffix = '</tbody></table>';
            }else if(tagName == ' col '){
                prefix = '<table><colgroup class="' + CLS_WRAPPER + '">';
                suffix = '</colgroup></table>';
            }
            var box = doc.createElement('div');
            box.innerHTML = prefix + str + suffix;
            var wrapper = S.get('.' + CLS_WRAPPER, box);
            /**
             * 当使用文档碎片时，返回的对象会指向该文档碎片，而不是里面真正的元素，故暂只考虑一个最高层元素的情况
             */
            var el = wrapper.firstChild;
            if (context) context.appendChild(el);
            return el;
        },
        /**
         * 获取查询字符串中指定key的值，如果没有则返回null
         * @param queryString
         * @param key
         */
        getQueryParamValue:function(queryString, key) {
            var result = queryString.match(new RegExp('(?:^|&)' + key + '=(.*?)(?=$|&)'));
            return result && result[1];
        },

        /**
         * 将查询字符串指定key的值换成新值
         * @param queryString
         * @param key
         * @param newValue
         */
        setQueryParamValue:function(queryString, key, newValue) {
              var newParam = key + '=' + newValue;
              if (!queryString) return newParam;

              var replaced = false;
              var params = queryString.split('&');
              for (var i = 0; i < params.length; i++) {
                if (params[i].split('=')[0] == key) {
                  params[i] = newParam;
                  replaced = true;
                }
              }
              if (replaced) return params.join('&');
              return queryString + '&' + newParam;
         },

        //数据源默认定义
        datasourceDef:{
            success:'success',
            listData:'dataList',
            info:'info',
            dataStart:'start',
            dataLimit:'limit',
            dataAmount:'total',
            sortType:'sorttype',
            sortBy:'sortby'
        },

        //表格定义
        datatableDef:{
            fixThead:false,
            sortBy:1
        },

        //翻页默认定义
        paginationDef:{
            dataLimit:20,
            pageNumLength:5,
            position:'bottom'
        }
        
    });

    /**
     * 获取一段HTML字符串前导标签的标签名
     * @param str
     */
    function getLeadingTagName(str) {
        var m = str.match(/^\s*<(\w+)/);
        if (m) {
            return m[1].toLowerCase();
        } else {
            return null;
        }
    }

    S.DataGrid = DataGrid;
});
