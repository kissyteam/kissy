KISSY.use('grid/numberpagingbar,grid/store',function(S,NBar,Store){
	
	/**/
	describe("测试初始化", function () {
		var bar = new NBar({
			render : '#nbar'
		});
		bar.render();
		var barEl = S.one('#nbar').one('.ks-pagingbar-number'),

			items = barEl.children();
		it('测试pagingbar生成',function(){
			expect(barEl).toNotBe(null);
			expect(items.length).toBe(bar.get('children').length);
		});

		it('测试生成按钮：上一页和下一页',function(){
			var firstBtn = bar.getItem('first'),
				prevBtn = bar.getItem('prev'),
				nextBtn = bar.getItem('next');
			
			//未生成首页按钮
			expect(firstBtn).toBe(null);
			expect(prevBtn).not.toBe(null);
			expect(nextBtn).not.toBe(null);

			expect(barEl.contains(prevBtn.get('el'))).toBeTruthy();
			expect(barEl.contains(nextBtn.get('el'))).toBeTruthy();
		});

		it('测试生成 number button container',function(){
			var nbar = bar.get('numberContainer');
			expect(nbar).not.toBe(null);
			expect(nbar.get('el').hasClass('.ks-bar')).toBeTruthy();
			expect(barEl.contains(nbar.get('el'))).toBeTruthy();
		});

	});
	describe("测试加载数据后，当页面少于6页时", function () {
		var store = new Store({
				url : '../data/number40.php',
				pageSize : 10
			}),
			bar1 = new NBar({
			render : '#nbar1',
			store : store
		});
		bar1.render();
		var barEl = bar1.get('el').one('.ks-bar');
		it('测试生成的页码是否正确',function(){
			var count  = bar1.get('totalPage');
			store.load();
			waits(200);
			runs(function(){
				var count  = bar1.get('totalPage'),
					curPage = bar1.get('curPage');
				expect(barEl.all('.ks-number-button').length).toBe(count);
				expect(barEl.one('.ks-button-checked').text()).toBe(curPage.toString());
			});
			
		});
		it('跳转到首页,选中数字按钮 “1”',function(){
			bar1.jumpToPage(1);
			waits(200);
			runs(function(){
				expect(barEl.one('.ks-button-checked').text()).toBe('1');
			});
			
		});
		it('跳转到末页,选中最后一个按钮',function(){
			var lastPage = bar1.get('totalPage');
			bar1.jumpToPage(lastPage);
			waits(200);
			runs(function(){
				expect(barEl.one('.ks-button-checked').text()).toBe(lastPage.toString());
			});
			
		});

		it('跳转到中间页',function(){
			var lastPage = bar1.get('totalPage'),
				middle = parseInt((lastPage + 1) / 2);
			bar1.jumpToPage(middle);
			waits(200);
			runs(function(){
				expect(barEl.one('.ks-button-checked').text()).toBe(middle.toString());
			});

		});
	});
	describe("测试加载数据后，当页面大于6页时",function(){
		var store = new Store({
				url : '../data/number40.php',
				pageSize : 4
			}),
			bar1 = new NBar({
			render : '#nbar2',
			store : store
		});
		bar1.render();

		var barEl = bar1.get('el').one('.ks-bar'),
			limitCount = bar1.get('maxLimitCount');
		it('测试生成的页码是否正确',function(){
			var count  = bar1.get('totalPage');
			store.load({limit:4});
			waits(200);
			runs(function(){
				var count  = bar1.get('totalPage'),
					curPage = bar1.get('curPage');
				expect(barEl.all('.ks-number-button').length).not.toBe(count);
				expect(barEl.one('.ks-button-checked').text()).toBe(curPage.toString());
			});
			
		});

		it('跳到第六页',function(){
			var count  = bar1.get('totalPage');
			bar1.jumpToPage(6);
			waits(200);
			runs(function(){
				var count  = bar1.get('totalPage'),
					curPage = bar1.get('curPage');
				expect(barEl.all('.ks-number-button').length).not.toBe(count);
				expect(barEl.one('.ks-button-checked').text()).toBe(curPage.toString());
			});
			
		});

		it('跳到第九页',function(){
			var count  = bar1.get('totalPage');
			bar1.jumpToPage(9);
			waits(200);
			runs(function(){
				var count  = bar1.get('totalPage'),
					curPage = bar1.get('curPage');
				expect(barEl.all('.ks-number-button').length).not.toBe(count);
				expect(barEl.one('.ks-button-checked').text()).toBe(curPage.toString());
			});
			
		});
	});
	describe("测试按钮事件", function () {
		var store = new Store({
				url : '../data/number40.php',
				pageSize : 1
			}),
			bar1 = new NBar({
			render : '#nbar3',
			store : store
		});
		bar1.render();
		var barEl = bar1.get('el').one('.ks-bar');
		it('测试点击首页',function(){
			//跳转到第11页
			store.load({start:10});
			waits(200);
			runs(function(){
				var numbeBar = bar1.get('numberContainer');
				var fistBtn = numbeBar.getItem(1);
				numbeBar.get('el').delegate('click','.ks-button',function(event){
					S.log(event.target);
				});
				/**/
				expect(fistBtn).toNotBe(null);
				expect(barEl.one('.ks-button-checked').text()).toBe('11');
				
				fistBtn.get('el').one('.ks-button').fire('click');
				//jasmine.simulate(fistBtn.get('el')[0],'click');
				waits(300);
				runs(function(){
					expect(bar1.get('curPage')).toBe(1);
					expect(barEl.one('.ks-button-checked').text()).toBe("1");
				});		
			});
			
		});
		it('测试点击末页',function(){
			var numbeBar = bar1.get('numberContainer'),
				totalPage = bar1.get('totalPage'),
				lastBtn = numbeBar.getItem(totalPage);
			jasmine.simulate(lastBtn.get('el').one('.ks-button')[0],'click');
			waits(100);
			runs(function(){
				expect(bar1.get('curPage')).toBe(totalPage);
				expect(barEl.one('.ks-button-checked').text()).toBe(totalPage.toString());
			});		
		});/**/
		
		

	});

});