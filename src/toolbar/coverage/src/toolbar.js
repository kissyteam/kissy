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
  _$jscoverage['/toolbar.js'].lineData[9] = 0;
  _$jscoverage['/toolbar.js'].lineData[10] = 0;
  _$jscoverage['/toolbar.js'].lineData[14] = 0;
  _$jscoverage['/toolbar.js'].lineData[15] = 0;
  _$jscoverage['/toolbar.js'].lineData[16] = 0;
  _$jscoverage['/toolbar.js'].lineData[18] = 0;
  _$jscoverage['/toolbar.js'].lineData[20] = 0;
  _$jscoverage['/toolbar.js'].lineData[21] = 0;
  _$jscoverage['/toolbar.js'].lineData[25] = 0;
  _$jscoverage['/toolbar.js'].lineData[26] = 0;
  _$jscoverage['/toolbar.js'].lineData[27] = 0;
  _$jscoverage['/toolbar.js'].lineData[30] = 0;
  _$jscoverage['/toolbar.js'].lineData[31] = 0;
  _$jscoverage['/toolbar.js'].lineData[34] = 0;
  _$jscoverage['/toolbar.js'].lineData[37] = 0;
  _$jscoverage['/toolbar.js'].lineData[38] = 0;
  _$jscoverage['/toolbar.js'].lineData[39] = 0;
  _$jscoverage['/toolbar.js'].lineData[40] = 0;
  _$jscoverage['/toolbar.js'].lineData[42] = 0;
  _$jscoverage['/toolbar.js'].lineData[46] = 0;
  _$jscoverage['/toolbar.js'].lineData[47] = 0;
  _$jscoverage['/toolbar.js'].lineData[51] = 0;
  _$jscoverage['/toolbar.js'].lineData[53] = 0;
  _$jscoverage['/toolbar.js'].lineData[54] = 0;
  _$jscoverage['/toolbar.js'].lineData[55] = 0;
  _$jscoverage['/toolbar.js'].lineData[57] = 0;
  _$jscoverage['/toolbar.js'].lineData[59] = 0;
  _$jscoverage['/toolbar.js'].lineData[61] = 0;
  _$jscoverage['/toolbar.js'].lineData[62] = 0;
  _$jscoverage['/toolbar.js'].lineData[68] = 0;
  _$jscoverage['/toolbar.js'].lineData[69] = 0;
  _$jscoverage['/toolbar.js'].lineData[70] = 0;
  _$jscoverage['/toolbar.js'].lineData[71] = 0;
  _$jscoverage['/toolbar.js'].lineData[72] = 0;
  _$jscoverage['/toolbar.js'].lineData[73] = 0;
  _$jscoverage['/toolbar.js'].lineData[76] = 0;
  _$jscoverage['/toolbar.js'].lineData[84] = 0;
  _$jscoverage['/toolbar.js'].lineData[86] = 0;
  _$jscoverage['/toolbar.js'].lineData[92] = 0;
  _$jscoverage['/toolbar.js'].lineData[93] = 0;
  _$jscoverage['/toolbar.js'].lineData[99] = 0;
  _$jscoverage['/toolbar.js'].lineData[100] = 0;
  _$jscoverage['/toolbar.js'].lineData[101] = 0;
  _$jscoverage['/toolbar.js'].lineData[103] = 0;
  _$jscoverage['/toolbar.js'].lineData[104] = 0;
  _$jscoverage['/toolbar.js'].lineData[105] = 0;
  _$jscoverage['/toolbar.js'].lineData[106] = 0;
  _$jscoverage['/toolbar.js'].lineData[108] = 0;
  _$jscoverage['/toolbar.js'].lineData[110] = 0;
  _$jscoverage['/toolbar.js'].lineData[115] = 0;
  _$jscoverage['/toolbar.js'].lineData[116] = 0;
  _$jscoverage['/toolbar.js'].lineData[118] = 0;
  _$jscoverage['/toolbar.js'].lineData[119] = 0;
  _$jscoverage['/toolbar.js'].lineData[127] = 0;
  _$jscoverage['/toolbar.js'].lineData[128] = 0;
  _$jscoverage['/toolbar.js'].lineData[129] = 0;
  _$jscoverage['/toolbar.js'].lineData[133] = 0;
  _$jscoverage['/toolbar.js'].lineData[136] = 0;
  _$jscoverage['/toolbar.js'].lineData[137] = 0;
  _$jscoverage['/toolbar.js'].lineData[139] = 0;
  _$jscoverage['/toolbar.js'].lineData[140] = 0;
  _$jscoverage['/toolbar.js'].lineData[145] = 0;
  _$jscoverage['/toolbar.js'].lineData[150] = 0;
  _$jscoverage['/toolbar.js'].lineData[151] = 0;
  _$jscoverage['/toolbar.js'].lineData[152] = 0;
  _$jscoverage['/toolbar.js'].lineData[157] = 0;
  _$jscoverage['/toolbar.js'].lineData[158] = 0;
  _$jscoverage['/toolbar.js'].lineData[163] = 0;
  _$jscoverage['/toolbar.js'].lineData[165] = 0;
  _$jscoverage['/toolbar.js'].lineData[166] = 0;
  _$jscoverage['/toolbar.js'].lineData[169] = 0;
  _$jscoverage['/toolbar.js'].lineData[170] = 0;
  _$jscoverage['/toolbar.js'].lineData[173] = 0;
  _$jscoverage['/toolbar.js'].lineData[174] = 0;
  _$jscoverage['/toolbar.js'].lineData[177] = 0;
  _$jscoverage['/toolbar.js'].lineData[178] = 0;
  _$jscoverage['/toolbar.js'].lineData[181] = 0;
  _$jscoverage['/toolbar.js'].lineData[182] = 0;
  _$jscoverage['/toolbar.js'].lineData[185] = 0;
  _$jscoverage['/toolbar.js'].lineData[186] = 0;
  _$jscoverage['/toolbar.js'].lineData[189] = 0;
  _$jscoverage['/toolbar.js'].lineData[190] = 0;
  _$jscoverage['/toolbar.js'].lineData[193] = 0;
  _$jscoverage['/toolbar.js'].lineData[195] = 0;
  _$jscoverage['/toolbar.js'].lineData[199] = 0;
  _$jscoverage['/toolbar.js'].lineData[203] = 0;
  _$jscoverage['/toolbar.js'].lineData[204] = 0;
  _$jscoverage['/toolbar.js'].lineData[207] = 0;
  _$jscoverage['/toolbar.js'].lineData[208] = 0;
  _$jscoverage['/toolbar.js'].lineData[211] = 0;
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
  _$jscoverage['/toolbar.js'].branchData['14'] = [];
  _$jscoverage['/toolbar.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['15'] = [];
  _$jscoverage['/toolbar.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['20'] = [];
  _$jscoverage['/toolbar.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['28'] = [];
  _$jscoverage['/toolbar.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['28'][2] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['30'] = [];
  _$jscoverage['/toolbar.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['39'] = [];
  _$jscoverage['/toolbar.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['51'] = [];
  _$jscoverage['/toolbar.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['51'][2] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['51'][3] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['53'] = [];
  _$jscoverage['/toolbar.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['55'] = [];
  _$jscoverage['/toolbar.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['55'][2] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['61'] = [];
  _$jscoverage['/toolbar.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['70'] = [];
  _$jscoverage['/toolbar.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['72'] = [];
  _$jscoverage['/toolbar.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['72'][2] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['88'] = [];
  _$jscoverage['/toolbar.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['92'] = [];
  _$jscoverage['/toolbar.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['99'] = [];
  _$jscoverage['/toolbar.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['100'] = [];
  _$jscoverage['/toolbar.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['105'] = [];
  _$jscoverage['/toolbar.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['115'] = [];
  _$jscoverage['/toolbar.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['118'] = [];
  _$jscoverage['/toolbar.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['139'] = [];
  _$jscoverage['/toolbar.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['148'] = [];
  _$jscoverage['/toolbar.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['150'] = [];
  _$jscoverage['/toolbar.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['151'] = [];
  _$jscoverage['/toolbar.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['157'] = [];
  _$jscoverage['/toolbar.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['157'][2] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['157'][3] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['203'] = [];
  _$jscoverage['/toolbar.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/toolbar.js'].branchData['207'] = [];
  _$jscoverage['/toolbar.js'].branchData['207'][1] = new BranchData();
}
_$jscoverage['/toolbar.js'].branchData['207'][1].init(320, 19, 'nextHighlightedItem');
function visit33_207_1(result) {
  _$jscoverage['/toolbar.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['203'][1].init(198, 39, 'typeof nextHighlightedItem == \'boolean\'');
function visit32_203_1(result) {
  _$jscoverage['/toolbar.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['157'][3].init(485, 21, 'e.metaKey || e.altKey');
function visit31_157_3(result) {
  _$jscoverage['/toolbar.js'].branchData['157'][3].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['157'][2].init(472, 34, 'e.ctrlKey || e.metaKey || e.altKey');
function visit30_157_2(result) {
  _$jscoverage['/toolbar.js'].branchData['157'][2].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['157'][1].init(458, 48, 'e.shiftKey || e.ctrlKey || e.metaKey || e.altKey');
function visit29_157_1(result) {
  _$jscoverage['/toolbar.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['151'][1].init(22, 32, 'current.handleKeyDownInternal(e)');
function visit28_151_1(result) {
  _$jscoverage['/toolbar.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['150'][1].init(227, 7, 'current');
function visit27_150_1(result) {
  _$jscoverage['/toolbar.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['148'][1].init(152, 39, 'current && S.indexOf(current, children)');
function visit26_148_1(result) {
  _$jscoverage['/toolbar.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['139'][1].init(239, 45, 'highlightedItem = self.get("highlightedItem")');
function visit25_139_1(result) {
  _$jscoverage['/toolbar.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['118'][1].init(119, 1, 'v');
function visit24_118_1(result) {
  _$jscoverage['/toolbar.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['115'][1].init(18, 14, 'e && e.prevVal');
function visit23_115_1(result) {
  _$jscoverage['/toolbar.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['105'][1].init(205, 3, '!id');
function visit22_105_1(result) {
  _$jscoverage['/toolbar.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['100'][1].init(22, 36, 'el.ownerDocument.activeElement != el');
function visit21_100_1(result) {
  _$jscoverage['/toolbar.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['99'][1].init(507, 4, 'item');
function visit20_99_1(result) {
  _$jscoverage['/toolbar.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['92'][1].init(246, 39, 'prevVal && S.inArray(prevVal, children)');
function visit19_92_1(result) {
  _$jscoverage['/toolbar.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['88'][1].init(72, 14, 'e && e.prevVal');
function visit18_88_1(result) {
  _$jscoverage['/toolbar.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['72'][2].init(81, 45, 'child.isMenuButton && !child.get(\'collapsed\')');
function visit17_72_2(result) {
  _$jscoverage['/toolbar.js'].branchData['72'][2].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['72'][1].init(52, 75, 'child.get(\'highlighted\') || (child.isMenuButton && !child.get(\'collapsed\'))');
function visit16_72_1(result) {
  _$jscoverage['/toolbar.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['70'][1].init(81, 19, 'i < children.length');
function visit15_70_1(result) {
  _$jscoverage['/toolbar.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['61'][1].init(22, 34, '!e.byPassSetToolbarHighlightedItem');
function visit14_61_1(result) {
  _$jscoverage['/toolbar.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['55'][2].init(87, 55, 'self.get(\'expandedItem\') && S.inArray(target, children)');
function visit13_55_2(result) {
  _$jscoverage['/toolbar.js'].branchData['55'][2].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['55'][1].init(72, 70, 'expandedItem = self.get(\'expandedItem\') && S.inArray(target, children)');
function visit12_55_1(result) {
  _$jscoverage['/toolbar.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['53'][1].init(20, 8, 'e.newVal');
function visit11_53_1(result) {
  _$jscoverage['/toolbar.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['51'][3].init(142, 36, 'target.isMenuItem || target.isButton');
function visit10_51_3(result) {
  _$jscoverage['/toolbar.js'].branchData['51'][3].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['51'][2].init(122, 15, 'self !== target');
function visit9_51_2(result) {
  _$jscoverage['/toolbar.js'].branchData['51'][2].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['51'][1].init(122, 57, 'self !== target && (target.isMenuItem || target.isButton)');
function visit8_51_1(result) {
  _$jscoverage['/toolbar.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['39'][1].init(40, 8, 'e.newVal');
function visit7_39_1(result) {
  _$jscoverage['/toolbar.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['30'][1].init(627, 23, 'count != childrenLength');
function visit6_30_1(result) {
  _$jscoverage['/toolbar.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['28'][2].init(553, 22, 'count < childrenLength');
function visit5_28_2(result) {
  _$jscoverage['/toolbar.js'].branchData['28'][2].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['28'][1].init(120, 57, 'count < childrenLength && children[index].get("disabled")');
function visit4_28_1(result) {
  _$jscoverage['/toolbar.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['20'][1].init(163, 32, '!children[index].get("disabled")');
function visit3_20_1(result) {
  _$jscoverage['/toolbar.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['15'][1].init(18, 14, 'direction == 1');
function visit2_15_1(result) {
  _$jscoverage['/toolbar.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].branchData['14'][1].init(133, 18, 'index == undefined');
function visit1_14_1(result) {
  _$jscoverage['/toolbar.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/toolbar.js'].lineData[6]++;
KISSY.add("toolbar", function(S, Container, DelegateChildrenExtension, ToolbarRender, Node, undefined) {
  _$jscoverage['/toolbar.js'].functionData[0]++;
  _$jscoverage['/toolbar.js'].lineData[7]++;
  var KeyCode = Node.KeyCode;
  _$jscoverage['/toolbar.js'].lineData[9]++;
  function getNextEnabledItem(index, direction, self) {
    _$jscoverage['/toolbar.js'].functionData[1]++;
    _$jscoverage['/toolbar.js'].lineData[10]++;
    var children = self.get("children"), count = 0, childrenLength = children.length;
    _$jscoverage['/toolbar.js'].lineData[14]++;
    if (visit1_14_1(index == undefined)) {
      _$jscoverage['/toolbar.js'].lineData[15]++;
      if (visit2_15_1(direction == 1)) {
        _$jscoverage['/toolbar.js'].lineData[16]++;
        index = 0;
      } else {
        _$jscoverage['/toolbar.js'].lineData[18]++;
        index = childrenLength - 1;
      }
      _$jscoverage['/toolbar.js'].lineData[20]++;
      if (visit3_20_1(!children[index].get("disabled"))) {
        _$jscoverage['/toolbar.js'].lineData[21]++;
        return children[index];
      }
    }
    _$jscoverage['/toolbar.js'].lineData[25]++;
    do {
      _$jscoverage['/toolbar.js'].lineData[26]++;
      count++;
      _$jscoverage['/toolbar.js'].lineData[27]++;
      index = (index + childrenLength + direction) % childrenLength;
    } while (visit4_28_1(visit5_28_2(count < childrenLength) && children[index].get("disabled")));
    _$jscoverage['/toolbar.js'].lineData[30]++;
    if (visit6_30_1(count != childrenLength)) {
      _$jscoverage['/toolbar.js'].lineData[31]++;
      return children[index];
    }
    _$jscoverage['/toolbar.js'].lineData[34]++;
    return null;
  }
  _$jscoverage['/toolbar.js'].lineData[37]++;
  function afterCollapsedChange(e) {
    _$jscoverage['/toolbar.js'].functionData[2]++;
    _$jscoverage['/toolbar.js'].lineData[38]++;
    var self = this;
    _$jscoverage['/toolbar.js'].lineData[39]++;
    if (visit7_39_1(e.newVal)) {
      _$jscoverage['/toolbar.js'].lineData[40]++;
      self.set("expandedItem", null);
    } else {
      _$jscoverage['/toolbar.js'].lineData[42]++;
      self.set("expandedItem", e.target);
    }
  }
  _$jscoverage['/toolbar.js'].lineData[46]++;
  function afterHighlightedChange(e) {
    _$jscoverage['/toolbar.js'].functionData[3]++;
    _$jscoverage['/toolbar.js'].lineData[47]++;
    var self = this, expandedItem, children, target = e.target;
    _$jscoverage['/toolbar.js'].lineData[51]++;
    if (visit8_51_1(visit9_51_2(self !== target) && (visit10_51_3(target.isMenuItem || target.isButton)))) {
      _$jscoverage['/toolbar.js'].lineData[53]++;
      if (visit11_53_1(e.newVal)) {
        _$jscoverage['/toolbar.js'].lineData[54]++;
        children = self.get('children');
        _$jscoverage['/toolbar.js'].lineData[55]++;
        if (visit12_55_1(expandedItem = visit13_55_2(self.get('expandedItem') && S.inArray(target, children)))) {
          _$jscoverage['/toolbar.js'].lineData[57]++;
          self.set('expandedItem', target.isMenuButton ? target : null);
        }
        _$jscoverage['/toolbar.js'].lineData[59]++;
        self.set("highlightedItem", target);
      } else {
        _$jscoverage['/toolbar.js'].lineData[61]++;
        if (visit14_61_1(!e.byPassSetToolbarHighlightedItem)) {
          _$jscoverage['/toolbar.js'].lineData[62]++;
          self.set('highlightedItem', null);
        }
      }
    }
  }
  _$jscoverage['/toolbar.js'].lineData[68]++;
  function getChildByHighlightedItem(toolbar) {
    _$jscoverage['/toolbar.js'].functionData[4]++;
    _$jscoverage['/toolbar.js'].lineData[69]++;
    var children = toolbar.get('children'), i, child;
    _$jscoverage['/toolbar.js'].lineData[70]++;
    for (i = 0; visit15_70_1(i < children.length); i++) {
      _$jscoverage['/toolbar.js'].lineData[71]++;
      child = children[i];
      _$jscoverage['/toolbar.js'].lineData[72]++;
      if (visit16_72_1(child.get('highlighted') || (visit17_72_2(child.isMenuButton && !child.get('collapsed'))))) {
        _$jscoverage['/toolbar.js'].lineData[73]++;
        return child;
      }
    }
    _$jscoverage['/toolbar.js'].lineData[76]++;
    return null;
  }
  _$jscoverage['/toolbar.js'].lineData[84]++;
  return Container.extend([DelegateChildrenExtension], {
  _onSetHighlightedItem: function(item, e) {
  _$jscoverage['/toolbar.js'].functionData[5]++;
  _$jscoverage['/toolbar.js'].lineData[86]++;
  var id, itemEl, self = this, prevVal = visit18_88_1(e && e.prevVal), children = self.get('children'), el = self.el;
  _$jscoverage['/toolbar.js'].lineData[92]++;
  if (visit19_92_1(prevVal && S.inArray(prevVal, children))) {
    _$jscoverage['/toolbar.js'].lineData[93]++;
    prevVal.set('highlighted', false, {
  data: {
  byPassSetToolbarHighlightedItem: 1}});
  }
  _$jscoverage['/toolbar.js'].lineData[99]++;
  if (visit20_99_1(item)) {
    _$jscoverage['/toolbar.js'].lineData[100]++;
    if (visit21_100_1(el.ownerDocument.activeElement != el)) {
      _$jscoverage['/toolbar.js'].lineData[101]++;
      self.focus();
    }
    _$jscoverage['/toolbar.js'].lineData[103]++;
    itemEl = item.el;
    _$jscoverage['/toolbar.js'].lineData[104]++;
    id = itemEl.id;
    _$jscoverage['/toolbar.js'].lineData[105]++;
    if (visit22_105_1(!id)) {
      _$jscoverage['/toolbar.js'].lineData[106]++;
      itemEl.id = id = S.guid("ks-toolbar-item");
    }
    _$jscoverage['/toolbar.js'].lineData[108]++;
    el.setAttribute("aria-activedescendant", id);
  } else {
    _$jscoverage['/toolbar.js'].lineData[110]++;
    el.setAttribute("aria-activedescendant", "");
  }
}, 
  '_onSetExpandedItem': function(v, e) {
  _$jscoverage['/toolbar.js'].functionData[6]++;
  _$jscoverage['/toolbar.js'].lineData[115]++;
  if (visit23_115_1(e && e.prevVal)) {
    _$jscoverage['/toolbar.js'].lineData[116]++;
    e.prevVal.set('collapsed', true);
  }
  _$jscoverage['/toolbar.js'].lineData[118]++;
  if (visit24_118_1(v)) {
    _$jscoverage['/toolbar.js'].lineData[119]++;
    v.set('collapsed', false);
  }
}, 
  bindUI: function() {
  _$jscoverage['/toolbar.js'].functionData[7]++;
  _$jscoverage['/toolbar.js'].lineData[127]++;
  var self = this;
  _$jscoverage['/toolbar.js'].lineData[128]++;
  self.on("afterCollapsedChange", afterCollapsedChange, self);
  _$jscoverage['/toolbar.js'].lineData[129]++;
  self.on("afterHighlightedChange", afterHighlightedChange, self);
}, 
  handleBlurInternal: function(e) {
  _$jscoverage['/toolbar.js'].functionData[8]++;
  _$jscoverage['/toolbar.js'].lineData[133]++;
  var self = this, highlightedItem, expandedItem;
  _$jscoverage['/toolbar.js'].lineData[136]++;
  self.callSuper(e);
  _$jscoverage['/toolbar.js'].lineData[137]++;
  self.set("expandedItem", null);
  _$jscoverage['/toolbar.js'].lineData[139]++;
  if (visit25_139_1(highlightedItem = self.get("highlightedItem"))) {
    _$jscoverage['/toolbar.js'].lineData[140]++;
    highlightedItem.set('highlighted', false);
  }
}, 
  getNextItemByKeyDown: function(e, current) {
  _$jscoverage['/toolbar.js'].functionData[9]++;
  _$jscoverage['/toolbar.js'].lineData[145]++;
  var self = this, orientation = self.get("orientation"), children = self.get("children"), childIndex = visit26_148_1(current && S.indexOf(current, children));
  _$jscoverage['/toolbar.js'].lineData[150]++;
  if (visit27_150_1(current)) {
    _$jscoverage['/toolbar.js'].lineData[151]++;
    if (visit28_151_1(current.handleKeyDownInternal(e))) {
      _$jscoverage['/toolbar.js'].lineData[152]++;
      return true;
    }
  }
  _$jscoverage['/toolbar.js'].lineData[157]++;
  if (visit29_157_1(e.shiftKey || visit30_157_2(e.ctrlKey || visit31_157_3(e.metaKey || e.altKey)))) {
    _$jscoverage['/toolbar.js'].lineData[158]++;
    return false;
  }
  _$jscoverage['/toolbar.js'].lineData[163]++;
  switch (e.keyCode) {
    case KeyCode.ESC:
      _$jscoverage['/toolbar.js'].lineData[165]++;
      self.view.getKeyEventTarget().fire("blur");
      _$jscoverage['/toolbar.js'].lineData[166]++;
      return true;
    case KeyCode.HOME:
      _$jscoverage['/toolbar.js'].lineData[169]++;
      current = getNextEnabledItem(undefined, 1, self);
      _$jscoverage['/toolbar.js'].lineData[170]++;
      break;
    case KeyCode.END:
      _$jscoverage['/toolbar.js'].lineData[173]++;
      current = getNextEnabledItem(undefined, -1, self);
      _$jscoverage['/toolbar.js'].lineData[174]++;
      break;
    case KeyCode.UP:
      _$jscoverage['/toolbar.js'].lineData[177]++;
      current = getNextEnabledItem(childIndex, -1, self);
      _$jscoverage['/toolbar.js'].lineData[178]++;
      break;
    case KeyCode.LEFT:
      _$jscoverage['/toolbar.js'].lineData[181]++;
      current = getNextEnabledItem(childIndex, -1, self);
      _$jscoverage['/toolbar.js'].lineData[182]++;
      break;
    case KeyCode.DOWN:
      _$jscoverage['/toolbar.js'].lineData[185]++;
      current = getNextEnabledItem(childIndex, 1, self);
      _$jscoverage['/toolbar.js'].lineData[186]++;
      break;
    case KeyCode.RIGHT:
      _$jscoverage['/toolbar.js'].lineData[189]++;
      current = getNextEnabledItem(childIndex, 1, self);
      _$jscoverage['/toolbar.js'].lineData[190]++;
      break;
    default:
      _$jscoverage['/toolbar.js'].lineData[193]++;
      return false;
  }
  _$jscoverage['/toolbar.js'].lineData[195]++;
  return current;
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/toolbar.js'].functionData[10]++;
  _$jscoverage['/toolbar.js'].lineData[199]++;
  var self = this, currentChild = getChildByHighlightedItem(self), nextHighlightedItem = self.getNextItemByKeyDown(e, currentChild);
  _$jscoverage['/toolbar.js'].lineData[203]++;
  if (visit32_203_1(typeof nextHighlightedItem == 'boolean')) {
    _$jscoverage['/toolbar.js'].lineData[204]++;
    return nextHighlightedItem;
  }
  _$jscoverage['/toolbar.js'].lineData[207]++;
  if (visit33_207_1(nextHighlightedItem)) {
    _$jscoverage['/toolbar.js'].lineData[208]++;
    nextHighlightedItem.set("highlighted", true);
  }
  _$jscoverage['/toolbar.js'].lineData[211]++;
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
