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
    var DOM = S.DOM, Event = S.Event,YDOM = YAHOO.util.Dom,YConnect=YAHOO.util.Connect,
        doc=document,
        COL_CHECKBOX='col-checkbox',COL_RADIO='col-radio',COL_EXTRA='col-extra',
        KS_DEPTH='KSDepth',KS_FATHER_IDX='KSFatherIdx',KS_CHILDREN_AMOUNT='KSChildrenAmount',
        LOADING_EL_STR='<tbody><tr class="row row-loading"><td></td></tr></tbody>',
        POST='post',GET='get'
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
        //记录数据源uri
        this.datasourceUri=datasourceUri;

    }

    S.mix(DataGrid.prototype,{
        connectMethod:POST,
        /**
         * 定义datasource，指定datasource里各字段的用途(必须手工定义)
         * datasourceDef={
         *      success:'success',
         *      listData:'dataList',
         *      recordPrimaryKey:'id',
         *      dataStart:'start',
         *      datalength:'pageSize',
         *      dataAmount:'total'
         *      info:'info'
         * }
         */
        datasourceDef:null,
        requestResult:null,
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
         *          {label:'复合字段',field:['nickname','homepage'],parser:funtion('nickname','homepage'){...}}
         *      ]},
         *      {label:'',xType:COL_EXTRA,field:[...],parser:function(){...}}
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
            if(this.columnAmount){
                var loadingTd = this.loadingEl.getElementsByTagName('td')[0];
                loadingTd.colSpan = this.columnAmount;
            }
            //notice：没有把loadingEl加到tableEl中，采用diaplay:none的方式来切换loading框的显示，是因为ie下使用js去display:none loadingEl会有点问题：高度无法消除，下边框线一直可见
            if(YDOM.getFirstChild(this.tableEl)){
                var firstChild = YDOM.getFirstChild(this.tableEl);
                YDOM.insertBefore(this.loadingEl, firstChild);
            }else{
                this.tableEl.appendChild(this.loadingEl);
            }
        },
        endLoading:function(){
            this.tableEl.removeChild(this.loadingEl);
        },
        /**
         * 每次异步请求返回值的基本处理
         * @param o
         */
        _dataPreProcessor:function(o){
            this.liveData = eval('('+o.responseText+')');
            this.requestResult = this.liveData[this.datasourceDef.success];
            if(this.requestResult){
                this.listData = this.liveData[this.datasourceDef.listData];
            }else{
                var info = this.liveData[this.datasourceDef.info];
                alert('错误：'+info);
            }
        },
        /**
         * 每次解析完columnDef之后的基本处理
         */
        _parseColumnDefPreProcessor:function(theadColDef, colDef, colExtraDef, colSelectDef){
            this.theadColDef =theadColDef;
            this.colDef = colDef;
            this.colExtraDef = colExtraDef;
            this.colSelectDef = colSelectDef;
        },
        init:function(postData){
            //确认datasourceDef定义过
            if(!this.datasourceDef){
                alert('请先定义组件的datasourceDef属性。');
                return;
            }
            //显示loading状态
            this.startLoading();
            var callback={
                success:function(o){
                    this._dataPreProcessor(o);
                    //如果请求成功，且返回数据正确
                    if(this.requestResult){
                        //如果columnDef没有定义
                        if(!this.columnDef){
                            this.columnDef=[];
                            var recordExample = this.listData[0];
                            for(var i in recordExample){
                                this.columnDef.push({label:i,field:i});
                            }
                        }
                        //解析columnDef，并设置回调（回调套回调，真bt啊）
                        parseColumnDefToFlat(this.columnDef,'children',function(theadColDef, colDef, colExtraDef, colSelectDef){
                            this._parseColumnDefPreProcessor(theadColDef, colDef, colExtraDef, colSelectDef);
                            this._renderThead();
                            //渲染表头后，表格的列数确定，要重新渲染一次loading
                            this.startLoading();
                            this._renderTbody();
                            this._renderTfoot();
                            this.endLoading();

                            //根据特殊列设定添加事件
                            if(colExtraDef){
                                //点击展开按钮，加载扩展列内容，切换扩展列显示
                            }
                            //行选择方式
                            if( colSelectDef == COL_CHECKBOX ){

                            }else if( colSelectDef == COL_RADIO ){

                            }

                        },this);
                    }
                },
                failure:function(){alert('获取数据失败，请刷新页面重试或联系管理员。');},
                scope:this
            };
            YConnect.asyncRequest(this.connectMethod,this.datasourceUri,callback,postData || '');
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
                    if(theadColDef[i][j][KS_DEPTH] != i) continue;
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
                            theadHTMLFrag += ' rowspan="' + (depth-theadColDef[i][j][KS_DEPTH]) + '"';
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
        _renderCellInner:function(cellDef,recordData){
            var inner='';
            if(typeof cellDef.field != 'undefined'){
                //如果field为单字段，且指向正确
                if( typeof cellDef.field == 'string' && recordData[cellDef.field]){
                    var fieldValue = recordData[cellDef.field];
                    //需要经过渲染的
                    if(cellDef.parser){
                        inner += cellDef.parser(fieldValue);
                    //不需要经过渲染的
                    }else{
                        inner += fieldValue;
                    }
                //如果field为复合字段（为方便起见，这里不验证每个字段是否有效）
                }else if(S.isArray(cellDef.field)){
                    var fieldValueArr=[];
                    for(var j = 0 , jlen = cellDef.field.length ; j < jlen ; j++){
                        fieldValueArr.push(recordData[cellDef.field[j]]);
                    }
                    //需要经过渲染的
                    if(cellDef.parser){
                       inner += cellDef.parser.apply(window,fieldValueArr);
                    //不需要经过渲染的
                    }else{
                        inner += fieldValueArr.toString();
                    }
                }else{
                    inner += ' ';
                }
            }else{
                //如果没有定义field，但有渲染器的时候，输出渲染器渲染结果
                if(cellDef.parser){
                    inner += cellDef.parser();
                //否则输出空格
                }else{
                    inner += ' ';
                }
            }
            return inner;
        },
        /**
         * 渲染单条数据
         * @param {Object} recordData 单条数据
         * @param {Boolean} [returnType] 返回类型，如果为1的话返回dom元素，如果为0则返回拼接好的HTML片段
         * @param {String} [rowCls] 可以额外加到tr上的class，可用来高亮显示单条数据(目前无对外入口)
         */
        _renderRow:function(recordData, idx, returnType, rowCls){
            var colDef = this.colDef;
            var rowHTMLFrag = '<tr class="row' + (rowCls ? ' ' + rowCls : '') + '"' + (!(idx == null || typeof idx == 'undefined') ? ' data-idx="' + idx + '"' : '') + '>';
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
                    //如果field为单字段，且指向正确
                    if( typeof colDef[i].field == 'string' && recordData[colDef[i].field]){
                        var fieldValue = recordData[colDef[i].field];
                        //需要经过渲染的
                        if(colDef[i].parser){
                            rowHTMLFrag += colDef[i].parser(fieldValue);
                        //不需要经过渲染的
                        }else{
                            rowHTMLFrag += fieldValue;
                        }
                    //如果field为复合字段（为方便起见，这里不验证每个字段是否有效）
                    }else if(S.isArray(colDef[i].field)){
                        var fieldValueArr=[];
                        for(var j = 0 , jlen = colDef[i].field.length ; j < jlen ; j++){
                            fieldValueArr.push(recordData[colDef[i].field[j]]);
                        }
                        //需要经过渲染的
                        if(colDef[i].parser){
                           rowHTMLFrag += colDef[i].parser.apply(window,fieldValueArr);
                        //不需要经过渲染的
                        }else{
                            rowHTMLFrag += fieldValueArr.toString();
                        }
                    }else{
                        rowHTMLFrag += ' ';
                    }
                }else{
                    //如果没有定义field，但有渲染器的时候，输出渲染器渲染结果
                    if(colDef[i].parser){
                        rowHTMLFrag += colDef[i].parser();
                    //否则输出空格
                    }else{
                        rowHTMLFrag += ' ';
                    }
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
            this.tableEl.appendChild(this.tfootEl);
        },
        update:function(){

        },
        renderPagination:function(){},
        appendRecord:function(){},
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
                if(typeof tree[i][KS_DEPTH] == 'undefined') tree[i][KS_DEPTH] = depth-1;
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
                //console.log(theadColDef);
                //console.log(colDef);
                //console.log(colExtraDef);
                //console.log(colSelectDef);
            }
        }
        parse(pureColDef);
    }

    function enableColExtra(tableEl){

    }

    function enableSelectByCheckbox(tableEl){

    }

    function enableSelectByRaio(tableEl){

    }

    S.DataGrid = DataGrid;
});
