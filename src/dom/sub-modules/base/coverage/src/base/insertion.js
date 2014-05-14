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
if (! _$jscoverage['/base/insertion.js']) {
  _$jscoverage['/base/insertion.js'] = {};
  _$jscoverage['/base/insertion.js'].lineData = [];
  _$jscoverage['/base/insertion.js'].lineData[6] = 0;
  _$jscoverage['/base/insertion.js'].lineData[7] = 0;
  _$jscoverage['/base/insertion.js'].lineData[8] = 0;
  _$jscoverage['/base/insertion.js'].lineData[9] = 0;
  _$jscoverage['/base/insertion.js'].lineData[18] = 0;
  _$jscoverage['/base/insertion.js'].lineData[19] = 0;
  _$jscoverage['/base/insertion.js'].lineData[23] = 0;
  _$jscoverage['/base/insertion.js'].lineData[24] = 0;
  _$jscoverage['/base/insertion.js'].lineData[25] = 0;
  _$jscoverage['/base/insertion.js'].lineData[26] = 0;
  _$jscoverage['/base/insertion.js'].lineData[27] = 0;
  _$jscoverage['/base/insertion.js'].lineData[28] = 0;
  _$jscoverage['/base/insertion.js'].lineData[29] = 0;
  _$jscoverage['/base/insertion.js'].lineData[30] = 0;
  _$jscoverage['/base/insertion.js'].lineData[32] = 0;
  _$jscoverage['/base/insertion.js'].lineData[33] = 0;
  _$jscoverage['/base/insertion.js'].lineData[35] = 0;
  _$jscoverage['/base/insertion.js'].lineData[36] = 0;
  _$jscoverage['/base/insertion.js'].lineData[39] = 0;
  _$jscoverage['/base/insertion.js'].lineData[42] = 0;
  _$jscoverage['/base/insertion.js'].lineData[46] = 0;
  _$jscoverage['/base/insertion.js'].lineData[47] = 0;
  _$jscoverage['/base/insertion.js'].lineData[48] = 0;
  _$jscoverage['/base/insertion.js'].lineData[49] = 0;
  _$jscoverage['/base/insertion.js'].lineData[52] = 0;
  _$jscoverage['/base/insertion.js'].lineData[54] = 0;
  _$jscoverage['/base/insertion.js'].lineData[57] = 0;
  _$jscoverage['/base/insertion.js'].lineData[61] = 0;
  _$jscoverage['/base/insertion.js'].lineData[62] = 0;
  _$jscoverage['/base/insertion.js'].lineData[63] = 0;
  _$jscoverage['/base/insertion.js'].lineData[65] = 0;
  _$jscoverage['/base/insertion.js'].lineData[66] = 0;
  _$jscoverage['/base/insertion.js'].lineData[67] = 0;
  _$jscoverage['/base/insertion.js'].lineData[73] = 0;
  _$jscoverage['/base/insertion.js'].lineData[74] = 0;
  _$jscoverage['/base/insertion.js'].lineData[76] = 0;
  _$jscoverage['/base/insertion.js'].lineData[77] = 0;
  _$jscoverage['/base/insertion.js'].lineData[81] = 0;
  _$jscoverage['/base/insertion.js'].lineData[85] = 0;
  _$jscoverage['/base/insertion.js'].lineData[86] = 0;
  _$jscoverage['/base/insertion.js'].lineData[89] = 0;
  _$jscoverage['/base/insertion.js'].lineData[91] = 0;
  _$jscoverage['/base/insertion.js'].lineData[99] = 0;
  _$jscoverage['/base/insertion.js'].lineData[100] = 0;
  _$jscoverage['/base/insertion.js'].lineData[106] = 0;
  _$jscoverage['/base/insertion.js'].lineData[108] = 0;
  _$jscoverage['/base/insertion.js'].lineData[109] = 0;
  _$jscoverage['/base/insertion.js'].lineData[110] = 0;
  _$jscoverage['/base/insertion.js'].lineData[113] = 0;
  _$jscoverage['/base/insertion.js'].lineData[114] = 0;
  _$jscoverage['/base/insertion.js'].lineData[115] = 0;
  _$jscoverage['/base/insertion.js'].lineData[117] = 0;
  _$jscoverage['/base/insertion.js'].lineData[118] = 0;
  _$jscoverage['/base/insertion.js'].lineData[120] = 0;
  _$jscoverage['/base/insertion.js'].lineData[121] = 0;
  _$jscoverage['/base/insertion.js'].lineData[127] = 0;
  _$jscoverage['/base/insertion.js'].lineData[144] = 0;
  _$jscoverage['/base/insertion.js'].lineData[145] = 0;
  _$jscoverage['/base/insertion.js'].lineData[146] = 0;
  _$jscoverage['/base/insertion.js'].lineData[158] = 0;
  _$jscoverage['/base/insertion.js'].lineData[159] = 0;
  _$jscoverage['/base/insertion.js'].lineData[160] = 0;
  _$jscoverage['/base/insertion.js'].lineData[172] = 0;
  _$jscoverage['/base/insertion.js'].lineData[173] = 0;
  _$jscoverage['/base/insertion.js'].lineData[184] = 0;
  _$jscoverage['/base/insertion.js'].lineData[185] = 0;
  _$jscoverage['/base/insertion.js'].lineData[196] = 0;
  _$jscoverage['/base/insertion.js'].lineData[197] = 0;
  _$jscoverage['/base/insertion.js'].lineData[198] = 0;
  _$jscoverage['/base/insertion.js'].lineData[199] = 0;
  _$jscoverage['/base/insertion.js'].lineData[201] = 0;
  _$jscoverage['/base/insertion.js'].lineData[202] = 0;
  _$jscoverage['/base/insertion.js'].lineData[203] = 0;
  _$jscoverage['/base/insertion.js'].lineData[205] = 0;
  _$jscoverage['/base/insertion.js'].lineData[214] = 0;
  _$jscoverage['/base/insertion.js'].lineData[215] = 0;
  _$jscoverage['/base/insertion.js'].lineData[216] = 0;
  _$jscoverage['/base/insertion.js'].lineData[217] = 0;
  _$jscoverage['/base/insertion.js'].lineData[227] = 0;
  _$jscoverage['/base/insertion.js'].lineData[228] = 0;
  _$jscoverage['/base/insertion.js'].lineData[229] = 0;
  _$jscoverage['/base/insertion.js'].lineData[230] = 0;
  _$jscoverage['/base/insertion.js'].lineData[231] = 0;
  _$jscoverage['/base/insertion.js'].lineData[232] = 0;
  _$jscoverage['/base/insertion.js'].lineData[234] = 0;
  _$jscoverage['/base/insertion.js'].lineData[245] = 0;
  _$jscoverage['/base/insertion.js'].lineData[246] = 0;
  _$jscoverage['/base/insertion.js'].lineData[247] = 0;
  _$jscoverage['/base/insertion.js'].lineData[248] = 0;
  _$jscoverage['/base/insertion.js'].lineData[258] = 0;
  _$jscoverage['/base/insertion.js'].lineData[259] = 0;
  _$jscoverage['/base/insertion.js'].lineData[260] = 0;
  _$jscoverage['/base/insertion.js'].lineData[261] = 0;
  _$jscoverage['/base/insertion.js'].lineData[262] = 0;
  _$jscoverage['/base/insertion.js'].lineData[265] = 0;
  _$jscoverage['/base/insertion.js'].lineData[271] = 0;
  _$jscoverage['/base/insertion.js'].lineData[273] = 0;
}
if (! _$jscoverage['/base/insertion.js'].functionData) {
  _$jscoverage['/base/insertion.js'].functionData = [];
  _$jscoverage['/base/insertion.js'].functionData[0] = 0;
  _$jscoverage['/base/insertion.js'].functionData[1] = 0;
  _$jscoverage['/base/insertion.js'].functionData[2] = 0;
  _$jscoverage['/base/insertion.js'].functionData[3] = 0;
  _$jscoverage['/base/insertion.js'].functionData[4] = 0;
  _$jscoverage['/base/insertion.js'].functionData[5] = 0;
  _$jscoverage['/base/insertion.js'].functionData[6] = 0;
  _$jscoverage['/base/insertion.js'].functionData[7] = 0;
  _$jscoverage['/base/insertion.js'].functionData[8] = 0;
  _$jscoverage['/base/insertion.js'].functionData[9] = 0;
  _$jscoverage['/base/insertion.js'].functionData[10] = 0;
  _$jscoverage['/base/insertion.js'].functionData[11] = 0;
  _$jscoverage['/base/insertion.js'].functionData[12] = 0;
  _$jscoverage['/base/insertion.js'].functionData[13] = 0;
  _$jscoverage['/base/insertion.js'].functionData[14] = 0;
  _$jscoverage['/base/insertion.js'].functionData[15] = 0;
  _$jscoverage['/base/insertion.js'].functionData[16] = 0;
  _$jscoverage['/base/insertion.js'].functionData[17] = 0;
  _$jscoverage['/base/insertion.js'].functionData[18] = 0;
  _$jscoverage['/base/insertion.js'].functionData[19] = 0;
  _$jscoverage['/base/insertion.js'].functionData[20] = 0;
  _$jscoverage['/base/insertion.js'].functionData[21] = 0;
}
if (! _$jscoverage['/base/insertion.js'].branchData) {
  _$jscoverage['/base/insertion.js'].branchData = {};
  _$jscoverage['/base/insertion.js'].branchData['19'] = [];
  _$jscoverage['/base/insertion.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['28'] = [];
  _$jscoverage['/base/insertion.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['30'] = [];
  _$jscoverage['/base/insertion.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['30'][2] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['32'] = [];
  _$jscoverage['/base/insertion.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['35'] = [];
  _$jscoverage['/base/insertion.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['39'] = [];
  _$jscoverage['/base/insertion.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['39'][2] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['46'] = [];
  _$jscoverage['/base/insertion.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['48'] = [];
  _$jscoverage['/base/insertion.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['62'] = [];
  _$jscoverage['/base/insertion.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['65'] = [];
  _$jscoverage['/base/insertion.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['65'][2] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['65'][3] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['66'] = [];
  _$jscoverage['/base/insertion.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['76'] = [];
  _$jscoverage['/base/insertion.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['85'] = [];
  _$jscoverage['/base/insertion.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['99'] = [];
  _$jscoverage['/base/insertion.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['99'][2] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['99'][3] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['108'] = [];
  _$jscoverage['/base/insertion.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['113'] = [];
  _$jscoverage['/base/insertion.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['115'] = [];
  _$jscoverage['/base/insertion.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['117'] = [];
  _$jscoverage['/base/insertion.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['120'] = [];
  _$jscoverage['/base/insertion.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['145'] = [];
  _$jscoverage['/base/insertion.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['159'] = [];
  _$jscoverage['/base/insertion.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['198'] = [];
  _$jscoverage['/base/insertion.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['202'] = [];
  _$jscoverage['/base/insertion.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['202'][2] = new BranchData();
  _$jscoverage['/base/insertion.js'].branchData['231'] = [];
  _$jscoverage['/base/insertion.js'].branchData['231'][1] = new BranchData();
}
_$jscoverage['/base/insertion.js'].branchData['231'][1].init(76, 15, 'contents.length');
function visit268_231_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['202'][2].init(378, 16, 'c.nodeType === 1');
function visit267_202_2(result) {
  _$jscoverage['/base/insertion.js'].branchData['202'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['202'][1].init(347, 47, '(c = wrapperNode.firstChild) && c.nodeType === 1');
function visit266_202_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['198'][1].init(180, 26, 'wrappedNodes[0].parentNode');
function visit265_198_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['159'][1].init(26, 20, 'refNode[PARENT_NODE]');
function visit264_159_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['145'][1].init(26, 20, 'refNode[PARENT_NODE]');
function visit263_145_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['120'][1].init(243, 25, 'scripts && scripts.length');
function visit262_120_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['117'][1].init(64, 5, 'i > 0');
function visit261_117_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['115'][1].init(54, 7, 'newNode');
function visit260_115_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['113'][1].init(1220, 18, 'i < refNodesLength');
function visit259_113_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['108'][1].init(1062, 18, 'refNodesLength > 1');
function visit258_108_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['99'][3].init(731, 27, '!scripts || !scripts.length');
function visit257_99_3(result) {
  _$jscoverage['/base/insertion.js'].branchData['99'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['99'][2].init(711, 48, '!newNodesLength && (!scripts || !scripts.length)');
function visit256_99_2(result) {
  _$jscoverage['/base/insertion.js'].branchData['99'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['99'][1].init(711, 68, '(!newNodesLength && (!scripts || !scripts.length)) || !refNodesLength');
function visit255_99_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['85'][1].init(364, 24, 'Dom._fixInsertionChecked');
function visit254_85_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['76'][1].init(57, 7, 'scripts');
function visit253_76_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['66'][1].init(102, 4, 'code');
function visit252_66_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['65'][3].init(46, 18, 'el.innerHTML || \'\'');
function visit251_65_3(result) {
  _$jscoverage['/base/insertion.js'].branchData['65'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['65'][2].init(28, 36, 'el.textContent || el.innerHTML || \'\'');
function visit250_65_2(result) {
  _$jscoverage['/base/insertion.js'].branchData['65'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['65'][1].init(35, 47, 'el.text || el.textContent || el.innerHTML || \'\'');
function visit249_65_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['62'][1].init(14, 6, 'el.src');
function visit248_62_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['48'][1].init(66, 7, 'isJs(s)');
function visit247_48_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['46'][1].init(190, 13, 'j < ss.length');
function visit246_46_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['39'][2].init(22, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit245_39_2(result) {
  _$jscoverage['/base/insertion.js'].branchData['39'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['39'][1].init(22, 160, 'el.nodeType === NodeType.ELEMENT_NODE && !RE_FORM_EL.test(nodeName)');
function visit244_39_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['35'][1].init(210, 7, 'scripts');
function visit243_35_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['32'][1].init(101, 13, 'el.parentNode');
function visit242_32_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['30'][2].init(251, 21, 'nodeName === \'script\'');
function visit241_30_2(result) {
  _$jscoverage['/base/insertion.js'].branchData['30'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['30'][1].init(251, 33, 'nodeName === \'script\' && isJs(el)');
function visit240_30_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['28'][1].init(87, 47, 'el.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit239_28_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].branchData['19'][1].init(17, 39, '!el.type || R_SCRIPT_TYPE.test(el.type)');
function visit238_19_1(result) {
  _$jscoverage['/base/insertion.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/insertion.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/insertion.js'].functionData[0]++;
  _$jscoverage['/base/insertion.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/base/insertion.js'].lineData[8]++;
  var Dom = require('./api');
  _$jscoverage['/base/insertion.js'].lineData[9]++;
  var PARENT_NODE = 'parentNode', NodeType = Dom.NodeType, RE_FORM_EL = /^(?:button|input|object|select|textarea)$/i, getNodeName = Dom.nodeName, makeArray = util.makeArray, splice = [].splice, NEXT_SIBLING = 'nextSibling', R_SCRIPT_TYPE = /\/(java|ecma)script/i;
  _$jscoverage['/base/insertion.js'].lineData[18]++;
  function isJs(el) {
    _$jscoverage['/base/insertion.js'].functionData[1]++;
    _$jscoverage['/base/insertion.js'].lineData[19]++;
    return visit238_19_1(!el.type || R_SCRIPT_TYPE.test(el.type));
  }
  _$jscoverage['/base/insertion.js'].lineData[23]++;
  function filterScripts(nodes, scripts) {
    _$jscoverage['/base/insertion.js'].functionData[2]++;
    _$jscoverage['/base/insertion.js'].lineData[24]++;
    var ret = [], i, el, nodeName;
    _$jscoverage['/base/insertion.js'].lineData[25]++;
    for (i = 0; nodes[i]; i++) {
      _$jscoverage['/base/insertion.js'].lineData[26]++;
      el = nodes[i];
      _$jscoverage['/base/insertion.js'].lineData[27]++;
      nodeName = getNodeName(el);
      _$jscoverage['/base/insertion.js'].lineData[28]++;
      if (visit239_28_1(el.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE)) {
        _$jscoverage['/base/insertion.js'].lineData[29]++;
        ret.push.apply(ret, filterScripts(makeArray(el.childNodes), scripts));
      } else {
        _$jscoverage['/base/insertion.js'].lineData[30]++;
        if (visit240_30_1(visit241_30_2(nodeName === 'script') && isJs(el))) {
          _$jscoverage['/base/insertion.js'].lineData[32]++;
          if (visit242_32_1(el.parentNode)) {
            _$jscoverage['/base/insertion.js'].lineData[33]++;
            el.parentNode.removeChild(el);
          }
          _$jscoverage['/base/insertion.js'].lineData[35]++;
          if (visit243_35_1(scripts)) {
            _$jscoverage['/base/insertion.js'].lineData[36]++;
            scripts.push(el);
          }
        } else {
          _$jscoverage['/base/insertion.js'].lineData[39]++;
          if (visit244_39_1(visit245_39_2(el.nodeType === NodeType.ELEMENT_NODE) && !RE_FORM_EL.test(nodeName))) {
            _$jscoverage['/base/insertion.js'].lineData[42]++;
            var tmp = [], s, j, ss = el.getElementsByTagName('script');
            _$jscoverage['/base/insertion.js'].lineData[46]++;
            for (j = 0; visit246_46_1(j < ss.length); j++) {
              _$jscoverage['/base/insertion.js'].lineData[47]++;
              s = ss[j];
              _$jscoverage['/base/insertion.js'].lineData[48]++;
              if (visit247_48_1(isJs(s))) {
                _$jscoverage['/base/insertion.js'].lineData[49]++;
                tmp.push(s);
              }
            }
            _$jscoverage['/base/insertion.js'].lineData[52]++;
            splice.apply(nodes, [i + 1, 0].concat(tmp));
          }
          _$jscoverage['/base/insertion.js'].lineData[54]++;
          ret.push(el);
        }
      }
    }
    _$jscoverage['/base/insertion.js'].lineData[57]++;
    return ret;
  }
  _$jscoverage['/base/insertion.js'].lineData[61]++;
  function evalScript(el) {
    _$jscoverage['/base/insertion.js'].functionData[3]++;
    _$jscoverage['/base/insertion.js'].lineData[62]++;
    if (visit248_62_1(el.src)) {
      _$jscoverage['/base/insertion.js'].lineData[63]++;
      S.getScript(el.src);
    } else {
      _$jscoverage['/base/insertion.js'].lineData[65]++;
      var code = util.trim(visit249_65_1(el.text || visit250_65_2(el.textContent || visit251_65_3(el.innerHTML || ''))));
      _$jscoverage['/base/insertion.js'].lineData[66]++;
      if (visit252_66_1(code)) {
        _$jscoverage['/base/insertion.js'].lineData[67]++;
        util.globalEval(code);
      }
    }
  }
  _$jscoverage['/base/insertion.js'].lineData[73]++;
  function insertion(newNodes, refNodes, fn, scripts) {
    _$jscoverage['/base/insertion.js'].functionData[4]++;
    _$jscoverage['/base/insertion.js'].lineData[74]++;
    newNodes = Dom.query(newNodes);
    _$jscoverage['/base/insertion.js'].lineData[76]++;
    if (visit253_76_1(scripts)) {
      _$jscoverage['/base/insertion.js'].lineData[77]++;
      scripts = [];
    }
    _$jscoverage['/base/insertion.js'].lineData[81]++;
    newNodes = filterScripts(newNodes, scripts);
    _$jscoverage['/base/insertion.js'].lineData[85]++;
    if (visit254_85_1(Dom._fixInsertionChecked)) {
      _$jscoverage['/base/insertion.js'].lineData[86]++;
      Dom._fixInsertionChecked(newNodes);
    }
    _$jscoverage['/base/insertion.js'].lineData[89]++;
    refNodes = Dom.query(refNodes);
    _$jscoverage['/base/insertion.js'].lineData[91]++;
    var newNodesLength = newNodes.length, newNode, i, refNode, node, clonedNode, refNodesLength = refNodes.length;
    _$jscoverage['/base/insertion.js'].lineData[99]++;
    if (visit255_99_1((visit256_99_2(!newNodesLength && (visit257_99_3(!scripts || !scripts.length)))) || !refNodesLength)) {
      _$jscoverage['/base/insertion.js'].lineData[100]++;
      return;
    }
    _$jscoverage['/base/insertion.js'].lineData[106]++;
    newNode = Dom._nodeListToFragment(newNodes);
    _$jscoverage['/base/insertion.js'].lineData[108]++;
    if (visit258_108_1(refNodesLength > 1)) {
      _$jscoverage['/base/insertion.js'].lineData[109]++;
      clonedNode = Dom.clone(newNode, true);
      _$jscoverage['/base/insertion.js'].lineData[110]++;
      refNodes = util.makeArray(refNodes);
    }
    _$jscoverage['/base/insertion.js'].lineData[113]++;
    for (i = 0; visit259_113_1(i < refNodesLength); i++) {
      _$jscoverage['/base/insertion.js'].lineData[114]++;
      refNode = refNodes[i];
      _$jscoverage['/base/insertion.js'].lineData[115]++;
      if (visit260_115_1(newNode)) {
        _$jscoverage['/base/insertion.js'].lineData[117]++;
        node = visit261_117_1(i > 0) ? Dom.clone(clonedNode, true) : newNode;
        _$jscoverage['/base/insertion.js'].lineData[118]++;
        fn(node, refNode);
      }
      _$jscoverage['/base/insertion.js'].lineData[120]++;
      if (visit262_120_1(scripts && scripts.length)) {
        _$jscoverage['/base/insertion.js'].lineData[121]++;
        util.each(scripts, evalScript);
      }
    }
  }
  _$jscoverage['/base/insertion.js'].lineData[127]++;
  util.mix(Dom, {
  _fixInsertionChecked: null, 
  insertBefore: function(newNodes, refNodes, loadScripts) {
  _$jscoverage['/base/insertion.js'].functionData[5]++;
  _$jscoverage['/base/insertion.js'].lineData[144]++;
  insertion(newNodes, refNodes, function(newNode, refNode) {
  _$jscoverage['/base/insertion.js'].functionData[6]++;
  _$jscoverage['/base/insertion.js'].lineData[145]++;
  if (visit263_145_1(refNode[PARENT_NODE])) {
    _$jscoverage['/base/insertion.js'].lineData[146]++;
    refNode[PARENT_NODE].insertBefore(newNode, refNode);
  }
}, loadScripts);
}, 
  insertAfter: function(newNodes, refNodes, loadScripts) {
  _$jscoverage['/base/insertion.js'].functionData[7]++;
  _$jscoverage['/base/insertion.js'].lineData[158]++;
  insertion(newNodes, refNodes, function(newNode, refNode) {
  _$jscoverage['/base/insertion.js'].functionData[8]++;
  _$jscoverage['/base/insertion.js'].lineData[159]++;
  if (visit264_159_1(refNode[PARENT_NODE])) {
    _$jscoverage['/base/insertion.js'].lineData[160]++;
    refNode[PARENT_NODE].insertBefore(newNode, refNode[NEXT_SIBLING]);
  }
}, loadScripts);
}, 
  appendTo: function(newNodes, parents, loadScripts) {
  _$jscoverage['/base/insertion.js'].functionData[9]++;
  _$jscoverage['/base/insertion.js'].lineData[172]++;
  insertion(newNodes, parents, function(newNode, parent) {
  _$jscoverage['/base/insertion.js'].functionData[10]++;
  _$jscoverage['/base/insertion.js'].lineData[173]++;
  parent.appendChild(newNode);
}, loadScripts);
}, 
  prependTo: function(newNodes, parents, loadScripts) {
  _$jscoverage['/base/insertion.js'].functionData[11]++;
  _$jscoverage['/base/insertion.js'].lineData[184]++;
  insertion(newNodes, parents, function(newNode, parent) {
  _$jscoverage['/base/insertion.js'].functionData[12]++;
  _$jscoverage['/base/insertion.js'].lineData[185]++;
  parent.insertBefore(newNode, parent.firstChild);
}, loadScripts);
}, 
  wrapAll: function(wrappedNodes, wrapperNode) {
  _$jscoverage['/base/insertion.js'].functionData[13]++;
  _$jscoverage['/base/insertion.js'].lineData[196]++;
  wrapperNode = Dom.clone(Dom.get(wrapperNode), true);
  _$jscoverage['/base/insertion.js'].lineData[197]++;
  wrappedNodes = Dom.query(wrappedNodes);
  _$jscoverage['/base/insertion.js'].lineData[198]++;
  if (visit265_198_1(wrappedNodes[0].parentNode)) {
    _$jscoverage['/base/insertion.js'].lineData[199]++;
    Dom.insertBefore(wrapperNode, wrappedNodes[0]);
  }
  _$jscoverage['/base/insertion.js'].lineData[201]++;
  var c;
  _$jscoverage['/base/insertion.js'].lineData[202]++;
  while (visit266_202_1((c = wrapperNode.firstChild) && visit267_202_2(c.nodeType === 1))) {
    _$jscoverage['/base/insertion.js'].lineData[203]++;
    wrapperNode = c;
  }
  _$jscoverage['/base/insertion.js'].lineData[205]++;
  Dom.appendTo(wrappedNodes, wrapperNode);
}, 
  wrap: function(wrappedNodes, wrapperNode) {
  _$jscoverage['/base/insertion.js'].functionData[14]++;
  _$jscoverage['/base/insertion.js'].lineData[214]++;
  wrappedNodes = Dom.query(wrappedNodes);
  _$jscoverage['/base/insertion.js'].lineData[215]++;
  wrapperNode = Dom.get(wrapperNode);
  _$jscoverage['/base/insertion.js'].lineData[216]++;
  util.each(wrappedNodes, function(w) {
  _$jscoverage['/base/insertion.js'].functionData[15]++;
  _$jscoverage['/base/insertion.js'].lineData[217]++;
  Dom.wrapAll(w, wrapperNode);
});
}, 
  wrapInner: function(wrappedNodes, wrapperNode) {
  _$jscoverage['/base/insertion.js'].functionData[16]++;
  _$jscoverage['/base/insertion.js'].lineData[227]++;
  wrappedNodes = Dom.query(wrappedNodes);
  _$jscoverage['/base/insertion.js'].lineData[228]++;
  wrapperNode = Dom.get(wrapperNode);
  _$jscoverage['/base/insertion.js'].lineData[229]++;
  util.each(wrappedNodes, function(w) {
  _$jscoverage['/base/insertion.js'].functionData[17]++;
  _$jscoverage['/base/insertion.js'].lineData[230]++;
  var contents = w.childNodes;
  _$jscoverage['/base/insertion.js'].lineData[231]++;
  if (visit268_231_1(contents.length)) {
    _$jscoverage['/base/insertion.js'].lineData[232]++;
    Dom.wrapAll(contents, wrapperNode);
  } else {
    _$jscoverage['/base/insertion.js'].lineData[234]++;
    w.appendChild(wrapperNode);
  }
});
}, 
  unwrap: function(wrappedNodes) {
  _$jscoverage['/base/insertion.js'].functionData[18]++;
  _$jscoverage['/base/insertion.js'].lineData[245]++;
  wrappedNodes = Dom.query(wrappedNodes);
  _$jscoverage['/base/insertion.js'].lineData[246]++;
  util.each(wrappedNodes, function(w) {
  _$jscoverage['/base/insertion.js'].functionData[19]++;
  _$jscoverage['/base/insertion.js'].lineData[247]++;
  var p = w.parentNode;
  _$jscoverage['/base/insertion.js'].lineData[248]++;
  Dom.replaceWith(p, p.childNodes);
});
}, 
  replaceWith: function(selector, newNodes) {
  _$jscoverage['/base/insertion.js'].functionData[20]++;
  _$jscoverage['/base/insertion.js'].lineData[258]++;
  var nodes = Dom.query(selector);
  _$jscoverage['/base/insertion.js'].lineData[259]++;
  newNodes = Dom.query(newNodes);
  _$jscoverage['/base/insertion.js'].lineData[260]++;
  Dom.remove(newNodes, true);
  _$jscoverage['/base/insertion.js'].lineData[261]++;
  Dom.insertBefore(newNodes, nodes);
  _$jscoverage['/base/insertion.js'].lineData[262]++;
  Dom.remove(nodes);
}});
  _$jscoverage['/base/insertion.js'].lineData[265]++;
  util.each({
  prepend: 'prependTo', 
  append: 'appendTo', 
  before: 'insertBefore', 
  after: 'insertAfter'}, function(value, key) {
  _$jscoverage['/base/insertion.js'].functionData[21]++;
  _$jscoverage['/base/insertion.js'].lineData[271]++;
  Dom[key] = Dom[value];
});
  _$jscoverage['/base/insertion.js'].lineData[273]++;
  return Dom;
});
