/**
 * test custom command for xtemplate
 * @author yiminghe@gmail.com
 */

    var XTemplate = require('xtemplate');
    var util = require('util');

    describe('command', function () {
        it('../ or this can skip command finding', function () {
            var tpl = '{{this.title}}{{#with (d)}}{{../title}}{{/with}}';

            var data = {
                title: '1',
                d: {

                }
            };

            var render = new XTemplate(tpl, {
                commands: {
                    title: function () {
                        return '2';
                    }
                }
            }).render(data);

            expect(render).toBe('11');
        });

        it('skip command in expression', function () {
            var tpl = '{{title+3}}';

            var data = {
                title: '1'
            };

            var render = new XTemplate(tpl, {
                commands: {
                    title: function () {
                        return '2';
                    }
                }
            }).render(data);

            expect(render).toBe('13');
        });

        it('can skip property finding', function () {
            var tpl = '{{title (1)}}{{#with(d)}}{{title (2)}}{{/with}}';

            var data = {
                title: '1',
                d: {

                }
            };

            var render = new XTemplate(tpl, {
                commands: {
                    title: function () {
                        return 2;
                    }
                }
            }).render(data);

            expect(render).toBe('22');
        });

        it('will only find property for param', function () {
            var tpl = '{{#with (title)}}{{c}}{{/with}}';

            var data = {
                title: {
                    c: 1
                }
            };

            var render = new XTemplate(tpl, {
                commands: {
                    title: function () {
                        return {
                            c: 2
                        };
                    }
                }
            }).render(data);

            expect(render).toBe('1');
        });

        it('support param function', function () {
            var tpl = '{{#with (title())}}{{c}}{{/with}}';

            var data = {
                title: {
                    c: 1
                }
            };

            var render = new XTemplate(tpl, {
                commands: {
                    title: function () {
                        return {
                            c: 2
                        };
                    }
                }
            }).render(data);

            expect(render).toBe('2');
        });

        it('support global command for variable', function () {
            XTemplate.addCommand('globalXcmd', function (scope, option) {
                return 'global-' + option.params[0];
            });

            var tpl = 'my {{globalXcmd( title)}}';

            var data = {
                title: '1'
            };

            var render = new XTemplate(tpl).render(data);

            expect(render).toBe('my global-1');
        });

        it('support namespace global command for variable', function () {
            XTemplate.addCommand('cmd', {
                globalXcmd: function (scope, option) {
                    return 'global-' + option.params[0];
                }
            });

            var tpl = '{{cmd.globalXcmd( title)}}';

            var data = {
                title: '1'
            };

            var render = new XTemplate(tpl).render(data);

            expect(render).toBe('global-1');
        });

        it('support global command for block', function () {
            XTemplate.addCommand('global2_xcmd', function (scope, option, buffer) {
                buffer.write('global2-');
                return option.fn(scope, buffer);
            });

            var tpl = 'my {{#global2_xcmd()}}{{title}}{{/global2_xcmd}}';

            var data = {
                title: '1'
            };

            var render = new XTemplate(tpl).render(data);

            expect(render).toBe('my global2-1');
        });

        it('support local command for variable', function () {
            var tpl = 'my {{global3(title)}}';

            var data = {
                title: '1'
            };

            var render = new XTemplate(tpl, {
                commands: {
                    'global3': function (scope, option) {
                        return 'global3-' + option.params[0];
                    }
                }
            }).render(data);

            expect(render).toBe('my global3-1');
        });

        it('support namespace local command for variable', function () {
            var tpl = 'my {{global3.x(title)}}';

            var data = {
                title: '1'
            };

            var render = new XTemplate(tpl, {
                commands: {
                    'global3': {
                        x: function (scope, option) {
                            return 'global3-' + option.params[0];
                        }
                    }
                }
            }).render(data);

            expect(render).toBe('my global3-1');
        });

        it('support local command for block', function () {
            var tpl = 'my {{#global4()}}{{title}}{{/global4}}';

            var data = {
                title: '1'
            };

            var render = new XTemplate(tpl, {
                commands: {
                    'global4': function (scope, option, buffer) {
                        buffer.write('global4-');
                        return option.fn(scope, buffer);
                    }
                }
            }).render(data);

            expect(render).toBe('my global4-1');
        });

        it('support filter command', function () {
            var tpl = '{{ join (map (users)) }}';
            var render = new XTemplate(tpl, {
                commands: {
                    'map': function (scope, option) {
                        return util.map(option.params[0], function (u) {
                            return u.name;
                        });
                    },
                    join: function (scope, option) {
                        return option.params[0].join('|');
                    }
                }
            }).render({
                    users: [
                        {
                            name: '1'
                        },
                        {
                            name: '2'
                        }
                    ]
                });

            expect(render).toBe('1|2');
        });

        it('support runtime commands', function () {
var tpl = '{{s}} {{ k() }} {{ q() }}';
var xtpl = new XTemplate(tpl, {
    commands: {
        'k': function () {
            return 'instance k';
        },
        q: function () {
            return 'instance q';
        }
    }
});

var render = xtpl.render({
    s: 'start'
}, {
    commands: {
        'k': function () {
            return 'runtime k';
        }
    }
});

expect(render).toBe('start runtime k instance q');

render = xtpl.render({
    s: 'start'
}, {
    commands: {
        'q': function () {
            return 'runtime q';
        }
    }
});

expect(render).toBe('start instance k runtime q');
        });
    });