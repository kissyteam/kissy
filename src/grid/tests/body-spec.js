KISSY.use('grid/gridbody,grid/header',function(S,Body,Header){
	var columns = [{
				title : '表头1',
				dataIndex : 'a',
				sortState :'ASC'
			},{
				id: '123',
				title : '表头2',
				dataIndex : 'b',
				sortable:false
			},{
				title : '表头3',
				dataIndex : 'c',
		}];
		header = new Header({
			render : '#J_Header',
			tableCls : 'table table-bordered table-striped',
			children: S.clone(columns)
		});
	var body = new Body({
		render:'#J_Body',
		tableCls : 'table table-bordered table-striped',
		columns : header.get('children')
	});
	header.render();
	body.render();
	var bodyEl = body.get('el'),
		tbodyEl = body.get('tbodyEl'),
		columns = body.get('columns');
	describe("测试 body 生成", function () {
		it('测试Body容器生成',function(){
			expect(bodyEl).toNotBe(null);
			expect(tbodyEl).toNotBe(null);
			expect(tbodyEl).toNotBe(undefined);
			expect(bodyEl.hasClass('ks-grid-body')).toBeTruthy();
		});

		it('测试Body 生成行',function(){
			var data = [{},{},{}];
			body.showData(data);
			var children = tbodyEl.children();
			expect(data.length == children.length);
			children.each(function(row){
				expect(row.hasClass('ks-grid-row')).toBeTruthy();
			});
		});

		it('测试Body 生成单元格',function(){
			var data = [{a:'123'},{a:'cdd',b:'edd'},{a:'1333',c:'eee'}];
			body.showData(data);
			var children = tbodyEl.children();
			expect(data.length == children.length);
			var firstRow = S.one(children[0]);
			expect(columns.length).toBe(firstRow.children().length);
		});

		it('测试添加数据',function(){
			
		});
		it('测试删除数据',function(){
			
		});
		it('测试更新数据',function(){
			
		});
		it('测试本地排序数据',function(){
			
		});
	});

	describe("测试 body 加载数据", function () {
		it('测试成功加载数据',function(){
			
		});

		it('测试失败加载数据',function(){
			
		});
		
	});
});