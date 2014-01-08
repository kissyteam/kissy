/**
 * navigation bar to accommodate back button and title element
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Control = require('component/control');
    var BarRender = require('./bar-render');
    var Button = require('button');

    function createGhost(elem) {
        var ghost, width;

        ghost = elem.clone(true);
        ghost[0].id = elem[0].id + '-proxy';

        elem.parent().append(ghost);

        var offset = elem.offset();

        ghost.css('position', 'absolute');
        ghost.offset(offset);
        ghost.css({
            width: width = elem.css('width'),
            height: elem.css('height')
        });

        return ghost;
    }

    function anim(el, props, complete) {
        el.animate(props, {
            duration: 0.25,
            useTransition: true,
            easing: 'ease-in-out',
            complete: complete
        });
    }

    function getAnimProps(self, backEl, backElProps, reverse) {
        var barElement = self.get('el'),
            titleElement = self.get('titleEl'),
            minOffset = Math.min(barElement[0].offsetWidth / 3, 200),
            newLeftWidth = backEl[0].offsetWidth,
            barWidth = barElement[0].offsetWidth,
            titleX = titleElement.offset().left - barElement.offset().left,
            titleWidth = titleElement[0].offsetWidth,
            oldBackWidth = backElProps.width,
            newOffset, oldOffset, backElAnims, titleAnims, omega, theta;

        if (reverse) {
            newOffset = -oldBackWidth;
            oldOffset = Math.min(titleX - oldBackWidth, minOffset);
        }
        else {
            oldOffset = -oldBackWidth;
            newOffset = Math.min(titleX, minOffset);
        }


        backElAnims = {
            element: {
                from: {
                    transform: 'translateX(' + newOffset + 'px) translateZ(0)'
                },
                to: {
                    transform: 'translateX(0) translateZ(0)',
                    opacity: 1
                }
            },
            ghost: {
                to: {
                    transform: 'translateX(' + oldOffset + 'px) translateZ(0)',
                    opacity: 0
                }
            }
        };

        theta = -titleX + newLeftWidth;
        if (titleWidth > titleX) {
            omega = -titleX - titleWidth;
        }

        if (reverse) {
            oldOffset = barWidth - titleX - titleWidth;

            if (omega !== undefined) {
                newOffset = omega;
            }
            else {
                newOffset = theta;
            }
        } else {
            newOffset = barWidth - titleX - titleWidth;

            if (omega !== undefined) {
                oldOffset = omega;
            }
            else {
                oldOffset = theta;
            }

            newOffset = Math.max(0, newOffset);
        }
        titleAnims = {
            element: {
                from: {
                    transform: 'translateX(' + newOffset + 'px) translateZ(0)'
                },
                to: {
                    transform: 'translateX(0) translateZ(0)',
                    opacity: 1
                }
            },
            ghost: {
                to: {
                    transform: 'translateX(' + oldOffset + 'px) translateZ(0)',
                    opacity: 0
                }
            }
        };

        return {
            back: backElAnims,
            title: titleAnims
        };
    }

    return Control.extend({
        renderUI: function () {
            var prefixCls = this.get('prefixCls');
            var backBtn;
            this.set('backBtn', backBtn = new Button({
                prefixCls: prefixCls + 'navigation-bar-back-',
                elBefore: this.get('contentEl')[0].firstChild,
                visible: false,
                content: this.get('backText')
            }).render());
        },
        forward: function (title) {
            this.go(title, true);
        },

        go: function (title, hasPrevious, reverse) {
            var self = this;
            var backEl = this.get('backBtn').get('el');
            backEl.stop(true);
            if (self.ghostBackEl) {
                self.ghostBackEl.stop(true);
            }
            var backElProps = {
                width: backEl[0].offsetWidth
            };
            var ghostBackEl = createGhost(backEl);
            self.ghostBackEl = ghostBackEl;
            backEl.css('opacity', 0);
            backEl[hasPrevious ? 'show' : 'hide']();
            var titleEl = this.get('titleEl');
            titleEl.stop(true);
            if (self.ghostBackEl) {
                self.ghostBackEl.stop(true);
            }
            var ghostTitleEl = createGhost(titleEl.parent());
            self.ghostTitleEl = ghostTitleEl;
            titleEl.css('opacity', 0);
            this.set('title', title);
            var anims = getAnimProps(self, backEl, backElProps, reverse);
            backEl.css(anims.back.element.from);
            if (backEl.css('display') !== 'none') {
                anim(backEl, anims.back.element.to);
            }
            titleEl.css(anims.title.element.from);
            anim(titleEl, anims.title.element.to);

            if (ghostBackEl.css('display') !== 'none') {
                anim(ghostBackEl, anims.back.ghost.to, function () {
                    ghostBackEl.remove();
                    self.ghostBackEl = null;
                });
            } else {
                ghostBackEl.remove();
                self.ghostBackEl = null;
            }
            anim(ghostTitleEl, anims.title.ghost.to, function () {
                ghostTitleEl.remove();
                self.ghostTitleEl = null;
            });
        },

        back: function (title, hasPrevious) {
            this.go(title, hasPrevious, true);
        }
    }, {
        xclass: 'navigation-bar',
        ATTRS: {
            handleMouseEvents: {
                value: false
            },
            focusable: {
                value: false
            },
            xrender: {
                value: BarRender
            },
            contentEl: {
                view: 1
            },
            titleEl: {
                view: 1
            },
            title: {
                value: '',
                view: 1
            },
            backText: {
                value: 'Back',
                view: 1
            }
        }
    });
});