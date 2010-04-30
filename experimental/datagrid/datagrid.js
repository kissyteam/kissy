/**
 * DataGrid
 * @creator     沉鱼<fool2fish@gmail.com>
 * @depends     kissy-core, yui2-yahoo-dom-event, yui2-connection
 */

/**
 * DataGrid功能点：
 * 1、数据源
 * 2、定义表头、解析表头(完成)
 * 3  定义列、解析列(完成)
 * 4、用户自定义显示列(完成)
 * 5、增删改
 * 6、其他单条操作
 * 7、其他批量操作(完成)
 * 8、单选、多选、全选、反选功能(完成)
 * 9、服务器端翻页(完成)
 * 10、服务器端排序(完成)
 * 11、条目展开（完成）
 * 12、高亮某行代码（完成）
 */

/**
 * 2010.04.12 玉伯review建议
 * 1、添加默认配置，简化最简单情况下的代码调用(完成)
 * 2、使用var self=this，提高代码压缩率（完成）
 * 3、使用局部变量提高代码效率（完成）
 * 4、拆分文件（init&config,render,bind,util）
 */

/**
 * 其他
 * 1、数据源缓存（任何写操作时自动清空缓存）
 * 2、目前数据源挂在datagrid下，考虑以后datasource独立的兼容性
 * 3、添加自定义事件(完成)
 * 4、转yui方法到kissy（kissy已有方法完成）
 */

KISSY.add("datagrid", function(S) {
    
    var DOM = S.DOM, Event = S.Event, YDOM = YAHOO.util.Dom, YEvent= YAHOO.util.Event, YConnect=YAHOO.util.Connect,
        doc=document,
        //定义特殊列的类型
        COL_CHECKBOX = 'COL_CHECKBOX', COL_RADIO = 'COL_RADIO', COL_EXTRA = 'COL_EXTRA',
        //定义解析columnDef时要用到的三个内部属性
        KS_DEPTH = 'KSDepth', KS_FATHER_IDX='KSFatherIdx', KS_CHILDREN_AMOUNT='KSChildrenAmount',
        //请求方式
        POST = 'post',GET = 'get',
        //行class
        CLS_ROW = 'row', CLS_ROW_EXTRA = 'row-extra', CLS_ROW_SELECTED = 'row-selected', CLS_ROW_EXPANDED = 'row-expanded',
        //行索引，可排序th的排序字段
        ATTR_ROW_IDX = 'data-idx',ATTR_SORT_FIELD='data-sort-field',
        //单元格class
        CLS_CELL_CHECKBOX = 'cell-checkbox', CLS_CELL_RADIO = 'cell-radio', CLS_CELL_EXTRA = 'cell-extra',
        //排序class
        CLS_SORTABLE = 'sortable', CLS_SORT_DES = 'sort-des', CLS_SORT_ASC = 'sort-asc',
        //排序方式
        DES = 'desc', ASC = 'asc',
        //特殊icon的class
        CLS_ICON_EXPAND = 'icon-expand', CLS_ICON_CHECKBOX = 'icon-checkbox', CLS_ICON_RADIO = 'icon-radio',
        //自定义事件
        EVENT_RENDER_ROW = 'renderRow' , EVENT_RENDER_ROW_EXTRA = 'renderRowExtra', EVENT_GET_DATA = 'getData',
        ROW_CLICK_SELECT_EXTRA_TAG = ' a img input button select option textarea label ';
        ;

    /**
     * DataGrid
     * @constructor
     * @param container 放置表格的容器
     * @param datasource 数据源的uri
     */
    function DataGrid(container,datasource){
        var self = this ;
        //设置容器
        self.container = S.get(container);
        DOM.addClass( self.container , 'ks-datagrid' );
        //生成表格元素
        self.tableEl = createEl( 'table' , 'datagrid-table' , null , self.container );
        //生成loading元素
        var loadingTrEl = createEl( 'tr' , 'row row-loading' , createEl( 'td' ) );
        self._loadingEl = createEl( 'tbody' , null , loadingTrEl );
        //记录数据源uri(目前数据源功能集成在datagrid组件当中，且只接受json形式的返回数据)
        self._datasourceUri = datasource ;
    }

    S.mix(DataGrid.prototype,{

        /**************************************************************************************************************
         * @数据源
         * 注：目前数据源集成在datagrid里，以后考虑独立
         *************************************************************************************************************/

        /**
         * 定义datasource，指定datasource里各字段的用途
         * 默认值见 DataGrid.datasourceDef
         */
        datasourceDef:null,
        /**
         * 请求数据的方式
         */
        connectMethod:POST,        
        //记录最近一次查询类请求发送的数据
        _latestQueryData:'',
        //JSON格式的数据源
        _liveData:null,
        //数据源中的列表数据
        _listData:null,
        _dataCache:{},
        
        /**************************************************************************************************************
         * @表格定义
         *************************************************************************************************************/
        
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
        columnDef:null,
        //总列数
        _columnAmount:null,
        //解析columnDef后得到的表头列定义
        _theadColDef:null,
        //解析columnDef后得到的表身普通列定义
        _colDef:null,
        //解析columnDef后得到的表身扩展列定义
        _colExtraDef:null,
        //解析columnDef后得到的选择列定义
        _colSelectDef:null,

        /**************************************************************************************************************
         * @表格元素
         *************************************************************************************************************/

        //colgroup元素
        _colgroupEl:null,
        //表头
        _theadEl:null,
        //触发排序的th元素
        _sortTrigger:[],
        //当前排序的th
        _curSortTrigger:null,
        //触发全选的元素
        _selectAllTrigger:null,
        //显示loading的tbody
        _loadingEl:null,
        //装载数据的tbody
        _tbodyEl:null,
        //标准行数组对象
        _rowElArr:null,

        /**************************************************************************************************************
         * @界面渲染
         *************************************************************************************************************/

        /**
         * 渲染表格，如果无postData则仅渲染表头等附加元素
         * @param postData
         */
        render:function(postData){
            var self = this ;
            self.datasourceDef = self.datasourceDef || {};
            self.datasourceDef = S.merge( DataGrid.datasourceDef , self.datasourceDef );
            //激活翻页功能
            if(self.paginationDef){
                self.paginationDef = S.merge( DataGrid.paginationDef , self.paginationDef );
                self._renderPagination();
            }
            self.update(postData);
        },

        /**
         * 更新表格数据，postData必填，如果不需要任何参数也需要传递空字符串，否则更新不会执行
         * @param postData
         */
        update:function(postData){
            var self = this ;
            function parseColumnDefCallback(theadColDef, colDef, colExtraDef, colSelectDef){
                self._parseColumnDefPreProcessor(theadColDef, colDef, colExtraDef, colSelectDef);
                self._renderColgroup();
                self._renderThead();
                if(self._listData) self._renderTbody();
                self._endLoading();
                //激活排序
                if(self._sortTrigger.length>0) self._activateRowSort();
                //激活扩展功能
                if(colExtraDef) self._activateRowExpand();
                //选择行功能
                if(colSelectDef) self._activateRowSelect();
            }
            if( postData == undefined ){
                if( self.columnDef && !self._colDef){
                    //如果有列定义但未解析，则单纯解析列定义
                    parseColumnDefToFlat( self.columnDef,null,parseColumnDefCallback,self);
                }
                return;
            }
            self._startLoading();
            var paginationDef = this.paginationDef ;
            //如果进行了翻页定义，但postData中未指定dataLimit，则更新postData
            if(paginationDef && !getQueryParamValue( postData ,paginationDef.dataLimit )){
                postData = setQueryParamValue(postData, this.datasourceDef.dataLimit, paginationDef.dataLimit);
            }
            var callback={
                success:function(o){
                    var self = this ;
                    self._dataPreProcessor(o);
                    self.fire( EVENT_GET_DATA,{liveData:self._liveData} );
                    //如果请求成功，且返回数据正确
                    if(self._requestResult){
                        var listData = self._listData;
                        //如果无列定义且返回了列表数据，则根据返回数据自动生成列定义,并手工解析
                        if( (!self.columnDef) && listData && listData.length > 0 ){
                            self.columnDef = [];
                            for( var i in listData[0]){
                                 self.columnDef.push({label:i,field:i});
                            }
                        }
                        //如果列定义没被解析过
                        if(!self._colDef){
                            //解析columnDef，成功后开始初始化界面
                            parseColumnDefToFlat( self.columnDef,null,parseColumnDefCallback,self);
                        //如果列定义被解析过
                        }else{
                            if(listData) self._renderTbody();
                            self._endLoading();
                        }
                        //保存最近一次的查询参数
                        self._latestQueryData = postData;
                        //更新页码
                        if( self.paginationDef ) self._updatePagination();
                    }else{
                        self._endLoading();
                    }
                },
                failure:function(){
                    alert('error:获取数据失败，请刷新页面重试或联系管理员。');
                    this._endLoading();
                },
                scope:self
            };
            YConnect.asyncRequest(this.connectMethod, this._datasourceUri, callback, postData);
        },

        //每次异步请求返回值的基本处理
        _dataPreProcessor:function(o){
            var self = this ;
            try{
                self._liveData = eval('('+o.responseText+')');
            }catch(e){
                alert('error：请返回JSON格式的数据。');
                self._endLoading();
                return;
            }
            var datasourceDef = self.datasourceDef ;
            self._requestResult = self._liveData[datasourceDef.success];
            if(self._requestResult){
                self._listData = self._liveData[datasourceDef.listData];
            }
        },

        //每次解析完columnDef之后的基本处理
        _parseColumnDefPreProcessor:function(theadColDef, colDef, colExtraDef, colSelectDef){
            var self = this ;
            self._theadColDef =theadColDef;
            self._colDef = colDef;
            self._colExtraDef = colExtraDef;
            self._colSelectDef = colSelectDef;
            self._columnAmount = colDef.length ;
            if( colExtraDef ) self._columnAmount++;
            if( colSelectDef ) self._columnAmount++;
        },

        //显示loading状态
        _startLoading:function(){
            var self = this ;
            if( self._columnAmount ){
                var loadingTd = self._loadingEl.getElementsByTagName( 'td' )[0];
                loadingTd.colSpan = self._columnAmount;
            }
            //notice：没有把loadingEl加到tableEl中，采用diaplay:none的方式来切换loading框的显示，是因为ie下使用js去display:none loadingEl会有点问题：高度无法消除，下边框线一直可见
            if(YDOM.getFirstChild( self.tableEl )){
                var firstChild = YDOM.getFirstChild( self.tableEl );
                YDOM.insertBefore( self._loadingEl , firstChild );
            }else{
                self.tableEl.appendChild( self._loadingEl );
            }
        },

        //隐藏loading状态
        _endLoading:function(){
            var self = this ;
            if(YDOM.isAncestor( self.tableEl , self._loadingEl )) self.tableEl.removeChild( self._loadingEl );
        },

        //渲染colgroup，并附加到表格元素内
        _renderColgroup:function(){
            var self = this ,
                colgroupEl = doc.createElement('colgroup');
            if( self._colExtraDef ){
                var col =  createEl( 'col' , null , null , colgroupEl );
                    col.width = '25';
            }
            if( self._colSelectDef ){
                var col =  createEl( 'col' , null , null , colgroupEl );
                    col.width = '25';
            }
            var colDef = self._colDef;
            for( var i = 0 , len = colDef.length ; i < len ; i++ ){
                var col =  createEl( 'col' , null , null , colgroupEl );
                if( colDef[i].width ) col.width = colDef[i].width;
            }
            if( self._colgroupEl ) self.tableEl.removeChild( self._colgroupEl );
            self._colgroupEl = colgroupEl;
            self.tableEl.appendChild( self._colgroupEl );
        },

        //渲染表头普通单元格
        _renderTheadCell:function( cellDef ){
            var cell = createEl('th');
            //如果无子th
            if( cellDef[KS_CHILDREN_AMOUNT] == 0 ){
                //特殊列
                if( cellDef.xType ){
                    cell.className = CLS_CELL_EXTRA;
                    //全选
                    if( cellDef.xType == COL_CHECKBOX ){
                        cell.innerHTML = '<i class="' + CLS_ICON_CHECKBOX + '"></i>';
                    }

                //排序
                }else if( cellDef.sortable ){
                    cell.className = CLS_SORTABLE;
                    cell.setAttribute( ATTR_SORT_FIELD , cellDef.field );
                    cell.innerHTML = '<i class="icon"></i>';
                    this._sortTrigger.push( cell );
                }
            //如果有子th
            }else{
                cell.colSpan = cellDef[KS_CHILDREN_AMOUNT];
            }
            //文字标签
            if( cellDef.label ) cell.innerHTML = cellDef.label + cell.innerHTML;
            return cell;
        },

        //渲染表头扩展列单元格
        _renderTheadCellExpand:function(){
            return createEl( 'th' , CLS_CELL_EXTRA );
        },

        //渲染表格选择列单元格
        _renderTheadCellSelect:function( selectType ){
            var cell = createEl( 'th' , CLS_CELL_EXTRA );
            if( selectType == COL_CHECKBOX ) this._selectAllTrigger = createEl( 'i' , CLS_ICON_CHECKBOX , null , cell );
            return cell;
        },

        //渲染表头
        _renderThead:function(){
            var self = this,
                theadColDef=this._theadColDef,
                theadEl = doc.createElement('thead'),
                depth = theadColDef.length;
            for(var i = 0 , ilen = theadColDef.length ; i < ilen ; i++){
                var row = createEl( 'tr' , 'row' );
                //扩展按钮列
                if( i == 0){
                    if(self._colExtraDef){
                        var theadCellExpand = self._renderTheadCellExpand();
                            theadCellExpand.rowSpan = ilen;
                        row.appendChild(theadCellExpand);
                    }
                    if(self._colSelectDef){
                        var theadCellSelect = self._renderTheadCellSelect(self._colSelectDef);
                             theadCellSelect.rowSpan = ilen;
                        row.appendChild(theadCellSelect);
                    }
                }
                //普通列
                for(var j = 0 , jlen = theadColDef[i].length ; j < jlen ; j++){
                    var cellDef = theadColDef[i][j];
                    if(cellDef[KS_DEPTH] != i) continue;
                    var cell = self._renderTheadCell(cellDef);
                    if( cellDef[KS_CHILDREN_AMOUNT] == 0 && depth-1 > i) cell.rowSpan = depth - i;
                    row.appendChild(cell);
                }
                theadEl.appendChild(row);
            }
            if(self._theadEl) self.tableEl.removeChild(self._theadEl);
            self._theadEl = theadEl;
            self.tableEl.appendChild(self._theadEl);
        },

        //渲染单元格
        _renderCell:function( cellDef , recordData ){
            var cell = doc.createElement('td');
            //如果指定了字段
            if(cellDef.field != undefined ){
                //如果是单字段
                if(typeof cellDef.field == 'string'){
                    var fieldValue = recordData[cellDef.field];
                    //如果有渲染器
                    if(cellDef.parser){
                        appendChild( cell , cellDef.parser(fieldValue));
                    //如果无渲染器
                    }else{
                        cell.innerHTML = fieldValue;
                    }
                //如果是复合字段
                }else if(S.isArray(cellDef.field)){
                    var fieldValueArr=[];
                    for(var i = 0 , len = cellDef.field.length ; i<len ; i++){
                        fieldValueArr.push(recordData[cellDef.field[i]]);
                    }
                    //如果有渲染器
                    if(cellDef.parser){
                        appendChild( cell , cellDef.parser.apply(window,fieldValueArr) );
                    //如果无渲染器
                    }else{
                        cell.innerHTML = fieldValueArr.join(' ');
                    }
                }
            //如果没指定字段
            }else{
                //如果有渲染器
                if(cellDef.parser){
                    appendChild( cell , cellDef.parser());
                //如果无渲染器
                }else{
                    cell.innerHTML = '';
                }
            }
            return cell;
        },
        
        //渲染展开按钮单元格
        _renderCellExpand:function(){
            return createEl( 'td' , CLS_CELL_EXTRA ,  '<i class="' + CLS_ICON_EXPAND + '"></i>' );
        },
        
        //渲染选择单元格
        _renderCellSelect:function(selectType){
            if(selectType == COL_CHECKBOX){
                 var inner = '<i class="' + CLS_ICON_CHECKBOX + '"></i>';
            }else if(selectType == COL_RADIO){
                 var inner = '<i class="' + CLS_ICON_RADIO + '"></i>';
            }
            return createEl( 'td', CLS_CELL_EXTRA , inner );
        },
        
        //渲染标准行
        _renderRow:function(recordData){
            var self = this, colDef = self._colDef;
            var row = createEl( 'tr' , CLS_ROW );
            //扩展按钮
            if(self._colExtraDef) row.appendChild(self._renderCellExpand());
            //复选或者单选按钮
            if(self._colSelectDef) row.appendChild(self._renderCellSelect(self._colSelectDef));
            for(var i = 0 , len = colDef.length ; i < len ; i++){
                row.appendChild(self._renderCell(colDef[i],recordData));
            }
            self.fire( EVENT_RENDER_ROW , { row : row , recordData : recordData });
            return row;
        },

        //渲染扩展列（扩展列的内容放到一个行里展示）
        _renderRowExtra:function(recordData){
            var self = this ;
            var row = createEl( 'tr' , CLS_ROW_EXTRA ),
                colSpan = self._columnAmount;
            if(self._colExtraDef){
                createEl( 'td' , CLS_CELL_EXTRA , null , row );
                colSpan--;
            }
            if(self._colSelectDef){
                createEl( 'td' , CLS_CELL_EXTRA , null , row );
                colSpan--;
            }
            var cell = self._renderCell(self._colExtraDef,recordData);
                cell.colSpan = colSpan;
            row.appendChild(cell);
            self.fire( EVENT_RENDER_ROW_EXTRA , { row : row , recordData : recordData });
            return row;
        },

        //渲染表格本身
        _renderTbody:function(){
            var self = this;
            self._rowElArr = [];
            var listData = self._listData;
            var tbodyEl = doc.createElement('tbody');
            for(var i = 0 , len = listData.length ; i < len ; i++){
                var row = self._renderRow(listData[i]);
                    row.setAttribute(ATTR_ROW_IDX,i);
                self._rowElArr.push(row);
                tbodyEl.appendChild(row);
                if( self._colExtraDef && self._colExtraDef.expand ){
                    var rowExtra = self._renderRowExtra(listData[i]);
                        rowExtra.setAttribute(ATTR_ROW_IDX,i);
                    tbodyEl.appendChild(rowExtra);
                    DOM.addClass( row , CLS_ROW_EXPANDED );
                    DOM.addClass( rowExtra , CLS_ROW_EXPANDED );
                }
            }
            if(self._tbodyEl) self.tableEl.removeChild(self._tbodyEl);
            self._tbodyEl = tbodyEl;
            self.tableEl.appendChild(self._tbodyEl);
        },

        //激活排序功能
        _activateRowSort:function(){
            var self = this , sortTrigger  = self._sortTrigger;
            Event.on(sortTrigger, 'click', function(e){
                if( !self._listData || self._listData.length == 0 ) return;
                var t = this;
                var sortBy = t.getAttribute( ATTR_SORT_FIELD );;
                var sortType;
                //获得排序类型 和 设置当前排序触点的样式
                if( DOM.hasClass( t , CLS_SORT_ASC ) ){
                    sortType = DES;
                    DOM.removeClass( t, CLS_SORT_ASC);
                    DOM.addClass( t, CLS_SORT_DES);
                //如果目前是降序排列或者目前列无排序
                }else{
                    sortType = ASC;
                    DOM.addClass( t, CLS_SORT_ASC);
                    DOM.removeClass( t, CLS_SORT_DES);
                }
                //修改前一个排序触点的样式
                if( self._curSortTrigger && self._curSortTrigger != t ){
                    DOM.removeClass( self._curSortTrigger, CLS_SORT_DES);
                    DOM.removeClass( self._curSortTrigger, CLS_SORT_ASC);
                }
                self._curSortTrigger = t;
                var queryData = setQueryParamValue( self._latestQueryData,self.datasourceDef.sortBy, sortBy);
                queryData = setQueryParamValue( queryData,self.datasourceDef.sortType, sortType);
                self.update(queryData);
            });
        },

        //激活列选择功能
        _activateRowSelect:function(){
            var self = this , selectType = self._colSelectDef;
            function selectJudgement(t){
                return  ( DOM.hasClass( t , CLS_ICON_CHECKBOX) || -ROW_CLICK_SELECT_EXTRA_TAG.indexOf( ' '+t.nodeName.toLowerCase()+' ' ) ) && YDOM.getAncestorByTagName( t , 'tbody' )
            }
            if( selectType == COL_CHECKBOX ){
                Event.on(self.tableEl,'click',function(e){
                    var t = e.target;
                    if( selectJudgement(t) ){
                        var row = YDOM.getAncestorByClassName( t , CLS_ROW ) || YDOM.getAncestorByClassName( t , CLS_ROW_EXTRA );
                        self.toggleSelectRow( row.getAttribute( ATTR_ROW_IDX ));
                    }else if( t == self._selectAllTrigger){
                        var theadRow = self._theadEl.getElementsByTagName('tr')[0];
                        if( DOM.hasClass( theadRow , CLS_ROW_SELECTED ) ){
                            self.deselectAll();
                        }else{
                            self.selectAll();
                        }
                    }
                });
            }else if( selectType == COL_RADIO ){
                var curSelectedIdx;
                Event.on(self.tableEl,'click',function(e){
                    var t = e.target;
                    if( selectJudgement(t) ){
                        var row = YDOM.getAncestorByClassName( t , CLS_ROW ) || YDOM.getAncestorByClassName( t , CLS_ROW_EXTRA );
                        if( curSelectedIdx != undefined ) self.deselectRow(curSelectedIdx);
                        curSelectedIdx = row.getAttribute( ATTR_ROW_IDX );
                        self.selectRow( curSelectedIdx );
                    }
                });
            }
        },
        
        //激活扩展列功能
        _activateRowExpand:function(){
            var self = this;
            Event.on(self.tableEl,'click',function(e){
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
         * @翻页
         *************************************************************************************************************/

        /**
         * 翻页设置
         * 默认值见 DataGrid.paginationDef
         */
        paginationDef:null,
        //翻页
        _paginationEl:null,
        //渲染翻页
        _renderPagination:function(){
            var self = this;
            var paginationEl = createEl( 'div', 'ks-pagination');
            var wrapperEl = createEl( 'div' , 'standard' , null , paginationEl);
            self._pageInfoEl = createEl( 'span' , 'page-info' , null , wrapperEl);
            self._pageStartEl = createEl( 'a' , 'page-start' , '首页' , wrapperEl);
            self._pageStartDisabledEl = createEl( 'span' , 'page-start' , '首页' , wrapperEl);
            self._pagePrevEl = createEl( 'a' , 'page-prev' , '上一页' , wrapperEl);
            self._pagePrevDisabledEl = createEl( 'span' , 'page-prev' , '上一页' , wrapperEl);
            self._curPageNumEl = createEl( 'span' , 'page' , '1' , wrapperEl);
            self._pageNumElArr = [];
            for( var i = 0 , len = self.paginationDef.pageNumLength ; i < len ; i++ ){
                var pageNumEl = createEl( 'a' , 'page' , null , wrapperEl);
                    pageNumEl.setAttribute('data-page-idx',i);
                this._pageNumElArr.push(pageNumEl);
            }
            self._pageNextEl = createEl( 'a' , 'page-next' , '下一页' , wrapperEl);
            self._pageNextDisabledEl = createEl( 'span' , 'page-next' , '下一页' , wrapperEl);
            self._pageEndEl = createEl( 'a' , 'page-end' , '末页' , wrapperEl);
            self._pageEndDisabledEl = createEl( 'span' , 'page-end' , '末页' , wrapperEl);
            self._pageSkipEl = createEl( 'span' , 'page-skip' , '到第<input type="text" size="3" class="jump-to">页 <button class="page-skip-button" type="button">确定</button>' , wrapperEl);
            self._pageSkipInputEl = self._pageSkipEl.getElementsByTagName('input')[0];
            self._pageSkipBtnEl = self._pageSkipEl.getElementsByTagName('button')[0];
            self._dataLimitEl = createEl( 'span' , 'data-limit' , '每页<select><option value=""></option><option value="20">20</option><option value="40">40</option><option value="60">60</option><option value="80">80</option></select>条' , wrapperEl);
            self._dataLimitSetEl = self._dataLimitEl.getElementsByTagName('select')[0];

            if(self.paginationDef.position == 'bottom'){
                YDOM.insertAfter( paginationEl, self.tableEl );
            }else{
                YDOM.insertBefore( paginationEl, self.tableEl );
            }
            self._paginationEl = paginationEl;
            
            function pageTurning(e){
                var t = this ;
                var queryData = self._latestQueryData,
                    datasourceDef = self.datasourceDef,
                    dataStart = parseInt(getQueryParamValue(queryData,self.datasourceDef.dataStart) || 0,10),
                    dataLimit = parseInt(getQueryParamValue(queryData,self.datasourceDef.dataLimit),10),
                    dataAmount = parseInt(self._liveData[datasourceDef.dataAmount],10),
                    totalPageNumLength = Math.ceil(dataAmount/dataLimit);
                if( t == self._pageStartEl ){
                    dataStart = '0';
                }else if( t == self._pagePrevEl ){
                    dataStart -= dataLimit;
                }else if( t == self._pageNextEl ){
                    dataStart += dataLimit;
                }else if( t == self._pageEndEl ){
                    dataStart = ( totalPageNumLength - 1 ) * dataLimit ;
                }else if( t == self._pageSkipBtnEl ){
                    var skipTo = Math.min( parseInt( self._pageSkipInputEl.value , 10 ) || 1 , totalPageNumLength );
                        self._pageSkipInputEl.value = skipTo;
                    dataStart = ( skipTo - 1 ) * dataLimit;
                }else{
                    dataStart = ( t.innerHTML - 1 ) * dataLimit ;
                }
                var postData = setQueryParamValue(queryData,datasourceDef.dataStart,dataStart);
                self.update(postData);
            }
            var pageTurningTrigger = self._pageNumElArr.concat(self._pageStartEl , self._pagePrevEl , self._pageNextEl , self._pageEndEl ) ;
            hide.apply(window,pageTurningTrigger);
            hide(self._pageSkipEl,self._dataLimitEl);
            Event.on( pageTurningTrigger , 'click' , pageTurning );
            Event.on( self._pageSkipBtnEl , 'click' , pageTurning );
            Event.on( self._dataLimitSetEl , 'change' , function(e){
                if( !self._listData ) return;
                var t = this;
                if( !t.options[0].value){
                    var curLimit = self.paginationDef.dataLimit;
                    var curLimitInSelect = false ;
                    for( var i = 0 , len = t.options.length ; i < len ; i++ ){
                        if( t.options[i].value == curLimit ){
                            curLimitInSelect = true;
                            break;
                        }
                    }
                    if( curLimitInSelect ){
                        t.removeChild( t.options[0] );
                    }else{
                        t.options[0].value = t.options[0].innerHTML = curLimit;
                    }
                }
                self.paginationDef.dataLimit = t.value;
                self.update( self._latestQueryData );
            } );
        },
        //更新翻页
        _updatePagination:function(){
            var self = this,
                queryData = self._latestQueryData,
                dataStart = parseInt(getQueryParamValue(queryData,self.datasourceDef.dataStart) || 0,10),
                dataLimit = parseInt(getQueryParamValue(queryData,self.datasourceDef.dataLimit),10),
                dataAmount = parseInt(self._liveData[self.datasourceDef.dataAmount],10),
                pageNumLength = self.paginationDef.pageNumLength,
                totalPageNumLength = Math.ceil(dataAmount/dataLimit);

            show(self._pageSkipEl);
            show(self._dataLimitEl);
            //显示记录总条数
            self._pageInfoEl.innerHTML = '共'+ totalPageNumLength +'页';
            //判定上一页状态
            if(dataStart){
                show( self._pageStartEl , self._pagePrevEl );
                hide( self._pageStartDisabledEl , self._pagePrevDisabledEl );
            }else{
                hide( self._pageStartEl , self._pagePrevEl );
                show( self._pageStartDisabledEl ,self._pagePrevDisabledEl );
            }
            //判定下一页状态
            if( dataStart + dataLimit >= dataAmount ){
                hide( self._pageNextEl, self._pageEndEl );
                show( self._pageNextDisabledEl , self._pageEndDisabledEl );
            }else{
                show( self._pageNextEl , self._pageEndEl );
                hide( self._pageNextDisabledEl , self._pageEndDisabledEl );
            }
            //显示当前页
            var curPageNum = Math.ceil(dataStart / dataLimit)+1;
            self._curPageNumEl.innerHTML = curPageNum;
            //当前页码在页码中的位置
            var curPageIdx = Math.floor( Math.min(totalPageNumLength,pageNumLength) / 2 );
            //基础页码（基础页码+页码序号=真正的页码）
            var basicPageNum = 0;
            if( curPageNum - curPageIdx <= 0 ){
                curPageIdx = curPageNum-1;
            }else if( curPageNum > totalPageNumLength - Math.min(totalPageNumLength,pageNumLength) + curPageIdx + 1 ){
                curPageIdx = curPageNum - ( totalPageNumLength - Math.min(totalPageNumLength,pageNumLength));
                basicPageNum = totalPageNumLength - Math.min(totalPageNumLength,pageNumLength);
            }else{
                basicPageNum = curPageNum - curPageIdx - 1;
            }
             //渲染页码
            for(var i = 0 , len = pageNumLength ; i < len ; i++){
                //隐藏页码中超出总页数的部分
                if( totalPageNumLength < i+1 ){
                    hide(self._pageNumElArr[i]);
                }else{
                    self._pageNumElArr[i].innerHTML = i + 1 + basicPageNum ;
                    if( i + 1 + basicPageNum == curPageNum ){
                        YDOM.insertBefore( self._curPageNumEl , self._pageNumElArr[i]);
                        hide(self._pageNumElArr[i]);
                    }else{
                        show(self._pageNumElArr[i]);
                    }
                }
            }
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
        },


        /**************************************************************************************************************
         * @增删改操作
         *************************************************************************************************************/

        addRecord:function(){

        },
        modifyRecord:function(){

        },
        deleteRecord:function(){

        }       


    });

    S.mix(DataGrid.prototype, S.EventTarget);

    /******************************************************************************************************************
     * @默认设置
     *****************************************************************************************************************/

    //数据源默认定义
    DataGrid.datasourceDef = {
        success:'success',
        listData:'dataList',
        info:'info',
        dataStart:'start',
        dataLimit:'limit',
        dataAmount:'total',
        sortType:'sorttype',
        sortBy:'sortby'
    };

    //翻页默认定义
    DataGrid.paginationDef = {
        dataLimit:5,
        pageNumLength:8,
        position:'bottom'
    };

    /******************************************************************************************************************
     * @util
     *****************************************************************************************************************/

    function createEl(tagName,className,inner ,parentNode){
        var el = doc.createElement(tagName);
        if(className) el.className = className;
        if(inner){
            if( typeof inner == 'string' ){
                el.innerHTML = inner;
            }else{
                el.appendChild(inner);
            }
        };
        if(parentNode) parentNode.appendChild(el);
        return el;
    }

    function appendChild( o , child ){
        if( o == undefined || child ==undefined ) return;
        if( typeof child == 'string' ){
            o.innerHTML = child;
        }else{
            o.appendChild( child );
        }
    };

    /**
     * 获取查询字符串中指定key的值，如果没有则返回null
     * @param queryString
     * @param key
     */
    function getQueryParamValue(queryString, key) {
        var result = queryString.match(new RegExp('(?:^|&)' + key + '=(.*?)(?=$|&)'));
        return result && result[1];
    }

    /**
     * 将查询字符串指定key的值换成新值
     * @param queryString
     * @param key
     * @param newValue
     */
    function setQueryParamValue(queryString, key, newValue) {
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
     }

    /**
     * 替换元素
     * @param oldEl
     * @param newEl
     */
    function  replaceEl(oldEl,newEl){
        var parentEl=oldEl.parentNode;
        var refEl=DOM.next(oldEl);
        parentEl.removeChild(oldEl);
        if(refEl){
            YDOM.insertBefore(newEl,refEl);
        }else{
            parentEl.appendChild(newEl);
        }
    }

    /**
     * 获取一段HTML字符串前导标签的标签名
     * @param str
     */
    function getLeadingTagName(str){
        var m = str.match(/^\s*<(\w+)/);
        if(m){
            return m[1].toLowerCase();
        }else{
            return null;
        }
    }

    /**
     * 将一段HTML字符串转换成DOM元素，并返回该元素（要求有且仅有一个最高层级元素）
     * @param str
     */
    function parseStrToEl(str){
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
        var tempNode=doc.createElement('div');
            tempNode.innerHTML=tagPresuffix[tagName].pre + str + tagPresuffix[tagName].suf;
        var wrapper=YDOM.getElementsByClassName('wrapper','*',tempNode)[0];
        /*
        当使用文档碎片时，返回的对象会指向该文档碎片，而不是里面真正的元素，故暂只考虑一个最高层元素的情况
        var docFragment=doc.createDocumentFragment();
        while(YDOM.getFirstChild(wrapper)){
            docFragment.appendChild(YDOM.getFirstChild(wrapper));    
        }
        */
        return YDOM.getFirstChild(wrapper);
    }

    /**
     * 将columnDef的树形结构展开成二维数组结构
     * @param columnDef 表格的列设定
     * @param childrenKey 指向子列的key
     * @param callback 解析后的回调函数
     * @param callbackObj 回调函数中的this指向的对象
     */
    function parseColumnDefToFlat(columnDef,childrenKey,callback,callbackObj){
        childrenKey = childrenKey || 'children';
        //解析后的表头定义
        var theadColDef = [];
        //解析后的列定义
        var colDef = [];
        //额外列定义
        var colExtraDef = null;
        //定义选择列的方式
        var colSelectDef = null;
        //定义树深度
        var depth=1;

        //过滤列定义中的特殊列设定，要求特殊列设定全部要在最高层级设置
        function filterColDef(columnDef){
            var colDef=[];
            for( var i = 0 , len = columnDef.length ; i < len ; i++){
                //如果是扩展按钮列
                if(columnDef[i].xType == COL_EXTRA){
                    colExtraDef = columnDef[i];
                //如果是复选框列
                }else if(columnDef[i].xType == COL_CHECKBOX){
                    colSelectDef = COL_CHECKBOX;
                //如果是单选框列
                }else if(columnDef[i].xType == COL_RADIO){
                    colSelectDef = COL_RADIO;
                }else{
                    colDef.push(columnDef[i]);
                }
            }
            return colDef;
        }
        //得到过滤掉特殊列设定的列设定
        var pureColDef = filterColDef(columnDef);

        //判断tree是否有子树
        function ifTreeHasChildren(tree){
            for(var i = 0, len = tree.length; i < len; i++){
                if(tree[i][childrenKey] && tree[i][childrenKey].length>0){
                    return true;
                }
            }
            return false;
        }

        //更新当前节点所有父节点的childrenAmount值（子节点数）
        function updateFathersChildrenAmount(subTree){
            var step = subTree[childrenKey].length-1;
            var curTree = subTree;
            var curDepth = subTree[KS_DEPTH];
            while(curDepth > 0){
                var fatherTree = theadColDef[curDepth-1][curTree[KS_FATHER_IDX]];
                fatherTree[KS_CHILDREN_AMOUNT] = fatherTree[KS_CHILDREN_AMOUNT] + step;
                curTree = fatherTree;
                curDepth = fatherTree[KS_DEPTH];
            }
        }

        //转换树
        function parse(tree){
            //判定子树情况
            var treeHasChildren = ifTreeHasChildren(tree);
            //定义子树
            var subTree = [];
            theadColDef[depth-1] = [];
            for(var i = 0,ilen = tree.length; i < ilen; i++){
                /* 如果tree[i][KS_DEPTH]不存在，则记录tree[i]的真正深度
                 * 这里要做判定是因为如果在当前层级的tree有子节点的情况下
                 * tree[i]刚好没有子节点了，那么，会把tree[i]当做tree[i]下一层级的子节点
                 * 这样的话，确保得到的theadDef的最后一个元素（数组）为colDef
                 */
                if(tree[i][KS_DEPTH] == undefined) tree[i][KS_DEPTH] = depth-1;
                //jitree[i]添加到theadColDef[depth-1]数组中去
                theadColDef[depth-1].push(tree[i]);
                //如果tree有子树且tree[i]有子树
                if(treeHasChildren){
                    if(tree[i][childrenKey]){
                        //记录tree[i]的子元素数
                        tree[i][KS_CHILDREN_AMOUNT]=tree[i][childrenKey].length;
                        for(var j=0,jlen=tree[i][childrenKey].length;j<jlen;j++){
                            //在tree[i]子节点中记录tree[i]所在二维子数组的索引
                            tree[i][childrenKey][j][KS_FATHER_IDX]=i;
                            //将所有同一层级的tree[i]子节点放到一个数组
                            subTree.push(tree[i][childrenKey][j]);
                        }
                        updateFathersChildrenAmount(tree[i]);
                    }else{
                        tree[i][KS_CHILDREN_AMOUNT]=0;
                        subTree.push(tree[i]);
                    }
                //如果无子树
                }else{
                    tree[i][KS_CHILDREN_AMOUNT]=0;
                }
            }
            depth++;
            if(subTree.length>0){
                arguments.callee(subTree);
            }else{
                colDef = theadColDef[theadColDef.length-1];
                if(callback) callback.call(callbackObj || window , theadColDef, colDef, colExtraDef, colSelectDef);
            }
        }
        parse(pureColDef);
    }

    //显示指定元素
    function show(){
        for( var i = 0 ,len = arguments.length ; i < len ; i++ ){
            arguments[i].style.display='';
        }
    }
    //隐藏制定元素
    function hide(el){
        for( var i = 0 ,len = arguments.length ; i < len ; i++ ){
            arguments[i].style.display='none';
        }
    }

    S.DataGrid = DataGrid;
});
