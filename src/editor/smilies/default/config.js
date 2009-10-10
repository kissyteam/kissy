
KISSY.Editor.add("smilies~config~default", function(E) {

    E.Smilies = E.Smilies || {};

    E.Smilies["default"] = {

        name: "default",

        mode: "icons",

        cols: 5,
        
        fileNames: [
                "smile",  "confused",  "cool",      "cry",   "eek",
                "angry",  "wink",      "sweat",     "lol",   "stun",
                "razz",   "shy",       "rolleyes",  "sad",   "happy",
                "yes",    "no",        "heart",     "idea",  "rose"
        ],

        fileExt: "gif"
    };

});
