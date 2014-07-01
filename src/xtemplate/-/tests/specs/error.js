/**
 * error test tc
 * @author yiminghe@gmail.com
 */

/*jshint quotmark:false*/
var XTemplate = require('xtemplate');
var util = require('util');

describe('error detection', function () {
    // https://github.com/kissyteam/kissy/issues/516
    it('error when string encounter \\', function () {
        var ret;
        try {
            ret = new XTemplate("{{'\\'}}").render();
        } catch (e) {
            ret = e.message;
        }
        expect(ret.indexOf('expect shift:LPAREN, shift:MINUS, shift:NOT, shift:STRING, shift:GLOBAL, shift:NUMBER')).not.toBe(-1);
    });

    it('error when string include \\n', function () {
        var ret;
        try {
            ret = new XTemplate("\n\n\n\n{{ x + '1\n222222' }}",{name:'string'}).render();
        } catch (e) {
            ret = e.message;
        }
        expect(ret.indexOf("\n    {{ x + '1 222222' }}\n-----------^")).not.toBe(-1);
    });

    it('detect lexer error', function () {
        var ret;
        try {
            ret = new XTemplate("{{'}}").render();
        } catch (e) {
            ret = e.message;
        }
        expect(ret.indexOf('expect shift:LPAREN, shift:MINUS, shift:NOT, shift:STRING, shift:GLOBAL, shift:NUMBER, shift:ID')).not.toBe(-1);
    });

    it('detect un-closed block tag', function () {
        var tpl = '{{#if(title)}}\n' +
                'shoot\n' +
                '',
            data = {
                title: 'o'
            }, info;


        try {
            new XTemplate(tpl).render(data);
        } catch (e) {
            info = e.message;

        }
        if (location.search.indexOf('build') === -1) {
            expect(util.startsWith(info, 'Syntax error at line 3:\n' +
                '{{#if(title)}} shoot\n\n' +
                '--------------------^\n' +
                'expect'));
            // OPEN_END_BLOCK
        }
    });

    it('detect unmatched', function () {
        if (!KISSY.config('debug')) {
            return;
        }
        var tpl = '{{#if(n === n1)}}\n' +
            'n eq n1\n' +
            '{{/with}}';

        var data = {
            n: 1,
            n1: 2
        };

        expect(function () {
            try {
                new XTemplate(tpl).render(data);
            } catch (e) {
                //S.log('!'+e.replace(/\n/g,'\\n').replace(/\r/g,'\\r')+'!');
                throw e;
            }
        }).toThrow('Syntax error at line 3:\n' +
            'expect {{/if}} not {{/with}}');
    });

    it('detect unmatched custom command', function () {
        if (!KISSY.config('debug')) {
            return;
        }
        var tpl = '{{#x.y()}}\n{{/x}}';

        expect(function () {
            try {
                new XTemplate(tpl).render();
            } catch (e) {
                throw e;
            }
        }).toThrow('Syntax error at line 2:\n' +
            'expect {{/x,y}} not {{/x}}');
    });
});