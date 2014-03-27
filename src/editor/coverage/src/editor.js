function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/editor.js']) {
  _$jscoverage['/editor.js'] = {};
  _$jscoverage['/editor.js'].lineData = [];
  _$jscoverage['/editor.js'].lineData[6] = 0;
  _$jscoverage['/editor.js'].lineData[7] = 0;
  _$jscoverage['/editor.js'].lineData[8] = 0;
  _$jscoverage['/editor.js'].lineData[9] = 0;
  _$jscoverage['/editor.js'].lineData[10] = 0;
  _$jscoverage['/editor.js'].lineData[11] = 0;
  _$jscoverage['/editor.js'].lineData[12] = 0;
  _$jscoverage['/editor.js'].lineData[13] = 0;
  _$jscoverage['/editor.js'].lineData[14] = 0;
  _$jscoverage['/editor.js'].lineData[15] = 0;
  _$jscoverage['/editor.js'].lineData[16] = 0;
  _$jscoverage['/editor.js'].lineData[17] = 0;
  _$jscoverage['/editor.js'].lineData[18] = 0;
  _$jscoverage['/editor.js'].lineData[19] = 0;
  _$jscoverage['/editor.js'].lineData[20] = 0;
  _$jscoverage['/editor.js'].lineData[21] = 0;
  _$jscoverage['/editor.js'].lineData[22] = 0;
  _$jscoverage['/editor.js'].lineData[45] = 0;
  _$jscoverage['/editor.js'].lineData[50] = 0;
  _$jscoverage['/editor.js'].lineData[52] = 0;
  _$jscoverage['/editor.js'].lineData[54] = 0;
  _$jscoverage['/editor.js'].lineData[55] = 0;
  _$jscoverage['/editor.js'].lineData[56] = 0;
  _$jscoverage['/editor.js'].lineData[58] = 0;
  _$jscoverage['/editor.js'].lineData[63] = 0;
  _$jscoverage['/editor.js'].lineData[64] = 0;
  _$jscoverage['/editor.js'].lineData[65] = 0;
  _$jscoverage['/editor.js'].lineData[66] = 0;
  _$jscoverage['/editor.js'].lineData[67] = 0;
  _$jscoverage['/editor.js'].lineData[71] = 0;
  _$jscoverage['/editor.js'].lineData[76] = 0;
  _$jscoverage['/editor.js'].lineData[79] = 0;
  _$jscoverage['/editor.js'].lineData[82] = 0;
  _$jscoverage['/editor.js'].lineData[83] = 0;
  _$jscoverage['/editor.js'].lineData[85] = 0;
  _$jscoverage['/editor.js'].lineData[86] = 0;
  _$jscoverage['/editor.js'].lineData[89] = 0;
  _$jscoverage['/editor.js'].lineData[90] = 0;
  _$jscoverage['/editor.js'].lineData[91] = 0;
  _$jscoverage['/editor.js'].lineData[96] = 0;
  _$jscoverage['/editor.js'].lineData[98] = 0;
  _$jscoverage['/editor.js'].lineData[99] = 0;
  _$jscoverage['/editor.js'].lineData[102] = 0;
  _$jscoverage['/editor.js'].lineData[103] = 0;
  _$jscoverage['/editor.js'].lineData[109] = 0;
  _$jscoverage['/editor.js'].lineData[113] = 0;
  _$jscoverage['/editor.js'].lineData[115] = 0;
  _$jscoverage['/editor.js'].lineData[117] = 0;
  _$jscoverage['/editor.js'].lineData[118] = 0;
  _$jscoverage['/editor.js'].lineData[122] = 0;
  _$jscoverage['/editor.js'].lineData[125] = 0;
  _$jscoverage['/editor.js'].lineData[126] = 0;
  _$jscoverage['/editor.js'].lineData[127] = 0;
  _$jscoverage['/editor.js'].lineData[128] = 0;
  _$jscoverage['/editor.js'].lineData[131] = 0;
  _$jscoverage['/editor.js'].lineData[132] = 0;
  _$jscoverage['/editor.js'].lineData[133] = 0;
  _$jscoverage['/editor.js'].lineData[135] = 0;
  _$jscoverage['/editor.js'].lineData[136] = 0;
  _$jscoverage['/editor.js'].lineData[142] = 0;
  _$jscoverage['/editor.js'].lineData[144] = 0;
  _$jscoverage['/editor.js'].lineData[145] = 0;
  _$jscoverage['/editor.js'].lineData[150] = 0;
  _$jscoverage['/editor.js'].lineData[155] = 0;
  _$jscoverage['/editor.js'].lineData[158] = 0;
  _$jscoverage['/editor.js'].lineData[161] = 0;
  _$jscoverage['/editor.js'].lineData[162] = 0;
  _$jscoverage['/editor.js'].lineData[166] = 0;
  _$jscoverage['/editor.js'].lineData[168] = 0;
  _$jscoverage['/editor.js'].lineData[170] = 0;
  _$jscoverage['/editor.js'].lineData[172] = 0;
  _$jscoverage['/editor.js'].lineData[174] = 0;
  _$jscoverage['/editor.js'].lineData[177] = 0;
  _$jscoverage['/editor.js'].lineData[178] = 0;
  _$jscoverage['/editor.js'].lineData[179] = 0;
  _$jscoverage['/editor.js'].lineData[183] = 0;
  _$jscoverage['/editor.js'].lineData[184] = 0;
  _$jscoverage['/editor.js'].lineData[191] = 0;
  _$jscoverage['/editor.js'].lineData[192] = 0;
  _$jscoverage['/editor.js'].lineData[200] = 0;
  _$jscoverage['/editor.js'].lineData[208] = 0;
  _$jscoverage['/editor.js'].lineData[217] = 0;
  _$jscoverage['/editor.js'].lineData[227] = 0;
  _$jscoverage['/editor.js'].lineData[228] = 0;
  _$jscoverage['/editor.js'].lineData[230] = 0;
  _$jscoverage['/editor.js'].lineData[231] = 0;
  _$jscoverage['/editor.js'].lineData[245] = 0;
  _$jscoverage['/editor.js'].lineData[254] = 0;
  _$jscoverage['/editor.js'].lineData[264] = 0;
  _$jscoverage['/editor.js'].lineData[267] = 0;
  _$jscoverage['/editor.js'].lineData[268] = 0;
  _$jscoverage['/editor.js'].lineData[269] = 0;
  _$jscoverage['/editor.js'].lineData[270] = 0;
  _$jscoverage['/editor.js'].lineData[272] = 0;
  _$jscoverage['/editor.js'].lineData[273] = 0;
  _$jscoverage['/editor.js'].lineData[283] = 0;
  _$jscoverage['/editor.js'].lineData[287] = 0;
  _$jscoverage['/editor.js'].lineData[290] = 0;
  _$jscoverage['/editor.js'].lineData[292] = 0;
  _$jscoverage['/editor.js'].lineData[293] = 0;
  _$jscoverage['/editor.js'].lineData[295] = 0;
  _$jscoverage['/editor.js'].lineData[296] = 0;
  _$jscoverage['/editor.js'].lineData[299] = 0;
  _$jscoverage['/editor.js'].lineData[300] = 0;
  _$jscoverage['/editor.js'].lineData[311] = 0;
  _$jscoverage['/editor.js'].lineData[314] = 0;
  _$jscoverage['/editor.js'].lineData[315] = 0;
  _$jscoverage['/editor.js'].lineData[317] = 0;
  _$jscoverage['/editor.js'].lineData[318] = 0;
  _$jscoverage['/editor.js'].lineData[320] = 0;
  _$jscoverage['/editor.js'].lineData[323] = 0;
  _$jscoverage['/editor.js'].lineData[324] = 0;
  _$jscoverage['/editor.js'].lineData[326] = 0;
  _$jscoverage['/editor.js'].lineData[328] = 0;
  _$jscoverage['/editor.js'].lineData[332] = 0;
  _$jscoverage['/editor.js'].lineData[333] = 0;
  _$jscoverage['/editor.js'].lineData[335] = 0;
  _$jscoverage['/editor.js'].lineData[345] = 0;
  _$jscoverage['/editor.js'].lineData[353] = 0;
  _$jscoverage['/editor.js'].lineData[354] = 0;
  _$jscoverage['/editor.js'].lineData[363] = 0;
  _$jscoverage['/editor.js'].lineData[372] = 0;
  _$jscoverage['/editor.js'].lineData[376] = 0;
  _$jscoverage['/editor.js'].lineData[377] = 0;
  _$jscoverage['/editor.js'].lineData[378] = 0;
  _$jscoverage['/editor.js'].lineData[379] = 0;
  _$jscoverage['/editor.js'].lineData[380] = 0;
  _$jscoverage['/editor.js'].lineData[382] = 0;
  _$jscoverage['/editor.js'].lineData[390] = 0;
  _$jscoverage['/editor.js'].lineData[393] = 0;
  _$jscoverage['/editor.js'].lineData[394] = 0;
  _$jscoverage['/editor.js'].lineData[396] = 0;
  _$jscoverage['/editor.js'].lineData[397] = 0;
  _$jscoverage['/editor.js'].lineData[399] = 0;
  _$jscoverage['/editor.js'].lineData[402] = 0;
  _$jscoverage['/editor.js'].lineData[403] = 0;
  _$jscoverage['/editor.js'].lineData[408] = 0;
  _$jscoverage['/editor.js'].lineData[409] = 0;
  _$jscoverage['/editor.js'].lineData[412] = 0;
  _$jscoverage['/editor.js'].lineData[413] = 0;
  _$jscoverage['/editor.js'].lineData[417] = 0;
  _$jscoverage['/editor.js'].lineData[425] = 0;
  _$jscoverage['/editor.js'].lineData[427] = 0;
  _$jscoverage['/editor.js'].lineData[428] = 0;
  _$jscoverage['/editor.js'].lineData[438] = 0;
  _$jscoverage['/editor.js'].lineData[441] = 0;
  _$jscoverage['/editor.js'].lineData[442] = 0;
  _$jscoverage['/editor.js'].lineData[443] = 0;
  _$jscoverage['/editor.js'].lineData[444] = 0;
  _$jscoverage['/editor.js'].lineData[454] = 0;
  _$jscoverage['/editor.js'].lineData[463] = 0;
  _$jscoverage['/editor.js'].lineData[466] = 0;
  _$jscoverage['/editor.js'].lineData[467] = 0;
  _$jscoverage['/editor.js'].lineData[468] = 0;
  _$jscoverage['/editor.js'].lineData[469] = 0;
  _$jscoverage['/editor.js'].lineData[470] = 0;
  _$jscoverage['/editor.js'].lineData[471] = 0;
  _$jscoverage['/editor.js'].lineData[480] = 0;
  _$jscoverage['/editor.js'].lineData[483] = 0;
  _$jscoverage['/editor.js'].lineData[484] = 0;
  _$jscoverage['/editor.js'].lineData[485] = 0;
  _$jscoverage['/editor.js'].lineData[488] = 0;
  _$jscoverage['/editor.js'].lineData[490] = 0;
  _$jscoverage['/editor.js'].lineData[491] = 0;
  _$jscoverage['/editor.js'].lineData[502] = 0;
  _$jscoverage['/editor.js'].lineData[503] = 0;
  _$jscoverage['/editor.js'].lineData[504] = 0;
  _$jscoverage['/editor.js'].lineData[505] = 0;
  _$jscoverage['/editor.js'].lineData[515] = 0;
  _$jscoverage['/editor.js'].lineData[524] = 0;
  _$jscoverage['/editor.js'].lineData[525] = 0;
  _$jscoverage['/editor.js'].lineData[526] = 0;
  _$jscoverage['/editor.js'].lineData[529] = 0;
  _$jscoverage['/editor.js'].lineData[530] = 0;
  _$jscoverage['/editor.js'].lineData[531] = 0;
  _$jscoverage['/editor.js'].lineData[532] = 0;
  _$jscoverage['/editor.js'].lineData[534] = 0;
  _$jscoverage['/editor.js'].lineData[535] = 0;
  _$jscoverage['/editor.js'].lineData[536] = 0;
  _$jscoverage['/editor.js'].lineData[552] = 0;
  _$jscoverage['/editor.js'].lineData[553] = 0;
  _$jscoverage['/editor.js'].lineData[554] = 0;
  _$jscoverage['/editor.js'].lineData[563] = 0;
  _$jscoverage['/editor.js'].lineData[565] = 0;
  _$jscoverage['/editor.js'].lineData[566] = 0;
  _$jscoverage['/editor.js'].lineData[569] = 0;
  _$jscoverage['/editor.js'].lineData[571] = 0;
  _$jscoverage['/editor.js'].lineData[585] = 0;
  _$jscoverage['/editor.js'].lineData[586] = 0;
  _$jscoverage['/editor.js'].lineData[589] = 0;
  _$jscoverage['/editor.js'].lineData[591] = 0;
  _$jscoverage['/editor.js'].lineData[592] = 0;
  _$jscoverage['/editor.js'].lineData[595] = 0;
  _$jscoverage['/editor.js'].lineData[596] = 0;
  _$jscoverage['/editor.js'].lineData[599] = 0;
  _$jscoverage['/editor.js'].lineData[600] = 0;
  _$jscoverage['/editor.js'].lineData[604] = 0;
  _$jscoverage['/editor.js'].lineData[605] = 0;
  _$jscoverage['/editor.js'].lineData[608] = 0;
  _$jscoverage['/editor.js'].lineData[611] = 0;
  _$jscoverage['/editor.js'].lineData[612] = 0;
  _$jscoverage['/editor.js'].lineData[613] = 0;
  _$jscoverage['/editor.js'].lineData[614] = 0;
  _$jscoverage['/editor.js'].lineData[617] = 0;
  _$jscoverage['/editor.js'].lineData[620] = 0;
  _$jscoverage['/editor.js'].lineData[623] = 0;
  _$jscoverage['/editor.js'].lineData[624] = 0;
  _$jscoverage['/editor.js'].lineData[627] = 0;
  _$jscoverage['/editor.js'].lineData[628] = 0;
  _$jscoverage['/editor.js'].lineData[634] = 0;
  _$jscoverage['/editor.js'].lineData[635] = 0;
  _$jscoverage['/editor.js'].lineData[645] = 0;
  _$jscoverage['/editor.js'].lineData[649] = 0;
  _$jscoverage['/editor.js'].lineData[650] = 0;
  _$jscoverage['/editor.js'].lineData[653] = 0;
  _$jscoverage['/editor.js'].lineData[654] = 0;
  _$jscoverage['/editor.js'].lineData[657] = 0;
  _$jscoverage['/editor.js'].lineData[658] = 0;
  _$jscoverage['/editor.js'].lineData[662] = 0;
  _$jscoverage['/editor.js'].lineData[663] = 0;
  _$jscoverage['/editor.js'].lineData[664] = 0;
  _$jscoverage['/editor.js'].lineData[665] = 0;
  _$jscoverage['/editor.js'].lineData[667] = 0;
  _$jscoverage['/editor.js'].lineData[668] = 0;
  _$jscoverage['/editor.js'].lineData[670] = 0;
  _$jscoverage['/editor.js'].lineData[677] = 0;
  _$jscoverage['/editor.js'].lineData[680] = 0;
  _$jscoverage['/editor.js'].lineData[685] = 0;
  _$jscoverage['/editor.js'].lineData[686] = 0;
  _$jscoverage['/editor.js'].lineData[687] = 0;
  _$jscoverage['/editor.js'].lineData[688] = 0;
  _$jscoverage['/editor.js'].lineData[689] = 0;
  _$jscoverage['/editor.js'].lineData[691] = 0;
  _$jscoverage['/editor.js'].lineData[694] = 0;
  _$jscoverage['/editor.js'].lineData[695] = 0;
  _$jscoverage['/editor.js'].lineData[696] = 0;
  _$jscoverage['/editor.js'].lineData[697] = 0;
  _$jscoverage['/editor.js'].lineData[698] = 0;
  _$jscoverage['/editor.js'].lineData[699] = 0;
  _$jscoverage['/editor.js'].lineData[704] = 0;
  _$jscoverage['/editor.js'].lineData[705] = 0;
  _$jscoverage['/editor.js'].lineData[707] = 0;
  _$jscoverage['/editor.js'].lineData[719] = 0;
  _$jscoverage['/editor.js'].lineData[720] = 0;
  _$jscoverage['/editor.js'].lineData[721] = 0;
  _$jscoverage['/editor.js'].lineData[722] = 0;
  _$jscoverage['/editor.js'].lineData[723] = 0;
  _$jscoverage['/editor.js'].lineData[724] = 0;
  _$jscoverage['/editor.js'].lineData[725] = 0;
  _$jscoverage['/editor.js'].lineData[726] = 0;
  _$jscoverage['/editor.js'].lineData[727] = 0;
  _$jscoverage['/editor.js'].lineData[729] = 0;
  _$jscoverage['/editor.js'].lineData[730] = 0;
  _$jscoverage['/editor.js'].lineData[732] = 0;
  _$jscoverage['/editor.js'].lineData[733] = 0;
  _$jscoverage['/editor.js'].lineData[735] = 0;
  _$jscoverage['/editor.js'].lineData[736] = 0;
  _$jscoverage['/editor.js'].lineData[737] = 0;
  _$jscoverage['/editor.js'].lineData[738] = 0;
  _$jscoverage['/editor.js'].lineData[739] = 0;
  _$jscoverage['/editor.js'].lineData[746] = 0;
  _$jscoverage['/editor.js'].lineData[747] = 0;
  _$jscoverage['/editor.js'].lineData[753] = 0;
  _$jscoverage['/editor.js'].lineData[755] = 0;
  _$jscoverage['/editor.js'].lineData[757] = 0;
  _$jscoverage['/editor.js'].lineData[759] = 0;
  _$jscoverage['/editor.js'].lineData[781] = 0;
  _$jscoverage['/editor.js'].lineData[783] = 0;
  _$jscoverage['/editor.js'].lineData[786] = 0;
  _$jscoverage['/editor.js'].lineData[787] = 0;
  _$jscoverage['/editor.js'].lineData[788] = 0;
  _$jscoverage['/editor.js'].lineData[792] = 0;
  _$jscoverage['/editor.js'].lineData[794] = 0;
  _$jscoverage['/editor.js'].lineData[795] = 0;
  _$jscoverage['/editor.js'].lineData[796] = 0;
  _$jscoverage['/editor.js'].lineData[797] = 0;
  _$jscoverage['/editor.js'].lineData[799] = 0;
  _$jscoverage['/editor.js'].lineData[807] = 0;
  _$jscoverage['/editor.js'].lineData[818] = 0;
  _$jscoverage['/editor.js'].lineData[819] = 0;
  _$jscoverage['/editor.js'].lineData[826] = 0;
  _$jscoverage['/editor.js'].lineData[827] = 0;
  _$jscoverage['/editor.js'].lineData[828] = 0;
  _$jscoverage['/editor.js'].lineData[829] = 0;
  _$jscoverage['/editor.js'].lineData[836] = 0;
  _$jscoverage['/editor.js'].lineData[842] = 0;
  _$jscoverage['/editor.js'].lineData[851] = 0;
  _$jscoverage['/editor.js'].lineData[852] = 0;
  _$jscoverage['/editor.js'].lineData[853] = 0;
  _$jscoverage['/editor.js'].lineData[854] = 0;
  _$jscoverage['/editor.js'].lineData[855] = 0;
  _$jscoverage['/editor.js'].lineData[861] = 0;
  _$jscoverage['/editor.js'].lineData[862] = 0;
  _$jscoverage['/editor.js'].lineData[863] = 0;
  _$jscoverage['/editor.js'].lineData[867] = 0;
  _$jscoverage['/editor.js'].lineData[869] = 0;
  _$jscoverage['/editor.js'].lineData[871] = 0;
  _$jscoverage['/editor.js'].lineData[872] = 0;
  _$jscoverage['/editor.js'].lineData[873] = 0;
  _$jscoverage['/editor.js'].lineData[878] = 0;
  _$jscoverage['/editor.js'].lineData[879] = 0;
  _$jscoverage['/editor.js'].lineData[880] = 0;
  _$jscoverage['/editor.js'].lineData[883] = 0;
  _$jscoverage['/editor.js'].lineData[893] = 0;
  _$jscoverage['/editor.js'].lineData[894] = 0;
  _$jscoverage['/editor.js'].lineData[895] = 0;
  _$jscoverage['/editor.js'].lineData[897] = 0;
  _$jscoverage['/editor.js'].lineData[899] = 0;
  _$jscoverage['/editor.js'].lineData[900] = 0;
  _$jscoverage['/editor.js'].lineData[901] = 0;
  _$jscoverage['/editor.js'].lineData[903] = 0;
  _$jscoverage['/editor.js'].lineData[904] = 0;
  _$jscoverage['/editor.js'].lineData[910] = 0;
  _$jscoverage['/editor.js'].lineData[911] = 0;
  _$jscoverage['/editor.js'].lineData[912] = 0;
  _$jscoverage['/editor.js'].lineData[914] = 0;
  _$jscoverage['/editor.js'].lineData[915] = 0;
  _$jscoverage['/editor.js'].lineData[921] = 0;
  _$jscoverage['/editor.js'].lineData[922] = 0;
  _$jscoverage['/editor.js'].lineData[931] = 0;
  _$jscoverage['/editor.js'].lineData[932] = 0;
  _$jscoverage['/editor.js'].lineData[933] = 0;
  _$jscoverage['/editor.js'].lineData[934] = 0;
  _$jscoverage['/editor.js'].lineData[935] = 0;
  _$jscoverage['/editor.js'].lineData[939] = 0;
  _$jscoverage['/editor.js'].lineData[940] = 0;
  _$jscoverage['/editor.js'].lineData[941] = 0;
  _$jscoverage['/editor.js'].lineData[942] = 0;
  _$jscoverage['/editor.js'].lineData[948] = 0;
  _$jscoverage['/editor.js'].lineData[949] = 0;
  _$jscoverage['/editor.js'].lineData[950] = 0;
  _$jscoverage['/editor.js'].lineData[957] = 0;
  _$jscoverage['/editor.js'].lineData[958] = 0;
  _$jscoverage['/editor.js'].lineData[960] = 0;
  _$jscoverage['/editor.js'].lineData[961] = 0;
  _$jscoverage['/editor.js'].lineData[962] = 0;
  _$jscoverage['/editor.js'].lineData[965] = 0;
  _$jscoverage['/editor.js'].lineData[966] = 0;
  _$jscoverage['/editor.js'].lineData[967] = 0;
  _$jscoverage['/editor.js'].lineData[971] = 0;
  _$jscoverage['/editor.js'].lineData[977] = 0;
  _$jscoverage['/editor.js'].lineData[978] = 0;
  _$jscoverage['/editor.js'].lineData[979] = 0;
  _$jscoverage['/editor.js'].lineData[980] = 0;
  _$jscoverage['/editor.js'].lineData[983] = 0;
  _$jscoverage['/editor.js'].lineData[986] = 0;
  _$jscoverage['/editor.js'].lineData[990] = 0;
  _$jscoverage['/editor.js'].lineData[991] = 0;
  _$jscoverage['/editor.js'].lineData[992] = 0;
  _$jscoverage['/editor.js'].lineData[997] = 0;
  _$jscoverage['/editor.js'].lineData[1003] = 0;
  _$jscoverage['/editor.js'].lineData[1004] = 0;
  _$jscoverage['/editor.js'].lineData[1006] = 0;
  _$jscoverage['/editor.js'].lineData[1007] = 0;
  _$jscoverage['/editor.js'].lineData[1009] = 0;
  _$jscoverage['/editor.js'].lineData[1011] = 0;
  _$jscoverage['/editor.js'].lineData[1014] = 0;
  _$jscoverage['/editor.js'].lineData[1016] = 0;
  _$jscoverage['/editor.js'].lineData[1017] = 0;
  _$jscoverage['/editor.js'].lineData[1018] = 0;
  _$jscoverage['/editor.js'].lineData[1019] = 0;
  _$jscoverage['/editor.js'].lineData[1027] = 0;
  _$jscoverage['/editor.js'].lineData[1028] = 0;
  _$jscoverage['/editor.js'].lineData[1029] = 0;
  _$jscoverage['/editor.js'].lineData[1030] = 0;
  _$jscoverage['/editor.js'].lineData[1031] = 0;
  _$jscoverage['/editor.js'].lineData[1032] = 0;
  _$jscoverage['/editor.js'].lineData[1040] = 0;
  _$jscoverage['/editor.js'].lineData[1041] = 0;
  _$jscoverage['/editor.js'].lineData[1042] = 0;
  _$jscoverage['/editor.js'].lineData[1043] = 0;
  _$jscoverage['/editor.js'].lineData[1044] = 0;
  _$jscoverage['/editor.js'].lineData[1049] = 0;
  _$jscoverage['/editor.js'].lineData[1050] = 0;
  _$jscoverage['/editor.js'].lineData[1051] = 0;
  _$jscoverage['/editor.js'].lineData[1052] = 0;
  _$jscoverage['/editor.js'].lineData[1054] = 0;
  _$jscoverage['/editor.js'].lineData[1060] = 0;
  _$jscoverage['/editor.js'].lineData[1063] = 0;
  _$jscoverage['/editor.js'].lineData[1064] = 0;
  _$jscoverage['/editor.js'].lineData[1066] = 0;
  _$jscoverage['/editor.js'].lineData[1067] = 0;
  _$jscoverage['/editor.js'].lineData[1068] = 0;
  _$jscoverage['/editor.js'].lineData[1069] = 0;
  _$jscoverage['/editor.js'].lineData[1070] = 0;
  _$jscoverage['/editor.js'].lineData[1074] = 0;
  _$jscoverage['/editor.js'].lineData[1101] = 0;
  _$jscoverage['/editor.js'].lineData[1102] = 0;
  _$jscoverage['/editor.js'].lineData[1105] = 0;
  _$jscoverage['/editor.js'].lineData[1106] = 0;
  _$jscoverage['/editor.js'].lineData[1113] = 0;
  _$jscoverage['/editor.js'].lineData[1114] = 0;
  _$jscoverage['/editor.js'].lineData[1122] = 0;
  _$jscoverage['/editor.js'].lineData[1127] = 0;
  _$jscoverage['/editor.js'].lineData[1130] = 0;
  _$jscoverage['/editor.js'].lineData[1131] = 0;
  _$jscoverage['/editor.js'].lineData[1132] = 0;
  _$jscoverage['/editor.js'].lineData[1135] = 0;
  _$jscoverage['/editor.js'].lineData[1136] = 0;
  _$jscoverage['/editor.js'].lineData[1137] = 0;
  _$jscoverage['/editor.js'].lineData[1138] = 0;
  _$jscoverage['/editor.js'].lineData[1139] = 0;
  _$jscoverage['/editor.js'].lineData[1140] = 0;
  _$jscoverage['/editor.js'].lineData[1142] = 0;
  _$jscoverage['/editor.js'].lineData[1143] = 0;
  _$jscoverage['/editor.js'].lineData[1144] = 0;
  _$jscoverage['/editor.js'].lineData[1148] = 0;
  _$jscoverage['/editor.js'].lineData[1152] = 0;
  _$jscoverage['/editor.js'].lineData[1153] = 0;
  _$jscoverage['/editor.js'].lineData[1154] = 0;
  _$jscoverage['/editor.js'].lineData[1156] = 0;
  _$jscoverage['/editor.js'].lineData[1161] = 0;
  _$jscoverage['/editor.js'].lineData[1162] = 0;
  _$jscoverage['/editor.js'].lineData[1164] = 0;
  _$jscoverage['/editor.js'].lineData[1165] = 0;
  _$jscoverage['/editor.js'].lineData[1166] = 0;
  _$jscoverage['/editor.js'].lineData[1168] = 0;
  _$jscoverage['/editor.js'].lineData[1169] = 0;
  _$jscoverage['/editor.js'].lineData[1170] = 0;
  _$jscoverage['/editor.js'].lineData[1174] = 0;
  _$jscoverage['/editor.js'].lineData[1178] = 0;
  _$jscoverage['/editor.js'].lineData[1179] = 0;
  _$jscoverage['/editor.js'].lineData[1180] = 0;
  _$jscoverage['/editor.js'].lineData[1182] = 0;
  _$jscoverage['/editor.js'].lineData[1188] = 0;
  _$jscoverage['/editor.js'].lineData[1189] = 0;
  _$jscoverage['/editor.js'].lineData[1191] = 0;
}
if (! _$jscoverage['/editor.js'].functionData) {
  _$jscoverage['/editor.js'].functionData = [];
  _$jscoverage['/editor.js'].functionData[0] = 0;
  _$jscoverage['/editor.js'].functionData[1] = 0;
  _$jscoverage['/editor.js'].functionData[2] = 0;
  _$jscoverage['/editor.js'].functionData[3] = 0;
  _$jscoverage['/editor.js'].functionData[4] = 0;
  _$jscoverage['/editor.js'].functionData[5] = 0;
  _$jscoverage['/editor.js'].functionData[6] = 0;
  _$jscoverage['/editor.js'].functionData[7] = 0;
  _$jscoverage['/editor.js'].functionData[8] = 0;
  _$jscoverage['/editor.js'].functionData[9] = 0;
  _$jscoverage['/editor.js'].functionData[10] = 0;
  _$jscoverage['/editor.js'].functionData[11] = 0;
  _$jscoverage['/editor.js'].functionData[12] = 0;
  _$jscoverage['/editor.js'].functionData[13] = 0;
  _$jscoverage['/editor.js'].functionData[14] = 0;
  _$jscoverage['/editor.js'].functionData[15] = 0;
  _$jscoverage['/editor.js'].functionData[16] = 0;
  _$jscoverage['/editor.js'].functionData[17] = 0;
  _$jscoverage['/editor.js'].functionData[18] = 0;
  _$jscoverage['/editor.js'].functionData[19] = 0;
  _$jscoverage['/editor.js'].functionData[20] = 0;
  _$jscoverage['/editor.js'].functionData[21] = 0;
  _$jscoverage['/editor.js'].functionData[22] = 0;
  _$jscoverage['/editor.js'].functionData[23] = 0;
  _$jscoverage['/editor.js'].functionData[24] = 0;
  _$jscoverage['/editor.js'].functionData[25] = 0;
  _$jscoverage['/editor.js'].functionData[26] = 0;
  _$jscoverage['/editor.js'].functionData[27] = 0;
  _$jscoverage['/editor.js'].functionData[28] = 0;
  _$jscoverage['/editor.js'].functionData[29] = 0;
  _$jscoverage['/editor.js'].functionData[30] = 0;
  _$jscoverage['/editor.js'].functionData[31] = 0;
  _$jscoverage['/editor.js'].functionData[32] = 0;
  _$jscoverage['/editor.js'].functionData[33] = 0;
  _$jscoverage['/editor.js'].functionData[34] = 0;
  _$jscoverage['/editor.js'].functionData[35] = 0;
  _$jscoverage['/editor.js'].functionData[36] = 0;
  _$jscoverage['/editor.js'].functionData[37] = 0;
  _$jscoverage['/editor.js'].functionData[38] = 0;
  _$jscoverage['/editor.js'].functionData[39] = 0;
  _$jscoverage['/editor.js'].functionData[40] = 0;
  _$jscoverage['/editor.js'].functionData[41] = 0;
  _$jscoverage['/editor.js'].functionData[42] = 0;
  _$jscoverage['/editor.js'].functionData[43] = 0;
  _$jscoverage['/editor.js'].functionData[44] = 0;
  _$jscoverage['/editor.js'].functionData[45] = 0;
  _$jscoverage['/editor.js'].functionData[46] = 0;
  _$jscoverage['/editor.js'].functionData[47] = 0;
  _$jscoverage['/editor.js'].functionData[48] = 0;
  _$jscoverage['/editor.js'].functionData[49] = 0;
  _$jscoverage['/editor.js'].functionData[50] = 0;
  _$jscoverage['/editor.js'].functionData[51] = 0;
  _$jscoverage['/editor.js'].functionData[52] = 0;
  _$jscoverage['/editor.js'].functionData[53] = 0;
  _$jscoverage['/editor.js'].functionData[54] = 0;
  _$jscoverage['/editor.js'].functionData[55] = 0;
  _$jscoverage['/editor.js'].functionData[56] = 0;
  _$jscoverage['/editor.js'].functionData[57] = 0;
  _$jscoverage['/editor.js'].functionData[58] = 0;
  _$jscoverage['/editor.js'].functionData[59] = 0;
  _$jscoverage['/editor.js'].functionData[60] = 0;
  _$jscoverage['/editor.js'].functionData[61] = 0;
  _$jscoverage['/editor.js'].functionData[62] = 0;
  _$jscoverage['/editor.js'].functionData[63] = 0;
  _$jscoverage['/editor.js'].functionData[64] = 0;
  _$jscoverage['/editor.js'].functionData[65] = 0;
  _$jscoverage['/editor.js'].functionData[66] = 0;
  _$jscoverage['/editor.js'].functionData[67] = 0;
  _$jscoverage['/editor.js'].functionData[68] = 0;
  _$jscoverage['/editor.js'].functionData[69] = 0;
  _$jscoverage['/editor.js'].functionData[70] = 0;
  _$jscoverage['/editor.js'].functionData[71] = 0;
  _$jscoverage['/editor.js'].functionData[72] = 0;
  _$jscoverage['/editor.js'].functionData[73] = 0;
  _$jscoverage['/editor.js'].functionData[74] = 0;
}
if (! _$jscoverage['/editor.js'].branchData) {
  _$jscoverage['/editor.js'].branchData = {};
  _$jscoverage['/editor.js'].branchData['29'] = [];
  _$jscoverage['/editor.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['76'] = [];
  _$jscoverage['/editor.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['77'] = [];
  _$jscoverage['/editor.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['85'] = [];
  _$jscoverage['/editor.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['90'] = [];
  _$jscoverage['/editor.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['115'] = [];
  _$jscoverage['/editor.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['115'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['116'] = [];
  _$jscoverage['/editor.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['116'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['125'] = [];
  _$jscoverage['/editor.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['131'] = [];
  _$jscoverage['/editor.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['144'] = [];
  _$jscoverage['/editor.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['155'] = [];
  _$jscoverage['/editor.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['156'] = [];
  _$jscoverage['/editor.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['161'] = [];
  _$jscoverage['/editor.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['178'] = [];
  _$jscoverage['/editor.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['269'] = [];
  _$jscoverage['/editor.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['290'] = [];
  _$jscoverage['/editor.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['314'] = [];
  _$jscoverage['/editor.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['317'] = [];
  _$jscoverage['/editor.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['317'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['323'] = [];
  _$jscoverage['/editor.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['332'] = [];
  _$jscoverage['/editor.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['376'] = [];
  _$jscoverage['/editor.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['393'] = [];
  _$jscoverage['/editor.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['399'] = [];
  _$jscoverage['/editor.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['402'] = [];
  _$jscoverage['/editor.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['408'] = [];
  _$jscoverage['/editor.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['440'] = [];
  _$jscoverage['/editor.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['443'] = [];
  _$jscoverage['/editor.js'].branchData['443'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['484'] = [];
  _$jscoverage['/editor.js'].branchData['484'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['490'] = [];
  _$jscoverage['/editor.js'].branchData['490'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['504'] = [];
  _$jscoverage['/editor.js'].branchData['504'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['525'] = [];
  _$jscoverage['/editor.js'].branchData['525'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['531'] = [];
  _$jscoverage['/editor.js'].branchData['531'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['534'] = [];
  _$jscoverage['/editor.js'].branchData['534'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['565'] = [];
  _$jscoverage['/editor.js'].branchData['565'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['577'] = [];
  _$jscoverage['/editor.js'].branchData['577'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['585'] = [];
  _$jscoverage['/editor.js'].branchData['585'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['585'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['591'] = [];
  _$jscoverage['/editor.js'].branchData['591'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['595'] = [];
  _$jscoverage['/editor.js'].branchData['595'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['595'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['599'] = [];
  _$jscoverage['/editor.js'].branchData['599'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['604'] = [];
  _$jscoverage['/editor.js'].branchData['604'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['611'] = [];
  _$jscoverage['/editor.js'].branchData['611'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['614'] = [];
  _$jscoverage['/editor.js'].branchData['614'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['614'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['614'][3] = new BranchData();
  _$jscoverage['/editor.js'].branchData['617'] = [];
  _$jscoverage['/editor.js'].branchData['617'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['618'] = [];
  _$jscoverage['/editor.js'].branchData['618'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['627'] = [];
  _$jscoverage['/editor.js'].branchData['627'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['627'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['649'] = [];
  _$jscoverage['/editor.js'].branchData['649'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['663'] = [];
  _$jscoverage['/editor.js'].branchData['663'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['664'] = [];
  _$jscoverage['/editor.js'].branchData['664'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['694'] = [];
  _$jscoverage['/editor.js'].branchData['694'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['720'] = [];
  _$jscoverage['/editor.js'].branchData['720'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['722'] = [];
  _$jscoverage['/editor.js'].branchData['722'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['726'] = [];
  _$jscoverage['/editor.js'].branchData['726'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['727'] = [];
  _$jscoverage['/editor.js'].branchData['727'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['729'] = [];
  _$jscoverage['/editor.js'].branchData['729'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['730'] = [];
  _$jscoverage['/editor.js'].branchData['730'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['732'] = [];
  _$jscoverage['/editor.js'].branchData['732'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['735'] = [];
  _$jscoverage['/editor.js'].branchData['735'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['781'] = [];
  _$jscoverage['/editor.js'].branchData['781'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['794'] = [];
  _$jscoverage['/editor.js'].branchData['794'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['796'] = [];
  _$jscoverage['/editor.js'].branchData['796'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['816'] = [];
  _$jscoverage['/editor.js'].branchData['816'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['827'] = [];
  _$jscoverage['/editor.js'].branchData['827'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['828'] = [];
  _$jscoverage['/editor.js'].branchData['828'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['851'] = [];
  _$jscoverage['/editor.js'].branchData['851'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['853'] = [];
  _$jscoverage['/editor.js'].branchData['853'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['869'] = [];
  _$jscoverage['/editor.js'].branchData['869'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['880'] = [];
  _$jscoverage['/editor.js'].branchData['880'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['881'] = [];
  _$jscoverage['/editor.js'].branchData['881'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['881'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['903'] = [];
  _$jscoverage['/editor.js'].branchData['903'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['914'] = [];
  _$jscoverage['/editor.js'].branchData['914'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['931'] = [];
  _$jscoverage['/editor.js'].branchData['931'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['934'] = [];
  _$jscoverage['/editor.js'].branchData['934'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['941'] = [];
  _$jscoverage['/editor.js'].branchData['941'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['948'] = [];
  _$jscoverage['/editor.js'].branchData['948'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['948'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['961'] = [];
  _$jscoverage['/editor.js'].branchData['961'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['977'] = [];
  _$jscoverage['/editor.js'].branchData['977'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['979'] = [];
  _$jscoverage['/editor.js'].branchData['979'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['986'] = [];
  _$jscoverage['/editor.js'].branchData['986'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['991'] = [];
  _$jscoverage['/editor.js'].branchData['991'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['997'] = [];
  _$jscoverage['/editor.js'].branchData['997'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1006'] = [];
  _$jscoverage['/editor.js'].branchData['1006'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1009'] = [];
  _$jscoverage['/editor.js'].branchData['1009'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1027'] = [];
  _$jscoverage['/editor.js'].branchData['1027'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1030'] = [];
  _$jscoverage['/editor.js'].branchData['1030'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1040'] = [];
  _$jscoverage['/editor.js'].branchData['1040'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1043'] = [];
  _$jscoverage['/editor.js'].branchData['1043'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1049'] = [];
  _$jscoverage['/editor.js'].branchData['1049'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1052'] = [];
  _$jscoverage['/editor.js'].branchData['1052'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1052'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1069'] = [];
  _$jscoverage['/editor.js'].branchData['1069'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1078'] = [];
  _$jscoverage['/editor.js'].branchData['1078'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1085'] = [];
  _$jscoverage['/editor.js'].branchData['1085'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1130'] = [];
  _$jscoverage['/editor.js'].branchData['1130'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1152'] = [];
  _$jscoverage['/editor.js'].branchData['1152'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1153'] = [];
  _$jscoverage['/editor.js'].branchData['1153'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1161'] = [];
  _$jscoverage['/editor.js'].branchData['1161'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1168'] = [];
  _$jscoverage['/editor.js'].branchData['1168'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1179'] = [];
  _$jscoverage['/editor.js'].branchData['1179'][1] = new BranchData();
}
_$jscoverage['/editor.js'].branchData['1179'][1].init(13, 19, '!self.get(\'iframe\')');
function visit1248_1179_1(result) {
  _$jscoverage['/editor.js'].branchData['1179'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1168'][1].init(877, 28, 'UA.gecko && !iframe.__loaded');
function visit1247_1168_1(result) {
  _$jscoverage['/editor.js'].branchData['1168'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1161'][1].init(555, 28, 'textarea.hasAttr(\'tabindex\')');
function visit1246_1161_1(result) {
  _$jscoverage['/editor.js'].branchData['1161'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1153'][1].init(261, 9, 'iframeSrc');
function visit1245_1153_1(result) {
  _$jscoverage['/editor.js'].branchData['1153'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1152'][1].init(212, 35, '$(window).getEmptyIframeSrc() || \'\'');
function visit1244_1152_1(result) {
  _$jscoverage['/editor.js'].branchData['1152'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1130'][1].init(371, 9, 'IS_IE < 7');
function visit1243_1130_1(result) {
  _$jscoverage['/editor.js'].branchData['1130'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1085'][1].init(518, 10, 'data || \'\'');
function visit1242_1085_1(result) {
  _$jscoverage['/editor.js'].branchData['1085'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1078'][1].init(232, 17, 'S.UA.ieMode === 8');
function visit1241_1078_1(result) {
  _$jscoverage['/editor.js'].branchData['1078'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1069'][1].init(216, 21, 'i < customLink.length');
function visit1240_1069_1(result) {
  _$jscoverage['/editor.js'].branchData['1069'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1052'][2].init(72, 28, 'control.nodeName() === \'img\'');
function visit1239_1052_2(result) {
  _$jscoverage['/editor.js'].branchData['1052'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1052'][1].init(72, 64, 'control.nodeName() === \'img\' && /ke_/.test(control[0].className)');
function visit1238_1052_1(result) {
  _$jscoverage['/editor.js'].branchData['1052'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1049'][1].init(4772, 8, 'UA.gecko');
function visit1237_1049_1(result) {
  _$jscoverage['/editor.js'].branchData['1049'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1043'][1].init(72, 75, 'S.inArray(control.nodeName(), [\'img\', \'hr\', \'input\', \'textarea\', \'select\'])');
function visit1236_1043_1(result) {
  _$jscoverage['/editor.js'].branchData['1043'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1040'][1].init(4439, 9, 'UA.webkit');
function visit1235_1040_1(result) {
  _$jscoverage['/editor.js'].branchData['1040'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1030'][1].init(25, 29, 'evt.keyCode in pageUpDownKeys');
function visit1234_1030_1(result) {
  _$jscoverage['/editor.js'].branchData['1030'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1027'][1].init(1331, 31, 'doc.compatMode === \'CSS1Compat\'');
function visit1233_1027_1(result) {
  _$jscoverage['/editor.js'].branchData['1027'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1009'][1].init(136, 7, 'control');
function visit1232_1009_1(result) {
  _$jscoverage['/editor.js'].branchData['1009'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1006'][1].init(104, 24, 'keyCode in {\n  8: 1, \n  46: 1}');
function visit1231_1006_1(result) {
  _$jscoverage['/editor.js'].branchData['1006'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['997'][1].init(2593, 5, 'IS_IE');
function visit1230_997_1(result) {
  _$jscoverage['/editor.js'].branchData['997'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['991'][1].init(21, 19, '!self.__iframeFocus');
function visit1229_991_1(result) {
  _$jscoverage['/editor.js'].branchData['991'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['986'][1].init(2311, 8, 'UA.gecko');
function visit1228_986_1(result) {
  _$jscoverage['/editor.js'].branchData['986'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['979'][1].init(225, 8, 'UA.opera');
function visit1227_979_1(result) {
  _$jscoverage['/editor.js'].branchData['979'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['977'][1].init(148, 8, 'UA.gecko');
function visit1226_977_1(result) {
  _$jscoverage['/editor.js'].branchData['977'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['961'][1].init(22, 31, '(UA.gecko) && self.__iframeFocus');
function visit1225_961_1(result) {
  _$jscoverage['/editor.js'].branchData['961'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['948'][2].init(1045, 17, 'UA.ie || UA.opera');
function visit1224_948_2(result) {
  _$jscoverage['/editor.js'].branchData['948'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['948'][1].init(1033, 29, 'UA.gecko || UA.ie || UA.opera');
function visit1223_948_1(result) {
  _$jscoverage['/editor.js'].branchData['948'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['941'][1].init(72, 52, 'S.inArray(control.nodeName(), [\'input\', \'textarea\'])');
function visit1222_941_1(result) {
  _$jscoverage['/editor.js'].branchData['941'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['934'][1].init(72, 50, 'S.inArray(control.nodeName(), [\'input\', \'select\'])');
function visit1221_934_1(result) {
  _$jscoverage['/editor.js'].branchData['934'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['931'][1].init(387, 9, 'UA.webkit');
function visit1220_931_1(result) {
  _$jscoverage['/editor.js'].branchData['931'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['914'][1].init(221, 6, '!retry');
function visit1219_914_1(result) {
  _$jscoverage['/editor.js'].branchData['914'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['903'][1].init(146, 9, '!go.retry');
function visit1218_903_1(result) {
  _$jscoverage['/editor.js'].branchData['903'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['881'][2].init(53, 24, 't.nodeName() === \'table\'');
function visit1217_881_2(result) {
  _$jscoverage['/editor.js'].branchData['881'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['881'][1].init(53, 85, 't.nodeName() === \'table\' && disableInlineTableEditing');
function visit1216_881_1(result) {
  _$jscoverage['/editor.js'].branchData['881'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['880'][1].init(83, 140, 'disableObjectResizing || (t.nodeName() === \'table\' && disableInlineTableEditing)');
function visit1215_880_1(result) {
  _$jscoverage['/editor.js'].branchData['880'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['869'][1].init(318, 50, 'disableObjectResizing || disableInlineTableEditing');
function visit1214_869_1(result) {
  _$jscoverage['/editor.js'].branchData['869'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['853'][1].init(25, 3, 'doc');
function visit1213_853_1(result) {
  _$jscoverage['/editor.js'].branchData['853'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['851'][1].init(372, 5, 'IS_IE');
function visit1212_851_1(result) {
  _$jscoverage['/editor.js'].branchData['851'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['828'][1].init(25, 8, 'UA.gecko');
function visit1211_828_1(result) {
  _$jscoverage['/editor.js'].branchData['828'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['827'][1].init(319, 17, 't === htmlElement');
function visit1210_827_1(result) {
  _$jscoverage['/editor.js'].branchData['827'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['816'][1].init(364, 20, 'UA.gecko || UA.opera');
function visit1209_816_1(result) {
  _$jscoverage['/editor.js'].branchData['816'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['796'][1].init(199, 9, 'UA.webkit');
function visit1208_796_1(result) {
  _$jscoverage['/editor.js'].branchData['796'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['794'][1].init(98, 20, 'UA.gecko || UA.opera');
function visit1207_794_1(result) {
  _$jscoverage['/editor.js'].branchData['794'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['781'][1].init(1281, 5, 'IS_IE');
function visit1206_781_1(result) {
  _$jscoverage['/editor.js'].branchData['781'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['735'][1].init(507, 26, 'cfg.data || textarea.val()');
function visit1205_735_1(result) {
  _$jscoverage['/editor.js'].branchData['735'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['732'][1].init(431, 4, 'name');
function visit1204_732_1(result) {
  _$jscoverage['/editor.js'].branchData['732'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['730'][1].init(26, 20, 'cfg.height || height');
function visit1203_730_1(result) {
  _$jscoverage['/editor.js'].branchData['730'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['729'][1].init(352, 6, 'height');
function visit1202_729_1(result) {
  _$jscoverage['/editor.js'].branchData['729'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['727'][1].init(25, 18, 'cfg.width || width');
function visit1201_727_1(result) {
  _$jscoverage['/editor.js'].branchData['727'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['726'][1].init(277, 5, 'width');
function visit1200_726_1(result) {
  _$jscoverage['/editor.js'].branchData['726'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['722'][1].init(106, 23, 'cfg.textareaAttrs || {}');
function visit1199_722_1(result) {
  _$jscoverage['/editor.js'].branchData['722'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['720'][1].init(15, 9, 'cfg || {}');
function visit1198_720_1(result) {
  _$jscoverage['/editor.js'].branchData['720'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['694'][1].init(1080, 8, 'lastNode');
function visit1197_694_1(result) {
  _$jscoverage['/editor.js'].branchData['694'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['664'][1].init(21, 23, '$sel.type === \'Control\'');
function visit1196_664_1(result) {
  _$jscoverage['/editor.js'].branchData['664'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['663'][1].init(569, 4, '$sel');
function visit1195_663_1(result) {
  _$jscoverage['/editor.js'].branchData['663'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['649'][1].init(135, 33, 'self.get(\'mode\') !== WYSIWYG_MODE');
function visit1194_649_1(result) {
  _$jscoverage['/editor.js'].branchData['649'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['627'][2].init(2336, 23, 'clone[0].nodeType === 1');
function visit1193_627_2(result) {
  _$jscoverage['/editor.js'].branchData['627'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['627'][1].init(2327, 32, 'clone && clone[0].nodeType === 1');
function visit1192_627_1(result) {
  _$jscoverage['/editor.js'].branchData['627'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['618'][1].init(31, 76, 'xhtmlDtd.$block[nextName] && xhtmlDtd[nextName][\'#text\']');
function visit1191_618_1(result) {
  _$jscoverage['/editor.js'].branchData['618'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['617'][1].init(339, 108, 'nextName && xhtmlDtd.$block[nextName] && xhtmlDtd[nextName][\'#text\']');
function visit1190_617_1(result) {
  _$jscoverage['/editor.js'].branchData['617'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['614'][3].init(168, 42, 'next[0].nodeType === NodeType.ELEMENT_NODE');
function visit1189_614_3(result) {
  _$jscoverage['/editor.js'].branchData['614'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['614'][2].init(168, 81, 'next[0].nodeType === NodeType.ELEMENT_NODE && next.nodeName()');
function visit1188_614_2(result) {
  _$jscoverage['/editor.js'].branchData['614'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['614'][1].init(160, 89, 'next && next[0].nodeType === NodeType.ELEMENT_NODE && next.nodeName()');
function visit1187_614_1(result) {
  _$jscoverage['/editor.js'].branchData['614'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['611'][1].init(1566, 7, 'isBlock');
function visit1186_611_1(result) {
  _$jscoverage['/editor.js'].branchData['611'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['604'][1].init(1257, 12, '!lastElement');
function visit1185_604_1(result) {
  _$jscoverage['/editor.js'].branchData['604'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['599'][1].init(320, 12, '!lastElement');
function visit1184_599_1(result) {
  _$jscoverage['/editor.js'].branchData['599'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['595'][2].init(110, 13, '!i && element');
function visit1183_595_2(result) {
  _$jscoverage['/editor.js'].branchData['595'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['595'][1].init(110, 36, '!i && element || element.clone(TRUE)');
function visit1182_595_1(result) {
  _$jscoverage['/editor.js'].branchData['595'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['591'][1].init(817, 6, 'i >= 0');
function visit1181_591_1(result) {
  _$jscoverage['/editor.js'].branchData['591'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['585'][2].init(666, 19, 'ranges.length === 0');
function visit1180_585_2(result) {
  _$jscoverage['/editor.js'].branchData['585'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['585'][1].init(655, 30, '!ranges || ranges.length === 0');
function visit1179_585_1(result) {
  _$jscoverage['/editor.js'].branchData['585'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['577'][1].init(275, 34, 'selection && selection.getRanges()');
function visit1178_577_1(result) {
  _$jscoverage['/editor.js'].branchData['577'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['565'][1].init(47, 33, 'self.get(\'mode\') !== WYSIWYG_MODE');
function visit1177_565_1(result) {
  _$jscoverage['/editor.js'].branchData['565'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['534'][1].init(169, 65, '!self.__previousPath || !self.__previousPath.compare(currentPath)');
function visit1176_534_1(result) {
  _$jscoverage['/editor.js'].branchData['534'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['531'][1].init(74, 33, 'selection && !selection.isInvalid');
function visit1175_531_1(result) {
  _$jscoverage['/editor.js'].branchData['531'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['525'][1].init(46, 29, 'self.__checkSelectionChangeId');
function visit1174_525_1(result) {
  _$jscoverage['/editor.js'].branchData['525'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['504'][1].init(85, 15, 'self.__docReady');
function visit1173_504_1(result) {
  _$jscoverage['/editor.js'].branchData['504'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['490'][1].init(372, 10, 'ind !== -1');
function visit1172_490_1(result) {
  _$jscoverage['/editor.js'].branchData['490'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['484'][1].init(21, 23, 'l.attr(\'href\') === link');
function visit1171_484_1(result) {
  _$jscoverage['/editor.js'].branchData['484'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['443'][1].init(242, 3, 'win');
function visit1170_443_1(result) {
  _$jscoverage['/editor.js'].branchData['443'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['440'][1].init(88, 29, 'self.get(\'customStyle\') || \'\'');
function visit1169_440_1(result) {
  _$jscoverage['/editor.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['408'][1].init(640, 3, 'win');
function visit1168_408_1(result) {
  _$jscoverage['/editor.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['402'][1].init(137, 17, 'win && win.parent');
function visit1167_402_1(result) {
  _$jscoverage['/editor.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['399'][1].init(297, 6, '!UA.ie');
function visit1166_399_1(result) {
  _$jscoverage['/editor.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['393'][1].init(128, 4, '!win');
function visit1165_393_1(result) {
  _$jscoverage['/editor.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['376'][1].init(159, 5, 'range');
function visit1164_376_1(result) {
  _$jscoverage['/editor.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['332'][1].init(774, 28, 'EMPTY_CONTENT_REG.test(html)');
function visit1163_332_1(result) {
  _$jscoverage['/editor.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['323'][1].init(499, 6, 'format');
function visit1162_323_1(result) {
  _$jscoverage['/editor.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['317'][2].init(221, 21, 'mode === WYSIWYG_MODE');
function visit1161_317_2(result) {
  _$jscoverage['/editor.js'].branchData['317'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['317'][1].init(221, 42, 'mode === WYSIWYG_MODE && self.isDocReady()');
function visit1160_317_1(result) {
  _$jscoverage['/editor.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['314'][1].init(128, 18, 'mode === undefined');
function visit1159_314_1(result) {
  _$jscoverage['/editor.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['290'][1].init(115, 33, 'self.get(\'mode\') !== WYSIWYG_MODE');
function visit1158_290_1(result) {
  _$jscoverage['/editor.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['269'][1].init(196, 3, 'cmd');
function visit1157_269_1(result) {
  _$jscoverage['/editor.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['178'][1].init(21, 15, 'control.destroy');
function visit1156_178_1(result) {
  _$jscoverage['/editor.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['161'][1].init(356, 3, 'doc');
function visit1155_161_1(result) {
  _$jscoverage['/editor.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['156'][1].init(42, 60, '(form = textarea[0].form) && (form = $(form))');
function visit1154_156_1(result) {
  _$jscoverage['/editor.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['155'][1].init(162, 103, 'self.get(\'attachForm\') && (form = textarea[0].form) && (form = $(form))');
function visit1153_155_1(result) {
  _$jscoverage['/editor.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['144'][1].init(76, 20, 'v && self.__docReady');
function visit1152_144_1(result) {
  _$jscoverage['/editor.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['131'][1].init(65, 6, 'iframe');
function visit1151_131_1(result) {
  _$jscoverage['/editor.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['125'][1].init(140, 18, 'v === WYSIWYG_MODE');
function visit1150_125_1(result) {
  _$jscoverage['/editor.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['116'][2].init(61, 40, 'statusBarEl && statusBarEl.outerHeight()');
function visit1149_116_2(result) {
  _$jscoverage['/editor.js'].branchData['116'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['116'][1].init(61, 45, 'statusBarEl && statusBarEl.outerHeight() || 0');
function visit1148_116_1(result) {
  _$jscoverage['/editor.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['115'][2].init(266, 36, 'toolBarEl && toolBarEl.outerHeight()');
function visit1147_115_2(result) {
  _$jscoverage['/editor.js'].branchData['115'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['115'][1].init(266, 41, 'toolBarEl && toolBarEl.outerHeight() || 0');
function visit1146_115_1(result) {
  _$jscoverage['/editor.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['90'][1].init(107, 3, 'sel');
function visit1145_90_1(result) {
  _$jscoverage['/editor.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['85'][1].init(101, 19, 'self.get(\'focused\')');
function visit1144_85_1(result) {
  _$jscoverage['/editor.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['77'][1].init(42, 60, '(form = textarea[0].form) && (form = $(form))');
function visit1143_77_1(result) {
  _$jscoverage['/editor.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['76'][1].init(169, 103, 'self.get(\'attachForm\') && (form = textarea[0].form) && (form = $(form))');
function visit1142_76_1(result) {
  _$jscoverage['/editor.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['29'][1].init(161, 14, 'UA.ieMode < 11');
function visit1141_29_1(result) {
  _$jscoverage['/editor.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].lineData[6]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/editor.js'].functionData[0]++;
  _$jscoverage['/editor.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/editor.js'].lineData[8]++;
  var iframeContentTpl = require('editor/iframe-content-tpl');
  _$jscoverage['/editor.js'].lineData[9]++;
  var Editor = require('editor/base');
  _$jscoverage['/editor.js'].lineData[10]++;
  var Utils = require('editor/utils');
  _$jscoverage['/editor.js'].lineData[11]++;
  var focusManager = require('editor/focusManager');
  _$jscoverage['/editor.js'].lineData[12]++;
  var clipboard = require('editor/clipboard');
  _$jscoverage['/editor.js'].lineData[13]++;
  var enterKey = require('editor/enterKey');
  _$jscoverage['/editor.js'].lineData[14]++;
  var htmlDataProcessor = require('editor/htmlDataProcessor');
  _$jscoverage['/editor.js'].lineData[15]++;
  var selectionFix = require('editor/selectionFix');
  _$jscoverage['/editor.js'].lineData[16]++;
  require('editor/modules');
  _$jscoverage['/editor.js'].lineData[17]++;
  require('editor/styles');
  _$jscoverage['/editor.js'].lineData[18]++;
  require('editor/domIterator');
  _$jscoverage['/editor.js'].lineData[19]++;
  require('editor/z-index-manager');
  _$jscoverage['/editor.js'].lineData[20]++;
  module.exports = Editor;
  _$jscoverage['/editor.js'].lineData[21]++;
  var logger = S.getLogger('s/editor');
  _$jscoverage['/editor.js'].lineData[22]++;
  var TRUE = true, FALSE = false, NULL = null, window = S.Env.host, document = window.document, UA = S.UA, IS_IE = visit1141_29_1(UA.ieMode < 11), NodeType = Node.NodeType, $ = Node.all, HEIGHT = 'height', tryThese = Utils.tryThese, IFRAME_TPL = '<iframe' + ' class="{prefixCls}editor-iframe"' + ' frameborder="0" ' + ' title="kissy-editor" ' + ' allowTransparency="true" ' + ' {iframeSrc} ' + '>' + '</iframe>', EMPTY_CONTENT_REG = /^(?:<(p)>)?(?:(?:&nbsp;)|\s|<br[^>]*>)*(?:<\/\1>)?$/i;
  _$jscoverage['/editor.js'].lineData[45]++;
  Editor.Mode = {
  SOURCE_MODE: 0, 
  WYSIWYG_MODE: 1};
  _$jscoverage['/editor.js'].lineData[50]++;
  var WYSIWYG_MODE = 1;
  _$jscoverage['/editor.js'].lineData[52]++;
  Editor.addMembers({
  initializer: function() {
  _$jscoverage['/editor.js'].functionData[1]++;
  _$jscoverage['/editor.js'].lineData[54]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[55]++;
  self.__commands = {};
  _$jscoverage['/editor.js'].lineData[56]++;
  self.__controls = {};
  _$jscoverage['/editor.js'].lineData[58]++;
  focusManager.register(self);
}, 
  renderUI: function() {
  _$jscoverage['/editor.js'].functionData[2]++;
  _$jscoverage['/editor.js'].lineData[63]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[64]++;
  clipboard.init(self);
  _$jscoverage['/editor.js'].lineData[65]++;
  enterKey.init(self);
  _$jscoverage['/editor.js'].lineData[66]++;
  htmlDataProcessor.init(self);
  _$jscoverage['/editor.js'].lineData[67]++;
  selectionFix.init(self);
}, 
  bindUI: function() {
  _$jscoverage['/editor.js'].functionData[3]++;
  _$jscoverage['/editor.js'].lineData[71]++;
  var self = this, form, prefixCls = self.get('prefixCls'), textarea = self.get('textarea');
  _$jscoverage['/editor.js'].lineData[76]++;
  if (visit1142_76_1(self.get('attachForm') && visit1143_77_1((form = textarea[0].form) && (form = $(form))))) {
    _$jscoverage['/editor.js'].lineData[79]++;
    form.on('submit', self.sync, self);
  }
  _$jscoverage['/editor.js'].lineData[82]++;
  function docReady() {
    _$jscoverage['/editor.js'].functionData[4]++;
    _$jscoverage['/editor.js'].lineData[83]++;
    self.detach('docReady', docReady);
    _$jscoverage['/editor.js'].lineData[85]++;
    if (visit1144_85_1(self.get('focused'))) {
      _$jscoverage['/editor.js'].lineData[86]++;
      self.focus();
    } else {
      _$jscoverage['/editor.js'].lineData[89]++;
      var sel = self.getSelection();
      _$jscoverage['/editor.js'].lineData[90]++;
      if (visit1145_90_1(sel)) {
        _$jscoverage['/editor.js'].lineData[91]++;
        sel.removeAllRanges();
      }
    }
  }
  _$jscoverage['/editor.js'].lineData[96]++;
  self.on('docReady', docReady);
  _$jscoverage['/editor.js'].lineData[98]++;
  self.on('blur', function() {
  _$jscoverage['/editor.js'].functionData[5]++;
  _$jscoverage['/editor.js'].lineData[99]++;
  self.$el.removeClass(prefixCls + 'editor-focused');
});
  _$jscoverage['/editor.js'].lineData[102]++;
  self.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[6]++;
  _$jscoverage['/editor.js'].lineData[103]++;
  self.$el.addClass(prefixCls + 'editor-focused');
});
}, 
  _onSetHeight: function(v) {
  _$jscoverage['/editor.js'].functionData[7]++;
  _$jscoverage['/editor.js'].lineData[109]++;
  var self = this, textareaEl = self.get('textarea'), toolBarEl = self.get('toolBarEl'), statusBarEl = self.get('statusBarEl');
  _$jscoverage['/editor.js'].lineData[113]++;
  v = parseInt(v, 10);
  _$jscoverage['/editor.js'].lineData[115]++;
  v -= (visit1146_115_1(visit1147_115_2(toolBarEl && toolBarEl.outerHeight()) || 0)) + (visit1148_116_1(visit1149_116_2(statusBarEl && statusBarEl.outerHeight()) || 0));
  _$jscoverage['/editor.js'].lineData[117]++;
  textareaEl.parent().css(HEIGHT, v);
  _$jscoverage['/editor.js'].lineData[118]++;
  textareaEl.css(HEIGHT, v);
}, 
  _onSetMode: function(v) {
  _$jscoverage['/editor.js'].functionData[8]++;
  _$jscoverage['/editor.js'].lineData[122]++;
  var self = this, iframe = self.get('iframe'), textarea = self.get('textarea');
  _$jscoverage['/editor.js'].lineData[125]++;
  if (visit1150_125_1(v === WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[126]++;
    self.setData(textarea.val());
    _$jscoverage['/editor.js'].lineData[127]++;
    textarea.hide();
    _$jscoverage['/editor.js'].lineData[128]++;
    self.fire('wysiwygMode');
  } else {
    _$jscoverage['/editor.js'].lineData[131]++;
    if (visit1151_131_1(iframe)) {
      _$jscoverage['/editor.js'].lineData[132]++;
      textarea.val(self.getFormatData(WYSIWYG_MODE));
      _$jscoverage['/editor.js'].lineData[133]++;
      iframe.hide();
    }
    _$jscoverage['/editor.js'].lineData[135]++;
    textarea.show();
    _$jscoverage['/editor.js'].lineData[136]++;
    self.fire('sourceMode');
  }
}, 
  _onSetFocused: function(v) {
  _$jscoverage['/editor.js'].functionData[9]++;
  _$jscoverage['/editor.js'].lineData[142]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[144]++;
  if (visit1152_144_1(v && self.__docReady)) {
    _$jscoverage['/editor.js'].lineData[145]++;
    self.focus();
  }
}, 
  destructor: function() {
  _$jscoverage['/editor.js'].functionData[10]++;
  _$jscoverage['/editor.js'].lineData[150]++;
  var self = this, form, textarea = self.get('textarea'), doc = self.get('document');
  _$jscoverage['/editor.js'].lineData[155]++;
  if (visit1153_155_1(self.get('attachForm') && visit1154_156_1((form = textarea[0].form) && (form = $(form))))) {
    _$jscoverage['/editor.js'].lineData[158]++;
    form.detach('submit', self.sync, self);
  }
  _$jscoverage['/editor.js'].lineData[161]++;
  if (visit1155_161_1(doc)) {
    _$jscoverage['/editor.js'].lineData[162]++;
    var body = $(doc[0].body), documentElement = $(doc[0].documentElement), win = self.get('window');
    _$jscoverage['/editor.js'].lineData[166]++;
    focusManager.remove(self);
    _$jscoverage['/editor.js'].lineData[168]++;
    doc.detach();
    _$jscoverage['/editor.js'].lineData[170]++;
    documentElement.detach();
    _$jscoverage['/editor.js'].lineData[172]++;
    body.detach();
    _$jscoverage['/editor.js'].lineData[174]++;
    win.detach();
  }
  _$jscoverage['/editor.js'].lineData[177]++;
  S.each(self.__controls, function(control) {
  _$jscoverage['/editor.js'].functionData[11]++;
  _$jscoverage['/editor.js'].lineData[178]++;
  if (visit1156_178_1(control.destroy)) {
    _$jscoverage['/editor.js'].lineData[179]++;
    control.destroy();
  }
});
  _$jscoverage['/editor.js'].lineData[183]++;
  self.__commands = {};
  _$jscoverage['/editor.js'].lineData[184]++;
  self.__controls = {};
}, 
  sync: function() {
  _$jscoverage['/editor.js'].functionData[12]++;
  _$jscoverage['/editor.js'].lineData[191]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[192]++;
  self.get('textarea').val(self.getData());
}, 
  getControl: function(id) {
  _$jscoverage['/editor.js'].functionData[13]++;
  _$jscoverage['/editor.js'].lineData[200]++;
  return this.__controls[id];
}, 
  getControls: function() {
  _$jscoverage['/editor.js'].functionData[14]++;
  _$jscoverage['/editor.js'].lineData[208]++;
  return this.__controls;
}, 
  addControl: function(id, control) {
  _$jscoverage['/editor.js'].functionData[15]++;
  _$jscoverage['/editor.js'].lineData[217]++;
  this.__controls[id] = control;
}, 
  showDialog: function(name, args) {
  _$jscoverage['/editor.js'].functionData[16]++;
  _$jscoverage['/editor.js'].lineData[227]++;
  name += '/dialog';
  _$jscoverage['/editor.js'].lineData[228]++;
  var self = this, d = self.__controls[name];
  _$jscoverage['/editor.js'].lineData[230]++;
  d.show(args);
  _$jscoverage['/editor.js'].lineData[231]++;
  self.fire('dialogShow', {
  dialog: d.dialog, 
  pluginDialog: d, 
  dialogName: name});
}, 
  addCommand: function(name, obj) {
  _$jscoverage['/editor.js'].functionData[17]++;
  _$jscoverage['/editor.js'].lineData[245]++;
  this.__commands[name] = obj;
}, 
  hasCommand: function(name) {
  _$jscoverage['/editor.js'].functionData[18]++;
  _$jscoverage['/editor.js'].lineData[254]++;
  return this.__commands[name];
}, 
  execCommand: function(name) {
  _$jscoverage['/editor.js'].functionData[19]++;
  _$jscoverage['/editor.js'].lineData[264]++;
  var self = this, cmd = self.__commands[name], args = S.makeArray(arguments);
  _$jscoverage['/editor.js'].lineData[267]++;
  args.shift();
  _$jscoverage['/editor.js'].lineData[268]++;
  args.unshift(self);
  _$jscoverage['/editor.js'].lineData[269]++;
  if (visit1157_269_1(cmd)) {
    _$jscoverage['/editor.js'].lineData[270]++;
    return cmd.exec.apply(cmd, args);
  } else {
    _$jscoverage['/editor.js'].lineData[272]++;
    logger.error(name + ': command not found');
    _$jscoverage['/editor.js'].lineData[273]++;
    return undefined;
  }
}, 
  queryCommandValue: function(name) {
  _$jscoverage['/editor.js'].functionData[20]++;
  _$jscoverage['/editor.js'].lineData[283]++;
  return this.execCommand(Utils.getQueryCmd(name));
}, 
  setData: function(data) {
  _$jscoverage['/editor.js'].functionData[21]++;
  _$jscoverage['/editor.js'].lineData[287]++;
  var self = this, htmlDataProcessor, afterData = data;
  _$jscoverage['/editor.js'].lineData[290]++;
  if (visit1158_290_1(self.get('mode') !== WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[292]++;
    self.get('textarea').val(data);
    _$jscoverage['/editor.js'].lineData[293]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[295]++;
  if ((htmlDataProcessor = self.htmlDataProcessor)) {
    _$jscoverage['/editor.js'].lineData[296]++;
    afterData = htmlDataProcessor.toDataFormat(data);
  }
  _$jscoverage['/editor.js'].lineData[299]++;
  clearIframeDocContent(self);
  _$jscoverage['/editor.js'].lineData[300]++;
  createIframe(self, afterData);
}, 
  getData: function(format, mode) {
  _$jscoverage['/editor.js'].functionData[22]++;
  _$jscoverage['/editor.js'].lineData[311]++;
  var self = this, htmlDataProcessor = self.htmlDataProcessor, html;
  _$jscoverage['/editor.js'].lineData[314]++;
  if (visit1159_314_1(mode === undefined)) {
    _$jscoverage['/editor.js'].lineData[315]++;
    mode = self.get('mode');
  }
  _$jscoverage['/editor.js'].lineData[317]++;
  if (visit1160_317_1(visit1161_317_2(mode === WYSIWYG_MODE) && self.isDocReady())) {
    _$jscoverage['/editor.js'].lineData[318]++;
    html = self.get('document')[0].body.innerHTML;
  } else {
    _$jscoverage['/editor.js'].lineData[320]++;
    html = htmlDataProcessor.toDataFormat(self.get('textarea').val());
  }
  _$jscoverage['/editor.js'].lineData[323]++;
  if (visit1162_323_1(format)) {
    _$jscoverage['/editor.js'].lineData[324]++;
    html = htmlDataProcessor.toHtml(html);
  } else {
    _$jscoverage['/editor.js'].lineData[326]++;
    html = htmlDataProcessor.toServer(html);
  }
  _$jscoverage['/editor.js'].lineData[328]++;
  html = S.trim(html);
  _$jscoverage['/editor.js'].lineData[332]++;
  if (visit1163_332_1(EMPTY_CONTENT_REG.test(html))) {
    _$jscoverage['/editor.js'].lineData[333]++;
    html = '';
  }
  _$jscoverage['/editor.js'].lineData[335]++;
  return html;
}, 
  getFormatData: function(mode) {
  _$jscoverage['/editor.js'].functionData[23]++;
  _$jscoverage['/editor.js'].lineData[345]++;
  return this.getData(1, mode);
}, 
  getDocHtml: function() {
  _$jscoverage['/editor.js'].functionData[24]++;
  _$jscoverage['/editor.js'].lineData[353]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[354]++;
  return prepareIFrameHTML(0, self.get('customStyle'), self.get('customLink'), self.getFormatData());
}, 
  getSelection: function() {
  _$jscoverage['/editor.js'].functionData[25]++;
  _$jscoverage['/editor.js'].lineData[363]++;
  return Editor.Selection.getSelection(this.get('document')[0]);
}, 
  getSelectedHtml: function() {
  _$jscoverage['/editor.js'].functionData[26]++;
  _$jscoverage['/editor.js'].lineData[372]++;
  var self = this, range = self.getSelection().getRanges()[0], contents, html = '';
  _$jscoverage['/editor.js'].lineData[376]++;
  if (visit1164_376_1(range)) {
    _$jscoverage['/editor.js'].lineData[377]++;
    contents = range.cloneContents();
    _$jscoverage['/editor.js'].lineData[378]++;
    html = self.get('document')[0].createElement('div');
    _$jscoverage['/editor.js'].lineData[379]++;
    html.appendChild(contents);
    _$jscoverage['/editor.js'].lineData[380]++;
    html = html.innerHTML;
  }
  _$jscoverage['/editor.js'].lineData[382]++;
  return html;
}, 
  focus: function() {
  _$jscoverage['/editor.js'].functionData[27]++;
  _$jscoverage['/editor.js'].lineData[390]++;
  var self = this, win = self.get('window');
  _$jscoverage['/editor.js'].lineData[393]++;
  if (visit1165_393_1(!win)) {
    _$jscoverage['/editor.js'].lineData[394]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[396]++;
  var doc = self.get('document')[0];
  _$jscoverage['/editor.js'].lineData[397]++;
  win = win[0];
  _$jscoverage['/editor.js'].lineData[399]++;
  if (visit1166_399_1(!UA.ie)) {
    _$jscoverage['/editor.js'].lineData[402]++;
    if (visit1167_402_1(win && win.parent)) {
      _$jscoverage['/editor.js'].lineData[403]++;
      win.parent.focus();
    }
  }
  _$jscoverage['/editor.js'].lineData[408]++;
  if (visit1168_408_1(win)) {
    _$jscoverage['/editor.js'].lineData[409]++;
    win.focus();
  }
  _$jscoverage['/editor.js'].lineData[412]++;
  try {
    _$jscoverage['/editor.js'].lineData[413]++;
    doc.body.focus();
  }  catch (e) {
}
  _$jscoverage['/editor.js'].lineData[417]++;
  self.notifySelectionChange();
}, 
  blur: function() {
  _$jscoverage['/editor.js'].functionData[28]++;
  _$jscoverage['/editor.js'].lineData[425]++;
  var self = this, win = self.get('window')[0];
  _$jscoverage['/editor.js'].lineData[427]++;
  win.blur();
  _$jscoverage['/editor.js'].lineData[428]++;
  self.get('document')[0].body.blur();
}, 
  addCustomStyle: function(cssText, id) {
  _$jscoverage['/editor.js'].functionData[29]++;
  _$jscoverage['/editor.js'].lineData[438]++;
  var self = this, win = self.get('window'), customStyle = visit1169_440_1(self.get('customStyle') || '');
  _$jscoverage['/editor.js'].lineData[441]++;
  customStyle += '\n' + cssText;
  _$jscoverage['/editor.js'].lineData[442]++;
  self.set('customStyle', customStyle);
  _$jscoverage['/editor.js'].lineData[443]++;
  if (visit1170_443_1(win)) {
    _$jscoverage['/editor.js'].lineData[444]++;
    win.addStyleSheet(cssText, id);
  }
}, 
  removeCustomStyle: function(id) {
  _$jscoverage['/editor.js'].functionData[30]++;
  _$jscoverage['/editor.js'].lineData[454]++;
  this.get('document').on('#' + id).remove();
}, 
  addCustomLink: function(link) {
  _$jscoverage['/editor.js'].functionData[31]++;
  _$jscoverage['/editor.js'].lineData[463]++;
  var self = this, customLink = self.get('customLink'), doc = self.get('document')[0];
  _$jscoverage['/editor.js'].lineData[466]++;
  customLink.push(link);
  _$jscoverage['/editor.js'].lineData[467]++;
  self.set('customLink', customLink);
  _$jscoverage['/editor.js'].lineData[468]++;
  var elem = doc.createElement('link');
  _$jscoverage['/editor.js'].lineData[469]++;
  elem.rel = 'stylesheet';
  _$jscoverage['/editor.js'].lineData[470]++;
  doc.getElementsByTagName('head')[0].appendChild(elem);
  _$jscoverage['/editor.js'].lineData[471]++;
  elem.href = link;
}, 
  removeCustomLink: function(link) {
  _$jscoverage['/editor.js'].functionData[32]++;
  _$jscoverage['/editor.js'].lineData[480]++;
  var self = this, doc = self.get('document'), links = doc.all('link');
  _$jscoverage['/editor.js'].lineData[483]++;
  links.each(function(l) {
  _$jscoverage['/editor.js'].functionData[33]++;
  _$jscoverage['/editor.js'].lineData[484]++;
  if (visit1171_484_1(l.attr('href') === link)) {
    _$jscoverage['/editor.js'].lineData[485]++;
    l.remove();
  }
});
  _$jscoverage['/editor.js'].lineData[488]++;
  var cls = self.get('customLink'), ind = S.indexOf(link, cls);
  _$jscoverage['/editor.js'].lineData[490]++;
  if (visit1172_490_1(ind !== -1)) {
    _$jscoverage['/editor.js'].lineData[491]++;
    cls.splice(ind, 1);
  }
}, 
  docReady: function(func) {
  _$jscoverage['/editor.js'].functionData[34]++;
  _$jscoverage['/editor.js'].lineData[502]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[503]++;
  self.on('docReady', func);
  _$jscoverage['/editor.js'].lineData[504]++;
  if (visit1173_504_1(self.__docReady)) {
    _$jscoverage['/editor.js'].lineData[505]++;
    func.call(self);
  }
}, 
  isDocReady: function() {
  _$jscoverage['/editor.js'].functionData[35]++;
  _$jscoverage['/editor.js'].lineData[515]++;
  return this.__docReady;
}, 
  checkSelectionChange: function() {
  _$jscoverage['/editor.js'].functionData[36]++;
  _$jscoverage['/editor.js'].lineData[524]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[525]++;
  if (visit1174_525_1(self.__checkSelectionChangeId)) {
    _$jscoverage['/editor.js'].lineData[526]++;
    clearTimeout(self.__checkSelectionChangeId);
  }
  _$jscoverage['/editor.js'].lineData[529]++;
  self.__checkSelectionChangeId = setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[37]++;
  _$jscoverage['/editor.js'].lineData[530]++;
  var selection = self.getSelection();
  _$jscoverage['/editor.js'].lineData[531]++;
  if (visit1175_531_1(selection && !selection.isInvalid)) {
    _$jscoverage['/editor.js'].lineData[532]++;
    var startElement = selection.getStartElement(), currentPath = new Editor.ElementPath(startElement);
    _$jscoverage['/editor.js'].lineData[534]++;
    if (visit1176_534_1(!self.__previousPath || !self.__previousPath.compare(currentPath))) {
      _$jscoverage['/editor.js'].lineData[535]++;
      self.__previousPath = currentPath;
      _$jscoverage['/editor.js'].lineData[536]++;
      self.fire('selectionChange', {
  selection: selection, 
  path: currentPath, 
  element: startElement});
    }
  }
}, 100);
}, 
  notifySelectionChange: function() {
  _$jscoverage['/editor.js'].functionData[38]++;
  _$jscoverage['/editor.js'].lineData[552]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[553]++;
  self.__previousPath = NULL;
  _$jscoverage['/editor.js'].lineData[554]++;
  self.checkSelectionChange();
}, 
  insertElement: function(element) {
  _$jscoverage['/editor.js'].functionData[39]++;
  _$jscoverage['/editor.js'].lineData[563]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[565]++;
  if (visit1177_565_1(self.get('mode') !== WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[566]++;
    return undefined;
  }
  _$jscoverage['/editor.js'].lineData[569]++;
  self.focus();
  _$jscoverage['/editor.js'].lineData[571]++;
  var clone, elementName = element.nodeName(), xhtmlDtd = Editor.XHTML_DTD, isBlock = xhtmlDtd.$block[elementName], KER = Editor.RangeType, selection = self.getSelection(), ranges = visit1178_577_1(selection && selection.getRanges()), range, notWhitespaceEval, i, next, nextName, lastElement;
  _$jscoverage['/editor.js'].lineData[585]++;
  if (visit1179_585_1(!ranges || visit1180_585_2(ranges.length === 0))) {
    _$jscoverage['/editor.js'].lineData[586]++;
    return undefined;
  }
  _$jscoverage['/editor.js'].lineData[589]++;
  self.execCommand('save');
  _$jscoverage['/editor.js'].lineData[591]++;
  for (i = ranges.length - 1; visit1181_591_1(i >= 0); i--) {
    _$jscoverage['/editor.js'].lineData[592]++;
    range = ranges[i];
    _$jscoverage['/editor.js'].lineData[595]++;
    clone = visit1182_595_1(visit1183_595_2(!i && element) || element.clone(TRUE));
    _$jscoverage['/editor.js'].lineData[596]++;
    range.insertNodeByDtd(clone);
    _$jscoverage['/editor.js'].lineData[599]++;
    if (visit1184_599_1(!lastElement)) {
      _$jscoverage['/editor.js'].lineData[600]++;
      lastElement = clone;
    }
  }
  _$jscoverage['/editor.js'].lineData[604]++;
  if (visit1185_604_1(!lastElement)) {
    _$jscoverage['/editor.js'].lineData[605]++;
    return undefined;
  }
  _$jscoverage['/editor.js'].lineData[608]++;
  range.moveToPosition(lastElement, KER.POSITION_AFTER_END);
  _$jscoverage['/editor.js'].lineData[611]++;
  if (visit1186_611_1(isBlock)) {
    _$jscoverage['/editor.js'].lineData[612]++;
    notWhitespaceEval = Editor.Walker.whitespaces(true);
    _$jscoverage['/editor.js'].lineData[613]++;
    next = lastElement.next(notWhitespaceEval, 1);
    _$jscoverage['/editor.js'].lineData[614]++;
    nextName = visit1187_614_1(next && visit1188_614_2(visit1189_614_3(next[0].nodeType === NodeType.ELEMENT_NODE) && next.nodeName()));
    _$jscoverage['/editor.js'].lineData[617]++;
    if (visit1190_617_1(nextName && visit1191_618_1(xhtmlDtd.$block[nextName] && xhtmlDtd[nextName]['#text']))) {
      _$jscoverage['/editor.js'].lineData[620]++;
      range.moveToElementEditablePosition(next);
    }
  }
  _$jscoverage['/editor.js'].lineData[623]++;
  selection.selectRanges([range]);
  _$jscoverage['/editor.js'].lineData[624]++;
  self.focus();
  _$jscoverage['/editor.js'].lineData[627]++;
  if (visit1192_627_1(clone && visit1193_627_2(clone[0].nodeType === 1))) {
    _$jscoverage['/editor.js'].lineData[628]++;
    clone.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
  }
  _$jscoverage['/editor.js'].lineData[634]++;
  saveLater.call(self);
  _$jscoverage['/editor.js'].lineData[635]++;
  return clone;
}, 
  insertHtml: function(data, dataFilter) {
  _$jscoverage['/editor.js'].functionData[40]++;
  _$jscoverage['/editor.js'].lineData[645]++;
  var self = this, htmlDataProcessor, editorDoc = self.get('document')[0];
  _$jscoverage['/editor.js'].lineData[649]++;
  if (visit1194_649_1(self.get('mode') !== WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[650]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[653]++;
  if ((htmlDataProcessor = self.htmlDataProcessor)) {
    _$jscoverage['/editor.js'].lineData[654]++;
    data = htmlDataProcessor.toDataFormat(data, dataFilter);
  }
  _$jscoverage['/editor.js'].lineData[657]++;
  self.focus();
  _$jscoverage['/editor.js'].lineData[658]++;
  self.execCommand('save');
  _$jscoverage['/editor.js'].lineData[662]++;
  var $sel = editorDoc.selection;
  _$jscoverage['/editor.js'].lineData[663]++;
  if (visit1195_663_1($sel)) {
    _$jscoverage['/editor.js'].lineData[664]++;
    if (visit1196_664_1($sel.type === 'Control')) {
      _$jscoverage['/editor.js'].lineData[665]++;
      $sel.clear();
    }
    _$jscoverage['/editor.js'].lineData[667]++;
    try {
      _$jscoverage['/editor.js'].lineData[668]++;
      $sel.createRange().pasteHTML(data);
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[670]++;
  logger.error('insertHtml error in ie');
}
  } else {
    _$jscoverage['/editor.js'].lineData[677]++;
    var sel = self.get('iframe')[0].contentWindow.getSelection(), range = sel.getRangeAt(0);
    _$jscoverage['/editor.js'].lineData[680]++;
    range.deleteContents();
    _$jscoverage['/editor.js'].lineData[685]++;
    var el = editorDoc.createElement('div');
    _$jscoverage['/editor.js'].lineData[686]++;
    el.innerHTML = data;
    _$jscoverage['/editor.js'].lineData[687]++;
    var frag = editorDoc.createDocumentFragment(), node, lastNode;
    _$jscoverage['/editor.js'].lineData[688]++;
    while ((node = el.firstChild)) {
      _$jscoverage['/editor.js'].lineData[689]++;
      lastNode = frag.appendChild(node);
    }
    _$jscoverage['/editor.js'].lineData[691]++;
    range.insertNode(frag);
    _$jscoverage['/editor.js'].lineData[694]++;
    if (visit1197_694_1(lastNode)) {
      _$jscoverage['/editor.js'].lineData[695]++;
      range = range.cloneRange();
      _$jscoverage['/editor.js'].lineData[696]++;
      range.setStartAfter(lastNode);
      _$jscoverage['/editor.js'].lineData[697]++;
      range.collapse(true);
      _$jscoverage['/editor.js'].lineData[698]++;
      sel.removeAllRanges();
      _$jscoverage['/editor.js'].lineData[699]++;
      sel.addRange(range);
    }
  }
  _$jscoverage['/editor.js'].lineData[704]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[41]++;
  _$jscoverage['/editor.js'].lineData[705]++;
  self.getSelection().scrollIntoView();
}, 50);
  _$jscoverage['/editor.js'].lineData[707]++;
  saveLater.call(self);
}});
  _$jscoverage['/editor.js'].lineData[719]++;
  Editor.decorate = function(textarea, cfg) {
  _$jscoverage['/editor.js'].functionData[42]++;
  _$jscoverage['/editor.js'].lineData[720]++;
  cfg = visit1198_720_1(cfg || {});
  _$jscoverage['/editor.js'].lineData[721]++;
  textarea = $(textarea);
  _$jscoverage['/editor.js'].lineData[722]++;
  var textareaAttrs = cfg.textareaAttrs = visit1199_722_1(cfg.textareaAttrs || {});
  _$jscoverage['/editor.js'].lineData[723]++;
  var width = textarea.style('width');
  _$jscoverage['/editor.js'].lineData[724]++;
  var height = textarea.style('height');
  _$jscoverage['/editor.js'].lineData[725]++;
  var name = textarea.attr('name');
  _$jscoverage['/editor.js'].lineData[726]++;
  if (visit1200_726_1(width)) {
    _$jscoverage['/editor.js'].lineData[727]++;
    cfg.width = visit1201_727_1(cfg.width || width);
  }
  _$jscoverage['/editor.js'].lineData[729]++;
  if (visit1202_729_1(height)) {
    _$jscoverage['/editor.js'].lineData[730]++;
    cfg.height = visit1203_730_1(cfg.height || height);
  }
  _$jscoverage['/editor.js'].lineData[732]++;
  if (visit1204_732_1(name)) {
    _$jscoverage['/editor.js'].lineData[733]++;
    textareaAttrs.name = name;
  }
  _$jscoverage['/editor.js'].lineData[735]++;
  cfg.data = visit1205_735_1(cfg.data || textarea.val());
  _$jscoverage['/editor.js'].lineData[736]++;
  cfg.elBefore = textarea;
  _$jscoverage['/editor.js'].lineData[737]++;
  var editor = new Editor(cfg).render();
  _$jscoverage['/editor.js'].lineData[738]++;
  textarea.remove();
  _$jscoverage['/editor.js'].lineData[739]++;
  return editor;
};
  _$jscoverage['/editor.js'].lineData[746]++;
  Editor._initIframe = function(id) {
  _$jscoverage['/editor.js'].functionData[43]++;
  _$jscoverage['/editor.js'].lineData[747]++;
  var self = focusManager.getInstance(id), $doc = self.get('document'), doc = $doc[0], script = $doc.one('#ke_active_script');
  _$jscoverage['/editor.js'].lineData[753]++;
  script.remove();
  _$jscoverage['/editor.js'].lineData[755]++;
  fixByBindIframeDoc(self);
  _$jscoverage['/editor.js'].lineData[757]++;
  var body = doc.body;
  _$jscoverage['/editor.js'].lineData[759]++;
  var $body = $(body);
  _$jscoverage['/editor.js'].lineData[781]++;
  if (visit1206_781_1(IS_IE)) {
    _$jscoverage['/editor.js'].lineData[783]++;
    body.hideFocus = TRUE;
    _$jscoverage['/editor.js'].lineData[786]++;
    body.disabled = TRUE;
    _$jscoverage['/editor.js'].lineData[787]++;
    body.contentEditable = TRUE;
    _$jscoverage['/editor.js'].lineData[788]++;
    body.removeAttribute('disabled');
  } else {
    _$jscoverage['/editor.js'].lineData[792]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[44]++;
  _$jscoverage['/editor.js'].lineData[794]++;
  if (visit1207_794_1(UA.gecko || UA.opera)) {
    _$jscoverage['/editor.js'].lineData[795]++;
    body.contentEditable = TRUE;
  } else {
    _$jscoverage['/editor.js'].lineData[796]++;
    if (visit1208_796_1(UA.webkit)) {
      _$jscoverage['/editor.js'].lineData[797]++;
      body.parentNode.contentEditable = TRUE;
    } else {
      _$jscoverage['/editor.js'].lineData[799]++;
      doc.designMode = 'on';
    }
  }
}, 0);
  }
  _$jscoverage['/editor.js'].lineData[807]++;
  if (visit1209_816_1(UA.gecko || UA.opera)) {
    _$jscoverage['/editor.js'].lineData[818]++;
    var htmlElement = doc.documentElement;
    _$jscoverage['/editor.js'].lineData[819]++;
    $(htmlElement).on('mousedown', function(evt) {
  _$jscoverage['/editor.js'].functionData[45]++;
  _$jscoverage['/editor.js'].lineData[826]++;
  var t = evt.target;
  _$jscoverage['/editor.js'].lineData[827]++;
  if (visit1210_827_1(t === htmlElement)) {
    _$jscoverage['/editor.js'].lineData[828]++;
    if (visit1211_828_1(UA.gecko)) {
      _$jscoverage['/editor.js'].lineData[829]++;
      blinkCursor(doc, FALSE);
    }
    _$jscoverage['/editor.js'].lineData[836]++;
    self.activateGecko();
  }
});
  }
  _$jscoverage['/editor.js'].lineData[842]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[46]++;
  _$jscoverage['/editor.js'].lineData[851]++;
  if (visit1212_851_1(IS_IE)) {
    _$jscoverage['/editor.js'].lineData[852]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[47]++;
  _$jscoverage['/editor.js'].lineData[853]++;
  if (visit1213_853_1(doc)) {
    _$jscoverage['/editor.js'].lineData[854]++;
    body.runtimeStyle.marginBottom = '0px';
    _$jscoverage['/editor.js'].lineData[855]++;
    body.runtimeStyle.marginBottom = '';
  }
}, 1000);
  }
}, 0);
  _$jscoverage['/editor.js'].lineData[861]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[48]++;
  _$jscoverage['/editor.js'].lineData[862]++;
  self.__docReady = 1;
  _$jscoverage['/editor.js'].lineData[863]++;
  self.fire('docReady');
  _$jscoverage['/editor.js'].lineData[867]++;
  var disableObjectResizing = self.get('disableObjectResizing'), disableInlineTableEditing = self.get('disableInlineTableEditing');
  _$jscoverage['/editor.js'].lineData[869]++;
  if (visit1214_869_1(disableObjectResizing || disableInlineTableEditing)) {
    _$jscoverage['/editor.js'].lineData[871]++;
    try {
      _$jscoverage['/editor.js'].lineData[872]++;
      doc.execCommand('enableObjectResizing', FALSE, !disableObjectResizing);
      _$jscoverage['/editor.js'].lineData[873]++;
      doc.execCommand('enableInlineTableEditing', FALSE, !disableInlineTableEditing);
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[878]++;
  $body.on(IS_IE ? 'resizestart' : 'resize', function(evt) {
  _$jscoverage['/editor.js'].functionData[49]++;
  _$jscoverage['/editor.js'].lineData[879]++;
  var t = new Node(evt.target);
  _$jscoverage['/editor.js'].lineData[880]++;
  if (visit1215_880_1(disableObjectResizing || (visit1216_881_1(visit1217_881_2(t.nodeName() === 'table') && disableInlineTableEditing)))) {
    _$jscoverage['/editor.js'].lineData[883]++;
    evt.preventDefault();
  }
});
}
  }
}, 10);
};
  _$jscoverage['/editor.js'].lineData[893]++;
  function blinkCursor(doc, retry) {
    _$jscoverage['/editor.js'].functionData[50]++;
    _$jscoverage['/editor.js'].lineData[894]++;
    var body = doc.body;
    _$jscoverage['/editor.js'].lineData[895]++;
    tryThese(function() {
  _$jscoverage['/editor.js'].functionData[51]++;
  _$jscoverage['/editor.js'].lineData[897]++;
  doc.designMode = 'on';
  _$jscoverage['/editor.js'].lineData[899]++;
  setTimeout(function go() {
  _$jscoverage['/editor.js'].functionData[52]++;
  _$jscoverage['/editor.js'].lineData[900]++;
  doc.designMode = 'off';
  _$jscoverage['/editor.js'].lineData[901]++;
  body.focus();
  _$jscoverage['/editor.js'].lineData[903]++;
  if (visit1218_903_1(!go.retry)) {
    _$jscoverage['/editor.js'].lineData[904]++;
    go.retry = TRUE;
  }
}, 50);
}, function() {
  _$jscoverage['/editor.js'].functionData[53]++;
  _$jscoverage['/editor.js'].lineData[910]++;
  doc.designMode = 'off';
  _$jscoverage['/editor.js'].lineData[911]++;
  body.setAttribute('contentEditable', false);
  _$jscoverage['/editor.js'].lineData[912]++;
  body.setAttribute('contentEditable', true);
  _$jscoverage['/editor.js'].lineData[914]++;
  if (visit1219_914_1(!retry)) {
    _$jscoverage['/editor.js'].lineData[915]++;
    blinkCursor(doc, 1);
  }
});
  }
  _$jscoverage['/editor.js'].lineData[921]++;
  function fixByBindIframeDoc(self) {
    _$jscoverage['/editor.js'].functionData[54]++;
    _$jscoverage['/editor.js'].lineData[922]++;
    var textarea = self.get('textarea')[0], $win = self.get('window'), $doc = self.get('document'), doc = $doc[0];
    _$jscoverage['/editor.js'].lineData[931]++;
    if (visit1220_931_1(UA.webkit)) {
      _$jscoverage['/editor.js'].lineData[932]++;
      $doc.on('click', function(ev) {
  _$jscoverage['/editor.js'].functionData[55]++;
  _$jscoverage['/editor.js'].lineData[933]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[934]++;
  if (visit1221_934_1(S.inArray(control.nodeName(), ['input', 'select']))) {
    _$jscoverage['/editor.js'].lineData[935]++;
    ev.preventDefault();
  }
});
      _$jscoverage['/editor.js'].lineData[939]++;
      $doc.on('mouseup', function(ev) {
  _$jscoverage['/editor.js'].functionData[56]++;
  _$jscoverage['/editor.js'].lineData[940]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[941]++;
  if (visit1222_941_1(S.inArray(control.nodeName(), ['input', 'textarea']))) {
    _$jscoverage['/editor.js'].lineData[942]++;
    ev.preventDefault();
  }
});
    }
    _$jscoverage['/editor.js'].lineData[948]++;
    if (visit1223_948_1(UA.gecko || visit1224_948_2(UA.ie || UA.opera))) {
      _$jscoverage['/editor.js'].lineData[949]++;
      var focusGrabber;
      _$jscoverage['/editor.js'].lineData[950]++;
      focusGrabber = new Node('<span ' + 'tabindex="-1" ' + 'style="position:absolute; left:-10000"' + ' role="presentation"' + '></span>').insertAfter(textarea);
      _$jscoverage['/editor.js'].lineData[957]++;
      focusGrabber.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[57]++;
  _$jscoverage['/editor.js'].lineData[958]++;
  self.focus();
});
      _$jscoverage['/editor.js'].lineData[960]++;
      self.activateGecko = function() {
  _$jscoverage['/editor.js'].functionData[58]++;
  _$jscoverage['/editor.js'].lineData[961]++;
  if (visit1225_961_1((UA.gecko) && self.__iframeFocus)) {
    _$jscoverage['/editor.js'].lineData[962]++;
    focusGrabber[0].focus();
  }
};
      _$jscoverage['/editor.js'].lineData[965]++;
      self.on('destroy', function() {
  _$jscoverage['/editor.js'].functionData[59]++;
  _$jscoverage['/editor.js'].lineData[966]++;
  focusGrabber.detach();
  _$jscoverage['/editor.js'].lineData[967]++;
  focusGrabber.remove();
});
    }
    _$jscoverage['/editor.js'].lineData[971]++;
    $win.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[60]++;
  _$jscoverage['/editor.js'].lineData[977]++;
  if (visit1226_977_1(UA.gecko)) {
    _$jscoverage['/editor.js'].lineData[978]++;
    blinkCursor(doc, FALSE);
  } else {
    _$jscoverage['/editor.js'].lineData[979]++;
    if (visit1227_979_1(UA.opera)) {
      _$jscoverage['/editor.js'].lineData[980]++;
      doc.body.focus();
    }
  }
  _$jscoverage['/editor.js'].lineData[983]++;
  self.notifySelectionChange();
});
    _$jscoverage['/editor.js'].lineData[986]++;
    if (visit1228_986_1(UA.gecko)) {
      _$jscoverage['/editor.js'].lineData[990]++;
      $doc.on('mousedown', function() {
  _$jscoverage['/editor.js'].functionData[61]++;
  _$jscoverage['/editor.js'].lineData[991]++;
  if (visit1229_991_1(!self.__iframeFocus)) {
    _$jscoverage['/editor.js'].lineData[992]++;
    blinkCursor(doc, FALSE);
  }
});
    }
    _$jscoverage['/editor.js'].lineData[997]++;
    if (visit1230_997_1(IS_IE)) {
      _$jscoverage['/editor.js'].lineData[1003]++;
      $doc.on('keydown', function(evt) {
  _$jscoverage['/editor.js'].functionData[62]++;
  _$jscoverage['/editor.js'].lineData[1004]++;
  var keyCode = evt.keyCode;
  _$jscoverage['/editor.js'].lineData[1006]++;
  if (visit1231_1006_1(keyCode in {
  8: 1, 
  46: 1})) {
    _$jscoverage['/editor.js'].lineData[1007]++;
    var sel = self.getSelection(), control = sel.getSelectedElement();
    _$jscoverage['/editor.js'].lineData[1009]++;
    if (visit1232_1009_1(control)) {
      _$jscoverage['/editor.js'].lineData[1011]++;
      self.execCommand('save');
      _$jscoverage['/editor.js'].lineData[1014]++;
      var bookmark = sel.getRanges()[0].createBookmark();
      _$jscoverage['/editor.js'].lineData[1016]++;
      control.remove();
      _$jscoverage['/editor.js'].lineData[1017]++;
      sel.selectBookmarks([bookmark]);
      _$jscoverage['/editor.js'].lineData[1018]++;
      self.execCommand('save');
      _$jscoverage['/editor.js'].lineData[1019]++;
      evt.preventDefault();
    }
  }
});
      _$jscoverage['/editor.js'].lineData[1027]++;
      if (visit1233_1027_1(doc.compatMode === 'CSS1Compat')) {
        _$jscoverage['/editor.js'].lineData[1028]++;
        var pageUpDownKeys = {
  33: 1, 
  34: 1};
        _$jscoverage['/editor.js'].lineData[1029]++;
        $doc.on('keydown', function(evt) {
  _$jscoverage['/editor.js'].functionData[63]++;
  _$jscoverage['/editor.js'].lineData[1030]++;
  if (visit1234_1030_1(evt.keyCode in pageUpDownKeys)) {
    _$jscoverage['/editor.js'].lineData[1031]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[64]++;
  _$jscoverage['/editor.js'].lineData[1032]++;
  self.getSelection().scrollIntoView();
}, 0);
  }
});
      }
    }
    _$jscoverage['/editor.js'].lineData[1040]++;
    if (visit1235_1040_1(UA.webkit)) {
      _$jscoverage['/editor.js'].lineData[1041]++;
      $doc.on('mousedown', function(ev) {
  _$jscoverage['/editor.js'].functionData[65]++;
  _$jscoverage['/editor.js'].lineData[1042]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[1043]++;
  if (visit1236_1043_1(S.inArray(control.nodeName(), ['img', 'hr', 'input', 'textarea', 'select']))) {
    _$jscoverage['/editor.js'].lineData[1044]++;
    self.getSelection().selectElement(control);
  }
});
    }
    _$jscoverage['/editor.js'].lineData[1049]++;
    if (visit1237_1049_1(UA.gecko)) {
      _$jscoverage['/editor.js'].lineData[1050]++;
      $doc.on('dragstart', function(ev) {
  _$jscoverage['/editor.js'].functionData[66]++;
  _$jscoverage['/editor.js'].lineData[1051]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[1052]++;
  if (visit1238_1052_1(visit1239_1052_2(control.nodeName() === 'img') && /ke_/.test(control[0].className))) {
    _$jscoverage['/editor.js'].lineData[1054]++;
    ev.preventDefault();
  }
});
    }
    _$jscoverage['/editor.js'].lineData[1060]++;
    focusManager.add(self);
  }
  _$jscoverage['/editor.js'].lineData[1063]++;
  function prepareIFrameHTML(id, customStyle, customLink, data) {
    _$jscoverage['/editor.js'].functionData[67]++;
    _$jscoverage['/editor.js'].lineData[1064]++;
    var links = '', i;
    _$jscoverage['/editor.js'].lineData[1066]++;
    var innerCssFile = Utils.debugUrl('theme/editor-iframe.css');
    _$jscoverage['/editor.js'].lineData[1067]++;
    customLink = customLink.concat([]);
    _$jscoverage['/editor.js'].lineData[1068]++;
    customLink.unshift(innerCssFile);
    _$jscoverage['/editor.js'].lineData[1069]++;
    for (i = 0; visit1240_1069_1(i < customLink.length); i++) {
      _$jscoverage['/editor.js'].lineData[1070]++;
      links += S.substitute('<link href="' + '{href}" rel="stylesheet" />', {
  href: customLink[i]});
    }
    _$jscoverage['/editor.js'].lineData[1074]++;
    return S.substitute(iframeContentTpl, {
  doctype: visit1241_1078_1(S.UA.ieMode === 8) ? '<meta http-equiv="X-UA-Compatible" content="IE=7" />' : '', 
  title: '{title}', 
  links: links, 
  style: '<style>' + customStyle + '</style>', 
  data: visit1242_1085_1(data || ''), 
  script: id ? ('<script id="ke_active_script">' + ($(window).isCustomDomain() ? ('document.domain="' + document.domain + '";') : '') + 'parent.KISSY.require(\'editor\')._initIframe("' + id + '");' + '</script>') : ''});
  }
  _$jscoverage['/editor.js'].lineData[1101]++;
  var saveLater = S.buffer(function() {
  _$jscoverage['/editor.js'].functionData[68]++;
  _$jscoverage['/editor.js'].lineData[1102]++;
  this.execCommand('save');
}, 50);
  _$jscoverage['/editor.js'].lineData[1105]++;
  function setUpIFrame(self, data) {
    _$jscoverage['/editor.js'].functionData[69]++;
    _$jscoverage['/editor.js'].lineData[1106]++;
    var iframe = self.get('iframe'), html = prepareIFrameHTML(self.get('id'), self.get('customStyle'), self.get('customLink'), data), iframeDom = iframe[0], win = iframeDom.contentWindow, doc;
    _$jscoverage['/editor.js'].lineData[1113]++;
    iframe.__loaded = 1;
    _$jscoverage['/editor.js'].lineData[1114]++;
    try {
      _$jscoverage['/editor.js'].lineData[1122]++;
      doc = win.document;
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[1127]++;
  iframeDom.src = iframeDom.src;
  _$jscoverage['/editor.js'].lineData[1130]++;
  if (visit1243_1130_1(IS_IE < 7)) {
    _$jscoverage['/editor.js'].lineData[1131]++;
    setTimeout(run, 10);
    _$jscoverage['/editor.js'].lineData[1132]++;
    return;
  }
}
    _$jscoverage['/editor.js'].lineData[1135]++;
    run();
    _$jscoverage['/editor.js'].lineData[1136]++;
    function run() {
      _$jscoverage['/editor.js'].functionData[70]++;
      _$jscoverage['/editor.js'].lineData[1137]++;
      doc = win.document;
      _$jscoverage['/editor.js'].lineData[1138]++;
      self.setInternal('document', new Node(doc));
      _$jscoverage['/editor.js'].lineData[1139]++;
      self.setInternal('window', new Node(win));
      _$jscoverage['/editor.js'].lineData[1140]++;
      iframe.detach();
      _$jscoverage['/editor.js'].lineData[1142]++;
      doc.open('text/html', 'replace');
      _$jscoverage['/editor.js'].lineData[1143]++;
      doc.write(html);
      _$jscoverage['/editor.js'].lineData[1144]++;
      doc.close();
    }
  }
  _$jscoverage['/editor.js'].lineData[1148]++;
  function createIframe(self, afterData) {
    _$jscoverage['/editor.js'].functionData[71]++;
    _$jscoverage['/editor.js'].lineData[1152]++;
    var iframeSrc = visit1244_1152_1($(window).getEmptyIframeSrc() || '');
    _$jscoverage['/editor.js'].lineData[1153]++;
    if (visit1245_1153_1(iframeSrc)) {
      _$jscoverage['/editor.js'].lineData[1154]++;
      iframeSrc = ' src="' + iframeSrc + '" ';
    }
    _$jscoverage['/editor.js'].lineData[1156]++;
    var iframe = new Node(S.substitute(IFRAME_TPL, {
  iframeSrc: iframeSrc, 
  prefixCls: self.get('prefixCls')})), textarea = self.get('textarea');
    _$jscoverage['/editor.js'].lineData[1161]++;
    if (visit1246_1161_1(textarea.hasAttr('tabindex'))) {
      _$jscoverage['/editor.js'].lineData[1162]++;
      iframe.attr('tabindex', UA.webkit ? -1 : textarea.attr('tabindex'));
    }
    _$jscoverage['/editor.js'].lineData[1164]++;
    textarea.parent().prepend(iframe);
    _$jscoverage['/editor.js'].lineData[1165]++;
    self.set('iframe', iframe);
    _$jscoverage['/editor.js'].lineData[1166]++;
    self.__docReady = 0;
    _$jscoverage['/editor.js'].lineData[1168]++;
    if (visit1247_1168_1(UA.gecko && !iframe.__loaded)) {
      _$jscoverage['/editor.js'].lineData[1169]++;
      iframe.on('load', function() {
  _$jscoverage['/editor.js'].functionData[72]++;
  _$jscoverage['/editor.js'].lineData[1170]++;
  setUpIFrame(self, afterData);
}, self);
    } else {
      _$jscoverage['/editor.js'].lineData[1174]++;
      setUpIFrame(self, afterData);
    }
  }
  _$jscoverage['/editor.js'].lineData[1178]++;
  function clearIframeDocContent(self) {
    _$jscoverage['/editor.js'].functionData[73]++;
    _$jscoverage['/editor.js'].lineData[1179]++;
    if (visit1248_1179_1(!self.get('iframe'))) {
      _$jscoverage['/editor.js'].lineData[1180]++;
      return;
    }
    _$jscoverage['/editor.js'].lineData[1182]++;
    var iframe = self.get('iframe'), win = self.get('window'), doc = self.get('document'), domDoc = doc[0], documentElement = $(domDoc.documentElement), body = $(domDoc.body);
    _$jscoverage['/editor.js'].lineData[1188]++;
    S.each([doc, documentElement, body, win], function(el) {
  _$jscoverage['/editor.js'].functionData[74]++;
  _$jscoverage['/editor.js'].lineData[1189]++;
  el.detach();
});
    _$jscoverage['/editor.js'].lineData[1191]++;
    iframe.remove();
  }
});
