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
  _$jscoverage['/base.js'].lineData[26] = 0;
  _$jscoverage['/base.js'].lineData[31] = 0;
  _$jscoverage['/base.js'].lineData[36] = 0;
  _$jscoverage['/base.js'].lineData[40] = 0;
  _$jscoverage['/base.js'].lineData[44] = 0;
  _$jscoverage['/base.js'].lineData[46] = 0;
  _$jscoverage['/base.js'].lineData[50] = 0;
  _$jscoverage['/base.js'].lineData[51] = 0;
  _$jscoverage['/base.js'].lineData[52] = 0;
  _$jscoverage['/base.js'].lineData[53] = 0;
  _$jscoverage['/base.js'].lineData[56] = 0;
  _$jscoverage['/base.js'].lineData[57] = 0;
  _$jscoverage['/base.js'].lineData[60] = 0;
  _$jscoverage['/base.js'].lineData[61] = 0;
  _$jscoverage['/base.js'].lineData[62] = 0;
  _$jscoverage['/base.js'].lineData[63] = 0;
  _$jscoverage['/base.js'].lineData[64] = 0;
  _$jscoverage['/base.js'].lineData[65] = 0;
  _$jscoverage['/base.js'].lineData[66] = 0;
  _$jscoverage['/base.js'].lineData[67] = 0;
  _$jscoverage['/base.js'].lineData[68] = 0;
  _$jscoverage['/base.js'].lineData[69] = 0;
  _$jscoverage['/base.js'].lineData[72] = 0;
  _$jscoverage['/base.js'].lineData[73] = 0;
  _$jscoverage['/base.js'].lineData[74] = 0;
  _$jscoverage['/base.js'].lineData[75] = 0;
  _$jscoverage['/base.js'].lineData[76] = 0;
  _$jscoverage['/base.js'].lineData[77] = 0;
  _$jscoverage['/base.js'].lineData[78] = 0;
  _$jscoverage['/base.js'].lineData[79] = 0;
  _$jscoverage['/base.js'].lineData[80] = 0;
  _$jscoverage['/base.js'].lineData[83] = 0;
  _$jscoverage['/base.js'].lineData[87] = 0;
  _$jscoverage['/base.js'].lineData[88] = 0;
  _$jscoverage['/base.js'].lineData[89] = 0;
  _$jscoverage['/base.js'].lineData[91] = 0;
  _$jscoverage['/base.js'].lineData[92] = 0;
  _$jscoverage['/base.js'].lineData[93] = 0;
  _$jscoverage['/base.js'].lineData[94] = 0;
  _$jscoverage['/base.js'].lineData[101] = 0;
  _$jscoverage['/base.js'].lineData[102] = 0;
  _$jscoverage['/base.js'].lineData[104] = 0;
  _$jscoverage['/base.js'].lineData[113] = 0;
  _$jscoverage['/base.js'].lineData[114] = 0;
  _$jscoverage['/base.js'].lineData[115] = 0;
  _$jscoverage['/base.js'].lineData[116] = 0;
  _$jscoverage['/base.js'].lineData[117] = 0;
  _$jscoverage['/base.js'].lineData[119] = 0;
  _$jscoverage['/base.js'].lineData[121] = 0;
  _$jscoverage['/base.js'].lineData[122] = 0;
  _$jscoverage['/base.js'].lineData[127] = 0;
  _$jscoverage['/base.js'].lineData[128] = 0;
  _$jscoverage['/base.js'].lineData[129] = 0;
  _$jscoverage['/base.js'].lineData[130] = 0;
  _$jscoverage['/base.js'].lineData[131] = 0;
  _$jscoverage['/base.js'].lineData[133] = 0;
  _$jscoverage['/base.js'].lineData[134] = 0;
  _$jscoverage['/base.js'].lineData[135] = 0;
  _$jscoverage['/base.js'].lineData[142] = 0;
  _$jscoverage['/base.js'].lineData[146] = 0;
  _$jscoverage['/base.js'].lineData[147] = 0;
  _$jscoverage['/base.js'].lineData[148] = 0;
  _$jscoverage['/base.js'].lineData[155] = 0;
  _$jscoverage['/base.js'].lineData[159] = 0;
  _$jscoverage['/base.js'].lineData[160] = 0;
  _$jscoverage['/base.js'].lineData[161] = 0;
  _$jscoverage['/base.js'].lineData[162] = 0;
  _$jscoverage['/base.js'].lineData[163] = 0;
  _$jscoverage['/base.js'].lineData[165] = 0;
  _$jscoverage['/base.js'].lineData[166] = 0;
  _$jscoverage['/base.js'].lineData[167] = 0;
  _$jscoverage['/base.js'].lineData[168] = 0;
  _$jscoverage['/base.js'].lineData[169] = 0;
  _$jscoverage['/base.js'].lineData[173] = 0;
  _$jscoverage['/base.js'].lineData[174] = 0;
  _$jscoverage['/base.js'].lineData[175] = 0;
  _$jscoverage['/base.js'].lineData[176] = 0;
  _$jscoverage['/base.js'].lineData[180] = 0;
  _$jscoverage['/base.js'].lineData[184] = 0;
  _$jscoverage['/base.js'].lineData[186] = 0;
  _$jscoverage['/base.js'].lineData[187] = 0;
  _$jscoverage['/base.js'].lineData[188] = 0;
  _$jscoverage['/base.js'].lineData[193] = 0;
  _$jscoverage['/base.js'].lineData[194] = 0;
  _$jscoverage['/base.js'].lineData[195] = 0;
  _$jscoverage['/base.js'].lineData[196] = 0;
  _$jscoverage['/base.js'].lineData[197] = 0;
  _$jscoverage['/base.js'].lineData[199] = 0;
  _$jscoverage['/base.js'].lineData[200] = 0;
  _$jscoverage['/base.js'].lineData[202] = 0;
  _$jscoverage['/base.js'].lineData[206] = 0;
  _$jscoverage['/base.js'].lineData[207] = 0;
  _$jscoverage['/base.js'].lineData[210] = 0;
  _$jscoverage['/base.js'].lineData[211] = 0;
  _$jscoverage['/base.js'].lineData[218] = 0;
  _$jscoverage['/base.js'].lineData[219] = 0;
  _$jscoverage['/base.js'].lineData[222] = 0;
  _$jscoverage['/base.js'].lineData[223] = 0;
  _$jscoverage['/base.js'].lineData[230] = 0;
  _$jscoverage['/base.js'].lineData[232] = 0;
  _$jscoverage['/base.js'].lineData[233] = 0;
  _$jscoverage['/base.js'].lineData[235] = 0;
  _$jscoverage['/base.js'].lineData[236] = 0;
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
  _$jscoverage['/base.js'].branchData['15'] = [];
  _$jscoverage['/base.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['18'] = [];
  _$jscoverage['/base.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['40'] = [];
  _$jscoverage['/base.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['40'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['41'] = [];
  _$jscoverage['/base.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['41'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['42'] = [];
  _$jscoverage['/base.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['42'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['52'] = [];
  _$jscoverage['/base.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['56'] = [];
  _$jscoverage['/base.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['61'] = [];
  _$jscoverage['/base.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['64'] = [];
  _$jscoverage['/base.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['67'] = [];
  _$jscoverage['/base.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['72'] = [];
  _$jscoverage['/base.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['75'] = [];
  _$jscoverage['/base.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['78'] = [];
  _$jscoverage['/base.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['88'] = [];
  _$jscoverage['/base.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['101'] = [];
  _$jscoverage['/base.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['113'] = [];
  _$jscoverage['/base.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['117'] = [];
  _$jscoverage['/base.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['117'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['117'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['117'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['117'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['117'][6] = new BranchData();
  _$jscoverage['/base.js'].branchData['117'][7] = new BranchData();
  _$jscoverage['/base.js'].branchData['121'] = [];
  _$jscoverage['/base.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['127'] = [];
  _$jscoverage['/base.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['131'] = [];
  _$jscoverage['/base.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['131'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['131'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['131'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['131'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['131'][6] = new BranchData();
  _$jscoverage['/base.js'].branchData['131'][7] = new BranchData();
  _$jscoverage['/base.js'].branchData['134'] = [];
  _$jscoverage['/base.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['142'] = [];
  _$jscoverage['/base.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['165'] = [];
  _$jscoverage['/base.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['166'] = [];
  _$jscoverage['/base.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['168'] = [];
  _$jscoverage['/base.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['173'] = [];
  _$jscoverage['/base.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['175'] = [];
  _$jscoverage['/base.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['186'] = [];
  _$jscoverage['/base.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['196'] = [];
  _$jscoverage['/base.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['199'] = [];
  _$jscoverage['/base.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['210'] = [];
  _$jscoverage['/base.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['218'] = [];
  _$jscoverage['/base.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['222'] = [];
  _$jscoverage['/base.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['232'] = [];
  _$jscoverage['/base.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['235'] = [];
  _$jscoverage['/base.js'].branchData['235'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['235'][1].init(135, 17, 'top !== undefined');
function visit59_235_1(result) {
  _$jscoverage['/base.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['232'][1].init(22, 18, 'left !== undefined');
function visit58_232_1(result) {
  _$jscoverage['/base.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['222'][1].init(297, 17, 'top !== undefined');
function visit57_222_1(result) {
  _$jscoverage['/base.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['218'][1].init(42, 18, 'left !== undefined');
function visit56_218_1(result) {
  _$jscoverage['/base.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['210'][1].init(116, 4, 'anim');
function visit55_210_1(result) {
  _$jscoverage['/base.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['199'][1].init(272, 7, 'cfg.top');
function visit54_199_1(result) {
  _$jscoverage['/base.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['196'][1].init(138, 8, 'cfg.left');
function visit53_196_1(result) {
  _$jscoverage['/base.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['186'][1].init(78, 51, '(pageOffset = self.pagesOffset) && pageOffset[index]');
function visit52_186_1(result) {
  _$jscoverage['/base.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['175'][1].init(72, 15, 'offset[p2] <= v');
function visit51_175_1(result) {
  _$jscoverage['/base.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['173'][1].init(51, 6, 'i >= 0');
function visit50_173_1(result) {
  _$jscoverage['/base.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['168'][1].init(72, 15, 'offset[p2] >= v');
function visit49_168_1(result) {
  _$jscoverage['/base.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['166'][1].init(30, 22, 'i < pagesOffset.length');
function visit48_166_1(result) {
  _$jscoverage['/base.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['165'][1].init(261, 13, 'direction > 0');
function visit47_165_1(result) {
  _$jscoverage['/base.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['142'][1].init(38, 11, 'axis == \'x\'');
function visit46_142_1(result) {
  _$jscoverage['/base.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['134'][1].init(124, 21, 'isTouchEventSupported');
function visit45_134_1(result) {
  _$jscoverage['/base.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['131'][7].init(214, 10, 'deltaX < 0');
function visit44_131_7(result) {
  _$jscoverage['/base.js'].branchData['131'][7].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['131'][6].init(193, 17, 'scrollLeft >= max');
function visit43_131_6(result) {
  _$jscoverage['/base.js'].branchData['131'][6].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['131'][5].init(193, 31, 'scrollLeft >= max && deltaX < 0');
function visit42_131_5(result) {
  _$jscoverage['/base.js'].branchData['131'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['131'][4].init(179, 10, 'deltaX > 0');
function visit41_131_4(result) {
  _$jscoverage['/base.js'].branchData['131'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['131'][3].init(158, 17, 'scrollLeft <= min');
function visit40_131_3(result) {
  _$jscoverage['/base.js'].branchData['131'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['131'][2].init(158, 31, 'scrollLeft <= min && deltaX > 0');
function visit39_131_2(result) {
  _$jscoverage['/base.js'].branchData['131'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['131'][1].init(158, 66, 'scrollLeft <= min && deltaX > 0 || scrollLeft >= max && deltaX < 0');
function visit38_131_1(result) {
  _$jscoverage['/base.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['127'][1].init(981, 46, '(deltaX = e.deltaX) && self.allowScroll[\'left\']');
function visit37_127_1(result) {
  _$jscoverage['/base.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['121'][1].init(171, 21, 'isTouchEventSupported');
function visit36_121_1(result) {
  _$jscoverage['/base.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['117'][7].init(208, 10, 'deltaY < 0');
function visit35_117_7(result) {
  _$jscoverage['/base.js'].branchData['117'][7].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['117'][6].init(188, 16, 'scrollTop >= max');
function visit34_117_6(result) {
  _$jscoverage['/base.js'].branchData['117'][6].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['117'][5].init(188, 30, 'scrollTop >= max && deltaY < 0');
function visit33_117_5(result) {
  _$jscoverage['/base.js'].branchData['117'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['117'][4].init(174, 10, 'deltaY > 0');
function visit32_117_4(result) {
  _$jscoverage['/base.js'].branchData['117'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['117'][3].init(154, 16, 'scrollTop <= min');
function visit31_117_3(result) {
  _$jscoverage['/base.js'].branchData['117'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['117'][2].init(154, 30, 'scrollTop <= min && deltaY > 0');
function visit30_117_2(result) {
  _$jscoverage['/base.js'].branchData['117'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['117'][1].init(154, 64, 'scrollTop <= min && deltaY > 0 || scrollTop >= max && deltaY < 0');
function visit29_117_1(result) {
  _$jscoverage['/base.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['113'][1].init(368, 45, '(deltaY = e.deltaY) && self.allowScroll[\'top\']');
function visit28_113_1(result) {
  _$jscoverage['/base.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['101'][1].init(18, 20, 'this.get(\'disabled\')');
function visit27_101_1(result) {
  _$jscoverage['/base.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['88'][1].init(51, 18, 'control.scrollStep');
function visit26_88_1(result) {
  _$jscoverage['/base.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['78'][1].init(301, 23, 'keyCode == KeyCode.LEFT');
function visit25_78_1(result) {
  _$jscoverage['/base.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['75'][1].init(132, 24, 'keyCode == KeyCode.RIGHT');
function visit24_75_1(result) {
  _$jscoverage['/base.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['72'][1].init(1667, 6, 'allowX');
function visit23_72_1(result) {
  _$jscoverage['/base.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['67'][1].init(734, 26, 'keyCode == KeyCode.PAGE_UP');
function visit22_67_1(result) {
  _$jscoverage['/base.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['64'][1].init(562, 28, 'keyCode == KeyCode.PAGE_DOWN');
function visit21_64_1(result) {
  _$jscoverage['/base.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['61'][1].init(398, 21, 'keyCode == KeyCode.UP');
function visit20_61_1(result) {
  _$jscoverage['/base.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['56'][1].init(184, 23, 'keyCode == KeyCode.DOWN');
function visit19_56_1(result) {
  _$jscoverage['/base.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['52'][1].init(735, 6, 'allowY');
function visit18_52_1(result) {
  _$jscoverage['/base.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['42'][2].init(336, 20, 'nodeName == \'select\'');
function visit17_42_2(result) {
  _$jscoverage['/base.js'].branchData['42'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['42'][1].init(42, 75, 'nodeName == \'select\' || $target.hasAttr(\'contenteditable\')');
function visit16_42_1(result) {
  _$jscoverage['/base.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['41'][2].init(292, 22, 'nodeName == \'textarea\'');
function visit15_41_2(result) {
  _$jscoverage['/base.js'].branchData['41'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['41'][1].init(39, 118, 'nodeName == \'textarea\' || nodeName == \'select\' || $target.hasAttr(\'contenteditable\')');
function visit14_41_1(result) {
  _$jscoverage['/base.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['40'][2].init(250, 19, 'nodeName == \'input\'');
function visit13_40_2(result) {
  _$jscoverage['/base.js'].branchData['40'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['40'][1].init(250, 158, 'nodeName == \'input\' || nodeName == \'textarea\' || nodeName == \'select\' || $target.hasAttr(\'contenteditable\')');
function visit12_40_1(result) {
  _$jscoverage['/base.js'].branchData['40'][1].ranCondition(result);
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
KISSY.add('scroll-view/base', function(S, Node, Container, Render, undefined) {
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
  return Container.extend({
  bindUI: function() {
  _$jscoverage['/base.js'].functionData[2]++;
  _$jscoverage['/base.js'].lineData[26]++;
  var self = this, $el = self.$el;
  _$jscoverage['/base.js'].lineData[31]++;
  $el.on('mousewheel', self.handleMouseWheel, self).on('scroll', onElScroll, self);
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/base.js'].functionData[3]++;
  _$jscoverage['/base.js'].lineData[36]++;
  var target = e.target, $target = $(target), nodeName = $target.nodeName();
  _$jscoverage['/base.js'].lineData[40]++;
  if (visit12_40_1(visit13_40_2(nodeName == 'input') || visit14_41_1(visit15_41_2(nodeName == 'textarea') || visit16_42_1(visit17_42_2(nodeName == 'select') || $target.hasAttr('contenteditable'))))) {
    _$jscoverage['/base.js'].lineData[44]++;
    return undefined;
  }
  _$jscoverage['/base.js'].lineData[46]++;
  var self = this, keyCode = e.keyCode, scrollStep = self.getScrollStep(), ok = undefined;
  _$jscoverage['/base.js'].lineData[50]++;
  var allowX = self.allowScroll['left'];
  _$jscoverage['/base.js'].lineData[51]++;
  var allowY = self.allowScroll['top'];
  _$jscoverage['/base.js'].lineData[52]++;
  if (visit18_52_1(allowY)) {
    _$jscoverage['/base.js'].lineData[53]++;
    var scrollStepY = scrollStep.top, clientHeight = self.clientHeight, scrollTop = self.get('scrollTop');
    _$jscoverage['/base.js'].lineData[56]++;
    if (visit19_56_1(keyCode == KeyCode.DOWN)) {
      _$jscoverage['/base.js'].lineData[57]++;
      self.scrollToWithBounds({
  top: scrollTop + scrollStepY});
      _$jscoverage['/base.js'].lineData[60]++;
      ok = true;
    } else {
      _$jscoverage['/base.js'].lineData[61]++;
      if (visit20_61_1(keyCode == KeyCode.UP)) {
        _$jscoverage['/base.js'].lineData[62]++;
        self.scrollToWithBounds({
  top: scrollTop - scrollStepY});
        _$jscoverage['/base.js'].lineData[63]++;
        ok = true;
      } else {
        _$jscoverage['/base.js'].lineData[64]++;
        if (visit21_64_1(keyCode == KeyCode.PAGE_DOWN)) {
          _$jscoverage['/base.js'].lineData[65]++;
          self.scrollToWithBounds({
  top: scrollTop + clientHeight});
          _$jscoverage['/base.js'].lineData[66]++;
          ok = true;
        } else {
          _$jscoverage['/base.js'].lineData[67]++;
          if (visit22_67_1(keyCode == KeyCode.PAGE_UP)) {
            _$jscoverage['/base.js'].lineData[68]++;
            self.scrollToWithBounds({
  top: scrollTop - clientHeight});
            _$jscoverage['/base.js'].lineData[69]++;
            ok = true;
          }
        }
      }
    }
  }
  _$jscoverage['/base.js'].lineData[72]++;
  if (visit23_72_1(allowX)) {
    _$jscoverage['/base.js'].lineData[73]++;
    var scrollStepX = scrollStep.left;
    _$jscoverage['/base.js'].lineData[74]++;
    var scrollLeft = self.get('scrollLeft');
    _$jscoverage['/base.js'].lineData[75]++;
    if (visit24_75_1(keyCode == KeyCode.RIGHT)) {
      _$jscoverage['/base.js'].lineData[76]++;
      self.scrollToWithBounds({
  left: scrollLeft + scrollStepX});
      _$jscoverage['/base.js'].lineData[77]++;
      ok = true;
    } else {
      _$jscoverage['/base.js'].lineData[78]++;
      if (visit25_78_1(keyCode == KeyCode.LEFT)) {
        _$jscoverage['/base.js'].lineData[79]++;
        self.scrollToWithBounds({
  left: scrollLeft - scrollStepX});
        _$jscoverage['/base.js'].lineData[80]++;
        ok = true;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[83]++;
  return ok;
}, 
  getScrollStep: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[87]++;
  var control = this;
  _$jscoverage['/base.js'].lineData[88]++;
  if (visit26_88_1(control.scrollStep)) {
    _$jscoverage['/base.js'].lineData[89]++;
    return control.scrollStep;
  }
  _$jscoverage['/base.js'].lineData[91]++;
  var elDoc = $(this.get('el')[0].ownerDocument);
  _$jscoverage['/base.js'].lineData[92]++;
  var clientHeight = control.clientHeight;
  _$jscoverage['/base.js'].lineData[93]++;
  var clientWidth = control.clientWidth;
  _$jscoverage['/base.js'].lineData[94]++;
  return control.scrollStep = {
  top: Math.max(clientHeight * clientHeight * 0.7 / elDoc.height(), 20), 
  left: Math.max(clientWidth * clientWidth * 0.7 / elDoc.width(), 20)};
}, 
  handleMouseWheel: function(e) {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[101]++;
  if (visit27_101_1(this.get('disabled'))) {
    _$jscoverage['/base.js'].lineData[102]++;
    return;
  }
  _$jscoverage['/base.js'].lineData[104]++;
  var max, min, self = this, scrollStep = self.getScrollStep(), deltaY, deltaX, maxScroll = self.maxScroll, minScroll = self.minScroll;
  _$jscoverage['/base.js'].lineData[113]++;
  if (visit28_113_1((deltaY = e.deltaY) && self.allowScroll['top'])) {
    _$jscoverage['/base.js'].lineData[114]++;
    var scrollTop = self.get('scrollTop');
    _$jscoverage['/base.js'].lineData[115]++;
    max = maxScroll.top;
    _$jscoverage['/base.js'].lineData[116]++;
    min = minScroll.top;
    _$jscoverage['/base.js'].lineData[117]++;
    if (visit29_117_1(visit30_117_2(visit31_117_3(scrollTop <= min) && visit32_117_4(deltaY > 0)) || visit33_117_5(visit34_117_6(scrollTop >= max) && visit35_117_7(deltaY < 0)))) {
    } else {
      _$jscoverage['/base.js'].lineData[119]++;
      self.scrollToWithBounds({
  top: scrollTop - e.deltaY * scrollStep['top']});
      _$jscoverage['/base.js'].lineData[121]++;
      if (visit36_121_1(isTouchEventSupported)) {
        _$jscoverage['/base.js'].lineData[122]++;
        e.preventDefault();
      }
    }
  }
  _$jscoverage['/base.js'].lineData[127]++;
  if (visit37_127_1((deltaX = e.deltaX) && self.allowScroll['left'])) {
    _$jscoverage['/base.js'].lineData[128]++;
    var scrollLeft = self.get('scrollLeft');
    _$jscoverage['/base.js'].lineData[129]++;
    max = maxScroll.left;
    _$jscoverage['/base.js'].lineData[130]++;
    min = minScroll.left;
    _$jscoverage['/base.js'].lineData[131]++;
    if (visit38_131_1(visit39_131_2(visit40_131_3(scrollLeft <= min) && visit41_131_4(deltaX > 0)) || visit42_131_5(visit43_131_6(scrollLeft >= max) && visit44_131_7(deltaX < 0)))) {
    } else {
      _$jscoverage['/base.js'].lineData[133]++;
      self.scrollToWithBounds({
  left: scrollLeft - e.deltaX * scrollStep['left']});
      _$jscoverage['/base.js'].lineData[134]++;
      if (visit45_134_1(isTouchEventSupported)) {
        _$jscoverage['/base.js'].lineData[135]++;
        e.preventDefault();
      }
    }
  }
}, 
  'isAxisEnabled': function(axis) {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[142]++;
  return this.allowScroll[visit46_142_1(axis == 'x') ? 'left' : 'top'];
}, 
  stopAnimation: function() {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[146]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[147]++;
  self.$contentEl.stop();
  _$jscoverage['/base.js'].lineData[148]++;
  self.scrollToWithBounds({
  left: self.get('scrollLeft'), 
  top: self.get('scrollTop')});
}, 
  '_uiSetPageIndex': function(v) {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[155]++;
  this.scrollToPage(v);
}, 
  _getPageIndexFromXY: function(v, allowX, direction) {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[159]++;
  var pagesOffset = this.pagesOffset.concat([]);
  _$jscoverage['/base.js'].lineData[160]++;
  var p2 = allowX ? 'left' : 'top';
  _$jscoverage['/base.js'].lineData[161]++;
  var i, offset;
  _$jscoverage['/base.js'].lineData[162]++;
  pagesOffset.sort(function(e1, e2) {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[163]++;
  return e1[p2] - e2[p2];
});
  _$jscoverage['/base.js'].lineData[165]++;
  if (visit47_165_1(direction > 0)) {
    _$jscoverage['/base.js'].lineData[166]++;
    for (i = 0; visit48_166_1(i < pagesOffset.length); i++) {
      _$jscoverage['/base.js'].lineData[167]++;
      offset = pagesOffset[i];
      _$jscoverage['/base.js'].lineData[168]++;
      if (visit49_168_1(offset[p2] >= v)) {
        _$jscoverage['/base.js'].lineData[169]++;
        return offset.index;
      }
    }
  } else {
    _$jscoverage['/base.js'].lineData[173]++;
    for (i = pagesOffset.length - 1; visit50_173_1(i >= 0); i--) {
      _$jscoverage['/base.js'].lineData[174]++;
      offset = pagesOffset[i];
      _$jscoverage['/base.js'].lineData[175]++;
      if (visit51_175_1(offset[p2] <= v)) {
        _$jscoverage['/base.js'].lineData[176]++;
        return offset.index;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[180]++;
  return undefined;
}, 
  scrollToPage: function(index, animCfg) {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[184]++;
  var self = this, pageOffset;
  _$jscoverage['/base.js'].lineData[186]++;
  if (visit52_186_1((pageOffset = self.pagesOffset) && pageOffset[index])) {
    _$jscoverage['/base.js'].lineData[187]++;
    self.set('pageIndex', index);
    _$jscoverage['/base.js'].lineData[188]++;
    self.scrollTo(pageOffset[index], animCfg);
  }
}, 
  scrollToWithBounds: function(cfg, anim) {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[193]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[194]++;
  var maxScroll = self.maxScroll;
  _$jscoverage['/base.js'].lineData[195]++;
  var minScroll = self.minScroll;
  _$jscoverage['/base.js'].lineData[196]++;
  if (visit53_196_1(cfg.left)) {
    _$jscoverage['/base.js'].lineData[197]++;
    cfg.left = Math.min(Math.max(cfg.left, minScroll.left), maxScroll.left);
  }
  _$jscoverage['/base.js'].lineData[199]++;
  if (visit54_199_1(cfg.top)) {
    _$jscoverage['/base.js'].lineData[200]++;
    cfg.top = Math.min(Math.max(cfg.top, minScroll.top), maxScroll.top);
  }
  _$jscoverage['/base.js'].lineData[202]++;
  self.scrollTo(cfg, anim);
}, 
  scrollTo: function(cfg, anim) {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[206]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[207]++;
  var left = cfg.left, top = cfg.top;
  _$jscoverage['/base.js'].lineData[210]++;
  if (visit55_210_1(anim)) {
    _$jscoverage['/base.js'].lineData[211]++;
    var scrollLeft = self.get('scrollLeft'), scrollTop = self.get('scrollTop'), contentEl = self.$contentEl, animProperty = {
  xx: {
  fx: {
  frame: function(anim, fx) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[218]++;
  if (visit56_218_1(left !== undefined)) {
    _$jscoverage['/base.js'].lineData[219]++;
    self.set('scrollLeft', scrollLeft + fx.pos * (left - scrollLeft));
  }
  _$jscoverage['/base.js'].lineData[222]++;
  if (visit57_222_1(top !== undefined)) {
    _$jscoverage['/base.js'].lineData[223]++;
    self.set('scrollTop', scrollTop + fx.pos * (top - scrollTop));
  }
}}}};
    _$jscoverage['/base.js'].lineData[230]++;
    contentEl.animate(animProperty, anim);
  } else {
    _$jscoverage['/base.js'].lineData[232]++;
    if (visit58_232_1(left !== undefined)) {
      _$jscoverage['/base.js'].lineData[233]++;
      self.set('scrollLeft', left);
    }
    _$jscoverage['/base.js'].lineData[235]++;
    if (visit59_235_1(top !== undefined)) {
      _$jscoverage['/base.js'].lineData[236]++;
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
