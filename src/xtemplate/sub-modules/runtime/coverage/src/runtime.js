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
  _$jscoverage['/runtime.js'].lineData[13] = 0;
  _$jscoverage['/runtime.js'].lineData[14] = 0;
  _$jscoverage['/runtime.js'].lineData[15] = 0;
  _$jscoverage['/runtime.js'].lineData[16] = 0;
  _$jscoverage['/runtime.js'].lineData[17] = 0;
  _$jscoverage['/runtime.js'].lineData[19] = 0;
  _$jscoverage['/runtime.js'].lineData[20] = 0;
  _$jscoverage['/runtime.js'].lineData[21] = 0;
  _$jscoverage['/runtime.js'].lineData[22] = 0;
  _$jscoverage['/runtime.js'].lineData[23] = 0;
  _$jscoverage['/runtime.js'].lineData[24] = 0;
  _$jscoverage['/runtime.js'].lineData[28] = 0;
  _$jscoverage['/runtime.js'].lineData[31] = 0;
  _$jscoverage['/runtime.js'].lineData[32] = 0;
  _$jscoverage['/runtime.js'].lineData[33] = 0;
  _$jscoverage['/runtime.js'].lineData[34] = 0;
  _$jscoverage['/runtime.js'].lineData[35] = 0;
  _$jscoverage['/runtime.js'].lineData[36] = 0;
  _$jscoverage['/runtime.js'].lineData[37] = 0;
  _$jscoverage['/runtime.js'].lineData[38] = 0;
  _$jscoverage['/runtime.js'].lineData[39] = 0;
  _$jscoverage['/runtime.js'].lineData[41] = 0;
  _$jscoverage['/runtime.js'].lineData[44] = 0;
  _$jscoverage['/runtime.js'].lineData[47] = 0;
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
  _$jscoverage['/runtime.js'].lineData[113] = 0;
  _$jscoverage['/runtime.js'].lineData[114] = 0;
  _$jscoverage['/runtime.js'].lineData[116] = 0;
  _$jscoverage['/runtime.js'].lineData[119] = 0;
  _$jscoverage['/runtime.js'].lineData[133] = 0;
  _$jscoverage['/runtime.js'].lineData[144] = 0;
  _$jscoverage['/runtime.js'].lineData[148] = 0;
  _$jscoverage['/runtime.js'].lineData[163] = 0;
  _$jscoverage['/runtime.js'].lineData[164] = 0;
  _$jscoverage['/runtime.js'].lineData[165] = 0;
  _$jscoverage['/runtime.js'].lineData[167] = 0;
  _$jscoverage['/runtime.js'].lineData[169] = 0;
  _$jscoverage['/runtime.js'].lineData[170] = 0;
  _$jscoverage['/runtime.js'].lineData[179] = 0;
  _$jscoverage['/runtime.js'].lineData[180] = 0;
  _$jscoverage['/runtime.js'].lineData[181] = 0;
  _$jscoverage['/runtime.js'].lineData[191] = 0;
  _$jscoverage['/runtime.js'].lineData[192] = 0;
  _$jscoverage['/runtime.js'].lineData[193] = 0;
  _$jscoverage['/runtime.js'].lineData[197] = 0;
  _$jscoverage['/runtime.js'].lineData[198] = 0;
  _$jscoverage['/runtime.js'].lineData[199] = 0;
  _$jscoverage['/runtime.js'].lineData[200] = 0;
  _$jscoverage['/runtime.js'].lineData[201] = 0;
  _$jscoverage['/runtime.js'].lineData[203] = 0;
  _$jscoverage['/runtime.js'].lineData[205] = 0;
  _$jscoverage['/runtime.js'].lineData[207] = 0;
  _$jscoverage['/runtime.js'].lineData[208] = 0;
  _$jscoverage['/runtime.js'].lineData[209] = 0;
  _$jscoverage['/runtime.js'].lineData[210] = 0;
  _$jscoverage['/runtime.js'].lineData[212] = 0;
  _$jscoverage['/runtime.js'].lineData[213] = 0;
  _$jscoverage['/runtime.js'].lineData[214] = 0;
  _$jscoverage['/runtime.js'].lineData[216] = 0;
  _$jscoverage['/runtime.js'].lineData[229] = 0;
  _$jscoverage['/runtime.js'].lineData[230] = 0;
  _$jscoverage['/runtime.js'].lineData[231] = 0;
  _$jscoverage['/runtime.js'].lineData[232] = 0;
  _$jscoverage['/runtime.js'].lineData[234] = 0;
  _$jscoverage['/runtime.js'].lineData[235] = 0;
  _$jscoverage['/runtime.js'].lineData[237] = 0;
  _$jscoverage['/runtime.js'].lineData[239] = 0;
  _$jscoverage['/runtime.js'].lineData[240] = 0;
  _$jscoverage['/runtime.js'].lineData[244] = 0;
  _$jscoverage['/runtime.js'].lineData[246] = 0;
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
}
if (! _$jscoverage['/runtime.js'].branchData) {
  _$jscoverage['/runtime.js'].branchData = {};
  _$jscoverage['/runtime.js'].branchData['15'] = [];
  _$jscoverage['/runtime.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['15'][2] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['16'] = [];
  _$jscoverage['/runtime.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['19'] = [];
  _$jscoverage['/runtime.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['21'] = [];
  _$jscoverage['/runtime.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['23'] = [];
  _$jscoverage['/runtime.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['35'] = [];
  _$jscoverage['/runtime.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['37'] = [];
  _$jscoverage['/runtime.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['38'] = [];
  _$jscoverage['/runtime.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['49'] = [];
  _$jscoverage['/runtime.js'].branchData['49'][1] = new BranchData();
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
  _$jscoverage['/runtime.js'].branchData['113'] = [];
  _$jscoverage['/runtime.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['164'] = [];
  _$jscoverage['/runtime.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['180'] = [];
  _$jscoverage['/runtime.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['192'] = [];
  _$jscoverage['/runtime.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['199'] = [];
  _$jscoverage['/runtime.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['200'] = [];
  _$jscoverage['/runtime.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['209'] = [];
  _$jscoverage['/runtime.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['212'] = [];
  _$jscoverage['/runtime.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['231'] = [];
  _$jscoverage['/runtime.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['234'] = [];
  _$jscoverage['/runtime.js'].branchData['234'][1] = new BranchData();
}
_$jscoverage['/runtime.js'].branchData['234'][1].init(181, 31, '!self.name && self.tpl.TPL_NAME');
function visit79_234_1(result) {
  _$jscoverage['/runtime.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['231'][1].init(83, 79, 'callback || function(error, ret) {\n  html = ret;\n}');
function visit78_231_1(result) {
  _$jscoverage['/runtime.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['212'][1].init(30, 37, '!(engine instanceof XTemplateRuntime)');
function visit77_212_1(result) {
  _$jscoverage['/runtime.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['209'][1].init(26, 5, 'error');
function visit76_209_1(result) {
  _$jscoverage['/runtime.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['200'][1].init(22, 7, '!myName');
function visit75_200_1(result) {
  _$jscoverage['/runtime.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['199'][1].init(85, 28, 'subTplName.charAt(0) === \'.\'');
function visit74_199_1(result) {
  _$jscoverage['/runtime.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['192'][1].init(71, 21, 'config.commands || {}');
function visit73_192_1(result) {
  _$jscoverage['/runtime.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['180'][1].init(57, 15, 'config.commands');
function visit72_180_1(result) {
  _$jscoverage['/runtime.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['164'][1].init(64, 3, 'tpl');
function visit71_164_1(result) {
  _$jscoverage['/runtime.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['113'][1].init(139, 11, 'config.name');
function visit70_113_1(result) {
  _$jscoverage['/runtime.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['111'][1].init(70, 12, 'config || {}');
function visit69_111_1(result) {
  _$jscoverage['/runtime.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['82'][1].init(691, 5, 'error');
function visit68_82_1(result) {
  _$jscoverage['/runtime.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['78'][1].init(133, 2, 'fn');
function visit67_78_1(result) {
  _$jscoverage['/runtime.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['75'][1].init(439, 14, 'resolveInScope');
function visit66_75_1(result) {
  _$jscoverage['/runtime.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['70'][1].init(205, 8, 'command1');
function visit65_70_1(result) {
  _$jscoverage['/runtime.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['67'][1].init(117, 6, '!depth');
function visit64_67_1(result) {
  _$jscoverage['/runtime.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['57'][1].init(367, 13, 'extendTplName');
function visit63_57_1(result) {
  _$jscoverage['/runtime.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['51'][1].init(116, 26, 'tpl.TPL_NAME && !self.name');
function visit62_51_1(result) {
  _$jscoverage['/runtime.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['49'][1].init(49, 13, 'payload || {}');
function visit61_49_1(result) {
  _$jscoverage['/runtime.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['38'][1].init(102, 16, 'subPart === \'..\'');
function visit60_38_1(result) {
  _$jscoverage['/runtime.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['37'][1].init(58, 15, 'subPart === \'.\'');
function visit59_37_1(result) {
  _$jscoverage['/runtime.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['35'][1].init(157, 5, 'i < l');
function visit58_35_1(result) {
  _$jscoverage['/runtime.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['23'][1].init(60, 4, '!cmd');
function visit57_23_1(result) {
  _$jscoverage['/runtime.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['21'][1].init(67, 7, 'i < len');
function visit56_21_1(result) {
  _$jscoverage['/runtime.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['19'][1].init(190, 3, 'cmd');
function visit55_19_1(result) {
  _$jscoverage['/runtime.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['16'][1].init(119, 18, 'parts.length === 1');
function visit54_16_1(result) {
  _$jscoverage['/runtime.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['15'][2].init(50, 36, 'localCommands && localCommands[name]');
function visit53_15_2(result) {
  _$jscoverage['/runtime.js'].branchData['15'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['15'][1].init(50, 54, 'localCommands && localCommands[name] || commands[name]');
function visit52_15_1(result) {
  _$jscoverage['/runtime.js'].branchData['15'][1].ranCondition(result);
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
  _$jscoverage['/runtime.js'].lineData[13]++;
  function findCommand(localCommands, parts) {
    _$jscoverage['/runtime.js'].functionData[1]++;
    _$jscoverage['/runtime.js'].lineData[14]++;
    var name = parts[0];
    _$jscoverage['/runtime.js'].lineData[15]++;
    var cmd = visit52_15_1(visit53_15_2(localCommands && localCommands[name]) || commands[name]);
    _$jscoverage['/runtime.js'].lineData[16]++;
    if (visit54_16_1(parts.length === 1)) {
      _$jscoverage['/runtime.js'].lineData[17]++;
      return cmd;
    }
    _$jscoverage['/runtime.js'].lineData[19]++;
    if (visit55_19_1(cmd)) {
      _$jscoverage['/runtime.js'].lineData[20]++;
      var len = parts.length;
      _$jscoverage['/runtime.js'].lineData[21]++;
      for (var i = 1; visit56_21_1(i < len); i++) {
        _$jscoverage['/runtime.js'].lineData[22]++;
        cmd = cmd[parts[i]];
        _$jscoverage['/runtime.js'].lineData[23]++;
        if (visit57_23_1(!cmd)) {
          _$jscoverage['/runtime.js'].lineData[24]++;
          break;
        }
      }
    }
    _$jscoverage['/runtime.js'].lineData[28]++;
    return cmd;
  }
  _$jscoverage['/runtime.js'].lineData[31]++;
  function getSubNameFromParentName(parentName, subName) {
    _$jscoverage['/runtime.js'].functionData[2]++;
    _$jscoverage['/runtime.js'].lineData[32]++;
    var parts = parentName.split('/');
    _$jscoverage['/runtime.js'].lineData[33]++;
    var subParts = subName.split('/');
    _$jscoverage['/runtime.js'].lineData[34]++;
    parts.pop();
    _$jscoverage['/runtime.js'].lineData[35]++;
    for (var i = 0, l = subParts.length; visit58_35_1(i < l); i++) {
      _$jscoverage['/runtime.js'].lineData[36]++;
      var subPart = subParts[i];
      _$jscoverage['/runtime.js'].lineData[37]++;
      if (visit59_37_1(subPart === '.')) {
      } else {
        _$jscoverage['/runtime.js'].lineData[38]++;
        if (visit60_38_1(subPart === '..')) {
          _$jscoverage['/runtime.js'].lineData[39]++;
          parts.pop();
        } else {
          _$jscoverage['/runtime.js'].lineData[41]++;
          parts.push(subPart);
        }
      }
    }
    _$jscoverage['/runtime.js'].lineData[44]++;
    return parts.join('/');
  }
  _$jscoverage['/runtime.js'].lineData[47]++;
  function renderTpl(self, scope, buffer, payload) {
    _$jscoverage['/runtime.js'].functionData[3]++;
    _$jscoverage['/runtime.js'].lineData[48]++;
    var tpl = self.tpl;
    _$jscoverage['/runtime.js'].lineData[49]++;
    payload = visit61_49_1(payload || {});
    _$jscoverage['/runtime.js'].lineData[50]++;
    payload.extendTplName = null;
    _$jscoverage['/runtime.js'].lineData[51]++;
    if (visit62_51_1(tpl.TPL_NAME && !self.name)) {
      _$jscoverage['/runtime.js'].lineData[52]++;
      self.name = tpl.TPL_NAME;
    }
    _$jscoverage['/runtime.js'].lineData[54]++;
    buffer = tpl.call(self, scope, buffer, payload);
    _$jscoverage['/runtime.js'].lineData[55]++;
    var extendTplName = payload.extendTplName;
    _$jscoverage['/runtime.js'].lineData[57]++;
    if (visit63_57_1(extendTplName)) {
      _$jscoverage['/runtime.js'].lineData[58]++;
      buffer = self.include(extendTplName, scope, buffer, payload);
    }
    _$jscoverage['/runtime.js'].lineData[60]++;
    return buffer.end();
  }
  _$jscoverage['/runtime.js'].lineData[63]++;
  function callFn(engine, scope, option, buffer, parts, depth, line, resolveInScope) {
    _$jscoverage['/runtime.js'].functionData[4]++;
    _$jscoverage['/runtime.js'].lineData[64]++;
    var commands = engine.config.commands;
    _$jscoverage['/runtime.js'].lineData[65]++;
    var error, caller, fn;
    _$jscoverage['/runtime.js'].lineData[66]++;
    var command1;
    _$jscoverage['/runtime.js'].lineData[67]++;
    if (visit64_67_1(!depth)) {
      _$jscoverage['/runtime.js'].lineData[68]++;
      command1 = findCommand(commands, parts);
    }
    _$jscoverage['/runtime.js'].lineData[70]++;
    if (visit65_70_1(command1)) {
      _$jscoverage['/runtime.js'].lineData[71]++;
      return command1.call(engine, scope, option, buffer, line);
    } else {
      _$jscoverage['/runtime.js'].lineData[73]++;
      error = 'in file: ' + engine.name + ' can not call: ' + parts.join('.') + '" at line ' + line;
    }
    _$jscoverage['/runtime.js'].lineData[75]++;
    if (visit66_75_1(resolveInScope)) {
      _$jscoverage['/runtime.js'].lineData[76]++;
      caller = scope.resolve(parts.slice(0, -1), depth);
      _$jscoverage['/runtime.js'].lineData[77]++;
      fn = caller[parts[parts.length - 1]];
      _$jscoverage['/runtime.js'].lineData[78]++;
      if (visit67_78_1(fn)) {
        _$jscoverage['/runtime.js'].lineData[79]++;
        return fn.apply(caller, option.params);
      }
    }
    _$jscoverage['/runtime.js'].lineData[82]++;
    if (visit68_82_1(error)) {
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
    config = visit69_111_1(config || {});
    _$jscoverage['/runtime.js'].lineData[113]++;
    if (visit70_113_1(config.name)) {
      _$jscoverage['/runtime.js'].lineData[114]++;
      self.name = config.name;
    }
    _$jscoverage['/runtime.js'].lineData[116]++;
    self.config = config;
  }
  _$jscoverage['/runtime.js'].lineData[119]++;
  S.mix(XTemplateRuntime, {
  nativeCommands: nativeCommands, 
  utils: utils, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[8]++;
  _$jscoverage['/runtime.js'].lineData[133]++;
  commands[commandName] = fn;
}, 
  removeCommand: function(commandName) {
  _$jscoverage['/runtime.js'].functionData[9]++;
  _$jscoverage['/runtime.js'].lineData[144]++;
  delete commands[commandName];
}});
  _$jscoverage['/runtime.js'].lineData[148]++;
  XTemplateRuntime.prototype = {
  constructor: XTemplateRuntime, 
  Scope: Scope, 
  nativeCommands: nativeCommands, 
  utils: utils, 
  load: function(subTplName, callback) {
  _$jscoverage['/runtime.js'].functionData[10]++;
  _$jscoverage['/runtime.js'].lineData[163]++;
  var tpl = S.require(subTplName);
  _$jscoverage['/runtime.js'].lineData[164]++;
  if (visit71_164_1(tpl)) {
    _$jscoverage['/runtime.js'].lineData[165]++;
    callback(undefined, tpl);
  } else {
    _$jscoverage['/runtime.js'].lineData[167]++;
    var warning = 'template "' + subTplName + '" does not exist, ' + 'better required or used first for performance!';
    _$jscoverage['/runtime.js'].lineData[169]++;
    S.log(warning, 'error');
    _$jscoverage['/runtime.js'].lineData[170]++;
    callback(warning, undefined);
  }
}, 
  removeCommand: function(commandName) {
  _$jscoverage['/runtime.js'].functionData[11]++;
  _$jscoverage['/runtime.js'].lineData[179]++;
  var config = this.config;
  _$jscoverage['/runtime.js'].lineData[180]++;
  if (visit72_180_1(config.commands)) {
    _$jscoverage['/runtime.js'].lineData[181]++;
    delete config.commands[commandName];
  }
}, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[12]++;
  _$jscoverage['/runtime.js'].lineData[191]++;
  var config = this.config;
  _$jscoverage['/runtime.js'].lineData[192]++;
  config.commands = visit73_192_1(config.commands || {});
  _$jscoverage['/runtime.js'].lineData[193]++;
  config.commands[commandName] = fn;
}, 
  include: function(subTplName, scope, buffer, payload) {
  _$jscoverage['/runtime.js'].functionData[13]++;
  _$jscoverage['/runtime.js'].lineData[197]++;
  var self = this;
  _$jscoverage['/runtime.js'].lineData[198]++;
  var myName = self.name;
  _$jscoverage['/runtime.js'].lineData[199]++;
  if (visit74_199_1(subTplName.charAt(0) === '.')) {
    _$jscoverage['/runtime.js'].lineData[200]++;
    if (visit75_200_1(!myName)) {
      _$jscoverage['/runtime.js'].lineData[201]++;
      var error = 'parent template does not have name' + ' for relative sub tpl name: ' + subTplName;
      _$jscoverage['/runtime.js'].lineData[203]++;
      throw new Error(error);
    }
    _$jscoverage['/runtime.js'].lineData[205]++;
    subTplName = getSubNameFromParentName(myName, subTplName);
  }
  _$jscoverage['/runtime.js'].lineData[207]++;
  return buffer.async(function(newBuffer) {
  _$jscoverage['/runtime.js'].functionData[14]++;
  _$jscoverage['/runtime.js'].lineData[208]++;
  self.load(subTplName, function(error, engine) {
  _$jscoverage['/runtime.js'].functionData[15]++;
  _$jscoverage['/runtime.js'].lineData[209]++;
  if (visit76_209_1(error)) {
    _$jscoverage['/runtime.js'].lineData[210]++;
    newBuffer.error(error);
  } else {
    _$jscoverage['/runtime.js'].lineData[212]++;
    if (visit77_212_1(!(engine instanceof XTemplateRuntime))) {
      _$jscoverage['/runtime.js'].lineData[213]++;
      engine = new self.constructor(engine, self.config);
      _$jscoverage['/runtime.js'].lineData[214]++;
      engine.name = subTplName;
    }
    _$jscoverage['/runtime.js'].lineData[216]++;
    renderTpl(engine, scope, newBuffer, payload);
  }
});
});
}, 
  render: function(data, callback) {
  _$jscoverage['/runtime.js'].functionData[16]++;
  _$jscoverage['/runtime.js'].lineData[229]++;
  var html = '';
  _$jscoverage['/runtime.js'].lineData[230]++;
  var self = this;
  _$jscoverage['/runtime.js'].lineData[231]++;
  callback = visit78_231_1(callback || function(error, ret) {
  _$jscoverage['/runtime.js'].functionData[17]++;
  _$jscoverage['/runtime.js'].lineData[232]++;
  html = ret;
});
  _$jscoverage['/runtime.js'].lineData[234]++;
  if (visit79_234_1(!self.name && self.tpl.TPL_NAME)) {
    _$jscoverage['/runtime.js'].lineData[235]++;
    self.name = self.tpl.TPL_NAME;
  }
  _$jscoverage['/runtime.js'].lineData[237]++;
  var scope = new Scope(data), buffer = new LinkedBuffer(callback).head;
  _$jscoverage['/runtime.js'].lineData[239]++;
  renderTpl(self, scope, buffer);
  _$jscoverage['/runtime.js'].lineData[240]++;
  return html;
}};
  _$jscoverage['/runtime.js'].lineData[244]++;
  XTemplateRuntime.Scope = Scope;
  _$jscoverage['/runtime.js'].lineData[246]++;
  return XTemplateRuntime;
});
