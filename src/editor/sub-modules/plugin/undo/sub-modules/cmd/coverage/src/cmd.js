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
if (! _$jscoverage['/cmd.js']) {
  _$jscoverage['/cmd.js'] = {};
  _$jscoverage['/cmd.js'].lineData = [];
  _$jscoverage['/cmd.js'].lineData[5] = 0;
  _$jscoverage['/cmd.js'].lineData[6] = 0;
  _$jscoverage['/cmd.js'].lineData[13] = 0;
  _$jscoverage['/cmd.js'].lineData[14] = 0;
  _$jscoverage['/cmd.js'].lineData[17] = 0;
  _$jscoverage['/cmd.js'].lineData[18] = 0;
  _$jscoverage['/cmd.js'].lineData[21] = 0;
  _$jscoverage['/cmd.js'].lineData[23] = 0;
  _$jscoverage['/cmd.js'].lineData[26] = 0;
  _$jscoverage['/cmd.js'].lineData[32] = 0;
  _$jscoverage['/cmd.js'].lineData[37] = 0;
  _$jscoverage['/cmd.js'].lineData[45] = 0;
  _$jscoverage['/cmd.js'].lineData[50] = 0;
  _$jscoverage['/cmd.js'].lineData[51] = 0;
  _$jscoverage['/cmd.js'].lineData[53] = 0;
  _$jscoverage['/cmd.js'].lineData[54] = 0;
  _$jscoverage['/cmd.js'].lineData[56] = 0;
  _$jscoverage['/cmd.js'].lineData[57] = 0;
  _$jscoverage['/cmd.js'].lineData[60] = 0;
  _$jscoverage['/cmd.js'].lineData[67] = 0;
  _$jscoverage['/cmd.js'].lineData[72] = 0;
  _$jscoverage['/cmd.js'].lineData[75] = 0;
  _$jscoverage['/cmd.js'].lineData[76] = 0;
  _$jscoverage['/cmd.js'].lineData[77] = 0;
  _$jscoverage['/cmd.js'].lineData[78] = 0;
  _$jscoverage['/cmd.js'].lineData[80] = 0;
  _$jscoverage['/cmd.js'].lineData[83] = 0;
  _$jscoverage['/cmd.js'].lineData[84] = 0;
  _$jscoverage['/cmd.js'].lineData[85] = 0;
  _$jscoverage['/cmd.js'].lineData[87] = 0;
  _$jscoverage['/cmd.js'].lineData[88] = 0;
  _$jscoverage['/cmd.js'].lineData[91] = 0;
  _$jscoverage['/cmd.js'].lineData[92] = 0;
  _$jscoverage['/cmd.js'].lineData[93] = 0;
  _$jscoverage['/cmd.js'].lineData[95] = 0;
  _$jscoverage['/cmd.js'].lineData[96] = 0;
  _$jscoverage['/cmd.js'].lineData[98] = 0;
  _$jscoverage['/cmd.js'].lineData[99] = 0;
  _$jscoverage['/cmd.js'].lineData[106] = 0;
  _$jscoverage['/cmd.js'].lineData[108] = 0;
  _$jscoverage['/cmd.js'].lineData[109] = 0;
  _$jscoverage['/cmd.js'].lineData[111] = 0;
  _$jscoverage['/cmd.js'].lineData[112] = 0;
  _$jscoverage['/cmd.js'].lineData[113] = 0;
  _$jscoverage['/cmd.js'].lineData[115] = 0;
  _$jscoverage['/cmd.js'].lineData[116] = 0;
  _$jscoverage['/cmd.js'].lineData[117] = 0;
  _$jscoverage['/cmd.js'].lineData[129] = 0;
  _$jscoverage['/cmd.js'].lineData[132] = 0;
  _$jscoverage['/cmd.js'].lineData[133] = 0;
  _$jscoverage['/cmd.js'].lineData[136] = 0;
  _$jscoverage['/cmd.js'].lineData[137] = 0;
  _$jscoverage['/cmd.js'].lineData[140] = 0;
  _$jscoverage['/cmd.js'].lineData[141] = 0;
  _$jscoverage['/cmd.js'].lineData[142] = 0;
  _$jscoverage['/cmd.js'].lineData[145] = 0;
  _$jscoverage['/cmd.js'].lineData[151] = 0;
  _$jscoverage['/cmd.js'].lineData[153] = 0;
  _$jscoverage['/cmd.js'].lineData[156] = 0;
  _$jscoverage['/cmd.js'].lineData[157] = 0;
  _$jscoverage['/cmd.js'].lineData[158] = 0;
  _$jscoverage['/cmd.js'].lineData[159] = 0;
  _$jscoverage['/cmd.js'].lineData[160] = 0;
  _$jscoverage['/cmd.js'].lineData[162] = 0;
  _$jscoverage['/cmd.js'].lineData[163] = 0;
  _$jscoverage['/cmd.js'].lineData[164] = 0;
  _$jscoverage['/cmd.js'].lineData[174] = 0;
  _$jscoverage['/cmd.js'].lineData[175] = 0;
  _$jscoverage['/cmd.js'].lineData[178] = 0;
  _$jscoverage['/cmd.js'].lineData[184] = 0;
  _$jscoverage['/cmd.js'].lineData[185] = 0;
  _$jscoverage['/cmd.js'].lineData[186] = 0;
  _$jscoverage['/cmd.js'].lineData[187] = 0;
  _$jscoverage['/cmd.js'].lineData[188] = 0;
  _$jscoverage['/cmd.js'].lineData[192] = 0;
  _$jscoverage['/cmd.js'].lineData[193] = 0;
  _$jscoverage['/cmd.js'].lineData[194] = 0;
  _$jscoverage['/cmd.js'].lineData[196] = 0;
  _$jscoverage['/cmd.js'].lineData[198] = 0;
  _$jscoverage['/cmd.js'].lineData[199] = 0;
  _$jscoverage['/cmd.js'].lineData[201] = 0;
  _$jscoverage['/cmd.js'].lineData[202] = 0;
  _$jscoverage['/cmd.js'].lineData[206] = 0;
  _$jscoverage['/cmd.js'].lineData[209] = 0;
  _$jscoverage['/cmd.js'].lineData[213] = 0;
  _$jscoverage['/cmd.js'].lineData[215] = 0;
  _$jscoverage['/cmd.js'].lineData[216] = 0;
  _$jscoverage['/cmd.js'].lineData[217] = 0;
  _$jscoverage['/cmd.js'].lineData[219] = 0;
  _$jscoverage['/cmd.js'].lineData[220] = 0;
  _$jscoverage['/cmd.js'].lineData[223] = 0;
  _$jscoverage['/cmd.js'].lineData[225] = 0;
  _$jscoverage['/cmd.js'].lineData[226] = 0;
  _$jscoverage['/cmd.js'].lineData[229] = 0;
  _$jscoverage['/cmd.js'].lineData[231] = 0;
  _$jscoverage['/cmd.js'].lineData[232] = 0;
}
if (! _$jscoverage['/cmd.js'].functionData) {
  _$jscoverage['/cmd.js'].functionData = [];
  _$jscoverage['/cmd.js'].functionData[0] = 0;
  _$jscoverage['/cmd.js'].functionData[1] = 0;
  _$jscoverage['/cmd.js'].functionData[2] = 0;
  _$jscoverage['/cmd.js'].functionData[3] = 0;
  _$jscoverage['/cmd.js'].functionData[4] = 0;
  _$jscoverage['/cmd.js'].functionData[5] = 0;
  _$jscoverage['/cmd.js'].functionData[6] = 0;
  _$jscoverage['/cmd.js'].functionData[7] = 0;
  _$jscoverage['/cmd.js'].functionData[8] = 0;
  _$jscoverage['/cmd.js'].functionData[9] = 0;
  _$jscoverage['/cmd.js'].functionData[10] = 0;
  _$jscoverage['/cmd.js'].functionData[11] = 0;
  _$jscoverage['/cmd.js'].functionData[12] = 0;
  _$jscoverage['/cmd.js'].functionData[13] = 0;
  _$jscoverage['/cmd.js'].functionData[14] = 0;
  _$jscoverage['/cmd.js'].functionData[15] = 0;
}
if (! _$jscoverage['/cmd.js'].branchData) {
  _$jscoverage['/cmd.js'].branchData = {};
  _$jscoverage['/cmd.js'].branchData['17'] = [];
  _$jscoverage['/cmd.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['23'] = [];
  _$jscoverage['/cmd.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['37'] = [];
  _$jscoverage['/cmd.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['78'] = [];
  _$jscoverage['/cmd.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['83'] = [];
  _$jscoverage['/cmd.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['83'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['83'][3] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['84'] = [];
  _$jscoverage['/cmd.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['91'] = [];
  _$jscoverage['/cmd.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['91'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['91'][3] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['92'] = [];
  _$jscoverage['/cmd.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['98'] = [];
  _$jscoverage['/cmd.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['111'] = [];
  _$jscoverage['/cmd.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['112'] = [];
  _$jscoverage['/cmd.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['132'] = [];
  _$jscoverage['/cmd.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['136'] = [];
  _$jscoverage['/cmd.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['140'] = [];
  _$jscoverage['/cmd.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['156'] = [];
  _$jscoverage['/cmd.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['158'] = [];
  _$jscoverage['/cmd.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['174'] = [];
  _$jscoverage['/cmd.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['184'] = [];
  _$jscoverage['/cmd.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['186'] = [];
  _$jscoverage['/cmd.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['188'] = [];
  _$jscoverage['/cmd.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['198'] = [];
  _$jscoverage['/cmd.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['202'] = [];
  _$jscoverage['/cmd.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['215'] = [];
  _$jscoverage['/cmd.js'].branchData['215'][1] = new BranchData();
}
_$jscoverage['/cmd.js'].branchData['215'][1].init(18, 26, '!editor.hasCommand("save")');
function visit27_215_1(result) {
  _$jscoverage['/cmd.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['202'][1].init(904, 5, 'd < 0');
function visit26_202_1(result) {
  _$jscoverage['/cmd.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['198'][1].init(760, 9, 'selection');
function visit25_198_1(result) {
  _$jscoverage['/cmd.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['188'][1].init(215, 8, 'UA[\'ie\']');
function visit24_188_1(result) {
  _$jscoverage['/cmd.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['186'][1].init(84, 18, 'snapshot.bookmarks');
function visit23_186_1(result) {
  _$jscoverage['/cmd.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['184'][1].init(407, 8, 'snapshot');
function visit22_184_1(result) {
  _$jscoverage['/cmd.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['174'][1].init(53, 51, 'this.editor.get("mode") != Editor.Mode.WYSIWYG_MODE');
function visit21_174_1(result) {
  _$jscoverage['/cmd.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['158'][1].init(59, 11, 'l === LIMIT');
function visit20_158_1(result) {
  _$jscoverage['/cmd.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['156'][1].init(700, 30, '!last || !last.equals(current)');
function visit19_156_1(result) {
  _$jscoverage['/cmd.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['140'][1].init(289, 6, 'buffer');
function visit18_140_1(result) {
  _$jscoverage['/cmd.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['136'][1].init(203, 23, '!editor.get("document")');
function visit17_136_1(result) {
  _$jscoverage['/cmd.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['132'][1].init(94, 46, 'editor.get("mode") != Editor.Mode.WYSIWYG_MODE');
function visit16_132_1(result) {
  _$jscoverage['/cmd.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['112'][1].init(26, 19, 'editor.isDocReady()');
function visit15_112_1(result) {
  _$jscoverage['/cmd.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['111'][1].init(59, 46, 'editor.get(\'mode\') == Editor.Mode.WYSIWYG_MODE');
function visit14_111_1(result) {
  _$jscoverage['/cmd.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['98'][1].init(936, 48, 'editor.fire("beforeSave", {\n  buffer: 1}) !== false');
function visit13_98_1(result) {
  _$jscoverage['/cmd.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['92'][1].init(30, 35, 'false !== editor.fire("beforeUndo")');
function visit12_92_1(result) {
  _$jscoverage['/cmd.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['91'][3].init(649, 24, 'ev.ctrlKey || ev.metaKey');
function visit11_91_3(result) {
  _$jscoverage['/cmd.js'].branchData['91'][3].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['91'][2].init(624, 20, 'keyCode === yKeyCode');
function visit10_91_2(result) {
  _$jscoverage['/cmd.js'].branchData['91'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['91'][1].init(624, 50, 'keyCode === yKeyCode && (ev.ctrlKey || ev.metaKey)');
function visit9_91_1(result) {
  _$jscoverage['/cmd.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['84'][1].init(30, 35, 'false !== editor.fire("beforeRedo")');
function visit8_84_1(result) {
  _$jscoverage['/cmd.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['83'][3].init(302, 24, 'ev.ctrlKey || ev.metaKey');
function visit7_83_3(result) {
  _$jscoverage['/cmd.js'].branchData['83'][3].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['83'][2].init(277, 20, 'keyCode === zKeyCode');
function visit6_83_2(result) {
  _$jscoverage['/cmd.js'].branchData['83'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['83'][1].init(277, 50, 'keyCode === zKeyCode && (ev.ctrlKey || ev.metaKey)');
function visit5_83_1(result) {
  _$jscoverage['/cmd.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['78'][1].init(73, 85, 'keyCode in navigationKeyCodes || keyCode in modifierKeyCodes');
function visit4_78_1(result) {
  _$jscoverage['/cmd.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['37'][1].init(225, 29, 'thisContents == otherContents');
function visit3_37_1(result) {
  _$jscoverage['/cmd.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['23'][1].init(300, 45, 'selection && selection.createBookmarks2(true)');
function visit2_23_1(result) {
  _$jscoverage['/cmd.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['17'][1].init(130, 8, 'contents');
function visit1_17_1(result) {
  _$jscoverage['/cmd.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].lineData[5]++;
KISSY.add("editor/plugin/undo/cmd", function(S, Editor) {
  _$jscoverage['/cmd.js'].functionData[0]++;
  _$jscoverage['/cmd.js'].lineData[6]++;
  var UA = S.UA, LIMIT = 30;
  _$jscoverage['/cmd.js'].lineData[13]++;
  function Snapshot(editor) {
    _$jscoverage['/cmd.js'].functionData[1]++;
    _$jscoverage['/cmd.js'].lineData[14]++;
    var contents = editor.get("document")[0].body.innerHTML, self = this, selection;
    _$jscoverage['/cmd.js'].lineData[17]++;
    if (visit1_17_1(contents)) {
      _$jscoverage['/cmd.js'].lineData[18]++;
      selection = editor.getSelection();
    }
    _$jscoverage['/cmd.js'].lineData[21]++;
    self.contents = contents;
    _$jscoverage['/cmd.js'].lineData[23]++;
    self.bookmarks = visit2_23_1(selection && selection.createBookmarks2(true));
  }
  _$jscoverage['/cmd.js'].lineData[26]++;
  S.augment(Snapshot, {
  equals: function(otherImage) {
  _$jscoverage['/cmd.js'].functionData[2]++;
  _$jscoverage['/cmd.js'].lineData[32]++;
  var self = this, thisContents = self.contents, otherContents = otherImage.contents;
  _$jscoverage['/cmd.js'].lineData[37]++;
  return visit3_37_1(thisContents == otherContents);
}});
  _$jscoverage['/cmd.js'].lineData[45]++;
  function UndoManager(editor) {
    _$jscoverage['/cmd.js'].functionData[3]++;
    _$jscoverage['/cmd.js'].lineData[50]++;
    var self = this;
    _$jscoverage['/cmd.js'].lineData[51]++;
    self.history = [];
    _$jscoverage['/cmd.js'].lineData[53]++;
    self.index = -1;
    _$jscoverage['/cmd.js'].lineData[54]++;
    self.editor = editor;
    _$jscoverage['/cmd.js'].lineData[56]++;
    self.bufferRunner = S.buffer(self.save, 500, self);
    _$jscoverage['/cmd.js'].lineData[57]++;
    self._init();
  }
  _$jscoverage['/cmd.js'].lineData[60]++;
  var modifierKeyCodes = {
  16: 1, 
  17: 1, 
  18: 1}, navigationKeyCodes = {
  37: 1, 
  38: 1, 
  39: 1, 
  40: 1, 
  33: 1, 
  34: 1}, zKeyCode = 90, yKeyCode = 89;
  _$jscoverage['/cmd.js'].lineData[67]++;
  S.augment(UndoManager, {
  _keyMonitor: function() {
  _$jscoverage['/cmd.js'].functionData[4]++;
  _$jscoverage['/cmd.js'].lineData[72]++;
  var self = this, editor = self.editor;
  _$jscoverage['/cmd.js'].lineData[75]++;
  editor.docReady(function() {
  _$jscoverage['/cmd.js'].functionData[5]++;
  _$jscoverage['/cmd.js'].lineData[76]++;
  editor.get("document").on("keydown", function(ev) {
  _$jscoverage['/cmd.js'].functionData[6]++;
  _$jscoverage['/cmd.js'].lineData[77]++;
  var keyCode = ev.keyCode;
  _$jscoverage['/cmd.js'].lineData[78]++;
  if (visit4_78_1(keyCode in navigationKeyCodes || keyCode in modifierKeyCodes)) {
    _$jscoverage['/cmd.js'].lineData[80]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[83]++;
  if (visit5_83_1(visit6_83_2(keyCode === zKeyCode) && (visit7_83_3(ev.ctrlKey || ev.metaKey)))) {
    _$jscoverage['/cmd.js'].lineData[84]++;
    if (visit8_84_1(false !== editor.fire("beforeRedo"))) {
      _$jscoverage['/cmd.js'].lineData[85]++;
      self.restore(-1);
    }
    _$jscoverage['/cmd.js'].lineData[87]++;
    ev.halt();
    _$jscoverage['/cmd.js'].lineData[88]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[91]++;
  if (visit9_91_1(visit10_91_2(keyCode === yKeyCode) && (visit11_91_3(ev.ctrlKey || ev.metaKey)))) {
    _$jscoverage['/cmd.js'].lineData[92]++;
    if (visit12_92_1(false !== editor.fire("beforeUndo"))) {
      _$jscoverage['/cmd.js'].lineData[93]++;
      self.restore(1);
    }
    _$jscoverage['/cmd.js'].lineData[95]++;
    ev.halt();
    _$jscoverage['/cmd.js'].lineData[96]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[98]++;
  if (visit13_98_1(editor.fire("beforeSave", {
  buffer: 1}) !== false)) {
    _$jscoverage['/cmd.js'].lineData[99]++;
    self.save(1);
  }
});
});
}, 
  _init: function() {
  _$jscoverage['/cmd.js'].functionData[7]++;
  _$jscoverage['/cmd.js'].lineData[106]++;
  var self = this, editor = self.editor;
  _$jscoverage['/cmd.js'].lineData[108]++;
  self._keyMonitor();
  _$jscoverage['/cmd.js'].lineData[109]++;
  setTimeout(function() {
  _$jscoverage['/cmd.js'].functionData[8]++;
  _$jscoverage['/cmd.js'].lineData[111]++;
  if (visit14_111_1(editor.get('mode') == Editor.Mode.WYSIWYG_MODE)) {
    _$jscoverage['/cmd.js'].lineData[112]++;
    if (visit15_112_1(editor.isDocReady())) {
      _$jscoverage['/cmd.js'].lineData[113]++;
      self.save();
    } else {
      _$jscoverage['/cmd.js'].lineData[115]++;
      editor.on('docReady', function() {
  _$jscoverage['/cmd.js'].functionData[9]++;
  _$jscoverage['/cmd.js'].lineData[116]++;
  self.save();
  _$jscoverage['/cmd.js'].lineData[117]++;
  editor.detach('docReady', arguments.callee);
});
    }
  }
}, 0);
}, 
  save: function(buffer) {
  _$jscoverage['/cmd.js'].functionData[10]++;
  _$jscoverage['/cmd.js'].lineData[129]++;
  var editor = this.editor;
  _$jscoverage['/cmd.js'].lineData[132]++;
  if (visit16_132_1(editor.get("mode") != Editor.Mode.WYSIWYG_MODE)) {
    _$jscoverage['/cmd.js'].lineData[133]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[136]++;
  if (visit17_136_1(!editor.get("document"))) {
    _$jscoverage['/cmd.js'].lineData[137]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[140]++;
  if (visit18_140_1(buffer)) {
    _$jscoverage['/cmd.js'].lineData[141]++;
    this.bufferRunner();
    _$jscoverage['/cmd.js'].lineData[142]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[145]++;
  var self = this, history = self.history, l = history.length, index = self.index;
  _$jscoverage['/cmd.js'].lineData[151]++;
  l = Math.min(l, index + 1);
  _$jscoverage['/cmd.js'].lineData[153]++;
  var last = history[l - 1], current = new Snapshot(editor);
  _$jscoverage['/cmd.js'].lineData[156]++;
  if (visit19_156_1(!last || !last.equals(current))) {
    _$jscoverage['/cmd.js'].lineData[157]++;
    history.length = l;
    _$jscoverage['/cmd.js'].lineData[158]++;
    if (visit20_158_1(l === LIMIT)) {
      _$jscoverage['/cmd.js'].lineData[159]++;
      history.shift();
      _$jscoverage['/cmd.js'].lineData[160]++;
      l--;
    }
    _$jscoverage['/cmd.js'].lineData[162]++;
    history.push(current);
    _$jscoverage['/cmd.js'].lineData[163]++;
    self.index = index = l;
    _$jscoverage['/cmd.js'].lineData[164]++;
    editor.fire("afterSave", {
  history: history, 
  index: index});
  }
}, 
  restore: function(d) {
  _$jscoverage['/cmd.js'].functionData[11]++;
  _$jscoverage['/cmd.js'].lineData[174]++;
  if (visit21_174_1(this.editor.get("mode") != Editor.Mode.WYSIWYG_MODE)) {
    _$jscoverage['/cmd.js'].lineData[175]++;
    return undefined;
  }
  _$jscoverage['/cmd.js'].lineData[178]++;
  var self = this, history = self.history, editor = self.editor, editorDomBody = editor.get("document")[0].body, snapshot = history[self.index + d];
  _$jscoverage['/cmd.js'].lineData[184]++;
  if (visit22_184_1(snapshot)) {
    _$jscoverage['/cmd.js'].lineData[185]++;
    editorDomBody.innerHTML = snapshot.contents;
    _$jscoverage['/cmd.js'].lineData[186]++;
    if (visit23_186_1(snapshot.bookmarks)) {
      _$jscoverage['/cmd.js'].lineData[187]++;
      editor.getSelection().selectBookmarks(snapshot.bookmarks);
    } else {
      _$jscoverage['/cmd.js'].lineData[188]++;
      if (visit24_188_1(UA['ie'])) {
        _$jscoverage['/cmd.js'].lineData[192]++;
        var $range = editorDomBody.createTextRange();
        _$jscoverage['/cmd.js'].lineData[193]++;
        $range.collapse(true);
        _$jscoverage['/cmd.js'].lineData[194]++;
        $range.select();
      }
    }
    _$jscoverage['/cmd.js'].lineData[196]++;
    var selection = editor.getSelection();
    _$jscoverage['/cmd.js'].lineData[198]++;
    if (visit25_198_1(selection)) {
      _$jscoverage['/cmd.js'].lineData[199]++;
      selection.scrollIntoView();
    }
    _$jscoverage['/cmd.js'].lineData[201]++;
    self.index += d;
    _$jscoverage['/cmd.js'].lineData[202]++;
    editor.fire(visit26_202_1(d < 0) ? "afterUndo" : "afterRedo", {
  history: history, 
  index: self.index});
    _$jscoverage['/cmd.js'].lineData[206]++;
    editor.notifySelectionChange();
  }
  _$jscoverage['/cmd.js'].lineData[209]++;
  return snapshot;
}});
  _$jscoverage['/cmd.js'].lineData[213]++;
  return {
  init: function(editor) {
  _$jscoverage['/cmd.js'].functionData[12]++;
  _$jscoverage['/cmd.js'].lineData[215]++;
  if (visit27_215_1(!editor.hasCommand("save"))) {
    _$jscoverage['/cmd.js'].lineData[216]++;
    var undoRedo = new UndoManager(editor);
    _$jscoverage['/cmd.js'].lineData[217]++;
    editor.addCommand("save", {
  exec: function(_, buffer) {
  _$jscoverage['/cmd.js'].functionData[13]++;
  _$jscoverage['/cmd.js'].lineData[219]++;
  editor.focus();
  _$jscoverage['/cmd.js'].lineData[220]++;
  undoRedo.save(buffer);
}});
    _$jscoverage['/cmd.js'].lineData[223]++;
    editor.addCommand("undo", {
  exec: function() {
  _$jscoverage['/cmd.js'].functionData[14]++;
  _$jscoverage['/cmd.js'].lineData[225]++;
  editor.focus();
  _$jscoverage['/cmd.js'].lineData[226]++;
  undoRedo.restore(-1);
}});
    _$jscoverage['/cmd.js'].lineData[229]++;
    editor.addCommand("redo", {
  exec: function() {
  _$jscoverage['/cmd.js'].functionData[15]++;
  _$jscoverage['/cmd.js'].lineData[231]++;
  editor.focus();
  _$jscoverage['/cmd.js'].lineData[232]++;
  undoRedo.restore(1);
}});
  }
}};
}, {
  requires: ['editor']});
