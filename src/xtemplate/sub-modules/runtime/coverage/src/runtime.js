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
  _$jscoverage['/runtime.js'].lineData[17] = 0;
  _$jscoverage['/runtime.js'].lineData[18] = 0;
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
  _$jscoverage['/runtime.js'].lineData[76] = 0;
  _$jscoverage['/runtime.js'].lineData[91] = 0;
  _$jscoverage['/runtime.js'].lineData[92] = 0;
  _$jscoverage['/runtime.js'].lineData[93] = 0;
  _$jscoverage['/runtime.js'].lineData[94] = 0;
  _$jscoverage['/runtime.js'].lineData[96] = 0;
  _$jscoverage['/runtime.js'].lineData[97] = 0;
  _$jscoverage['/runtime.js'].lineData[99] = 0;
  _$jscoverage['/runtime.js'].lineData[102] = 0;
  _$jscoverage['/runtime.js'].lineData[116] = 0;
  _$jscoverage['/runtime.js'].lineData[127] = 0;
  _$jscoverage['/runtime.js'].lineData[131] = 0;
  _$jscoverage['/runtime.js'].lineData[146] = 0;
  _$jscoverage['/runtime.js'].lineData[147] = 0;
  _$jscoverage['/runtime.js'].lineData[148] = 0;
  _$jscoverage['/runtime.js'].lineData[150] = 0;
  _$jscoverage['/runtime.js'].lineData[152] = 0;
  _$jscoverage['/runtime.js'].lineData[153] = 0;
  _$jscoverage['/runtime.js'].lineData[162] = 0;
  _$jscoverage['/runtime.js'].lineData[163] = 0;
  _$jscoverage['/runtime.js'].lineData[164] = 0;
  _$jscoverage['/runtime.js'].lineData[174] = 0;
  _$jscoverage['/runtime.js'].lineData[175] = 0;
  _$jscoverage['/runtime.js'].lineData[176] = 0;
  _$jscoverage['/runtime.js'].lineData[180] = 0;
  _$jscoverage['/runtime.js'].lineData[181] = 0;
  _$jscoverage['/runtime.js'].lineData[182] = 0;
  _$jscoverage['/runtime.js'].lineData[183] = 0;
  _$jscoverage['/runtime.js'].lineData[184] = 0;
  _$jscoverage['/runtime.js'].lineData[186] = 0;
  _$jscoverage['/runtime.js'].lineData[188] = 0;
  _$jscoverage['/runtime.js'].lineData[190] = 0;
  _$jscoverage['/runtime.js'].lineData[191] = 0;
  _$jscoverage['/runtime.js'].lineData[192] = 0;
  _$jscoverage['/runtime.js'].lineData[193] = 0;
  _$jscoverage['/runtime.js'].lineData[195] = 0;
  _$jscoverage['/runtime.js'].lineData[196] = 0;
  _$jscoverage['/runtime.js'].lineData[197] = 0;
  _$jscoverage['/runtime.js'].lineData[199] = 0;
  _$jscoverage['/runtime.js'].lineData[212] = 0;
  _$jscoverage['/runtime.js'].lineData[213] = 0;
  _$jscoverage['/runtime.js'].lineData[214] = 0;
  _$jscoverage['/runtime.js'].lineData[215] = 0;
  _$jscoverage['/runtime.js'].lineData[217] = 0;
  _$jscoverage['/runtime.js'].lineData[218] = 0;
  _$jscoverage['/runtime.js'].lineData[220] = 0;
  _$jscoverage['/runtime.js'].lineData[221] = 0;
  _$jscoverage['/runtime.js'].lineData[225] = 0;
  _$jscoverage['/runtime.js'].lineData[227] = 0;
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
}
if (! _$jscoverage['/runtime.js'].branchData) {
  _$jscoverage['/runtime.js'].branchData = {};
  _$jscoverage['/runtime.js'].branchData['14'] = [];
  _$jscoverage['/runtime.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['15'] = [];
  _$jscoverage['/runtime.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['15'][2] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['18'] = [];
  _$jscoverage['/runtime.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['18'][2] = new BranchData();
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
  _$jscoverage['/runtime.js'].branchData['94'] = [];
  _$jscoverage['/runtime.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['96'] = [];
  _$jscoverage['/runtime.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['147'] = [];
  _$jscoverage['/runtime.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['163'] = [];
  _$jscoverage['/runtime.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['175'] = [];
  _$jscoverage['/runtime.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['182'] = [];
  _$jscoverage['/runtime.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['183'] = [];
  _$jscoverage['/runtime.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['192'] = [];
  _$jscoverage['/runtime.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['195'] = [];
  _$jscoverage['/runtime.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['214'] = [];
  _$jscoverage['/runtime.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['217'] = [];
  _$jscoverage['/runtime.js'].branchData['217'][1] = new BranchData();
}
_$jscoverage['/runtime.js'].branchData['217'][1].init(181, 31, '!self.name && self.tpl.TPL_NAME');
function visit78_217_1(result) {
  _$jscoverage['/runtime.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['214'][1].init(83, 79, 'callback || function(error, ret) {\n  html = ret;\n}');
function visit77_214_1(result) {
  _$jscoverage['/runtime.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['195'][1].init(30, 37, '!(engine instanceof XTemplateRuntime)');
function visit76_195_1(result) {
  _$jscoverage['/runtime.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['192'][1].init(26, 5, 'error');
function visit75_192_1(result) {
  _$jscoverage['/runtime.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['183'][1].init(22, 7, '!myName');
function visit74_183_1(result) {
  _$jscoverage['/runtime.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['182'][1].init(85, 28, 'subTplName.charAt(0) === \'.\'');
function visit73_182_1(result) {
  _$jscoverage['/runtime.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['175'][1].init(71, 21, 'config.commands || {}');
function visit72_175_1(result) {
  _$jscoverage['/runtime.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['163'][1].init(57, 15, 'config.commands');
function visit71_163_1(result) {
  _$jscoverage['/runtime.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['147'][1].init(64, 3, 'tpl');
function visit70_147_1(result) {
  _$jscoverage['/runtime.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['96'][1].init(139, 11, 'config.name');
function visit69_96_1(result) {
  _$jscoverage['/runtime.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['94'][1].init(70, 12, 'config || {}');
function visit68_94_1(result) {
  _$jscoverage['/runtime.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['67'][1].init(135, 8, 'command1');
function visit67_67_1(result) {
  _$jscoverage['/runtime.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['57'][1].init(367, 13, 'extendTplName');
function visit66_57_1(result) {
  _$jscoverage['/runtime.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['51'][1].init(116, 26, 'tpl.TPL_NAME && !self.name');
function visit65_51_1(result) {
  _$jscoverage['/runtime.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['49'][1].init(49, 13, 'payload || {}');
function visit64_49_1(result) {
  _$jscoverage['/runtime.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['38'][1].init(102, 16, 'subPart === \'..\'');
function visit63_38_1(result) {
  _$jscoverage['/runtime.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['37'][1].init(58, 15, 'subPart === \'.\'');
function visit62_37_1(result) {
  _$jscoverage['/runtime.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['35'][1].init(157, 5, 'i < l');
function visit61_35_1(result) {
  _$jscoverage['/runtime.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['23'][1].init(60, 4, '!cmd');
function visit60_23_1(result) {
  _$jscoverage['/runtime.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['21'][1].init(67, 7, 'i < len');
function visit59_21_1(result) {
  _$jscoverage['/runtime.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['19'][1].init(263, 3, 'cmd');
function visit58_19_1(result) {
  _$jscoverage['/runtime.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['18'][2].init(186, 40, 'localCommands && localCommands[parts[0]]');
function visit57_18_2(result) {
  _$jscoverage['/runtime.js'].branchData['18'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['18'][1].init(186, 62, 'localCommands && localCommands[parts[0]] || commands[parts[0]]');
function visit56_18_1(result) {
  _$jscoverage['/runtime.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['15'][2].init(21, 36, 'localCommands && localCommands[name]');
function visit55_15_2(result) {
  _$jscoverage['/runtime.js'].branchData['15'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['15'][1].init(21, 54, 'localCommands && localCommands[name] || commands[name]');
function visit54_15_1(result) {
  _$jscoverage['/runtime.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['14'][1].init(14, 24, 'name.indexOf(\'.\') === -1');
function visit53_14_1(result) {
  _$jscoverage['/runtime.js'].branchData['14'][1].ranCondition(result);
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
  function findCommand(localCommands, name) {
    _$jscoverage['/runtime.js'].functionData[1]++;
    _$jscoverage['/runtime.js'].lineData[14]++;
    if (visit53_14_1(name.indexOf('.') === -1)) {
      _$jscoverage['/runtime.js'].lineData[15]++;
      return visit54_15_1(visit55_15_2(localCommands && localCommands[name]) || commands[name]);
    }
    _$jscoverage['/runtime.js'].lineData[17]++;
    var parts = name.split('.');
    _$jscoverage['/runtime.js'].lineData[18]++;
    var cmd = visit56_18_1(visit57_18_2(localCommands && localCommands[parts[0]]) || commands[parts[0]]);
    _$jscoverage['/runtime.js'].lineData[19]++;
    if (visit58_19_1(cmd)) {
      _$jscoverage['/runtime.js'].lineData[20]++;
      var len = parts.length;
      _$jscoverage['/runtime.js'].lineData[21]++;
      for (var i = 1; visit59_21_1(i < len); i++) {
        _$jscoverage['/runtime.js'].lineData[22]++;
        cmd = cmd[parts[i]];
        _$jscoverage['/runtime.js'].lineData[23]++;
        if (visit60_23_1(!cmd)) {
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
    for (var i = 0, l = subParts.length; visit61_35_1(i < l); i++) {
      _$jscoverage['/runtime.js'].lineData[36]++;
      var subPart = subParts[i];
      _$jscoverage['/runtime.js'].lineData[37]++;
      if (visit62_37_1(subPart === '.')) {
      } else {
        _$jscoverage['/runtime.js'].lineData[38]++;
        if (visit63_38_1(subPart === '..')) {
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
    payload = visit64_49_1(payload || {});
    _$jscoverage['/runtime.js'].lineData[50]++;
    payload.extendTplName = null;
    _$jscoverage['/runtime.js'].lineData[51]++;
    if (visit65_51_1(tpl.TPL_NAME && !self.name)) {
      _$jscoverage['/runtime.js'].lineData[52]++;
      self.name = tpl.TPL_NAME;
    }
    _$jscoverage['/runtime.js'].lineData[54]++;
    buffer = tpl.call(self, scope, buffer, payload);
    _$jscoverage['/runtime.js'].lineData[55]++;
    var extendTplName = payload.extendTplName;
    _$jscoverage['/runtime.js'].lineData[57]++;
    if (visit66_57_1(extendTplName)) {
      _$jscoverage['/runtime.js'].lineData[58]++;
      buffer = self.include(extendTplName, scope, buffer, payload);
    }
    _$jscoverage['/runtime.js'].lineData[60]++;
    return buffer.end();
  }
  _$jscoverage['/runtime.js'].lineData[63]++;
  function callCommand(engine, scope, option, buffer, name, line) {
    _$jscoverage['/runtime.js'].functionData[4]++;
    _$jscoverage['/runtime.js'].lineData[64]++;
    var commands = engine.config.commands;
    _$jscoverage['/runtime.js'].lineData[65]++;
    var error;
    _$jscoverage['/runtime.js'].lineData[66]++;
    var command1 = findCommand(commands, name);
    _$jscoverage['/runtime.js'].lineData[67]++;
    if (visit67_67_1(command1)) {
      _$jscoverage['/runtime.js'].lineData[68]++;
      return command1.call(engine, scope, option, buffer, line);
    } else {
      _$jscoverage['/runtime.js'].lineData[70]++;
      error = 'in file: ' + engine.name + ' can not find command: ' + name + '" at line ' + line;
      _$jscoverage['/runtime.js'].lineData[71]++;
      S.error(error);
    }
    _$jscoverage['/runtime.js'].lineData[73]++;
    return buffer;
  }
  _$jscoverage['/runtime.js'].lineData[76]++;
  var utils = {
  callCommand: callCommand};
  _$jscoverage['/runtime.js'].lineData[91]++;
  function XTemplateRuntime(tpl, config) {
    _$jscoverage['/runtime.js'].functionData[5]++;
    _$jscoverage['/runtime.js'].lineData[92]++;
    var self = this;
    _$jscoverage['/runtime.js'].lineData[93]++;
    self.tpl = tpl;
    _$jscoverage['/runtime.js'].lineData[94]++;
    config = visit68_94_1(config || {});
    _$jscoverage['/runtime.js'].lineData[96]++;
    if (visit69_96_1(config.name)) {
      _$jscoverage['/runtime.js'].lineData[97]++;
      self.name = config.name;
    }
    _$jscoverage['/runtime.js'].lineData[99]++;
    self.config = config;
  }
  _$jscoverage['/runtime.js'].lineData[102]++;
  S.mix(XTemplateRuntime, {
  nativeCommands: nativeCommands, 
  utils: utils, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[6]++;
  _$jscoverage['/runtime.js'].lineData[116]++;
  commands[commandName] = fn;
}, 
  removeCommand: function(commandName) {
  _$jscoverage['/runtime.js'].functionData[7]++;
  _$jscoverage['/runtime.js'].lineData[127]++;
  delete commands[commandName];
}});
  _$jscoverage['/runtime.js'].lineData[131]++;
  XTemplateRuntime.prototype = {
  constructor: XTemplateRuntime, 
  Scope: Scope, 
  nativeCommands: nativeCommands, 
  utils: utils, 
  load: function(subTplName, callback) {
  _$jscoverage['/runtime.js'].functionData[8]++;
  _$jscoverage['/runtime.js'].lineData[146]++;
  var tpl = S.require(subTplName);
  _$jscoverage['/runtime.js'].lineData[147]++;
  if (visit70_147_1(tpl)) {
    _$jscoverage['/runtime.js'].lineData[148]++;
    callback(undefined, tpl);
  } else {
    _$jscoverage['/runtime.js'].lineData[150]++;
    var warning = 'template "' + subTplName + '" does not exist, ' + 'better required or used first for performance!';
    _$jscoverage['/runtime.js'].lineData[152]++;
    S.log(warning, 'error');
    _$jscoverage['/runtime.js'].lineData[153]++;
    callback(warning, undefined);
  }
}, 
  removeCommand: function(commandName) {
  _$jscoverage['/runtime.js'].functionData[9]++;
  _$jscoverage['/runtime.js'].lineData[162]++;
  var config = this.config;
  _$jscoverage['/runtime.js'].lineData[163]++;
  if (visit71_163_1(config.commands)) {
    _$jscoverage['/runtime.js'].lineData[164]++;
    delete config.commands[commandName];
  }
}, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[10]++;
  _$jscoverage['/runtime.js'].lineData[174]++;
  var config = this.config;
  _$jscoverage['/runtime.js'].lineData[175]++;
  config.commands = visit72_175_1(config.commands || {});
  _$jscoverage['/runtime.js'].lineData[176]++;
  config.commands[commandName] = fn;
}, 
  include: function(subTplName, scope, buffer, payload) {
  _$jscoverage['/runtime.js'].functionData[11]++;
  _$jscoverage['/runtime.js'].lineData[180]++;
  var self = this;
  _$jscoverage['/runtime.js'].lineData[181]++;
  var myName = self.name;
  _$jscoverage['/runtime.js'].lineData[182]++;
  if (visit73_182_1(subTplName.charAt(0) === '.')) {
    _$jscoverage['/runtime.js'].lineData[183]++;
    if (visit74_183_1(!myName)) {
      _$jscoverage['/runtime.js'].lineData[184]++;
      var error = 'parent template does not have name' + ' for relative sub tpl name: ' + subTplName;
      _$jscoverage['/runtime.js'].lineData[186]++;
      throw new Error(error);
    }
    _$jscoverage['/runtime.js'].lineData[188]++;
    subTplName = getSubNameFromParentName(myName, subTplName);
  }
  _$jscoverage['/runtime.js'].lineData[190]++;
  return buffer.async(function(newBuffer) {
  _$jscoverage['/runtime.js'].functionData[12]++;
  _$jscoverage['/runtime.js'].lineData[191]++;
  self.load(subTplName, function(error, engine) {
  _$jscoverage['/runtime.js'].functionData[13]++;
  _$jscoverage['/runtime.js'].lineData[192]++;
  if (visit75_192_1(error)) {
    _$jscoverage['/runtime.js'].lineData[193]++;
    newBuffer.error(error);
  } else {
    _$jscoverage['/runtime.js'].lineData[195]++;
    if (visit76_195_1(!(engine instanceof XTemplateRuntime))) {
      _$jscoverage['/runtime.js'].lineData[196]++;
      engine = new self.constructor(engine, self.config);
      _$jscoverage['/runtime.js'].lineData[197]++;
      engine.name = subTplName;
    }
    _$jscoverage['/runtime.js'].lineData[199]++;
    renderTpl(engine, scope, newBuffer, payload);
  }
});
});
}, 
  render: function(data, callback) {
  _$jscoverage['/runtime.js'].functionData[14]++;
  _$jscoverage['/runtime.js'].lineData[212]++;
  var html = '';
  _$jscoverage['/runtime.js'].lineData[213]++;
  var self = this;
  _$jscoverage['/runtime.js'].lineData[214]++;
  callback = visit77_214_1(callback || function(error, ret) {
  _$jscoverage['/runtime.js'].functionData[15]++;
  _$jscoverage['/runtime.js'].lineData[215]++;
  html = ret;
});
  _$jscoverage['/runtime.js'].lineData[217]++;
  if (visit78_217_1(!self.name && self.tpl.TPL_NAME)) {
    _$jscoverage['/runtime.js'].lineData[218]++;
    self.name = self.tpl.TPL_NAME;
  }
  _$jscoverage['/runtime.js'].lineData[220]++;
  renderTpl(self, new Scope(data), new LinkedBuffer(callback).head);
  _$jscoverage['/runtime.js'].lineData[221]++;
  return html;
}};
  _$jscoverage['/runtime.js'].lineData[225]++;
  XTemplateRuntime.Scope = Scope;
  _$jscoverage['/runtime.js'].lineData[227]++;
  return XTemplateRuntime;
});
