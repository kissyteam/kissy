describe('selectable', function() {
	var S = KISSY, D = S.DOM, E = S.Event,
		tempList, VALUE_KEY = 'ks-data',
		SELECTED_ITEM_CLS = 'selected';

	function arrayEqualDOM(array, domArray) {
		if (array.length != domArray.length) {
			return false;
		}

		for (var i=0, len = array.length; i<len; i++) {
			if (array[i] != domArray[i]) {
				return false;
			}
		}

		return true;
	}

	beforeEach(function() {
		//测试前先创建一个模拟的list树
		tempList = D.create('<ul id="KS_List"><li ks-filter="true" ks-data = "list1">list1</li><li ks-filter="true" ks-data = "list2">list2</li><li ks-filter="true" ks-data = "list3">list3</li><li ks-data = "list4">list4</li><li ks-data = "list5">list5</li></ul>');
		document.body.appendChild(tempList);
	});

	afterEach(function() {
		//测试完毕后将这个节点删除
		D.remove( tempList );
	});

	/**
	 * init 的fire方法还没想好
	 */
	describe('初始化方法', function() {
		var testList;
		beforeEach(function() {
			testList = new S.Selectable('#KS_List',{
				valueKey : VALUE_KEY,
				selectedItemCls : SELECTED_ITEM_CLS
			});
		});

		afterEach(function() {
			testList = null;
		});

		//测试初始化值是否正确,_parseMarkup和_buildValueMap方法没有单独测试
		it('测试初始化参数', function() {
			testList.on('init', function() {
				alert('');
			});

			expect( testList ).not.toBeNull();
			expect( testList.container ).toEqual( tempList );
			expect( arrayEqualDOM(testList.items, tempList.children) ).toEqual( true );
			expect( testList.config.valueKey ).toEqual( VALUE_KEY );
			expect( testList.config.selectedItemCls ).toEqual( SELECTED_ITEM_CLS );
			expect( testList.selectedIndex ).toEqual( undefined );
			expect( testList.valueMap ).not.toBeNull();
		});
	});

	/**
	 * 测试select方法
	 */
	describe('select方法', function() {
		var testList;
		beforeEach(function() {
			testList = new S.Selectable('#KS_List',{
				valueKey : VALUE_KEY,
				selectedItemCls : SELECTED_ITEM_CLS
			});
		});

		afterEach(function() {
			testList = null;
		});

		it('输入为正整数时，应该正确选中对应item，事件发布', function() {
			var index = 1, config = testList.config,
				item = testList.select(index), fired = false;

			testList.on('select', function() {
				fired = true;
			});

			testList.select(index);

			//当前选中项和dom中选中项是一样的
			expect( item ).toEqual( tempList.children[index] );
			//当前选中值已被置为index
			expect( testList.selectedIndex ).toEqual( index );
			//dom节点的class属性已经被改变为selected
			expect( D.hasClass(tempList.children[index], config.selectedItemCls) ).toEqual( true );
			//select事件发布
			expect( fired ).toEqual( true );

		});

		it('输入为0时，选中第一个item，事件发布', function() {
			var index = 0, config = testList.config,
				item = testList.select(index), fired = false;

			testList.on('select', function() {
				fired = true;
			});

			testList.select(index);

			//当前选中项和dom中选中项是一样的
			expect( item ).toEqual( tempList.children[index] );
			//当前选中值已被置为index
			expect( testList.selectedIndex ).toEqual( index );
			//dom节点的class属性已经被改变为selected
			expect( D.hasClass(tempList.children[index], config.selectedItemCls) ).toEqual( true );
			//select事件发布
			expect( fired ).toEqual( true );
		});

		it('输入为undefined，不选任何item，不发布事件', function() {
			var index, config = testList.config,
				item = testList.select(index), fired = false;

			testList.on('select', function() {
				fired = true;
			});

			testList.select(index);

			//选中项为undefined
			expect( item ).toEqual( undefined );
			//selectedIndex被置为undefined
			expect( testList.selectedIndex ).toEqual( undefined );
			//在dom节点中没有选中的节点
			expect( D.hasClass(tempList.children[index], config.selectedItemCls) ).toEqual( false );
			//事件不发布
			expect( fired ).toEqual( false );
		});

		it('输入为null，不选任何item，不发布事件', function() {
			var index = null, config = testList.config,
				item = testList.select(index), fired = false;

			testList.on('select', function() {
				fired = true;
			});

			testList.select(index);

			//选中项为undefined
			expect( item ).toEqual( undefined );
			//selectedIndex被置为undefined
			expect( testList.selectedIndex ).toEqual( undefined );
			//在dom节点中没有选中的节点
			expect( D.hasClass(tempList.children[index], config.selectedItemCls) ).toEqual( false );
			//事件不发布
			expect( fired ).toEqual( false );
		});

		it('输入为对象时，不选任何item，不发布事件', function() {
			var index = {}, config = testList.config,
				item, fired = false;

			testList.on('select', function() {
				fired = true;
			});

			item = testList.select(index);

			//选中项为undefined
			expect( item ).toEqual( undefined );
			//selectedIndex被置为undefined
			expect( testList.selectedIndex ).toEqual( undefined );
			//在dom节点中没有选中的节点
			expect( D.hasClass(tempList.children[index], config.selectedItemCls) ).toEqual( false );
			//事件不发布
			expect( fired ).toEqual( false );
		});
	});

	/**
	 * 测试selectByValue方法
	 */
	describe('selectByValue方法', function() {
		var testList;
		beforeEach(function() {
			testList = new S.Selectable('#KS_List',{
				valueKey : VALUE_KEY,
				selectedItemCls : SELECTED_ITEM_CLS
			});
		});

		afterEach(function() {
			testList = null;
		});

		it('输入参数是list中已有的字符，应该正确选中，事件发布', function() {
			var value = 'list2', fired = false, config = testList.config,
				item;

			testList.on( 'selectByValue', function() {
				fired = true;
			});

			testList.selectByValue( value );


			selectedIndex = testList.selectedIndex;
			item = D.get( '.' + config.selectedItemCls );

			//当选中时selectedIndex不是undefined
			expect( selectedIndex ).toNotEqual( undefined );
			//当选中时，dom树中对应的节点具有selected class属性
			expect( D.hasClass(tempList.children[selectedIndex], config.selectedItemCls) ).toEqual( true );
			//当选中时，选中的节点的value和传入的value应该一致
			expect( D.attr(item, config.valueKey)).toEqual( value );
			//selectByValue事件发布
			expect( fired ).toEqual( true );
		});

		it('输入参数是list中没有的字符，不选中任何item，不发布事件', function() {
			var value = 'list555', fired = false, config = testList.config,
				item;

			testList.on( 'selectByValue', function() {
				fired = true;
			});

			testList.selectByValue( value );

			selectedIndex = testList.selectedIndex;
			item = D.get( '.' + config.selectedItemCls );

			//当选中时selectedIndex是undefined
			expect( selectedIndex ).toEqual( undefined );
			//dom树中不存在含有selectedItmeCls class的懂节点
			expect( item ).toEqual( undefined );
			//selectByValue事件不发布
			expect( fired ).toEqual( false );
		});

		it('输入参数是空字符字符，不选中任何item，不发布事件', function() {
			var value = '', fired = false, config = testList.config,
				item;

			testList.on( 'selectByValue', function() {
				fired = true;
			});

			testList.selectByValue( value );

			selectedIndex = testList.selectedIndex;
			item = D.get( '.' + config.selectedItemCls );

			//当选中时selectedIndex是undefined
			expect( selectedIndex ).toEqual( undefined );
			//dom树中不存在含有selectedItmeCls class的懂节点
			expect( item ).toEqual( undefined );
			//selectByValue事件不发布
			expect( fired ).toEqual( false );
		});

		it('输入参数是undefined，不选中任何item，不发布事件', function() {
			var value = undefined, fired = false, config = testList.config,
				item;

			testList.on( 'selectByValue', function() {
				fired = true;
			});

			testList.selectByValue( value );

			selectedIndex = testList.selectedIndex;
			item = D.get( '.' + config.selectedItemCls );

			//当选中时selectedIndex是undefined
			expect( selectedIndex ).toEqual( undefined );
			//dom树中不存在含有selectedItmeCls class的懂节点
			expect( item ).toEqual( undefined );
			//selectByValue事件不发布
			expect( fired ).toEqual( false );
		});

		it('输入参数是null，不选中任何item，不发布事件', function() {
			var value = null, fired = false, config = testList.config,
				item;

			testList.on( 'selectByValue', function() {
				fired = true;
			});

			testList.selectByValue( value );

			selectedIndex = testList.selectedIndex;
			item = D.get( '.' + config.selectedItemCls );

			//当选中时selectedIndex是undefined
			expect( selectedIndex ).toEqual( undefined );
			//dom树中不存在含有selectedItmeCls class的懂节点
			expect( item ).toEqual( undefined );
			//selectByValue事件不发布
			expect( fired ).toEqual( false );
		});

		it('输入参数是对象，不选中任何item，不发布事件', function() {
			var value = {}, fired = false, config = testList.config,
				item;

			testList.on( 'selectByValue', function() {
				fired = true;
			});

			testList.selectByValue( value );

			selectedIndex = testList.selectedIndex;
			item = D.get( '.' + config.selectedItemCls );

			//当选中时selectedIndex是undefined
			expect( selectedIndex ).toEqual( undefined );
			//dom树中不存在含有selectedItmeCls class的懂节点
			expect( item ).toEqual( undefined );
			//selectByValue事件不发布
			expect( fired ).toEqual( false );
		});
	});


	/**
	 * 测试prev方法
	 */
	describe('prev方法', function() {
		var testList;
		beforeEach(function() {
			testList = new S.Selectable('#KS_List',{
				valueKey : VALUE_KEY,
				selectedItemCls : SELECTED_ITEM_CLS
			});
		});

		afterEach(function() {
			testList = null;
		});

		it('当前选中为第3项时，正确选中第2项，事件发布', function() {
			var index = 3, config = testList.config, fired = false,
				currrentIndex, items, currentItem, currentDOMItem;

			testList.on('prev', function() {
				fired = true;
			});
			testList.select(index);
			testList.prev();

			currentIndex = testList.selectedIndex;
			items = testList.items;
			currentDOMItem = D.get('.' + config.selectedItemCls);
			currentItem = items[currentIndex];

			//prev事件发布
			expect( fired ).toEqual( true );
			//当前选中项应该是当前项的前一项
			expect( currentIndex ).toEqual( 2 );
			//含有selectedItemCls的dom节点应该和selecteable中的选中节点一致
			expect( currentDOMItem ).toEqual( currentItem );
		});

		it('当前选中为第1项时，选中最后一项，事件发布', function() {
			var index = 0, config = testList.config, fired = false,
				currrentIndex, items, currentItem, currentDOMItem;

			testList.on('prev', function() {
				fired = true;
			});
			testList.select(index);
			testList.prev();

			currentIndex = testList.selectedIndex;
			items = testList.items;
			currentDOMItem = D.get('.' + config.selectedItemCls);
			currentItem = items[currentIndex];

			//prev事件发布
			expect( fired ).toEqual( true );
			//当前选中项应该是最后一项
			expect( currentIndex ).toEqual( items.length - 1 );
			//含有selectedItemCls的dom节点应该和selecteable中的选中节点一致
			expect( currentDOMItem ).toEqual( currentItem );
		});

		it('当前无选中项时，选中最后一项，事件发布', function() {
			var index = 0, config = testList.config, fired = false,
				currrentIndex, items, currentItem, currentDOMItem;

			testList.on('prev', function() {
				fired = true;
			});

			testList.prev();

			currentIndex = testList.selectedIndex;
			items = testList.items;
			currentDOMItem = D.get('.' + config.selectedItemCls);
			currentItem = items[currentIndex];

			//prev事件发布
			expect( fired ).toEqual( true );
			//当前选中项应该是最后一项
			expect( currentIndex ).toEqual( items.length - 1 );
			//含有selectedItemCls的dom节点应该和selecteable中的选中节点一致
			expect( currentDOMItem ).toEqual( currentItem );
		});
	});

	/**
	 * 测试next方法
	 */
	describe('next方法', function() {
		var testList;
		beforeEach(function() {
			testList = new S.Selectable('#KS_List',{
				valueKey : VALUE_KEY,
				selectedItemCls : SELECTED_ITEM_CLS
			});
		});

		afterEach(function() {
			testList = null;
		});

		it('当前选中为第2项时，正确选中第3项，事件发布', function() {
			var index = 2, config = testList.config, fired = false,
				currrentIndex, items, currentItem, currentDOMItem;

			testList.on('next', function() {
				fired = true;
			});
			testList.select(index);
			testList.next();

			currentIndex = testList.selectedIndex;
			items = testList.items;
			currentDOMItem = D.get('.' + config.selectedItemCls);
			currentItem = items[currentIndex];

			//next事件发布
			expect( fired ).toEqual( true );
			//当前选中项应该是后一项
			expect( currentIndex ).toEqual( 3 );
			//含有selectedItemCls的dom节点应该和selecteable中的选中节点一致
			expect( currentDOMItem ).toEqual( currentItem );
		});

		it('当前选中为第1项时，选中第一项，事件发布', function() {
			var index = tempList.children.length, config = testList.config, fired = false,
				currrentIndex, items, currentItem, currentDOMItem;

			testList.on('next', function() {
				fired = true;
			});
			testList.select(index);
			testList.next();

			currentIndex = testList.selectedIndex;
			items = testList.items;
			currentDOMItem = D.get('.' + config.selectedItemCls);
			currentItem = items[currentIndex];

			//next事件发布
			expect( fired ).toEqual( true );
			//当前选中项应该是第一项
			expect( currentIndex ).toEqual( 0 );
			//含有selectedItemCls的dom节点应该和selecteable中的选中节点一致
			expect( currentDOMItem ).toEqual( currentItem );
		});

		it('当前无选中项时，选中第一项，事件发布', function() {
			var index = 0, config = testList.config, fired = false,
				currrentIndex, items, currentItem, currentDOMItem;

			testList.on('next', function() {
				fired = true;
			});

			testList.next();

			currentIndex = testList.selectedIndex;
			items = testList.items;
			currentDOMItem = D.get('.' + config.selectedItemCls);
			currentItem = items[currentIndex];

			//next事件发布
			expect( fired ).toEqual( true );
			//当前选中项应该是第一项
			expect( currentIndex ).toEqual( 0 );
			//含有selectedItemCls的dom节点应该和selecteable中的选中节点一致
			expect( currentDOMItem ).toEqual( currentItem );
		});
	});

	/**
	 * 测试value
	 */
	describe('value方法', function() {
		var testList;
		beforeEach(function() {
			testList = new S.Selectable('#KS_List',{
				valueKey : VALUE_KEY,
				selectedItemCls : SELECTED_ITEM_CLS
			});
		});

		afterEach(function() {
			testList = null;
		});

		it('当前选中为第3项时，正确返回值，没有事件发布', function() {
			var index = 2, config = testList.config, fired = false,
				currrentIndex, currentDOMItem, reValue;


			testList.select(index);
			reValue = testList.value();
			currentDOMItem = D.get('.' + config.selectedItemCls);

			//返回值应该和当前DOM树中选中项的data数据一致
			expect( reValue ).toEqual( D.attr(currentDOMItem, config.valueKey) );
		});

		it('当前没有选项,返回undefined，没有事件发布', function() {
			var index = 2, config = testList.config, fired = false,
				currrentIndex, currentDOMItem, reValue;

			reValue = testList.value();

			//返回值应该是undefined
			expect( reValue ).toEqual( undefined );
		});
	});

	/**
	 * 测试item
	 */
	describe('item方法', function() {
		var testList;
		beforeEach(function() {
			testList = new S.Selectable('#KS_List',{
				valueKey : VALUE_KEY,
				selectedItemCls : SELECTED_ITEM_CLS
			});
		});

		afterEach(function() {
			testList = null;
		});

		it('当前选中为第3项时，正确返回对应item，没有事件发布', function() {
			var index = 2, config = testList.config, fired = false,
				currrentIndex, currentDOMItem, currentItem;

			testList.select(index);
			currentItem = testList.item();
			currentDOMItem = D.get('.' + config.selectedItemCls);

			//当前选中的item应该和DOM树中class属性含有selectedItemCls的节点一样
			expect( currentItem ).toEqual( currentDOMItem );
		});

		it('当前没有选项，返回undefined，没有事件发布', function() {
			var index = 2, config = testList.config, fired = false,
				currrentIndex, currentDOMItem, currentItem;

			currentItem = testList.item();
			currentDOMItem = D.get('.' + config.selectedItemCls);

			//当前选中的item应该和DOM树中class属性含有selectedItemCls的节点一样
			expect( currentItem ).toEqual( undefined );
		});
	});

	/**
	 * 测试filter
	 */
	describe('filter方法', function() {
		var testList;
		beforeEach(function() {
			testList = new S.Selectable('#KS_List',{
				valueKey : VALUE_KEY,
				selectedItemCls : SELECTED_ITEM_CLS
			});
		});

		afterEach(function() {
			testList = null;
		});

		it('传入正常filter方法，返回filter，事件发布', function() {
			var config = testList.config, fired = false,
				filterItems, DOMItems = [];

			testList.on('filter', function() {
				fired = true;
			});

			filterItems = testList.filter(function( list ) {
				return D.attr(list, 'ks-filter') == 'true';
			});

			var listItem;
			for(var i=0, len = tempList.children.length; i<len; i++){
				listItem = tempList.children[i];
				if (D.attr( listItem, 'ks-filter') == 'true') {
					DOMItems.push( listItem );
				}
			}

			//filter事件发布
			expect( fired ).toEqual( true );
			//正常filter后的item应该和fullItems不相等
			expect( filterItems ).toNotEqual( testList.fullItems );
			//filter后返回的array应该和selectable自身的items相等
			expect( filterItems ).toEqual( testList.items );
			//filter后返回的array应该和DOM中满足filter的节点相等
			expect( filterItems ).toEqual( DOMItems );
		});

		it('传入非方法(空对象)，返回undefined，不filter，不发布事件', function() {
			var config = testList.config, fired = false,
				filterItems, DOMItems = [];

			testList.on('filter', function() {
				fired = true;
			});

			filterItems = testList.filter({});

			//filter事件不发布
			expect( fired ).toEqual( false );
			//返回值应该是undefined
			expect( filterItems ).toEqual( undefined );
			//selectable中的items应该和fullItems一样（没有filter过）
			expect( testList.items ).toEqual( testList.fullItems );
		});

		it('传入非方法(null)，返回undefined，不filter，不发布事件', function() {
			var config = testList.config, fired = false,
				filterItems, DOMItems = [];

			testList.on('filter', function() {
				fired = true;
			});

			filterItems = testList.filter(null);

			//filter事件不发布
			expect( fired ).toEqual( false );
			//返回值应该是undefined
			expect( filterItems ).toEqual( undefined );
			//selectable中的items应该和fullItems一样（没有filter过）
			expect( testList.items ).toEqual( testList.fullItems );
		});
	});

	/**
	 * 测试clearFilter,clearFilter方法是无论如何都要fire clearFilter事件的
	 */
	describe('clearFilter方法', function() {
		var testList;
		beforeEach(function() {
			testList = new S.Selectable('#KS_List',{
				valueKey : VALUE_KEY,
				selectedItemCls : SELECTED_ITEM_CLS
			});
		});

		afterEach(function() {
			testList = null;
		});

		it('在filter后进行clearFilter，清空filter，事件发布', function() {
			var config = testList.config, fired = false,
				filterItems, DOMItems = [];

			testList.on('clearFilter', function() {
				fired = true;
			});

			filterItems = testList.filter(function(list) {
				return D.attr(list, 'ks-filter') == 'true';
			});
			testList.clearFilter();

			//clearFilter事件发布
			expect( fired ).toEqual( true );
			//selectable中的items应该和fullItems一样
			expect( testList.items ).toEqual( testList.fullItems );
			//fullItems应该和DOM的children一样
			expect( arrayEqualDOM(testList.fullItems, tempList.children) ).toEqual( true );
		});

		it('在无filter时进行clearFilter，清空filter，事件发布', function() {
			var config = testList.config, fired = false,
				filterItems, DOMItems = [];

			testList.on('clearFilter', function() {
				fired = true;
			});

			testList.clearFilter();

			//clearFilter事件发布
			expect( fired ).toEqual( true );
			//selectable中的items应该和fullItems一样
			expect( testList.items ).toEqual( testList.fullItems );
			//fullItems应该和DOM的children一样
			expect( arrayEqualDOM(testList.fullItems, tempList.children) ).toEqual( true );
		});
	});
});
