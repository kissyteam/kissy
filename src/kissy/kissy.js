/**
 * @module kissy
 * @creator lifesinger@gmail.com
 */

if(typeof KISSY === "undefined" || !KISSY) {
    var KISSY = { version: "0.5.0" };
}

/**
 * Applies the supplier's properties to the receiver.
 * @param {object} r the object to receive the augmentation
 * @param {object} s the object that supplies the properties to augment
 * @param {boolean} ov if true, properties already on the receiver
 *                     will be overwritten if found on the supplier.
 * @return {object} the augmented object
 */
KISSY.mix = function(r, s, ov) {

};

KISSY.namespace = function() {
    var a=arguments, o=null, i, j, d;
    for (i=0; i<a.length; i=i+1) {
        d=(""+a[i]).split(".");
        o=YAHOO;

        // YAHOO is implied, so it is ignored if it is included
        for (j=(d[0] == "YAHOO") ? 1 : 0; j<d.length; j=j+1) {
            o[d[j]]=o[d[j]] || {};
            o=o[d[j]];
        }
    }

    return o;
};

