KISSY.use('grid/pagingbar,grid/store',function(S,PBar,Store){
	
	var store = new Store({url:'../data/number40.php'}),
		bar = new PBar({
		render : '#pbar',
		store : store
	});
	bar.render();
	function log(text){
		S.one('#log').text(text);
	}

	function getLog(){
		return S.one('#log').text();
	}
	var barEl = S.one('#pbar').one('.ks-pagingbar'),
		items = barEl.children();
	describe("测试PagingBar以及主要子元素的生成", function () {
		
		it('测试pagingbar生成',function(){
			expect(barEl).toNotBe(null);
			expect(items.length).toBe(bar.get('children').length);
		});

		it('测试生成按钮：首页、下一页、末页和下一页',function(){
			var firstBtn = bar.getItem('first'),
				prevBtn = bar.getItem('prev'),
				nextBtn = bar.getItem('next'),
				lastBtn = bar.getItem('last'),
				emptyBtn = bar.getItem('empty');
			expect(firstBtn).not.toBe(null);
			expect(prevBtn).not.toBe(null);
			expect(nextBtn).not.toBe(null);
			expect(lastBtn).not.toBe(null);
			expect(emptyBtn).toBe(null);

			expect(barEl.contains(firstBtn.get('el'))).toBeTruthy();
			expect(barEl.contains(prevBtn.get('el'))).toBeTruthy();
			expect(barEl.contains(nextBtn.get('el'))).toBeTruthy();
			expect(barEl.contains(lastBtn.get('el'))).toBeTruthy();

		});
		it('测试生成跳转按钮，跳转文本域',function(){
			var skipBtn = bar.getItem('skip');
			expect(skipBtn).not.toBe(null);
			expect(barEl.contains(skipBtn.get('el'))).toBeTruthy();
		});
		it('测试生成分页信息',function(){
			var totalPage = bar.getItem('totalPage'),
				curPage = bar.getItem('curPage');
			expect(totalPage).not.toBe(null);
			expect(curPage).not.toBe(null);

			expect(barEl.contains(totalPage.get('el'))).toBeTruthy();
			expect(barEl.contains(curPage.get('el'))).toBeTruthy();
		});
		
	});
	
	describe("测试分页栏按钮及输入框事件", function () {
		var	firstBtn = bar.getItem('first'),
			prevBtn = bar.getItem('prev'),
			nextBtn = bar.getItem('next'),
			lastBtn = bar.getItem('last');

		var callFunc = jasmine.createSpy(),
			handler = function(){
				callFunc();
			};
		it('在第一页时，查看按钮状态，首页、前一页',function(){
			store.load();
			waits(500);
			runs(function(){
				//首页、前一页按钮不可用
				expect(firstBtn.get('disabled')).toBeTruthy();
				expect(prevBtn.get('disabled')).toBeTruthy();
				callFunc.reset();
				firstBtn.get('el').on('click',handler);
				//模拟点击首页按钮
				jasmine.simulate(firstBtn.get('el')[0],'click');
				waits(100);
				runs(function(){
					expect(bar.get('curPage')).toBe(1);
				});
			});
		});/**/
		it('在第一页时，点击首页按钮、前一页',function(){
			waits(100);
			runs(function(){
	
				//模拟点击首页按钮
				jasmine.simulate(firstBtn.get('el')[0],'click');
				waits(100);
				runs(function(){
					expect(bar.get('curPage')).toBe(1);
				});

				//模拟点击前一页按钮
				jasmine.simulate(prevBtn.get('el')[0],'click');
				waits(100);
				runs(function(){
					expect(bar.get('curPage')).toBe(1);
				});
			});
		});
		//在第一页时，首页、前一页按钮不可用，末页，下一页可用
		it('在第一页时，查看按钮状态，末页、下一页',function(){
			bar.jumpToPage(1);
			waits(500);
			runs(function(){
				expect(nextBtn.get('disabled')).not.toBeTruthy();
				expect(lastBtn.get('disabled')).not.toBeTruthy();
			});

		});

		it('在第一页时，点击下一页',function(){
			bar.jumpToPage(1);
			waits(500);
			runs(function(){
				//模拟点击下一页按钮
				jasmine.simulate(nextBtn.get('el')[0],'click');
				waits(100);
				runs(function(){
					expect(bar.get('curPage')).toBe(2);
				});

			});
		});

		it('在第一页时，点击末页',function(){
			bar.jumpToPage(1);
			waits(500);
			runs(function(){
				//模拟点击末页按钮
				jasmine.simulate(lastBtn.get('el')[0],'click');
				waits(100);
				runs(function(){
					expect(bar.get('curPage')).toBe(bar.get('totalPage'));
				});		
			});
		});

		it('在第二页时，查看按钮状态，首页、前一页',function(){
			bar.jumpToPage(2);
			waits(200);
			runs(function(){
				expect(firstBtn.get('disabled')).not.toBeTruthy();
				expect(prevBtn.get('disabled')).not.toBeTruthy();
			});
		});

		it('在第二页时，点击首页',function(){
			bar.jumpToPage(2);
			waits(200);
			runs(function(){
				//模拟点击首页按钮
				jasmine.simulate(firstBtn.get('el')[0],'click');
				waits(100);
				runs(function(){
					expect(bar.get('curPage')).toBe(1);
				});	
				
			});
		});

		it('在第二页时，点击前一页',function(){
			bar.jumpToPage(2);
			waits(200);
			runs(function(){
				//模拟点击前一页按钮
				jasmine.simulate(prevBtn.get('el')[0],'click');
				waits(100);
				runs(function(){
					expect(bar.get('curPage')).toBe(1);
				});		
			});
		});

		it('在第末页时，查看按钮状态，末页、下一页',function(){
			var totalPage = bar.get('totalPage');
			bar.jumpToPage(totalPage);
			waits(500);
			runs(function(){
				expect(nextBtn.get('disabled')).toBeTruthy();
				expect(lastBtn.get('disabled')).toBeTruthy();
			});
		});

		it('在第末页时，末页、下一页',function(){
			var totalPage = bar.get('totalPage');
			bar.jumpToPage(totalPage);
			waits(200);
			runs(function(){
				//模拟点击末页按钮
				jasmine.simulate(lastBtn.get('el')[0],'click');
				waits(100);
				runs(function(){
					expect(bar.get('curPage')).toBe(totalPage);
				});	
				
				//模拟点击下一页按钮
				jasmine.simulate(nextBtn.get('el')[0],'click');
				waits(100);
				runs(function(){
					expect(bar.get('curPage')).toBe(totalPage);
				});	
			});
		});
		it('点击跳转页面,跳到第一页',function(){
			var textEl = barEl.one('.ks-pb-page'),
				skipBtn = bar.getItem('skip');
			textEl.val(1);
			jasmine.simulate(skipBtn.get('el')[0],'click');
			waits(500);
			runs(function(){
				expect(bar.get('curPage')).toBe(1);
			});

		});
		it('点击跳转页面,跳到第二页',function(){
			var textEl = barEl.one('.ks-pb-page'),
				skipBtn = bar.getItem('skip');

			textEl.val(2);
			jasmine.simulate(skipBtn.get('el')[0],'click');
			waits(500);
			runs(function(){
				expect(bar.get('curPage')).toBe(2);
			});
		});
	});
	/*暂时未提供自定义功能
	describe("测试自定义分页栏", function () {
		
		it('测试改变链接内容',function(){
			
		});
		it('测试链接内容改变后的事件',function(){
			
		});
		it('测试按钮设置不可用',function(){
			
		});
	});*/
	
});