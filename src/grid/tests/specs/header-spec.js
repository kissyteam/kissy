KISSY.use('grid/header',function(S,Header){
	var columns = [{
				title : '表头1',
				sortState :'ASC'
			},{
				id: '123',
				title : '表头2',
				sortable:false
			},{
				title : '表头3',
				dataIndex : 'abc',
				tpl : '<div class="ks-grid-hd-title">{{dataIndex}}</div>'
		},{
			id:'hide',
			//visible : false,
			title:'隐藏列'
		}];
		header = new Header({
			render : '#J_Header',
			tableCls : '',
			columns : S.clone(columns)
		});

	header.render();
	var headerEl = header.get('el');
	function getTitle(colEl){
		return 	colEl.one('.ks-grid-hd-title').text();
	}

	function getSetWidth(el){
		var dom = el[0];
		if(dom){
			return dom.style.width;
		}
	}
	describe("测试 header 生成", function () {
		var container = headerEl.one('tr'),
			children = container.children().filter(function(node){
				if(S.one(node).hasClass('ks-grid-hd-empty')){
					return false;
				}
				return true;
			});
		it('测试生成header 容器',function(){
			expect(headerEl).toNotBe(undefined);
			expect(headerEl.hasClass('ks-grid-header')).toBeTruthy();
			expect(children.length).toBe(columns.length);
		});
		it('测试生成列',function(){
			var index = 0;
			var text = getTitle(S.one(children[index]));
			expect(text).toBe(columns[index].title);
		});

		it('测试列隐藏',function(){
			 S.each(columns,function(col,index){
				if(col.visible === false){
					var display = S.one(children[index]).css('display');
					expect(display).toBe('none');
				}
			 });
		});

		it('测试生成可排序的列',function(){
			 //列默认允许排序
			 S.each(columns,function(col,index){
				var el = S.one(children[index]),
					sortEl = el.one('.ks-grid-sort-icon');
				//用户自定义模板时，不一定支持排序
				if(col.tpl){
					return;
				}
				if(col.sortable === false){
					expect(sortEl).toBe(null);
				}else{
					expect(sortEl).toNotBe(null);
				}
			 });
		});
		it('测试生成排序状态',function(){
			 //列默认允许排序
			 S.each(columns,function(col,index){
				var el = S.one(children[index]),
					sortEl = el.one('.ks-grid-sort-icon');
				if(col.sortable !== false && col.sortState){
					expect(el.hasClass('sort-' + col.sortState.toLowerCase())).toBe(true);
				}
			 });
		});
		it('测试生成列的自定义模板',function(){
			var index = 2,
				text = getTitle(S.one(children[index]));
			expect(columns[index].dataIndex).toBe(text);
		});

		it('测试表头宽度',function(){
			var width = 700,
				tableEl = headerEl.one('table'),
				columsWidth = 0;
			header.set('width',width);
			columsWidth = header.getColumnsWidth();
            headerEl.addClass('ks-grid-width');
			if(columsWidth > width){
				expect(tableEl.width()).toBe(columsWidth);
			}else{
				expect(getSetWidth(tableEl)).toBe(width + 'px');
			}
		});/**/

		it('更改列宽度',function(){
			var index = 2,
				colObj = header.getColumnByIndex(index),
				callBack = jasmine.createSpy();
			var tableEl = headerEl.one('table');
			colObj.on('afterWidthChange',function(){
				callBack();
			});
			colObj.set('width',200);
			expect(callBack).toHaveBeenCalled();
			
		});
	});

	describe("列操作，以及触发的冒泡事件", function () {
		var container = headerEl.one('tr'),
			children = container.children();
		it('根据索引获取列',function(){
			var index = 1,
				colObj = header.getColumnByIndex(index);
			expect(columns[index].title).toBe(colObj.get('title'));
			expect(!header.getColumnByIndex(-1)).toBeTruthy();
			//expect(!header.getColumnByIndex(columns.length)).toBeTruthy();
		});
		it('根据编号（id）获取列',function(){
			 S.each(columns,function(col,index){
				var el = S.one(children[index]),
					colObj = header.getColumnById(col.id);
				if(col.id){
					expect(!!colObj).toBeTruthy();
				}else{
					expect(!!colObj).not.toBeTruthy();
				}
			 });
		});
		it('更改列标题',function(){
			var index = 1,
				title = '更换主题',
				text = null,
				colObj = header.getColumnByIndex(index);
			colObj.set('title',title);
			text = getTitle(S.one(children[index]));
			expect(title).toBe(text);
		});
		it('更改列是否可排序',function(){
			var index = 1,
				sortable = true,
				colObj = header.getColumnByIndex(index),
				sortEl = null;
			colObj.set('sortable',sortable);
			sortEl = S.one(children[index]).one('.ks-grid-sort-icon');
			expect(!!sortEl).toBe(sortable);

			sortable = !sortable;
			colObj.set('sortable',sortable);
			sortEl = S.one(children[index]).one('.ks-grid-sort-icon');
			expect(!!sortEl).toBe(sortable);
		});
		it('测试列隐藏、显示',function(){
			var index = 1,
				 colObj = header.getColumnByIndex(index),
				 el = colObj.get('el');
			colObj.set('visible',false);
			expect(el.css('display')).toBe('none');

			colObj.set('visible',true)
			expect(el.css('display')).not.toBe('none');;

		});
		it('测试添加、删除列',function(){
			var cfg = {id : 'new',title:'新建表头'},
				obj = null,
				index = -1;
			header.addColumn(cfg);
			obj = header.getColumnById(cfg.id);
			index = header.getColumnIndex(obj);
			children = container.children();
			expect(cfg.title).toBe(getTitle(S.one(children[index])));

			header.removeColumn(obj,true);
			index = header.getColumnIndex(obj);
			children = container.children();
			expect(index).toBe(-1);
			//expect(children[index]).toBe(-1);

		});
		it('测试添加第一列',function(){
			var cfg = {id : 'new1',title:'新建表头'},
				obj = null,
				index = 0;
			header.addColumn(cfg,index);
			obj = header.getColumnById(cfg.id);
			children = container.children();
			expect(cfg.title).toBe(getTitle(S.one(children[index])));
			header.removeColumn(obj,true);
		});

		it('测试列排序状态',function(){
			var index = 1,
				 colObj = header.getColumnByIndex(index),
				 el = colObj.get('el');
			colObj.set('sortState','ASC');
			expect(el.hasClass('sort-asc')).toBeTruthy();
			
			colObj.set('sortState','DESC');
			expect(el.hasClass('sort-desc')).toBeTruthy();

			colObj.set('sortState','xxx');
			expect(el.hasClass('sort-xxx')).toBeFalsy();
			expect(el.hasClass('sort-desc')).toBeFalsy();
			expect(el.hasClass('sort-asc')).toBeFalsy();

		});
		it('测试列移动',function(){
		
		});
		it('测试列大小改变',function(){
		
		});
	});

	describe("测试 header事件", function () {
		function clickfunction(ev){
			ev.target
		}
		it('测试列的点击',function(){
			var index = 2,
				colObj = header.getColumnByIndex(index),
				spycallback = jasmine.createSpy(),
				spycallback1 = jasmine.createSpy();

			function clickfunction(ev){
				expect(ev.target).toBe(colObj);
				spycallback();
			}
			header.on('click',clickfunction);
			
			colObj.on('click',function(){
				spycallback1();
			});
			//colObj.fire('click');
			jasmine.simulate(colObj.get('el')[0],'mousedown');
			jasmine.simulate(colObj.get('el')[0],'mouseup');
			waits(100);
			runs(function(){
				expect(spycallback1).toHaveBeenCalled();
				expect(spycallback).toHaveBeenCalled();
			});
			
		});
		it('测试列的点击排序',function(){
			var index = 2,
				colObj = header.getColumnByIndex(index),
				spycallback = jasmine.createSpy();
			colObj.on('afterSortStateChange',function(ev){
				spycallback();
			});
			jasmine.simulate(colObj.get('el')[0],'mousedown');
			jasmine.simulate(colObj.get('el')[0],'mouseup');
			waits(100);
			runs(function(){
				expect(spycallback).toHaveBeenCalled();
			});

		});
		it('测试列的点击显示菜单',function(){
			
		});

		it('测试列的拖动',function(){
		
		});

		it('测试列的拖放宽度',function(){
		
		});

	});
});