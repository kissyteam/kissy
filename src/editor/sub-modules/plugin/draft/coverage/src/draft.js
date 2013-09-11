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
if (! _$jscoverage['/draft.js']) {
  _$jscoverage['/draft.js'] = {};
  _$jscoverage['/draft.js'].lineData = [];
  _$jscoverage['/draft.js'].lineData[6] = 0;
  _$jscoverage['/draft.js'].lineData[7] = 0;
  _$jscoverage['/draft.js'].lineData[13] = 0;
  _$jscoverage['/draft.js'].lineData[14] = 0;
  _$jscoverage['/draft.js'].lineData[15] = 0;
  _$jscoverage['/draft.js'].lineData[16] = 0;
  _$jscoverage['/draft.js'].lineData[18] = 0;
  _$jscoverage['/draft.js'].lineData[21] = 0;
  _$jscoverage['/draft.js'].lineData[22] = 0;
  _$jscoverage['/draft.js'].lineData[23] = 0;
  _$jscoverage['/draft.js'].lineData[25] = 0;
  _$jscoverage['/draft.js'].lineData[26] = 0;
  _$jscoverage['/draft.js'].lineData[43] = 0;
  _$jscoverage['/draft.js'].lineData[46] = 0;
  _$jscoverage['/draft.js'].lineData[47] = 0;
  _$jscoverage['/draft.js'].lineData[48] = 0;
  _$jscoverage['/draft.js'].lineData[49] = 0;
  _$jscoverage['/draft.js'].lineData[52] = 0;
  _$jscoverage['/draft.js'].lineData[55] = 0;
  _$jscoverage['/draft.js'].lineData[57] = 0;
  _$jscoverage['/draft.js'].lineData[59] = 0;
  _$jscoverage['/draft.js'].lineData[65] = 0;
  _$jscoverage['/draft.js'].lineData[66] = 0;
  _$jscoverage['/draft.js'].lineData[67] = 0;
  _$jscoverage['/draft.js'].lineData[69] = 0;
  _$jscoverage['/draft.js'].lineData[71] = 0;
  _$jscoverage['/draft.js'].lineData[74] = 0;
  _$jscoverage['/draft.js'].lineData[76] = 0;
  _$jscoverage['/draft.js'].lineData[80] = 0;
  _$jscoverage['/draft.js'].lineData[85] = 0;
  _$jscoverage['/draft.js'].lineData[86] = 0;
  _$jscoverage['/draft.js'].lineData[88] = 0;
  _$jscoverage['/draft.js'].lineData[90] = 0;
  _$jscoverage['/draft.js'].lineData[98] = 0;
  _$jscoverage['/draft.js'].lineData[101] = 0;
  _$jscoverage['/draft.js'].lineData[130] = 0;
  _$jscoverage['/draft.js'].lineData[132] = 0;
  _$jscoverage['/draft.js'].lineData[133] = 0;
  _$jscoverage['/draft.js'].lineData[134] = 0;
  _$jscoverage['/draft.js'].lineData[135] = 0;
  _$jscoverage['/draft.js'].lineData[138] = 0;
  _$jscoverage['/draft.js'].lineData[139] = 0;
  _$jscoverage['/draft.js'].lineData[141] = 0;
  _$jscoverage['/draft.js'].lineData[144] = 0;
  _$jscoverage['/draft.js'].lineData[149] = 0;
  _$jscoverage['/draft.js'].lineData[150] = 0;
  _$jscoverage['/draft.js'].lineData[151] = 0;
  _$jscoverage['/draft.js'].lineData[154] = 0;
  _$jscoverage['/draft.js'].lineData[155] = 0;
  _$jscoverage['/draft.js'].lineData[158] = 0;
  _$jscoverage['/draft.js'].lineData[159] = 0;
  _$jscoverage['/draft.js'].lineData[160] = 0;
  _$jscoverage['/draft.js'].lineData[166] = 0;
  _$jscoverage['/draft.js'].lineData[167] = 0;
  _$jscoverage['/draft.js'].lineData[170] = 0;
  _$jscoverage['/draft.js'].lineData[171] = 0;
  _$jscoverage['/draft.js'].lineData[174] = 0;
  _$jscoverage['/draft.js'].lineData[175] = 0;
  _$jscoverage['/draft.js'].lineData[176] = 0;
  _$jscoverage['/draft.js'].lineData[177] = 0;
  _$jscoverage['/draft.js'].lineData[179] = 0;
  _$jscoverage['/draft.js'].lineData[188] = 0;
  _$jscoverage['/draft.js'].lineData[189] = 0;
  _$jscoverage['/draft.js'].lineData[190] = 0;
  _$jscoverage['/draft.js'].lineData[191] = 0;
  _$jscoverage['/draft.js'].lineData[193] = 0;
  _$jscoverage['/draft.js'].lineData[196] = 0;
  _$jscoverage['/draft.js'].lineData[197] = 0;
  _$jscoverage['/draft.js'].lineData[199] = 0;
  _$jscoverage['/draft.js'].lineData[200] = 0;
  _$jscoverage['/draft.js'].lineData[201] = 0;
  _$jscoverage['/draft.js'].lineData[203] = 0;
  _$jscoverage['/draft.js'].lineData[206] = 0;
  _$jscoverage['/draft.js'].lineData[212] = 0;
  _$jscoverage['/draft.js'].lineData[219] = 0;
  _$jscoverage['/draft.js'].lineData[231] = 0;
  _$jscoverage['/draft.js'].lineData[232] = 0;
  _$jscoverage['/draft.js'].lineData[236] = 0;
  _$jscoverage['/draft.js'].lineData[244] = 0;
  _$jscoverage['/draft.js'].lineData[245] = 0;
  _$jscoverage['/draft.js'].lineData[248] = 0;
  _$jscoverage['/draft.js'].lineData[251] = 0;
  _$jscoverage['/draft.js'].lineData[252] = 0;
  _$jscoverage['/draft.js'].lineData[253] = 0;
  _$jscoverage['/draft.js'].lineData[257] = 0;
  _$jscoverage['/draft.js'].lineData[263] = 0;
  _$jscoverage['/draft.js'].lineData[266] = 0;
  _$jscoverage['/draft.js'].lineData[269] = 0;
  _$jscoverage['/draft.js'].lineData[277] = 0;
  _$jscoverage['/draft.js'].lineData[278] = 0;
  _$jscoverage['/draft.js'].lineData[281] = 0;
  _$jscoverage['/draft.js'].lineData[283] = 0;
  _$jscoverage['/draft.js'].lineData[284] = 0;
  _$jscoverage['/draft.js'].lineData[285] = 0;
  _$jscoverage['/draft.js'].lineData[287] = 0;
  _$jscoverage['/draft.js'].lineData[293] = 0;
  _$jscoverage['/draft.js'].lineData[294] = 0;
  _$jscoverage['/draft.js'].lineData[301] = 0;
  _$jscoverage['/draft.js'].lineData[302] = 0;
  _$jscoverage['/draft.js'].lineData[309] = 0;
  _$jscoverage['/draft.js'].lineData[320] = 0;
  _$jscoverage['/draft.js'].lineData[321] = 0;
  _$jscoverage['/draft.js'].lineData[324] = 0;
  _$jscoverage['/draft.js'].lineData[326] = 0;
  _$jscoverage['/draft.js'].lineData[328] = 0;
  _$jscoverage['/draft.js'].lineData[333] = 0;
  _$jscoverage['/draft.js'].lineData[337] = 0;
  _$jscoverage['/draft.js'].lineData[341] = 0;
  _$jscoverage['/draft.js'].lineData[342] = 0;
  _$jscoverage['/draft.js'].lineData[343] = 0;
  _$jscoverage['/draft.js'].lineData[344] = 0;
  _$jscoverage['/draft.js'].lineData[346] = 0;
  _$jscoverage['/draft.js'].lineData[350] = 0;
  _$jscoverage['/draft.js'].lineData[354] = 0;
  _$jscoverage['/draft.js'].lineData[355] = 0;
  _$jscoverage['/draft.js'].lineData[356] = 0;
  _$jscoverage['/draft.js'].lineData[357] = 0;
  _$jscoverage['/draft.js'].lineData[361] = 0;
  _$jscoverage['/draft.js'].lineData[362] = 0;
  _$jscoverage['/draft.js'].lineData[365] = 0;
  _$jscoverage['/draft.js'].lineData[367] = 0;
  _$jscoverage['/draft.js'].lineData[368] = 0;
  _$jscoverage['/draft.js'].lineData[369] = 0;
  _$jscoverage['/draft.js'].lineData[370] = 0;
  _$jscoverage['/draft.js'].lineData[373] = 0;
  _$jscoverage['/draft.js'].lineData[378] = 0;
}
if (! _$jscoverage['/draft.js'].functionData) {
  _$jscoverage['/draft.js'].functionData = [];
  _$jscoverage['/draft.js'].functionData[0] = 0;
  _$jscoverage['/draft.js'].functionData[1] = 0;
  _$jscoverage['/draft.js'].functionData[2] = 0;
  _$jscoverage['/draft.js'].functionData[3] = 0;
  _$jscoverage['/draft.js'].functionData[4] = 0;
  _$jscoverage['/draft.js'].functionData[5] = 0;
  _$jscoverage['/draft.js'].functionData[6] = 0;
  _$jscoverage['/draft.js'].functionData[7] = 0;
  _$jscoverage['/draft.js'].functionData[8] = 0;
  _$jscoverage['/draft.js'].functionData[9] = 0;
  _$jscoverage['/draft.js'].functionData[10] = 0;
  _$jscoverage['/draft.js'].functionData[11] = 0;
  _$jscoverage['/draft.js'].functionData[12] = 0;
  _$jscoverage['/draft.js'].functionData[13] = 0;
  _$jscoverage['/draft.js'].functionData[14] = 0;
  _$jscoverage['/draft.js'].functionData[15] = 0;
  _$jscoverage['/draft.js'].functionData[16] = 0;
  _$jscoverage['/draft.js'].functionData[17] = 0;
  _$jscoverage['/draft.js'].functionData[18] = 0;
  _$jscoverage['/draft.js'].functionData[19] = 0;
  _$jscoverage['/draft.js'].functionData[20] = 0;
  _$jscoverage['/draft.js'].functionData[21] = 0;
  _$jscoverage['/draft.js'].functionData[22] = 0;
  _$jscoverage['/draft.js'].functionData[23] = 0;
  _$jscoverage['/draft.js'].functionData[24] = 0;
  _$jscoverage['/draft.js'].functionData[25] = 0;
  _$jscoverage['/draft.js'].functionData[26] = 0;
  _$jscoverage['/draft.js'].functionData[27] = 0;
  _$jscoverage['/draft.js'].functionData[28] = 0;
}
if (! _$jscoverage['/draft.js'].branchData) {
  _$jscoverage['/draft.js'].branchData = {};
  _$jscoverage['/draft.js'].branchData['15'] = [];
  _$jscoverage['/draft.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['22'] = [];
  _$jscoverage['/draft.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['25'] = [];
  _$jscoverage['/draft.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['59'] = [];
  _$jscoverage['/draft.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['59'][2] = new BranchData();
  _$jscoverage['/draft.js'].branchData['66'] = [];
  _$jscoverage['/draft.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['69'] = [];
  _$jscoverage['/draft.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['71'] = [];
  _$jscoverage['/draft.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['85'] = [];
  _$jscoverage['/draft.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['87'] = [];
  _$jscoverage['/draft.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['89'] = [];
  _$jscoverage['/draft.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['133'] = [];
  _$jscoverage['/draft.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['149'] = [];
  _$jscoverage['/draft.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['177'] = [];
  _$jscoverage['/draft.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['190'] = [];
  _$jscoverage['/draft.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['197'] = [];
  _$jscoverage['/draft.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['211'] = [];
  _$jscoverage['/draft.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['277'] = [];
  _$jscoverage['/draft.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['283'] = [];
  _$jscoverage['/draft.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['293'] = [];
  _$jscoverage['/draft.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['303'] = [];
  _$jscoverage['/draft.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['320'] = [];
  _$jscoverage['/draft.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['324'] = [];
  _$jscoverage['/draft.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['325'] = [];
  _$jscoverage['/draft.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['341'] = [];
  _$jscoverage['/draft.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['362'] = [];
  _$jscoverage['/draft.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['368'] = [];
  _$jscoverage['/draft.js'].branchData['368'][1] = new BranchData();
}
_$jscoverage['/draft.js'].branchData['368'][1].init(57, 18, 'localStorage.ready');
function visit27_368_1(result) {
  _$jscoverage['/draft.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['362'][1].init(24, 12, 'config || {}');
function visit26_362_1(result) {
  _$jscoverage['/draft.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['341'][1].init(177, 51, 'confirm("\\u786e\\u8ba4\\u6062\\u590d " + date(drafts[v].date) + " \\u7684\\u7f16\\u8f91\\u5386\\u53f2\\uff1f")');
function visit25_341_1(result) {
  _$jscoverage['/draft.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['325'][1].init(45, 41, 'data == drafts[drafts.length - 1].content');
function visit24_325_1(result) {
  _$jscoverage['/draft.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['324'][1].init(420, 87, 'drafts[drafts.length - 1] && data == drafts[drafts.length - 1].content');
function visit23_324_1(result) {
  _$jscoverage['/draft.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['320'][1].init(352, 5, '!data');
function visit22_320_1(result) {
  _$jscoverage['/draft.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['303'][1].init(58, 35, 'localStorage == window.localStorage');
function visit21_303_1(result) {
  _$jscoverage['/draft.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['293'][1].init(773, 14, '!drafts.length');
function visit20_293_1(result) {
  _$jscoverage['/draft.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['283'][1].init(453, 17, 'i < drafts.length');
function visit19_283_1(result) {
  _$jscoverage['/draft.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['277'][1].init(275, 26, 'drafts.length > draftLimit');
function visit18_277_1(result) {
  _$jscoverage['/draft.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['211'][1].init(217, 26, 'draftCfg[\'helpHTML\'] || ""');
function visit17_211_1(result) {
  _$jscoverage['/draft.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['197'][1].init(22, 39, 'self.helpPopup && self.helpPopup.hide()');
function visit16_197_1(result) {
  _$jscoverage['/draft.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['190'][1].init(64, 47, 'self.helpPopup && self.helpPopup.get("visible")');
function visit15_190_1(result) {
  _$jscoverage['/draft.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['177'][1].init(3777, 21, 'cfg.draft[\'helpHTML\']');
function visit14_177_1(result) {
  _$jscoverage['/draft.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['149'][1].init(2868, 30, 'editor.get("textarea")[0].form');
function visit13_149_1(result) {
  _$jscoverage['/draft.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['133'][1].init(22, 11, '!e.newValue');
function visit12_133_1(result) {
  _$jscoverage['/draft.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['89'][1].init(34, 24, 'cfg.draft.limit || LIMIT');
function visit11_89_1(result) {
  _$jscoverage['/draft.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['87'][1].init(37, 30, 'cfg.draft.interval || INTERVAL');
function visit10_87_1(result) {
  _$jscoverage['/draft.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['85'][1].init(241, 15, 'cfg.draft || {}');
function visit9_85_1(result) {
  _$jscoverage['/draft.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['71'][1].init(77, 35, 'localStorage == window.localStorage');
function visit8_71_1(result) {
  _$jscoverage['/draft.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['69'][1].init(125, 3, 'str');
function visit7_69_1(result) {
  _$jscoverage['/draft.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['66'][1].init(48, 12, '!self.drafts');
function visit6_66_1(result) {
  _$jscoverage['/draft.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['59'][2].init(87, 33, 'cfg.draft && cfg.draft[\'saveKey\']');
function visit5_59_2(result) {
  _$jscoverage['/draft.js'].branchData['59'][2].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['59'][1].init(87, 47, 'cfg.draft && cfg.draft[\'saveKey\'] || DRAFT_SAVE');
function visit4_59_1(result) {
  _$jscoverage['/draft.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['25'][1].init(93, 17, 'd instanceof Date');
function visit3_25_1(result) {
  _$jscoverage['/draft.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['22'][1].init(14, 21, 'typeof d === \'number\'');
function visit2_22_1(result) {
  _$jscoverage['/draft.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['15'][1].init(35, 12, 'n.length < l');
function visit1_15_1(result) {
  _$jscoverage['/draft.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].lineData[6]++;
KISSY.add("editor/plugin/draft", function(S, Json, Editor, localStorage, Overlay, MenuButton) {
  _$jscoverage['/draft.js'].functionData[0]++;
  _$jscoverage['/draft.js'].lineData[7]++;
  var Node = S.Node, LIMIT = 5, Event = S.Event, INTERVAL = 5, DRAFT_SAVE = "ks-editor-draft-save20110503";
  _$jscoverage['/draft.js'].lineData[13]++;
  function padding(n, l, p) {
    _$jscoverage['/draft.js'].functionData[1]++;
    _$jscoverage['/draft.js'].lineData[14]++;
    n += "";
    _$jscoverage['/draft.js'].lineData[15]++;
    while (visit1_15_1(n.length < l)) {
      _$jscoverage['/draft.js'].lineData[16]++;
      n = p + n;
    }
    _$jscoverage['/draft.js'].lineData[18]++;
    return n;
  }
  _$jscoverage['/draft.js'].lineData[21]++;
  function date(d) {
    _$jscoverage['/draft.js'].functionData[2]++;
    _$jscoverage['/draft.js'].lineData[22]++;
    if (visit2_22_1(typeof d === 'number')) {
      _$jscoverage['/draft.js'].lineData[23]++;
      d = new Date(d);
    }
    _$jscoverage['/draft.js'].lineData[25]++;
    if (visit3_25_1(d instanceof Date)) {
      _$jscoverage['/draft.js'].lineData[26]++;
      return [d.getFullYear(), "-", padding(d.getMonth() + 1, 2, "0"), "-", padding(d.getDate(), 2, "0"), " ", padding(d.getHours(), 2, "0"), ":", padding(d.getMinutes(), 2, "0"), ":", padding(d.getSeconds(), 2, "0")].join("");
    } else {
      _$jscoverage['/draft.js'].lineData[43]++;
      return d;
    }
  }
  _$jscoverage['/draft.js'].lineData[46]++;
  function Draft(editor, config) {
    _$jscoverage['/draft.js'].functionData[3]++;
    _$jscoverage['/draft.js'].lineData[47]++;
    this.editor = editor;
    _$jscoverage['/draft.js'].lineData[48]++;
    this.config = config;
    _$jscoverage['/draft.js'].lineData[49]++;
    this._init();
  }
  _$jscoverage['/draft.js'].lineData[52]++;
  var addRes = Editor.Utils.addRes, destroyRes = Editor.Utils.destroyRes;
  _$jscoverage['/draft.js'].lineData[55]++;
  S.augment(Draft, {
  _getSaveKey: function() {
  _$jscoverage['/draft.js'].functionData[4]++;
  _$jscoverage['/draft.js'].lineData[57]++;
  var self = this, cfg = self.config;
  _$jscoverage['/draft.js'].lineData[59]++;
  return visit4_59_1(visit5_59_2(cfg.draft && cfg.draft['saveKey']) || DRAFT_SAVE);
}, 
  _getDrafts: function() {
  _$jscoverage['/draft.js'].functionData[5]++;
  _$jscoverage['/draft.js'].lineData[65]++;
  var self = this;
  _$jscoverage['/draft.js'].lineData[66]++;
  if (visit6_66_1(!self.drafts)) {
    _$jscoverage['/draft.js'].lineData[67]++;
    var str = localStorage.getItem(self._getSaveKey()), drafts = [];
    _$jscoverage['/draft.js'].lineData[69]++;
    if (visit7_69_1(str)) {
      _$jscoverage['/draft.js'].lineData[71]++;
      drafts = (visit8_71_1(localStorage == window.localStorage)) ? Json.parse(S.urlDecode(str)) : str;
    }
    _$jscoverage['/draft.js'].lineData[74]++;
    self.drafts = drafts;
  }
  _$jscoverage['/draft.js'].lineData[76]++;
  return self.drafts;
}, 
  _init: function() {
  _$jscoverage['/draft.js'].functionData[6]++;
  _$jscoverage['/draft.js'].lineData[80]++;
  var self = this, editor = self.editor, prefixCls = editor.get('prefixCls'), statusbar = editor.get("statusBarEl"), cfg = this.config;
  _$jscoverage['/draft.js'].lineData[85]++;
  cfg.draft = visit9_85_1(cfg.draft || {});
  _$jscoverage['/draft.js'].lineData[86]++;
  self.draftInterval = cfg.draft.interval = visit10_87_1(cfg.draft.interval || INTERVAL);
  _$jscoverage['/draft.js'].lineData[88]++;
  self.draftLimit = cfg.draft.limit = visit11_89_1(cfg.draft.limit || LIMIT);
  _$jscoverage['/draft.js'].lineData[90]++;
  var holder = new Node("<div class='" + prefixCls + "editor-draft'>" + "<span class='" + prefixCls + "editor-draft-title'>" + "\u5185\u5bb9\u6b63\u6587\u6bcf" + cfg.draft.interval + "\u5206\u949f\u81ea\u52a8\u4fdd\u5b58\u4e00\u6b21\u3002" + "</span>" + "</div>").appendTo(statusbar);
  _$jscoverage['/draft.js'].lineData[98]++;
  self.timeTip = new Node("<span class='" + prefixCls + "editor-draft-time'/>").appendTo(holder);
  _$jscoverage['/draft.js'].lineData[101]++;
  var save = new Node(S.substitute("<a href='#' " + "onclick='return false;' " + "class='{prefixCls}editor-button " + "{prefixCls}editor-draft-save-btn ks-inline-block' " + "style='" + "vertical-align:middle;" + "padding:1px 9px;" + "'>" + "<span class='{prefixCls}editor-draft-save'>" + "</span>" + "<span>\u7acb\u5373\u4fdd\u5b58</span>" + "</a>", {
  prefixCls: prefixCls})).unselectable(undefined).appendTo(holder), versions = new MenuButton({
  render: holder, 
  collapseOnClick: true, 
  width: "100px", 
  prefixCls: prefixCls + "editor-", 
  menu: {
  width: "225px", 
  align: {
  points: ['tr', 'br']}}, 
  matchElWidth: false, 
  content: "\u6062\u590d\u7f16\u8f91\u5386\u53f2"}).render();
  _$jscoverage['/draft.js'].lineData[130]++;
  self.versions = versions;
  _$jscoverage['/draft.js'].lineData[132]++;
  versions.on("beforeCollapsedChange", function(e) {
  _$jscoverage['/draft.js'].functionData[7]++;
  _$jscoverage['/draft.js'].lineData[133]++;
  if (visit12_133_1(!e.newValue)) {
    _$jscoverage['/draft.js'].lineData[134]++;
    versions.detach("beforeCollapsedChange", arguments.callee);
    _$jscoverage['/draft.js'].lineData[135]++;
    self.sync();
  }
});
  _$jscoverage['/draft.js'].lineData[138]++;
  save.on("click", function(ev) {
  _$jscoverage['/draft.js'].functionData[8]++;
  _$jscoverage['/draft.js'].lineData[139]++;
  self.save(false);
  _$jscoverage['/draft.js'].lineData[141]++;
  ev.halt();
});
  _$jscoverage['/draft.js'].lineData[144]++;
  addRes.call(self, save);
  _$jscoverage['/draft.js'].lineData[149]++;
  if (visit13_149_1(editor.get("textarea")[0].form)) {
    _$jscoverage['/draft.js'].lineData[150]++;
    (function() {
  _$jscoverage['/draft.js'].functionData[9]++;
  _$jscoverage['/draft.js'].lineData[151]++;
  var textarea = editor.get("textarea"), form = textarea[0].form;
  _$jscoverage['/draft.js'].lineData[154]++;
  function saveF() {
    _$jscoverage['/draft.js'].functionData[10]++;
    _$jscoverage['/draft.js'].lineData[155]++;
    self.save(true);
  }
  _$jscoverage['/draft.js'].lineData[158]++;
  Event.on(form, "submit", saveF);
  _$jscoverage['/draft.js'].lineData[159]++;
  addRes.call(self, function() {
  _$jscoverage['/draft.js'].functionData[11]++;
  _$jscoverage['/draft.js'].lineData[160]++;
  Event.remove(form, "submit", saveF);
});
})();
  }
  _$jscoverage['/draft.js'].lineData[166]++;
  var timer = setInterval(function() {
  _$jscoverage['/draft.js'].functionData[12]++;
  _$jscoverage['/draft.js'].lineData[167]++;
  self.save(true);
}, self.draftInterval * 60 * 1000);
  _$jscoverage['/draft.js'].lineData[170]++;
  addRes.call(self, function() {
  _$jscoverage['/draft.js'].functionData[13]++;
  _$jscoverage['/draft.js'].lineData[171]++;
  clearInterval(timer);
});
  _$jscoverage['/draft.js'].lineData[174]++;
  versions.on("click", self.recover, self);
  _$jscoverage['/draft.js'].lineData[175]++;
  addRes.call(self, versions);
  _$jscoverage['/draft.js'].lineData[176]++;
  self.holder = holder;
  _$jscoverage['/draft.js'].lineData[177]++;
  if (visit14_177_1(cfg.draft['helpHTML'])) {
    _$jscoverage['/draft.js'].lineData[179]++;
    var help = new Node('<a ' + 'tabindex="0" ' + 'hidefocus="hidefocus" ' + 'class="' + prefixCls + 'editor-draft-help" ' + 'title="\u70b9\u51fb\u67e5\u770b\u5e2e\u52a9" ' + 'href="javascript:void(\'\u70b9\u51fb\u67e5\u770b\u5e2e\u52a9 \')">\u70b9\u51fb\u67e5\u770b\u5e2e\u52a9</a>').unselectable(undefined).appendTo(holder);
    _$jscoverage['/draft.js'].lineData[188]++;
    help.on("click", function() {
  _$jscoverage['/draft.js'].functionData[14]++;
  _$jscoverage['/draft.js'].lineData[189]++;
  help[0].focus();
  _$jscoverage['/draft.js'].lineData[190]++;
  if (visit15_190_1(self.helpPopup && self.helpPopup.get("visible"))) {
    _$jscoverage['/draft.js'].lineData[191]++;
    self.helpPopup.hide();
  } else {
    _$jscoverage['/draft.js'].lineData[193]++;
    self._prepareHelp();
  }
});
    _$jscoverage['/draft.js'].lineData[196]++;
    help.on("blur", function() {
  _$jscoverage['/draft.js'].functionData[15]++;
  _$jscoverage['/draft.js'].lineData[197]++;
  visit16_197_1(self.helpPopup && self.helpPopup.hide());
});
    _$jscoverage['/draft.js'].lineData[199]++;
    self.helpBtn = help;
    _$jscoverage['/draft.js'].lineData[200]++;
    addRes.call(self, help);
    _$jscoverage['/draft.js'].lineData[201]++;
    Editor.Utils.lazyRun(self, "_prepareHelp", "_realHelp");
  }
  _$jscoverage['/draft.js'].lineData[203]++;
  addRes.call(self, holder);
}, 
  _prepareHelp: function() {
  _$jscoverage['/draft.js'].functionData[16]++;
  _$jscoverage['/draft.js'].lineData[206]++;
  var self = this, editor = self.editor, prefixCls = editor.get('prefixCls'), cfg = self.config, draftCfg = cfg.draft, help = new Node(visit17_211_1(draftCfg['helpHTML'] || ""));
  _$jscoverage['/draft.js'].lineData[212]++;
  var arrowCss = "height:0;" + "position:absolute;" + "font-size:0;" + "width:0;" + "border:8px #000 solid;" + "border-color:#000 transparent transparent transparent;" + "border-style:solid dashed dashed dashed;";
  _$jscoverage['/draft.js'].lineData[219]++;
  var arrow = new Node("<div style='" + arrowCss + "border-top-color:#CED5E0;" + "'>" + "<div style='" + arrowCss + "left:-8px;" + "top:-10px;" + "border-top-color:white;" + "'>" + "</div>" + "</div>");
  _$jscoverage['/draft.js'].lineData[231]++;
  help.append(arrow);
  _$jscoverage['/draft.js'].lineData[232]++;
  help.css({
  border: "1px solid #ACB4BE", 
  "text-align": "left"});
  _$jscoverage['/draft.js'].lineData[236]++;
  self.helpPopup = new Overlay({
  content: help, 
  prefixCls: prefixCls + 'editor-', 
  width: help.width() + "px", 
  zIndex: Editor.baseZIndex(Editor.zIndexManager.OVERLAY), 
  mask: false}).render();
  _$jscoverage['/draft.js'].lineData[244]++;
  self.helpPopup.get("el").css("border", "none");
  _$jscoverage['/draft.js'].lineData[245]++;
  self.helpPopup.arrow = arrow;
}, 
  _realHelp: function() {
  _$jscoverage['/draft.js'].functionData[17]++;
  _$jscoverage['/draft.js'].lineData[248]++;
  var win = this.helpPopup, helpBtn = this.helpBtn, arrow = win.arrow;
  _$jscoverage['/draft.js'].lineData[251]++;
  win.show();
  _$jscoverage['/draft.js'].lineData[252]++;
  var off = helpBtn.offset();
  _$jscoverage['/draft.js'].lineData[253]++;
  win.get("el").offset({
  left: (off.left - win.get("el").width()) + 17, 
  top: (off.top - win.get("el").height()) - 7});
  _$jscoverage['/draft.js'].lineData[257]++;
  arrow.offset({
  left: off.left - 2, 
  top: off.top - 8});
}, 
  disable: function() {
  _$jscoverage['/draft.js'].functionData[18]++;
  _$jscoverage['/draft.js'].lineData[263]++;
  this.holder.css("visibility", "hidden");
}, 
  enable: function() {
  _$jscoverage['/draft.js'].functionData[19]++;
  _$jscoverage['/draft.js'].lineData[266]++;
  this.holder.css("visibility", "");
}, 
  sync: function() {
  _$jscoverage['/draft.js'].functionData[20]++;
  _$jscoverage['/draft.js'].lineData[269]++;
  var self = this, i, draftLimit = self.draftLimit, timeTip = self.timeTip, versions = self.versions, drafts = self._getDrafts(), draft, tip;
  _$jscoverage['/draft.js'].lineData[277]++;
  if (visit18_277_1(drafts.length > draftLimit)) {
    _$jscoverage['/draft.js'].lineData[278]++;
    drafts.splice(0, drafts.length - draftLimit);
  }
  _$jscoverage['/draft.js'].lineData[281]++;
  versions.removeItems(true);
  _$jscoverage['/draft.js'].lineData[283]++;
  for (i = 0; visit19_283_1(i < drafts.length); i++) {
    _$jscoverage['/draft.js'].lineData[284]++;
    draft = drafts[i];
    _$jscoverage['/draft.js'].lineData[285]++;
    tip = (draft.auto ? "\u81ea\u52a8" : "\u624b\u52a8") + "\u4fdd\u5b58\u4e8e : " + date(draft.date);
    _$jscoverage['/draft.js'].lineData[287]++;
    versions.addItem({
  content: tip, 
  value: i});
  }
  _$jscoverage['/draft.js'].lineData[293]++;
  if (visit20_293_1(!drafts.length)) {
    _$jscoverage['/draft.js'].lineData[294]++;
    versions.addItem({
  disabled: true, 
  content: '\u5c1a\u65e0\u5386\u53f2', 
  value: ''});
  }
  _$jscoverage['/draft.js'].lineData[301]++;
  timeTip.html(tip);
  _$jscoverage['/draft.js'].lineData[302]++;
  localStorage.setItem(self._getSaveKey(), (visit21_303_1(localStorage == window.localStorage)) ? encodeURIComponent(Json.stringify(drafts)) : drafts);
}, 
  save: function(auto) {
  _$jscoverage['/draft.js'].functionData[21]++;
  _$jscoverage['/draft.js'].lineData[309]++;
  var self = this, drafts = self._getDrafts(), editor = self.editor, data = editor.getFormatData();
  _$jscoverage['/draft.js'].lineData[320]++;
  if (visit22_320_1(!data)) {
    _$jscoverage['/draft.js'].lineData[321]++;
    return;
  }
  _$jscoverage['/draft.js'].lineData[324]++;
  if (visit23_324_1(drafts[drafts.length - 1] && visit24_325_1(data == drafts[drafts.length - 1].content))) {
    _$jscoverage['/draft.js'].lineData[326]++;
    drafts.length -= 1;
  }
  _$jscoverage['/draft.js'].lineData[328]++;
  self.drafts = drafts.concat({
  content: data, 
  date: new Date().getTime(), 
  auto: auto});
  _$jscoverage['/draft.js'].lineData[333]++;
  self.sync();
}, 
  recover: function(ev) {
  _$jscoverage['/draft.js'].functionData[22]++;
  _$jscoverage['/draft.js'].lineData[337]++;
  var self = this, editor = self.editor, drafts = self._getDrafts(), v = ev.target.get("value");
  _$jscoverage['/draft.js'].lineData[341]++;
  if (visit25_341_1(confirm("\u786e\u8ba4\u6062\u590d " + date(drafts[v].date) + " \u7684\u7f16\u8f91\u5386\u53f2\uff1f"))) {
    _$jscoverage['/draft.js'].lineData[342]++;
    editor.execCommand("save");
    _$jscoverage['/draft.js'].lineData[343]++;
    editor.setData(drafts[v].content);
    _$jscoverage['/draft.js'].lineData[344]++;
    editor.execCommand("save");
  }
  _$jscoverage['/draft.js'].lineData[346]++;
  ev.halt();
}, 
  destroy: function() {
  _$jscoverage['/draft.js'].functionData[23]++;
  _$jscoverage['/draft.js'].lineData[350]++;
  destroyRes.call(this);
}});
  _$jscoverage['/draft.js'].lineData[354]++;
  function init(editor, config) {
    _$jscoverage['/draft.js'].functionData[24]++;
    _$jscoverage['/draft.js'].lineData[355]++;
    var d = new Draft(editor, config);
    _$jscoverage['/draft.js'].lineData[356]++;
    editor.on("destroy", function() {
  _$jscoverage['/draft.js'].functionData[25]++;
  _$jscoverage['/draft.js'].lineData[357]++;
  d.destroy();
});
  }
  _$jscoverage['/draft.js'].lineData[361]++;
  function DraftPlugin(config) {
    _$jscoverage['/draft.js'].functionData[26]++;
    _$jscoverage['/draft.js'].lineData[362]++;
    this.config = visit26_362_1(config || {});
  }
  _$jscoverage['/draft.js'].lineData[365]++;
  S.augment(DraftPlugin, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/draft.js'].functionData[27]++;
  _$jscoverage['/draft.js'].lineData[367]++;
  var config = this.config;
  _$jscoverage['/draft.js'].lineData[368]++;
  if (visit27_368_1(localStorage.ready)) {
    _$jscoverage['/draft.js'].lineData[369]++;
    localStorage.ready(function() {
  _$jscoverage['/draft.js'].functionData[28]++;
  _$jscoverage['/draft.js'].lineData[370]++;
  init(editor, config);
});
  } else {
    _$jscoverage['/draft.js'].lineData[373]++;
    init(editor, config);
  }
}});
  _$jscoverage['/draft.js'].lineData[378]++;
  return DraftPlugin;
}, {
  "requires": ['json', "editor", "./local-storage", "overlay", './menubutton']});
