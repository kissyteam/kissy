KISSY.use('grid/bar,button',function(S,Bar,Button){
	var bar = new Bar({
			render : '#bar',
			//elCls : 'ks-button-group',
			children : [
				new Button({
					content:"测试1"
				}),
				new Button({
					content:"测试2"
				}),
				new Bar.BarItem({
					content : '<span class="label">Default</span>'
				}),
				{
					id :'link1',
					xtype : 'link',
					content : '<a href="http://www.taobao.com">sssss</a>',
					listeners : {
						'click':function(event){
							//event.halt();
							log('link1');
						}
					}
				},{
					id : 'btn3',
					xtype : 'button',
					text : '测试3',
					listeners : {
						'click':function(event){
							log('button3');
						}
					}
				},{xtype : 'separator'},{
					id : 'input',
					xtype : 'custom',
					content : '<input class="span2" type="text"/>',
					listeners : {
						'change':function(event){
							log(event.target.value);
						}
					}
				}/**/
			]
		});
	bar.render();

	function log(text){
		S.one('#log').text(text);
	}

	function getLog(){
		return S.one('#log').text();
	}

	var barEl = S.one('#bar').one('.ks-bar'),
		items = barEl.children();
	describe("测试Bar以及BarItem的生成", function () {
		
		it('测试bar生成',function(){
			expect(barEl).toNotBe(null);
			expect(items.length).toBe(bar.get('children').length);
		});

		it('测试BarItem生成,测试Kissy的Button的子元素',function(){
			var btn1 = S.one(items[0]),
				btn2 = S.one(items[1]);
			expect(btn1).not.toBe(null);
			expect(btn2).not.toBe(undefined);
			expect(btn1.hasClass('ks-button')).toBeTruthy();
			expect(btn2.hasClass('ks-button')).toBeTruthy();
		});
		it('测试BarItem生成,测试xtype 为 separator 的子元素',function(){
			var separator = S.one(items[5]);
			expect(separator).not.toBe(null);
			expect(separator.hasClass('ks-bar-item-separator')).toBeTruthy();
		});
		it('测试BarItem生成,测试xtype 为"button"的子元素',function(){
			var btn4 = S.one(items[4]);
			expect(btn4).not.toBe(null);
			expect(btn4.hasClass('ks-bar-item-button')).toBeTruthy();
		});
		it('测试BarItem生成,生成文本框作为子元素',function(){
			var inputItem = S.one(items[6]);
			expect(inputItem).not.toBe(null);
			expect(inputItem.hasClass('ks-bar-item')).toBeTruthy();
			expect(inputItem.children('input').length).not.toBe(0);
		});
		it('测试BarItem生成,生成链接作为子元素',function(){
			var inputItem = S.one(items[3]);
			expect(inputItem).not.toBe(null);
			expect(inputItem.hasClass('ks-bar-item')).toBeTruthy();
			expect(inputItem.children('a').length).not.toBe(0);
		});
	});
	
	describe("测试BarItem的自定义事件", function () {
		it('测试按钮点击',function(){
			var btn = bar.getItem('btn3');
			expect(btn).not.toBe(null);
			//jasmine.simulate(btn.get('el')[0],'click');
            btn.fire('click');
			waits(100);
			runs(function(){
				expect(getLog()).toBe('button3');
			});
		});
		it('测试链接点击',function(){
			var linkItem = bar.getItem('link1');
			expect(linkItem).not.toBe(null);
            linkItem.fire('click');
			//jasmine.simulate(linkItem.get('el')[0],'click');
			waits(100);
			runs(function(){
				expect(getLog()).toBe('link1');
			});
		});/**/
		it('测试文本框文本改变',function(){
			var inputItem = bar.getItem('input'),
				inputEl = null;
			expect(inputItem).not.toBe(null);
			inputEl = inputItem.get('el').one('input');
			inputEl.val('123');
			inputEl.fire('change');
			waits(100);
			runs(function(){
				expect(getLog()).toBe('123');
			});
		});
	});

	describe("测试BarItem的内容改变", function () {
		
		it('测试改变链接内容',function(){
			var linkItem = bar.getItem('link1'),
				html = '<a href="http://taobao.com">safas</a>';

			linkItem.set('content',html);
			expect(linkItem.get('el').text().toLowerCase()).toBe('safas');
		});
		it('测试链接内容改变后的事件',function(){
			var linkItem = bar.getItem('link1');
			jasmine.simulate(linkItem.get('el')[0],'click');
			waits(100);
			runs(function(){
				expect(getLog()).toBe('link1');
			});
		});
		it('测试按钮设置不可用',function(){
			
		});
	});/**/
	
});