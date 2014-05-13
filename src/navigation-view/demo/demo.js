KISSY.config('packages', {
    demo: {
        base: '/kissy/src/navigation-view/demo'
    }
});

if (location.href.indexOf('useHashChange') !== -1) {
    history.pushState = null;
}

KISSY.use('navigation-view,' +
        'navigation-view/bar,' +
        'node,' +
        'event/gesture/tap,' +
        'event/gesture/basic,' +
        'router,' +
        'promise,' +
        window.PAGE_VIEW,
    function (S, NavigationView, Bar, Node,TapGesture, BasicGesture,router, Promise, pageViewFactory) {
        var PageView = pageViewFactory();
        var tap = TapGesture.TAP;

        var win = Node.all(window);

        var anims = [
            {
                content: 'loading'
            },
            {
                content: 'default-anim'
            },
            {
                content: 'none-anim',
                value: 'none'

            },
            {
                content: 'slide-left-anim',
                value: ['slide-left', 'slide-right']

            },
            {
                content: 'slide-top-anim',
                value: ['slide-top', 'slide-bottom']

            },
            {
                content: 'slide-bottom-anim',
                value: ['slide-bottom', 'slide-top']
            },
            {
                content: 'fade-anim',
                value: 'fade'
            },
            {
                content: 'pop-anim',
                value: 'pop'
            },
            {
                content: 'flip-left-anim',
                value: ['flip-left', 'flip-right']
            },
            {
                content: 'flip-right-anim',
                value: ['flip-right', 'flip-left']
            },
            {
                content: 'swap-left-anim',
                value: ['swap-left', 'swap-right']
            },
            {
                content: 'swap-right-anim',
                value: ['swap-right', 'swap-left']
            },
            {
                content: 'cube-left-anim',
                value: ['swap-left', 'swap-right']
            },
            {
                content: 'cube-right-anim',
                value: [ 'swap-right', 'swap-left']
            },
            {
                content: 'flow-left-anim',
                value: ['flow-left', 'flow-right']

            },
            {
                content: 'flow-right-anim',
                value: ['flow-right', 'flow-left']
            },
            {
                content: 'turn-anim',
                value: 'turn'
            }
        ];

        var menuContent = '<ul class="nav">';

        S.each(anims, function (anim) {
            menuContent += '<li class="list-item"><a tabindex="0">' + anim.content + '</a></li>';
            menuContent += '<li class="list-item"><a tabindex="0">' + anim.content + '</a></li>';
        });

        var getAnimValue = function (content) {
            for (var i = 0; i < anims.length; i++) {
                if (anims[i].content === content) {
                    return anims[i].value;
                }
            }
            return null;
        };

        var navigationView = new NavigationView({
            loadingHtml: '<div class="ks-navigation-view-loading-outer">' +
                '<div class="ks-navigation-view-loading-inner"></div>' +
                '</div>',
            render: 'body'
        }).render();

        var bar = new Bar({
            navigationView: navigationView,
            elBefore: navigationView.get('contentEl')
        }).render();

        bar.on('backward', function (e) {
            e.preventDefault();
            history.back();
        });

        router.on('dispatch', function (e) {
            if (e.request.backward) {
                navigationView.pop();
            }
        });

        var tpl = '<h2 class="anim-title">{title}</h2>' +
            '<p class="anim-content">Sed ut perspiciatis unde omnis iste natus error ' +
            'sit voluptatem accusantium doloremque laudantium, ' +
            'totam rem aperiam, eaque ipsa quae ab illo inventore ' +
            'veritatis et quasi architecto beatae vitae dicta sunt ' +
            'explicabo. Nemo enim ipsam voluptatem quia voluptas sit ' +
            'aspernatur aut odit aut fugit, sed quia consequuntur magni ' +
            'dolores eos qui ratione voluptatem sequi nesciunt. Neque porro ' +
            'quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, ' +
            'adipisci velit, sed quia non numquam eius modi tempora incidunt ut ' +
            'labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima ' +
            'veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, ' +
            'nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum ' +
            'iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae ' +
            'consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?</p>';

        tpl += tpl;
        tpl += tpl;
        tpl += tpl;

        PageView.extend({
            enter: function (cfg) {
                S.log('enter detail ' + (cfg.fromCache ? 'from cache!' : ''));
                win.on('resize', this.sync, this);
                this.sync();
            },

            leave: function () {
                S.log('leave detail');
                win.detach('resize', this.sync, this);
            },

            createDom: function () {
                this.getContentEl().html(S.substitute(tpl, {
                    title: this.get('viewId')
                }));
            },

            retIndex: function () {
                router.navigate('/');
            },

            bindUI: function () {
                this.getContentEl().delegate('click', '.retIndex', this.retIndex, this);
            }
        }, {
            xclass: 'tb-anim-view'
        });

        PageView.extend({
            enter: function (cfg) {
                S.log('enter loading ' + (cfg.fromCache ? 'from cache!' : ''));
                var self = this;
                self.defer = new Promise.Defer();
                self.promise = self.defer.promise;
                win.on('resize', self.sync, self);
                if (self.logic) {
                    self.logic.enter(cfg);
                } else {
                    S.use('demo/loading', function (S, Loading) {
                        /*jshint nonew:false*/
                        self.logic = self.logic || new Loading(self);
                        self.logic.enter(cfg);
                    });
                }
            },
            leave: function () {
                var self = this;
                win.detach('resize', self.sync, self);
            },
            destructor: function () {
                var self = this;
                win.detach('resize', self.sync, self);
            }
        }, {
            xclass: 'tb-loading-view'
        });

        router.get('/loading', function (request) {
            if (!request.backward) {
                navigationView.replace({
                    animation: [ 'slide-right', 'slide-left']
                });
                navigationView.push({
                    xclass: 'tb-loading-view',
                    title: 'loading'
                });
            }
        });

        router.get('/:anim', function (request) {
            if (!request.backward) {
                var animation = getAnimValue(request.params.anim);
                if (animation) {
                    navigationView.replace({
                        animation: animation
                    });
                }
                navigationView.push({
                    xclass: 'tb-anim-view',
                    title: request.params.anim,
                    viewId: request.params.anim,
                    animation: animation
                });
            }
        });

        PageView.extend({
            enter: function (cfg) {
                S.log('enter index ' + (cfg.fromCache ? 'from cache!' : ''));
                win.on('resize', this.sync, this);
                this.sync();
            },

            leave: function () {
                S.log('leave index');
                win.detach('resize', this.sync, this);
            },

            bindUI: function () {
                this.$el.delegate(tap, '.list-item', this.onMenuItemClick, this);
                this.$el.delegate(BasicGesture.START, '.list-item', function (e) {
                    e.currentTarget.classList.add('list-item-active');
                });
                this.$el.delegate(BasicGesture.END, '.list-item', function (e) {
                    e.currentTarget.classList.remove('list-item-active');
                });

                this.onScroll(function (top) {
                    // S.log(top);
                });
            },

            onMenuItemClick: function (e) {
                router.navigate('/' + S.trim(e.currentTarget.innerText));

            }
        }, {
            xclass: 'tb-index-view',
            ATTRS: {
                content: {
                    value: menuContent
                },
                title: {
                    value: 'navigation-view'
                }
            }
        });

        router.get('/', function (request) {
            if (!request.backward) {
                navigationView.push({
                    xclass: 'tb-index-view'
                });
            }
        });

        router.config({
            urlRoot: location.pathname,
            useHash: !window.useNativeHistory,
            triggerRoute: true
        });

        router.start();
    });

window.onerror = function () {
    window.alert([].join.call(arguments, '!'));
};