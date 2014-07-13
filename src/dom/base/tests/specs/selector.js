/**
 * simple selector test
 * @author yiminghe@gmail.com
 */

    var tpl = '';
    var $ = window.jQuery;
    var jQuery = window.jQuery;
    var Dom = require('dom');
    var util = require('util');
    window.$.ajax({
        url: '../specs/selector.html',
        async: false,
        success: function (d) {
            tpl = d;
        }
    });

    describe('selector', function () {
        beforeEach(function () {
            $('body').append(tpl);
        });

        afterEach(function () {
            $('#test-selector').remove();
        });

        if (document.getElementsByClassName) {
            it('return array type', function () {
                expect(util.isArray(Dom.query('.test-selector'))).toBe(true);
                expect(Dom.query('.test-selector').length).toBe(document.getElementsByClassName('test-selector').length);
            });
        }

        it('throws exception when encounter #.', function () {
            expect(function () {
                Dom.query('#');
            }).toThrow();
            expect(function () {
                Dom.query('.');
            }).toThrow();
        });

        it('works for fragment', function () {
            var node = Dom.create('<div><i id="i"></i></div><div><b id="b"></b></div>');
            expect(Dom.query('#i', node).length).toBe(1);
            expect(Dom.query('i', node).length).toBe(1);
        });

        it('works for detached node', function () {
            var node = Dom.create('<div><i id="i"></i></div>');
            expect(Dom.query('#i', node).length).toBe(1);
            expect(Dom.query('i', node).length).toBe(1);
        });

        it('should return empty when context is null', function () {
            expect(Dom.query('#test-selector', null).length).toBe(0);
        });

        it('test support disconnect node', function () {
            var div = $('<div id="t"><span id="t2"></span></div>')[0].firstChild;
            expect(Dom.test(div, '#t span')).toBe(true);
        });

        it('support #id', function () {
            expect(Dom.get('#test-selector').id).toBe('test-selector');

            expect(Dom.query('#test-selector').length).toBe(1);

            expect(Dom.get('#test-selector-xx')).toBe(null);

            expect(Dom.query('#test-selector-xx').length).toBe(0);
        });

        it('support tag ignore case', function () {
            expect(Dom.get('#test-selector-1 s').id).toBe('test-selector-tag');
            expect(Dom.query('#test-selector-1 s').length).toBe(1);

            expect(Dom.query('#test-selector-1 S').length).toBe(1);

            expect(Dom.get('sub')).toBe(null);
            expect(Dom.query('sub').length).toBe(0);
        });

        it('support .cls', function () {
            expect(Dom.get('.test-selector').id).toBe('test-selector-1');
            expect(Dom.query('.test-selector').length).toBe(4);
        });

        it('support #id tag', function () {
            expect(Dom.get('#test-selector s').id).toBe('test-selector-tag');
            expect(Dom.get('#test-selector-2 s').id).toBe('');

            expect(Dom.query('#test-selector s').length).toBe(2);
            expect(Dom.query('#test-selector S').length).toBe(2);
            expect(Dom.query('#test-selector-2 s').length).toBe(1);
        });

        it('support comma', function () {
            expect(Dom.query('#test-selector-1 .test-selector ,' +
                ' #test-selector-2 .test-selector').length)
                .toBe(2);
        });

        it('support #id .cls', function () {
            expect(Dom.get('#test-selector-1 .test-selector').tagName.toLowerCase()).toBe('div');
            expect(Dom.get('#test-selector-2 .test-selector').tagName.toLowerCase()).toBe('p');
            expect(Dom.query('#test-selector-1 .test-selector').length).toBe(1);
            expect(Dom.query('#test-selector .test-selector').length).toBe(4);
        });

        it('support tag.cls', function () {
            expect(Dom.get('div.test-selector').id).toBe('test-selector-1');
            expect(Dom.query('div.test-selector').length).toBe(3);
            expect(Dom.query('DIV.test-selector').length).toBe(3);
            expect(Dom.get('p.test-selector').tagName.toLowerCase()).toBe('p');
            expect(Dom.query('p.test-selector').length).toBe(1);
        });

        it('support #id tag.cls', function () {
            expect(Dom.get('#test-selector-1 p.test-selector')).toBe(null);
            expect(Dom.get('#test-selector-2 p.test-selector').tagName.toLowerCase()).toBe('p');
        });

        it('does not confuse name with id', function () {
            var id = 'id' + (+new Date());
            var input = Dom.create('<input name="' + id + '"/>');
            var div = Dom.create('<div id="' + id + '"></div>');
            Dom.append(input, document.body);
            Dom.append(div, document.body);
            expect(Dom.get('#' + id).nodeName.toLowerCase()).toBe('div');
            Dom.remove([input, div]);
        });
    });

    describe('selector context', function () {
        var html = Dom.create(
            '<div><div id="context-test-1" class="context-test">' +
                '<div>' +
                '<div class="context-test-3" id="context-test-2"></div>' +
                '</div>' +
                '</div>' +
                '<div>' +
                '<div class="context-test-3" id="context-test-4"></div>' +
                '</div>' +
                '<div class="context-test">' +
                '<div class="context-test">' +
                '<div>' +
                '<div class="context-test-3" id="context-test-5"></div>' +
                '</div>' +
                '</div>' +
                '</div></div>');

        Dom.prepend(html, document.body);

        it('should attach each properly', function () {
            var c3 = Dom.query('.context-test-3');
            expect(c3.length).toBe(3);
            var a = [];
            // each 绑定正常
            c3.each(function (v, i) {
                a[i] = v;
            });
            expect(a.length).toBe(3);
            expect(Dom.equals(a, c3));
        });

        it('should support #id', function () {
            expect(Dom.query('.context-test-3', '#context-test-1').length).toBe(1);

            expect($('.context-test-3', '#context-test-1').length).toBe(1);

            expect(Dom.query('.context-test-3').length).toBe(3);

            expect($('.context-test-3').length).toBe(3);

            expect(Dom.get('.context-test-3', '#context-test-1').id).toBe('context-test-2');

            expect($('.context-test-3', '#context-test-1').attr('id')).toBe('context-test-2');
        });

        it('should support other string form selector and unique works', function () {
            expect(Dom.query('.context-test-3', '.context-test').length).toBe(2);
        });

        it('should support node array form selector and unique works', function () {
            var r;
            var c3 = Dom.query('.context-test-3');
            expect(r = c3.length).toBe(3);

            var c3j = $('.context-test-3');
            expect(r = c3j.length).toBe(3);

            var c = Dom.query('.context-test');
            expect(r = c.length).toBe(3);

            var cj = jQuery('.context-test');
            expect(r = cj.length).toBe(3);

            expect(r = Dom.query(c3).length).toBe(3);
            expect(r = Dom.query('.context-test-3', c).length).toBe(2);
            expect(r = Dom.query(c3).length).toBe(3);
            expect(r = Dom.query('.context-test-3', '.context-test').length).toBe(2);

            /*jquery contrast test*/
            var t = jQuery(c3j, '.context-test');
            // 上下文不对第一个参数是节点集合时生效
            expect(t.length).toBe(3);
            expect(r = jQuery('.context-test-3', cj).length).toBe(2);
            // 上下文不对第一个参数是节点集合时生效
            expect(r = jQuery(c3j, cj).length).toBe(3);
            expect(r = jQuery('.context-test-3', '.context-test').length).toBe(2);

            expect(r = cj.find('.context-test-3').length).toBe(2);
            expect(r = cj.find(c3j).length).toBe(2);
        });

        it('support other format as first parameter', function () {
            // 普通对象
            var o = {length: 1};
            expect(Dom.query(o)[0]).toBe(o);

            // KISSY NodeList
            o = {
                getDOMNodes: function () {
                    return o;
                }
            };
            expect(Dom.query(o)).toBe(o);

            // 数组
            o = [1];
            expect(Dom.query(o)).toBe(o);

            // NodeList
            o = document.getElementsByTagName('div');
            var ret = Dom.query(o);
            expect(ret.length).toBe(o.length);
            expect(ret[0]).toBe(o[0]);
            expect(util.isArray(ret)).toBe(true);
        });

        it('id selector should constrain to context', function () {
            Dom.append(Dom.create('<div id="tt"></div><div id="tt2"></div>'),
                'body');

            expect(Dom.query('#tt', Dom.get('#tt2')).length).toBe(0);

            expect($('#tt', '#tt2').length).toBe(0);

            Dom.remove('#tt,#tt2');

            expect(Dom.get('#tt')).toBe(null);
            expect(Dom.get('#tt2')).toBe(null);
        });

        it('should get child element by id selector ' +
            'even node is not in the document', function () {
            var t = Dom.create('<div id="tt"><div id="tt2"></div></div>');
            expect(Dom.query('#tt2', t).length).toBe(1);
            expect($('#tt2', t).length).toBe(1);
        });

        it('optimize for long simple selector', function () {
            var div = Dom.create('<div id="long-simple-selector">' +
                '<div class="t">' +
                '<div class="t2">' +
                '<span>' +
                '<b class="j" data-id="target"></b>' +
                '</span>' +
                '</div>' +
                '</div>' +
                '<div class="j"></div>' +
                '</div>');

            document.body.appendChild(div);

            var ret = Dom.query('#long-simple-selector .t .t2 span .j');

            expect(ret.length).toBe(1);
            expect(ret[0].getAttribute('data-id')).toBe('target');

            Dom.remove(div);
        });
    });