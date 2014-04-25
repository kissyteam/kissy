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
if (! _$jscoverage['/editor/enter-key.js']) {
  _$jscoverage['/editor/enter-key.js'] = {};
  _$jscoverage['/editor/enter-key.js'].lineData = [];
  _$jscoverage['/editor/enter-key.js'].lineData[10] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[11] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[12] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[13] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[14] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[15] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[16] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[17] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[18] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[21] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[23] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[25] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[26] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[29] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[32] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[34] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[35] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[36] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[41] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[43] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[44] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[45] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[46] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[47] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[48] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[50] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[53] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[55] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[57] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[58] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[59] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[61] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[62] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[64] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[66] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[67] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[68] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[69] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[71] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[76] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[79] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[81] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[82] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[86] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[89] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[90] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[92] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[95] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[96] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[97] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[98] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[99] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[101] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[102] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[103] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[104] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[107] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[112] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[116] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[119] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[124] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[125] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[128] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[133] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[135] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[137] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[138] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[141] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[142] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[148] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[149] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[150] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[151] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[153] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[155] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[158] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[159] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[160] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[161] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[166] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[167] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[170] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[177] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[179] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[180] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[184] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[187] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[188] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[191] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[194] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[196] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[197] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[202] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[206] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[213] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[214] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[217] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[218] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[219] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[220] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[221] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[222] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[223] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[224] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[225] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[226] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[227] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[234] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[236] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[239] = 0;
  _$jscoverage['/editor/enter-key.js'].lineData[240] = 0;
}
if (! _$jscoverage['/editor/enter-key.js'].functionData) {
  _$jscoverage['/editor/enter-key.js'].functionData = [];
  _$jscoverage['/editor/enter-key.js'].functionData[0] = 0;
  _$jscoverage['/editor/enter-key.js'].functionData[1] = 0;
  _$jscoverage['/editor/enter-key.js'].functionData[2] = 0;
  _$jscoverage['/editor/enter-key.js'].functionData[3] = 0;
  _$jscoverage['/editor/enter-key.js'].functionData[4] = 0;
  _$jscoverage['/editor/enter-key.js'].functionData[5] = 0;
  _$jscoverage['/editor/enter-key.js'].functionData[6] = 0;
}
if (! _$jscoverage['/editor/enter-key.js'].branchData) {
  _$jscoverage['/editor/enter-key.js'].branchData = {};
  _$jscoverage['/editor/enter-key.js'].branchData['17'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['25'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['41'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['43'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['43'][2] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['43'][3] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['43'][4] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['44'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['53'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['53'][2] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['55'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['57'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['59'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['68'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['81'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['95'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['97'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['101'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['101'][2] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['101'][3] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['112'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['116'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['116'][2] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['117'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['124'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['128'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['133'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['133'][2] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['137'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['141'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['149'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['150'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['153'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['158'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['166'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['177'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['177'][2] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['177'][3] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['184'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['187'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['188'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['221'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['222'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['222'][2] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['222'][3] = new BranchData();
  _$jscoverage['/editor/enter-key.js'].branchData['226'] = [];
  _$jscoverage['/editor/enter-key.js'].branchData['226'][1] = new BranchData();
}
_$jscoverage['/editor/enter-key.js'].branchData['226'][1].init(188, 12, 're !== false');
function visit341_226_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['222'][3].init(39, 24, 'ev.ctrlKey || ev.metaKey');
function visit340_222_3(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['222'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['222'][2].init(24, 39, 'ev.shiftKey || ev.ctrlKey || ev.metaKey');
function visit339_222_2(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['222'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['222'][1].init(22, 42, '!(ev.shiftKey || ev.ctrlKey || ev.metaKey)');
function visit338_222_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['221'][1].init(57, 14, 'keyCode === 13');
function visit337_221_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['188'][1].init(18, 9, 'nextBlock');
function visit336_188_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['187'][1].init(6567, 7, '!OLD_IE');
function visit335_187_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['184'][1].init(2519, 31, 'isStartOfBlock && !isEndOfBlock');
function visit334_184_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['177'][3].init(2158, 52, '!isEndOfBlock || !previousBlock[0].childNodes.length');
function visit333_177_3(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['177'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['177'][2].init(2139, 72, 'isStartOfBlock && (!isEndOfBlock || !previousBlock[0].childNodes.length)');
function visit332_177_2(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['177'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['177'][1].init(2129, 82, 'OLD_IE && isStartOfBlock && (!isEndOfBlock || !previousBlock[0].childNodes.length)');
function visit331_177_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['166'][1].init(1697, 7, '!OLD_IE');
function visit330_166_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['158'][1].init(325, 38, 'dtd.$removeEmpty[element.nodeName()]');
function visit329_158_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['153'][1].init(90, 100, 'element.equals(elementPath.block) || element.equals(elementPath.blockLimit)');
function visit328_153_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['150'][1].init(69, 7, 'i < len');
function visit327_150_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['149'][1].init(993, 11, 'elementPath');
function visit326_149_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['141'][1].init(641, 9, '!newBlock');
function visit325_141_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['137'][1].init(548, 9, 'nextBlock');
function visit324_137_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['133'][2].init(258, 33, 'previousBlock.nodeName() === \'li\'');
function visit323_133_2(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['133'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['133'][1].init(258, 88, 'previousBlock.nodeName() === \'li\' || !(headerPreTagRegex.test(previousBlock.nodeName()))');
function visit322_133_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['128'][1].init(18, 13, 'previousBlock');
function visit321_128_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['124'][1].init(619, 9, 'nextBlock');
function visit320_124_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['117'][1].init(50, 108, '(node = nextBlock.first(Walker.invisible(true))) && S.inArray(node.nodeName(), [\'ul\', \'ol\'])');
function visit319_117_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['116'][2].init(227, 29, 'nextBlock.nodeName() === \'li\'');
function visit318_116_2(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['116'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['116'][1].init(227, 159, 'nextBlock.nodeName() === \'li\' && (node = nextBlock.first(Walker.invisible(true))) && S.inArray(node.nodeName(), [\'ul\', \'ol\'])');
function visit317_116_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['112'][1].init(3201, 32, '!isStartOfBlock && !isEndOfBlock');
function visit316_112_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['101'][3].init(2752, 24, 'node.nodeName() === \'li\'');
function visit315_101_3(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['101'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['101'][2].init(2718, 58, '(node = previousBlock.parent()) && node.nodeName() === \'li\'');
function visit314_101_2(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['101'][1].init(2700, 76, 'previousBlock && (node = previousBlock.parent()) && node.nodeName() === \'li\'');
function visit313_101_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['97'][1].init(58, 24, 'node.nodeName() === \'li\'');
function visit312_97_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['95'][1].init(2457, 9, 'nextBlock');
function visit311_95_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['81'][1].init(2052, 10, '!splitInfo');
function visit310_81_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['68'][1].init(660, 13, 'UA.ieMode < 9');
function visit309_68_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['59'][1].init(207, 13, 'UA.ieMode < 9');
function visit308_59_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['57'][1].init(66, 13, 'UA.ieMode < 9');
function visit307_57_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['55'][1].init(95, 13, '!isEndOfBlock');
function visit306_55_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['53'][2].init(934, 26, 'block.nodeName() === \'pre\'');
function visit305_53_2(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['53'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['53'][1].init(925, 35, 'block && block.nodeName() === \'pre\'');
function visit304_53_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['44'][1].init(22, 28, 'editor.hasCommand(\'outdent\')');
function visit303_44_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['43'][4].init(79, 34, 'block.parent().nodeName() === \'li\'');
function visit302_43_4(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['43'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['43'][3].init(50, 25, 'block.nodeName() === \'li\'');
function visit301_43_3(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['43'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['43'][2].init(50, 63, 'block.nodeName() === \'li\' || block.parent().nodeName() === \'li\'');
function visit300_43_2(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['43'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['43'][1].init(40, 74, 'block && (block.nodeName() === \'li\' || block.parent().nodeName() === \'li\')');
function visit299_43_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['41'][1].init(421, 30, 'isStartOfBlock && isEndOfBlock');
function visit298_41_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['25'][1].init(205, 5, 'i > 0');
function visit297_25_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].branchData['17'][1].init(230, 16, 'S.UA.ieMode < 11');
function visit296_17_1(result) {
  _$jscoverage['/editor/enter-key.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enter-key.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/enter-key.js'].functionData[0]++;
  _$jscoverage['/editor/enter-key.js'].lineData[11]++;
  var Node = require('node');
  _$jscoverage['/editor/enter-key.js'].lineData[12]++;
  var $ = Node.all;
  _$jscoverage['/editor/enter-key.js'].lineData[13]++;
  var UA = require('ua');
  _$jscoverage['/editor/enter-key.js'].lineData[14]++;
  var Walker = require('./walker');
  _$jscoverage['/editor/enter-key.js'].lineData[15]++;
  var Editor = require('./base');
  _$jscoverage['/editor/enter-key.js'].lineData[16]++;
  var ElementPath = require('./element-path');
  _$jscoverage['/editor/enter-key.js'].lineData[17]++;
  var OLD_IE = visit296_17_1(S.UA.ieMode < 11);
  _$jscoverage['/editor/enter-key.js'].lineData[18]++;
  var headerPreTagRegex = /^(?:h[1-6])|(?:pre)$/i, dtd = Editor.XHTML_DTD;
  _$jscoverage['/editor/enter-key.js'].lineData[21]++;
  function getRange(editor) {
    _$jscoverage['/editor/enter-key.js'].functionData[1]++;
    _$jscoverage['/editor/enter-key.js'].lineData[23]++;
    var ranges = editor.getSelection().getRanges();
    _$jscoverage['/editor/enter-key.js'].lineData[25]++;
    for (var i = ranges.length - 1; visit297_25_1(i > 0); i--) {
      _$jscoverage['/editor/enter-key.js'].lineData[26]++;
      ranges[i].deleteContents();
    }
    _$jscoverage['/editor/enter-key.js'].lineData[29]++;
    return ranges[0];
  }
  _$jscoverage['/editor/enter-key.js'].lineData[32]++;
  function enterBlock(editor) {
    _$jscoverage['/editor/enter-key.js'].functionData[2]++;
    _$jscoverage['/editor/enter-key.js'].lineData[34]++;
    var range = getRange(editor);
    _$jscoverage['/editor/enter-key.js'].lineData[35]++;
    var doc = range.document;
    _$jscoverage['/editor/enter-key.js'].lineData[36]++;
    var path = new ElementPath(range.startContainer), isStartOfBlock = range.checkStartOfBlock(), isEndOfBlock = range.checkEndOfBlock(), block = path.block;
    _$jscoverage['/editor/enter-key.js'].lineData[41]++;
    if (visit298_41_1(isStartOfBlock && isEndOfBlock)) {
      _$jscoverage['/editor/enter-key.js'].lineData[43]++;
      if (visit299_43_1(block && (visit300_43_2(visit301_43_3(block.nodeName() === 'li') || visit302_43_4(block.parent().nodeName() === 'li'))))) {
        _$jscoverage['/editor/enter-key.js'].lineData[44]++;
        if (visit303_44_1(editor.hasCommand('outdent'))) {
          _$jscoverage['/editor/enter-key.js'].lineData[45]++;
          editor.execCommand('save');
          _$jscoverage['/editor/enter-key.js'].lineData[46]++;
          editor.execCommand('outdent');
          _$jscoverage['/editor/enter-key.js'].lineData[47]++;
          editor.execCommand('save');
          _$jscoverage['/editor/enter-key.js'].lineData[48]++;
          return true;
        } else {
          _$jscoverage['/editor/enter-key.js'].lineData[50]++;
          return false;
        }
      }
    } else {
      _$jscoverage['/editor/enter-key.js'].lineData[53]++;
      if (visit304_53_1(block && visit305_53_2(block.nodeName() === 'pre'))) {
        _$jscoverage['/editor/enter-key.js'].lineData[55]++;
        if (visit306_55_1(!isEndOfBlock)) {
          _$jscoverage['/editor/enter-key.js'].lineData[57]++;
          var lineBreak = visit307_57_1(UA.ieMode < 9) ? $(doc.createTextNode('\r')) : $(doc.createElement('br'));
          _$jscoverage['/editor/enter-key.js'].lineData[58]++;
          range.insertNode(lineBreak);
          _$jscoverage['/editor/enter-key.js'].lineData[59]++;
          if (visit308_59_1(UA.ieMode < 9)) {
            _$jscoverage['/editor/enter-key.js'].lineData[61]++;
            lineBreak = $(doc.createTextNode('\ufeff')).insertAfter(lineBreak);
            _$jscoverage['/editor/enter-key.js'].lineData[62]++;
            range.setStartAt(lineBreak, Editor.RangeType.POSITION_AFTER_START);
          } else {
            _$jscoverage['/editor/enter-key.js'].lineData[64]++;
            range.setStartAfter(lineBreak);
          }
          _$jscoverage['/editor/enter-key.js'].lineData[66]++;
          range.collapse(true);
          _$jscoverage['/editor/enter-key.js'].lineData[67]++;
          range.select();
          _$jscoverage['/editor/enter-key.js'].lineData[68]++;
          if (visit309_68_1(UA.ieMode < 9)) {
            _$jscoverage['/editor/enter-key.js'].lineData[69]++;
            lineBreak[0].nodeValue = '';
          }
          _$jscoverage['/editor/enter-key.js'].lineData[71]++;
          return;
        }
      }
    }
    _$jscoverage['/editor/enter-key.js'].lineData[76]++;
    var blockTag = 'p';
    _$jscoverage['/editor/enter-key.js'].lineData[79]++;
    var splitInfo = range.splitBlock(blockTag);
    _$jscoverage['/editor/enter-key.js'].lineData[81]++;
    if (visit310_81_1(!splitInfo)) {
      _$jscoverage['/editor/enter-key.js'].lineData[82]++;
      return true;
    }
    _$jscoverage['/editor/enter-key.js'].lineData[86]++;
    var previousBlock = splitInfo.previousBlock, nextBlock = splitInfo.nextBlock;
    _$jscoverage['/editor/enter-key.js'].lineData[89]++;
    isStartOfBlock = splitInfo.wasStartOfBlock;
    _$jscoverage['/editor/enter-key.js'].lineData[90]++;
    isEndOfBlock = splitInfo.wasEndOfBlock;
    _$jscoverage['/editor/enter-key.js'].lineData[92]++;
    var node;
    _$jscoverage['/editor/enter-key.js'].lineData[95]++;
    if (visit311_95_1(nextBlock)) {
      _$jscoverage['/editor/enter-key.js'].lineData[96]++;
      node = nextBlock.parent();
      _$jscoverage['/editor/enter-key.js'].lineData[97]++;
      if (visit312_97_1(node.nodeName() === 'li')) {
        _$jscoverage['/editor/enter-key.js'].lineData[98]++;
        nextBlock._4eBreakParent(node);
        _$jscoverage['/editor/enter-key.js'].lineData[99]++;
        nextBlock._4eMove(nextBlock.next(), true);
      }
    } else {
      _$jscoverage['/editor/enter-key.js'].lineData[101]++;
      if (visit313_101_1(previousBlock && visit314_101_2((node = previousBlock.parent()) && visit315_101_3(node.nodeName() === 'li')))) {
        _$jscoverage['/editor/enter-key.js'].lineData[102]++;
        previousBlock._4eBreakParent(node);
        _$jscoverage['/editor/enter-key.js'].lineData[103]++;
        range.moveToElementEditablePosition(previousBlock.next());
        _$jscoverage['/editor/enter-key.js'].lineData[104]++;
        previousBlock._4eMove(previousBlock.prev());
      }
    }
    _$jscoverage['/editor/enter-key.js'].lineData[107]++;
    var newBlock;
    _$jscoverage['/editor/enter-key.js'].lineData[112]++;
    if (visit316_112_1(!isStartOfBlock && !isEndOfBlock)) {
      _$jscoverage['/editor/enter-key.js'].lineData[116]++;
      if (visit317_116_1(visit318_116_2(nextBlock.nodeName() === 'li') && visit319_117_1((node = nextBlock.first(Walker.invisible(true))) && S.inArray(node.nodeName(), ['ul', 'ol'])))) {
        _$jscoverage['/editor/enter-key.js'].lineData[119]++;
        (OLD_IE ? new Node(doc.createTextNode('\xa0')) : new Node(doc.createElement('br'))).insertBefore(node);
      }
      _$jscoverage['/editor/enter-key.js'].lineData[124]++;
      if (visit320_124_1(nextBlock)) {
        _$jscoverage['/editor/enter-key.js'].lineData[125]++;
        range.moveToElementEditablePosition(nextBlock);
      }
    } else {
      _$jscoverage['/editor/enter-key.js'].lineData[128]++;
      if (visit321_128_1(previousBlock)) {
        _$jscoverage['/editor/enter-key.js'].lineData[133]++;
        if (visit322_133_1(visit323_133_2(previousBlock.nodeName() === 'li') || !(headerPreTagRegex.test(previousBlock.nodeName())))) {
          _$jscoverage['/editor/enter-key.js'].lineData[135]++;
          newBlock = previousBlock.clone();
        }
      } else {
        _$jscoverage['/editor/enter-key.js'].lineData[137]++;
        if (visit324_137_1(nextBlock)) {
          _$jscoverage['/editor/enter-key.js'].lineData[138]++;
          newBlock = nextBlock.clone();
        }
      }
      _$jscoverage['/editor/enter-key.js'].lineData[141]++;
      if (visit325_141_1(!newBlock)) {
        _$jscoverage['/editor/enter-key.js'].lineData[142]++;
        newBlock = new Node('<' + blockTag + '>', null, doc);
      }
      _$jscoverage['/editor/enter-key.js'].lineData[148]++;
      var elementPath = splitInfo.elementPath;
      _$jscoverage['/editor/enter-key.js'].lineData[149]++;
      if (visit326_149_1(elementPath)) {
        _$jscoverage['/editor/enter-key.js'].lineData[150]++;
        for (var i = 0, len = elementPath.elements.length; visit327_150_1(i < len); i++) {
          _$jscoverage['/editor/enter-key.js'].lineData[151]++;
          var element = elementPath.elements[i];
          _$jscoverage['/editor/enter-key.js'].lineData[153]++;
          if (visit328_153_1(element.equals(elementPath.block) || element.equals(elementPath.blockLimit))) {
            _$jscoverage['/editor/enter-key.js'].lineData[155]++;
            break;
          }
          _$jscoverage['/editor/enter-key.js'].lineData[158]++;
          if (visit329_158_1(dtd.$removeEmpty[element.nodeName()])) {
            _$jscoverage['/editor/enter-key.js'].lineData[159]++;
            element = element.clone();
            _$jscoverage['/editor/enter-key.js'].lineData[160]++;
            newBlock._4eMoveChildren(element);
            _$jscoverage['/editor/enter-key.js'].lineData[161]++;
            newBlock.append(element);
          }
        }
      }
      _$jscoverage['/editor/enter-key.js'].lineData[166]++;
      if (visit330_166_1(!OLD_IE)) {
        _$jscoverage['/editor/enter-key.js'].lineData[167]++;
        newBlock._4eAppendBogus();
      }
      _$jscoverage['/editor/enter-key.js'].lineData[170]++;
      range.insertNode(newBlock);
      _$jscoverage['/editor/enter-key.js'].lineData[177]++;
      if (visit331_177_1(OLD_IE && visit332_177_2(isStartOfBlock && (visit333_177_3(!isEndOfBlock || !previousBlock[0].childNodes.length))))) {
        _$jscoverage['/editor/enter-key.js'].lineData[179]++;
        range.moveToElementEditablePosition(isEndOfBlock ? previousBlock : newBlock);
        _$jscoverage['/editor/enter-key.js'].lineData[180]++;
        range.select();
      }
      _$jscoverage['/editor/enter-key.js'].lineData[184]++;
      range.moveToElementEditablePosition(visit334_184_1(isStartOfBlock && !isEndOfBlock) ? nextBlock : newBlock);
    }
    _$jscoverage['/editor/enter-key.js'].lineData[187]++;
    if (visit335_187_1(!OLD_IE)) {
      _$jscoverage['/editor/enter-key.js'].lineData[188]++;
      if (visit336_188_1(nextBlock)) {
        _$jscoverage['/editor/enter-key.js'].lineData[191]++;
        var tmpNode = new Node(doc.createElement('span'));
        _$jscoverage['/editor/enter-key.js'].lineData[194]++;
        tmpNode.html('&nbsp;');
        _$jscoverage['/editor/enter-key.js'].lineData[196]++;
        range.insertNode(tmpNode);
        _$jscoverage['/editor/enter-key.js'].lineData[197]++;
        tmpNode.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
        _$jscoverage['/editor/enter-key.js'].lineData[202]++;
        range.deleteContents();
      } else {
        _$jscoverage['/editor/enter-key.js'].lineData[206]++;
        newBlock.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
      }
    }
    _$jscoverage['/editor/enter-key.js'].lineData[213]++;
    range.select();
    _$jscoverage['/editor/enter-key.js'].lineData[214]++;
    return true;
  }
  _$jscoverage['/editor/enter-key.js'].lineData[217]++;
  function enterKey(editor) {
    _$jscoverage['/editor/enter-key.js'].functionData[3]++;
    _$jscoverage['/editor/enter-key.js'].lineData[218]++;
    var doc = editor.get('document');
    _$jscoverage['/editor/enter-key.js'].lineData[219]++;
    doc.on('keydown', function(ev) {
  _$jscoverage['/editor/enter-key.js'].functionData[4]++;
  _$jscoverage['/editor/enter-key.js'].lineData[220]++;
  var keyCode = ev.keyCode;
  _$jscoverage['/editor/enter-key.js'].lineData[221]++;
  if (visit337_221_1(keyCode === 13)) {
    _$jscoverage['/editor/enter-key.js'].lineData[222]++;
    if (visit338_222_1(!(visit339_222_2(ev.shiftKey || visit340_222_3(ev.ctrlKey || ev.metaKey))))) {
      _$jscoverage['/editor/enter-key.js'].lineData[223]++;
      editor.execCommand('save');
      _$jscoverage['/editor/enter-key.js'].lineData[224]++;
      var re = editor.execCommand('enterBlock');
      _$jscoverage['/editor/enter-key.js'].lineData[225]++;
      editor.execCommand('save');
      _$jscoverage['/editor/enter-key.js'].lineData[226]++;
      if (visit341_226_1(re !== false)) {
        _$jscoverage['/editor/enter-key.js'].lineData[227]++;
        ev.preventDefault();
      }
    }
  }
});
  }
  _$jscoverage['/editor/enter-key.js'].lineData[234]++;
  return {
  init: function(editor) {
  _$jscoverage['/editor/enter-key.js'].functionData[5]++;
  _$jscoverage['/editor/enter-key.js'].lineData[236]++;
  editor.addCommand('enterBlock', {
  exec: enterBlock});
  _$jscoverage['/editor/enter-key.js'].lineData[239]++;
  editor.docReady(function() {
  _$jscoverage['/editor/enter-key.js'].functionData[6]++;
  _$jscoverage['/editor/enter-key.js'].lineData[240]++;
  enterKey(editor);
});
}};
});
