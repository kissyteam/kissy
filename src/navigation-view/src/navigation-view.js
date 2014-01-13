/**
 * navigation view to accommodate multiple views
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var $ = require('node').all;
    var Container = require('component/container');
    var Bar = require('navigation-view/bar');
    var ContentTpl = require('component/extension/content-xtpl');
    var ContentRender = require('component/extension/content-render');
    var LOADING_HTML = '<div class="{prefixCls}navigation-view-loading">' +
        '<div class="{prefixCls}navigation-view-loading-outer">' +
        '<div class="{prefixCls}navigation-view-loading-inner"></div>' +
        '</div>' +
        '</div>';

    var uuid = 0;

    var NavigationViewRender = Container.getDefaultRender().extend([ContentRender], {
        renderUI: function () {
            var loadingEl = $(S.substitute(LOADING_HTML, {
                prefixCls: this.control.get('prefixCls')
            }));
            this.control.get('contentEl').append(loadingEl);
            this.control.loadingEl = loadingEl;
        }
    });

    function onBack(e) {
        if (e.target === this.get('bar')) {
            this.pop();
        }
    }

    return Container.extend({
        initializer: function () {
            this.publish('back', {
                defaultFn: onBack,
                defaultTargetOnly: false
            });
        },

        renderUI: function () {
            this.viewStack = [];
            var bar;
            var barCfg = this.get('barCfg');
            barCfg.elBefore = this.get('el')[0].firstChild;
            this.setInternal('bar', bar = new Bar(barCfg).render());
            bar.addTarget(this);
        },

        push: function (nextView) {
            var self = this;
            var bar = this.get('bar');
            if (!nextView.get('render')) {
                self.addChild(nextView);
            }
            var nextViewEl = nextView.get('el');
            nextViewEl.css('transform', 'translateX(-9999px) translateZ(0)');
            nextView.uuid = uuid++;
            var activeView;
            var loadingEl = this.loadingEl;
            this.viewStack.push(nextView);
            if ((activeView = this.activeView) && activeView.leave) {
                activeView.leave();
            } else if (self.waitingView && self.waitingView.leave) {
                self.waitingView.leave();
            }
            if (nextView.enter) {
                nextView.enter();
            }
            if (activeView) {
                var activeEl = activeView.get('el');
                activeEl.stop(true);
                activeEl.animate({
                    transform: 'translateX(-' + activeEl[0].offsetWidth + 'px) translateZ(0)'
                }, {
                    useTransition: true,
                    easing: 'ease-in-out',
                    duration: 0.25
                });
                if (nextView.promise) {
                    loadingEl.stop(true);
                    loadingEl.css('left', '100%');
                    loadingEl.show();
                    loadingEl.animate({
                        left: '0'
                    }, {
                        useTransition: true,
                        easing: 'ease-in-out',
                        duration: 0.25
                    });
                    this.activeView = null;
                } else {
                    nextViewEl.stop(true);
                    nextViewEl.css('transform', 'translateX(' + activeEl[0].offsetWidth + 'px) translateZ(0)');
                    nextViewEl.animate({
                        transform: ''
                    }, {
                        useTransition: true,
                        easing: 'ease-in-out',
                        duration: 0.25
                    });
                    this.activeView = nextView;
                    self.waitingView = null;
                }
                bar.forward(nextView.get('title') || '');
            } else {
                bar.set('title', nextView.get('title'));
                if (!nextView.promise) {
                    nextView.get('el').css('transform', '');
                    this.activeView = nextView;
                    self.waitingView = null;
                    loadingEl.hide();
                }
            }

            if (nextView.promise) {
                self.waitingView = nextView;
                nextView.promise.then(function () {
                    if (self.waitingView && self.waitingView.uuid === nextView.uuid) {
                        self.activeView = nextView;
                        self.waitingView = null;
                        nextView.get('el').css('transform', '');
                        bar.set('title', nextView.get('title') || '');
                        loadingEl.hide();
                    }
                });
            }
        },

        pop: function () {
            var self = this;
            if (this.viewStack.length > 1) {
                this.viewStack.pop();
                var nextView = this.viewStack[this.viewStack.length - 1];
                nextView.uuid = uuid++;
                var activeView;
                var loadingEl = this.loadingEl;
                var bar = this.get('bar');
                if ((activeView = this.activeView) && activeView.leave) {
                    activeView.leave();
                } else if (self.waitingView && self.waitingView.leave) {
                    self.waitingView.leave();
                }
                if (nextView.enter) {
                    nextView.enter();
                }
                if (activeView) {
                    var activeEl = activeView.get('el');
                    activeEl.stop(true);
                    activeEl.animate({
                        transform: 'translateX(' + activeView.get('el')[0].offsetWidth + 'px) translateZ(0)'
                    }, {
                        useTransition: true,
                        easing: 'ease-in-out',
                        duration: 0.25
                    });
                    if (nextView.promise) {
                        this.activeView = null;
                        loadingEl.stop(true);
                        loadingEl.css('left', '-100%');
                        loadingEl.show();
                        loadingEl.animate({
                            left: '0'
                        }, {
                            useTransition: true,
                            easing: 'ease-in-out',
                            duration: 0.25
                        });
                    } else {
                        var nextViewEl = nextView.get('el');
                        nextViewEl.stop(true);
                        nextViewEl.css('transform', 'translateX(-' + activeEl[0].offsetWidth + 'px) translateZ(0)');
                        nextViewEl.animate({
                            transform: ''
                        }, {
                            useTransition: true,
                            easing: 'ease-in-out',
                            duration: 0.25
                        });
                        this.activeView = nextView;
                    }
                } else {
                    if (!nextView.promise) {
                        nextView.get('el').css('transform', '');
                        this.activeView = nextView;
                        self.waitingView = null;
                        loadingEl.hide();
                    }
                }

                bar.back(nextView.get('title') || '', this.viewStack.length > 1);

                if (nextView.promise) {
                    self.waitingView = nextView;
                    nextView.promise.then(function () {
                        if (self.waitingView && self.waitingView.uuid === nextView.uuid) {
                            self.waitingView = null;
                            self.activeView = nextView;
                            nextView.get('el').css('transform', '');
                            bar.set('title', nextView.get('title') || '');
                            loadingEl.hide();
                        }
                    });
                }
            }
        }
    }, {
        xclass: 'navigation-view',

        ATTRS: {
            barCfg: {
                value: {}
            },

            handleMouseEvents: {
                value: false
            },

            focusable: {
                value: false
            },

            xrender: {
                value: NavigationViewRender
            },

            contentTpl: {
                value: ContentTpl
            }
        }
    });
});