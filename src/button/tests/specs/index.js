/**
 * @overview test case for button
 * @author shiran<shiran@taobao.com>
 */
KISSY.add(function (S, Dom, Button, Node) {
    var $ = Node.all;

    describe('button', function () {
        it('create one button and make it checkable', function () {
            // setup
            $('<div id="b1"></div>').appendTo('body');

            var button = new Button({
                content: 'test1',
                tooltip: 'test1 tip',
                render: '#b1',
                checkable: true
            });

            button.render();

            waits(100);

            runs(function () {
                var bEl = Dom.get('.ks-button', '#b1');
                expect(Dom.attr(bEl, 'title')).toBe('test1 tip');
                // api test
                expect(button.get('checked')).toBe(false);
                // 模拟点击
                jasmine.simulate(bEl, 'click');

                waits(100);
                runs(function(){
                    expect(Dom.hasClass(bEl, 'ks-button-checked')).toBeTruthy();
                    expect(button.get('checked')).toBe(true);
                    // 模拟 enter 按键
                    jasmine.simulate(bEl, 'keydown', { keyCode: 13 });
                    expect(Dom.hasClass(bEl, 'ks-button-checked')).toBeFalsy();
                    expect(button.get('checked')).toBe(false);
                    // 模拟 space 按键
                    jasmine.simulate(bEl, 'keyup', { keyCode: 32 });
                    expect(Dom.hasClass(bEl, 'ks-button-checked')).toBeTruthy();
                    expect(button.get('checked')).toBe(true);
                });
            });

            runs(function () {
                // clean
                button.destroy();
            });

        });

        it('create one button and make it uncheckable', function () {

            $('<div id="b2">1</div>').appendTo('body');

            var button = new Button({
                srcNode: '#b2'
            });

            var bEl = Dom.get('#b2');

            button.render();

            waits(100);

            runs(function () {

                expect(button.get('content')).toBe('1');


                expect(!Dom.attr(bEl, 'title')).toBeTruthy();
                // 模拟点击
                jasmine.simulate(bEl, 'click');

            });

            waits(100);
            runs(function(){
                expect(Dom.hasClass(bEl, 'ks-button-checked')).toBeFalsy();

                expect(button.get('checked')).toBe(false);
                // 设置可选
                button.set('checkable', true);
                jasmine.simulate(bEl, 'click');

            });

            waits(100);
            runs(function(){
                expect(Dom.hasClass(bEl, 'ks-button-checked')).toBeTruthy();
                expect(button.get('checked')).toBe(true);
            });

            runs(function () {
                button.destroy();
            });

        });
    });
},{
    requires:['dom','button','node']
});
