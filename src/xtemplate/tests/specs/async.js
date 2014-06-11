/**
 * test async command
 * @author yiminghe@gmail.com
 */

    var XTemplate = require('xtemplate');

    describe('async', function () {
        it('can report error', function () {
            var tpl = '{{tms(1)}}3';
            var ret = '';
            expect(new XTemplate(tpl, {
                commands: {
                    'tms': function (scope, option, buffer) {
                        return buffer.async(function (asyncBuffer) {
                            setTimeout(function () {
                                asyncBuffer.error('report error');
                            }, 100);
                        });
                    }
                }
            }).render({}, function (error) {
                    ret = error;
                })).toBe('');
            waitsFor(function () {
                return ret;
            });
            runs(function () {
                expect(ret).toBe('report error');
            });
        });

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

        it('works for each command on sync mode', function () {
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

        it('works for each command on async mode', function () {
            var tpl = 'x{{#each(x)}}{{this}}{{tms(1)}}3{{/each}}y';
            var ret = '';
            expect(new XTemplate(tpl, {
                commands: {
                    'tms': function (scope, option, buffer) {
                        buffer.write(option.params[0]);
                        return buffer.async(function (asyncBuffer) {
                            setTimeout(function () {
                                asyncBuffer.write('2').end();
                            }, 10);
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
            var tpl = 'x{{#ach()}}{{tms(1)}}3{{/ach}} y';
            var ret = '';
            expect(new XTemplate(tpl, {
                commands: {
                    ach: function (scope, option, buffer) {
                        buffer.write(' arch ');
                        return buffer.async(function (asyncBuffer) {
                            setTimeout(function () {
                                option.fn(scope, asyncBuffer).end();
                            }, 100);
                        }).write(' arch-end');
                    },
                    'tms': function (scope, option, buffer) {
                        buffer.write(option.params[0]);
                        return buffer.async(function (asyncBuffer) {
                            setTimeout(function () {
                                asyncBuffer.write('2').end();
                            }, 100);
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
                expect(ret).toBe('x arch 123 arch-end y');
            });
        });

        it('works for sync block command', function () {
            var tpl = 'x{{#ach()}}{{tms(1)}}3{{/ach}} y';
            var ret = '';
            expect(new XTemplate(tpl, {
                commands: {
                    ach: function (scope, option, buffer) {
                        buffer.write(' arch ');
                        return buffer.async(function (asyncBuffer) {
                            option.fn(scope, asyncBuffer).end();
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
                expect(ret).toBe('x arch 123 arch-end y');
            });
        });

        it('can combine inline command and block async command', function () {
            var tpl = '{{#async(1)}}{{upperCase(asyncContent)}}{{/async}}';
            var ret = '';
            expect(new XTemplate(tpl, {
                commands: {
                    async: function (scope, option, buffer) {
                        var newScope = new XTemplate.Scope();
                        newScope.setParent(scope);
                        return buffer.async(function (asyncBuffer) {
                            setTimeout(function () {
                                newScope.setData({
                                    asyncContent: option.params[0] + ' ok'
                                });
                                option.fn(newScope, asyncBuffer).end();
                            }, 100);
                        });
                    },
                    'upperCase': function (scope, option) {
                        return option.params[0].toUpperCase();
                    }
                }
            }).render({ }, function (error, content) {
                    ret = content;
                })).toBe('');
            waitsFor(function () {
                return ret;
            });
            runs(function () {
                expect(ret).toBe('1 OK');
            });
        });

        it('can be nested into each command', function () {
            var finalRet;
            new XTemplate('{{#each(items)}}{{echo()}}{{/each}}', {
                commands: {
                    echo: function (scope, option, buffer) {
                        return buffer.async(function (asyncBuffer) {
                            setTimeout(function () {
                                asyncBuffer.write(scope.data).end();
                            }, 0);
                        });
                    }
                }
            }).render({
                    items: [1, 2, 3]
                }, function (error, ret) {
                    finalRet = ret;
                });
            waitsFor(function () {
                return finalRet;
            });

            runs(function () {
                expect(finalRet).toBe('123');
            });
        });
    });