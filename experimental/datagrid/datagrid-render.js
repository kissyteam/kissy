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
});