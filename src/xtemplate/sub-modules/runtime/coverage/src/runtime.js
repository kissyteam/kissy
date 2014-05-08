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
if (! _$jscoverage['/runtime.js']) {
  _$jscoverage['/runtime.js'] = {};
  _$jscoverage['/runtime.js'].lineData = [];
  _$jscoverage['/runtime.js'].lineData[6] = 0;
  _$jscoverage['/runtime.js'].lineData[7] = 0;
  _$jscoverage['/runtime.js'].lineData[8] = 0;
  _$jscoverage['/runtime.js'].lineData[9] = 0;
  _$jscoverage['/runtime.js'].lineData[10] = 0;
  _$jscoverage['/runtime.js'].lineData[11] = 0;
  _$jscoverage['/runtime.js'].lineData[12] = 0;
  _$jscoverage['/runtime.js'].lineData[14] = 0;
  _$jscoverage['/runtime.js'].lineData[15] = 0;
  _$jscoverage['/runtime.js'].lineData[16] = 0;
  _$jscoverage['/runtime.js'].lineData[17] = 0;
  _$jscoverage['/runtime.js'].lineData[18] = 0;
  _$jscoverage['/runtime.js'].lineData[20] = 0;
  _$jscoverage['/runtime.js'].lineData[21] = 0;
  _$jscoverage['/runtime.js'].lineData[22] = 0;
  _$jscoverage['/runtime.js'].lineData[23] = 0;
  _$jscoverage['/runtime.js'].lineData[24] = 0;
  _$jscoverage['/runtime.js'].lineData[25] = 0;
  _$jscoverage['/runtime.js'].lineData[29] = 0;
  _$jscoverage['/runtime.js'].lineData[32] = 0;
  _$jscoverage['/runtime.js'].lineData[33] = 0;
  _$jscoverage['/runtime.js'].lineData[34] = 0;
  _$jscoverage['/runtime.js'].lineData[35] = 0;
  _$jscoverage['/runtime.js'].lineData[36] = 0;
  _$jscoverage['/runtime.js'].lineData[37] = 0;
  _$jscoverage['/runtime.js'].lineData[38] = 0;
  _$jscoverage['/runtime.js'].lineData[39] = 0;
  _$jscoverage['/runtime.js'].lineData[40] = 0;
  _$jscoverage['/runtime.js'].lineData[42] = 0;
  _$jscoverage['/runtime.js'].lineData[45] = 0;
  _$jscoverage['/runtime.js'].lineData[48] = 0;
  _$jscoverage['/runtime.js'].lineData[49] = 0;
  _$jscoverage['/runtime.js'].lineData[50] = 0;
  _$jscoverage['/runtime.js'].lineData[51] = 0;
  _$jscoverage['/runtime.js'].lineData[52] = 0;
  _$jscoverage['/runtime.js'].lineData[54] = 0;
  _$jscoverage['/runtime.js'].lineData[55] = 0;
  _$jscoverage['/runtime.js'].lineData[57] = 0;
  _$jscoverage['/runtime.js'].lineData[58] = 0;
  _$jscoverage['/runtime.js'].lineData[60] = 0;
  _$jscoverage['/runtime.js'].lineData[63] = 0;
  _$jscoverage['/runtime.js'].lineData[64] = 0;
  _$jscoverage['/runtime.js'].lineData[65] = 0;
  _$jscoverage['/runtime.js'].lineData[66] = 0;
  _$jscoverage['/runtime.js'].lineData[67] = 0;
  _$jscoverage['/runtime.js'].lineData[68] = 0;
  _$jscoverage['/runtime.js'].lineData[70] = 0;
  _$jscoverage['/runtime.js'].lineData[71] = 0;
  _$jscoverage['/runtime.js'].lineData[73] = 0;
  _$jscoverage['/runtime.js'].lineData[75] = 0;
  _$jscoverage['/runtime.js'].lineData[76] = 0;
  _$jscoverage['/runtime.js'].lineData[77] = 0;
  _$jscoverage['/runtime.js'].lineData[78] = 0;
  _$jscoverage['/runtime.js'].lineData[79] = 0;
  _$jscoverage['/runtime.js'].lineData[82] = 0;
  _$jscoverage['/runtime.js'].lineData[83] = 0;
  _$jscoverage['/runtime.js'].lineData[85] = 0;
  _$jscoverage['/runtime.js'].lineData[88] = 0;
  _$jscoverage['/runtime.js'].lineData[90] = 0;
  _$jscoverage['/runtime.js'].lineData[93] = 0;
  _$jscoverage['/runtime.js'].lineData[108] = 0;
  _$jscoverage['/runtime.js'].lineData[109] = 0;
  _$jscoverage['/runtime.js'].lineData[110] = 0;
  _$jscoverage['/runtime.js'].lineData[111] = 0;
  _$jscoverage['/runtime.js'].lineData[112] = 0;
  _$jscoverage['/runtime.js'].lineData[113] = 0;
  _$jscoverage['/runtime.js'].lineData[114] = 0;
  _$jscoverage['/runtime.js'].lineData[115] = 0;
  _$jscoverage['/runtime.js'].lineData[118] = 0;
  _$jscoverage['/runtime.js'].lineData[134] = 0;
  _$jscoverage['/runtime.js'].lineData[145] = 0;
  _$jscoverage['/runtime.js'].lineData[149] = 0;
  _$jscoverage['/runtime.js'].lineData[159] = 0;
  _$jscoverage['/runtime.js'].lineData[163] = 0;
  _$jscoverage['/runtime.js'].lineData[164] = 0;
  _$jscoverage['/runtime.js'].lineData[166] = 0;
  _$jscoverage['/runtime.js'].lineData[167] = 0;
  _$jscoverage['/runtime.js'].lineData[168] = 0;
  _$jscoverage['/runtime.js'].lineData[170] = 0;
  _$jscoverage['/runtime.js'].lineData[171] = 0;
  _$jscoverage['/runtime.js'].lineData[172] = 0;
  _$jscoverage['/runtime.js'].lineData[174] = 0;
  _$jscoverage['/runtime.js'].lineData[176] = 0;
  _$jscoverage['/runtime.js'].lineData[178] = 0;
  _$jscoverage['/runtime.js'].lineData[182] = 0;
  _$jscoverage['/runtime.js'].lineData[183] = 0;
  _$jscoverage['/runtime.js'].lineData[184] = 0;
  _$jscoverage['/runtime.js'].lineData[186] = 0;
  _$jscoverage['/runtime.js'].lineData[188] = 0;
  _$jscoverage['/runtime.js'].lineData[189] = 0;
  _$jscoverage['/runtime.js'].lineData[199] = 0;
  _$jscoverage['/runtime.js'].lineData[202] = 0;
  _$jscoverage['/runtime.js'].lineData[203] = 0;
  _$jscoverage['/runtime.js'].lineData[207] = 0;
  _$jscoverage['/runtime.js'].lineData[208] = 0;
  _$jscoverage['/runtime.js'].lineData[210] = 0;
  _$jscoverage['/runtime.js'].lineData[211] = 0;
  _$jscoverage['/runtime.js'].lineData[212] = 0;
  _$jscoverage['/runtime.js'].lineData[214] = 0;
  _$jscoverage['/runtime.js'].lineData[215] = 0;
  _$jscoverage['/runtime.js'].lineData[216] = 0;
  _$jscoverage['/runtime.js'].lineData[220] = 0;
  _$jscoverage['/runtime.js'].lineData[222] = 0;
  _$jscoverage['/runtime.js'].lineData[227] = 0;
  _$jscoverage['/runtime.js'].lineData[237] = 0;
  _$jscoverage['/runtime.js'].lineData[238] = 0;
  _$jscoverage['/runtime.js'].lineData[239] = 0;
  _$jscoverage['/runtime.js'].lineData[249] = 0;
  _$jscoverage['/runtime.js'].lineData[250] = 0;
  _$jscoverage['/runtime.js'].lineData[251] = 0;
  _$jscoverage['/runtime.js'].lineData[255] = 0;
  _$jscoverage['/runtime.js'].lineData[256] = 0;
  _$jscoverage['/runtime.js'].lineData[257] = 0;
  _$jscoverage['/runtime.js'].lineData[258] = 0;
  _$jscoverage['/runtime.js'].lineData[259] = 0;
  _$jscoverage['/runtime.js'].lineData[260] = 0;
  _$jscoverage['/runtime.js'].lineData[262] = 0;
  _$jscoverage['/runtime.js'].lineData[275] = 0;
  _$jscoverage['/runtime.js'].lineData[276] = 0;
  _$jscoverage['/runtime.js'].lineData[277] = 0;
  _$jscoverage['/runtime.js'].lineData[278] = 0;
  _$jscoverage['/runtime.js'].lineData[280] = 0;
  _$jscoverage['/runtime.js'].lineData[283] = 0;
  _$jscoverage['/runtime.js'].lineData[284] = 0;
  _$jscoverage['/runtime.js'].lineData[285] = 0;
  _$jscoverage['/runtime.js'].lineData[286] = 0;
  _$jscoverage['/runtime.js'].lineData[287] = 0;
  _$jscoverage['/runtime.js'].lineData[288] = 0;
  _$jscoverage['/runtime.js'].lineData[290] = 0;
  _$jscoverage['/runtime.js'].lineData[293] = 0;
  _$jscoverage['/runtime.js'].lineData[294] = 0;
  _$jscoverage['/runtime.js'].lineData[296] = 0;
  _$jscoverage['/runtime.js'].lineData[298] = 0;
  _$jscoverage['/runtime.js'].lineData[299] = 0;
  _$jscoverage['/runtime.js'].lineData[303] = 0;
  _$jscoverage['/runtime.js'].lineData[305] = 0;
}
if (! _$jscoverage['/runtime.js'].functionData) {
  _$jscoverage['/runtime.js'].functionData = [];
  _$jscoverage['/runtime.js'].functionData[0] = 0;
  _$jscoverage['/runtime.js'].functionData[1] = 0;
  _$jscoverage['/runtime.js'].functionData[2] = 0;
  _$jscoverage['/runtime.js'].functionData[3] = 0;
  _$jscoverage['/runtime.js'].functionData[4] = 0;
  _$jscoverage['/runtime.js'].functionData[5] = 0;
  _$jscoverage['/runtime.js'].functionData[6] = 0;
  _$jscoverage['/runtime.js'].functionData[7] = 0;
  _$jscoverage['/runtime.js'].functionData[8] = 0;
  _$jscoverage['/runtime.js'].functionData[9] = 0;
  _$jscoverage['/runtime.js'].functionData[10] = 0;
  _$jscoverage['/runtime.js'].functionData[11] = 0;
  _$jscoverage['/runtime.js'].functionData[12] = 0;
  _$jscoverage['/runtime.js'].functionData[13] = 0;
  _$jscoverage['/runtime.js'].functionData[14] = 0;
  _$jscoverage['/runtime.js'].functionData[15] = 0;
  _$jscoverage['/runtime.js'].functionData[16] = 0;
  _$jscoverage['/runtime.js'].functionData[17] = 0;
  _$jscoverage['/runtime.js'].functionData[18] = 0;
  _$jscoverage['/runtime.js'].functionData[19] = 0;
  _$jscoverage['/runtime.js'].functionData[20] = 0;
  _$jscoverage['/runtime.js'].functionData[21] = 0;
  _$jscoverage['/runtime.js'].functionData[22] = 0;
}
if (! _$jscoverage['/runtime.js'].branchData) {
  _$jscoverage['/runtime.js'].branchData = {};
  _$jscoverage['/runtime.js'].branchData['16'] = [];
  _$jscoverage['/runtime.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['16'][2] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['17'] = [];
  _$jscoverage['/runtime.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['20'] = [];
  _$jscoverage['/runtime.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['22'] = [];
  _$jscoverage['/runtime.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['24'] = [];
  _$jscoverage['/runtime.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['36'] = [];
  _$jscoverage['/runtime.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['38'] = [];
  _$jscoverage['/runtime.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['39'] = [];
  _$jscoverage['/runtime.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['51'] = [];
  _$jscoverage['/runtime.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['57'] = [];
  _$jscoverage['/runtime.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['67'] = [];
  _$jscoverage['/runtime.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['70'] = [];
  _$jscoverage['/runtime.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['75'] = [];
  _$jscoverage['/runtime.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['78'] = [];
  _$jscoverage['/runtime.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['82'] = [];
  _$jscoverage['/runtime.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['111'] = [];
  _$jscoverage['/runtime.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['115'] = [];
  _$jscoverage['/runtime.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['163'] = [];
  _$jscoverage['/runtime.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['167'] = [];
  _$jscoverage['/runtime.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['171'] = [];
  _$jscoverage['/runtime.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['183'] = [];
  _$jscoverage['/runtime.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['202'] = [];
  _$jscoverage['/runtime.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['202'][2] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['211'] = [];
  _$jscoverage['/runtime.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['215'] = [];
  _$jscoverage['/runtime.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['238'] = [];
  _$jscoverage['/runtime.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['250'] = [];
  _$jscoverage['/runtime.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['259'] = [];
  _$jscoverage['/runtime.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['277'] = [];
  _$jscoverage['/runtime.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['284'] = [];
  _$jscoverage['/runtime.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['287'] = [];
  _$jscoverage['/runtime.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['293'] = [];
  _$jscoverage['/runtime.js'].branchData['293'][1] = new BranchData();
}
_$jscoverage['/runtime.js'].branchData['293'][1].init(683, 31, '!self.name && self.tpl.TPL_NAME');
function visit90_293_1(result) {
  _$jscoverage['/runtime.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['287'][1].init(97, 7, 'i < len');
function visit89_287_1(result) {
  _$jscoverage['/runtime.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['284'][1].init(302, 27, 'self.config.cache !== false');
function visit88_284_1(result) {
  _$jscoverage['/runtime.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['277'][1].init(83, 79, 'callback || function(error, ret) {\n  html = ret;\n}');
function visit87_277_1(result) {
  _$jscoverage['/runtime.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['259'][1].init(26, 5, 'error');
function visit86_259_1(result) {
  _$jscoverage['/runtime.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['250'][1].init(71, 21, 'config.commands || {}');
function visit85_250_1(result) {
  _$jscoverage['/runtime.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['238'][1].init(57, 15, 'config.commands');
function visit84_238_1(result) {
  _$jscoverage['/runtime.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['215'][1].init(59, 15, 'cache !== false');
function visit83_215_1(result) {
  _$jscoverage['/runtime.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['211'][1].init(22, 5, 'error');
function visit82_211_1(result) {
  _$jscoverage['/runtime.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['202'][2].init(127, 15, 'cache !== false');
function visit81_202_2(result) {
  _$jscoverage['/runtime.js'].branchData['202'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['202'][1].init(127, 47, 'cache !== false && pool.hasInstance(subTplName)');
function visit80_202_1(result) {
  _$jscoverage['/runtime.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['183'][1].init(64, 3, 'tpl');
function visit79_183_1(result) {
  _$jscoverage['/runtime.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['171'][1].init(288, 5, '!name');
function visit78_171_1(result) {
  _$jscoverage['/runtime.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['167'][1].init(163, 14, 'cache[subName]');
function visit77_167_1(result) {
  _$jscoverage['/runtime.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['163'][1].init(18, 25, 'subName.charAt(0) !== \'.\'');
function visit76_163_1(result) {
  _$jscoverage['/runtime.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['115'][1].init(212, 19, 'config.root || self');
function visit75_115_1(result) {
  _$jscoverage['/runtime.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['111'][1].init(70, 12, 'config || {}');
function visit74_111_1(result) {
  _$jscoverage['/runtime.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['82'][1].init(701, 5, 'error');
function visit73_82_1(result) {
  _$jscoverage['/runtime.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['78'][1].init(133, 2, 'fn');
function visit72_78_1(result) {
  _$jscoverage['/runtime.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['75'][1].init(449, 14, 'resolveInScope');
function visit71_75_1(result) {
  _$jscoverage['/runtime.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['70'][1].init(215, 8, 'command1');
function visit70_70_1(result) {
  _$jscoverage['/runtime.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['67'][1].init(127, 6, '!depth');
function visit69_67_1(result) {
  _$jscoverage['/runtime.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['57'][1].init(333, 13, 'extendTplName');
function visit68_57_1(result) {
  _$jscoverage['/runtime.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['51'][1].init(82, 26, 'tpl.TPL_NAME && !self.name');
function visit67_51_1(result) {
  _$jscoverage['/runtime.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['39'][1].init(102, 16, 'subPart === \'..\'');
function visit66_39_1(result) {
  _$jscoverage['/runtime.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['38'][1].init(58, 15, 'subPart === \'.\'');
function visit65_38_1(result) {
  _$jscoverage['/runtime.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['36'][1].init(157, 5, 'i < l');
function visit64_36_1(result) {
  _$jscoverage['/runtime.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['24'][1].init(60, 4, '!cmd');
function visit63_24_1(result) {
  _$jscoverage['/runtime.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['22'][1].init(67, 7, 'i < len');
function visit62_22_1(result) {
  _$jscoverage['/runtime.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['20'][1].init(190, 3, 'cmd');
function visit61_20_1(result) {
  _$jscoverage['/runtime.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['17'][1].init(119, 18, 'parts.length === 1');
function visit60_17_1(result) {
  _$jscoverage['/runtime.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['16'][2].init(50, 36, 'localCommands && localCommands[name]');
function visit59_16_2(result) {
  _$jscoverage['/runtime.js'].branchData['16'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['16'][1].init(50, 54, 'localCommands && localCommands[name] || commands[name]');
function visit58_16_1(result) {
  _$jscoverage['/runtime.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/runtime.js'].functionData[0]++;
  _$jscoverage['/runtime.js'].lineData[7]++;
  require('util');
  _$jscoverage['/runtime.js'].lineData[8]++;
  var nativeCommands = require('./runtime/commands');
  _$jscoverage['/runtime.js'].lineData[9]++;
  var commands = {};
  _$jscoverage['/runtime.js'].lineData[10]++;
  var Scope = require('./runtime/scope');
  _$jscoverage['/runtime.js'].lineData[11]++;
  var LinkedBuffer = require('./runtime/linked-buffer');
  _$jscoverage['/runtime.js'].lineData[12]++;
  var pool = require('./runtime/pool');
  _$jscoverage['/runtime.js'].lineData[14]++;
  function findCommand(localCommands, parts) {
    _$jscoverage['/runtime.js'].functionData[1]++;
    _$jscoverage['/runtime.js'].lineData[15]++;
    var name = parts[0];
    _$jscoverage['/runtime.js'].lineData[16]++;
    var cmd = visit58_16_1(visit59_16_2(localCommands && localCommands[name]) || commands[name]);
    _$jscoverage['/runtime.js'].lineData[17]++;
    if (visit60_17_1(parts.length === 1)) {
      _$jscoverage['/runtime.js'].lineData[18]++;
      return cmd;
    }
    _$jscoverage['/runtime.js'].lineData[20]++;
    if (visit61_20_1(cmd)) {
      _$jscoverage['/runtime.js'].lineData[21]++;
      var len = parts.length;
      _$jscoverage['/runtime.js'].lineData[22]++;
      for (var i = 1; visit62_22_1(i < len); i++) {
        _$jscoverage['/runtime.js'].lineData[23]++;
        cmd = cmd[parts[i]];
        _$jscoverage['/runtime.js'].lineData[24]++;
        if (visit63_24_1(!cmd)) {
          _$jscoverage['/runtime.js'].lineData[25]++;
          break;
        }
      }
    }
    _$jscoverage['/runtime.js'].lineData[29]++;
    return cmd;
  }
  _$jscoverage['/runtime.js'].lineData[32]++;
  function getSubNameFromParentName(parentName, subName) {
    _$jscoverage['/runtime.js'].functionData[2]++;
    _$jscoverage['/runtime.js'].lineData[33]++;
    var parts = parentName.split('/');
    _$jscoverage['/runtime.js'].lineData[34]++;
    var subParts = subName.split('/');
    _$jscoverage['/runtime.js'].lineData[35]++;
    parts.pop();
    _$jscoverage['/runtime.js'].lineData[36]++;
    for (var i = 0, l = subParts.length; visit64_36_1(i < l); i++) {
      _$jscoverage['/runtime.js'].lineData[37]++;
      var subPart = subParts[i];
      _$jscoverage['/runtime.js'].lineData[38]++;
      if (visit65_38_1(subPart === '.')) {
      } else {
        _$jscoverage['/runtime.js'].lineData[39]++;
        if (visit66_39_1(subPart === '..')) {
          _$jscoverage['/runtime.js'].lineData[40]++;
          parts.pop();
        } else {
          _$jscoverage['/runtime.js'].lineData[42]++;
          parts.push(subPart);
        }
      }
    }
    _$jscoverage['/runtime.js'].lineData[45]++;
    return parts.join('/');
  }
  _$jscoverage['/runtime.js'].lineData[48]++;
  function renderTpl(self, scope, buffer, session) {
    _$jscoverage['/runtime.js'].functionData[3]++;
    _$jscoverage['/runtime.js'].lineData[49]++;
    var tpl = self.tpl;
    _$jscoverage['/runtime.js'].lineData[50]++;
    session.extendTplName = null;
    _$jscoverage['/runtime.js'].lineData[51]++;
    if (visit67_51_1(tpl.TPL_NAME && !self.name)) {
      _$jscoverage['/runtime.js'].lineData[52]++;
      self.name = tpl.TPL_NAME;
    }
    _$jscoverage['/runtime.js'].lineData[54]++;
    buffer = tpl.call(self, scope, buffer, session);
    _$jscoverage['/runtime.js'].lineData[55]++;
    var extendTplName = session.extendTplName;
    _$jscoverage['/runtime.js'].lineData[57]++;
    if (visit68_57_1(extendTplName)) {
      _$jscoverage['/runtime.js'].lineData[58]++;
      buffer = self.include(extendTplName, scope, buffer, session);
    }
    _$jscoverage['/runtime.js'].lineData[60]++;
    return buffer.end();
  }
  _$jscoverage['/runtime.js'].lineData[63]++;
  function callFn(engine, scope, option, buffer, parts, depth, line, resolveInScope) {
    _$jscoverage['/runtime.js'].functionData[4]++;
    _$jscoverage['/runtime.js'].lineData[64]++;
    var commands = engine.getRoot().config.commands;
    _$jscoverage['/runtime.js'].lineData[65]++;
    var error, caller, fn;
    _$jscoverage['/runtime.js'].lineData[66]++;
    var command1;
    _$jscoverage['/runtime.js'].lineData[67]++;
    if (visit69_67_1(!depth)) {
      _$jscoverage['/runtime.js'].lineData[68]++;
      command1 = findCommand(commands, parts);
    }
    _$jscoverage['/runtime.js'].lineData[70]++;
    if (visit70_70_1(command1)) {
      _$jscoverage['/runtime.js'].lineData[71]++;
      return command1.call(engine, scope, option, buffer, line);
    } else {
      _$jscoverage['/runtime.js'].lineData[73]++;
      error = 'in file: ' + engine.name + ' can not call: ' + parts.join('.') + '" at line ' + line;
    }
    _$jscoverage['/runtime.js'].lineData[75]++;
    if (visit71_75_1(resolveInScope)) {
      _$jscoverage['/runtime.js'].lineData[76]++;
      caller = scope.resolve(parts.slice(0, -1), depth);
      _$jscoverage['/runtime.js'].lineData[77]++;
      fn = caller[parts[parts.length - 1]];
      _$jscoverage['/runtime.js'].lineData[78]++;
      if (visit72_78_1(fn)) {
        _$jscoverage['/runtime.js'].lineData[79]++;
        return fn.apply(caller, option.params);
      }
    }
    _$jscoverage['/runtime.js'].lineData[82]++;
    if (visit73_82_1(error)) {
      _$jscoverage['/runtime.js'].lineData[83]++;
      S.error(error);
    }
    _$jscoverage['/runtime.js'].lineData[85]++;
    return buffer;
  }
  _$jscoverage['/runtime.js'].lineData[88]++;
  var utils = {
  callFn: function(engine, scope, option, buffer, parts, depth, line) {
  _$jscoverage['/runtime.js'].functionData[5]++;
  _$jscoverage['/runtime.js'].lineData[90]++;
  return callFn(engine, scope, option, buffer, parts, depth, line, true);
}, 
  callCommand: function(engine, scope, option, buffer, parts, line) {
  _$jscoverage['/runtime.js'].functionData[6]++;
  _$jscoverage['/runtime.js'].lineData[93]++;
  return callFn(engine, scope, option, buffer, parts, 0, line, true);
}};
  _$jscoverage['/runtime.js'].lineData[108]++;
  function XTemplateRuntime(tpl, config) {
    _$jscoverage['/runtime.js'].functionData[7]++;
    _$jscoverage['/runtime.js'].lineData[109]++;
    var self = this;
    _$jscoverage['/runtime.js'].lineData[110]++;
    self.tpl = tpl;
    _$jscoverage['/runtime.js'].lineData[111]++;
    config = visit74_111_1(config || {});
    _$jscoverage['/runtime.js'].lineData[112]++;
    self.name = config.name;
    _$jscoverage['/runtime.js'].lineData[113]++;
    self.config = config;
    _$jscoverage['/runtime.js'].lineData[114]++;
    self.subNameResolveCache = {};
    _$jscoverage['/runtime.js'].lineData[115]++;
    config.root = visit75_115_1(config.root || self);
  }
  _$jscoverage['/runtime.js'].lineData[118]++;
  S.mix(XTemplateRuntime, {
  nativeCommands: nativeCommands, 
  pool: pool, 
  utils: utils, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[8]++;
  _$jscoverage['/runtime.js'].lineData[134]++;
  commands[commandName] = fn;
}, 
  removeCommand: function(commandName) {
  _$jscoverage['/runtime.js'].functionData[9]++;
  _$jscoverage['/runtime.js'].lineData[145]++;
  delete commands[commandName];
}});
  _$jscoverage['/runtime.js'].lineData[149]++;
  XTemplateRuntime.prototype = {
  constructor: XTemplateRuntime, 
  Scope: Scope, 
  nativeCommands: nativeCommands, 
  utils: utils, 
  getRoot: function() {
  _$jscoverage['/runtime.js'].functionData[10]++;
  _$jscoverage['/runtime.js'].lineData[159]++;
  return this.config.root;
}, 
  resolve: function(subName) {
  _$jscoverage['/runtime.js'].functionData[11]++;
  _$jscoverage['/runtime.js'].lineData[163]++;
  if (visit76_163_1(subName.charAt(0) !== '.')) {
    _$jscoverage['/runtime.js'].lineData[164]++;
    return subName;
  }
  _$jscoverage['/runtime.js'].lineData[166]++;
  var cache = this.subNameResolveCache;
  _$jscoverage['/runtime.js'].lineData[167]++;
  if (visit77_167_1(cache[subName])) {
    _$jscoverage['/runtime.js'].lineData[168]++;
    return cache[subName];
  }
  _$jscoverage['/runtime.js'].lineData[170]++;
  var name = this.name;
  _$jscoverage['/runtime.js'].lineData[171]++;
  if (visit78_171_1(!name)) {
    _$jscoverage['/runtime.js'].lineData[172]++;
    var error = 'parent template does not have name' + ' for relative sub tpl name: ' + subName;
    _$jscoverage['/runtime.js'].lineData[174]++;
    throw new Error(error);
  }
  _$jscoverage['/runtime.js'].lineData[176]++;
  subName = cache[subName] = getSubNameFromParentName(name, subName);
  _$jscoverage['/runtime.js'].lineData[178]++;
  return subName;
}, 
  loadContent: function(subTplName, callback) {
  _$jscoverage['/runtime.js'].functionData[12]++;
  _$jscoverage['/runtime.js'].lineData[182]++;
  var tpl = S.require(subTplName);
  _$jscoverage['/runtime.js'].lineData[183]++;
  if (visit79_183_1(tpl)) {
    _$jscoverage['/runtime.js'].lineData[184]++;
    callback(undefined, tpl);
  } else {
    _$jscoverage['/runtime.js'].lineData[186]++;
    var warning = 'template "' + subTplName + '" does not exist, ' + 'better required or used first for performance!';
    _$jscoverage['/runtime.js'].lineData[188]++;
    S.log(warning, 'error');
    _$jscoverage['/runtime.js'].lineData[189]++;
    callback(warning, undefined);
  }
}, 
  load: function(subTplName, session, callback) {
  _$jscoverage['/runtime.js'].functionData[13]++;
  _$jscoverage['/runtime.js'].lineData[199]++;
  var self = this, engine, cache = self.getRoot().config.cache;
  _$jscoverage['/runtime.js'].lineData[202]++;
  if (visit80_202_1(visit81_202_2(cache !== false) && pool.hasInstance(subTplName))) {
    _$jscoverage['/runtime.js'].lineData[203]++;
    engine = pool.getInstance(undefined, {
  name: subTplName, 
  root: self.getRoot()}, self.constructor);
    _$jscoverage['/runtime.js'].lineData[207]++;
    session.descendants.push(engine);
    _$jscoverage['/runtime.js'].lineData[208]++;
    return callback(undefined, engine);
  }
  _$jscoverage['/runtime.js'].lineData[210]++;
  self.loadContent(subTplName, function(error, tpl) {
  _$jscoverage['/runtime.js'].functionData[14]++;
  _$jscoverage['/runtime.js'].lineData[211]++;
  if (visit82_211_1(error)) {
    _$jscoverage['/runtime.js'].lineData[212]++;
    callback(error);
  } else {
    _$jscoverage['/runtime.js'].lineData[214]++;
    var engine;
    _$jscoverage['/runtime.js'].lineData[215]++;
    if (visit83_215_1(cache !== false)) {
      _$jscoverage['/runtime.js'].lineData[216]++;
      engine = pool.getInstance(tpl, {
  name: subTplName, 
  root: self.getRoot()}, self.constructor);
      _$jscoverage['/runtime.js'].lineData[220]++;
      session.descendants.push(engine);
    } else {
      _$jscoverage['/runtime.js'].lineData[222]++;
      engine = new self.constructor(tpl, {
  name: subTplName, 
  root: self.getRoot()});
    }
    _$jscoverage['/runtime.js'].lineData[227]++;
    callback(undefined, engine);
  }
});
}, 
  removeCommand: function(commandName) {
  _$jscoverage['/runtime.js'].functionData[15]++;
  _$jscoverage['/runtime.js'].lineData[237]++;
  var config = this.config;
  _$jscoverage['/runtime.js'].lineData[238]++;
  if (visit84_238_1(config.commands)) {
    _$jscoverage['/runtime.js'].lineData[239]++;
    delete config.commands[commandName];
  }
}, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[16]++;
  _$jscoverage['/runtime.js'].lineData[249]++;
  var config = this.config;
  _$jscoverage['/runtime.js'].lineData[250]++;
  config.commands = visit85_250_1(config.commands || {});
  _$jscoverage['/runtime.js'].lineData[251]++;
  config.commands[commandName] = fn;
}, 
  include: function(subTplName, scope, buffer, session) {
  _$jscoverage['/runtime.js'].functionData[17]++;
  _$jscoverage['/runtime.js'].lineData[255]++;
  var self = this;
  _$jscoverage['/runtime.js'].lineData[256]++;
  subTplName = self.resolve(subTplName);
  _$jscoverage['/runtime.js'].lineData[257]++;
  return buffer.async(function(newBuffer) {
  _$jscoverage['/runtime.js'].functionData[18]++;
  _$jscoverage['/runtime.js'].lineData[258]++;
  self.load(subTplName, session, function(error, engine) {
  _$jscoverage['/runtime.js'].functionData[19]++;
  _$jscoverage['/runtime.js'].lineData[259]++;
  if (visit86_259_1(error)) {
    _$jscoverage['/runtime.js'].lineData[260]++;
    newBuffer.error(error);
  } else {
    _$jscoverage['/runtime.js'].lineData[262]++;
    renderTpl(engine, scope, newBuffer, session);
  }
});
});
}, 
  render: function(data, callback) {
  _$jscoverage['/runtime.js'].functionData[20]++;
  _$jscoverage['/runtime.js'].lineData[275]++;
  var html = '';
  _$jscoverage['/runtime.js'].lineData[276]++;
  var self = this;
  _$jscoverage['/runtime.js'].lineData[277]++;
  callback = visit87_277_1(callback || function(error, ret) {
  _$jscoverage['/runtime.js'].functionData[21]++;
  _$jscoverage['/runtime.js'].lineData[278]++;
  html = ret;
});
  _$jscoverage['/runtime.js'].lineData[280]++;
  var session = {
  descendants: []};
  _$jscoverage['/runtime.js'].lineData[283]++;
  var finalCallback = callback;
  _$jscoverage['/runtime.js'].lineData[284]++;
  if (visit88_284_1(self.config.cache !== false)) {
    _$jscoverage['/runtime.js'].lineData[285]++;
    finalCallback = function(error, ret) {
  _$jscoverage['/runtime.js'].functionData[22]++;
  _$jscoverage['/runtime.js'].lineData[286]++;
  var len = session.descendants.length;
  _$jscoverage['/runtime.js'].lineData[287]++;
  for (var i = 0; visit89_287_1(i < len); i++) {
    _$jscoverage['/runtime.js'].lineData[288]++;
    pool.recycle(session.descendants[i]);
  }
  _$jscoverage['/runtime.js'].lineData[290]++;
  callback(error, ret);
};
  }
  _$jscoverage['/runtime.js'].lineData[293]++;
  if (visit90_293_1(!self.name && self.tpl.TPL_NAME)) {
    _$jscoverage['/runtime.js'].lineData[294]++;
    self.name = self.tpl.TPL_NAME;
  }
  _$jscoverage['/runtime.js'].lineData[296]++;
  var scope = new Scope(data), buffer = new LinkedBuffer(finalCallback).head;
  _$jscoverage['/runtime.js'].lineData[298]++;
  renderTpl(self, scope, buffer, session);
  _$jscoverage['/runtime.js'].lineData[299]++;
  return html;
}};
  _$jscoverage['/runtime.js'].lineData[303]++;
  XTemplateRuntime.Scope = Scope;
  _$jscoverage['/runtime.js'].lineData[305]++;
  return XTemplateRuntime;
});
