/**
 * @ignore
 *  anim
 */
KISSY.add('anim', function (S, Anim, Easing) {
    Anim.Easing = Easing;
    S.mix(S, {
        Anim:Anim,
        Easing:Anim.Easing
    });
    return Anim;
}, {
    requires:['anim/base', 'anim/easing', 'anim/color', 'anim/background-position']
});