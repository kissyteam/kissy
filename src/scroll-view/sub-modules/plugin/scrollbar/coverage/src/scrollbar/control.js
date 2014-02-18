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
if (! _$jscoverage['/scrollbar/control.js']) {
  _$jscoverage['/scrollbar/control.js'] = {};
  _$jscoverage['/scrollbar/control.js'].lineData = [];
  _$jscoverage['/scrollbar/control.js'].lineData[6] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[7] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[8] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[9] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[10] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[12] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[14] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[16] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[18] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[19] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[22] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[23] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[24] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[25] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[27] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[28] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[29] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[31] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[32] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[35] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[38] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[39] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[44] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[45] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[48] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[50] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[58] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[60] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[61] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[62] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[63] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[64] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[65] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[66] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[67] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[69] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[70] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[72] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[73] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[77] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[80] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[81] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[83] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[85] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[87] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[89] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[94] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[99] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[100] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[104] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[108] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[109] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[110] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[114] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[115] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[116] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[117] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[122] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[123] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[125] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[126] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[133] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[134] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[135] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[136] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[137] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[140] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[141] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[145] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[146] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[147] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[149] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[150] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[151] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[152] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[153] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[155] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[164] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[165] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[167] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[171] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[175] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[176] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[177] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[184] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[185] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[186] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[187] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[189] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[190] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[191] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[192] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[194] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[198] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[199] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[237] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[254] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[256] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[257] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[259] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[266] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[267] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[268] = 0;
  _$jscoverage['/scrollbar/control.js'].lineData[270] = 0;
}
if (! _$jscoverage['/scrollbar/control.js'].functionData) {
  _$jscoverage['/scrollbar/control.js'].functionData = [];
  _$jscoverage['/scrollbar/control.js'].functionData[0] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[1] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[2] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[3] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[4] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[5] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[6] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[7] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[8] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[9] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[10] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[11] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[12] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[13] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[14] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[15] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[16] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[17] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[18] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[19] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[20] = 0;
  _$jscoverage['/scrollbar/control.js'].functionData[21] = 0;
}
if (! _$jscoverage['/scrollbar/control.js'].branchData) {
  _$jscoverage['/scrollbar/control.js'].branchData = {};
  _$jscoverage['/scrollbar/control.js'].branchData['24'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['28'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['61'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['63'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['64'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['80'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['115'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['122'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['132'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['132'][2] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['146'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['152'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['152'][2] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['176'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['186'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['191'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['198'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['256'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/scrollbar/control.js'].branchData['267'] = [];
  _$jscoverage['/scrollbar/control.js'].branchData['267'][1] = new BranchData();
}
_$jscoverage['/scrollbar/control.js'].branchData['267'][1].init(84, 13, 'v < minLength');
function visit19_267_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['256'][1].init(85, 13, 'v < minLength');
function visit18_256_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['198'][1].init(17, 7, 'this.dd');
function visit17_198_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['191'][1].init(301, 38, 'self.hideFn && !scrollView.isScrolling');
function visit16_191_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['186'][1].init(129, 40, '!scrollView.allowScroll[self.scrollType]');
function visit15_186_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['176'][1].init(46, 11, 'self.hideFn');
function visit14_176_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['152'][2].init(237, 17, 'dragEl === target');
function visit13_152_2(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['152'][2].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['152'][1].init(237, 45, 'dragEl === target || $dragEl.contains(target)');
function visit12_152_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['146'][1].init(46, 20, 'self.get(\'disabled\')');
function visit11_146_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['132'][2].init(294, 23, 'target === self.downBtn');
function visit10_132_2(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['132'][2].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['132'][1].init(294, 57, 'target === self.downBtn || self.$downBtn.contains(target)');
function visit9_132_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['122'][1].init(17, 20, 'this.get(\'disabled\')');
function visit8_122_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['115'][1].init(46, 14, 'self.hideTimer');
function visit7_115_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['80'][1].init(148, 8, 'autoHide');
function visit6_80_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['64'][1].init(290, 21, 'scrollType === \'left\'');
function visit5_64_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['63'][1].init(208, 21, 'scrollType === \'left\'');
function visit4_63_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['61'][1].init(77, 24, 'self.get(\'axis\') === \'x\'');
function visit3_61_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['28'][1].init(135, 20, 'self.get(\'disabled\')');
function visit2_28_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].branchData['24'][1].init(42, 10, '!e.isTouch');
function visit1_24_1(result) {
  _$jscoverage['/scrollbar/control.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/scrollbar/control.js'].functionData[0]++;
  _$jscoverage['/scrollbar/control.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/scrollbar/control.js'].lineData[8]++;
  var $document = Node.all(document);
  _$jscoverage['/scrollbar/control.js'].lineData[9]++;
  var Control = require('component/control');
  _$jscoverage['/scrollbar/control.js'].lineData[10]++;
  var ScrollBarRender = require('./render');
  _$jscoverage['/scrollbar/control.js'].lineData[12]++;
  var MIN_BAR_LENGTH = 20;
  _$jscoverage['/scrollbar/control.js'].lineData[14]++;
  var SCROLLBAR_EVENT_NS = '.ks-scrollbar';
  _$jscoverage['/scrollbar/control.js'].lineData[16]++;
  var Gesture = Node.Gesture;
  _$jscoverage['/scrollbar/control.js'].lineData[18]++;
  function preventDefault(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[1]++;
    _$jscoverage['/scrollbar/control.js'].lineData[19]++;
    e.preventDefault();
  }
  _$jscoverage['/scrollbar/control.js'].lineData[22]++;
  function onDragStartHandler(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[2]++;
    _$jscoverage['/scrollbar/control.js'].lineData[23]++;
    e.stopPropagation();
    _$jscoverage['/scrollbar/control.js'].lineData[24]++;
    if (visit1_24_1(!e.isTouch)) {
      _$jscoverage['/scrollbar/control.js'].lineData[25]++;
      e.preventDefault();
    }
    _$jscoverage['/scrollbar/control.js'].lineData[27]++;
    var self = this;
    _$jscoverage['/scrollbar/control.js'].lineData[28]++;
    if (visit2_28_1(self.get('disabled'))) {
      _$jscoverage['/scrollbar/control.js'].lineData[29]++;
      return;
    }
    _$jscoverage['/scrollbar/control.js'].lineData[31]++;
    self.startMousePos = e[self.pageXyProperty];
    _$jscoverage['/scrollbar/control.js'].lineData[32]++;
    self.startScroll = self.scrollView.get(self.scrollProperty);
    _$jscoverage['/scrollbar/control.js'].lineData[35]++;
    $document.on(Gesture.move, onDragHandler, self).on(Gesture.end, onDragEndHandler, self);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[38]++;
  function onDragHandler(e) {
    _$jscoverage['/scrollbar/control.js'].functionData[3]++;
    _$jscoverage['/scrollbar/control.js'].lineData[39]++;
    var self = this, diff = e[self.pageXyProperty] - self.startMousePos, scrollView = self.scrollView, scrollType = self.scrollType, scrollCfg = {};
    _$jscoverage['/scrollbar/control.js'].lineData[44]++;
    scrollCfg[scrollType] = self.startScroll + diff / self.trackElSize * self.scrollLength;
    _$jscoverage['/scrollbar/control.js'].lineData[45]++;
    scrollView.scrollToWithBounds(scrollCfg);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[48]++;
  function onDragEndHandler() {
    _$jscoverage['/scrollbar/control.js'].functionData[4]++;
    _$jscoverage['/scrollbar/control.js'].lineData[50]++;
    $document.detach(Gesture.move, onDragHandler, this).detach(Gesture.end, onDragEndHandler, this);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[58]++;
  return Control.extend({
  initializer: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[5]++;
  _$jscoverage['/scrollbar/control.js'].lineData[60]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[61]++;
  var scrollType = self.scrollType = visit3_61_1(self.get('axis') === 'x') ? 'left' : 'top';
  _$jscoverage['/scrollbar/control.js'].lineData[62]++;
  var ucScrollType = S.ucfirst(scrollType);
  _$jscoverage['/scrollbar/control.js'].lineData[63]++;
  self.pageXyProperty = visit4_63_1(scrollType === 'left') ? 'pageX' : 'pageY';
  _$jscoverage['/scrollbar/control.js'].lineData[64]++;
  var wh = self.whProperty = visit5_64_1(scrollType === 'left') ? 'width' : 'height';
  _$jscoverage['/scrollbar/control.js'].lineData[65]++;
  var ucWH = S.ucfirst(wh);
  _$jscoverage['/scrollbar/control.js'].lineData[66]++;
  self.afterScrollChangeEvent = 'afterScroll' + ucScrollType + 'Change';
  _$jscoverage['/scrollbar/control.js'].lineData[67]++;
  self.scrollProperty = 'scroll' + ucScrollType;
  _$jscoverage['/scrollbar/control.js'].lineData[69]++;
  self.dragWHProperty = 'drag' + ucWH;
  _$jscoverage['/scrollbar/control.js'].lineData[70]++;
  self.dragLTProperty = 'drag' + ucScrollType;
  _$jscoverage['/scrollbar/control.js'].lineData[72]++;
  self.clientWHProperty = 'client' + ucWH;
  _$jscoverage['/scrollbar/control.js'].lineData[73]++;
  self.scrollWHProperty = 'scroll' + ucWH;
}, 
  bindUI: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[6]++;
  _$jscoverage['/scrollbar/control.js'].lineData[77]++;
  var self = this, autoHide = self.get('autoHide'), scrollView = self.get('scrollView');
  _$jscoverage['/scrollbar/control.js'].lineData[80]++;
  if (visit6_80_1(autoHide)) {
    _$jscoverage['/scrollbar/control.js'].lineData[81]++;
    self.hideFn = S.bind(self.hide, self);
  } else {
    _$jscoverage['/scrollbar/control.js'].lineData[83]++;
    S.each([self.$downBtn, self.$upBtn], function(b) {
  _$jscoverage['/scrollbar/control.js'].functionData[7]++;
  _$jscoverage['/scrollbar/control.js'].lineData[85]++;
  b.on(Gesture.start, self.onUpDownBtnMouseDown, self).on(Gesture.end, self.onUpDownBtnMouseUp, self);
});
    _$jscoverage['/scrollbar/control.js'].lineData[87]++;
    self.$trackEl.on(Gesture.start, self.onTrackElMouseDown, self);
    _$jscoverage['/scrollbar/control.js'].lineData[89]++;
    self.$dragEl.on('dragstart', preventDefault).on(Gesture.start, onDragStartHandler, self);
    _$jscoverage['/scrollbar/control.js'].lineData[94]++;
    scrollView.on(self.afterScrollChangeEvent + SCROLLBAR_EVENT_NS, self.afterScrollChange, self).on('scrollEnd' + SCROLLBAR_EVENT_NS, self.onScrollEnd, self).on('afterDisabledChange', self.onScrollViewDisabled, self);
  }
}, 
  destructor: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[8]++;
  _$jscoverage['/scrollbar/control.js'].lineData[99]++;
  this.get('scrollView').detach(SCROLLBAR_EVENT_NS);
  _$jscoverage['/scrollbar/control.js'].lineData[100]++;
  this.clearHideTimer();
}, 
  onScrollViewDisabled: function(e) {
  _$jscoverage['/scrollbar/control.js'].functionData[9]++;
  _$jscoverage['/scrollbar/control.js'].lineData[104]++;
  this.set('disabled', e.newVal);
}, 
  startHideTimer: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[10]++;
  _$jscoverage['/scrollbar/control.js'].lineData[108]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[109]++;
  self.clearHideTimer();
  _$jscoverage['/scrollbar/control.js'].lineData[110]++;
  self.hideTimer = setTimeout(self.hideFn, self.get('hideDelay') * 1000);
}, 
  clearHideTimer: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[11]++;
  _$jscoverage['/scrollbar/control.js'].lineData[114]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[115]++;
  if (visit7_115_1(self.hideTimer)) {
    _$jscoverage['/scrollbar/control.js'].lineData[116]++;
    clearTimeout(self.hideTimer);
    _$jscoverage['/scrollbar/control.js'].lineData[117]++;
    self.hideTimer = null;
  }
}, 
  onUpDownBtnMouseDown: function(e) {
  _$jscoverage['/scrollbar/control.js'].functionData[12]++;
  _$jscoverage['/scrollbar/control.js'].lineData[122]++;
  if (visit8_122_1(this.get('disabled'))) {
    _$jscoverage['/scrollbar/control.js'].lineData[123]++;
    return;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[125]++;
  e.halt();
  _$jscoverage['/scrollbar/control.js'].lineData[126]++;
  var self = this, scrollView = self.scrollView, scrollProperty = self.scrollProperty, scrollType = self.scrollType, step = scrollView.getScrollStep()[self.scrollType], target = e.target, direction = (visit9_132_1(visit10_132_2(target === self.downBtn) || self.$downBtn.contains(target))) ? 1 : -1;
  _$jscoverage['/scrollbar/control.js'].lineData[133]++;
  clearInterval(self.mouseInterval);
  _$jscoverage['/scrollbar/control.js'].lineData[134]++;
  function doScroll() {
    _$jscoverage['/scrollbar/control.js'].functionData[13]++;
    _$jscoverage['/scrollbar/control.js'].lineData[135]++;
    var scrollCfg = {};
    _$jscoverage['/scrollbar/control.js'].lineData[136]++;
    scrollCfg[scrollType] = scrollView.get(scrollProperty) + direction * step;
    _$jscoverage['/scrollbar/control.js'].lineData[137]++;
    scrollView.scrollToWithBounds(scrollCfg);
  }
  _$jscoverage['/scrollbar/control.js'].lineData[140]++;
  self.mouseInterval = setInterval(doScroll, 100);
  _$jscoverage['/scrollbar/control.js'].lineData[141]++;
  doScroll();
}, 
  onTrackElMouseDown: function(e) {
  _$jscoverage['/scrollbar/control.js'].functionData[14]++;
  _$jscoverage['/scrollbar/control.js'].lineData[145]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[146]++;
  if (visit11_146_1(self.get('disabled'))) {
    _$jscoverage['/scrollbar/control.js'].lineData[147]++;
    return;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[149]++;
  var target = e.target;
  _$jscoverage['/scrollbar/control.js'].lineData[150]++;
  var dragEl = self.dragEl;
  _$jscoverage['/scrollbar/control.js'].lineData[151]++;
  var $dragEl = self.$dragEl;
  _$jscoverage['/scrollbar/control.js'].lineData[152]++;
  if (visit12_152_1(visit13_152_2(dragEl === target) || $dragEl.contains(target))) {
    _$jscoverage['/scrollbar/control.js'].lineData[153]++;
    return;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[155]++;
  var scrollType = self.scrollType, pageXy = self.pageXyProperty, trackEl = self.$trackEl, scrollView = self.scrollView, per = Math.max(0, (e[pageXy] - trackEl.offset()[scrollType] - self.barSize / 2) / self.trackElSize), scrollCfg = {};
  _$jscoverage['/scrollbar/control.js'].lineData[164]++;
  scrollCfg[scrollType] = per * self.scrollLength;
  _$jscoverage['/scrollbar/control.js'].lineData[165]++;
  scrollView.scrollToWithBounds(scrollCfg);
  _$jscoverage['/scrollbar/control.js'].lineData[167]++;
  e.halt();
}, 
  onUpDownBtnMouseUp: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[15]++;
  _$jscoverage['/scrollbar/control.js'].lineData[171]++;
  clearInterval(this.mouseInterval);
}, 
  onScrollEnd: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[16]++;
  _$jscoverage['/scrollbar/control.js'].lineData[175]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[176]++;
  if (visit14_176_1(self.hideFn)) {
    _$jscoverage['/scrollbar/control.js'].lineData[177]++;
    self.startHideTimer();
  }
}, 
  afterScrollChange: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[17]++;
  _$jscoverage['/scrollbar/control.js'].lineData[184]++;
  var self = this;
  _$jscoverage['/scrollbar/control.js'].lineData[185]++;
  var scrollView = self.scrollView;
  _$jscoverage['/scrollbar/control.js'].lineData[186]++;
  if (visit15_186_1(!scrollView.allowScroll[self.scrollType])) {
    _$jscoverage['/scrollbar/control.js'].lineData[187]++;
    return;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[189]++;
  self.clearHideTimer();
  _$jscoverage['/scrollbar/control.js'].lineData[190]++;
  self.set('visible', true);
  _$jscoverage['/scrollbar/control.js'].lineData[191]++;
  if (visit16_191_1(self.hideFn && !scrollView.isScrolling)) {
    _$jscoverage['/scrollbar/control.js'].lineData[192]++;
    self.startHideTimer();
  }
  _$jscoverage['/scrollbar/control.js'].lineData[194]++;
  self.view.syncOnScrollChange();
}, 
  _onSetDisabled: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[18]++;
  _$jscoverage['/scrollbar/control.js'].lineData[198]++;
  if (visit17_198_1(this.dd)) {
    _$jscoverage['/scrollbar/control.js'].lineData[199]++;
    this.dd.set('disabled', v);
  }
}}, {
  ATTRS: {
  minLength: {
  value: MIN_BAR_LENGTH}, 
  scrollView: {}, 
  axis: {
  view: 1}, 
  autoHide: {
  value: S.UA.ios}, 
  visible: {
  valueFn: function() {
  _$jscoverage['/scrollbar/control.js'].functionData[19]++;
  _$jscoverage['/scrollbar/control.js'].lineData[237]++;
  return !this.get('autoHide');
}}, 
  hideDelay: {
  value: 0.1}, 
  dragWidth: {
  setter: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[20]++;
  _$jscoverage['/scrollbar/control.js'].lineData[254]++;
  var minLength = this.get('minLength');
  _$jscoverage['/scrollbar/control.js'].lineData[256]++;
  if (visit18_256_1(v < minLength)) {
    _$jscoverage['/scrollbar/control.js'].lineData[257]++;
    return minLength;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[259]++;
  return v;
}, 
  view: 1}, 
  dragHeight: {
  setter: function(v) {
  _$jscoverage['/scrollbar/control.js'].functionData[21]++;
  _$jscoverage['/scrollbar/control.js'].lineData[266]++;
  var minLength = this.get('minLength');
  _$jscoverage['/scrollbar/control.js'].lineData[267]++;
  if (visit19_267_1(v < minLength)) {
    _$jscoverage['/scrollbar/control.js'].lineData[268]++;
    return minLength;
  }
  _$jscoverage['/scrollbar/control.js'].lineData[270]++;
  return v;
}, 
  view: 1}, 
  dragLeft: {
  view: 1, 
  value: 0}, 
  dragTop: {
  view: 1, 
  value: 0}, 
  dragEl: {}, 
  downBtn: {}, 
  upBtn: {}, 
  trackEl: {}, 
  focusable: {
  value: false}, 
  xrender: {
  value: ScrollBarRender}}, 
  xclass: 'scrollbar'});
});
