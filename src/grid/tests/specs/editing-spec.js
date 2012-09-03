KISSY.use('grid/editor,grid/editing,grid/base,grid/store',function(S,Editor,Editing,Grid,Store){
	var store = new Store(),
		columns = [{
				title : '表头1',
				dataIndex :'a',
				sortState :'ASC'
			},{
				id: '123',
				title : '表头2',
				dataIndex :'b',
				editor : {
					xclass : 'grid-editor'
				},
				sortable:false
			},{
				title : '表头3',
				dataIndex : 'c',
				editor : {
					type : 'number',
                    validator: function(v){
                        if(Number(v) > 100){
                            return '不能大于100';
                        }
                    }
				}
		},{
			id : 'colhide',
			title : '隐藏',
			dataIndex : 'd'
		}],
		data = [{a:'123'},{a:'cdd',b:'edd'},{a:'1333',c:'eee',d:2}];
		
	var grid = new Grid({
		render:'#J_Grid',
		columns : columns,
		plugins : [Editing.CellEditing],
		forceFit : true,
		store : store
	});
	grid.render();
	store.setResult(data);
});