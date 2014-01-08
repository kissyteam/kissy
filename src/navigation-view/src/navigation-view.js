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

        push: function (subView) {
            var self = this;
            var bar = this.get('bar');
            subView.get('el').css('transform', 'translateX(-9999px) translateZ(0)');
            subView.uuid = uuid++;
            var activeView;
            var loadingEl = this.get('loadingEl');
            this.viewStack.push(subView);
            if ((activeView = this.get('activeView'))) {
                var activeEl = activeView.get('el');
                loadingEl.stop(true);
                loadingEl.css('left', '100%');
                activeEl.stop(true);
                activeEl.animate({
                    transform: 'translateX(-' + activeEl[0].offsetWidth + 'px) translateZ(0)'
                }, {
                    useTransition: true,
                    easing: 'ease-in-out',
                    duration: 0.25
                });
                loadingEl.show();
                loadingEl.animate({
                    left: '0'
                }, {
                    useTransition: true,
                    easing: 'ease-in-out',
                    duration: 0.25
                });
                this.set('activeView', null);
                bar.forward(subView.get('title'));
                activeView.controller.leave();
            } else {
                bar.set('title', subView.get('title'));
            }

            if (self.waitingView) {
                self.waitingView.controller.leave();
            }

            self.waitingView = subView;
            subView.controller.promise.then(function () {
                if (self.waitingView && self.waitingView.uuid === subView.uuid) {
                    self.set('activeView', subView);
                    self.waitingView = null;
                    bar.set('title', subView.get('title'));
                    subView.get('el').css('transform', '');
                    loadingEl.hide();
                }
            });
        },

        pop: function () {
            var self = this;
            if (this.viewStack.length > 1) {
                this.viewStack.pop();
                var subView = this.viewStack[this.viewStack.length - 1];
                subView.uuid = uuid++;
                var activeView;
                var loadingEl = this.get('loadingEl');
                var bar = this.get('bar');

                if ((activeView = this.get('activeView'))) {
                    this.animEl = activeView.get('el');
                    this.animEl.stop(true);
                    this.animEl.animate({
                        transform: 'translateX(' + activeView.get('el')[0].offsetWidth + 'px) translateZ(0)'
                    }, {
                        useTransition: true,
                        easing: 'ease-in-out',
                        duration: 0.25
                    });
                    this.set('activeView', null);
                    activeView.controller.leave();
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
                } else if (self.waitingView) {
                    self.waitingView.controller.leave();
                }

                bar.back(subView.get('title'), this.viewStack.length > 1);
                self.waitingView = subView;
                subView.controller.promise.then(function () {
                    if (self.waitingView && self.waitingView.uuid === subView.uuid) {
                        self.waitingView = null;
                        self.set('activeView', subView);
                        bar.set('title', subView.get('title'));
                        subView.get('el').css('transform', '');
                        loadingEl.hide();
                    }
                });
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