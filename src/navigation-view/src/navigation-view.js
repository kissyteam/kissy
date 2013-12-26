/**
 * navigation view to accommodate multiple views
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var $ = require('node').all;
    var Container = require('component/container');
    var Control = require('component/control');
    var Bar = require('navigation-view/bar');
    var ContentTpl = require('component/extension/content-xtpl');
    var ContentRender = require('component/extension/content-render');
    var LOADING_HTML = '<div class="{prefixCls}navigation-view-loading">' +
        '<div class="{prefixCls}navigation-view-loading-outer">' +
        '<div class="{prefixCls}navigation-view-loading-inner"></div>' +
        '</div>' +
        '</div>';

    var SubView = Control.extend({
        pause: function () {
        },
        resume: function () {
        }
    }, {
        xclass: 'navigation-sub-view',
        ATTRS: {
            handleMouseEvents: {
                value: false
            },
            promise: {},
            focusable: {
                value: false
            }
        }
    });

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
            this.pop();
        },
        push: function (subView) {
            var self = this;
            var bar = this.get('bar');
            if (subView.get('rendered')) {
                subView.resume();
            } else {
                this.addChild(subView);
            }
            subView.get('el').css('transform', 'translateX(-9999px) translateZ(0)');
            var activeView;
            var loadingEl = this.get('loadingEl');
            if ((activeView = this.get('activeView'))) {
                var activeEl = activeView.get('el');
                this.viewStack.push(activeView);
                loadingEl.css('left', '100%');
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
            } else {
                bar.set('title', subView.get('title'));
            }

            self.waitingView = subView;
            subView.get('promise').then(function () {
                if (self.waitingView === subView) {
                    self.set('activeView', subView);
                    subView.get('el').css('transform', '');
                    loadingEl.hide();
                }
            });
        },
        pop: function () {
            var self = this;
            if (this.viewStack.length) {
                var subView = this.viewStack.pop();
                subView.resume();
                var activeView;
                var loadingEl = this.get('loadingEl');
                var bar = this.get('bar');
                if ((activeView = this.get('activeView'))) {
                    this.viewStack.push(activeView);
                    loadingEl.css('left', '-100%');
                    activeView.get('el').animate({
                        transform: 'translateX(' + activeView.get('el')[0].offsetWidth + 'px) translateZ(0)'
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
                }
                bar.back(subView.get('title'));
                self.waitingView = subView;
                subView.get('promise').then(function () {
                    if (self.waitingView === subView) {
                        self.set('activeView', subView);
                        subView.get('el').css('transform', '');
                        loadingEl.hide();
                    }
                });
            }
        }
    }, {
        SubView: SubView,
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