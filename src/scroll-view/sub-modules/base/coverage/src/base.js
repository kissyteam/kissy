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
  _$jscoverage['/base.js'].lineData[7] = 0;
  _$jscoverage['/base.js'].lineData[11] = 0;
  _$jscoverage['/base.js'].lineData[12] = 0;
  _$jscoverage['/base.js'].lineData[16] = 0;
  _$jscoverage['/base.js'].lineData[17] = 0;
  _$jscoverage['/base.js'].lineData[19] = 0;
  _$jscoverage['/base.js'].lineData[20] = 0;
  _$jscoverage['/base.js'].lineData[22] = 0;
  _$jscoverage['/base.js'].lineData[25] = 0;
  _$jscoverage['/base.js'].lineData[28] = 0;
  _$jscoverage['/base.js'].lineData[33] = 0;
  _$jscoverage['/base.js'].lineData[38] = 0;
  _$jscoverage['/base.js'].lineData[42] = 0;
  _$jscoverage['/base.js'].lineData[46] = 0;
  _$jscoverage['/base.js'].lineData[48] = 0;
  _$jscoverage['/base.js'].lineData[52] = 0;
  _$jscoverage['/base.js'].lineData[53] = 0;
  _$jscoverage['/base.js'].lineData[54] = 0;
  _$jscoverage['/base.js'].lineData[55] = 0;
  _$jscoverage['/base.js'].lineData[58] = 0;
  _$jscoverage['/base.js'].lineData[59] = 0;
  _$jscoverage['/base.js'].lineData[62] = 0;
  _$jscoverage['/base.js'].lineData[63] = 0;
  _$jscoverage['/base.js'].lineData[64] = 0;
  _$jscoverage['/base.js'].lineData[65] = 0;
  _$jscoverage['/base.js'].lineData[66] = 0;
  _$jscoverage['/base.js'].lineData[67] = 0;
  _$jscoverage['/base.js'].lineData[68] = 0;
  _$jscoverage['/base.js'].lineData[69] = 0;
  _$jscoverage['/base.js'].lineData[70] = 0;
  _$jscoverage['/base.js'].lineData[71] = 0;
  _$jscoverage['/base.js'].lineData[74] = 0;
  _$jscoverage['/base.js'].lineData[75] = 0;
  _$jscoverage['/base.js'].lineData[76] = 0;
  _$jscoverage['/base.js'].lineData[77] = 0;
  _$jscoverage['/base.js'].lineData[78] = 0;
  _$jscoverage['/base.js'].lineData[79] = 0;
  _$jscoverage['/base.js'].lineData[80] = 0;
  _$jscoverage['/base.js'].lineData[81] = 0;
  _$jscoverage['/base.js'].lineData[82] = 0;
  _$jscoverage['/base.js'].lineData[85] = 0;
  _$jscoverage['/base.js'].lineData[89] = 0;
  _$jscoverage['/base.js'].lineData[90] = 0;
  _$jscoverage['/base.js'].lineData[91] = 0;
  _$jscoverage['/base.js'].lineData[93] = 0;
  _$jscoverage['/base.js'].lineData[94] = 0;
  _$jscoverage['/base.js'].lineData[95] = 0;
  _$jscoverage['/base.js'].lineData[96] = 0;
  _$jscoverage['/base.js'].lineData[103] = 0;
  _$jscoverage['/base.js'].lineData[104] = 0;
  _$jscoverage['/base.js'].lineData[106] = 0;
  _$jscoverage['/base.js'].lineData[115] = 0;
  _$jscoverage['/base.js'].lineData[116] = 0;
  _$jscoverage['/base.js'].lineData[117] = 0;
  _$jscoverage['/base.js'].lineData[118] = 0;
  _$jscoverage['/base.js'].lineData[119] = 0;
  _$jscoverage['/base.js'].lineData[121] = 0;
  _$jscoverage['/base.js'].lineData[122] = 0;
  _$jscoverage['/base.js'].lineData[126] = 0;
  _$jscoverage['/base.js'].lineData[127] = 0;
  _$jscoverage['/base.js'].lineData[128] = 0;
  _$jscoverage['/base.js'].lineData[129] = 0;
  _$jscoverage['/base.js'].lineData[130] = 0;
  _$jscoverage['/base.js'].lineData[132] = 0;
  _$jscoverage['/base.js'].lineData[133] = 0;
  _$jscoverage['/base.js'].lineData[139] = 0;
  _$jscoverage['/base.js'].lineData[143] = 0;
  _$jscoverage['/base.js'].lineData[144] = 0;
  _$jscoverage['/base.js'].lineData[145] = 0;
  _$jscoverage['/base.js'].lineData[152] = 0;
  _$jscoverage['/base.js'].lineData[156] = 0;
  _$jscoverage['/base.js'].lineData[157] = 0;
  _$jscoverage['/base.js'].lineData[158] = 0;
  _$jscoverage['/base.js'].lineData[159] = 0;
  _$jscoverage['/base.js'].lineData[160] = 0;
  _$jscoverage['/base.js'].lineData[162] = 0;
  _$jscoverage['/base.js'].lineData[163] = 0;
  _$jscoverage['/base.js'].lineData[164] = 0;
  _$jscoverage['/base.js'].lineData[165] = 0;
  _$jscoverage['/base.js'].lineData[166] = 0;
  _$jscoverage['/base.js'].lineData[170] = 0;
  _$jscoverage['/base.js'].lineData[171] = 0;
  _$jscoverage['/base.js'].lineData[172] = 0;
  _$jscoverage['/base.js'].lineData[173] = 0;
  _$jscoverage['/base.js'].lineData[177] = 0;
  _$jscoverage['/base.js'].lineData[181] = 0;
  _$jscoverage['/base.js'].lineData[183] = 0;
  _$jscoverage['/base.js'].lineData[184] = 0;
  _$jscoverage['/base.js'].lineData[185] = 0;
  _$jscoverage['/base.js'].lineData[190] = 0;
  _$jscoverage['/base.js'].lineData[191] = 0;
  _$jscoverage['/base.js'].lineData[192] = 0;
  _$jscoverage['/base.js'].lineData[193] = 0;
  _$jscoverage['/base.js'].lineData[194] = 0;
  _$jscoverage['/base.js'].lineData[196] = 0;
  _$jscoverage['/base.js'].lineData[197] = 0;
  _$jscoverage['/base.js'].lineData[199] = 0;
  _$jscoverage['/base.js'].lineData[203] = 0;
  _$jscoverage['/base.js'].lineData[204] = 0;
  _$jscoverage['/base.js'].lineData[207] = 0;
  _$jscoverage['/base.js'].lineData[208] = 0;
  _$jscoverage['/base.js'].lineData[215] = 0;
  _$jscoverage['/base.js'].lineData[216] = 0;
  _$jscoverage['/base.js'].lineData[219] = 0;
  _$jscoverage['/base.js'].lineData[220] = 0;
  _$jscoverage['/base.js'].lineData[227] = 0;
  _$jscoverage['/base.js'].lineData[229] = 0;
  _$jscoverage['/base.js'].lineData[230] = 0;
  _$jscoverage['/base.js'].lineData[232] = 0;
  _$jscoverage['/base.js'].lineData[233] = 0;
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
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['16'] = [];
  _$jscoverage['/base.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['19'] = [];
  _$jscoverage['/base.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['42'] = [];
  _$jscoverage['/base.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['42'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['43'] = [];
  _$jscoverage['/base.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['43'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['44'] = [];
  _$jscoverage['/base.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['44'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['54'] = [];
  _$jscoverage['/base.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['58'] = [];
  _$jscoverage['/base.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['63'] = [];
  _$jscoverage['/base.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['66'] = [];
  _$jscoverage['/base.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['69'] = [];
  _$jscoverage['/base.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['74'] = [];
  _$jscoverage['/base.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['77'] = [];
  _$jscoverage['/base.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['80'] = [];
  _$jscoverage['/base.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['90'] = [];
  _$jscoverage['/base.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['103'] = [];
  _$jscoverage['/base.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['115'] = [];
  _$jscoverage['/base.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['119'] = [];
  _$jscoverage['/base.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['119'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['119'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['119'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['119'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['119'][6] = new BranchData();
  _$jscoverage['/base.js'].branchData['119'][7] = new BranchData();
  _$jscoverage['/base.js'].branchData['126'] = [];
  _$jscoverage['/base.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['130'] = [];
  _$jscoverage['/base.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['130'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['130'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['130'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['130'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['130'][6] = new BranchData();
  _$jscoverage['/base.js'].branchData['130'][7] = new BranchData();
  _$jscoverage['/base.js'].branchData['139'] = [];
  _$jscoverage['/base.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['162'] = [];
  _$jscoverage['/base.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['163'] = [];
  _$jscoverage['/base.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['165'] = [];
  _$jscoverage['/base.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['170'] = [];
  _$jscoverage['/base.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['172'] = [];
  _$jscoverage['/base.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['183'] = [];
  _$jscoverage['/base.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['193'] = [];
  _$jscoverage['/base.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['196'] = [];
  _$jscoverage['/base.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['207'] = [];
  _$jscoverage['/base.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['215'] = [];
  _$jscoverage['/base.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['219'] = [];
  _$jscoverage['/base.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['229'] = [];
  _$jscoverage['/base.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['232'] = [];
  _$jscoverage['/base.js'].branchData['232'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['232'][1].init(135, 17, 'top !== undefined');
function visit57_232_1(result) {
  _$jscoverage['/base.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['229'][1].init(22, 18, 'left !== undefined');
function visit56_229_1(result) {
  _$jscoverage['/base.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['219'][1].init(297, 17, 'top !== undefined');
function visit55_219_1(result) {
  _$jscoverage['/base.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['215'][1].init(42, 18, 'left !== undefined');
function visit54_215_1(result) {
  _$jscoverage['/base.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['207'][1].init(116, 4, 'anim');
function visit53_207_1(result) {
  _$jscoverage['/base.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['196'][1].init(272, 7, 'cfg.top');
function visit52_196_1(result) {
  _$jscoverage['/base.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['193'][1].init(138, 8, 'cfg.left');
function visit51_193_1(result) {
  _$jscoverage['/base.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['183'][1].init(78, 51, '(pageOffset = self.pagesOffset) && pageOffset[index]');
function visit50_183_1(result) {
  _$jscoverage['/base.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['172'][1].init(72, 15, 'offset[p2] <= v');
function visit49_172_1(result) {
  _$jscoverage['/base.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['170'][1].init(51, 6, 'i >= 0');
function visit48_170_1(result) {
  _$jscoverage['/base.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['165'][1].init(72, 15, 'offset[p2] >= v');
function visit47_165_1(result) {
  _$jscoverage['/base.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['163'][1].init(30, 22, 'i < pagesOffset.length');
function visit46_163_1(result) {
  _$jscoverage['/base.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['162'][1].init(261, 13, 'direction > 0');
function visit45_162_1(result) {
  _$jscoverage['/base.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['139'][1].init(38, 11, 'axis == \'x\'');
function visit44_139_1(result) {
  _$jscoverage['/base.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['130'][7].init(214, 10, 'deltaX < 0');
function visit43_130_7(result) {
  _$jscoverage['/base.js'].branchData['130'][7].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['130'][6].init(193, 17, 'scrollLeft >= max');
function visit42_130_6(result) {
  _$jscoverage['/base.js'].branchData['130'][6].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['130'][5].init(193, 31, 'scrollLeft >= max && deltaX < 0');
function visit41_130_5(result) {
  _$jscoverage['/base.js'].branchData['130'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['130'][4].init(179, 10, 'deltaX > 0');
function visit40_130_4(result) {
  _$jscoverage['/base.js'].branchData['130'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['130'][3].init(158, 17, 'scrollLeft <= min');
function visit39_130_3(result) {
  _$jscoverage['/base.js'].branchData['130'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['130'][2].init(158, 31, 'scrollLeft <= min && deltaX > 0');
function visit38_130_2(result) {
  _$jscoverage['/base.js'].branchData['130'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['130'][1].init(158, 66, 'scrollLeft <= min && deltaX > 0 || scrollLeft >= max && deltaX < 0');
function visit37_130_1(result) {
  _$jscoverage['/base.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['126'][1].init(849, 46, '(deltaX = e.deltaX) && self.allowScroll[\'left\']');
function visit36_126_1(result) {
  _$jscoverage['/base.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['119'][7].init(208, 10, 'deltaY < 0');
function visit35_119_7(result) {
  _$jscoverage['/base.js'].branchData['119'][7].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['119'][6].init(188, 16, 'scrollTop >= max');
function visit34_119_6(result) {
  _$jscoverage['/base.js'].branchData['119'][6].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['119'][5].init(188, 30, 'scrollTop >= max && deltaY < 0');
function visit33_119_5(result) {
  _$jscoverage['/base.js'].branchData['119'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['119'][4].init(174, 10, 'deltaY > 0');
function visit32_119_4(result) {
  _$jscoverage['/base.js'].branchData['119'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['119'][3].init(154, 16, 'scrollTop <= min');
function visit31_119_3(result) {
  _$jscoverage['/base.js'].branchData['119'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['119'][2].init(154, 30, 'scrollTop <= min && deltaY > 0');
function visit30_119_2(result) {
  _$jscoverage['/base.js'].branchData['119'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['119'][1].init(154, 64, 'scrollTop <= min && deltaY > 0 || scrollTop >= max && deltaY < 0');
function visit29_119_1(result) {
  _$jscoverage['/base.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['115'][1].init(363, 45, '(deltaY = e.deltaY) && self.allowScroll[\'top\']');
function visit28_115_1(result) {
  _$jscoverage['/base.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['103'][1].init(18, 20, 'this.get(\'disabled\')');
function visit27_103_1(result) {
  _$jscoverage['/base.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['90'][1].init(51, 18, 'control.scrollStep');
function visit26_90_1(result) {
  _$jscoverage['/base.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['80'][1].init(301, 23, 'keyCode == KeyCode.LEFT');
function visit25_80_1(result) {
  _$jscoverage['/base.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['77'][1].init(132, 24, 'keyCode == KeyCode.RIGHT');
function visit24_77_1(result) {
  _$jscoverage['/base.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['74'][1].init(1667, 6, 'allowX');
function visit23_74_1(result) {
  _$jscoverage['/base.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['69'][1].init(734, 26, 'keyCode == KeyCode.PAGE_UP');
function visit22_69_1(result) {
  _$jscoverage['/base.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['66'][1].init(562, 28, 'keyCode == KeyCode.PAGE_DOWN');
function visit21_66_1(result) {
  _$jscoverage['/base.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['63'][1].init(398, 21, 'keyCode == KeyCode.UP');
function visit20_63_1(result) {
  _$jscoverage['/base.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['58'][1].init(184, 23, 'keyCode == KeyCode.DOWN');
function visit19_58_1(result) {
  _$jscoverage['/base.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['54'][1].init(735, 6, 'allowY');
function visit18_54_1(result) {
  _$jscoverage['/base.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['44'][2].init(336, 20, 'nodeName == \'select\'');
function visit17_44_2(result) {
  _$jscoverage['/base.js'].branchData['44'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['44'][1].init(42, 75, 'nodeName == \'select\' || $target.hasAttr(\'contenteditable\')');
function visit16_44_1(result) {
  _$jscoverage['/base.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['43'][2].init(292, 22, 'nodeName == \'textarea\'');
function visit15_43_2(result) {
  _$jscoverage['/base.js'].branchData['43'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['43'][1].init(39, 118, 'nodeName == \'textarea\' || nodeName == \'select\' || $target.hasAttr(\'contenteditable\')');
function visit14_43_1(result) {
  _$jscoverage['/base.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['42'][2].init(250, 19, 'nodeName == \'input\'');
function visit13_42_2(result) {
  _$jscoverage['/base.js'].branchData['42'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['42'][1].init(250, 158, 'nodeName == \'input\' || nodeName == \'textarea\' || nodeName == \'select\' || $target.hasAttr(\'contenteditable\')');
function visit12_42_1(result) {
  _$jscoverage['/base.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['19'][1].init(255, 10, 'scrollLeft');
function visit11_19_1(result) {
  _$jscoverage['/base.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['16'][1].init(147, 9, 'scrollTop');
function visit10_16_1(result) {
  _$jscoverage['/base.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[5]++;
KISSY.add('scroll-view/base', function(S, Node, Container, Render, undefined) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var $ = S.all, isTouchEventSupported = S.Features.isTouchEventSupported(), KeyCode = Node.KeyCode;
  _$jscoverage['/base.js'].lineData[11]++;
  function onElScroll() {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[12]++;
    var self = this, el = self.el, scrollTop = el.scrollTop, scrollLeft = el.scrollLeft;
    _$jscoverage['/base.js'].lineData[16]++;
    if (visit10_16_1(scrollTop)) {
      _$jscoverage['/base.js'].lineData[17]++;
      self.set('scrollTop', scrollTop + self.get('scrollTop'));
    }
    _$jscoverage['/base.js'].lineData[19]++;
    if (visit11_19_1(scrollLeft)) {
      _$jscoverage['/base.js'].lineData[20]++;
      self.set('scrollLeft', scrollLeft + self.get('scrollLeft'));
    }
    _$jscoverage['/base.js'].lineData[22]++;
    el.scrollTop = el.scrollLeft = 0;
  }
  _$jscoverage['/base.js'].lineData[25]++;
  return Container.extend({
  bindUI: function() {
  _$jscoverage['/base.js'].functionData[2]++;
  _$jscoverage['/base.js'].lineData[28]++;
  var self = this, $el = self.$el;
  _$jscoverage['/base.js'].lineData[33]++;
  $el.on('mousewheel', self.handleMouseWheel, self).on('scroll', onElScroll, self);
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/base.js'].functionData[3]++;
  _$jscoverage['/base.js'].lineData[38]++;
  var target = e.target, $target = $(target), nodeName = $target.nodeName();
  _$jscoverage['/base.js'].lineData[42]++;
  if (visit12_42_1(visit13_42_2(nodeName == 'input') || visit14_43_1(visit15_43_2(nodeName == 'textarea') || visit16_44_1(visit17_44_2(nodeName == 'select') || $target.hasAttr('contenteditable'))))) {
    _$jscoverage['/base.js'].lineData[46]++;
    return undefined;
  }
  _$jscoverage['/base.js'].lineData[48]++;
  var self = this, keyCode = e.keyCode, scrollStep = self.getScrollStep(), ok = undefined;
  _$jscoverage['/base.js'].lineData[52]++;
  var allowX = self.allowScroll['left'];
  _$jscoverage['/base.js'].lineData[53]++;
  var allowY = self.allowScroll['top'];
  _$jscoverage['/base.js'].lineData[54]++;
  if (visit18_54_1(allowY)) {
    _$jscoverage['/base.js'].lineData[55]++;
    var scrollStepY = scrollStep.top, clientHeight = self.clientHeight, scrollTop = self.get('scrollTop');
    _$jscoverage['/base.js'].lineData[58]++;
    if (visit19_58_1(keyCode == KeyCode.DOWN)) {
      _$jscoverage['/base.js'].lineData[59]++;
      self.scrollToWithBounds({
  top: scrollTop + scrollStepY});
      _$jscoverage['/base.js'].lineData[62]++;
      ok = true;
    } else {
      _$jscoverage['/base.js'].lineData[63]++;
      if (visit20_63_1(keyCode == KeyCode.UP)) {
        _$jscoverage['/base.js'].lineData[64]++;
        self.scrollToWithBounds({
  top: scrollTop - scrollStepY});
        _$jscoverage['/base.js'].lineData[65]++;
        ok = true;
      } else {
        _$jscoverage['/base.js'].lineData[66]++;
        if (visit21_66_1(keyCode == KeyCode.PAGE_DOWN)) {
          _$jscoverage['/base.js'].lineData[67]++;
          self.scrollToWithBounds({
  top: scrollTop + clientHeight});
          _$jscoverage['/base.js'].lineData[68]++;
          ok = true;
        } else {
          _$jscoverage['/base.js'].lineData[69]++;
          if (visit22_69_1(keyCode == KeyCode.PAGE_UP)) {
            _$jscoverage['/base.js'].lineData[70]++;
            self.scrollToWithBounds({
  top: scrollTop - clientHeight});
            _$jscoverage['/base.js'].lineData[71]++;
            ok = true;
          }
        }
      }
    }
  }
  _$jscoverage['/base.js'].lineData[74]++;
  if (visit23_74_1(allowX)) {
    _$jscoverage['/base.js'].lineData[75]++;
    var scrollStepX = scrollStep.left;
    _$jscoverage['/base.js'].lineData[76]++;
    var scrollLeft = self.get('scrollLeft');
    _$jscoverage['/base.js'].lineData[77]++;
    if (visit24_77_1(keyCode == KeyCode.RIGHT)) {
      _$jscoverage['/base.js'].lineData[78]++;
      self.scrollToWithBounds({
  left: scrollLeft + scrollStepX});
      _$jscoverage['/base.js'].lineData[79]++;
      ok = true;
    } else {
      _$jscoverage['/base.js'].lineData[80]++;
      if (visit25_80_1(keyCode == KeyCode.LEFT)) {
        _$jscoverage['/base.js'].lineData[81]++;
        self.scrollToWithBounds({
  left: scrollLeft - scrollStepX});
        _$jscoverage['/base.js'].lineData[82]++;
        ok = true;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[85]++;
  return ok;
}, 
  getScrollStep: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[89]++;
  var control = this;
  _$jscoverage['/base.js'].lineData[90]++;
  if (visit26_90_1(control.scrollStep)) {
    _$jscoverage['/base.js'].lineData[91]++;
    return control.scrollStep;
  }
  _$jscoverage['/base.js'].lineData[93]++;
  var elDoc = $(el.ownerDocument);
  _$jscoverage['/base.js'].lineData[94]++;
  var clientHeight = control.clientHeight;
  _$jscoverage['/base.js'].lineData[95]++;
  var clientWidth = control.clientWidth;
  _$jscoverage['/base.js'].lineData[96]++;
  return control.scrollStep = {
  top: Math.max(clientHeight * clientHeight * 0.7 / elDoc.height(), 20), 
  left: Math.max(clientWidth * clientWidth * 0.7 / elDoc.width(), 20)};
}, 
  handleMouseWheel: function(e) {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[103]++;
  if (visit27_103_1(this.get('disabled'))) {
    _$jscoverage['/base.js'].lineData[104]++;
    return;
  }
  _$jscoverage['/base.js'].lineData[106]++;
  var max, min, self = this, scrollStep = self.scrollStep, deltaY, deltaX, maxScroll = self.maxScroll, minScroll = self.minScroll;
  _$jscoverage['/base.js'].lineData[115]++;
  if (visit28_115_1((deltaY = e.deltaY) && self.allowScroll['top'])) {
    _$jscoverage['/base.js'].lineData[116]++;
    var scrollTop = self.get('scrollTop');
    _$jscoverage['/base.js'].lineData[117]++;
    max = maxScroll.top;
    _$jscoverage['/base.js'].lineData[118]++;
    min = minScroll.top;
    _$jscoverage['/base.js'].lineData[119]++;
    if (visit29_119_1(visit30_119_2(visit31_119_3(scrollTop <= min) && visit32_119_4(deltaY > 0)) || visit33_119_5(visit34_119_6(scrollTop >= max) && visit35_119_7(deltaY < 0)))) {
    } else {
      _$jscoverage['/base.js'].lineData[121]++;
      self.scrollToWithBounds({
  top: scrollTop - e.deltaY * scrollStep['top']});
      _$jscoverage['/base.js'].lineData[122]++;
      e.preventDefault();
    }
  }
  _$jscoverage['/base.js'].lineData[126]++;
  if (visit36_126_1((deltaX = e.deltaX) && self.allowScroll['left'])) {
    _$jscoverage['/base.js'].lineData[127]++;
    var scrollLeft = self.get('scrollLeft');
    _$jscoverage['/base.js'].lineData[128]++;
    max = maxScroll.left;
    _$jscoverage['/base.js'].lineData[129]++;
    min = minScroll.left;
    _$jscoverage['/base.js'].lineData[130]++;
    if (visit37_130_1(visit38_130_2(visit39_130_3(scrollLeft <= min) && visit40_130_4(deltaX > 0)) || visit41_130_5(visit42_130_6(scrollLeft >= max) && visit43_130_7(deltaX < 0)))) {
    } else {
      _$jscoverage['/base.js'].lineData[132]++;
      self.scrollToWithBounds({
  left: scrollLeft - e.deltaX * scrollStep['left']});
      _$jscoverage['/base.js'].lineData[133]++;
      e.preventDefault();
    }
  }
}, 
  'isAxisEnabled': function(axis) {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[139]++;
  return this.allowScroll[visit44_139_1(axis == 'x') ? 'left' : 'top'];
}, 
  stopAnimation: function() {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[143]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[144]++;
  self.$contentEl.stop();
  _$jscoverage['/base.js'].lineData[145]++;
  self.scrollToWithBounds({
  left: self.get('scrollLeft'), 
  top: self.get('scrollTop')});
}, 
  '_uiSetPageIndex': function(v) {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[152]++;
  this.scrollToPage(v);
}, 
  _getPageIndexFromXY: function(v, allowX, direction) {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[156]++;
  var pagesOffset = this.pagesOffset.concat([]);
  _$jscoverage['/base.js'].lineData[157]++;
  var p2 = allowX ? 'left' : 'top';
  _$jscoverage['/base.js'].lineData[158]++;
  var i, offset;
  _$jscoverage['/base.js'].lineData[159]++;
  pagesOffset.sort(function(e1, e2) {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[160]++;
  return e1[p2] - e2[p2];
});
  _$jscoverage['/base.js'].lineData[162]++;
  if (visit45_162_1(direction > 0)) {
    _$jscoverage['/base.js'].lineData[163]++;
    for (i = 0; visit46_163_1(i < pagesOffset.length); i++) {
      _$jscoverage['/base.js'].lineData[164]++;
      offset = pagesOffset[i];
      _$jscoverage['/base.js'].lineData[165]++;
      if (visit47_165_1(offset[p2] >= v)) {
        _$jscoverage['/base.js'].lineData[166]++;
        return offset.index;
      }
    }
  } else {
    _$jscoverage['/base.js'].lineData[170]++;
    for (i = pagesOffset.length - 1; visit48_170_1(i >= 0); i--) {
      _$jscoverage['/base.js'].lineData[171]++;
      offset = pagesOffset[i];
      _$jscoverage['/base.js'].lineData[172]++;
      if (visit49_172_1(offset[p2] <= v)) {
        _$jscoverage['/base.js'].lineData[173]++;
        return offset.index;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[177]++;
  return undefined;
}, 
  scrollToPage: function(index, animCfg) {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[181]++;
  var self = this, pageOffset;
  _$jscoverage['/base.js'].lineData[183]++;
  if (visit50_183_1((pageOffset = self.pagesOffset) && pageOffset[index])) {
    _$jscoverage['/base.js'].lineData[184]++;
    self.set('pageIndex', index);
    _$jscoverage['/base.js'].lineData[185]++;
    self.scrollTo(pageOffset[index], animCfg);
  }
}, 
  scrollToWithBounds: function(cfg, anim) {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[190]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[191]++;
  var maxScroll = self.maxScroll;
  _$jscoverage['/base.js'].lineData[192]++;
  var minScroll = self.minScroll;
  _$jscoverage['/base.js'].lineData[193]++;
  if (visit51_193_1(cfg.left)) {
    _$jscoverage['/base.js'].lineData[194]++;
    cfg.left = Math.min(Math.max(cfg.left, minScroll.left), maxScroll.left);
  }
  _$jscoverage['/base.js'].lineData[196]++;
  if (visit52_196_1(cfg.top)) {
    _$jscoverage['/base.js'].lineData[197]++;
    cfg.top = Math.min(Math.max(cfg.top, minScroll.top), maxScroll.top);
  }
  _$jscoverage['/base.js'].lineData[199]++;
  self.scrollTo(cfg, anim);
}, 
  scrollTo: function(cfg, anim) {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[203]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[204]++;
  var left = cfg.left, top = cfg.top;
  _$jscoverage['/base.js'].lineData[207]++;
  if (visit53_207_1(anim)) {
    _$jscoverage['/base.js'].lineData[208]++;
    var scrollLeft = self.get('scrollLeft'), scrollTop = self.get('scrollTop'), contentEl = self.$contentEl, animProperty = {
  xx: {
  fx: {
  frame: function(anim, fx) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[215]++;
  if (visit54_215_1(left !== undefined)) {
    _$jscoverage['/base.js'].lineData[216]++;
    self.set('scrollLeft', scrollLeft + fx.pos * (left - scrollLeft));
  }
  _$jscoverage['/base.js'].lineData[219]++;
  if (visit55_219_1(top !== undefined)) {
    _$jscoverage['/base.js'].lineData[220]++;
    self.set('scrollTop', scrollTop + fx.pos * (top - scrollTop));
  }
}}}};
    _$jscoverage['/base.js'].lineData[227]++;
    contentEl.animate(animProperty, anim);
  } else {
    _$jscoverage['/base.js'].lineData[229]++;
    if (visit56_229_1(left !== undefined)) {
      _$jscoverage['/base.js'].lineData[230]++;
      self.set('scrollLeft', left);
    }
    _$jscoverage['/base.js'].lineData[232]++;
    if (visit57_232_1(top !== undefined)) {
      _$jscoverage['/base.js'].lineData[233]++;
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
  requires: ['node', 'component/container', './base/render']});
