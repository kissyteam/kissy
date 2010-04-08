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
    var DOM = S.DOM, Event = S.Event,YDOM = YAHOO.util.Dom,
        doc=document,
        COL_CHECKBOX='col-checkbox',COL_RADIO='col-radio',COL_EXTRA='col-extra',
        KS_DEPTH='KSDepth',KS_FATHER_IDX='KSFatherIdx',KS_CHILDREN_AMOUNT='KSChildrenAmount',
        LOADING_EL_STR='<tbody><tr class="row row-loading"><td colspan="10"></td></tr></tbody>'
        ;

    /**
     * DataGrid
     * @constructor
     */
    function DataGrid(container,datasourceUri){
        //设置容器
        this.container = S.get(container);
            DOM.addClass(this.container,'ks-datagrid');
        //生成表格元素
        this.tableEl=doc.createElement('table');
            this.container.appendChild(this.tableEl);
            DOM.addClass(this.tableEl,'datagrid-table');
        //生成loading元素
        this.loadingEl=parseStrToEl(LOADING_EL_STR);
            this.tableEl.appendChild(this.loadingEl);
            this.loadingEl.style.display='none';
        this.datasource=datasourceUri;
        
        //注册所有点击事件
        Event.add(this.tableEl,'click',function(e){

        });
    }

    S.mix(DataGrid.prototype,{
        /**
         * 定义datasource，指定datasource里各字段的用途（若未定义，则使用默认值）
         * datasourceDef={
         *      success:'success',
         *      listData:'',
         *      recordPrimaryKey:'',
         *      dataStart:'',
         *      datalength:'',
         *      dataFilter:'',
         *      info:'info'
         * }
         */
        datasouceDef:null,
        /**
         * JSON格式的数据源
         */
        liveData:null,
        /**
         * 数据源中的列表数据
         */
        listData:null,
        /**
         * 定义列，用于渲染（若未定义，则渲染dataList中所有字段）
         * columnDef=[
         *      {label:'',xType:COL_EXPAND},
         *      {label:'',xType:COL_CHECKBOX},
         *      {label:'各种可排序列',children:[
         *          {label:'可排序列',sortable:true,field:'index'},
         *          {label:'升序列',sortable:true,field:'age'}
         *      ]},
         *      {label:'字段渲染',children:[
         *          {label:'单一字段',field:'name'},
         *          {label:'复合字段',field:['nickname','homepage'],render:funtion('nickname','homepage'){...}}
         *      ]},
         *      {label:'',xType:COL_EXTRA,field:[...],render:function(){...}}
         * ]
         */
        columnDef:null,
        //总列数
        columnAmount:null,
        //解析columnDef后得到的表头列定义
        theadColDef:null,
        //解析columnDef后得到的表身普通列定义
        colDef:null,
        //解析columnDef后得到的表身扩展列定义
        colExtraDef:null,
        //解析columnDef后得到的选择列定义
        colSelectDef:null,
        /**
         * 定义字段，用于修改（若未定义，则所有字段都以填写输入框的形式修改）
         * fieldDef={
         *      index:{},
         *      realname:{},
         *      nickname:{},
         *      pagename:{},
         *      pageurl:{}
         * }
         */
        fieldDef:null,
        //表格
        tableEl:null,
        //colgroup元素
        colgroupEl:null,
        //表头
        theadEl:null,
        //显示loading的tbody
        loadingEl:null,
        //装载数据的tbody
        tbodyEl:null,
        //表尾
        tfootEl:null,
        //翻页
        paginationEl:null,
        startLoading:function(){
            this.loadingEl.style.display='table-row';
        },
        endLoading:function(){
            this.loadingEl.style.display='none';
        },
        init:function(postData){
            this.startLoading();
            postData = postData || '';
            if(!this.columnDef){
                
            }
            var callback = function(flatColumnDef, colExtraDef, colSelectDef){
                this.theadColDef = flatColumnDef;
                this.colDef = flatColumnDef[flatColumnDef.length-1];
                this.colExtraDef = colExtraDef;
                this.colSelectDef = colSelectDef;
                this._renderThead();
                this._renderTbody();
                this._renderTfoot();
                this.endLoading();
            };
            parseColumnDefToFlat(this.columnDef,'children',callback,this);
        },
        _renderThead:function(){
            var theadColDef=this.theadColDef;
            var colgroupHTMLFrag = '<colgroup>';
            var theadHTMLFrag = '<thead>';
            var depth = theadColDef.length;
            for(var i = 0 , ilen = theadColDef.length ; i < ilen ; i++){
                theadHTMLFrag += '<tr class="row">';
                //扩展按钮列
                if( i == 0){
                    if(this.colExtraDef){
                       theadHTMLFrag += '<th class="col-extra" rowspan="' + ilen + '"></th>';
                    }
                    if(this.colSelectDef == COL_CHECKBOX){
                       theadHTMLFrag += '<th class="col-extra" rowspan="' + ilen + '"><i class="icon-checkbox"></i></th>';
                    }else if(this.colSelectDef == COL_RADIO){
                       theadHTMLFrag += '<th class="col-extra" rowspan="' + ilen + '"></th>';
                    }
                }
                for(var j = 0 , jlen = theadColDef[i].length ; j < jlen ; j++){
                    theadHTMLFrag += '<th';
                    //如果无子th
                    if(theadColDef[i][j][KS_CHILDREN_AMOUNT] == 0){
                        //特殊列
                        if(theadColDef[i][j].xType){
                            colgroupHTMLFrag += '<col width="25" />';
                            theadHTMLFrag += ' class="col-extra"';
                        }else{
                            colgroupHTMLFrag += '<col />';
                            //排序
                            if(theadColDef[i][j].sortable){
                                theadHTMLFrag += ' class="sortable"';
                            }
                        }
                        //rowspan
                        if(depth-1>i){
                            theadHTMLFrag += ' rowspan="' + (depth-i) + '"';
                        }
                    //如果有子th
                    }else{
                        theadHTMLFrag += ' colspan="' + theadColDef[i][j][KS_CHILDREN_AMOUNT] + '"';
                    }
                    theadHTMLFrag += '>';
                    //文字标签
                    theadHTMLFrag += theadColDef[i][j].label ? theadColDef[i][j].label : '';
                    if(theadColDef[i][j][KS_CHILDREN_AMOUNT] == 0){
                        //全选 icon
                        theadHTMLFrag += ( theadColDef[i][j].xType == COL_CHECKBOX ) ? '<i class="icon-checkbox"></i>' : '';
                        //排序 icon
                        theadHTMLFrag += theadColDef[i][j].sortable ? '<i class="icon"></i>' : '';
                    }                     
                    theadHTMLFrag += '</th>';
                }
                theadHTMLFrag += '</tr>';
            }
            colgroupHTMLFrag += '</colgroup>';
            theadHTMLFrag += '</thead>';
            if(this.colgroupEl) this.tableEl.removeChild(this.colgroupEl);
            if(this.theadEl) this.tableEl.removeChild(this.theadEl);
            this.colgroupEl = parseStrToEl(colgroupHTMLFrag);
            this.theadEl = parseStrToEl(theadHTMLFrag);
            this.tableEl.appendChild(this.colgroupEl);
            this.tableEl.appendChild(this.theadEl);
            this.columnAmount=this.colgroupEl.getElementsByTagName('col').length;
        },
        _renderTbody:function(){
            var listData = this.listData;
            var tbodyHTMLFrag = '<tbody>';
            for(var i = 0 , len = listData.length ; i < len ; i++){
                 tbodyHTMLFrag += this._renderRow(listData[i],i);   
            }
            tbodyHTMLFrag += '</tbody>';
            if(this.tbodyEl) this.tableEl.removeChild(this.tbodyEl);
            this.tbodyEl = parseStrToEl(tbodyHTMLFrag);
            this.tableEl.appendChild(this.tbodyEl);
        },
        /**
         * 渲染单条数据
         * @param {Object} recordData 单条数据
         * @param {Boolean} [returnType] 返回类型，如果为1的话返回dom元素，如果为0则返回拼接好的HTML片段
         * @param {String} [rowCls] 可以额外加到tr上的class，可用来高亮显示单条数据(目前无对外入口)
         */
        _renderRow:function(recordData, idx, returnType, rowCls){
            var colDef = this.colDef;
            var rowHTMLFrag = '<tr class="row' + (rowCls ? ' ' + rowCls : '') + '"' + (idx ? 'data-idx="' + idx + '"' : '') + '>';
            //扩展按钮
            if(this.colExtraDef) rowHTMLFrag += '<td class="col-extra"><i class="icon-expand"></i></td>';
            //复选或者单选按钮
            if(this.colSelectDef == COL_CHECKBOX){
                 rowHTMLFrag += '<td class="col-extra"><i class="icon-checkbox"></i></td>';
            }else if(this.colSelectDef == COL_RADIO){
                 rowHTMLFrag += '<td class="col-extra"><i class="icon-radio"></i></td>';
            }
            for(var i = 0 , ilen = this.colDef.length ; i < ilen ; i++){
                rowHTMLFrag += '<td>';
                if(typeof colDef[i].field != 'undefined'){
                    //单字段
                    if( typeof colDef[i].field == 'string'){
                        var fieldValue = recordData[colDef[i].field];
                        //需要经过渲染的
                        if(colDef[i].render){
                            rowHTMLFrag += colDef[i].render(fieldValue);
                        //不需要经过渲染的
                        }else{
                            rowHTMLFrag += fieldValue;
                        }
                    //复合字段
                    }else if(S.isArray(colDef[i].field)){
                        var fieldValueArr=[];
                        for(var j = 0 , jlen = colDef[i].field.length ; j < jlen ; i++){
                            fieldValueArr.push(recordData[colDef[i].field[j]]);
                        }
                        //需要经过渲染的
                        if(colDef[i].render){
                           rowHTMLFrag += colDef[i].render.apply(window,fieldValueArr);
                        //不需要经过渲染的
                        }else{
                            rowHTMLFrag += fieldValueArr.toString();
                        }
                    };
                }else{
                    rowHTMLFrag += ' ';
                }
                rowHTMLFrag += '</td>';
            }
            rowHTMLFrag += '</tr>';
            if(returnType){
                return parseStrToEl(rowHTMLFrag);
            }else{
                return rowHTMLFrag;
            }
        },
        _renderRowExtra:function(){

        },
        _renderTfoot:function(){
            var tfootHTMLFrag='<tfoot><tr><td colspan="' + this.columnAmount + '"></td></tr></tfoot>';
            if(this.tfootEl) this.tableEl.removeChild(this.tfootEl);
            this.tfootEl = parseStrToEl(tfootHTMLFrag);
            this.tfootEl.appendChild(this.tbodyEl);
        },
        update:function(){

        },
        renderPagination:function(){},
        appendRecord:function(){},
        addRecord:function(record){},
        modifyRecord:function(record){},
        deleteRecord:function(recordIdx){},
        moveRecord:function(recordIdx,toIndex){},
        select:function(recordIdx){},
        selectAll:function(){},
        deselectAll:function(){},
        selectInverse:function(){},
        getSelectedRecord:function(){}
    });

    DataGrid.Config={
        
    };

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
            YDOM.insertBefore(newEl,refEl)
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
            alert('your html string is illegal.');
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
     * @param columnDef
     */
    function parseColumnDefToFlat(columnDef,childrenKey,callback,callbackObj){
        childrenKey = childrenKey || 'children';
        //定义转换后的二维数组
        var flatColumnDef=[];
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
                var fatherTree = flatColumnDef[curDepth-1][curTree[KS_FATHER_IDX]];
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
            flatColumnDef[depth-1] = [];            
            for(var i = 0,ilen = tree.length; i < ilen; i++){
                //记录tree[i]所在子数组本身的索引
                tree[i][KS_DEPTH] = depth-1;
                //将tree[i]添加到flatColumnDef[depth-1]数组中去
                flatColumnDef[depth-1].push(tree[i]);
                //如果tree的节点有子树且tree[i]有子树
                if(treeHasChildren && tree[i][childrenKey]){
                    //记录tree[i]的子元素数
                    tree[i][KS_CHILDREN_AMOUNT]=tree[i][childrenKey].length;
                    for(var j=0,jlen=tree[i][childrenKey].length;j<jlen;j++){
                        //在tree[i]子节点中记录tree[i]所在二维子数组的索引
                        tree[i][childrenKey][j][KS_FATHER_IDX]=i;
                        //将所有同一层级的tree[i]子节点放到一个数组
                        subTree.push(tree[i][childrenKey][j]);
                    }
                    updateFathersChildrenAmount(tree[i]);
                //如果无子树
                }else{
                    tree[i][KS_CHILDREN_AMOUNT]=0;
                }
            }
            depth++;
            if(subTree.length>0){
                arguments.callee(subTree);
            }else{
                callback.call(callbackObj || window , flatColumnDef, colExtraDef, colSelectDef);
                //console.log(flatColumnDef);
                //console.log(colExtraDef);
                //console.log(colSelectDef);
            }
        }
        parse(pureColDef);
    }
    
    var test=[
       {label:'复选框',xType:COL_CHECKBOX},
       {label:'简单列'},
       {label:'可排序列',children:[
           {label:'升序列',sortable:true},
           {label:'降序列',sortable:true},
       ]},
       {label:'三层复合列',children:[
           {label:'第一列',children:[
               {label:'子列1'},
               {label:'子列2'},
           ]},
           {label:'第二列',sortable:true,field:'age'},
       ]},
       {label:'扩展列',xType:COL_EXTRA}
    ];
    parseColumnDefToFlat(test,null,function(){});

    S.DataGrid = DataGrid;
});
