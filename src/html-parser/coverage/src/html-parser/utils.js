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
  _$jscoverage['/html-parser/utils.js'].lineData[6] = 0;
  _$jscoverage['/html-parser/utils.js'].lineData[7] = 0;
  _$jscoverage['/html-parser/utils.js'].lineData[9] = 0;
  _$jscoverage['/html-parser/utils.js'].lineData[13] = 0;
  _$jscoverage['/html-parser/utils.js'].lineData[17] = 0;
  _$jscoverage['/html-parser/utils.js'].lineData[24] = 0;
  _$jscoverage['/html-parser/utils.js'].lineData[41] = 0;
}
if (! _$jscoverage['/html-parser/utils.js'].functionData) {
  _$jscoverage['/html-parser/utils.js'].functionData = [];
  _$jscoverage['/html-parser/utils.js'].functionData[0] = 0;
  _$jscoverage['/html-parser/utils.js'].functionData[1] = 0;
  _$jscoverage['/html-parser/utils.js'].functionData[2] = 0;
  _$jscoverage['/html-parser/utils.js'].functionData[3] = 0;
  _$jscoverage['/html-parser/utils.js'].functionData[4] = 0;
  _$jscoverage['/html-parser/utils.js'].functionData[5] = 0;
}
if (! _$jscoverage['/html-parser/utils.js'].branchData) {
  _$jscoverage['/html-parser/utils.js'].branchData = {};
  _$jscoverage['/html-parser/utils.js'].branchData['17'] = [];
  _$jscoverage['/html-parser/utils.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['17'][2] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['17'][3] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['17'][4] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['17'][5] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['17'][6] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['17'][7] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['24'] = [];
  _$jscoverage['/html-parser/utils.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['25'] = [];
  _$jscoverage['/html-parser/utils.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['25'][2] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['26'] = [];
  _$jscoverage['/html-parser/utils.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['26'][2] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['27'] = [];
  _$jscoverage['/html-parser/utils.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['27'][2] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['28'] = [];
  _$jscoverage['/html-parser/utils.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['28'][2] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['28'][3] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['29'] = [];
  _$jscoverage['/html-parser/utils.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['29'][2] = new BranchData();
  _$jscoverage['/html-parser/utils.js'].branchData['30'] = [];
  _$jscoverage['/html-parser/utils.js'].branchData['30'][1] = new BranchData();
}
_$jscoverage['/html-parser/utils.js'].branchData['30'][1].init(29, 10, 'ch !== \'=\'');
function visit343_30_1(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['29'][2].init(193, 10, 'ch !== \'/\'');
function visit342_29_2(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['29'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['29'][1].init(33, 40, 'ch !== \'/\' && ch !== \'=\'');
function visit341_29_1(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['28'][3].init(166, 7, '\'\' < \'\'');
function visit340_28_3(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['28'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['28'][2].init(158, 14, 'ch !== \'\' < \'\'');
function visit339_28_2(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['28'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['28'][1].init(29, 74, 'ch !== \'\' < \'\' && ch !== \'/\' && ch !== \'=\'');
function visit338_28_1(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['27'][2].init(127, 10, 'ch !== \'>\'');
function visit337_27_2(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['27'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['27'][1].init(30, 104, 'ch !== \'>\' && ch !== \'\' < \'\' && ch !== \'/\' && ch !== \'=\'');
function visit336_27_1(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['26'][2].init(95, 11, 'ch !== \'\\\'\'');
function visit335_26_2(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['26'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['26'][1].init(29, 135, 'ch !== \'\\\'\' && ch !== \'>\' && ch !== \'\' < \'\' && ch !== \'/\' && ch !== \'=\'');
function visit334_26_1(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['25'][2].init(64, 10, 'ch !== \'"\'');
function visit333_25_2(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['25'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['25'][1].init(41, 165, 'ch !== \'"\' && ch !== \'\\\'\' && ch !== \'>\' && ch !== \'\' < \'\' && ch !== \'/\' && ch !== \'=\'');
function visit332_25_1(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['24'][1].init(20, 207, '!this.isWhitespace(ch) && ch !== \'"\' && ch !== \'\\\'\' && ch !== \'>\' && ch !== \'\' < \'\' && ch !== \'/\' && ch !== \'=\'');
function visit331_24_1(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['17'][7].init(59, 9, '\'Z\' >= ch');
function visit330_17_7(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['17'][7].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['17'][6].init(46, 9, '\'A\' <= ch');
function visit329_17_6(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['17'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['17'][5].init(46, 22, '\'A\' <= ch && \'Z\' >= ch');
function visit328_17_5(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['17'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['17'][4].init(33, 9, '\'z\' >= ch');
function visit327_17_4(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['17'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['17'][3].init(20, 9, '\'a\' <= ch');
function visit326_17_3(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['17'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['17'][2].init(20, 22, '\'a\' <= ch && \'z\' >= ch');
function visit325_17_2(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['17'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].branchData['17'][1].init(20, 48, '\'a\' <= ch && \'z\' >= ch || \'A\' <= ch && \'Z\' >= ch');
function visit324_17_1(result) {
  _$jscoverage['/html-parser/utils.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/utils.js'].lineData[6]++;
KISSY.add(function() {
  _$jscoverage['/html-parser/utils.js'].functionData[0]++;
  _$jscoverage['/html-parser/utils.js'].lineData[7]++;
  return {
  isBooleanAttribute: function(attrName) {
  _$jscoverage['/html-parser/utils.js'].functionData[1]++;
  _$jscoverage['/html-parser/utils.js'].lineData[9]++;
  return (/^(?:checked|disabled|selected|readonly|defer|multiple|nohref|noshape|nowrap|noresize|compact|ismap)$/i).test(attrName);
}, 
  collapseWhitespace: function(str) {
  _$jscoverage['/html-parser/utils.js'].functionData[2]++;
  _$jscoverage['/html-parser/utils.js'].lineData[13]++;
  return str.replace(/[\s\xa0]+/g, ' ');
}, 
  isLetter: function(ch) {
  _$jscoverage['/html-parser/utils.js'].functionData[3]++;
  _$jscoverage['/html-parser/utils.js'].lineData[17]++;
  return visit324_17_1(visit325_17_2(visit326_17_3('a' <= ch) && visit327_17_4('z' >= ch)) || visit328_17_5(visit329_17_6('A' <= ch) && visit330_17_7('Z' >= ch)));
}, 
  isValidAttributeNameStartChar: function(ch) {
  _$jscoverage['/html-parser/utils.js'].functionData[4]++;
  _$jscoverage['/html-parser/utils.js'].lineData[24]++;
  return visit331_24_1(!this.isWhitespace(ch) && visit332_25_1(visit333_25_2(ch !== '"') && visit334_26_1(visit335_26_2(ch !== '\'') && visit336_27_1(visit337_27_2(ch !== '>') && visit338_28_1(visit339_28_2(ch !== visit340_28_3('' < '')) && visit341_29_1(visit342_29_2(ch !== '/') && visit343_30_1(ch !== '=')))))));
}, 
  isWhitespace: function(ch) {
  _$jscoverage['/html-parser/utils.js'].functionData[5]++;
  _$jscoverage['/html-parser/utils.js'].lineData[41]++;
  return /^[\s\xa0]$/.test(ch);
}};
});
