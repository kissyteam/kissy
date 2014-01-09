/**
 * navigation view to accommodate multiple views
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var $ = require('node').all;
    var Controller = require('navigation-view/controller');
    var Container = require('component/container');
    var SubView = require('navigation-view/sub-view');
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
            this.control.setInternal('loadingEl', loadingEl);
        }
    });

    return Container.extend({
        renderUI: function () {
            this.viewStack = [];
            var bar;
            this.setInternal('bar', bar = new Bar({
                elBefore: this.get('el')[0].firstChild
            }).render());
            bar.get('backBtn').on('click', this.onBack, this);
        },

        onBack: function () {
            history.back();
        },

        push: function (nextView, async) {
            var self = this;
            var bar = this.get('bar');
            var nextViewEl = nextView.get('el');
            nextViewEl.css('transform', 'translateX(-9999px) translateZ(0)');
            nextView.uuid = uuid++;
            var activeView;
            var loadingEl = this.get('loadingEl');
            this.viewStack.push(nextView);
            if ((activeView = this.get('activeView'))) {
                var activeEl = activeView.get('el');
                activeEl.stop(true);
                activeEl.animate({
                    transform: 'translateX(-' + activeEl[0].offsetWidth + 'px) translateZ(0)'
                }, {
                    useTransition: true,
                    easing: 'ease-in-out',
                    duration: 0.25
                });
                if (async) {
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
                    this.set('activeView', null);
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
                    this.set('activeView', nextView);
                    self.waitingView = null;
                }
                bar.forward(nextView.get('title'));
            } else {
                bar.set('title', nextView.get('title'));
                if (!async) {
                    nextView.get('el').css('transform', '');
                    this.set('activeView', nextView);
                    self.waitingView = null;
                    loadingEl.hide();
                }
            }

            if (async) {
                self.waitingView = nextView;
                nextView.controller.promise.then(function () {
                    if (self.waitingView && self.waitingView.uuid === nextView.uuid) {
                        self.set('activeView', nextView);
                        self.waitingView = null;
                        nextView.get('el').css('transform', '');
                        bar.set('title', nextView.get('title'));
                        loadingEl.hide();
                    }
                });
            }
        },

        pop: function (nextView, async) {
            var self = this;
            if (this.viewStack.length > 1) {
                this.viewStack.pop();
                nextView.uuid = uuid++;
                var activeView;
                var loadingEl = this.get('loadingEl');
                var bar = this.get('bar');

                if ((activeView = this.get('activeView'))) {
                    var activeEl = this.animEl = activeView.get('el');
                    activeEl.stop(true);
                    activeEl.animate({
                        transform: 'translateX(' + activeView.get('el')[0].offsetWidth + 'px) translateZ(0)'
                    }, {
                        useTransition: true,
                        easing: 'ease-in-out',
                        duration: 0.25
                    });
                    if (async) {
                        this.set('activeView', null);
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
                        this.set('activeView', nextView);
                    }
                } else {
                    if (!async) {
                        nextView.get('el').css('transform', '');
                        this.set('activeView', nextView);
                        self.waitingView = null;
                        loadingEl.hide();
                    }
                }

                bar.back(nextView.get('title'), this.viewStack.length > 1);

                if (async) {
                    self.waitingView = nextView;
                    nextView.controller.promise.then(function () {
                        if (self.waitingView && self.waitingView.uuid === nextView.uuid) {
                            self.waitingView = null;
                            self.set('activeView', nextView);
                            nextView.get('el').css('transform', '');
                            bar.set('title', nextView.get('title'));
                            loadingEl.hide();
                        }
                    });
                }
            }
        }
    }, {
        SubView: SubView,

        Controller: Controller,

        xclass: 'navigation-view',

        ATTRS: {
            activeView: {
            },

            loadingEl: {
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
            },

            defaultChildCfg: {
                value: {
                    xclass: 'navigation-sub-view'
                }
            }
        }
    });
});