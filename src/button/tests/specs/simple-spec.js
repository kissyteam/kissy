/**
 * @overview test case for button
 * @author shiran<shiran@taobao.com>
 */
KISSY.use('dom, button', function(S, DOM, Button) {

	describe('button', function() {

		it('create one button and make it checkable', function() {

			var button = new Button({
				content: 'test1',
				tooltip: 'test1 tip',
				render: '#b1',
				checkable: true
			});

			button.render();

			waits(100);

			runs(function() {
				var bEl = DOM.get('.ks-button', '#b1');
				expect(DOM.attr(bEl, 'title')).toBe('test1 tip');	
				// 模拟点击
				jasmine.simulate(bEl, 'click');
				expect(DOM.hasClass(bEl, 'ks-button-checked')).toBeTruthy();
				// 模拟 enter 按键
				jasmine.simulate(bEl, 'keydown', { keyCode: 13 });
				expect(DOM.hasClass(bEl, 'ks-button-checked')).toBeFalsy();
				// 模拟 space 按键
				jasmine.simulate(bEl, 'keyup', { keyCode: 32 });
				expect(DOM.hasClass(bEl, 'ks-button-checked')).toBeTruthy();
			});
			
		});

		it('create one button and make it uncheckable', function() {

			var button = new Button({
				content: 'test2',
				srcNode: '#b2'
			});

			button.render();

			waits(100);

			runs(function() {
				var bEl = DOM.get('#b2');
				expect(!DOM.attr(bEl, 'title')).toBeTruthy();	
				// 模拟点击
				jasmine.simulate(bEl, 'click');
				expect(DOM.hasClass(bEl, 'ks-button-checked')).toBeFalsy();

				// 设置可选
				button.set('checkable', true);
				jasmine.simulate(bEl, 'click');
				expect(DOM.hasClass(bEl, 'ks-button-checked')).toBeTruthy();

			});
			
		});

		
	});	
	
});
