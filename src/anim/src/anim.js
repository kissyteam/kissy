/**
 * @fileOverview anim
 */
KISSY.add("anim", function(S, Anim,Easing) {
    Anim.Easing=Easing;
    return Anim;
}, {
    requires:["anim/base","anim/easing","anim/color","anim/backgroundPosition"]
});