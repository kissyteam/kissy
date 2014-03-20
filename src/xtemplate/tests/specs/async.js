/**
 * test async command
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var XTemplate = require('xtemplate');
    describe('async', function () {
        it('works for inline command on sync mode', function () {
            var tpl = '{{tms(1)}}3';
            var ret = '';
            expect(new XTemplate(tpl, {
                commands: {
                    'tms': function (scope, option, buffer) {
                        buffer.write(option.params[0]);
                        return buffer.async(function (asyncBuffer) {
                            asyncBuffer.write('2').end();
                        });
                    }
                }
            }).render({}, function (error, content) {
                    ret = content;
                })).toBe('');
            waitsFor(function () {
                return ret;
            });
            runs(function () {
                expect(ret).toBe('123');
            });
        });

        it('works for inline command on async mode', function () {
            var tpl = '{{tms(1)}}3';
            var ret = '';
            expect(new XTemplate(tpl, {
                commands: {
                    'tms': function (scope, option, buffer) {
                        buffer.write(option.params[0]);
                        return buffer.async(function (asyncBuffer) {
                            setTimeout(function () {
                                asyncBuffer.write('2').end();
                            }, 50);
                        });
                    }
                }
            }).render({}, function (error, content) {
                    ret = content;
                })).toBe('');
            waitsFor(function () {
                return ret;
            });
            runs(function () {
                expect(ret).toBe('123');
            });
        });

        it('works for block command on sync mode', function () {
            var tpl = 'x{{#each(x)}}{{this}}{{tms(1)}}3{{/each}}y';
            var ret = '';
            expect(new XTemplate(tpl, {
                commands: {
                    'tms': function (scope, option, buffer) {
                        buffer.write(option.params[0]);
                        return buffer.async(function (asyncBuffer) {
                            asyncBuffer.write('2').end();
                        });
                    }
                }
            }).render({
                    x: ['t', 'b']
                }, function (error, content) {
                    ret = content;
                })).toBe('');
            waitsFor(function () {
                return ret;
            });
            runs(function () {
                expect(ret).toBe('xt123b123y');
            });
        });

        it('works for block command on sync mode', function () {
            var tpl = 'x{{#each(x)}}{{this}}{{tms(1)}}3{{/each}}y';
            var ret = '';
            expect(new XTemplate(tpl, {
                commands: {
                    'tms': function (scope, option, buffer) {
                        buffer.write(option.params[0]);
                        return buffer.async(function (asyncBuffer) {
                            asyncBuffer.write('2').end();
                        });
                    }
                }
            }).render({
                    x: ['t', 'b']
                }, function (error, content) {
                    ret = content;
                })).toBe('');
            waitsFor(function () {
                return ret;
            });
            runs(function () {
                expect(ret).toBe('xt123b123y');
            });
        });


        it('works for async block command', function () {
            var tpl = 'x{{#ach()}}{{tms(1)}}3{{/ach}}y';
            var ret = '';
            expect(new XTemplate(tpl, {
                commands: {
                    ach: function (scope, option, buffer) {
                        buffer.write(' arch ');
                        return buffer.async(function (asyncBuffer) {
                            setTimeout(function () {
                                option.fn(scope, asyncBuffer);
                            }, 100);
                        }).write(' arch-end');
                    },
                    'tms': function (scope, option, buffer) {
                        buffer.write(option.params[0]);
                        return buffer.async(function (asyncBuffer) {
                            asyncBuffer.write('2').end();
                        });
                    }
                }
            }).render({ }, function (error, content) {
                    ret = content;
                })).toBe('');
            waitsFor(function () {
                return ret;
            });
            runs(function () {
                expect(ret).toBe('x arch 123 arch-end');
            });
        });
    });
});