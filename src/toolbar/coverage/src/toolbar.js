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
  _$jscoverage['/toolbar.js'].lineData[5] = 0;
  _$jscoverage['/toolbar.js'].lineData[6] = 0;
  _$jscoverage['/toolbar.js'].lineData[8] = 0;
  _$jscoverage['/toolbar.js'].lineData[9] = 0;
  _$jscoverage['/toolbar.js'].lineData[13] = 0;
  _$jscoverage['/toolbar.js'].lineData[14] = 0;
  _$jscoverage['/toolbar.js'].lineData[15] = 0;
  _$jscoverage['/toolbar.js'].lineData[17] = 0;
  _$jscoverage['/toolbar.js'].lineData[19] = 0;
  _$jscoverage['/toolbar.js'].lineData[20] = 0;
  _$jscoverage['/toolbar.js'].lineData[24] = 0;
  _$jscoverage['/toolbar.js'].lineData[25] = 0;
  _$jscoverage['/toolbar.js'].lineData[26] = 0;
  _$jscoverage['/toolbar.js'].lineData[29] = 0;
  _$jscoverage['/toolbar.js'].lineData[30] = 0;
  _$jscoverage['/toolbar.js'].lineData[33] = 0;
  _$jscoverage['/toolbar.js'].lineData[36] = 0;
  _$jscoverage['/toolbar.js'].lineData[37] = 0;
  _$jscoverage['/toolbar.js'].lineData[38] = 0;
  _$jscoverage['/toolbar.js'].lineData[39] = 0;
  _$jscoverage['/toolbar.js'].lineData[41] = 0;
  _$jscoverage['/toolbar.js'].lineData[45] = 0;
  _$jscoverage['/toolbar.js'].lineData[46] = 0;
  _$jscoverage['/toolbar.js'].lineData[50] = 0;
  _$jscoverage['/toolbar.js'].lineData[52] = 0;
  _$jscoverage['/toolbar.js'].lineData[53] = 0;
  _$jscoverage['/toolbar.js'].lineData[54] = 0;
  _$jscoverage['/toolbar.js'].lineData[56] = 0;
  _$jscoverage['/toolbar.js'].lineData[58] = 0;
  _$jscoverage['/toolbar.js'].lineData[60] = 0;
  _$jscoverage['/toolbar.js'].lineData[61] = 0;
  _$jscoverage['/toolbar.js'].lineData[67] = 0;
  _$jscoverage['/toolbar.js'].lineData[68] = 0;
  _$jscoverage['/toolbar.js'].lineData[69] = 0;
  _$jscoverage['/toolbar.js'].lineData[70] = 0;
  _$jscoverage['/toolbar.js'].lineData[71] = 0;
  _$jscoverage['/toolbar.js'].lineData[72] = 0;
  _$jscoverage['/toolbar.js'].lineData[75] = 0;
  _$jscoverage['/toolbar.js'].lineData[82] = 0;
  _$jscoverage['/toolbar.js'].lineData[84] = 0;
  _$jscoverage['/toolbar.js'].lineData[90] = 0;
  _$jscoverage['/toolbar.js'].lineData[91] = 0;
  _$jscoverage['/toolbar.js'].lineData[97] = 0;
  _$jscoverage['/toolbar.js'].lineData[98] = 0;
  _$jscoverage['/toolbar.js'].lineData[99] = 0;
  _$jscoverage['/toolbar.js'].lineData[101] = 0;
  _$jscoverage['/toolbar.js'].lineData[102] = 0;
  _$jscoverage['/toolbar.js'].lineData[103] = 0;
  _$jscoverage['/toolbar.js'].lineData[104] = 0;
  _$jscoverage['/toolbar.js'].lineData[106] = 0;
  _$jscoverage['/toolbar.js'].lineData[108] = 0;
  _$jscoverage['/toolbar.js'].lineData[113] = 0;
  _$jscoverage['/toolbar.js'].lineData[114] = 0;
  _$jscoverage['/toolbar.js'].lineData[116] = 0;
  _$jscoverage['/toolbar.js'].lineData[117] = 0;
  _$jscoverage['/toolbar.js'].lineData[125] = 0;
  _$jscoverage['/toolbar.js'].lineData[126] = 0;
  _$jscoverage['/toolbar.js'].lineData[127] = 0;
  _$jscoverage['/toolbar.js'].lineData[131] = 0;
  _$jscoverage['/toolbar.js'].lineData[134] = 0;
  _$jscoverage['/toolbar.js'].lineData[135] = 0;
  _$jscoverage['/toolbar.js'].lineData[137] = 0;
  _$jscoverage['/toolbar.js'].lineData[138] = 0;
  _$jscoverage['/toolbar.js'].lineData[143] = 0;
  _$jscoverage['/toolbar.js'].lineData[148] = 0;
  _$jscoverage['/toolbar.js'].lineData[149] = 0;
  _$jscoverage['/toolbar.js'].lineData[150] = 0;
  _$jscoverage['/toolbar.js'].lineData[155] = 0;
  _$jscoverage['/toolbar.js'].lineData[156] = 0;
  _$jscoverage['/toolbar.js'].lineData[161] = 0;
  _$jscoverage['/toolbar.js'].lineData[163] = 0;
  _$jscoverage['/toolbar.js'].lineData[164] = 0;
  _$jscoverage['/toolbar.js'].lineData[167] = 0;
  _$jscoverage['/toolbar.js'].lineData[168] = 0;
  _$jscoverage['/toolbar.js'].lineData[171] = 0;
  _$jscoverage['/toolbar.js'].lineData[172] = 0;
  _$jscoverage['/toolbar.js'].lineData[175] = 0;
  _$jscoverage['/toolbar.js'].lineData[176] = 0;
  _$jscoverage['/toolbar.js'].lineData[179] = 0;
  _$jscoverage['/toolbar.js'].lineData[180] = 0;
  _$jscoverage['/toolbar.js'].lineData[183] = 0;
  _$jscoverage['/toolbar.js'].lineData[184] = 0;
  _$jscoverage['/toolbar.js'].lineData[187] = 0;
  _$jscoverage['/toolbar.js'].lineData[188] = 0;
  _$jscoverage['/toolbar.js'].lineData[191] = 0;
  _$jscoverage['/toolbar.js'].lineData[193] = 0;
  _$jscoverage['/toolbar.js'].lineData[197] = 0;
  _$jscoverage['/toolbar.js'].lineData[201] = 0;
  _$jscoverage['/toolbar.js'].lineData[202] = 0;
  _$jscoverage['/toolbar.js'].lineData[205] = 0;
  _$jscoverage['/toolbar.js'].lineData[206] = 0;
  _$jscoverage['/toolbar.js'].lineData[209] = 0;
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
  _$jscoverage['/toolbar.js'].branchData['13'] = [];
  _$jscoverage['/toolbar.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['14'] = [];
  _$jscoverage['/toolbar.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['19'] = [];
  _$jscoverage['/toolbar.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['27'] = [];
  _$jscoverage['/toolbar.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['27'][2] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['29'] = [];
  _$jscoverage['/toolbar.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['38'] = [];
  _$jscoverage['/toolbar.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['50'] = [];
  _$jscoverage['/toolbar.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['50'][2] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['50'][3] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['52'] = [];
  _$jscoverage['/toolbar.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['54'] = [];
  _$jscoverage['/toolbar.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['54'][2] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['60'] = [];
  _$jscoverage['/toolbar.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['69'] = [];
  _$jscoverage['/toolbar.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['71'] = [];
  _$jscoverage['/toolbar.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['71'][2] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['86'] = [];
  _$jscoverage['/toolbar.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['90'] = [];
  _$jscoverage['/toolbar.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['97'] = [];
  _$jscoverage['/toolbar.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['98'] = [];
  _$jscoverage['/toolbar.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['103'] = [];
  _$jscoverage['/toolbar.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['113'] = [];
  _$jscoverage['/toolbar.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['116'] = [];
  _$jscoverage['/toolbar.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['137'] = [];
  _$jscoverage['/toolbar.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['146'] = [];
  _$jscoverage['/toolbar.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['148'] = [];
  _$jscoverage['/toolbar.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['149'] = [];
  _$jscoverage['/toolbar.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['155'] = [];
  _$jscoverage['/toolbar.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['155'][2] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['155'][3] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['201'] = [];
  _$jscoverage['/toolbar.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['205'] = [];
  _$jscoverage['/toolbar.js'].branchData['205'][1] = new BranchData();
}
_$jscoverage['/toolbar.js'].branchData['205'][1].init(320, 19, 'nextHighlightedItem');
function visit33_205_1(result) {
  _$jscoverage['/toolbar.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['201'][1].init(198, 39, 'typeof nextHighlightedItem == \'boolean\'');
function visit32_201_1(result) {
  _$jscoverage['/toolbar.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['155'][3].init(485, 21, 'e.metaKey || e.altKey');
function visit31_155_3(result) {
  _$jscoverage['/toolbar.js'].branchData['155'][3].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['155'][2].init(472, 34, 'e.ctrlKey || e.metaKey || e.altKey');
function visit30_155_2(result) {
  _$jscoverage['/toolbar.js'].branchData['155'][2].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['155'][1].init(458, 48, 'e.shiftKey || e.ctrlKey || e.metaKey || e.altKey');
function visit29_155_1(result) {
  _$jscoverage['/toolbar.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['149'][1].init(22, 32, 'current.handleKeyDownInternal(e)');
function visit28_149_1(result) {
  _$jscoverage['/toolbar.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['148'][1].init(227, 7, 'current');
function visit27_148_1(result) {
  _$jscoverage['/toolbar.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['146'][1].init(152, 39, 'current && S.indexOf(current, children)');
function visit26_146_1(result) {
  _$jscoverage['/toolbar.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['137'][1].init(239, 45, 'highlightedItem = self.get("highlightedItem")');
function visit25_137_1(result) {
  _$jscoverage['/toolbar.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['116'][1].init(119, 1, 'v');
function visit24_116_1(result) {
  _$jscoverage['/toolbar.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['113'][1].init(18, 14, 'e && e.prevVal');
function visit23_113_1(result) {
  _$jscoverage['/toolbar.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['103'][1].init(205, 3, '!id');
function visit22_103_1(result) {
  _$jscoverage['/toolbar.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['98'][1].init(22, 36, 'el.ownerDocument.activeElement != el');
function visit21_98_1(result) {
  _$jscoverage['/toolbar.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['97'][1].init(507, 4, 'item');
function visit20_97_1(result) {
  _$jscoverage['/toolbar.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['90'][1].init(246, 39, 'prevVal && S.inArray(prevVal, children)');
function visit19_90_1(result) {
  _$jscoverage['/toolbar.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['86'][1].init(72, 14, 'e && e.prevVal');
function visit18_86_1(result) {
  _$jscoverage['/toolbar.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['71'][2].init(81, 45, 'child.isMenuButton && !child.get(\'collapsed\')');
function visit17_71_2(result) {
  _$jscoverage['/toolbar.js'].branchData['71'][2].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['71'][1].init(52, 75, 'child.get(\'highlighted\') || (child.isMenuButton && !child.get(\'collapsed\'))');
function visit16_71_1(result) {
  _$jscoverage['/toolbar.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['69'][1].init(81, 19, 'i < children.length');
function visit15_69_1(result) {
  _$jscoverage['/toolbar.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['60'][1].init(22, 34, '!e.byPassSetToolbarHighlightedItem');
function visit14_60_1(result) {
  _$jscoverage['/toolbar.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['54'][2].init(87, 55, 'self.get(\'expandedItem\') && S.inArray(target, children)');
function visit13_54_2(result) {
  _$jscoverage['/toolbar.js'].branchData['54'][2].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['54'][1].init(72, 70, 'expandedItem = self.get(\'expandedItem\') && S.inArray(target, children)');
function visit12_54_1(result) {
  _$jscoverage['/toolbar.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['52'][1].init(20, 8, 'e.newVal');
function visit11_52_1(result) {
  _$jscoverage['/toolbar.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['50'][3].init(142, 36, 'target.isMenuItem || target.isButton');
function visit10_50_3(result) {
  _$jscoverage['/toolbar.js'].branchData['50'][3].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['50'][2].init(122, 15, 'self !== target');
function visit9_50_2(result) {
  _$jscoverage['/toolbar.js'].branchData['50'][2].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['50'][1].init(122, 57, 'self !== target && (target.isMenuItem || target.isButton)');
function visit8_50_1(result) {
  _$jscoverage['/toolbar.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['38'][1].init(40, 8, 'e.newVal');
function visit7_38_1(result) {
  _$jscoverage['/toolbar.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['29'][1].init(627, 23, 'count != childrenLength');
function visit6_29_1(result) {
  _$jscoverage['/toolbar.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['27'][2].init(553, 22, 'count < childrenLength');
function visit5_27_2(result) {
  _$jscoverage['/toolbar.js'].branchData['27'][2].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['27'][1].init(120, 57, 'count < childrenLength && children[index].get("disabled")');
function visit4_27_1(result) {
  _$jscoverage['/toolbar.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['19'][1].init(163, 32, '!children[index].get("disabled")');
function visit3_19_1(result) {
  _$jscoverage['/toolbar.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['14'][1].init(18, 14, 'direction == 1');
function visit2_14_1(result) {
  _$jscoverage['/toolbar.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['13'][1].init(133, 18, 'index == undefined');
function visit1_13_1(result) {
  _$jscoverage['/toolbar.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].lineData[5]++;
KISSY.add("toolbar", function(S, Container, DelegateChildrenExtension, ToolbarRender, Node, undefined) {
  _$jscoverage['/toolbar.js'].functionData[0]++;
  _$jscoverage['/toolbar.js'].lineData[6]++;
  var KeyCode = Node.KeyCode;
  _$jscoverage['/toolbar.js'].lineData[8]++;
  function getNextEnabledItem(index, direction, self) {
    _$jscoverage['/toolbar.js'].functionData[1]++;
    _$jscoverage['/toolbar.js'].lineData[9]++;
    var children = self.get("children"), count = 0, childrenLength = children.length;
    _$jscoverage['/toolbar.js'].lineData[13]++;
    if (visit1_13_1(index == undefined)) {
      _$jscoverage['/toolbar.js'].lineData[14]++;
      if (visit2_14_1(direction == 1)) {
        _$jscoverage['/toolbar.js'].lineData[15]++;
        index = 0;
      } else {
        _$jscoverage['/toolbar.js'].lineData[17]++;
        index = childrenLength - 1;
      }
      _$jscoverage['/toolbar.js'].lineData[19]++;
      if (visit3_19_1(!children[index].get("disabled"))) {
        _$jscoverage['/toolbar.js'].lineData[20]++;
        return children[index];
      }
    }
    _$jscoverage['/toolbar.js'].lineData[24]++;
    do {
      _$jscoverage['/toolbar.js'].lineData[25]++;
      count++;
      _$jscoverage['/toolbar.js'].lineData[26]++;
      index = (index + childrenLength + direction) % childrenLength;
    } while (visit4_27_1(visit5_27_2(count < childrenLength) && children[index].get("disabled")));
    _$jscoverage['/toolbar.js'].lineData[29]++;
    if (visit6_29_1(count != childrenLength)) {
      _$jscoverage['/toolbar.js'].lineData[30]++;
      return children[index];
    }
    _$jscoverage['/toolbar.js'].lineData[33]++;
    return null;
  }
  _$jscoverage['/toolbar.js'].lineData[36]++;
  function afterCollapsedChange(e) {
    _$jscoverage['/toolbar.js'].functionData[2]++;
    _$jscoverage['/toolbar.js'].lineData[37]++;
    var self = this;
    _$jscoverage['/toolbar.js'].lineData[38]++;
    if (visit7_38_1(e.newVal)) {
      _$jscoverage['/toolbar.js'].lineData[39]++;
      self.set("expandedItem", null);
    } else {
      _$jscoverage['/toolbar.js'].lineData[41]++;
      self.set("expandedItem", e.target);
    }
  }
  _$jscoverage['/toolbar.js'].lineData[45]++;
  function afterHighlightedChange(e) {
    _$jscoverage['/toolbar.js'].functionData[3]++;
    _$jscoverage['/toolbar.js'].lineData[46]++;
    var self = this, expandedItem, children, target = e.target;
    _$jscoverage['/toolbar.js'].lineData[50]++;
    if (visit8_50_1(visit9_50_2(self !== target) && (visit10_50_3(target.isMenuItem || target.isButton)))) {
      _$jscoverage['/toolbar.js'].lineData[52]++;
      if (visit11_52_1(e.newVal)) {
        _$jscoverage['/toolbar.js'].lineData[53]++;
        children = self.get('children');
        _$jscoverage['/toolbar.js'].lineData[54]++;
        if (visit12_54_1(expandedItem = visit13_54_2(self.get('expandedItem') && S.inArray(target, children)))) {
          _$jscoverage['/toolbar.js'].lineData[56]++;
          self.set('expandedItem', target.isMenuButton ? target : null);
        }
        _$jscoverage['/toolbar.js'].lineData[58]++;
        self.set("highlightedItem", target);
      } else {
        _$jscoverage['/toolbar.js'].lineData[60]++;
        if (visit14_60_1(!e.byPassSetToolbarHighlightedItem)) {
          _$jscoverage['/toolbar.js'].lineData[61]++;
          self.set('highlightedItem', null);
        }
      }
    }
  }
  _$jscoverage['/toolbar.js'].lineData[67]++;
  function getChildByHighlightedItem(toolbar) {
    _$jscoverage['/toolbar.js'].functionData[4]++;
    _$jscoverage['/toolbar.js'].lineData[68]++;
    var children = toolbar.get('children'), i, child;
    _$jscoverage['/toolbar.js'].lineData[69]++;
    for (i = 0; visit15_69_1(i < children.length); i++) {
      _$jscoverage['/toolbar.js'].lineData[70]++;
      child = children[i];
      _$jscoverage['/toolbar.js'].lineData[71]++;
      if (visit16_71_1(child.get('highlighted') || (visit17_71_2(child.isMenuButton && !child.get('collapsed'))))) {
        _$jscoverage['/toolbar.js'].lineData[72]++;
        return child;
      }
    }
    _$jscoverage['/toolbar.js'].lineData[75]++;
    return null;
  }
  _$jscoverage['/toolbar.js'].lineData[82]++;
  return Container.extend([DelegateChildrenExtension], {
  _onSetHighlightedItem: function(item, e) {
  _$jscoverage['/toolbar.js'].functionData[5]++;
  _$jscoverage['/toolbar.js'].lineData[84]++;
  var id, itemEl, self = this, prevVal = visit18_86_1(e && e.prevVal), children = self.get('children'), el = self.el;
  _$jscoverage['/toolbar.js'].lineData[90]++;
  if (visit19_90_1(prevVal && S.inArray(prevVal, children))) {
    _$jscoverage['/toolbar.js'].lineData[91]++;
    prevVal.set('highlighted', false, {
  data: {
  byPassSetToolbarHighlightedItem: 1}});
  }
  _$jscoverage['/toolbar.js'].lineData[97]++;
  if (visit20_97_1(item)) {
    _$jscoverage['/toolbar.js'].lineData[98]++;
    if (visit21_98_1(el.ownerDocument.activeElement != el)) {
      _$jscoverage['/toolbar.js'].lineData[99]++;
      self.focus();
    }
    _$jscoverage['/toolbar.js'].lineData[101]++;
    itemEl = item.el;
    _$jscoverage['/toolbar.js'].lineData[102]++;
    id = itemEl.id;
    _$jscoverage['/toolbar.js'].lineData[103]++;
    if (visit22_103_1(!id)) {
      _$jscoverage['/toolbar.js'].lineData[104]++;
      itemEl.id = id = S.guid("ks-toolbar-item");
    }
    _$jscoverage['/toolbar.js'].lineData[106]++;
    el.setAttribute("aria-activedescendant", id);
  } else {
    _$jscoverage['/toolbar.js'].lineData[108]++;
    el.setAttribute("aria-activedescendant", "");
  }
}, 
  '_onSetExpandedItem': function(v, e) {
  _$jscoverage['/toolbar.js'].functionData[6]++;
  _$jscoverage['/toolbar.js'].lineData[113]++;
  if (visit23_113_1(e && e.prevVal)) {
    _$jscoverage['/toolbar.js'].lineData[114]++;
    e.prevVal.set('collapsed', true);
  }
  _$jscoverage['/toolbar.js'].lineData[116]++;
  if (visit24_116_1(v)) {
    _$jscoverage['/toolbar.js'].lineData[117]++;
    v.set('collapsed', false);
  }
}, 
  bindUI: function() {
  _$jscoverage['/toolbar.js'].functionData[7]++;
  _$jscoverage['/toolbar.js'].lineData[125]++;
  var self = this;
  _$jscoverage['/toolbar.js'].lineData[126]++;
  self.on("afterCollapsedChange", afterCollapsedChange, self);
  _$jscoverage['/toolbar.js'].lineData[127]++;
  self.on("afterHighlightedChange", afterHighlightedChange, self);
}, 
  handleBlurInternal: function(e) {
  _$jscoverage['/toolbar.js'].functionData[8]++;
  _$jscoverage['/toolbar.js'].lineData[131]++;
  var self = this, highlightedItem, expandedItem;
  _$jscoverage['/toolbar.js'].lineData[134]++;
  self.callSuper(e);
  _$jscoverage['/toolbar.js'].lineData[135]++;
  self.set("expandedItem", null);
  _$jscoverage['/toolbar.js'].lineData[137]++;
  if (visit25_137_1(highlightedItem = self.get("highlightedItem"))) {
    _$jscoverage['/toolbar.js'].lineData[138]++;
    highlightedItem.set('highlighted', false);
  }
}, 
  getNextItemByKeyDown: function(e, current) {
  _$jscoverage['/toolbar.js'].functionData[9]++;
  _$jscoverage['/toolbar.js'].lineData[143]++;
  var self = this, orientation = self.get("orientation"), children = self.get("children"), childIndex = visit26_146_1(current && S.indexOf(current, children));
  _$jscoverage['/toolbar.js'].lineData[148]++;
  if (visit27_148_1(current)) {
    _$jscoverage['/toolbar.js'].lineData[149]++;
    if (visit28_149_1(current.handleKeyDownInternal(e))) {
      _$jscoverage['/toolbar.js'].lineData[150]++;
      return true;
    }
  }
  _$jscoverage['/toolbar.js'].lineData[155]++;
  if (visit29_155_1(e.shiftKey || visit30_155_2(e.ctrlKey || visit31_155_3(e.metaKey || e.altKey)))) {
    _$jscoverage['/toolbar.js'].lineData[156]++;
    return false;
  }
  _$jscoverage['/toolbar.js'].lineData[161]++;
  switch (e.keyCode) {
    case KeyCode.ESC:
      _$jscoverage['/toolbar.js'].lineData[163]++;
      self.view.getKeyEventTarget().fire("blur");
      _$jscoverage['/toolbar.js'].lineData[164]++;
      return true;
    case KeyCode.HOME:
      _$jscoverage['/toolbar.js'].lineData[167]++;
      current = getNextEnabledItem(undefined, 1, self);
      _$jscoverage['/toolbar.js'].lineData[168]++;
      break;
    case KeyCode.END:
      _$jscoverage['/toolbar.js'].lineData[171]++;
      current = getNextEnabledItem(undefined, -1, self);
      _$jscoverage['/toolbar.js'].lineData[172]++;
      break;
    case KeyCode.UP:
      _$jscoverage['/toolbar.js'].lineData[175]++;
      current = getNextEnabledItem(childIndex, -1, self);
      _$jscoverage['/toolbar.js'].lineData[176]++;
      break;
    case KeyCode.LEFT:
      _$jscoverage['/toolbar.js'].lineData[179]++;
      current = getNextEnabledItem(childIndex, -1, self);
      _$jscoverage['/toolbar.js'].lineData[180]++;
      break;
    case KeyCode.DOWN:
      _$jscoverage['/toolbar.js'].lineData[183]++;
      current = getNextEnabledItem(childIndex, 1, self);
      _$jscoverage['/toolbar.js'].lineData[184]++;
      break;
    case KeyCode.RIGHT:
      _$jscoverage['/toolbar.js'].lineData[187]++;
      current = getNextEnabledItem(childIndex, 1, self);
      _$jscoverage['/toolbar.js'].lineData[188]++;
      break;
    default:
      _$jscoverage['/toolbar.js'].lineData[191]++;
      return false;
  }
  _$jscoverage['/toolbar.js'].lineData[193]++;
  return current;
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/toolbar.js'].functionData[10]++;
  _$jscoverage['/toolbar.js'].lineData[197]++;
  var self = this, currentChild = getChildByHighlightedItem(self), nextHighlightedItem = self.getNextItemByKeyDown(e, currentChild);
  _$jscoverage['/toolbar.js'].lineData[201]++;
  if (visit32_201_1(typeof nextHighlightedItem == 'boolean')) {
    _$jscoverage['/toolbar.js'].lineData[202]++;
    return nextHighlightedItem;
  }
  _$jscoverage['/toolbar.js'].lineData[205]++;
  if (visit33_205_1(nextHighlightedItem)) {
    _$jscoverage['/toolbar.js'].lineData[206]++;
    nextHighlightedItem.set("highlighted", true);
  }
  _$jscoverage['/toolbar.js'].lineData[209]++;
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
}, {
  requires: ['component/container', 'component/extension/delegate-children', 'toolbar/render', 'node']});
