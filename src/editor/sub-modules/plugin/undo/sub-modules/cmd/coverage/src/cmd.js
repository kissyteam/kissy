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
  _$jscoverage['/cmd.js'].lineData[6] = 0;
  _$jscoverage['/cmd.js'].lineData[7] = 0;
  _$jscoverage['/cmd.js'].lineData[8] = 0;
  _$jscoverage['/cmd.js'].lineData[17] = 0;
  _$jscoverage['/cmd.js'].lineData[18] = 0;
  _$jscoverage['/cmd.js'].lineData[21] = 0;
  _$jscoverage['/cmd.js'].lineData[22] = 0;
  _$jscoverage['/cmd.js'].lineData[25] = 0;
  _$jscoverage['/cmd.js'].lineData[27] = 0;
  _$jscoverage['/cmd.js'].lineData[30] = 0;
  _$jscoverage['/cmd.js'].lineData[32] = 0;
  _$jscoverage['/cmd.js'].lineData[37] = 0;
  _$jscoverage['/cmd.js'].lineData[47] = 0;
  _$jscoverage['/cmd.js'].lineData[52] = 0;
  _$jscoverage['/cmd.js'].lineData[53] = 0;
  _$jscoverage['/cmd.js'].lineData[55] = 0;
  _$jscoverage['/cmd.js'].lineData[56] = 0;
  _$jscoverage['/cmd.js'].lineData[58] = 0;
  _$jscoverage['/cmd.js'].lineData[59] = 0;
  _$jscoverage['/cmd.js'].lineData[62] = 0;
  _$jscoverage['/cmd.js'].lineData[69] = 0;
  _$jscoverage['/cmd.js'].lineData[71] = 0;
  _$jscoverage['/cmd.js'].lineData[74] = 0;
  _$jscoverage['/cmd.js'].lineData[75] = 0;
  _$jscoverage['/cmd.js'].lineData[76] = 0;
  _$jscoverage['/cmd.js'].lineData[77] = 0;
  _$jscoverage['/cmd.js'].lineData[79] = 0;
  _$jscoverage['/cmd.js'].lineData[82] = 0;
  _$jscoverage['/cmd.js'].lineData[83] = 0;
  _$jscoverage['/cmd.js'].lineData[84] = 0;
  _$jscoverage['/cmd.js'].lineData[86] = 0;
  _$jscoverage['/cmd.js'].lineData[87] = 0;
  _$jscoverage['/cmd.js'].lineData[90] = 0;
  _$jscoverage['/cmd.js'].lineData[91] = 0;
  _$jscoverage['/cmd.js'].lineData[92] = 0;
  _$jscoverage['/cmd.js'].lineData[94] = 0;
  _$jscoverage['/cmd.js'].lineData[95] = 0;
  _$jscoverage['/cmd.js'].lineData[97] = 0;
  _$jscoverage['/cmd.js'].lineData[98] = 0;
  _$jscoverage['/cmd.js'].lineData[105] = 0;
  _$jscoverage['/cmd.js'].lineData[107] = 0;
  _$jscoverage['/cmd.js'].lineData[108] = 0;
  _$jscoverage['/cmd.js'].lineData[110] = 0;
  _$jscoverage['/cmd.js'].lineData[111] = 0;
  _$jscoverage['/cmd.js'].lineData[112] = 0;
  _$jscoverage['/cmd.js'].lineData[114] = 0;
  _$jscoverage['/cmd.js'].lineData[115] = 0;
  _$jscoverage['/cmd.js'].lineData[116] = 0;
  _$jscoverage['/cmd.js'].lineData[128] = 0;
  _$jscoverage['/cmd.js'].lineData[131] = 0;
  _$jscoverage['/cmd.js'].lineData[132] = 0;
  _$jscoverage['/cmd.js'].lineData[135] = 0;
  _$jscoverage['/cmd.js'].lineData[136] = 0;
  _$jscoverage['/cmd.js'].lineData[139] = 0;
  _$jscoverage['/cmd.js'].lineData[140] = 0;
  _$jscoverage['/cmd.js'].lineData[141] = 0;
  _$jscoverage['/cmd.js'].lineData[144] = 0;
  _$jscoverage['/cmd.js'].lineData[150] = 0;
  _$jscoverage['/cmd.js'].lineData[152] = 0;
  _$jscoverage['/cmd.js'].lineData[155] = 0;
  _$jscoverage['/cmd.js'].lineData[156] = 0;
  _$jscoverage['/cmd.js'].lineData[157] = 0;
  _$jscoverage['/cmd.js'].lineData[158] = 0;
  _$jscoverage['/cmd.js'].lineData[159] = 0;
  _$jscoverage['/cmd.js'].lineData[161] = 0;
  _$jscoverage['/cmd.js'].lineData[162] = 0;
  _$jscoverage['/cmd.js'].lineData[163] = 0;
  _$jscoverage['/cmd.js'].lineData[173] = 0;
  _$jscoverage['/cmd.js'].lineData[174] = 0;
  _$jscoverage['/cmd.js'].lineData[177] = 0;
  _$jscoverage['/cmd.js'].lineData[183] = 0;
  _$jscoverage['/cmd.js'].lineData[184] = 0;
  _$jscoverage['/cmd.js'].lineData[185] = 0;
  _$jscoverage['/cmd.js'].lineData[186] = 0;
  _$jscoverage['/cmd.js'].lineData[187] = 0;
  _$jscoverage['/cmd.js'].lineData[191] = 0;
  _$jscoverage['/cmd.js'].lineData[192] = 0;
  _$jscoverage['/cmd.js'].lineData[193] = 0;
  _$jscoverage['/cmd.js'].lineData[195] = 0;
  _$jscoverage['/cmd.js'].lineData[197] = 0;
  _$jscoverage['/cmd.js'].lineData[198] = 0;
  _$jscoverage['/cmd.js'].lineData[200] = 0;
  _$jscoverage['/cmd.js'].lineData[201] = 0;
  _$jscoverage['/cmd.js'].lineData[205] = 0;
  _$jscoverage['/cmd.js'].lineData[208] = 0;
  _$jscoverage['/cmd.js'].lineData[212] = 0;
  _$jscoverage['/cmd.js'].lineData[214] = 0;
  _$jscoverage['/cmd.js'].lineData[215] = 0;
  _$jscoverage['/cmd.js'].lineData[216] = 0;
  _$jscoverage['/cmd.js'].lineData[218] = 0;
  _$jscoverage['/cmd.js'].lineData[219] = 0;
  _$jscoverage['/cmd.js'].lineData[222] = 0;
  _$jscoverage['/cmd.js'].lineData[224] = 0;
  _$jscoverage['/cmd.js'].lineData[225] = 0;
  _$jscoverage['/cmd.js'].lineData[228] = 0;
  _$jscoverage['/cmd.js'].lineData[230] = 0;
  _$jscoverage['/cmd.js'].lineData[231] = 0;
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
  _$jscoverage['/cmd.js'].branchData['21'] = [];
  _$jscoverage['/cmd.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['27'] = [];
  _$jscoverage['/cmd.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['37'] = [];
  _$jscoverage['/cmd.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['77'] = [];
  _$jscoverage['/cmd.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['82'] = [];
  _$jscoverage['/cmd.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['82'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['82'][3] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['83'] = [];
  _$jscoverage['/cmd.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['90'] = [];
  _$jscoverage['/cmd.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['90'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['90'][3] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['91'] = [];
  _$jscoverage['/cmd.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['97'] = [];
  _$jscoverage['/cmd.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['110'] = [];
  _$jscoverage['/cmd.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['111'] = [];
  _$jscoverage['/cmd.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['131'] = [];
  _$jscoverage['/cmd.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['135'] = [];
  _$jscoverage['/cmd.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['139'] = [];
  _$jscoverage['/cmd.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['155'] = [];
  _$jscoverage['/cmd.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['157'] = [];
  _$jscoverage['/cmd.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['173'] = [];
  _$jscoverage['/cmd.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['183'] = [];
  _$jscoverage['/cmd.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['185'] = [];
  _$jscoverage['/cmd.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['187'] = [];
  _$jscoverage['/cmd.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['197'] = [];
  _$jscoverage['/cmd.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['201'] = [];
  _$jscoverage['/cmd.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['214'] = [];
  _$jscoverage['/cmd.js'].branchData['214'][1] = new BranchData();
}
_$jscoverage['/cmd.js'].branchData['214'][1].init(17, 26, '!editor.hasCommand("save")');
function visit27_214_1(result) {
  _$jscoverage['/cmd.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['201'][1].init(886, 5, 'd < 0');
function visit26_201_1(result) {
  _$jscoverage['/cmd.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['197'][1].init(746, 9, 'selection');
function visit25_197_1(result) {
  _$jscoverage['/cmd.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['187'][1].init(211, 8, 'UA[\'ie\']');
function visit24_187_1(result) {
  _$jscoverage['/cmd.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['185'][1].init(82, 18, 'snapshot.bookmarks');
function visit23_185_1(result) {
  _$jscoverage['/cmd.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['183'][1].init(394, 8, 'snapshot');
function visit22_183_1(result) {
  _$jscoverage['/cmd.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['173'][1].init(50, 51, 'this.editor.get("mode") != Editor.Mode.WYSIWYG_MODE');
function visit21_173_1(result) {
  _$jscoverage['/cmd.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['157'][1].init(57, 11, 'l === LIMIT');
function visit20_157_1(result) {
  _$jscoverage['/cmd.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['155'][1].init(671, 30, '!last || !last.equals(current)');
function visit19_155_1(result) {
  _$jscoverage['/cmd.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['139'][1].init(276, 6, 'buffer');
function visit18_139_1(result) {
  _$jscoverage['/cmd.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['135'][1].init(194, 23, '!editor.get("document")');
function visit17_135_1(result) {
  _$jscoverage['/cmd.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['131'][1].init(89, 46, 'editor.get("mode") != Editor.Mode.WYSIWYG_MODE');
function visit16_131_1(result) {
  _$jscoverage['/cmd.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['111'][1].init(25, 19, 'editor.isDocReady()');
function visit15_111_1(result) {
  _$jscoverage['/cmd.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['110'][1].init(57, 46, 'editor.get(\'mode\') == Editor.Mode.WYSIWYG_MODE');
function visit14_110_1(result) {
  _$jscoverage['/cmd.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['97'][1].init(914, 48, 'editor.fire("beforeSave", {\n  buffer: 1}) !== false');
function visit13_97_1(result) {
  _$jscoverage['/cmd.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['91'][1].init(29, 35, 'false !== editor.fire("beforeUndo")');
function visit12_91_1(result) {
  _$jscoverage['/cmd.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['90'][3].init(634, 24, 'ev.ctrlKey || ev.metaKey');
function visit11_90_3(result) {
  _$jscoverage['/cmd.js'].branchData['90'][3].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['90'][2].init(609, 20, 'keyCode === yKeyCode');
function visit10_90_2(result) {
  _$jscoverage['/cmd.js'].branchData['90'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['90'][1].init(609, 50, 'keyCode === yKeyCode && (ev.ctrlKey || ev.metaKey)');
function visit9_90_1(result) {
  _$jscoverage['/cmd.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['83'][1].init(29, 35, 'false !== editor.fire("beforeRedo")');
function visit8_83_1(result) {
  _$jscoverage['/cmd.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['82'][3].init(295, 24, 'ev.ctrlKey || ev.metaKey');
function visit7_82_3(result) {
  _$jscoverage['/cmd.js'].branchData['82'][3].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['82'][2].init(270, 20, 'keyCode === zKeyCode');
function visit6_82_2(result) {
  _$jscoverage['/cmd.js'].branchData['82'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['82'][1].init(270, 50, 'keyCode === zKeyCode && (ev.ctrlKey || ev.metaKey)');
function visit5_82_1(result) {
  _$jscoverage['/cmd.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['77'][1].init(71, 84, 'keyCode in navigationKeyCodes || keyCode in modifierKeyCodes');
function visit4_77_1(result) {
  _$jscoverage['/cmd.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['37'][1].init(219, 29, 'thisContents == otherContents');
function visit3_37_1(result) {
  _$jscoverage['/cmd.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['27'][1].init(290, 45, 'selection && selection.createBookmarks2(true)');
function visit2_27_1(result) {
  _$jscoverage['/cmd.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['21'][1].init(126, 8, 'contents');
function visit1_21_1(result) {
  _$jscoverage['/cmd.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/cmd.js'].functionData[0]++;
  _$jscoverage['/cmd.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/cmd.js'].lineData[8]++;
  var UA = S.UA, LIMIT = 30;
  _$jscoverage['/cmd.js'].lineData[17]++;
  function Snapshot(editor) {
    _$jscoverage['/cmd.js'].functionData[1]++;
    _$jscoverage['/cmd.js'].lineData[18]++;
    var contents = editor.get("document")[0].body.innerHTML, self = this, selection;
    _$jscoverage['/cmd.js'].lineData[21]++;
    if (visit1_21_1(contents)) {
      _$jscoverage['/cmd.js'].lineData[22]++;
      selection = editor.getSelection();
    }
    _$jscoverage['/cmd.js'].lineData[25]++;
    self.contents = contents;
    _$jscoverage['/cmd.js'].lineData[27]++;
    self.bookmarks = visit2_27_1(selection && selection.createBookmarks2(true));
  }
  _$jscoverage['/cmd.js'].lineData[30]++;
  S.augment(Snapshot, {
  equals: function(otherImage) {
  _$jscoverage['/cmd.js'].functionData[2]++;
  _$jscoverage['/cmd.js'].lineData[32]++;
  var self = this, thisContents = self.contents, otherContents = otherImage.contents;
  _$jscoverage['/cmd.js'].lineData[37]++;
  return visit3_37_1(thisContents == otherContents);
}});
  _$jscoverage['/cmd.js'].lineData[47]++;
  function UndoManager(editor) {
    _$jscoverage['/cmd.js'].functionData[3]++;
    _$jscoverage['/cmd.js'].lineData[52]++;
    var self = this;
    _$jscoverage['/cmd.js'].lineData[53]++;
    self.history = [];
    _$jscoverage['/cmd.js'].lineData[55]++;
    self.index = -1;
    _$jscoverage['/cmd.js'].lineData[56]++;
    self.editor = editor;
    _$jscoverage['/cmd.js'].lineData[58]++;
    self.bufferRunner = S.buffer(self.save, 500, self);
    _$jscoverage['/cmd.js'].lineData[59]++;
    self._init();
  }
  _$jscoverage['/cmd.js'].lineData[62]++;
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
  _$jscoverage['/cmd.js'].lineData[69]++;
  S.augment(UndoManager, {
  _keyMonitor: function() {
  _$jscoverage['/cmd.js'].functionData[4]++;
  _$jscoverage['/cmd.js'].lineData[71]++;
  var self = this, editor = self.editor;
  _$jscoverage['/cmd.js'].lineData[74]++;
  editor.docReady(function() {
  _$jscoverage['/cmd.js'].functionData[5]++;
  _$jscoverage['/cmd.js'].lineData[75]++;
  editor.get("document").on('keydown', function(ev) {
  _$jscoverage['/cmd.js'].functionData[6]++;
  _$jscoverage['/cmd.js'].lineData[76]++;
  var keyCode = ev.keyCode;
  _$jscoverage['/cmd.js'].lineData[77]++;
  if (visit4_77_1(keyCode in navigationKeyCodes || keyCode in modifierKeyCodes)) {
    _$jscoverage['/cmd.js'].lineData[79]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[82]++;
  if (visit5_82_1(visit6_82_2(keyCode === zKeyCode) && (visit7_82_3(ev.ctrlKey || ev.metaKey)))) {
    _$jscoverage['/cmd.js'].lineData[83]++;
    if (visit8_83_1(false !== editor.fire("beforeRedo"))) {
      _$jscoverage['/cmd.js'].lineData[84]++;
      self.restore(-1);
    }
    _$jscoverage['/cmd.js'].lineData[86]++;
    ev.halt();
    _$jscoverage['/cmd.js'].lineData[87]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[90]++;
  if (visit9_90_1(visit10_90_2(keyCode === yKeyCode) && (visit11_90_3(ev.ctrlKey || ev.metaKey)))) {
    _$jscoverage['/cmd.js'].lineData[91]++;
    if (visit12_91_1(false !== editor.fire("beforeUndo"))) {
      _$jscoverage['/cmd.js'].lineData[92]++;
      self.restore(1);
    }
    _$jscoverage['/cmd.js'].lineData[94]++;
    ev.halt();
    _$jscoverage['/cmd.js'].lineData[95]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[97]++;
  if (visit13_97_1(editor.fire("beforeSave", {
  buffer: 1}) !== false)) {
    _$jscoverage['/cmd.js'].lineData[98]++;
    self.save(1);
  }
});
});
}, 
  _init: function() {
  _$jscoverage['/cmd.js'].functionData[7]++;
  _$jscoverage['/cmd.js'].lineData[105]++;
  var self = this, editor = self.editor;
  _$jscoverage['/cmd.js'].lineData[107]++;
  self._keyMonitor();
  _$jscoverage['/cmd.js'].lineData[108]++;
  setTimeout(function() {
  _$jscoverage['/cmd.js'].functionData[8]++;
  _$jscoverage['/cmd.js'].lineData[110]++;
  if (visit14_110_1(editor.get('mode') == Editor.Mode.WYSIWYG_MODE)) {
    _$jscoverage['/cmd.js'].lineData[111]++;
    if (visit15_111_1(editor.isDocReady())) {
      _$jscoverage['/cmd.js'].lineData[112]++;
      self.save();
    } else {
      _$jscoverage['/cmd.js'].lineData[114]++;
      editor.on('docReady', function() {
  _$jscoverage['/cmd.js'].functionData[9]++;
  _$jscoverage['/cmd.js'].lineData[115]++;
  self.save();
  _$jscoverage['/cmd.js'].lineData[116]++;
  editor.detach('docReady', arguments.callee);
});
    }
  }
}, 0);
}, 
  save: function(buffer) {
  _$jscoverage['/cmd.js'].functionData[10]++;
  _$jscoverage['/cmd.js'].lineData[128]++;
  var editor = this.editor;
  _$jscoverage['/cmd.js'].lineData[131]++;
  if (visit16_131_1(editor.get("mode") != Editor.Mode.WYSIWYG_MODE)) {
    _$jscoverage['/cmd.js'].lineData[132]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[135]++;
  if (visit17_135_1(!editor.get("document"))) {
    _$jscoverage['/cmd.js'].lineData[136]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[139]++;
  if (visit18_139_1(buffer)) {
    _$jscoverage['/cmd.js'].lineData[140]++;
    this.bufferRunner();
    _$jscoverage['/cmd.js'].lineData[141]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[144]++;
  var self = this, history = self.history, l = history.length, index = self.index;
  _$jscoverage['/cmd.js'].lineData[150]++;
  l = Math.min(l, index + 1);
  _$jscoverage['/cmd.js'].lineData[152]++;
  var last = history[l - 1], current = new Snapshot(editor);
  _$jscoverage['/cmd.js'].lineData[155]++;
  if (visit19_155_1(!last || !last.equals(current))) {
    _$jscoverage['/cmd.js'].lineData[156]++;
    history.length = l;
    _$jscoverage['/cmd.js'].lineData[157]++;
    if (visit20_157_1(l === LIMIT)) {
      _$jscoverage['/cmd.js'].lineData[158]++;
      history.shift();
      _$jscoverage['/cmd.js'].lineData[159]++;
      l--;
    }
    _$jscoverage['/cmd.js'].lineData[161]++;
    history.push(current);
    _$jscoverage['/cmd.js'].lineData[162]++;
    self.index = index = l;
    _$jscoverage['/cmd.js'].lineData[163]++;
    editor.fire("afterSave", {
  history: history, 
  index: index});
  }
}, 
  restore: function(d) {
  _$jscoverage['/cmd.js'].functionData[11]++;
  _$jscoverage['/cmd.js'].lineData[173]++;
  if (visit21_173_1(this.editor.get("mode") != Editor.Mode.WYSIWYG_MODE)) {
    _$jscoverage['/cmd.js'].lineData[174]++;
    return undefined;
  }
  _$jscoverage['/cmd.js'].lineData[177]++;
  var self = this, history = self.history, editor = self.editor, editorDomBody = editor.get("document")[0].body, snapshot = history[self.index + d];
  _$jscoverage['/cmd.js'].lineData[183]++;
  if (visit22_183_1(snapshot)) {
    _$jscoverage['/cmd.js'].lineData[184]++;
    editorDomBody.innerHTML = snapshot.contents;
    _$jscoverage['/cmd.js'].lineData[185]++;
    if (visit23_185_1(snapshot.bookmarks)) {
      _$jscoverage['/cmd.js'].lineData[186]++;
      editor.getSelection().selectBookmarks(snapshot.bookmarks);
    } else {
      _$jscoverage['/cmd.js'].lineData[187]++;
      if (visit24_187_1(UA.ie)) {
        _$jscoverage['/cmd.js'].lineData[191]++;
        var $range = editorDomBody.createTextRange();
        _$jscoverage['/cmd.js'].lineData[192]++;
        $range.collapse(true);
        _$jscoverage['/cmd.js'].lineData[193]++;
        $range.select();
      }
    }
    _$jscoverage['/cmd.js'].lineData[195]++;
    var selection = editor.getSelection();
    _$jscoverage['/cmd.js'].lineData[197]++;
    if (visit25_197_1(selection)) {
      _$jscoverage['/cmd.js'].lineData[198]++;
      selection.scrollIntoView();
    }
    _$jscoverage['/cmd.js'].lineData[200]++;
    self.index += d;
    _$jscoverage['/cmd.js'].lineData[201]++;
    editor.fire(visit26_201_1(d < 0) ? "afterUndo" : "afterRedo", {
  history: history, 
  index: self.index});
    _$jscoverage['/cmd.js'].lineData[205]++;
    editor.notifySelectionChange();
  }
  _$jscoverage['/cmd.js'].lineData[208]++;
  return snapshot;
}});
  _$jscoverage['/cmd.js'].lineData[212]++;
  return {
  init: function(editor) {
  _$jscoverage['/cmd.js'].functionData[12]++;
  _$jscoverage['/cmd.js'].lineData[214]++;
  if (visit27_214_1(!editor.hasCommand("save"))) {
    _$jscoverage['/cmd.js'].lineData[215]++;
    var undoRedo = new UndoManager(editor);
    _$jscoverage['/cmd.js'].lineData[216]++;
    editor.addCommand("save", {
  exec: function(_, buffer) {
  _$jscoverage['/cmd.js'].functionData[13]++;
  _$jscoverage['/cmd.js'].lineData[218]++;
  editor.focus();
  _$jscoverage['/cmd.js'].lineData[219]++;
  undoRedo.save(buffer);
}});
    _$jscoverage['/cmd.js'].lineData[222]++;
    editor.addCommand("undo", {
  exec: function() {
  _$jscoverage['/cmd.js'].functionData[14]++;
  _$jscoverage['/cmd.js'].lineData[224]++;
  editor.focus();
  _$jscoverage['/cmd.js'].lineData[225]++;
  undoRedo.restore(-1);
}});
    _$jscoverage['/cmd.js'].lineData[228]++;
    editor.addCommand("redo", {
  exec: function() {
  _$jscoverage['/cmd.js'].functionData[15]++;
  _$jscoverage['/cmd.js'].lineData[230]++;
  editor.focus();
  _$jscoverage['/cmd.js'].lineData[231]++;
  undoRedo.restore(1);
}});
  }
}};
});
