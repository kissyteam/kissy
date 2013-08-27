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
if (! _$jscoverage['/html-parser/utils.js']) {
  _$jscoverage['/html-parser/utils.js'] = {};
  _$jscoverage['/html-parser/utils.js'].lineData = [];
  _$jscoverage['/html-parser/utils.js'].lineData[5] = 0;
  _$jscoverage['/html-parser/utils.js'].lineData[6] = 0;
  _$jscoverage['/html-parser/utils.js'].lineData[8] = 0;
  _$jscoverage['/html-parser/utils.js'].lineData[11] = 0;
  _$jscoverage['/html-parser/utils.js'].lineData[17] = 0;
  _$jscoverage['/html-parser/utils.js'].lineData[37] = 0;
}
if (! _$jscoverage['/html-parser/utils.js'].functionData) {
  _$jscoverage['/html-parser/utils.js'].functionData = [];
  _$jscoverage['/html-parser/utils.js'].functionData[0] = 0;
  _$jscoverage['/html-parser/utils.js'].functionData[1] = 0;
  _$jscoverage['/html-parser/utils.js'].functionData[2] = 0;
  _$jscoverage['/html-parser/utils.js'].functionData[3] = 0;
  _$jscoverage['/html-parser/utils.js'].functionData[4] = 0;
}
if (! _$jscoverage['/html-parser/utils.js'].branchData) {
  _$jscoverage['/html-parser/utils.js'].branchData = {};
  _$jscoverage['/html-parser/utils.js'].branchData['11'] = [];
  _$jscoverage['/html-parser/utils.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['11'][2] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['11'][3] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['11'][4] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['11'][5] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['11'][6] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['11'][7] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['17'] = [];
  _$jscoverage['/html-parser/utils.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['18'] = [];
  _$jscoverage['/html-parser/utils.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['18'][2] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['19'] = [];
  _$jscoverage['/html-parser/utils.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['19'][2] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['20'] = [];
  _$jscoverage['/html-parser/utils.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['20'][2] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['21'] = [];
  _$jscoverage['/html-parser/utils.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['21'][2] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['22'] = [];
  _$jscoverage['/html-parser/utils.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['22'][2] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['23'] = [];
  _$jscoverage['/html-parser/utils.js'].branchData['23'][1] = new BranchData();
}
_$jscoverage['/html-parser/utils.js'].branchData['23'][1].init(29, 9, 'ch != \'=\'');
function visit333_23_1(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['22'][2].init(190, 9, 'ch != \'/\'');
function visit332_22_2(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['22'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['22'][1].init(29, 39, 'ch != \'/\' && ch != \'=\'');
function visit331_22_1(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['21'][2].init(159, 9, 'ch != "<"');
function visit330_21_2(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['21'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['21'][1].init(29, 69, 'ch != "<" && ch != \'/\' && ch != \'=\'');
function visit329_21_1(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['20'][2].init(128, 9, 'ch != \'>\'');
function visit328_20_2(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['20'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['20'][1].init(29, 99, 'ch != \'>\' && ch != "<" && ch != \'/\' && ch != \'=\'');
function visit327_20_1(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['19'][2].init(97, 9, 'ch != "\'"');
function visit326_19_2(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['19'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['19'][1].init(29, 129, 'ch != "\'" && ch != \'>\' && ch != "<" && ch != \'/\' && ch != \'=\'');
function visit325_19_1(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['18'][2].init(66, 9, 'ch != \'"\'');
function visit324_18_2(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['18'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['18'][1].init(42, 159, 'ch != \'"\' && ch != "\'" && ch != \'>\' && ch != "<" && ch != \'/\' && ch != \'=\'');
function visit323_18_1(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['17'][1].init(21, 202, '!this.isWhitespace(ch) && ch != \'"\' && ch != "\'" && ch != \'>\' && ch != "<" && ch != \'/\' && ch != \'=\'');
function visit322_17_1(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['11'][7].init(60, 9, '\'Z\' >= ch');
function visit321_11_7(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['11'][7].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['11'][6].init(47, 9, '\'A\' <= ch');
function visit320_11_6(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['11'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['11'][5].init(47, 22, '\'A\' <= ch && \'Z\' >= ch');
function visit319_11_5(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['11'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['11'][4].init(34, 9, '\'z\' >= ch');
function visit318_11_4(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['11'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['11'][3].init(21, 9, '\'a\' <= ch');
function visit317_11_3(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['11'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['11'][2].init(21, 22, '\'a\' <= ch && \'z\' >= ch');
function visit316_11_2(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['11'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['11'][1].init(21, 48, '\'a\' <= ch && \'z\' >= ch || \'A\' <= ch && \'Z\' >= ch');
function visit315_11_1(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].lineData[5]++;
KISSY.add("html-parser/utils", function() {
  _$jscoverage['/html-parser/utils.js'].functionData[0]++;
  _$jscoverage['/html-parser/utils.js'].lineData[6]++;
  return {
  collapseWhitespace: function(str) {
  _$jscoverage['/html-parser/utils.js'].functionData[1]++;
  _$jscoverage['/html-parser/utils.js'].lineData[8]++;
  return str.replace(/[\s\xa0]+/g, ' ');
}, 
  isLetter: function(ch) {
  _$jscoverage['/html-parser/utils.js'].functionData[2]++;
  _$jscoverage['/html-parser/utils.js'].lineData[11]++;
  return visit315_11_1(visit316_11_2(visit317_11_3('a' <= ch) && visit318_11_4('z' >= ch)) || visit319_11_5(visit320_11_6('A' <= ch) && visit321_11_7('Z' >= ch)));
}, 
  isValidAttributeNameStartChar: function(ch) {
  _$jscoverage['/html-parser/utils.js'].functionData[3]++;
  _$jscoverage['/html-parser/utils.js'].lineData[17]++;
  return visit322_17_1(!this.isWhitespace(ch) && visit323_18_1(visit324_18_2(ch != '"') && visit325_19_1(visit326_19_2(ch != "'") && visit327_20_1(visit328_20_2(ch != '>') && visit329_21_1(visit330_21_2(ch != "<") && visit331_22_1(visit332_22_2(ch != '/') && visit333_23_1(ch != '=')))))));
}, 
  isWhitespace: function(ch) {
  _$jscoverage['/html-parser/utils.js'].functionData[4]++;
  _$jscoverage['/html-parser/utils.js'].lineData[37]++;
  return /^[\s\xa0]$/.test(ch);
}};
});
