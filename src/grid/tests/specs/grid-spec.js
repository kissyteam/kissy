/**/
KISSY.use('grid/base,grid/store,grid/numberpagingbar',function(S,Grid,Store){//

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
			url : '../data/number40.php',
			autoLoad : false
		});
	var grid = new Grid({
		render:'#J_Grid',
		columns : columns,
		width:800,
		height:500,
		tableCls : '',
		tbar : {
					xclass : 'bar' , 
					
					children : [{xtype : 'button',
						elCls : 'bar-test',
						text : '测试3',
						listeners : {
							'click':function(event){
								alert('122');
							}
						}
					}]
				},

		bbar : {xclass:'pagingbar-number',store : store,pageSize : 3},
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

		it('测试Grid初始化宽度',function(){
			expect(grid.get('width')).toBe(header.get('width'));
			expect(grid.get('width')).toBe(body.get('width'));
			expect(gridEl.hasClass('ks-grid-width')).toBeTruthy();
		});

		it('测试Grid初始化高度',function(){
			expect(gridEl.hasClass('ks-grid-height')).toBeTruthy();
			expect(body.get('height')).not.toBe(undefined);
		});
		
		it('测试Grid 命令栏的生成',function(){
			expect(gridEl.one('.bar-test')).not.toBe(null);
		});

		it('测试Grid 分页栏的生成',function(){
			expect(gridEl.one('.ks-pagingbar')).not.toBe(null);
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
				spyOn(body, 'onLocalSort').andCallThrough();
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
			it('添加列,删除列',function(){
				var cfg = {id : 'new1',title:'新建表头'},
					colObj = null,
					index = 0,
					bodyEl = body.get('el'),
					tableEl = bodyEl.one('table'),
					rowEl = null,
					cellEl = null;
				colObj = grid.addColumn(cfg);
				index = header.getColumnIndex(colObj);
				expect(index).not.toBe(-1);
				rowEl = tableEl.one('.ks-grid-row');
				cellEl = body.findCell(cfg.id, rowEl);
				expect(cellEl).not.toBe(null);

				grid.removeColumn(colObj);
				index = header.getColumnIndex(colObj);
				expect(index).toBe(-1);
				rowEl = tableEl.one('.ks-grid-row');
				cellEl = body.findCell(cfg.id, rowEl);
				expect(cellEl).toBe(null);/**/
			});
		});

		
/**/
		describe("测试维度配置项", function () {
			it('测试Grid，设置宽度',function(){
				var width = 500;
				grid.set('width',width);
				expect(header.get('width')).toBe(width);
				expect(body.get('width')).toBe(width);
			});

			
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
				}
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
			it('测试滚动条',function(){
				var callBack = jasmine.createSpy(),
					left = 30;
				body.on('scroll',function(e){
					callBack(e.scrollLeft);
				});
				spyOn(header, 'scrollTo').andCallThrough();
				body.get('el').scrollLeft(left);
				waits(100);
				runs(function(){
					expect(callBack).toHaveBeenCalledWith(left);
					expect(header.scrollTo).toHaveBeenCalled();
					grid.set('width',800);
				});
			});
		});

		describe("测试分页栏", function () {
			it('测试加载数据后分页栏的状态',function(){
				store.load();
				waits(100);
				runs(function(){
					expect(grid.get('bbar').get('totalPage')).not.toBe(1);
				});
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
		var CLS_SELECTED = 'ks-grid-row-selected',
			bodyEl = body.get('el'),
			tableEl = bodyEl.one('table');
		it('测试Grid，单选模式下点击行',function(){
			
			var rows =  tableEl.all('.ks-grid-row'),
				rowEl = S.one(rows[0]);
			body._rowClickEvent({currentTarget : rowEl[0]});
			waits(100);
			runs(function(){
				expect(rowEl.hasClass(CLS_SELECTED)).toBeTruthy();
				body._rowClickEvent({currentTarget : rows[1]});
				waits(100);
				runs(function(){
					expect(tableEl.all('.'+CLS_SELECTED).length).toBe(1);
				});
			});
		});
		it('测试Grid，单选模式移除所有选中',function(){
			body.clearSelection();
			expect(tableEl.all('.'+CLS_SELECTED).length).toBe(0);
		});

		it('测试Grid，多选模式下点击行',function(){
			
			var rows =  tableEl.all('.ks-grid-row'),
			rowEl = S.one(rows[0]);
			grid.set('multiSelect',true);
			body._rowClickEvent({currentTarget : rowEl[0]});
			waits(100);
			runs(function(){
				expect(rowEl.hasClass(CLS_SELECTED)).toBeTruthy();
				body._rowClickEvent({currentTarget : rows[1]});
				waits(100);
				runs(function(){
					expect(tableEl.all('.'+CLS_SELECTED).length).toBe(2);
					body._rowClickEvent({currentTarget : rowEl[0]});
					waits(100);
					runs(function(){
						expect(rowEl.hasClass(CLS_SELECTED)).not.toBeTruthy();
					});
				});
				
			});
		});

		it('测试Grid，设置、获取选中',function(){
			var index = 1,
				record = store.getResult()[index];
			grid.clearSelection();
			expect(tableEl.all('.'+CLS_SELECTED).length).toBe(0);

			grid.setSelection(record);
			expect(tableEl.all('.ks-grid-row').item(index).hasClass(CLS_SELECTED)).toBeTruthy();
		});
		
		
		it('测试Grid，全选，全部取消选中',function(){
			var rows = tableEl.all('.ks-grid-row');
			grid.setAllSelection();
			rows.each(function(row){
				expect(row.hasClass(CLS_SELECTED)).toBeTruthy();
			});
			grid.clearSelection();
			rows.each(function(row){
				expect(row.hasClass(CLS_SELECTED)).not.toBeTruthy();
			});
		});

		
	});
});


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
			dataIndex : 'd'
		}],
		data = [{a:'123'},{a:'cdd',b:'edd'},{a:'1333',c:'eee',d:2}],
		store = new Store({
			autoLoad : true,
			proxy :{
				memeryData : data	
			}
		});	
	var grid = new Grid({
		render:'#J_Grid1',
		columns : columns,
		store : store,
		forceFit : true
	});
	
	grid.render();
	var header = grid.get('header'),
		body = grid.get('body');
	describe("测试Grid forceFit = true", function () {
		var emptyCell = header.get('el').one('.ks-grid-hd-empty');
		it('测试列自适应',function(){
			var width = 500;
			grid.set('width',width);
			expect(header.getColumnsWidth()).toBe(width);
		});

	it('测试列显示隐藏列后的自适应',function(){
			var index = 2,
				colObj = header.getColumnByIndex(index);
			colObj.set('hide',true);
			expect(header.getColumnsWidth()).toBe(header.get('width'));

			colObj.set('hide',false);
			expect(header.getColumnsWidth()).toBe(header.get('width'));
		});

		it('测试列改变宽度后的自适应',function(){
			var index = 2,
				colObj = header.getColumnByIndex(index);
			colObj.set('width',150);
			expect(header.getColumnsWidth()).toBe(header.get('width'));
			colObj.set('width',100);
			expect(header.getColumnsWidth()).toBe(header.get('width'));
		});

		it('设置高度后，测试列自适应',function(){
			grid.showData(data);
			var height = 500;
			grid.set('height',height);
			expect(header.getColumnsWidth()).toBe(header.get('width') - 17);
		});/**/


	});

});