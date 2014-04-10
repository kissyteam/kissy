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
if (! _$jscoverage['/toolbar.js']) {
  _$jscoverage['/toolbar.js'] = {};
  _$jscoverage['/toolbar.js'].lineData = [];
  _$jscoverage['/toolbar.js'].lineData[6] = 0;
  _$jscoverage['/toolbar.js'].lineData[7] = 0;
  _$jscoverage['/toolbar.js'].lineData[8] = 0;
  _$jscoverage['/toolbar.js'].lineData[9] = 0;
  _$jscoverage['/toolbar.js'].lineData[11] = 0;
  _$jscoverage['/toolbar.js'].lineData[13] = 0;
  _$jscoverage['/toolbar.js'].lineData[14] = 0;
  _$jscoverage['/toolbar.js'].lineData[18] = 0;
  _$jscoverage['/toolbar.js'].lineData[19] = 0;
  _$jscoverage['/toolbar.js'].lineData[20] = 0;
  _$jscoverage['/toolbar.js'].lineData[22] = 0;
  _$jscoverage['/toolbar.js'].lineData[24] = 0;
  _$jscoverage['/toolbar.js'].lineData[25] = 0;
  _$jscoverage['/toolbar.js'].lineData[29] = 0;
  _$jscoverage['/toolbar.js'].lineData[30] = 0;
  _$jscoverage['/toolbar.js'].lineData[31] = 0;
  _$jscoverage['/toolbar.js'].lineData[34] = 0;
  _$jscoverage['/toolbar.js'].lineData[35] = 0;
  _$jscoverage['/toolbar.js'].lineData[38] = 0;
  _$jscoverage['/toolbar.js'].lineData[41] = 0;
  _$jscoverage['/toolbar.js'].lineData[42] = 0;
  _$jscoverage['/toolbar.js'].lineData[43] = 0;
  _$jscoverage['/toolbar.js'].lineData[44] = 0;
  _$jscoverage['/toolbar.js'].lineData[46] = 0;
  _$jscoverage['/toolbar.js'].lineData[50] = 0;
  _$jscoverage['/toolbar.js'].lineData[51] = 0;
  _$jscoverage['/toolbar.js'].lineData[55] = 0;
  _$jscoverage['/toolbar.js'].lineData[57] = 0;
  _$jscoverage['/toolbar.js'].lineData[58] = 0;
  _$jscoverage['/toolbar.js'].lineData[59] = 0;
  _$jscoverage['/toolbar.js'].lineData[61] = 0;
  _$jscoverage['/toolbar.js'].lineData[63] = 0;
  _$jscoverage['/toolbar.js'].lineData[65] = 0;
  _$jscoverage['/toolbar.js'].lineData[66] = 0;
  _$jscoverage['/toolbar.js'].lineData[72] = 0;
  _$jscoverage['/toolbar.js'].lineData[73] = 0;
  _$jscoverage['/toolbar.js'].lineData[74] = 0;
  _$jscoverage['/toolbar.js'].lineData[75] = 0;
  _$jscoverage['/toolbar.js'].lineData[76] = 0;
  _$jscoverage['/toolbar.js'].lineData[77] = 0;
  _$jscoverage['/toolbar.js'].lineData[80] = 0;
  _$jscoverage['/toolbar.js'].lineData[88] = 0;
  _$jscoverage['/toolbar.js'].lineData[90] = 0;
  _$jscoverage['/toolbar.js'].lineData[97] = 0;
  _$jscoverage['/toolbar.js'].lineData[98] = 0;
  _$jscoverage['/toolbar.js'].lineData[99] = 0;
  _$jscoverage['/toolbar.js'].lineData[103] = 0;
  _$jscoverage['/toolbar.js'].lineData[105] = 0;
  _$jscoverage['/toolbar.js'].lineData[106] = 0;
  _$jscoverage['/toolbar.js'].lineData[108] = 0;
  _$jscoverage['/toolbar.js'].lineData[109] = 0;
  _$jscoverage['/toolbar.js'].lineData[114] = 0;
  _$jscoverage['/toolbar.js'].lineData[118] = 0;
  _$jscoverage['/toolbar.js'].lineData[119] = 0;
  _$jscoverage['/toolbar.js'].lineData[120] = 0;
  _$jscoverage['/toolbar.js'].lineData[125] = 0;
  _$jscoverage['/toolbar.js'].lineData[126] = 0;
  _$jscoverage['/toolbar.js'].lineData[131] = 0;
  _$jscoverage['/toolbar.js'].lineData[133] = 0;
  _$jscoverage['/toolbar.js'].lineData[134] = 0;
  _$jscoverage['/toolbar.js'].lineData[137] = 0;
  _$jscoverage['/toolbar.js'].lineData[138] = 0;
  _$jscoverage['/toolbar.js'].lineData[141] = 0;
  _$jscoverage['/toolbar.js'].lineData[142] = 0;
  _$jscoverage['/toolbar.js'].lineData[145] = 0;
  _$jscoverage['/toolbar.js'].lineData[146] = 0;
  _$jscoverage['/toolbar.js'].lineData[149] = 0;
  _$jscoverage['/toolbar.js'].lineData[150] = 0;
  _$jscoverage['/toolbar.js'].lineData[153] = 0;
  _$jscoverage['/toolbar.js'].lineData[154] = 0;
  _$jscoverage['/toolbar.js'].lineData[157] = 0;
  _$jscoverage['/toolbar.js'].lineData[158] = 0;
  _$jscoverage['/toolbar.js'].lineData[161] = 0;
  _$jscoverage['/toolbar.js'].lineData[163] = 0;
  _$jscoverage['/toolbar.js'].lineData[167] = 0;
  _$jscoverage['/toolbar.js'].lineData[171] = 0;
  _$jscoverage['/toolbar.js'].lineData[172] = 0;
  _$jscoverage['/toolbar.js'].lineData[175] = 0;
  _$jscoverage['/toolbar.js'].lineData[176] = 0;
  _$jscoverage['/toolbar.js'].lineData[179] = 0;
  _$jscoverage['/toolbar.js'].lineData[183] = 0;
  _$jscoverage['/toolbar.js'].lineData[189] = 0;
  _$jscoverage['/toolbar.js'].lineData[190] = 0;
  _$jscoverage['/toolbar.js'].lineData[196] = 0;
  _$jscoverage['/toolbar.js'].lineData[197] = 0;
  _$jscoverage['/toolbar.js'].lineData[198] = 0;
  _$jscoverage['/toolbar.js'].lineData[200] = 0;
  _$jscoverage['/toolbar.js'].lineData[201] = 0;
  _$jscoverage['/toolbar.js'].lineData[202] = 0;
  _$jscoverage['/toolbar.js'].lineData[203] = 0;
  _$jscoverage['/toolbar.js'].lineData[205] = 0;
  _$jscoverage['/toolbar.js'].lineData[207] = 0;
  _$jscoverage['/toolbar.js'].lineData[212] = 0;
  _$jscoverage['/toolbar.js'].lineData[213] = 0;
  _$jscoverage['/toolbar.js'].lineData[215] = 0;
  _$jscoverage['/toolbar.js'].lineData[216] = 0;
}
if (! _$jscoverage['/toolbar.js'].functionData) {
  _$jscoverage['/toolbar.js'].functionData = [];
  _$jscoverage['/toolbar.js'].functionData[0] = 0;
  _$jscoverage['/toolbar.js'].functionData[1] = 0;
  _$jscoverage['/toolbar.js'].functionData[2] = 0;
  _$jscoverage['/toolbar.js'].functionData[3] = 0;
  _$jscoverage['/toolbar.js'].functionData[4] = 0;
  _$jscoverage['/toolbar.js'].functionData[5] = 0;
  _$jscoverage['/toolbar.js'].functionData[6] = 0;
  _$jscoverage['/toolbar.js'].functionData[7] = 0;
  _$jscoverage['/toolbar.js'].functionData[8] = 0;
  _$jscoverage['/toolbar.js'].functionData[9] = 0;
  _$jscoverage['/toolbar.js'].functionData[10] = 0;
  _$jscoverage['/toolbar.js'].functionData[11] = 0;
}
if (! _$jscoverage['/toolbar.js'].branchData) {
  _$jscoverage['/toolbar.js'].branchData = {};
  _$jscoverage['/toolbar.js'].branchData['18'] = [];
  _$jscoverage['/toolbar.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['19'] = [];
  _$jscoverage['/toolbar.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['24'] = [];
  _$jscoverage['/toolbar.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['32'] = [];
  _$jscoverage['/toolbar.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['32'][2] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['34'] = [];
  _$jscoverage['/toolbar.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['43'] = [];
  _$jscoverage['/toolbar.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['55'] = [];
  _$jscoverage['/toolbar.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['55'][2] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['55'][3] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['57'] = [];
  _$jscoverage['/toolbar.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['59'] = [];
  _$jscoverage['/toolbar.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['65'] = [];
  _$jscoverage['/toolbar.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['74'] = [];
  _$jscoverage['/toolbar.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['76'] = [];
  _$jscoverage['/toolbar.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['76'][2] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['116'] = [];
  _$jscoverage['/toolbar.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['118'] = [];
  _$jscoverage['/toolbar.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['119'] = [];
  _$jscoverage['/toolbar.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['125'] = [];
  _$jscoverage['/toolbar.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['125'][2] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['125'][3] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['171'] = [];
  _$jscoverage['/toolbar.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['175'] = [];
  _$jscoverage['/toolbar.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['185'] = [];
  _$jscoverage['/toolbar.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['189'] = [];
  _$jscoverage['/toolbar.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['196'] = [];
  _$jscoverage['/toolbar.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['197'] = [];
  _$jscoverage['/toolbar.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['202'] = [];
  _$jscoverage['/toolbar.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['212'] = [];
  _$jscoverage['/toolbar.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['215'] = [];
  _$jscoverage['/toolbar.js'].branchData['215'][1] = new BranchData();
}
_$jscoverage['/toolbar.js'].branchData['215'][1].init(115, 1, 'v');
function visit31_215_1(result) {
  _$jscoverage['/toolbar.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['212'][1].init(17, 14, 'e && e.prevVal');
function visit30_212_1(result) {
  _$jscoverage['/toolbar.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['202'][1].init(200, 3, '!id');
function visit29_202_1(result) {
  _$jscoverage['/toolbar.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['197'][1].init(21, 37, 'el.ownerDocument.activeElement !== el');
function visit28_197_1(result) {
  _$jscoverage['/toolbar.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['196'][1].init(493, 4, 'item');
function visit27_196_1(result) {
  _$jscoverage['/toolbar.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['189'][1].init(239, 39, 'prevVal && S.inArray(prevVal, children)');
function visit26_189_1(result) {
  _$jscoverage['/toolbar.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['185'][1].init(70, 14, 'e && e.prevVal');
function visit25_185_1(result) {
  _$jscoverage['/toolbar.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['175'][1].init(312, 19, 'nextHighlightedItem');
function visit24_175_1(result) {
  _$jscoverage['/toolbar.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['171'][1].init(193, 40, 'typeof nextHighlightedItem === \'boolean\'');
function visit23_171_1(result) {
  _$jscoverage['/toolbar.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['125'][3].init(417, 21, 'e.metaKey || e.altKey');
function visit22_125_3(result) {
  _$jscoverage['/toolbar.js'].branchData['125'][3].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['125'][2].init(404, 34, 'e.ctrlKey || e.metaKey || e.altKey');
function visit21_125_2(result) {
  _$jscoverage['/toolbar.js'].branchData['125'][2].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['125'][1].init(390, 48, 'e.shiftKey || e.ctrlKey || e.metaKey || e.altKey');
function visit20_125_1(result) {
  _$jscoverage['/toolbar.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['119'][1].init(21, 32, 'current.handleKeyDownInternal(e)');
function visit19_119_1(result) {
  _$jscoverage['/toolbar.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['118'][1].init(166, 7, 'current');
function visit18_118_1(result) {
  _$jscoverage['/toolbar.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['116'][1].init(94, 39, 'current && S.indexOf(current, children)');
function visit17_116_1(result) {
  _$jscoverage['/toolbar.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['76'][2].init(79, 45, 'child.isMenuButton && !child.get(\'collapsed\')');
function visit16_76_2(result) {
  _$jscoverage['/toolbar.js'].branchData['76'][2].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['76'][1].init(50, 75, 'child.get(\'highlighted\') || (child.isMenuButton && !child.get(\'collapsed\'))');
function visit15_76_1(result) {
  _$jscoverage['/toolbar.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['74'][1].init(79, 19, 'i < children.length');
function visit14_74_1(result) {
  _$jscoverage['/toolbar.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['65'][1].init(21, 34, '!e.byPassSetToolbarHighlightedItem');
function visit13_65_1(result) {
  _$jscoverage['/toolbar.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['59'][1].init(71, 71, '(expandedItem = self.get(\'expandedItem\')) && S.inArray(target, children)');
function visit12_59_1(result) {
  _$jscoverage['/toolbar.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['57'][1].init(18, 8, 'e.newVal');
function visit11_57_1(result) {
  _$jscoverage['/toolbar.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['55'][3].init(137, 36, 'target.isMenuItem || target.isButton');
function visit10_55_3(result) {
  _$jscoverage['/toolbar.js'].branchData['55'][3].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['55'][2].init(117, 15, 'self !== target');
function visit9_55_2(result) {
  _$jscoverage['/toolbar.js'].branchData['55'][2].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['55'][1].init(117, 57, 'self !== target && (target.isMenuItem || target.isButton)');
function visit8_55_1(result) {
  _$jscoverage['/toolbar.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['43'][1].init(38, 8, 'e.newVal');
function visit7_43_1(result) {
  _$jscoverage['/toolbar.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['34'][1].init(608, 24, 'count !== childrenLength');
function visit6_34_1(result) {
  _$jscoverage['/toolbar.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['32'][2].init(536, 22, 'count < childrenLength');
function visit5_32_2(result) {
  _$jscoverage['/toolbar.js'].branchData['32'][2].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['32'][1].init(117, 57, 'count < childrenLength && children[index].get(\'disabled\')');
function visit4_32_1(result) {
  _$jscoverage['/toolbar.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['24'][1].init(158, 32, '!children[index].get(\'disabled\')');
function visit3_24_1(result) {
  _$jscoverage['/toolbar.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['19'][1].init(17, 15, 'direction === 1');
function visit2_19_1(result) {
  _$jscoverage['/toolbar.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['18'][1].init(128, 19, 'index === undefined');
function visit1_18_1(result) {
  _$jscoverage['/toolbar.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/toolbar.js'].functionData[0]++;
  _$jscoverage['/toolbar.js'].lineData[7]++;
  var Container = require('component/container');
  _$jscoverage['/toolbar.js'].lineData[8]++;
  var DelegateChildrenExtension = require('component/extension/delegate-children');
  _$jscoverage['/toolbar.js'].lineData[9]++;
  var Node = require('node');
  _$jscoverage['/toolbar.js'].lineData[11]++;
  var KeyCode = Node.KeyCode;
  _$jscoverage['/toolbar.js'].lineData[13]++;
  function getNextEnabledItem(index, direction, self) {
    _$jscoverage['/toolbar.js'].functionData[1]++;
    _$jscoverage['/toolbar.js'].lineData[14]++;
    var children = self.get('children'), count = 0, childrenLength = children.length;
    _$jscoverage['/toolbar.js'].lineData[18]++;
    if (visit1_18_1(index === undefined)) {
      _$jscoverage['/toolbar.js'].lineData[19]++;
      if (visit2_19_1(direction === 1)) {
        _$jscoverage['/toolbar.js'].lineData[20]++;
        index = 0;
      } else {
        _$jscoverage['/toolbar.js'].lineData[22]++;
        index = childrenLength - 1;
      }
      _$jscoverage['/toolbar.js'].lineData[24]++;
      if (visit3_24_1(!children[index].get('disabled'))) {
        _$jscoverage['/toolbar.js'].lineData[25]++;
        return children[index];
      }
    }
    _$jscoverage['/toolbar.js'].lineData[29]++;
    do {
      _$jscoverage['/toolbar.js'].lineData[30]++;
      count++;
      _$jscoverage['/toolbar.js'].lineData[31]++;
      index = (index + childrenLength + direction) % childrenLength;
    } while (visit4_32_1(visit5_32_2(count < childrenLength) && children[index].get('disabled')));
    _$jscoverage['/toolbar.js'].lineData[34]++;
    if (visit6_34_1(count !== childrenLength)) {
      _$jscoverage['/toolbar.js'].lineData[35]++;
      return children[index];
    }
    _$jscoverage['/toolbar.js'].lineData[38]++;
    return null;
  }
  _$jscoverage['/toolbar.js'].lineData[41]++;
  function afterCollapsedChange(e) {
    _$jscoverage['/toolbar.js'].functionData[2]++;
    _$jscoverage['/toolbar.js'].lineData[42]++;
    var self = this;
    _$jscoverage['/toolbar.js'].lineData[43]++;
    if (visit7_43_1(e.newVal)) {
      _$jscoverage['/toolbar.js'].lineData[44]++;
      self.set('expandedItem', null);
    } else {
      _$jscoverage['/toolbar.js'].lineData[46]++;
      self.set('expandedItem', e.target);
    }
  }
  _$jscoverage['/toolbar.js'].lineData[50]++;
  function afterHighlightedChange(e) {
    _$jscoverage['/toolbar.js'].functionData[3]++;
    _$jscoverage['/toolbar.js'].lineData[51]++;
    var self = this, expandedItem, children, target = e.target;
    _$jscoverage['/toolbar.js'].lineData[55]++;
    if (visit8_55_1(visit9_55_2(self !== target) && (visit10_55_3(target.isMenuItem || target.isButton)))) {
      _$jscoverage['/toolbar.js'].lineData[57]++;
      if (visit11_57_1(e.newVal)) {
        _$jscoverage['/toolbar.js'].lineData[58]++;
        children = self.get('children');
        _$jscoverage['/toolbar.js'].lineData[59]++;
        if (visit12_59_1((expandedItem = self.get('expandedItem')) && S.inArray(target, children))) {
          _$jscoverage['/toolbar.js'].lineData[61]++;
          self.set('expandedItem', target.isMenuButton ? target : null);
        }
        _$jscoverage['/toolbar.js'].lineData[63]++;
        self.set('highlightedItem', target);
      } else {
        _$jscoverage['/toolbar.js'].lineData[65]++;
        if (visit13_65_1(!e.byPassSetToolbarHighlightedItem)) {
          _$jscoverage['/toolbar.js'].lineData[66]++;
          self.set('highlightedItem', null);
        }
      }
    }
  }
  _$jscoverage['/toolbar.js'].lineData[72]++;
  function getChildByHighlightedItem(toolbar) {
    _$jscoverage['/toolbar.js'].functionData[4]++;
    _$jscoverage['/toolbar.js'].lineData[73]++;
    var children = toolbar.get('children'), i, child;
    _$jscoverage['/toolbar.js'].lineData[74]++;
    for (i = 0; visit14_74_1(i < children.length); i++) {
      _$jscoverage['/toolbar.js'].lineData[75]++;
      child = children[i];
      _$jscoverage['/toolbar.js'].lineData[76]++;
      if (visit15_76_1(child.get('highlighted') || (visit16_76_2(child.isMenuButton && !child.get('collapsed'))))) {
        _$jscoverage['/toolbar.js'].lineData[77]++;
        return child;
      }
    }
    _$jscoverage['/toolbar.js'].lineData[80]++;
    return null;
  }
  _$jscoverage['/toolbar.js'].lineData[88]++;
  return Container.extend([DelegateChildrenExtension], {
  beforeCreateDom: function(renderData) {
  _$jscoverage['/toolbar.js'].functionData[5]++;
  _$jscoverage['/toolbar.js'].lineData[90]++;
  renderData.elAttrs.role = 'toolbar';
}, 
  bindUI: function() {
  _$jscoverage['/toolbar.js'].functionData[6]++;
  _$jscoverage['/toolbar.js'].lineData[97]++;
  var self = this;
  _$jscoverage['/toolbar.js'].lineData[98]++;
  self.on('afterCollapsedChange', afterCollapsedChange, self);
  _$jscoverage['/toolbar.js'].lineData[99]++;
  self.on('afterHighlightedChange', afterHighlightedChange, self);
}, 
  handleBlurInternal: function(e) {
  _$jscoverage['/toolbar.js'].functionData[7]++;
  _$jscoverage['/toolbar.js'].lineData[103]++;
  var self = this, highlightedItem;
  _$jscoverage['/toolbar.js'].lineData[105]++;
  self.callSuper(e);
  _$jscoverage['/toolbar.js'].lineData[106]++;
  self.set('expandedItem', null);
  _$jscoverage['/toolbar.js'].lineData[108]++;
  if ((highlightedItem = self.get('highlightedItem'))) {
    _$jscoverage['/toolbar.js'].lineData[109]++;
    highlightedItem.set('highlighted', false);
  }
}, 
  getNextItemByKeyDown: function(e, current) {
  _$jscoverage['/toolbar.js'].functionData[8]++;
  _$jscoverage['/toolbar.js'].lineData[114]++;
  var self = this, children = self.get('children'), childIndex = visit17_116_1(current && S.indexOf(current, children));
  _$jscoverage['/toolbar.js'].lineData[118]++;
  if (visit18_118_1(current)) {
    _$jscoverage['/toolbar.js'].lineData[119]++;
    if (visit19_119_1(current.handleKeyDownInternal(e))) {
      _$jscoverage['/toolbar.js'].lineData[120]++;
      return true;
    }
  }
  _$jscoverage['/toolbar.js'].lineData[125]++;
  if (visit20_125_1(e.shiftKey || visit21_125_2(e.ctrlKey || visit22_125_3(e.metaKey || e.altKey)))) {
    _$jscoverage['/toolbar.js'].lineData[126]++;
    return false;
  }
  _$jscoverage['/toolbar.js'].lineData[131]++;
  switch (e.keyCode) {
    case KeyCode.ESC:
      _$jscoverage['/toolbar.js'].lineData[133]++;
      self.getKeyEventTarget().fire('blur');
      _$jscoverage['/toolbar.js'].lineData[134]++;
      return true;
    case KeyCode.HOME:
      _$jscoverage['/toolbar.js'].lineData[137]++;
      current = getNextEnabledItem(undefined, 1, self);
      _$jscoverage['/toolbar.js'].lineData[138]++;
      break;
    case KeyCode.END:
      _$jscoverage['/toolbar.js'].lineData[141]++;
      current = getNextEnabledItem(undefined, -1, self);
      _$jscoverage['/toolbar.js'].lineData[142]++;
      break;
    case KeyCode.UP:
      _$jscoverage['/toolbar.js'].lineData[145]++;
      current = getNextEnabledItem(childIndex, -1, self);
      _$jscoverage['/toolbar.js'].lineData[146]++;
      break;
    case KeyCode.LEFT:
      _$jscoverage['/toolbar.js'].lineData[149]++;
      current = getNextEnabledItem(childIndex, -1, self);
      _$jscoverage['/toolbar.js'].lineData[150]++;
      break;
    case KeyCode.DOWN:
      _$jscoverage['/toolbar.js'].lineData[153]++;
      current = getNextEnabledItem(childIndex, 1, self);
      _$jscoverage['/toolbar.js'].lineData[154]++;
      break;
    case KeyCode.RIGHT:
      _$jscoverage['/toolbar.js'].lineData[157]++;
      current = getNextEnabledItem(childIndex, 1, self);
      _$jscoverage['/toolbar.js'].lineData[158]++;
      break;
    default:
      _$jscoverage['/toolbar.js'].lineData[161]++;
      return false;
  }
  _$jscoverage['/toolbar.js'].lineData[163]++;
  return current;
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/toolbar.js'].functionData[9]++;
  _$jscoverage['/toolbar.js'].lineData[167]++;
  var self = this, currentChild = getChildByHighlightedItem(self), nextHighlightedItem = self.getNextItemByKeyDown(e, currentChild);
  _$jscoverage['/toolbar.js'].lineData[171]++;
  if (visit23_171_1(typeof nextHighlightedItem === 'boolean')) {
    _$jscoverage['/toolbar.js'].lineData[172]++;
    return nextHighlightedItem;
  }
  _$jscoverage['/toolbar.js'].lineData[175]++;
  if (visit24_175_1(nextHighlightedItem)) {
    _$jscoverage['/toolbar.js'].lineData[176]++;
    nextHighlightedItem.set('highlighted', true);
  }
  _$jscoverage['/toolbar.js'].lineData[179]++;
  return true;
}, 
  _onSetHighlightedItem: function(item, e) {
  _$jscoverage['/toolbar.js'].functionData[10]++;
  _$jscoverage['/toolbar.js'].lineData[183]++;
  var id, itemEl, self = this, prevVal = visit25_185_1(e && e.prevVal), children = self.get('children'), el = self.el;
  _$jscoverage['/toolbar.js'].lineData[189]++;
  if (visit26_189_1(prevVal && S.inArray(prevVal, children))) {
    _$jscoverage['/toolbar.js'].lineData[190]++;
    prevVal.set('highlighted', false, {
  data: {
  byPassSetToolbarHighlightedItem: 1}});
  }
  _$jscoverage['/toolbar.js'].lineData[196]++;
  if (visit27_196_1(item)) {
    _$jscoverage['/toolbar.js'].lineData[197]++;
    if (visit28_197_1(el.ownerDocument.activeElement !== el)) {
      _$jscoverage['/toolbar.js'].lineData[198]++;
      self.focus();
    }
    _$jscoverage['/toolbar.js'].lineData[200]++;
    itemEl = item.el;
    _$jscoverage['/toolbar.js'].lineData[201]++;
    id = itemEl.id;
    _$jscoverage['/toolbar.js'].lineData[202]++;
    if (visit29_202_1(!id)) {
      _$jscoverage['/toolbar.js'].lineData[203]++;
      itemEl.id = id = S.guid('ks-toolbar-item');
    }
    _$jscoverage['/toolbar.js'].lineData[205]++;
    el.setAttribute('aria-activedescendant', id);
  } else {
    _$jscoverage['/toolbar.js'].lineData[207]++;
    el.setAttribute('aria-activedescendant', '');
  }
}, 
  _onSetExpandedItem: function(v, e) {
  _$jscoverage['/toolbar.js'].functionData[11]++;
  _$jscoverage['/toolbar.js'].lineData[212]++;
  if (visit30_212_1(e && e.prevVal)) {
    _$jscoverage['/toolbar.js'].lineData[213]++;
    e.prevVal.set('collapsed', true);
  }
  _$jscoverage['/toolbar.js'].lineData[215]++;
  if (visit31_215_1(v)) {
    _$jscoverage['/toolbar.js'].lineData[216]++;
    v.set('collapsed', false);
  }
}}, {
  xclass: 'toolbar', 
  ATTRS: {
  highlightedItem: {}, 
  expandedItem: {}, 
  defaultChildCfg: {
  value: {
  xclass: 'button', 
  handleGestureEvents: false, 
  focusable: false}}}});
});
