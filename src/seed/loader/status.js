/**
 * status constants
 * @author yiminghe@gmail.com
 */
(function(S,data) {
    if("require" in this) {
        return;
    }
    S.mix(data, {
        "LOADING" : 1,
        "LOADED" : 2,
        "ERROR" : 3,
        "ATTACHED" : 4
    });
})(KISSY,KISSY.__loaderData);