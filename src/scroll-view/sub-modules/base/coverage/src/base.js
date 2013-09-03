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
if (! _$jscoverage['/base.js']) {
  _$jscoverage['/base.js'] = {};
  _$jscoverage['/base.js'].lineData = [];
  _$jscoverage['/base.js'].lineData[5] = 0;
  _$jscoverage['/base.js'].lineData[6] = 0;
  _$jscoverage['/base.js'].lineData[10] = 0;
  _$jscoverage['/base.js'].lineData[11] = 0;
  _$jscoverage['/base.js'].lineData[15] = 0;
  _$jscoverage['/base.js'].lineData[16] = 0;
  _$jscoverage['/base.js'].lineData[18] = 0;
  _$jscoverage['/base.js'].lineData[19] = 0;
  _$jscoverage['/base.js'].lineData[21] = 0;
  _$jscoverage['/base.js'].lineData[24] = 0;
  _$jscoverage['/base.js'].lineData[25] = 0;
  _$jscoverage['/base.js'].lineData[28] = 0;
  _$jscoverage['/base.js'].lineData[30] = 0;
  _$jscoverage['/base.js'].lineData[34] = 0;
  _$jscoverage['/base.js'].lineData[39] = 0;
  _$jscoverage['/base.js'].lineData[44] = 0;
  _$jscoverage['/base.js'].lineData[48] = 0;
  _$jscoverage['/base.js'].lineData[52] = 0;
  _$jscoverage['/base.js'].lineData[54] = 0;
  _$jscoverage['/base.js'].lineData[58] = 0;
  _$jscoverage['/base.js'].lineData[59] = 0;
  _$jscoverage['/base.js'].lineData[60] = 0;
  _$jscoverage['/base.js'].lineData[61] = 0;
  _$jscoverage['/base.js'].lineData[64] = 0;
  _$jscoverage['/base.js'].lineData[65] = 0;
  _$jscoverage['/base.js'].lineData[68] = 0;
  _$jscoverage['/base.js'].lineData[69] = 0;
  _$jscoverage['/base.js'].lineData[70] = 0;
  _$jscoverage['/base.js'].lineData[71] = 0;
  _$jscoverage['/base.js'].lineData[72] = 0;
  _$jscoverage['/base.js'].lineData[73] = 0;
  _$jscoverage['/base.js'].lineData[74] = 0;
  _$jscoverage['/base.js'].lineData[75] = 0;
  _$jscoverage['/base.js'].lineData[76] = 0;
  _$jscoverage['/base.js'].lineData[77] = 0;
  _$jscoverage['/base.js'].lineData[80] = 0;
  _$jscoverage['/base.js'].lineData[81] = 0;
  _$jscoverage['/base.js'].lineData[82] = 0;
  _$jscoverage['/base.js'].lineData[83] = 0;
  _$jscoverage['/base.js'].lineData[84] = 0;
  _$jscoverage['/base.js'].lineData[85] = 0;
  _$jscoverage['/base.js'].lineData[86] = 0;
  _$jscoverage['/base.js'].lineData[87] = 0;
  _$jscoverage['/base.js'].lineData[88] = 0;
  _$jscoverage['/base.js'].lineData[91] = 0;
  _$jscoverage['/base.js'].lineData[95] = 0;
  _$jscoverage['/base.js'].lineData[96] = 0;
  _$jscoverage['/base.js'].lineData[97] = 0;
  _$jscoverage['/base.js'].lineData[99] = 0;
  _$jscoverage['/base.js'].lineData[100] = 0;
  _$jscoverage['/base.js'].lineData[101] = 0;
  _$jscoverage['/base.js'].lineData[102] = 0;
  _$jscoverage['/base.js'].lineData[109] = 0;
  _$jscoverage['/base.js'].lineData[110] = 0;
  _$jscoverage['/base.js'].lineData[112] = 0;
  _$jscoverage['/base.js'].lineData[121] = 0;
  _$jscoverage['/base.js'].lineData[122] = 0;
  _$jscoverage['/base.js'].lineData[123] = 0;
  _$jscoverage['/base.js'].lineData[124] = 0;
  _$jscoverage['/base.js'].lineData[125] = 0;
  _$jscoverage['/base.js'].lineData[127] = 0;
  _$jscoverage['/base.js'].lineData[129] = 0;
  _$jscoverage['/base.js'].lineData[130] = 0;
  _$jscoverage['/base.js'].lineData[135] = 0;
  _$jscoverage['/base.js'].lineData[136] = 0;
  _$jscoverage['/base.js'].lineData[137] = 0;
  _$jscoverage['/base.js'].lineData[138] = 0;
  _$jscoverage['/base.js'].lineData[139] = 0;
  _$jscoverage['/base.js'].lineData[141] = 0;
  _$jscoverage['/base.js'].lineData[142] = 0;
  _$jscoverage['/base.js'].lineData[143] = 0;
  _$jscoverage['/base.js'].lineData[150] = 0;
  _$jscoverage['/base.js'].lineData[154] = 0;
  _$jscoverage['/base.js'].lineData[155] = 0;
  _$jscoverage['/base.js'].lineData[156] = 0;
  _$jscoverage['/base.js'].lineData[157] = 0;
  _$jscoverage['/base.js'].lineData[159] = 0;
  _$jscoverage['/base.js'].lineData[161] = 0;
  _$jscoverage['/base.js'].lineData[168] = 0;
  _$jscoverage['/base.js'].lineData[172] = 0;
  _$jscoverage['/base.js'].lineData[173] = 0;
  _$jscoverage['/base.js'].lineData[174] = 0;
  _$jscoverage['/base.js'].lineData[175] = 0;
  _$jscoverage['/base.js'].lineData[176] = 0;
  _$jscoverage['/base.js'].lineData[178] = 0;
  _$jscoverage['/base.js'].lineData[179] = 0;
  _$jscoverage['/base.js'].lineData[180] = 0;
  _$jscoverage['/base.js'].lineData[181] = 0;
  _$jscoverage['/base.js'].lineData[182] = 0;
  _$jscoverage['/base.js'].lineData[186] = 0;
  _$jscoverage['/base.js'].lineData[187] = 0;
  _$jscoverage['/base.js'].lineData[188] = 0;
  _$jscoverage['/base.js'].lineData[189] = 0;
  _$jscoverage['/base.js'].lineData[193] = 0;
  _$jscoverage['/base.js'].lineData[197] = 0;
  _$jscoverage['/base.js'].lineData[199] = 0;
  _$jscoverage['/base.js'].lineData[200] = 0;
  _$jscoverage['/base.js'].lineData[201] = 0;
  _$jscoverage['/base.js'].lineData[206] = 0;
  _$jscoverage['/base.js'].lineData[207] = 0;
  _$jscoverage['/base.js'].lineData[208] = 0;
  _$jscoverage['/base.js'].lineData[209] = 0;
  _$jscoverage['/base.js'].lineData[210] = 0;
  _$jscoverage['/base.js'].lineData[212] = 0;
  _$jscoverage['/base.js'].lineData[213] = 0;
  _$jscoverage['/base.js'].lineData[215] = 0;
  _$jscoverage['/base.js'].lineData[219] = 0;
  _$jscoverage['/base.js'].lineData[222] = 0;
  _$jscoverage['/base.js'].lineData[223] = 0;
  _$jscoverage['/base.js'].lineData[227] = 0;
  _$jscoverage['/base.js'].lineData[228] = 0;
  _$jscoverage['/base.js'].lineData[229] = 0;
  _$jscoverage['/base.js'].lineData[231] = 0;
  _$jscoverage['/base.js'].lineData[232] = 0;
  _$jscoverage['/base.js'].lineData[233] = 0;
  _$jscoverage['/base.js'].lineData[235] = 0;
  _$jscoverage['/base.js'].lineData[236] = 0;
  _$jscoverage['/base.js'].lineData[237] = 0;
  _$jscoverage['/base.js'].lineData[238] = 0;
  _$jscoverage['/base.js'].lineData[239] = 0;
  _$jscoverage['/base.js'].lineData[240] = 0;
  _$jscoverage['/base.js'].lineData[241] = 0;
  _$jscoverage['/base.js'].lineData[243] = 0;
  _$jscoverage['/base.js'].lineData[244] = 0;
  _$jscoverage['/base.js'].lineData[246] = 0;
  _$jscoverage['/base.js'].lineData[247] = 0;
}
if (! _$jscoverage['/base.js'].functionData) {
  _$jscoverage['/base.js'].functionData = [];
  _$jscoverage['/base.js'].functionData[0] = 0;
  _$jscoverage['/base.js'].functionData[1] = 0;
  _$jscoverage['/base.js'].functionData[2] = 0;
  _$jscoverage['/base.js'].functionData[3] = 0;
  _$jscoverage['/base.js'].functionData[4] = 0;
  _$jscoverage['/base.js'].functionData[5] = 0;
  _$jscoverage['/base.js'].functionData[6] = 0;
  _$jscoverage['/base.js'].functionData[7] = 0;
  _$jscoverage['/base.js'].functionData[8] = 0;
  _$jscoverage['/base.js'].functionData[9] = 0;
  _$jscoverage['/base.js'].functionData[10] = 0;
  _$jscoverage['/base.js'].functionData[11] = 0;
  _$jscoverage['/base.js'].functionData[12] = 0;
  _$jscoverage['/base.js'].functionData[13] = 0;
  _$jscoverage['/base.js'].functionData[14] = 0;
  _$jscoverage['/base.js'].functionData[15] = 0;
  _$jscoverage['/base.js'].functionData[16] = 0;
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['15'] = [];
  _$jscoverage['/base.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['18'] = [];
  _$jscoverage['/base.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['48'] = [];
  _$jscoverage['/base.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['48'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['49'] = [];
  _$jscoverage['/base.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['49'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['50'] = [];
  _$jscoverage['/base.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['50'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['60'] = [];
  _$jscoverage['/base.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['64'] = [];
  _$jscoverage['/base.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['69'] = [];
  _$jscoverage['/base.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['72'] = [];
  _$jscoverage['/base.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['75'] = [];
  _$jscoverage['/base.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['80'] = [];
  _$jscoverage['/base.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['83'] = [];
  _$jscoverage['/base.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['86'] = [];
  _$jscoverage['/base.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['96'] = [];
  _$jscoverage['/base.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['109'] = [];
  _$jscoverage['/base.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['121'] = [];
  _$jscoverage['/base.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['125'] = [];
  _$jscoverage['/base.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['125'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['125'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['125'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['125'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['125'][6] = new BranchData();
  _$jscoverage['/base.js'].branchData['125'][7] = new BranchData();
  _$jscoverage['/base.js'].branchData['129'] = [];
  _$jscoverage['/base.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['135'] = [];
  _$jscoverage['/base.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['139'] = [];
  _$jscoverage['/base.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['139'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['139'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['139'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['139'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['139'][6] = new BranchData();
  _$jscoverage['/base.js'].branchData['139'][7] = new BranchData();
  _$jscoverage['/base.js'].branchData['142'] = [];
  _$jscoverage['/base.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['150'] = [];
  _$jscoverage['/base.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['155'] = [];
  _$jscoverage['/base.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['178'] = [];
  _$jscoverage['/base.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['179'] = [];
  _$jscoverage['/base.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['181'] = [];
  _$jscoverage['/base.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['186'] = [];
  _$jscoverage['/base.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['188'] = [];
  _$jscoverage['/base.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['199'] = [];
  _$jscoverage['/base.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['209'] = [];
  _$jscoverage['/base.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['212'] = [];
  _$jscoverage['/base.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['222'] = [];
  _$jscoverage['/base.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['227'] = [];
  _$jscoverage['/base.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['231'] = [];
  _$jscoverage['/base.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['243'] = [];
  _$jscoverage['/base.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['246'] = [];
  _$jscoverage['/base.js'].branchData['246'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['246'][1].init(135, 17, 'top !== undefined');
function visit60_246_1(result) {
  _$jscoverage['/base.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['243'][1].init(22, 18, 'left !== undefined');
function visit59_243_1(result) {
  _$jscoverage['/base.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['231'][1].init(366, 17, 'top !== undefined');
function visit58_231_1(result) {
  _$jscoverage['/base.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['227'][1].init(198, 18, 'left !== undefined');
function visit57_227_1(result) {
  _$jscoverage['/base.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['222'][1].init(114, 7, 'animCfg');
function visit56_222_1(result) {
  _$jscoverage['/base.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['212'][1].init(272, 7, 'cfg.top');
function visit55_212_1(result) {
  _$jscoverage['/base.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['209'][1].init(138, 8, 'cfg.left');
function visit54_209_1(result) {
  _$jscoverage['/base.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['199'][1].init(78, 51, '(pageOffset = self.pagesOffset) && pageOffset[index]');
function visit53_199_1(result) {
  _$jscoverage['/base.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['188'][1].init(72, 15, 'offset[p2] <= v');
function visit52_188_1(result) {
  _$jscoverage['/base.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['186'][1].init(51, 6, 'i >= 0');
function visit51_186_1(result) {
  _$jscoverage['/base.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['181'][1].init(72, 15, 'offset[p2] >= v');
function visit50_181_1(result) {
  _$jscoverage['/base.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['179'][1].init(30, 22, 'i < pagesOffset.length');
function visit49_179_1(result) {
  _$jscoverage['/base.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['178'][1].init(261, 13, 'direction > 0');
function visit48_178_1(result) {
  _$jscoverage['/base.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['155'][1].init(48, 23, 'self.scrollAnims.length');
function visit47_155_1(result) {
  _$jscoverage['/base.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['150'][1].init(38, 11, 'axis == \'x\'');
function visit46_150_1(result) {
  _$jscoverage['/base.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['142'][1].init(124, 21, 'isTouchEventSupported');
function visit45_142_1(result) {
  _$jscoverage['/base.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['139'][7].init(214, 10, 'deltaX < 0');
function visit44_139_7(result) {
  _$jscoverage['/base.js'].branchData['139'][7].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['139'][6].init(193, 17, 'scrollLeft >= max');
function visit43_139_6(result) {
  _$jscoverage['/base.js'].branchData['139'][6].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['139'][5].init(193, 31, 'scrollLeft >= max && deltaX < 0');
function visit42_139_5(result) {
  _$jscoverage['/base.js'].branchData['139'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['139'][4].init(179, 10, 'deltaX > 0');
function visit41_139_4(result) {
  _$jscoverage['/base.js'].branchData['139'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['139'][3].init(158, 17, 'scrollLeft <= min');
function visit40_139_3(result) {
  _$jscoverage['/base.js'].branchData['139'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['139'][2].init(158, 31, 'scrollLeft <= min && deltaX > 0');
function visit39_139_2(result) {
  _$jscoverage['/base.js'].branchData['139'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['139'][1].init(158, 66, 'scrollLeft <= min && deltaX > 0 || scrollLeft >= max && deltaX < 0');
function visit38_139_1(result) {
  _$jscoverage['/base.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['135'][1].init(981, 46, '(deltaX = e.deltaX) && self.allowScroll[\'left\']');
function visit37_135_1(result) {
  _$jscoverage['/base.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['129'][1].init(171, 21, 'isTouchEventSupported');
function visit36_129_1(result) {
  _$jscoverage['/base.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['125'][7].init(208, 10, 'deltaY < 0');
function visit35_125_7(result) {
  _$jscoverage['/base.js'].branchData['125'][7].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['125'][6].init(188, 16, 'scrollTop >= max');
function visit34_125_6(result) {
  _$jscoverage['/base.js'].branchData['125'][6].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['125'][5].init(188, 30, 'scrollTop >= max && deltaY < 0');
function visit33_125_5(result) {
  _$jscoverage['/base.js'].branchData['125'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['125'][4].init(174, 10, 'deltaY > 0');
function visit32_125_4(result) {
  _$jscoverage['/base.js'].branchData['125'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['125'][3].init(154, 16, 'scrollTop <= min');
function visit31_125_3(result) {
  _$jscoverage['/base.js'].branchData['125'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['125'][2].init(154, 30, 'scrollTop <= min && deltaY > 0');
function visit30_125_2(result) {
  _$jscoverage['/base.js'].branchData['125'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['125'][1].init(154, 64, 'scrollTop <= min && deltaY > 0 || scrollTop >= max && deltaY < 0');
function visit29_125_1(result) {
  _$jscoverage['/base.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['121'][1].init(368, 45, '(deltaY = e.deltaY) && self.allowScroll[\'top\']');
function visit28_121_1(result) {
  _$jscoverage['/base.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['109'][1].init(18, 20, 'this.get(\'disabled\')');
function visit27_109_1(result) {
  _$jscoverage['/base.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['96'][1].init(51, 18, 'control.scrollStep');
function visit26_96_1(result) {
  _$jscoverage['/base.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['86'][1].init(301, 23, 'keyCode == KeyCode.LEFT');
function visit25_86_1(result) {
  _$jscoverage['/base.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['83'][1].init(132, 24, 'keyCode == KeyCode.RIGHT');
function visit24_83_1(result) {
  _$jscoverage['/base.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['80'][1].init(1667, 6, 'allowX');
function visit23_80_1(result) {
  _$jscoverage['/base.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['75'][1].init(734, 26, 'keyCode == KeyCode.PAGE_UP');
function visit22_75_1(result) {
  _$jscoverage['/base.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['72'][1].init(562, 28, 'keyCode == KeyCode.PAGE_DOWN');
function visit21_72_1(result) {
  _$jscoverage['/base.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['69'][1].init(398, 21, 'keyCode == KeyCode.UP');
function visit20_69_1(result) {
  _$jscoverage['/base.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['64'][1].init(184, 23, 'keyCode == KeyCode.DOWN');
function visit19_64_1(result) {
  _$jscoverage['/base.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['60'][1].init(735, 6, 'allowY');
function visit18_60_1(result) {
  _$jscoverage['/base.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['50'][2].init(336, 20, 'nodeName == \'select\'');
function visit17_50_2(result) {
  _$jscoverage['/base.js'].branchData['50'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['50'][1].init(42, 75, 'nodeName == \'select\' || $target.hasAttr(\'contenteditable\')');
function visit16_50_1(result) {
  _$jscoverage['/base.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['49'][2].init(292, 22, 'nodeName == \'textarea\'');
function visit15_49_2(result) {
  _$jscoverage['/base.js'].branchData['49'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['49'][1].init(39, 118, 'nodeName == \'textarea\' || nodeName == \'select\' || $target.hasAttr(\'contenteditable\')');
function visit14_49_1(result) {
  _$jscoverage['/base.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['48'][2].init(250, 19, 'nodeName == \'input\'');
function visit13_48_2(result) {
  _$jscoverage['/base.js'].branchData['48'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['48'][1].init(250, 158, 'nodeName == \'input\' || nodeName == \'textarea\' || nodeName == \'select\' || $target.hasAttr(\'contenteditable\')');
function visit12_48_1(result) {
  _$jscoverage['/base.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['18'][1].init(255, 10, 'scrollLeft');
function visit11_18_1(result) {
  _$jscoverage['/base.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['15'][1].init(147, 9, 'scrollTop');
function visit10_15_1(result) {
  _$jscoverage['/base.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[5]++;
KISSY.add('scroll-view/base', function(S, Node, Anim, Container, Render, undefined) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[6]++;
  var $ = S.all, isTouchEventSupported = S.Features.isTouchEventSupported(), KeyCode = Node.KeyCode;
  _$jscoverage['/base.js'].lineData[10]++;
  function onElScroll() {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[11]++;
    var self = this, el = self.el, scrollTop = el.scrollTop, scrollLeft = el.scrollLeft;
    _$jscoverage['/base.js'].lineData[15]++;
    if (visit10_15_1(scrollTop)) {
      _$jscoverage['/base.js'].lineData[16]++;
      self.set('scrollTop', scrollTop + self.get('scrollTop'));
    }
    _$jscoverage['/base.js'].lineData[18]++;
    if (visit11_18_1(scrollLeft)) {
      _$jscoverage['/base.js'].lineData[19]++;
      self.set('scrollLeft', scrollLeft + self.get('scrollLeft'));
    }
    _$jscoverage['/base.js'].lineData[21]++;
    el.scrollTop = el.scrollLeft = 0;
  }
  _$jscoverage['/base.js'].lineData[24]++;
  function frame(anim, fx) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[25]++;
    anim.scrollView.set(fx.prop, fx.val);
  }
  _$jscoverage['/base.js'].lineData[28]++;
  return Container.extend({
  initializer: function() {
  _$jscoverage['/base.js'].functionData[3]++;
  _$jscoverage['/base.js'].lineData[30]++;
  this.scrollAnims = [];
}, 
  bindUI: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[34]++;
  var self = this, $el = self.$el;
  _$jscoverage['/base.js'].lineData[39]++;
  $el.on('mousewheel', self.handleMouseWheel, self).on('scroll', onElScroll, self);
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[44]++;
  var target = e.target, $target = $(target), nodeName = $target.nodeName();
  _$jscoverage['/base.js'].lineData[48]++;
  if (visit12_48_1(visit13_48_2(nodeName == 'input') || visit14_49_1(visit15_49_2(nodeName == 'textarea') || visit16_50_1(visit17_50_2(nodeName == 'select') || $target.hasAttr('contenteditable'))))) {
    _$jscoverage['/base.js'].lineData[52]++;
    return undefined;
  }
  _$jscoverage['/base.js'].lineData[54]++;
  var self = this, keyCode = e.keyCode, scrollStep = self.getScrollStep(), ok = undefined;
  _$jscoverage['/base.js'].lineData[58]++;
  var allowX = self.allowScroll['left'];
  _$jscoverage['/base.js'].lineData[59]++;
  var allowY = self.allowScroll['top'];
  _$jscoverage['/base.js'].lineData[60]++;
  if (visit18_60_1(allowY)) {
    _$jscoverage['/base.js'].lineData[61]++;
    var scrollStepY = scrollStep.top, clientHeight = self.clientHeight, scrollTop = self.get('scrollTop');
    _$jscoverage['/base.js'].lineData[64]++;
    if (visit19_64_1(keyCode == KeyCode.DOWN)) {
      _$jscoverage['/base.js'].lineData[65]++;
      self.scrollToWithBounds({
  top: scrollTop + scrollStepY});
      _$jscoverage['/base.js'].lineData[68]++;
      ok = true;
    } else {
      _$jscoverage['/base.js'].lineData[69]++;
      if (visit20_69_1(keyCode == KeyCode.UP)) {
        _$jscoverage['/base.js'].lineData[70]++;
        self.scrollToWithBounds({
  top: scrollTop - scrollStepY});
        _$jscoverage['/base.js'].lineData[71]++;
        ok = true;
      } else {
        _$jscoverage['/base.js'].lineData[72]++;
        if (visit21_72_1(keyCode == KeyCode.PAGE_DOWN)) {
          _$jscoverage['/base.js'].lineData[73]++;
          self.scrollToWithBounds({
  top: scrollTop + clientHeight});
          _$jscoverage['/base.js'].lineData[74]++;
          ok = true;
        } else {
          _$jscoverage['/base.js'].lineData[75]++;
          if (visit22_75_1(keyCode == KeyCode.PAGE_UP)) {
            _$jscoverage['/base.js'].lineData[76]++;
            self.scrollToWithBounds({
  top: scrollTop - clientHeight});
            _$jscoverage['/base.js'].lineData[77]++;
            ok = true;
          }
        }
      }
    }
  }
  _$jscoverage['/base.js'].lineData[80]++;
  if (visit23_80_1(allowX)) {
    _$jscoverage['/base.js'].lineData[81]++;
    var scrollStepX = scrollStep.left;
    _$jscoverage['/base.js'].lineData[82]++;
    var scrollLeft = self.get('scrollLeft');
    _$jscoverage['/base.js'].lineData[83]++;
    if (visit24_83_1(keyCode == KeyCode.RIGHT)) {
      _$jscoverage['/base.js'].lineData[84]++;
      self.scrollToWithBounds({
  left: scrollLeft + scrollStepX});
      _$jscoverage['/base.js'].lineData[85]++;
      ok = true;
    } else {
      _$jscoverage['/base.js'].lineData[86]++;
      if (visit25_86_1(keyCode == KeyCode.LEFT)) {
        _$jscoverage['/base.js'].lineData[87]++;
        self.scrollToWithBounds({
  left: scrollLeft - scrollStepX});
        _$jscoverage['/base.js'].lineData[88]++;
        ok = true;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[91]++;
  return ok;
}, 
  getScrollStep: function() {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[95]++;
  var control = this;
  _$jscoverage['/base.js'].lineData[96]++;
  if (visit26_96_1(control.scrollStep)) {
    _$jscoverage['/base.js'].lineData[97]++;
    return control.scrollStep;
  }
  _$jscoverage['/base.js'].lineData[99]++;
  var elDoc = $(this.get('el')[0].ownerDocument);
  _$jscoverage['/base.js'].lineData[100]++;
  var clientHeight = control.clientHeight;
  _$jscoverage['/base.js'].lineData[101]++;
  var clientWidth = control.clientWidth;
  _$jscoverage['/base.js'].lineData[102]++;
  return control.scrollStep = {
  top: Math.max(clientHeight * clientHeight * 0.7 / elDoc.height(), 20), 
  left: Math.max(clientWidth * clientWidth * 0.7 / elDoc.width(), 20)};
}, 
  handleMouseWheel: function(e) {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[109]++;
  if (visit27_109_1(this.get('disabled'))) {
    _$jscoverage['/base.js'].lineData[110]++;
    return;
  }
  _$jscoverage['/base.js'].lineData[112]++;
  var max, min, self = this, scrollStep = self.getScrollStep(), deltaY, deltaX, maxScroll = self.maxScroll, minScroll = self.minScroll;
  _$jscoverage['/base.js'].lineData[121]++;
  if (visit28_121_1((deltaY = e.deltaY) && self.allowScroll['top'])) {
    _$jscoverage['/base.js'].lineData[122]++;
    var scrollTop = self.get('scrollTop');
    _$jscoverage['/base.js'].lineData[123]++;
    max = maxScroll.top;
    _$jscoverage['/base.js'].lineData[124]++;
    min = minScroll.top;
    _$jscoverage['/base.js'].lineData[125]++;
    if (visit29_125_1(visit30_125_2(visit31_125_3(scrollTop <= min) && visit32_125_4(deltaY > 0)) || visit33_125_5(visit34_125_6(scrollTop >= max) && visit35_125_7(deltaY < 0)))) {
    } else {
      _$jscoverage['/base.js'].lineData[127]++;
      self.scrollToWithBounds({
  top: scrollTop - e.deltaY * scrollStep['top']});
      _$jscoverage['/base.js'].lineData[129]++;
      if (visit36_129_1(isTouchEventSupported)) {
        _$jscoverage['/base.js'].lineData[130]++;
        e.preventDefault();
      }
    }
  }
  _$jscoverage['/base.js'].lineData[135]++;
  if (visit37_135_1((deltaX = e.deltaX) && self.allowScroll['left'])) {
    _$jscoverage['/base.js'].lineData[136]++;
    var scrollLeft = self.get('scrollLeft');
    _$jscoverage['/base.js'].lineData[137]++;
    max = maxScroll.left;
    _$jscoverage['/base.js'].lineData[138]++;
    min = minScroll.left;
    _$jscoverage['/base.js'].lineData[139]++;
    if (visit38_139_1(visit39_139_2(visit40_139_3(scrollLeft <= min) && visit41_139_4(deltaX > 0)) || visit42_139_5(visit43_139_6(scrollLeft >= max) && visit44_139_7(deltaX < 0)))) {
    } else {
      _$jscoverage['/base.js'].lineData[141]++;
      self.scrollToWithBounds({
  left: scrollLeft - e.deltaX * scrollStep['left']});
      _$jscoverage['/base.js'].lineData[142]++;
      if (visit45_142_1(isTouchEventSupported)) {
        _$jscoverage['/base.js'].lineData[143]++;
        e.preventDefault();
      }
    }
  }
}, 
  'isAxisEnabled': function(axis) {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[150]++;
  return this.allowScroll[visit46_150_1(axis == 'x') ? 'left' : 'top'];
}, 
  stopAnimation: function() {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[154]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[155]++;
  if (visit47_155_1(self.scrollAnims.length)) {
    _$jscoverage['/base.js'].lineData[156]++;
    S.each(self.scrollAnims, function(scrollAnim) {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[157]++;
  scrollAnim.stop();
});
    _$jscoverage['/base.js'].lineData[159]++;
    self.scrollAnims = [];
  }
  _$jscoverage['/base.js'].lineData[161]++;
  self.scrollToWithBounds({
  left: self.get('scrollLeft'), 
  top: self.get('scrollTop')});
}, 
  '_uiSetPageIndex': function(v) {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[168]++;
  this.scrollToPage(v);
}, 
  _getPageIndexFromXY: function(v, allowX, direction) {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[172]++;
  var pagesOffset = this.pagesOffset.concat([]);
  _$jscoverage['/base.js'].lineData[173]++;
  var p2 = allowX ? 'left' : 'top';
  _$jscoverage['/base.js'].lineData[174]++;
  var i, offset;
  _$jscoverage['/base.js'].lineData[175]++;
  pagesOffset.sort(function(e1, e2) {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[176]++;
  return e1[p2] - e2[p2];
});
  _$jscoverage['/base.js'].lineData[178]++;
  if (visit48_178_1(direction > 0)) {
    _$jscoverage['/base.js'].lineData[179]++;
    for (i = 0; visit49_179_1(i < pagesOffset.length); i++) {
      _$jscoverage['/base.js'].lineData[180]++;
      offset = pagesOffset[i];
      _$jscoverage['/base.js'].lineData[181]++;
      if (visit50_181_1(offset[p2] >= v)) {
        _$jscoverage['/base.js'].lineData[182]++;
        return offset.index;
      }
    }
  } else {
    _$jscoverage['/base.js'].lineData[186]++;
    for (i = pagesOffset.length - 1; visit51_186_1(i >= 0); i--) {
      _$jscoverage['/base.js'].lineData[187]++;
      offset = pagesOffset[i];
      _$jscoverage['/base.js'].lineData[188]++;
      if (visit52_188_1(offset[p2] <= v)) {
        _$jscoverage['/base.js'].lineData[189]++;
        return offset.index;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[193]++;
  return undefined;
}, 
  scrollToPage: function(index, animCfg) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[197]++;
  var self = this, pageOffset;
  _$jscoverage['/base.js'].lineData[199]++;
  if (visit53_199_1((pageOffset = self.pagesOffset) && pageOffset[index])) {
    _$jscoverage['/base.js'].lineData[200]++;
    self.set('pageIndex', index);
    _$jscoverage['/base.js'].lineData[201]++;
    self.scrollTo(pageOffset[index], animCfg);
  }
}, 
  scrollToWithBounds: function(cfg, anim) {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[206]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[207]++;
  var maxScroll = self.maxScroll;
  _$jscoverage['/base.js'].lineData[208]++;
  var minScroll = self.minScroll;
  _$jscoverage['/base.js'].lineData[209]++;
  if (visit54_209_1(cfg.left)) {
    _$jscoverage['/base.js'].lineData[210]++;
    cfg.left = Math.min(Math.max(cfg.left, minScroll.left), maxScroll.left);
  }
  _$jscoverage['/base.js'].lineData[212]++;
  if (visit55_212_1(cfg.top)) {
    _$jscoverage['/base.js'].lineData[213]++;
    cfg.top = Math.min(Math.max(cfg.top, minScroll.top), maxScroll.top);
  }
  _$jscoverage['/base.js'].lineData[215]++;
  self.scrollTo(cfg, anim);
}, 
  scrollTo: function(cfg, animCfg) {
  _$jscoverage['/base.js'].functionData[16]++;
  _$jscoverage['/base.js'].lineData[219]++;
  var self = this, left = cfg.left, top = cfg.top;
  _$jscoverage['/base.js'].lineData[222]++;
  if (visit56_222_1(animCfg)) {
    _$jscoverage['/base.js'].lineData[223]++;
    var scrollLeft = self.get('scrollLeft'), scrollTop = self.get('scrollTop'), node = {}, to = {};
    _$jscoverage['/base.js'].lineData[227]++;
    if (visit57_227_1(left !== undefined)) {
      _$jscoverage['/base.js'].lineData[228]++;
      to.scrollLeft = left;
      _$jscoverage['/base.js'].lineData[229]++;
      node.scrollLeft = self.get('scrollLeft');
    }
    _$jscoverage['/base.js'].lineData[231]++;
    if (visit58_231_1(top !== undefined)) {
      _$jscoverage['/base.js'].lineData[232]++;
      to.scrollTop = top;
      _$jscoverage['/base.js'].lineData[233]++;
      node.scrollTop = self.get('scrollTop');
    }
    _$jscoverage['/base.js'].lineData[235]++;
    animCfg.frame = frame;
    _$jscoverage['/base.js'].lineData[236]++;
    animCfg.node = node;
    _$jscoverage['/base.js'].lineData[237]++;
    animCfg.to = to;
    _$jscoverage['/base.js'].lineData[238]++;
    var anim;
    _$jscoverage['/base.js'].lineData[239]++;
    self.scrollAnims.push(anim = new Anim(animCfg));
    _$jscoverage['/base.js'].lineData[240]++;
    anim.scrollView = self;
    _$jscoverage['/base.js'].lineData[241]++;
    anim.run();
  } else {
    _$jscoverage['/base.js'].lineData[243]++;
    if (visit59_243_1(left !== undefined)) {
      _$jscoverage['/base.js'].lineData[244]++;
      self.set('scrollLeft', left);
    }
    _$jscoverage['/base.js'].lineData[246]++;
    if (visit60_246_1(top !== undefined)) {
      _$jscoverage['/base.js'].lineData[247]++;
      self.set('scrollTop', top);
    }
  }
}}, {
  ATTRS: {
  contentEl: {}, 
  scrollLeft: {
  view: 1, 
  value: 0}, 
  scrollTop: {
  view: 1, 
  value: 0}, 
  focusable: {
  value: !isTouchEventSupported}, 
  allowTextSelection: {
  value: true}, 
  handleMouseEvents: {
  value: false}, 
  snap: {
  value: false}, 
  snapDuration: {
  value: 0.3}, 
  snapEasing: {
  value: 'easeOut'}, 
  pageIndex: {
  value: 0}, 
  xrender: {
  value: Render}}, 
  xclass: 'scroll-view'});
}, {
  requires: ['node', 'anim', 'component/container', './base/render']});
