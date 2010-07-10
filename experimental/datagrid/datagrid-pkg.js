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
         * 表格本身的定义
         * 默认值见 Datagrid.datagridDef
         */
        //self.datagridDef=null;

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

        /**
         * 用户是否自定义列宽
         */
        //self._defColWidth = false;

        /***************************************************
         * 表格元素
         **************************************************/

        /**
         * 表格元素
         */
        self._tableEl = DataGrid.create('<table class="'+ CLS_PREFIX + 'table"></table>',self.container);
        
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
                prefix = '<table><tbody><tr class="' + CLS_WRAPPER + '">';
                suffix = '</tr></tbody></table>';
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

        //表格本身的默认定义
        datagridDef:{
            fixThead:false,
            customizeCol:false
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
/**
 * DataGrid Render
 * @creator     沉鱼<fool2fish@gmail.com>
 * @depends     kissy-core, yui2-yahoo-dom-event, yui2-connection
 */

KISSY.add("datagrid-render", function(S) {

    var DOM = S.DOM, Event = S.Event, YDOM = YAHOO.util.Dom, YConnect=YAHOO.util.Connect,
        doc = document,

        DataGrid = S.DataGrid,
        create = DataGrid.create,

        //特殊列的类型
        COL_CHECKBOX = 'COL_CHECKBOX', COL_RADIO = 'COL_RADIO', COL_EXTRA = 'COL_EXTRA',
        //解析columnDef时要用到的三个内部属性
        KS_DEPTH = 'KSDepth', KS_FATHER_IDX = 'KSFatherIdx', KS_CHILDREN_AMOUNT = 'KSChildrenAmount',

        //class前缀
        CLS_PREFIX = 'ks-datagrid-',
        //行class
        CLS_ROW = CLS_PREFIX + 'row', CLS_ROW_EXTRA = CLS_PREFIX + 'row-extra', CLS_ROW_SELECTED = CLS_PREFIX + 'row-selected', CLS_ROW_EXPANDED = CLS_PREFIX + 'row-expanded',

        //特殊单元格class
        CLS_CELL_EXTRA = CLS_PREFIX + 'cell-extra',
        //排序单元格class
        CLS_SORTABLE = CLS_PREFIX + 'cell-sortable', CLS_SORT_DESC = CLS_PREFIX + 'cell-desc', CLS_SORT_ASC = CLS_PREFIX + 'cell-asc',
        //特殊icon的class
        CLS_ICON_EXPAND = CLS_PREFIX + 'icon-expand', CLS_ICON_CHECKBOX = CLS_PREFIX + 'icon-checkbox', CLS_ICON_RADIO = CLS_PREFIX + 'icon-radio',CLS_ICON_HOLDER= CLS_PREFIX + 'icon-holder',

        //行索引，可排序th的排序字段
        ATTR_ROW_IDX = 'data-list-idx',ATTR_SORT_FIELD = 'data-sort-field',

        //自定义事件
        EVENT_RENDER_ROW = 'renderRow' , EVENT_RENDER_ROW_EXTRA = 'renderRowExtra', EVENT_GET_DATA = 'getData',EVENT_RENDER_THEAD='renderThead';

    S.augment(S.DataGrid, {

        /**
         * 渲染表格，如果无postData则仅渲染表头等附加元素
         * @param postData
         */
        render:function(postData) {
            var self = this ;
            self.datagridDef = S.merge(DataGrid.datagridDef, self.datagridDef || {});
            self.datasourceDef = S.merge(DataGrid.datasourceDef, self.datasourceDef || {});
            //激活翻页功能
            if (self.paginationDef) {
                self.paginationDef = S.merge(DataGrid.paginationDef, self.paginationDef);
                self._renderPagination();
            }
            self.update(postData);
        },

        /**
         * 更新表格数据，postData必填，如果不需要任何参数也需要传递空字符串，否则更新不会执行
         * @param postData
         */
        update:function(postData) {
            var self = this ;

            function parseColumnDefCallback(theadColDef, colDef, colExtraDef, colSelectDef) {
                self._parseColumnDefPreProcessor(theadColDef, colDef, colExtraDef, colSelectDef);
                self._renderColgroup();
                self._renderThead();
                if (self._listData) self._renderTbody();
                self._endLoading();
                //激活排序
                if (self._sortTrigger.length > 0) self._activateRowSort();
                //激活扩展功能
                if (colExtraDef) self._activateRowExpand();
                //选择行功能
                if (colSelectDef) self._activateRowSelect();
                //固定表头
                if(self.datagridDef.fixThead) self._activateFixThead();                
            }

            if (postData == undefined) {
                if (self.columnDef && !self._colDef) {
                    //如果有列定义但未解析，则单纯解析列定义
                    parseColumnDefToFlat(self.columnDef, null, parseColumnDefCallback, self);
                }
                return;
            }
            self._startLoading();
            var paginationDef = this.paginationDef ;
            //如果进行了翻页定义，但postData中未指定dataLimit，则更新postData
            if (paginationDef && !DataGrid.getQueryParamValue(postData, paginationDef.dataLimit)) {
                postData = DataGrid.setQueryParamValue(postData, this.datasourceDef.dataLimit, paginationDef.dataLimit);
            }
            var callback = {
                success:function(o) {
                    var self = this ;
                    self._dataPreProcessor(o);
                    self.fire(EVENT_GET_DATA, {liveData:self._liveData});
                    //如果请求成功，且返回数据正确
                    if (self._requestResult) {
                        var listData = self._listData;
                        //如果无列定义且返回了列表数据，则根据返回数据自动生成列定义,并手工解析
                        if ((!self.columnDef) && listData && listData.length > 0) {
                            self.columnDef = [];
                            for (var i in listData[0]) {
                                self.columnDef.push({label:i,field:i});
                            }
                        }
                        //如果列定义没被解析过
                        if (!self._colDef) {
                            //解析columnDef，成功后开始初始化界面
                            parseColumnDefToFlat(self.columnDef, null, parseColumnDefCallback, self);
                            //如果列定义被解析过
                        } else {
                            if (listData) self._renderTbody();
                            self._endLoading();
                        }
                        //保存最近一次的查询参数
                        self._latestQueryData = postData;
                        //更新页码
                        if (self.paginationDef) self._updatePagination();
                        //取消全选
                        DOM.removeClass( self._theadEl.getElementsByTagName('tr')[0] , CLS_ROW_SELECTED )
                    } else {
                        self._endLoading();
                    }
                },
                failure:function() {
                    alert('error:获取数据失败，请刷新页面重试或联系管理员。');
                    this._endLoading();
                },
                scope:self
            };
            YConnect.asyncRequest(this.connectMethod, this._datasourceUri, callback, postData);
        },

        //每次异步请求返回值的基本处理
        _dataPreProcessor:function(o) {
            var self = this ;
            try {
                self._liveData = eval('(' + o.responseText + ')');
            } catch(e) {
                alert('error：请返回JSON格式的数据。');
                self._endLoading();
                return;
            }
            var datasourceDef = self.datasourceDef ;
            self._requestResult = self._liveData[datasourceDef.success];
            if (self._requestResult) {
                self._listData = self._liveData[datasourceDef.listData];
            }
        },

        //每次解析完columnDef之后的基本处理
        _parseColumnDefPreProcessor:function(theadColDef, colDef, colExtraDef, colSelectDef) {
            var self = this ;
            self._theadColDef = theadColDef;
            self._colDef = colDef;
            self._colExtraDef = colExtraDef;
            self._colSelectDef = colSelectDef;
            self._columnAmount = colDef.length;
            if (colExtraDef) self._columnAmount++;
            if (colSelectDef) self._columnAmount++;
        },

        //显示loading状态
        _startLoading:function() {
            var self = this , container = self.container, loadingEl = self._loadingEl;            
            loadingEl.style.left = YDOM.getX(container) +'px';
            loadingEl.style.top = YDOM.getY(container) +'px';
            loadingEl.style.width = container.offsetWidth +'px';
            loadingEl.style.height = container.offsetHeight+'px'; //很奇怪，使用YDOM.getStyle无法获得ie下正确的值
            loadingEl.style.display = '';
        },

        //隐藏loading状态
        _endLoading:function() {
           this._loadingEl.style.display = 'none';
        },

        //渲染colgroup，并附加到表格元素内
        _renderColgroup:function() {
            var self = this ,
                colgroupEl = doc.createElement('colgroup');
            if (self._colExtraDef) {
                create('<col width="25" />', colgroupEl);
            }
            if (self._colSelectDef) {
                create('<col width="25" />', colgroupEl);
            }
            var colDef = self._colDef;
            for (var i = 0 , len = colDef.length; i < len; i++) {
                var col = create('<col />', colgroupEl);
                if (colDef[i].width){
                    col.width = colDef[i].width;
                    self._defColWidth = true;
                }
            }
            if (self._colgroupEl) self._tableEl.removeChild(self._colgroupEl);
            self._colgroupEl = colgroupEl;
            self._tableEl.appendChild(self._colgroupEl);
        },

        //渲染表头普通单元格
        _renderTheadCell:function(cellDef) {
            var cell = create('<th></th>');
            //如果无子th
            if (cellDef[KS_CHILDREN_AMOUNT] == 0) {
                if (cellDef.sortable) {
                    cell.className = CLS_SORTABLE;
                    cell.setAttribute(ATTR_SORT_FIELD, cellDef.field);
                    cell.innerHTML = '<i class="'+CLS_PREFIX+'icon"></i>';
                    this._sortTrigger.push(cell);
                }
                if(cellDef.width) cell.width = cellDef.width;
                //如果有子th
            } else {
                cell.colSpan = cellDef[KS_CHILDREN_AMOUNT];
            }
            //文字标签
            if (cellDef.label) cell.innerHTML = cellDef.label + cell.innerHTML;
            return cell;
        },

        //渲染表头扩展列单元格
        _renderTheadCellExpand:function() {
            return create('<th class="'+CLS_CELL_EXTRA+'"><i class="'+CLS_ICON_HOLDER+'"></i></th>');
        },

        //渲染表格选择列单元格
        _renderTheadCellSelect:function(selectDef) {
            var cell = create('<th class="'+CLS_CELL_EXTRA+'"></th>');
            if (selectDef.xType == COL_CHECKBOX){
                this._selectAllTrigger = create('<i class="'+CLS_ICON_CHECKBOX+'"></i>', cell);
            }else{
                create('<i class="'+CLS_ICON_HOLDER+'"></i>', cell);
            }
            return cell;
        },

        //渲染表头
        _renderThead:function() {
            var self = this,
                theadColDef = this._theadColDef,
                theadEl = doc.createElement('thead'),
                depth = theadColDef.length;
            for (var i = 0 , ilen = theadColDef.length; i < ilen; i++) {
                var row = create('<tr class="'+ CLS_ROW +'"></tr>');        
                //扩展按钮列
                if (i == 0) {
                    if (self._colExtraDef) {
                        var theadCellExpand = self._renderTheadCellExpand();
                        theadCellExpand.rowSpan = ilen;
                        row.appendChild(theadCellExpand);
                    }
                    if (self._colSelectDef) {
                        var theadCellSelect = self._renderTheadCellSelect(self._colSelectDef);
                        theadCellSelect.rowSpan = ilen;
                        row.appendChild(theadCellSelect);
                    }
                }
                //普通列
                for (var j = 0 , jlen = theadColDef[i].length; j < jlen; j++) {
                    var cellDef = theadColDef[i][j];
                    if (cellDef[KS_DEPTH] != i) continue;
                    var cell = self._renderTheadCell(cellDef);
                    if (cellDef[KS_CHILDREN_AMOUNT] == 0 && depth - 1 > i) cell.rowSpan = depth - i;
                    row.appendChild(cell);
                }
                theadEl.appendChild(row);
            }
            if (self._theadEl) self._tableEl.removeChild(self._theadEl);
            self._theadEl = theadEl;
            self._tableEl.appendChild(self._theadEl);
            self.fire(EVENT_RENDER_THEAD);
        },

        //渲染单元格
        _renderCell:function(cellDef, recordData) {
            var cell = doc.createElement('td'),
                fieldArr = [], valueArr = [];
            if(cellDef.field) fieldArr = fieldArr.concat(cellDef.field);
            for(var i = 0,len=fieldArr.length;i<len;i++){
                valueArr.push(recordData[fieldArr[i]]);
            }
            appendChild(cell,cellDef.parser ? cellDef.parser.apply(window, valueArr) : valueArr.join(' '));
            return cell;
        },

        //渲染展开按钮单元格
        _renderCellExpand:function() {
            return create('<td class="'+ CLS_CELL_EXTRA + '"><i class="' + CLS_ICON_EXPAND + '"></i></td>');
        },

        //渲染选择单元格
        _renderCellSelect:function(selectDef) {
            if (selectDef.xType == COL_CHECKBOX) {
                var inner = '<i class="' + CLS_ICON_CHECKBOX + '"></i>';
            } else if (selectDef.xType == COL_RADIO) {
                var inner = '<i class="' + CLS_ICON_RADIO + '"></i>';
            }
            return create('<td class="' + CLS_CELL_EXTRA + '">'+ inner +'</td>');
        },

        //渲染标准行
        _renderRow:function(recordData) {
            var self = this, colDef = self._colDef;
            var row = create('<tr class="'+ CLS_ROW +'"></tr>');
            //扩展按钮
            if (self._colExtraDef) row.appendChild(self._renderCellExpand());
            //复选或者单选按钮
            if (self._colSelectDef) row.appendChild(self._renderCellSelect(self._colSelectDef));
            for (var i = 0 , len = colDef.length; i < len; i++) {
                row.appendChild(self._renderCell(colDef[i], recordData));
            }
            self.fire(EVENT_RENDER_ROW, { row : row , recordData : recordData });
            return row;
        },

        //渲染扩展列（扩展列的内容放到一个行里展示）
        _renderRowExtra:function(recordData) {
            var self = this ;
            var row = create('<tr class="'+ CLS_ROW_EXTRA + '"></tr>'),
                colSpan = self._columnAmount;
            if (self._colExtraDef) {
                create('<td class="'+ CLS_CELL_EXTRA +'"></td>',row);
                colSpan--;
            }
            if (self._colSelectDef) {
                create('<td class="'+ CLS_CELL_EXTRA +'"></td>', row);
                colSpan--;
            }
            var cell = self._renderCell(self._colExtraDef, recordData);
            cell.colSpan = colSpan;
            row.appendChild(cell);
            self.fire(EVENT_RENDER_ROW_EXTRA, { row : row , recordData : recordData });
            return row;
        },

        //渲染表格本身
        _renderTbody:function() {
            var self = this;
            self._rowElArr = [];
            var listData = self._listData;
            var tbodyEl = doc.createElement('tbody');
            for (var i = 0 , len = listData.length; i < len; i++) {
                var row = self._renderRow(listData[i]);
                row.setAttribute(ATTR_ROW_IDX, i);
                self._rowElArr.push(row);
                tbodyEl.appendChild(row);
                if (self._colExtraDef && self._colExtraDef.expand) {
                    var rowExtra = self._renderRowExtra(listData[i]);
                    rowExtra.setAttribute(ATTR_ROW_IDX, i);
                    tbodyEl.appendChild(rowExtra);
                    DOM.addClass(row, CLS_ROW_EXPANDED);
                    DOM.addClass(rowExtra, CLS_ROW_EXPANDED);
                }
            }
            if (self._tbodyEl) self._tableEl.removeChild(self._tbodyEl);
            self._tbodyEl = tbodyEl;
            self._tableEl.appendChild(self._tbodyEl);
        }
    });

    /**
     * 将columnDef的树形结构展开成二维数组结构
     * @param columnDef 表格的列设定
     * @param childrenKey 指向子列的key
     * @param callback 解析后的回调函数
     * @param callbackObj 回调函数中的this指向的对象
     */
    function parseColumnDefToFlat(columnDef, childrenKey, callback, callbackObj) {
        childrenKey = childrenKey || 'children';
        //解析后的表头定义
        var theadColDef = [],
            //解析后的列定义
                colDef = [],
            //额外列定义
                colExtraDef = null,
            //定义选择列的方式
                colSelectDef = null,
            //定义树深度
                depth = 1;


        //过滤列定义中的特殊列设定，要求特殊列设定全部要在最高层级设置
        function filterColDef(columnDef) {
            var colDef = [];
            for (var i = 0 , len = columnDef.length; i < len; i++) {
                //如果是扩展按钮列
                if (columnDef[i].xType == COL_EXTRA) {
                    colExtraDef = columnDef[i];
                //如果是选择列（包括单选跟多选）
                } else if (columnDef[i].xType == COL_CHECKBOX || columnDef[i].xType == COL_RADIO) {
                    colSelectDef = columnDef[i];
                } else {
                    colDef.push(columnDef[i]);
                }
            }
            return colDef;
        }

        //得到过滤掉特殊列设定的列设定
        var pureColDef = filterColDef(columnDef);

        //判断tree是否有子树
        function ifTreeHasChildren(tree) {
            for (var i = 0, len = tree.length; i < len; i++) {
                if (tree[i][childrenKey] && tree[i][childrenKey].length > 0) {
                    return true;
                }
            }
            return false;
        }

        //更新当前节点所有父节点的childrenAmount值（子节点数）
        function updateFathersChildrenAmount(subTree) {
            var step = subTree[childrenKey].length - 1;
            var curTree = subTree;
            var curDepth = subTree[KS_DEPTH];
            while (curDepth > 0) {
                var fatherTree = theadColDef[curDepth - 1][curTree[KS_FATHER_IDX]];
                fatherTree[KS_CHILDREN_AMOUNT] = fatherTree[KS_CHILDREN_AMOUNT] + step;
                curTree = fatherTree;
                curDepth = fatherTree[KS_DEPTH];
            }
        }

        //转换树
        function parse(tree) {
            //判定子树情况
            var treeHasChildren = ifTreeHasChildren(tree);
            //定义子树
            var subTree = [];
            theadColDef[depth - 1] = [];
            for (var i = 0,ilen = tree.length; i < ilen; i++) {
                /* 如果tree[i][KS_DEPTH]不存在，则记录tree[i]的真正深度
                 * 这里要做判定是因为如果在当前层级的tree有子节点的情况下
                 * tree[i]刚好没有子节点了，那么，会把tree[i]当做tree[i]下一层级的子节点
                 * 这样的话，确保得到的theadDef的最后一个元素（数组）为colDef
                 */
                if (tree[i][KS_DEPTH] == undefined) tree[i][KS_DEPTH] = depth - 1;
                //jitree[i]添加到theadColDef[depth-1]数组中去
                theadColDef[depth - 1].push(tree[i]);
                //如果tree有子树且tree[i]有子树
                if (treeHasChildren) {
                    if (tree[i][childrenKey]) {
                        //记录tree[i]的子元素数
                        tree[i][KS_CHILDREN_AMOUNT] = tree[i][childrenKey].length;
                        for (var j = 0,jlen = tree[i][childrenKey].length; j < jlen; j++) {
                            //在tree[i]子节点中记录tree[i]所在二维子数组的索引
                            tree[i][childrenKey][j][KS_FATHER_IDX] = i;
                            //将所有同一层级的tree[i]子节点放到一个数组
                            subTree.push(tree[i][childrenKey][j]);
                        }
                        updateFathersChildrenAmount(tree[i]);
                    } else {
                        tree[i][KS_CHILDREN_AMOUNT] = 0;
                        subTree.push(tree[i]);
                    }
                    //如果无子树
                } else {
                    tree[i][KS_CHILDREN_AMOUNT] = 0;
                }
            }
            depth++;
            if (subTree.length > 0) {
                arguments.callee(subTree);
            } else {
                colDef = theadColDef[theadColDef.length - 1];
                if (callback) callback.call(callbackObj || window, theadColDef, colDef, colExtraDef, colSelectDef);
            }
        }

        parse(pureColDef);
    }

    /**
     * 将指定子元素添加到父元素中去
     */
    function appendChild(father, child) {
        if (father == undefined || child == undefined) return;
        if (typeof child == 'string') {
            father.innerHTML = father.innerHTML + child;
        } else {
            father.appendChild(child);
        }
    }

    ;
});/**
 * DataGrid Pagination
 * @creator     沉鱼<fool2fish@gmail.com>
 * @depends     kissy-core, yui2-yahoo-dom-event, yui2-connection
 */

KISSY.add("datagrid-pagination", function(S) {

    var DOM = S.DOM, Event = S.Event, YDOM = YAHOO.util.Dom,
        DataGrid = S.DataGrid,
        create = DataGrid.create,
        CLS_PAGE_PREFIX = 'ks-pagination-';

    S.augment(S.DataGrid, {
        
        //渲染翻页
        _renderPagination:function() {
            var self = this;
            var paginationEl = create('<div class="ks-bar"></div>');
            var paginationBox = create('<div class="ks-pagination"></div>',paginationEl);
            var wrapperEl = create('<div class="' + CLS_PAGE_PREFIX + 'wrapper"></div>', paginationBox);
            self._pageInfoEl = create('<span class="' + CLS_PAGE_PREFIX + 'info"></span>',wrapperEl);
            self._pageStartEl = create('<a class="' + CLS_PAGE_PREFIX + 'start">首页</a>',wrapperEl);
            self._pageStartDisabledEl = create('<span class="' + CLS_PAGE_PREFIX + 'start">首页</span>', wrapperEl);
            self._pagePrevEl = create('<a class="' + CLS_PAGE_PREFIX + 'prev">上一页</a>', wrapperEl);
            self._pagePrevDisabledEl = create('<span class="' + CLS_PAGE_PREFIX + 'prev">上一页</span>', wrapperEl);
            self._curPageNumEl = create('<span class="' + CLS_PAGE_PREFIX + 'page">1</span>', wrapperEl);
            self._pageNumElArr = [];
            for (var i = 0 , len = self.paginationDef.pageNumLength; i < len; i++) {
                var pageNumEl = create('<a class="' + CLS_PAGE_PREFIX + 'page" ks-data-page-idx="'+i+'"></a>', wrapperEl);
                this._pageNumElArr.push(pageNumEl);
            }
            self._pageNextEl = create('<a class="' + CLS_PAGE_PREFIX + 'next">下一页</a>', wrapperEl);
            self._pageNextDisabledEl = create('<span class="' + CLS_PAGE_PREFIX + 'next">下一页</span>', wrapperEl);
            self._pageEndEl = create('<a class="' + CLS_PAGE_PREFIX + 'end">末页</a>', wrapperEl);
            self._pageEndDisabledEl = create('<span class="' + CLS_PAGE_PREFIX + 'end">末页</span>', wrapperEl);
            self._pageSkipEl = create('<span class="' + CLS_PAGE_PREFIX + 'skip">到第<input type="text" class="' + CLS_PAGE_PREFIX + 'skip-to"/>页<button type="button" class="' + CLS_PAGE_PREFIX + 'skip-button">确定</button><span>', wrapperEl);
            self._pageSkipInputEl = self._pageSkipEl.getElementsByTagName('input')[0];
            self._pageSkipBtnEl = self._pageSkipEl.getElementsByTagName('button')[0];

            var curLimit = self.paginationDef.dataLimit, defaultOptionStr = '';
            if( curLimit%20 || curLimit>80) defaultOptionStr='<option value="'+curLimit+'">'+curLimit+'</option>';
            
            self._dataLimitEl = create('<span class="' + CLS_PAGE_PREFIX + 'data-limit">每页<select value="'+curLimit+'">'+ defaultOptionStr + '<option value="20">20</option><option value="40">40</option><option value="60">60</option><option value="80">80</option></select>条<span>', wrapperEl);
            self._dataLimitSetEl = self._dataLimitEl.getElementsByTagName('select')[0];

            if (self.paginationDef.position == 'bottom') {
                YDOM.insertAfter(paginationEl, self._tableEl);
            } else {
                YDOM.insertBefore(paginationEl, self._tableEl);
            }
            self._paginationEl = paginationEl;

            function pageTurning() {
                var t = this ;
                var queryData = self._latestQueryData,
                    datasourceDef = self.datasourceDef,
                    dataStart = parseInt(DataGrid.getQueryParamValue(queryData, self.datasourceDef.dataStart) || 0, 10),
                    dataLimit = parseInt(DataGrid.getQueryParamValue(queryData, self.datasourceDef.dataLimit), 10),
                    dataAmount = parseInt(self._liveData[datasourceDef.dataAmount], 10),
                    totalPageNumLength = Math.ceil(dataAmount / dataLimit);
                if (t == self._pageStartEl) {
                    dataStart = '0';
                } else if (t == self._pagePrevEl) {
                    dataStart -= dataLimit;
                } else if (t == self._pageNextEl) {
                    dataStart += dataLimit;
                } else if (t == self._pageEndEl) {
                    dataStart = ( totalPageNumLength - 1 ) * dataLimit;
                } else if (t == self._pageSkipBtnEl) {
                    var skipTo = Math.min(parseInt(self._pageSkipInputEl.value, 10) || 1, totalPageNumLength);
                    self._pageSkipInputEl.value = skipTo;
                    dataStart = ( skipTo - 1 ) * dataLimit;
                } else {
                    dataStart = ( t.innerHTML - 1 ) * dataLimit;
                }
                var postData = DataGrid.setQueryParamValue(queryData, datasourceDef.dataStart, dataStart);
                self.update(postData);
            }

            var pageTurningTrigger = self._pageNumElArr.concat(self._pageStartEl, self._pagePrevEl, self._pageNextEl, self._pageEndEl) ;
            hide.apply(window, pageTurningTrigger);
            hide(self._pageSkipEl, self._dataLimitEl);
            Event.on(pageTurningTrigger, 'click', pageTurning);
            Event.on(self._pageSkipBtnEl, 'click', pageTurning);
            Event.on(self._dataLimitSetEl, 'change', function() {
                if (!self._listData) return;
                var t = this;
                self.paginationDef.dataLimit = t.value;
                self.update(self._latestQueryData);
            });
        },
        //更新翻页
        _updatePagination:function() {
            var self = this,
                queryData = self._latestQueryData,
                dataStart = parseInt(DataGrid.getQueryParamValue(queryData, self.datasourceDef.dataStart) || 0, 10),
                dataLimit = parseInt(DataGrid.getQueryParamValue(queryData, self.datasourceDef.dataLimit), 10),
                dataAmount = parseInt(self._liveData[self.datasourceDef.dataAmount], 10),
                pageNumLength = self.paginationDef.pageNumLength,
                totalPageNumLength = Math.ceil(dataAmount / dataLimit);

            show(self._pageSkipEl);
            show(self._dataLimitEl);
            //显示记录总条数
            self._pageInfoEl.innerHTML = '共'+ totalPageNumLength + '页/'+ dataAmount +'条 ';
            //判定上一页状态
            if (dataStart) {
                show(self._pageStartEl, self._pagePrevEl);
                hide(self._pageStartDisabledEl, self._pagePrevDisabledEl);
            } else {
                hide(self._pageStartEl, self._pagePrevEl);
                show(self._pageStartDisabledEl, self._pagePrevDisabledEl);
            }
            //判定下一页状态
            if (dataStart + dataLimit >= dataAmount) {
                hide(self._pageNextEl, self._pageEndEl);
                show(self._pageNextDisabledEl, self._pageEndDisabledEl);
            } else {
                show(self._pageNextEl, self._pageEndEl);
                hide(self._pageNextDisabledEl, self._pageEndDisabledEl);
            }
            //显示当前页
            var curPageNum = Math.ceil(dataStart / dataLimit) + 1;
            self._curPageNumEl.innerHTML = curPageNum;
            //当前页码在页码中的位置
            var curPageIdx = Math.floor(Math.min(totalPageNumLength, pageNumLength) / 2);
            //基础页码（基础页码+页码序号=真正的页码）
            var basicPageNum = 0;
            if (curPageNum - curPageIdx <= 0) {
                curPageIdx = curPageNum - 1;
            } else if (curPageNum > totalPageNumLength - Math.min(totalPageNumLength, pageNumLength) + curPageIdx + 1) {
                curPageIdx = curPageNum - ( totalPageNumLength - Math.min(totalPageNumLength, pageNumLength));
                basicPageNum = totalPageNumLength - Math.min(totalPageNumLength, pageNumLength);
            } else {
                basicPageNum = curPageNum - curPageIdx - 1;
            }
            //渲染页码
            for (var i = 0 , len = pageNumLength; i < len; i++) {
                //隐藏页码中超出总页数的部分
                if (totalPageNumLength < i + 1) {
                    hide(self._pageNumElArr[i]);
                } else {
                    self._pageNumElArr[i].innerHTML = i + 1 + basicPageNum;
                    if (i + 1 + basicPageNum == curPageNum) {
                        YDOM.insertBefore(self._curPageNumEl, self._pageNumElArr[i]);
                        hide(self._pageNumElArr[i]);
                    } else {
                        show(self._pageNumElArr[i]);
                    }
                }
            }
        }
    });

    //显示指定元素
    function show(){
        for( var i = 0 ,len = arguments.length ; i < len ; i++ ){
            arguments[i].style.display='';
        }
    }
    //隐藏指定元素
    function hide(){
        for( var i = 0 ,len = arguments.length ; i < len ; i++ ){
            arguments[i].style.display='none';
        }
    }
});/**
 * DataGrid Operate
 * @creator     沉鱼<fool2fish@gmail.com>
 * @depends     kissy-core, yui2-yahoo-dom-event, yui2-connection
 */

KISSY.add("datagrid-operate", function(S) {

    var DOM = S.DOM, Event = S.Event, YDOM = YAHOO.util.Dom,
        doc = document,

        DataGrid = S.DataGrid,
        create = DataGrid.create,

        //特殊列的类型
        COL_CHECKBOX = 'COL_CHECKBOX', COL_RADIO = 'COL_RADIO', COL_EXTRA = 'COL_EXTRA',

        //class前缀
        CLS_PREFIX = 'ks-datagrid-',
        //行class
        CLS_ROW = CLS_PREFIX + 'row', CLS_ROW_EXTRA = CLS_PREFIX + 'row-extra', CLS_ROW_SELECTED = CLS_PREFIX + 'row-selected', CLS_ROW_EXPANDED = CLS_PREFIX + 'row-expanded',

        //特殊单元格class
        CLS_CELL_EXTRA = CLS_PREFIX + 'cell-extra',
        //排序单元格class
        CLS_SORTABLE = CLS_PREFIX + 'cell-sortable', CLS_SORT_DESC = CLS_PREFIX + 'cell-desc', CLS_SORT_ASC = CLS_PREFIX + 'cell-asc',
        //特殊icon的class
        CLS_ICON_EXPAND = CLS_PREFIX + 'icon-expand', CLS_ICON_CHECKBOX = CLS_PREFIX + 'icon-checkbox', CLS_ICON_RADIO = CLS_PREFIX + 'icon-radio',

        //行索引，可排序th的排序字段
        ATTR_ROW_IDX = 'data-list-idx',ATTR_CELL_IDX = 'data-cell-idx', ATTR_SORT_FIELD = 'data-sort-field',

        //排序方式
        DESC = 'desc', ASC = 'asc';

    S.augment(S.DataGrid,{
        
        /**************************************************************************************************************
         * 滚动时，固定表头功能
         *************************************************************************************************************/
        _activateFixThead:function(){
            var scrollState = 0,
                self = this,
                container = self.container,
                table = self._tableEl,
                thead = self._theadEl,
                proxy = create('<table class="ks-datagrid-proxy ks-datagrid"></table>');
            
            S.ready(function() {
                doc.body.appendChild(proxy);
            });

            if(!self._defColWidth) self._setColWidth();

            Event.on(window,'scroll',function(){
                var theadHeight = thead.offsetHeight,
                    tWidth = container.offsetWidth,
                    tHeight = container.offsetHeight,
                    tLeft =  YDOM.getX(container),
                    tTop =  YDOM.getY(container),
                    scrollTop = YDOM.getDocumentScrollTop();
                if(scrollTop<tTop){
                    if(scrollState){
                        table.style.paddingTop = 0;
                        table.appendChild(thead);
                    }
                    scrollState = 0;                    
                }else if( scrollTop > tTop+tHeight-theadHeight){
                    if(scrollState != 3){
                        proxy.style.top = '-400px';
                    }
                    scrollState = 3;
                }else{
                    if(!scrollState){
                        table.style.paddingTop = theadHeight + 'px';
                        proxy.appendChild(thead);
                    }
                    if(scrollState!=2){
                        proxy.style.top='0px';
                        proxy.style.left = tLeft+'px';
                        proxy.style.width = tWidth+'px';
                    }
                    if(S.UA.ie===6){
                        proxy.style.top = scrollTop+'px';
                    }
                    scrollState = 2;
                }                                                                                    
            });

            Event.on(window,'resize',function(){
                proxy.style.width = container.offsetWidth+'px';                
            });
        },

        /**
         * 渲染出表格（如果没有数据，则为渲染出表头后）,获取每列的实际宽度并赋值
         */
        _setColWidth:function(){
            var self = this ,
                colArr = self._colgroupEl.getElementsByTagName('col'),
                thArr = self._theadEl.getElementsByTagName('th');
            for(var i=0,len=colArr.length;i<len;i++){
                if(!colArr[i].width) colArr[i].width = colArr[i].offsetWidth;
            }
            for(var j=0,len2=thArr.length;j<len2;j++){
                if((!thArr[j].width) && (thArr[j].className.indexOf(CLS_CELL_EXTRA)<0)) thArr[j].width = thArr[j].offsetWidth;
            }

        },

        /**************************************************************************************************************
         * 激活排序，选择列和扩展列功能
         *************************************************************************************************************/
        
        //激活排序功能
        _activateRowSort:function(){
            var self = this , sortTrigger = self._sortTrigger;
            Event.on(sortTrigger, 'click', function(e){
                if( !self._listData || self._listData.length == 0 ) return;
                var t = this;
                var sortBy = t.getAttribute( ATTR_SORT_FIELD );;
                var sortType;
                //获得排序类型 和 设置当前排序触点的样式
                if( DOM.hasClass( t , CLS_SORT_ASC ) ){
                    sortType = DESC;
                    DOM.removeClass( t, CLS_SORT_ASC);
                    DOM.addClass( t, CLS_SORT_DESC);
                //如果目前是降序排列或者目前列无排序
                }else{
                    sortType = ASC;
                    DOM.addClass( t, CLS_SORT_ASC);
                    DOM.removeClass( t, CLS_SORT_DESC);
                }
                //修改前一个排序触点的样式
                if( self._curSortTrigger && self._curSortTrigger != t ){
                    DOM.removeClass( self._curSortTrigger, CLS_SORT_DESC);
                    DOM.removeClass( self._curSortTrigger, CLS_SORT_ASC);
                }
                self._curSortTrigger = t;
                var queryData = DataGrid.setQueryParamValue( self._latestQueryData,self.datasourceDef.sortBy, sortBy);
                queryData = DataGrid.setQueryParamValue( queryData,self.datasourceDef.sortType, sortType);
                self.update(queryData);
            });
        },

        //激活列选择功能
        _activateRowSelect:function(){
            var self = this ,selectDef=self._colSelectDef, selectType = selectDef.xType, curSelectedIdx;
            function getRow(t){
                var tc = t.className,p=t.parentNode,pc=p.className;
                //如果t为单选/多选按钮icon
                if( p.nodeName.toLowerCase()=='td'&&(tc.indexOf(CLS_ICON_CHECKBOX)+1 || tc.indexOf(CLS_ICON_RADIO)+1)){
                    return p.parentNode;
                //或者为td
                }else if(pc.indexOf(CLS_ROW)+1 || pc.indexOf(CLS_ROW_EXTRA)+1){
                    return p;
                }else{
                    return null;
                }
            }

            Event.on(self._tableEl,'click',function(e){
                var t=e.target, row = getRow(t);
                if(!row) return;
                if(selectType == COL_CHECKBOX){
                    self.toggleSelectRow( row.getAttribute( ATTR_ROW_IDX ));
                }else if(selectType == COL_RADIO){
                    if( curSelectedIdx != undefined ) self.deselectRow(curSelectedIdx);
                    curSelectedIdx = row.getAttribute( ATTR_ROW_IDX );
                    self.selectRow( curSelectedIdx );
                }
            });

            /**
             * 全选/取消全选
             * 由于滚动时如果固定页头，则thead会暂时从table中取出来，故需要直接将事件注册在全选触点上
             */
            if(self._selectAllTrigger){
                Event.on(self._selectAllTrigger,'click',function(){
                    if(!self._tbodyEl) return;
                    var theadRow = self._theadEl.getElementsByTagName('tr')[0];
                    if(DOM.hasClass(theadRow,CLS_ROW_SELECTED)){
                        self.deselectAll();
                    }else{
                        self.selectAll();
                    }
                });
            }

        },

        //激活扩展列功能
        _activateRowExpand:function(){
            var self = this;
            Event.on(self._tableEl,'click',function(e){
                var t = e.target;
                if( DOM.hasClass( t , CLS_ICON_EXPAND ) ){
                    var row = YDOM.getAncestorByClassName( t , CLS_ROW );
                    var nextSibling = YDOM.getNextSibling( row );
                    //如果row无相邻元素，或者相邻元素不是扩展列
                    if( !nextSibling || !DOM.hasClass( nextSibling , CLS_ROW_EXTRA ) ){
                        var idx = row.getAttribute( ATTR_ROW_IDX );
                        var rowExtra = self._renderRowExtra( self._listData[idx] );
                            rowExtra.setAttribute( ATTR_ROW_IDX , idx );
                        if(DOM.hasClass( row , CLS_ROW_SELECTED )) YDOM.addClass( rowExtra, CLS_ROW_SELECTED );
                        YDOM.insertAfter( rowExtra , row );
                    }else{
                        var rowExtra = nextSibling;
                    }
                    DOM.toggleClass( row , CLS_ROW_EXPANDED );
                    DOM.toggleClass( rowExtra , CLS_ROW_EXPANDED );
                }
            });
        },

        /**************************************************************************************************************
         * @选择操作
         *************************************************************************************************************/

        /**
         * 切换指定行选中状态
         * @param idx 行索引
         */
        toggleSelectRow:function(){
            for(var i = 0 , len = arguments.length ; i < len ; i++){
                this._toggleSelectRow(arguments[i]);
            }
            this._checkIfSelectAll();
        },
        /**
         * 选中指定行
         * @param idx 行索引
         */
        selectRow:function(){
            for(var i = 0 , len = arguments.length ; i < len ; i++){
                this._toggleSelectRow(arguments[i],1);
            }
            this._checkIfSelectAll();
        },
        /**
         * 取消选中指定行
         * @param idx 行索引
         */
        deselectRow:function(){
            for(var i = 0 , len = arguments.length ; i < len ; i++){
                this._toggleSelectRow(arguments[i],0);
            }
            this._checkIfSelectAll();
        },
        /**
         * 全选
         */
        selectAll:function(){
            for(var i = 0 , len = this._rowElArr.length ; i < len ; i++){
                this._toggleSelectRow(i,1);
            }
            this._checkIfSelectAll();
        },
        /**
         * 全不选
         */
        deselectAll:function(){
            for(var i = 0 , len = this._rowElArr.length ; i < len ; i++){
                this._toggleSelectRow(i,0);
            }
            this._checkIfSelectAll();
        },
        /**
         * 反选
         */
        selectInverse:function(){
            for(var i = 0 , len = this._rowElArr.length ; i < len ; i++){
                this._toggleSelectRow(this._rowElArr[i]);
            }
            this._checkIfSelectAll();
        },

        /**
         * 获取被选中record的索引
         */
        getSelectedIndex:function(){
            return this._getSelected('index');
        },
        /**
         * 获取被选中的record
         */
        getSelectedRecord:function(){
            return this._getSelected();
        },

        /**
         * 将指定索引的行显示为指定的选中状态
         * @param idx 要切换选中状态的行在listData中的索引号
         * @param selectType 1为选中，0为取消选中，不填则为自动切换
         */
        _toggleSelectRow:function(idx,selectType){
            var row = this._rowElArr[idx];
            var nextSibling = YDOM.getNextSibling( row );
            if( nextSibling && DOM.hasClass( nextSibling , CLS_ROW_EXTRA )) var rowExtra = nextSibling;
            if(selectType == undefined){
                DOM.toggleClass( row , CLS_ROW_SELECTED );
                if(rowExtra) DOM.toggleClass( rowExtra , CLS_ROW_SELECTED );
            }else if(selectType){
                DOM.addClass( row , CLS_ROW_SELECTED );
                if(rowExtra) DOM.addClass( rowExtra , CLS_ROW_SELECTED );
            }else{
                DOM.removeClass( row , CLS_ROW_SELECTED );
                if(rowExtra) DOM.removeClass( rowExtra , CLS_ROW_SELECTED );
            }
        },

        //检查是否全选
        _checkIfSelectAll:function(){
            var ifSelectAll = true , rowElArr = this._rowElArr;
            for(var i = 0 , len = rowElArr.length ; i < len ; i++){
                if( !DOM.hasClass( rowElArr[i] , CLS_ROW_SELECTED)){
                    ifSelectAll = false;
                    break;
                }
            }
            var theadRow = this._theadEl.getElementsByTagName('tr')[0];
            if(ifSelectAll){
                DOM.addClass( theadRow , CLS_ROW_SELECTED );
            }else{
                DOM.removeClass( theadRow , CLS_ROW_SELECTED );
            }
        },

        /**
         * 获取选中的行或者record
         * @param returnBy 默认'record'，可选'index'
         */
        _getSelected:function(returnBy){
            var selected = [];
            for( var  i = 0 , len = this._rowElArr.length ; i < len ; i++ ){
                if( YDOM.hasClass( this._rowElArr[i] , CLS_ROW_SELECTED ) ){
                    if(returnBy == 'index'){
                        selected.push( i );
                    }else{
                        selected.push( this._listData[i] );
                    }
                }
            }
            if( selected.length ==  0 ){
                return null;
            }else{
                return selected;
            }
        }


        /**************************************************************************************************************
         * @增删改操作
         *************************************************************************************************************/

        /*addRecord:function(){

        },
        modifyRecord:function(){

        },
        deleteRecord:function(){

        }*/
    });

});