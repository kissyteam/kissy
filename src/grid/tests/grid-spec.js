KISSY.use('grid/base,grid/store',function(S,Grid,Store){
	var columns = [{
				title : '表头1',
				dataIndex :'a',
				sortState :'ASC'
			},{
				id: '123',
				title : '表头2',
				dataIndex :'b',
				sortable:false
			},{
				title : '表头3',
				dataIndex : 'c'
		},{
			id : 'colhide',
			title : '隐藏',
			dataIndex : 'd',
			hide : true
		}],
		data = [{a:'123'},{a:'cdd',b:'edd'},{a:'1333',c:'eee',d:2}],
		store = new Store({
			
		});
	var grid = new Grid({
		render:'#J_Grid',
		columns : columns,
		tableCls : '',//'table table-bordered table-striped',
		//width : 900,
		store : store
	});
	grid.render();
	var gridEl = grid.get('el'),
		header = grid.get('header'),
		body = grid.get('body');

	function getSetWidth(el){
		var dom = el[0];
		if(dom){
			return dom.style.width;
		}
	}
	describe("测试Grid 生成", function () {
		it('测试Grid 元素生成',function(){
			expect(gridEl).not.toBe(null);
			expect(gridEl.hasClass('ks-grid')).toBeTruthy();
		});

		it('测试Grid 表头生成',function(){
			var headerEl = gridEl.one('.ks-grid-header');
			expect(headerEl).not.toBe(null);
		});

		it('测试Grid Body生成',function(){
			var bodyEl = gridEl.one('.ks-grid-body');
			expect(bodyEl).not.toBe(null);
		});

		it('测试Grid 命令栏的生成',function(){
			
		});

		it('测试Grid 分页栏的生成',function(){
			
		});
		it('测试Grid显示数据',function(){
			store.setResult(data);
			expect(gridEl.all('.ks-grid-row').length).toBe(data.length);
		});
	});

	describe("测试 子模块之间的联动", function () {
		describe("测试表头和内容之间的联动", function () {
			it('排序',function(){
				var index = 0,
					colObj = header.getColumnByIndex(index);
				spyOn(body, 'onLocalSort');
				colObj.set('sortState','DESC');
				expect(body.onLocalSort).toHaveBeenCalled();
			});

			it('测试更改列宽度',function(){
				var index = 2,
					colObj = header.getColumnByIndex(index),
					bodyEl = body.get('el'),
					firstRowEl = bodyEl.one('.ks-grid-header-row'),
					width = 150,
					cellEl = body.get('view').findCell(colObj.get('id'),firstRowEl);

				colObj.set('width',width);
				expect(getSetWidth(cellEl)).toBe(width + 'px');
			});

			it('显示、隐藏列',function(){
				var index = 2,
					colObj = header.getColumnById('colhide'),
					bodyEl = body.get('el'),
					firstRowEl = bodyEl.one('.ks-grid-header-row'),
					width = 150,
					cellEl = body.get('view').findCell(colObj.get('id'),firstRowEl);
				expect(cellEl.css('display')).toBe('none');
				colObj.set('hide',false);
				expect(cellEl.css('display')).toBe('table-cell');
			});
		});

		describe("测试分页置项", function () {
			
		});

		describe("测试维度配置项", function () {
			it('测试Grid，设置宽度',function(){
				var width = 500;
				grid.set('width',width);
				expect(header.get('width')).toBe(width);
				expect(body.get('width')).toBe(width);
			});/**/

			it('测试forceFit = false时,Grid有宽度，调整列的宽度',function(){
				var width = 300;
				grid.set('width',width);
				var index = 2,
					colObj = header.getColumnByIndex(index),
					bodyEl = body.get('el'),
					tableEl = bodyEl.one('table'),
					formColWidth = colObj.get('width'),
					formTableWidth = tableEl.width();
				
				colObj.set('width',formColWidth + 100);
				if(header.getColumnsWidth() > width){
					expect(tableEl.width()).toBe(formTableWidth + 100);
				}else{
					expect(getSetWidth(tableEl)).toBe(width + 'px');
				}/**/
			});
			it('测试forceFit = true时，Grid宽度设置',function(){
				
			});

			it('测试表格高度设置',function(){
				var height = 300;
				grid.set('height',height);
				expect(gridEl.hasClass('ks-grid-height')).toBeTruthy();
			});

			it('测试表格高度设置',function(){
				var bodyEl = body.get('el'),
					tableEl = bodyEl.one('table'),
					width = grid.get('width'),
					height =  400;//tableEl.height();
				grid.set('height',height);
				if(header.getColumnsWidth() <= width){
					expect(getSetWidth(tableEl)).toBe((width - 17) + 'px');
				}else{
					expect(getSetWidth(tableEl)).toBe(header.getColumnsWidth() + 'px');	
				}
				expect(gridEl.hasClass('ks-grid-height')).toBeTruthy();
			});
			
		});
	});

	describe("测试Grid 显示数据", function () {
		it('测试Grid直接显示数据，不通过store',function(){
			
		});

		it('测试Grid，通过store显示数据',function(){
			
		});

		it('测试Grid，通过store异步加载数据',function(){
			
		});

		it('测试Grid，分页',function(){
			
		});

		it('测试Grid，前端排序',function(){
			
		});

		it('测试Grid，远程排序',function(){
			
		});
	});

	
	describe("测试Grid 事件", function () {
		it('测试Grid，点击列',function(){
			
		});

		it('测试Grid，列选中，取消选中，全选，全部取消选中',function(){
			
		});
		
		it('测试Grid，全选，全部取消选中',function(){
			
		});
	});
});