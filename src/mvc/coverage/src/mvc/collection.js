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
if (! _$jscoverage['/mvc/collection.js']) {
  _$jscoverage['/mvc/collection.js'] = {};
  _$jscoverage['/mvc/collection.js'].lineData = [];
  _$jscoverage['/mvc/collection.js'].lineData[6] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[7] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[8] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[10] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[11] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[12] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[13] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[14] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[15] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[16] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[17] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[21] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[29] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[34] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[35] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[36] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[37] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[47] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[48] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[59] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[61] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[62] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[63] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[64] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[65] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[68] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[70] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[80] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[81] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[82] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[83] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[84] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[86] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[87] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[96] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[100] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[101] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[102] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[104] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[105] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[109] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[121] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[122] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[123] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[127] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[128] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[129] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[130] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[131] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[135] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[136] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[138] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[140] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[141] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[154] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[155] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[156] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[157] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[158] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[159] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[160] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[161] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[162] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[164] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[166] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[170] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[171] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[172] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[173] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[174] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[175] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[176] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[177] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[182] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[190] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[191] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[192] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[193] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[194] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[196] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[197] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[208] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[209] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[210] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[211] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[212] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[215] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[223] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[224] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[225] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[226] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[227] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[230] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[252] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[253] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[254] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[255] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[279] = 0;
  _$jscoverage['/mvc/collection.js'].lineData[289] = 0;
}
if (! _$jscoverage['/mvc/collection.js'].functionData) {
  _$jscoverage['/mvc/collection.js'].functionData = [];
  _$jscoverage['/mvc/collection.js'].functionData[0] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[1] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[2] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[3] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[4] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[5] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[6] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[7] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[8] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[9] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[10] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[11] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[12] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[13] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[14] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[15] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[16] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[17] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[18] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[19] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[20] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[21] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[22] = 0;
  _$jscoverage['/mvc/collection.js'].functionData[23] = 0;
}
if (! _$jscoverage['/mvc/collection.js'].branchData) {
  _$jscoverage['/mvc/collection.js'].branchData = {};
  _$jscoverage['/mvc/collection.js'].branchData['12'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['14'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['16'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['35'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['61'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['65'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['81'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['86'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['101'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['109'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['122'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['128'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['130'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['138'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['155'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['157'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['162'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['171'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['172'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['176'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['190'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['192'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['196'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['209'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['211'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['224'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/mvc/collection.js'].branchData['226'] = [];
  _$jscoverage['/mvc/collection.js'].branchData['226'][1] = new BranchData();
}
_$jscoverage['/mvc/collection.js'].branchData['226'][1].init(60, 29, 'model.get("clientId") === cid');
function visit27_226_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['224'][1].init(74, 17, 'i < models.length');
function visit26_224_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['211'][1].init(60, 20, 'model.getId() === id');
function visit25_211_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['209'][1].init(74, 17, 'i < models.length');
function visit24_209_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['196'][1].init(258, 15, '!opts[\'silent\']');
function visit23_196_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['192'][1].init(110, 11, 'index != -1');
function visit22_192_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['190'][1].init(20, 10, 'opts || {}');
function visit21_190_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['176'][1].init(256, 15, '!opts[\'silent\']');
function visit20_176_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['172'][1].init(24, 10, 'opts || {}');
function visit19_172_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['171'][1].init(61, 5, 'model');
function visit18_171_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['162'][1].init(64, 20, 'success && success()');
function visit17_162_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['157'][1].init(121, 5, 'model');
function visit16_157_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['155'][1].init(49, 10, 'opts || {}');
function visit15_155_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['138'][1].init(414, 41, 'success && success.apply(this, arguments)');
function visit14_138_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['130'][1].init(89, 1, 'v');
function visit13_130_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['128'][1].init(21, 4, 'resp');
function visit12_128_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['122'][1].init(49, 10, 'opts || {}');
function visit11_122_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['109'][1].init(337, 12, 'ret && model');
function visit10_109_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['101'][1].init(45, 25, '!(model instanceof Model)');
function visit9_101_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['86'][1].init(242, 5, 'model');
function visit8_86_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['81'][1].init(46, 16, 'S.isArray(model)');
function visit7_81_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['65'][1].init(75, 8, 'ret && t');
function visit6_65_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['61'][1].init(74, 16, 'S.isArray(model)');
function visit5_61_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['35'][1].init(70, 10, 'comparator');
function visit4_35_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['16'][1].init(67, 6, 'k < k2');
function visit3_16_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['14'][1].init(62, 15, 'i < mods.length');
function visit2_14_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].branchData['12'][1].init(42, 10, 'comparator');
function visit1_12_1(result) {
  _$jscoverage['/mvc/collection.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/collection.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/mvc/collection.js'].functionData[0]++;
  _$jscoverage['/mvc/collection.js'].lineData[7]++;
  var Model = require('./model');
  _$jscoverage['/mvc/collection.js'].lineData[8]++;
  var Attribute = require('attribute');
  _$jscoverage['/mvc/collection.js'].lineData[10]++;
  function findModelIndex(mods, mod, comparator) {
    _$jscoverage['/mvc/collection.js'].functionData[1]++;
    _$jscoverage['/mvc/collection.js'].lineData[11]++;
    var i = mods.length;
    _$jscoverage['/mvc/collection.js'].lineData[12]++;
    if (visit1_12_1(comparator)) {
      _$jscoverage['/mvc/collection.js'].lineData[13]++;
      var k = comparator(mod);
      _$jscoverage['/mvc/collection.js'].lineData[14]++;
      for (i = 0; visit2_14_1(i < mods.length); i++) {
        _$jscoverage['/mvc/collection.js'].lineData[15]++;
        var k2 = comparator(mods[i]);
        _$jscoverage['/mvc/collection.js'].lineData[16]++;
        if (visit3_16_1(k < k2)) {
          _$jscoverage['/mvc/collection.js'].lineData[17]++;
          break;
        }
      }
    }
    _$jscoverage['/mvc/collection.js'].lineData[21]++;
    return i;
  }
  _$jscoverage['/mvc/collection.js'].lineData[29]++;
  return Attribute.extend({
  sort: function() {
  _$jscoverage['/mvc/collection.js'].functionData[2]++;
  _$jscoverage['/mvc/collection.js'].lineData[34]++;
  var comparator = this.get("comparator");
  _$jscoverage['/mvc/collection.js'].lineData[35]++;
  if (visit4_35_1(comparator)) {
    _$jscoverage['/mvc/collection.js'].lineData[36]++;
    this.get("models").sort(function(a, b) {
  _$jscoverage['/mvc/collection.js'].functionData[3]++;
  _$jscoverage['/mvc/collection.js'].lineData[37]++;
  return comparator(a) - comparator(b);
});
  }
}, 
  toJSON: function() {
  _$jscoverage['/mvc/collection.js'].functionData[4]++;
  _$jscoverage['/mvc/collection.js'].lineData[47]++;
  return S.map(this.get("models"), function(m) {
  _$jscoverage['/mvc/collection.js'].functionData[5]++;
  _$jscoverage['/mvc/collection.js'].lineData[48]++;
  return m.toJSON();
});
}, 
  add: function(model, opts) {
  _$jscoverage['/mvc/collection.js'].functionData[6]++;
  _$jscoverage['/mvc/collection.js'].lineData[59]++;
  var self = this, ret = true;
  _$jscoverage['/mvc/collection.js'].lineData[61]++;
  if (visit5_61_1(S.isArray(model))) {
    _$jscoverage['/mvc/collection.js'].lineData[62]++;
    var orig = [].concat(model);
    _$jscoverage['/mvc/collection.js'].lineData[63]++;
    S.each(orig, function(m) {
  _$jscoverage['/mvc/collection.js'].functionData[7]++;
  _$jscoverage['/mvc/collection.js'].lineData[64]++;
  var t = self._add(m, opts);
  _$jscoverage['/mvc/collection.js'].lineData[65]++;
  ret = visit6_65_1(ret && t);
});
  } else {
    _$jscoverage['/mvc/collection.js'].lineData[68]++;
    ret = self._add(model, opts);
  }
  _$jscoverage['/mvc/collection.js'].lineData[70]++;
  return ret;
}, 
  remove: function(model, opts) {
  _$jscoverage['/mvc/collection.js'].functionData[8]++;
  _$jscoverage['/mvc/collection.js'].lineData[80]++;
  var self = this;
  _$jscoverage['/mvc/collection.js'].lineData[81]++;
  if (visit7_81_1(S.isArray(model))) {
    _$jscoverage['/mvc/collection.js'].lineData[82]++;
    var orig = [].concat(model);
    _$jscoverage['/mvc/collection.js'].lineData[83]++;
    S.each(orig, function(m) {
  _$jscoverage['/mvc/collection.js'].functionData[9]++;
  _$jscoverage['/mvc/collection.js'].lineData[84]++;
  self._remove(m, opts);
});
  } else {
    _$jscoverage['/mvc/collection.js'].lineData[86]++;
    if (visit8_86_1(model)) {
      _$jscoverage['/mvc/collection.js'].lineData[87]++;
      self._remove(model, opts);
    }
  }
}, 
  at: function(i) {
  _$jscoverage['/mvc/collection.js'].functionData[10]++;
  _$jscoverage['/mvc/collection.js'].lineData[96]++;
  return this.get("models")[i];
}, 
  _normModel: function(model) {
  _$jscoverage['/mvc/collection.js'].functionData[11]++;
  _$jscoverage['/mvc/collection.js'].lineData[100]++;
  var ret = true;
  _$jscoverage['/mvc/collection.js'].lineData[101]++;
  if (visit9_101_1(!(model instanceof Model))) {
    _$jscoverage['/mvc/collection.js'].lineData[102]++;
    var data = model, modelConstructor = this.get("model");
    _$jscoverage['/mvc/collection.js'].lineData[104]++;
    model = new modelConstructor();
    _$jscoverage['/mvc/collection.js'].lineData[105]++;
    ret = model.set(data, {
  silent: 1});
  }
  _$jscoverage['/mvc/collection.js'].lineData[109]++;
  return visit10_109_1(ret && model);
}, 
  load: function(opts) {
  _$jscoverage['/mvc/collection.js'].functionData[12]++;
  _$jscoverage['/mvc/collection.js'].lineData[121]++;
  var self = this;
  _$jscoverage['/mvc/collection.js'].lineData[122]++;
  opts = visit11_122_1(opts || {});
  _$jscoverage['/mvc/collection.js'].lineData[123]++;
  var success = opts.success;
  _$jscoverage['/mvc/collection.js'].lineData[127]++;
  opts.success = function(resp) {
  _$jscoverage['/mvc/collection.js'].functionData[13]++;
  _$jscoverage['/mvc/collection.js'].lineData[128]++;
  if (visit12_128_1(resp)) {
    _$jscoverage['/mvc/collection.js'].lineData[129]++;
    var v = self.get("parse").call(self, resp);
    _$jscoverage['/mvc/collection.js'].lineData[130]++;
    if (visit13_130_1(v)) {
      _$jscoverage['/mvc/collection.js'].lineData[131]++;
      self.set("models", v, opts);
    }
  }
  _$jscoverage['/mvc/collection.js'].lineData[135]++;
  S.each(self.get("models"), function(m) {
  _$jscoverage['/mvc/collection.js'].functionData[14]++;
  _$jscoverage['/mvc/collection.js'].lineData[136]++;
  m.__isModified = 0;
});
  _$jscoverage['/mvc/collection.js'].lineData[138]++;
  visit14_138_1(success && success.apply(this, arguments));
};
  _$jscoverage['/mvc/collection.js'].lineData[140]++;
  self.get("sync").call(self, self, 'read', opts);
  _$jscoverage['/mvc/collection.js'].lineData[141]++;
  return self;
}, 
  create: function(model, opts) {
  _$jscoverage['/mvc/collection.js'].functionData[15]++;
  _$jscoverage['/mvc/collection.js'].lineData[154]++;
  var self = this;
  _$jscoverage['/mvc/collection.js'].lineData[155]++;
  opts = visit15_155_1(opts || {});
  _$jscoverage['/mvc/collection.js'].lineData[156]++;
  model = this._normModel(model);
  _$jscoverage['/mvc/collection.js'].lineData[157]++;
  if (visit16_157_1(model)) {
    _$jscoverage['/mvc/collection.js'].lineData[158]++;
    model.addToCollection(self);
    _$jscoverage['/mvc/collection.js'].lineData[159]++;
    var success = opts.success;
    _$jscoverage['/mvc/collection.js'].lineData[160]++;
    opts.success = function() {
  _$jscoverage['/mvc/collection.js'].functionData[16]++;
  _$jscoverage['/mvc/collection.js'].lineData[161]++;
  self.add(model, opts);
  _$jscoverage['/mvc/collection.js'].lineData[162]++;
  visit17_162_1(success && success());
};
    _$jscoverage['/mvc/collection.js'].lineData[164]++;
    model.save(opts);
  }
  _$jscoverage['/mvc/collection.js'].lineData[166]++;
  return model;
}, 
  _add: function(model, opts) {
  _$jscoverage['/mvc/collection.js'].functionData[17]++;
  _$jscoverage['/mvc/collection.js'].lineData[170]++;
  model = this._normModel(model);
  _$jscoverage['/mvc/collection.js'].lineData[171]++;
  if (visit18_171_1(model)) {
    _$jscoverage['/mvc/collection.js'].lineData[172]++;
    opts = visit19_172_1(opts || {});
    _$jscoverage['/mvc/collection.js'].lineData[173]++;
    var index = findModelIndex(this.get("models"), model, this.get("comparator"));
    _$jscoverage['/mvc/collection.js'].lineData[174]++;
    this.get("models").splice(index, 0, model);
    _$jscoverage['/mvc/collection.js'].lineData[175]++;
    model.addToCollection(this);
    _$jscoverage['/mvc/collection.js'].lineData[176]++;
    if (visit20_176_1(!opts['silent'])) {
      _$jscoverage['/mvc/collection.js'].lineData[177]++;
      this.fire("add", {
  model: model});
    }
  }
  _$jscoverage['/mvc/collection.js'].lineData[182]++;
  return model;
}, 
  _remove: function(model, opts) {
  _$jscoverage['/mvc/collection.js'].functionData[18]++;
  _$jscoverage['/mvc/collection.js'].lineData[190]++;
  opts = visit21_190_1(opts || {});
  _$jscoverage['/mvc/collection.js'].lineData[191]++;
  var index = S.indexOf(model, this.get("models"));
  _$jscoverage['/mvc/collection.js'].lineData[192]++;
  if (visit22_192_1(index != -1)) {
    _$jscoverage['/mvc/collection.js'].lineData[193]++;
    this.get("models").splice(index, 1);
    _$jscoverage['/mvc/collection.js'].lineData[194]++;
    model.removeFromCollection(this);
  }
  _$jscoverage['/mvc/collection.js'].lineData[196]++;
  if (visit23_196_1(!opts['silent'])) {
    _$jscoverage['/mvc/collection.js'].lineData[197]++;
    this.fire("remove", {
  model: model});
  }
}, 
  getById: function(id) {
  _$jscoverage['/mvc/collection.js'].functionData[19]++;
  _$jscoverage['/mvc/collection.js'].lineData[208]++;
  var models = this.get("models");
  _$jscoverage['/mvc/collection.js'].lineData[209]++;
  for (var i = 0; visit24_209_1(i < models.length); i++) {
    _$jscoverage['/mvc/collection.js'].lineData[210]++;
    var model = models[i];
    _$jscoverage['/mvc/collection.js'].lineData[211]++;
    if (visit25_211_1(model.getId() === id)) {
      _$jscoverage['/mvc/collection.js'].lineData[212]++;
      return model;
    }
  }
  _$jscoverage['/mvc/collection.js'].lineData[215]++;
  return null;
}, 
  getByCid: function(cid) {
  _$jscoverage['/mvc/collection.js'].functionData[20]++;
  _$jscoverage['/mvc/collection.js'].lineData[223]++;
  var models = this.get("models");
  _$jscoverage['/mvc/collection.js'].lineData[224]++;
  for (var i = 0; visit26_224_1(i < models.length); i++) {
    _$jscoverage['/mvc/collection.js'].lineData[225]++;
    var model = models[i];
    _$jscoverage['/mvc/collection.js'].lineData[226]++;
    if (visit27_226_1(model.get("clientId") === cid)) {
      _$jscoverage['/mvc/collection.js'].lineData[227]++;
      return model;
    }
  }
  _$jscoverage['/mvc/collection.js'].lineData[230]++;
  return null;
}}, {
  ATTRS: {
  model: {
  value: Model}, 
  models: {
  setter: function(models) {
  _$jscoverage['/mvc/collection.js'].functionData[21]++;
  _$jscoverage['/mvc/collection.js'].lineData[252]++;
  var prev = this.get("models");
  _$jscoverage['/mvc/collection.js'].lineData[253]++;
  this.remove(prev, {
  silent: 1});
  _$jscoverage['/mvc/collection.js'].lineData[254]++;
  this.add(models, {
  silent: 1});
  _$jscoverage['/mvc/collection.js'].lineData[255]++;
  return this.get("models");
}, 
  value: []}, 
  url: {
  value: ""}, 
  comparator: {}, 
  sync: {
  value: function() {
  _$jscoverage['/mvc/collection.js'].functionData[22]++;
  _$jscoverage['/mvc/collection.js'].lineData[279]++;
  S.require("mvc").sync.apply(this, arguments);
}}, 
  parse: {
  value: function(resp) {
  _$jscoverage['/mvc/collection.js'].functionData[23]++;
  _$jscoverage['/mvc/collection.js'].lineData[289]++;
  return resp;
}}}});
});
