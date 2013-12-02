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
  _$jscoverage['/toolbar.js'].lineData[10] = 0;
  _$jscoverage['/toolbar.js'].lineData[12] = 0;
  _$jscoverage['/toolbar.js'].lineData[14] = 0;
  _$jscoverage['/toolbar.js'].lineData[15] = 0;
  _$jscoverage['/toolbar.js'].lineData[19] = 0;
  _$jscoverage['/toolbar.js'].lineData[20] = 0;
  _$jscoverage['/toolbar.js'].lineData[21] = 0;
  _$jscoverage['/toolbar.js'].lineData[23] = 0;
  _$jscoverage['/toolbar.js'].lineData[25] = 0;
  _$jscoverage['/toolbar.js'].lineData[26] = 0;
  _$jscoverage['/toolbar.js'].lineData[30] = 0;
  _$jscoverage['/toolbar.js'].lineData[31] = 0;
  _$jscoverage['/toolbar.js'].lineData[32] = 0;
  _$jscoverage['/toolbar.js'].lineData[35] = 0;
  _$jscoverage['/toolbar.js'].lineData[36] = 0;
  _$jscoverage['/toolbar.js'].lineData[39] = 0;
  _$jscoverage['/toolbar.js'].lineData[42] = 0;
  _$jscoverage['/toolbar.js'].lineData[43] = 0;
  _$jscoverage['/toolbar.js'].lineData[44] = 0;
  _$jscoverage['/toolbar.js'].lineData[45] = 0;
  _$jscoverage['/toolbar.js'].lineData[47] = 0;
  _$jscoverage['/toolbar.js'].lineData[51] = 0;
  _$jscoverage['/toolbar.js'].lineData[52] = 0;
  _$jscoverage['/toolbar.js'].lineData[56] = 0;
  _$jscoverage['/toolbar.js'].lineData[58] = 0;
  _$jscoverage['/toolbar.js'].lineData[59] = 0;
  _$jscoverage['/toolbar.js'].lineData[60] = 0;
  _$jscoverage['/toolbar.js'].lineData[62] = 0;
  _$jscoverage['/toolbar.js'].lineData[64] = 0;
  _$jscoverage['/toolbar.js'].lineData[66] = 0;
  _$jscoverage['/toolbar.js'].lineData[67] = 0;
  _$jscoverage['/toolbar.js'].lineData[73] = 0;
  _$jscoverage['/toolbar.js'].lineData[74] = 0;
  _$jscoverage['/toolbar.js'].lineData[75] = 0;
  _$jscoverage['/toolbar.js'].lineData[76] = 0;
  _$jscoverage['/toolbar.js'].lineData[77] = 0;
  _$jscoverage['/toolbar.js'].lineData[78] = 0;
  _$jscoverage['/toolbar.js'].lineData[81] = 0;
  _$jscoverage['/toolbar.js'].lineData[89] = 0;
  _$jscoverage['/toolbar.js'].lineData[91] = 0;
  _$jscoverage['/toolbar.js'].lineData[97] = 0;
  _$jscoverage['/toolbar.js'].lineData[98] = 0;
  _$jscoverage['/toolbar.js'].lineData[104] = 0;
  _$jscoverage['/toolbar.js'].lineData[105] = 0;
  _$jscoverage['/toolbar.js'].lineData[106] = 0;
  _$jscoverage['/toolbar.js'].lineData[108] = 0;
  _$jscoverage['/toolbar.js'].lineData[109] = 0;
  _$jscoverage['/toolbar.js'].lineData[110] = 0;
  _$jscoverage['/toolbar.js'].lineData[111] = 0;
  _$jscoverage['/toolbar.js'].lineData[113] = 0;
  _$jscoverage['/toolbar.js'].lineData[115] = 0;
  _$jscoverage['/toolbar.js'].lineData[120] = 0;
  _$jscoverage['/toolbar.js'].lineData[121] = 0;
  _$jscoverage['/toolbar.js'].lineData[123] = 0;
  _$jscoverage['/toolbar.js'].lineData[124] = 0;
  _$jscoverage['/toolbar.js'].lineData[132] = 0;
  _$jscoverage['/toolbar.js'].lineData[133] = 0;
  _$jscoverage['/toolbar.js'].lineData[134] = 0;
  _$jscoverage['/toolbar.js'].lineData[138] = 0;
  _$jscoverage['/toolbar.js'].lineData[140] = 0;
  _$jscoverage['/toolbar.js'].lineData[141] = 0;
  _$jscoverage['/toolbar.js'].lineData[143] = 0;
  _$jscoverage['/toolbar.js'].lineData[144] = 0;
  _$jscoverage['/toolbar.js'].lineData[149] = 0;
  _$jscoverage['/toolbar.js'].lineData[153] = 0;
  _$jscoverage['/toolbar.js'].lineData[154] = 0;
  _$jscoverage['/toolbar.js'].lineData[155] = 0;
  _$jscoverage['/toolbar.js'].lineData[160] = 0;
  _$jscoverage['/toolbar.js'].lineData[161] = 0;
  _$jscoverage['/toolbar.js'].lineData[166] = 0;
  _$jscoverage['/toolbar.js'].lineData[168] = 0;
  _$jscoverage['/toolbar.js'].lineData[169] = 0;
  _$jscoverage['/toolbar.js'].lineData[172] = 0;
  _$jscoverage['/toolbar.js'].lineData[173] = 0;
  _$jscoverage['/toolbar.js'].lineData[176] = 0;
  _$jscoverage['/toolbar.js'].lineData[177] = 0;
  _$jscoverage['/toolbar.js'].lineData[180] = 0;
  _$jscoverage['/toolbar.js'].lineData[181] = 0;
  _$jscoverage['/toolbar.js'].lineData[184] = 0;
  _$jscoverage['/toolbar.js'].lineData[185] = 0;
  _$jscoverage['/toolbar.js'].lineData[188] = 0;
  _$jscoverage['/toolbar.js'].lineData[189] = 0;
  _$jscoverage['/toolbar.js'].lineData[192] = 0;
  _$jscoverage['/toolbar.js'].lineData[193] = 0;
  _$jscoverage['/toolbar.js'].lineData[196] = 0;
  _$jscoverage['/toolbar.js'].lineData[198] = 0;
  _$jscoverage['/toolbar.js'].lineData[202] = 0;
  _$jscoverage['/toolbar.js'].lineData[206] = 0;
  _$jscoverage['/toolbar.js'].lineData[207] = 0;
  _$jscoverage['/toolbar.js'].lineData[210] = 0;
  _$jscoverage['/toolbar.js'].lineData[211] = 0;
  _$jscoverage['/toolbar.js'].lineData[214] = 0;
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
}
if (! _$jscoverage['/toolbar.js'].branchData) {
  _$jscoverage['/toolbar.js'].branchData = {};
  _$jscoverage['/toolbar.js'].branchData['19'] = [];
  _$jscoverage['/toolbar.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['20'] = [];
  _$jscoverage['/toolbar.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['25'] = [];
  _$jscoverage['/toolbar.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['33'] = [];
  _$jscoverage['/toolbar.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['33'][2] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['35'] = [];
  _$jscoverage['/toolbar.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['44'] = [];
  _$jscoverage['/toolbar.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['56'] = [];
  _$jscoverage['/toolbar.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['56'][2] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['56'][3] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['58'] = [];
  _$jscoverage['/toolbar.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['60'] = [];
  _$jscoverage['/toolbar.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['66'] = [];
  _$jscoverage['/toolbar.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['75'] = [];
  _$jscoverage['/toolbar.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['77'] = [];
  _$jscoverage['/toolbar.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['77'][2] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['93'] = [];
  _$jscoverage['/toolbar.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['97'] = [];
  _$jscoverage['/toolbar.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['104'] = [];
  _$jscoverage['/toolbar.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['105'] = [];
  _$jscoverage['/toolbar.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['110'] = [];
  _$jscoverage['/toolbar.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['120'] = [];
  _$jscoverage['/toolbar.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['123'] = [];
  _$jscoverage['/toolbar.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['151'] = [];
  _$jscoverage['/toolbar.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['153'] = [];
  _$jscoverage['/toolbar.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['154'] = [];
  _$jscoverage['/toolbar.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['160'] = [];
  _$jscoverage['/toolbar.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['160'][2] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['160'][3] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['206'] = [];
  _$jscoverage['/toolbar.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['210'] = [];
  _$jscoverage['/toolbar.js'].branchData['210'][1] = new BranchData();
}
_$jscoverage['/toolbar.js'].branchData['210'][1].init(312, 19, 'nextHighlightedItem');
function visit31_210_1(result) {
  _$jscoverage['/toolbar.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['206'][1].init(193, 40, 'typeof nextHighlightedItem === \'boolean\'');
function visit30_206_1(result) {
  _$jscoverage['/toolbar.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['160'][3].init(417, 21, 'e.metaKey || e.altKey');
function visit29_160_3(result) {
  _$jscoverage['/toolbar.js'].branchData['160'][3].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['160'][2].init(404, 34, 'e.ctrlKey || e.metaKey || e.altKey');
function visit28_160_2(result) {
  _$jscoverage['/toolbar.js'].branchData['160'][2].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['160'][1].init(390, 48, 'e.shiftKey || e.ctrlKey || e.metaKey || e.altKey');
function visit27_160_1(result) {
  _$jscoverage['/toolbar.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['154'][1].init(21, 32, 'current.handleKeyDownInternal(e)');
function visit26_154_1(result) {
  _$jscoverage['/toolbar.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['153'][1].init(166, 7, 'current');
function visit25_153_1(result) {
  _$jscoverage['/toolbar.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['151'][1].init(94, 39, 'current && S.indexOf(current, children)');
function visit24_151_1(result) {
  _$jscoverage['/toolbar.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['123'][1].init(115, 1, 'v');
function visit23_123_1(result) {
  _$jscoverage['/toolbar.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['120'][1].init(17, 14, 'e && e.prevVal');
function visit22_120_1(result) {
  _$jscoverage['/toolbar.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['110'][1].init(200, 3, '!id');
function visit21_110_1(result) {
  _$jscoverage['/toolbar.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['105'][1].init(21, 37, 'el.ownerDocument.activeElement !== el');
function visit20_105_1(result) {
  _$jscoverage['/toolbar.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['104'][1].init(493, 4, 'item');
function visit19_104_1(result) {
  _$jscoverage['/toolbar.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['97'][1].init(239, 39, 'prevVal && S.inArray(prevVal, children)');
function visit18_97_1(result) {
  _$jscoverage['/toolbar.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['93'][1].init(70, 14, 'e && e.prevVal');
function visit17_93_1(result) {
  _$jscoverage['/toolbar.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['77'][2].init(79, 45, 'child.isMenuButton && !child.get(\'collapsed\')');
function visit16_77_2(result) {
  _$jscoverage['/toolbar.js'].branchData['77'][2].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['77'][1].init(50, 75, 'child.get(\'highlighted\') || (child.isMenuButton && !child.get(\'collapsed\'))');
function visit15_77_1(result) {
  _$jscoverage['/toolbar.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['75'][1].init(79, 19, 'i < children.length');
function visit14_75_1(result) {
  _$jscoverage['/toolbar.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['66'][1].init(21, 34, '!e.byPassSetToolbarHighlightedItem');
function visit13_66_1(result) {
  _$jscoverage['/toolbar.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['60'][1].init(71, 71, '(expandedItem = self.get(\'expandedItem\')) && S.inArray(target, children)');
function visit12_60_1(result) {
  _$jscoverage['/toolbar.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['58'][1].init(18, 8, 'e.newVal');
function visit11_58_1(result) {
  _$jscoverage['/toolbar.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['56'][3].init(137, 36, 'target.isMenuItem || target.isButton');
function visit10_56_3(result) {
  _$jscoverage['/toolbar.js'].branchData['56'][3].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['56'][2].init(117, 15, 'self !== target');
function visit9_56_2(result) {
  _$jscoverage['/toolbar.js'].branchData['56'][2].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['56'][1].init(117, 57, 'self !== target && (target.isMenuItem || target.isButton)');
function visit8_56_1(result) {
  _$jscoverage['/toolbar.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['44'][1].init(38, 8, 'e.newVal');
function visit7_44_1(result) {
  _$jscoverage['/toolbar.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['35'][1].init(608, 24, 'count !== childrenLength');
function visit6_35_1(result) {
  _$jscoverage['/toolbar.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['33'][2].init(536, 22, 'count < childrenLength');
function visit5_33_2(result) {
  _$jscoverage['/toolbar.js'].branchData['33'][2].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['33'][1].init(117, 57, 'count < childrenLength && children[index].get(\'disabled\')');
function visit4_33_1(result) {
  _$jscoverage['/toolbar.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['25'][1].init(158, 32, '!children[index].get(\'disabled\')');
function visit3_25_1(result) {
  _$jscoverage['/toolbar.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['20'][1].init(17, 15, 'direction === 1');
function visit2_20_1(result) {
  _$jscoverage['/toolbar.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['19'][1].init(128, 19, 'index === undefined');
function visit1_19_1(result) {
  _$jscoverage['/toolbar.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/toolbar.js'].functionData[0]++;
  _$jscoverage['/toolbar.js'].lineData[7]++;
  var Container = require('component/container');
  _$jscoverage['/toolbar.js'].lineData[8]++;
  var DelegateChildrenExtension = require('component/extension/delegate-children');
  _$jscoverage['/toolbar.js'].lineData[9]++;
  var ToolbarRender = require('toolbar/render');
  _$jscoverage['/toolbar.js'].lineData[10]++;
  var Node = require('node');
  _$jscoverage['/toolbar.js'].lineData[12]++;
  var KeyCode = Node.KeyCode;
  _$jscoverage['/toolbar.js'].lineData[14]++;
  function getNextEnabledItem(index, direction, self) {
    _$jscoverage['/toolbar.js'].functionData[1]++;
    _$jscoverage['/toolbar.js'].lineData[15]++;
    var children = self.get('children'), count = 0, childrenLength = children.length;
    _$jscoverage['/toolbar.js'].lineData[19]++;
    if (visit1_19_1(index === undefined)) {
      _$jscoverage['/toolbar.js'].lineData[20]++;
      if (visit2_20_1(direction === 1)) {
        _$jscoverage['/toolbar.js'].lineData[21]++;
        index = 0;
      } else {
        _$jscoverage['/toolbar.js'].lineData[23]++;
        index = childrenLength - 1;
      }
      _$jscoverage['/toolbar.js'].lineData[25]++;
      if (visit3_25_1(!children[index].get('disabled'))) {
        _$jscoverage['/toolbar.js'].lineData[26]++;
        return children[index];
      }
    }
    _$jscoverage['/toolbar.js'].lineData[30]++;
    do {
      _$jscoverage['/toolbar.js'].lineData[31]++;
      count++;
      _$jscoverage['/toolbar.js'].lineData[32]++;
      index = (index + childrenLength + direction) % childrenLength;
    } while (visit4_33_1(visit5_33_2(count < childrenLength) && children[index].get('disabled')));
    _$jscoverage['/toolbar.js'].lineData[35]++;
    if (visit6_35_1(count !== childrenLength)) {
      _$jscoverage['/toolbar.js'].lineData[36]++;
      return children[index];
    }
    _$jscoverage['/toolbar.js'].lineData[39]++;
    return null;
  }
  _$jscoverage['/toolbar.js'].lineData[42]++;
  function afterCollapsedChange(e) {
    _$jscoverage['/toolbar.js'].functionData[2]++;
    _$jscoverage['/toolbar.js'].lineData[43]++;
    var self = this;
    _$jscoverage['/toolbar.js'].lineData[44]++;
    if (visit7_44_1(e.newVal)) {
      _$jscoverage['/toolbar.js'].lineData[45]++;
      self.set('expandedItem', null);
    } else {
      _$jscoverage['/toolbar.js'].lineData[47]++;
      self.set('expandedItem', e.target);
    }
  }
  _$jscoverage['/toolbar.js'].lineData[51]++;
  function afterHighlightedChange(e) {
    _$jscoverage['/toolbar.js'].functionData[3]++;
    _$jscoverage['/toolbar.js'].lineData[52]++;
    var self = this, expandedItem, children, target = e.target;
    _$jscoverage['/toolbar.js'].lineData[56]++;
    if (visit8_56_1(visit9_56_2(self !== target) && (visit10_56_3(target.isMenuItem || target.isButton)))) {
      _$jscoverage['/toolbar.js'].lineData[58]++;
      if (visit11_58_1(e.newVal)) {
        _$jscoverage['/toolbar.js'].lineData[59]++;
        children = self.get('children');
        _$jscoverage['/toolbar.js'].lineData[60]++;
        if (visit12_60_1((expandedItem = self.get('expandedItem')) && S.inArray(target, children))) {
          _$jscoverage['/toolbar.js'].lineData[62]++;
          self.set('expandedItem', target.isMenuButton ? target : null);
        }
        _$jscoverage['/toolbar.js'].lineData[64]++;
        self.set('highlightedItem', target);
      } else {
        _$jscoverage['/toolbar.js'].lineData[66]++;
        if (visit13_66_1(!e.byPassSetToolbarHighlightedItem)) {
          _$jscoverage['/toolbar.js'].lineData[67]++;
          self.set('highlightedItem', null);
        }
      }
    }
  }
  _$jscoverage['/toolbar.js'].lineData[73]++;
  function getChildByHighlightedItem(toolbar) {
    _$jscoverage['/toolbar.js'].functionData[4]++;
    _$jscoverage['/toolbar.js'].lineData[74]++;
    var children = toolbar.get('children'), i, child;
    _$jscoverage['/toolbar.js'].lineData[75]++;
    for (i = 0; visit14_75_1(i < children.length); i++) {
      _$jscoverage['/toolbar.js'].lineData[76]++;
      child = children[i];
      _$jscoverage['/toolbar.js'].lineData[77]++;
      if (visit15_77_1(child.get('highlighted') || (visit16_77_2(child.isMenuButton && !child.get('collapsed'))))) {
        _$jscoverage['/toolbar.js'].lineData[78]++;
        return child;
      }
    }
    _$jscoverage['/toolbar.js'].lineData[81]++;
    return null;
  }
  _$jscoverage['/toolbar.js'].lineData[89]++;
  return Container.extend([DelegateChildrenExtension], {
  _onSetHighlightedItem: function(item, e) {
  _$jscoverage['/toolbar.js'].functionData[5]++;
  _$jscoverage['/toolbar.js'].lineData[91]++;
  var id, itemEl, self = this, prevVal = visit17_93_1(e && e.prevVal), children = self.get('children'), el = self.el;
  _$jscoverage['/toolbar.js'].lineData[97]++;
  if (visit18_97_1(prevVal && S.inArray(prevVal, children))) {
    _$jscoverage['/toolbar.js'].lineData[98]++;
    prevVal.set('highlighted', false, {
  data: {
  byPassSetToolbarHighlightedItem: 1}});
  }
  _$jscoverage['/toolbar.js'].lineData[104]++;
  if (visit19_104_1(item)) {
    _$jscoverage['/toolbar.js'].lineData[105]++;
    if (visit20_105_1(el.ownerDocument.activeElement !== el)) {
      _$jscoverage['/toolbar.js'].lineData[106]++;
      self.focus();
    }
    _$jscoverage['/toolbar.js'].lineData[108]++;
    itemEl = item.el;
    _$jscoverage['/toolbar.js'].lineData[109]++;
    id = itemEl.id;
    _$jscoverage['/toolbar.js'].lineData[110]++;
    if (visit21_110_1(!id)) {
      _$jscoverage['/toolbar.js'].lineData[111]++;
      itemEl.id = id = S.guid('ks-toolbar-item');
    }
    _$jscoverage['/toolbar.js'].lineData[113]++;
    el.setAttribute('aria-activedescendant', id);
  } else {
    _$jscoverage['/toolbar.js'].lineData[115]++;
    el.setAttribute('aria-activedescendant', '');
  }
}, 
  '_onSetExpandedItem': function(v, e) {
  _$jscoverage['/toolbar.js'].functionData[6]++;
  _$jscoverage['/toolbar.js'].lineData[120]++;
  if (visit22_120_1(e && e.prevVal)) {
    _$jscoverage['/toolbar.js'].lineData[121]++;
    e.prevVal.set('collapsed', true);
  }
  _$jscoverage['/toolbar.js'].lineData[123]++;
  if (visit23_123_1(v)) {
    _$jscoverage['/toolbar.js'].lineData[124]++;
    v.set('collapsed', false);
  }
}, 
  bindUI: function() {
  _$jscoverage['/toolbar.js'].functionData[7]++;
  _$jscoverage['/toolbar.js'].lineData[132]++;
  var self = this;
  _$jscoverage['/toolbar.js'].lineData[133]++;
  self.on('afterCollapsedChange', afterCollapsedChange, self);
  _$jscoverage['/toolbar.js'].lineData[134]++;
  self.on('afterHighlightedChange', afterHighlightedChange, self);
}, 
  handleBlurInternal: function(e) {
  _$jscoverage['/toolbar.js'].functionData[8]++;
  _$jscoverage['/toolbar.js'].lineData[138]++;
  var self = this, highlightedItem;
  _$jscoverage['/toolbar.js'].lineData[140]++;
  self.callSuper(e);
  _$jscoverage['/toolbar.js'].lineData[141]++;
  self.set('expandedItem', null);
  _$jscoverage['/toolbar.js'].lineData[143]++;
  if ((highlightedItem = self.get('highlightedItem'))) {
    _$jscoverage['/toolbar.js'].lineData[144]++;
    highlightedItem.set('highlighted', false);
  }
}, 
  getNextItemByKeyDown: function(e, current) {
  _$jscoverage['/toolbar.js'].functionData[9]++;
  _$jscoverage['/toolbar.js'].lineData[149]++;
  var self = this, children = self.get('children'), childIndex = visit24_151_1(current && S.indexOf(current, children));
  _$jscoverage['/toolbar.js'].lineData[153]++;
  if (visit25_153_1(current)) {
    _$jscoverage['/toolbar.js'].lineData[154]++;
    if (visit26_154_1(current.handleKeyDownInternal(e))) {
      _$jscoverage['/toolbar.js'].lineData[155]++;
      return true;
    }
  }
  _$jscoverage['/toolbar.js'].lineData[160]++;
  if (visit27_160_1(e.shiftKey || visit28_160_2(e.ctrlKey || visit29_160_3(e.metaKey || e.altKey)))) {
    _$jscoverage['/toolbar.js'].lineData[161]++;
    return false;
  }
  _$jscoverage['/toolbar.js'].lineData[166]++;
  switch (e.keyCode) {
    case KeyCode.ESC:
      _$jscoverage['/toolbar.js'].lineData[168]++;
      self.view.getKeyEventTarget().fire('blur');
      _$jscoverage['/toolbar.js'].lineData[169]++;
      return true;
    case KeyCode.HOME:
      _$jscoverage['/toolbar.js'].lineData[172]++;
      current = getNextEnabledItem(undefined, 1, self);
      _$jscoverage['/toolbar.js'].lineData[173]++;
      break;
    case KeyCode.END:
      _$jscoverage['/toolbar.js'].lineData[176]++;
      current = getNextEnabledItem(undefined, -1, self);
      _$jscoverage['/toolbar.js'].lineData[177]++;
      break;
    case KeyCode.UP:
      _$jscoverage['/toolbar.js'].lineData[180]++;
      current = getNextEnabledItem(childIndex, -1, self);
      _$jscoverage['/toolbar.js'].lineData[181]++;
      break;
    case KeyCode.LEFT:
      _$jscoverage['/toolbar.js'].lineData[184]++;
      current = getNextEnabledItem(childIndex, -1, self);
      _$jscoverage['/toolbar.js'].lineData[185]++;
      break;
    case KeyCode.DOWN:
      _$jscoverage['/toolbar.js'].lineData[188]++;
      current = getNextEnabledItem(childIndex, 1, self);
      _$jscoverage['/toolbar.js'].lineData[189]++;
      break;
    case KeyCode.RIGHT:
      _$jscoverage['/toolbar.js'].lineData[192]++;
      current = getNextEnabledItem(childIndex, 1, self);
      _$jscoverage['/toolbar.js'].lineData[193]++;
      break;
    default:
      _$jscoverage['/toolbar.js'].lineData[196]++;
      return false;
  }
  _$jscoverage['/toolbar.js'].lineData[198]++;
  return current;
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/toolbar.js'].functionData[10]++;
  _$jscoverage['/toolbar.js'].lineData[202]++;
  var self = this, currentChild = getChildByHighlightedItem(self), nextHighlightedItem = self.getNextItemByKeyDown(e, currentChild);
  _$jscoverage['/toolbar.js'].lineData[206]++;
  if (visit30_206_1(typeof nextHighlightedItem === 'boolean')) {
    _$jscoverage['/toolbar.js'].lineData[207]++;
    return nextHighlightedItem;
  }
  _$jscoverage['/toolbar.js'].lineData[210]++;
  if (visit31_210_1(nextHighlightedItem)) {
    _$jscoverage['/toolbar.js'].lineData[211]++;
    nextHighlightedItem.set('highlighted', true);
  }
  _$jscoverage['/toolbar.js'].lineData[214]++;
  return true;
}}, {
  xclass: 'toolbar', 
  ATTRS: {
  highlightedItem: {}, 
  expandedItem: {}, 
  defaultChildCfg: {
  value: {
  xclass: 'button', 
  handleMouseEvents: false, 
  focusable: false}}, 
  xrender: {
  value: ToolbarRender}}});
});
