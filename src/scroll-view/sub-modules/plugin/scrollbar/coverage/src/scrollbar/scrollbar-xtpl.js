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
if (! _$jscoverage['/scrollbar/scrollbar-xtpl.js']) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'] = {};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[3] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[12] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[13] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[14] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[15] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[16] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[17] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[18] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[19] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[81] = 0;
}
if (! _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData[1] = 0;
}
if (! _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].branchData = {};
}
_$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[3]++;
KISSY.add('scroll-view/plugin/scrollbar/scrollbar-xtpl', function() {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData[0]++;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[4]++;
  return function(scopes, S, undefined) {
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].functionData[1]++;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[5]++;
  var buffer = "", config = this.config, engine = this, utils = config.utils;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[9]++;
  var runBlockCommandUtil = utils["runBlockCommand"], getExpressionUtil = utils["getExpression"], getPropertyOrRunCommandUtil = utils["getPropertyOrRunCommand"];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[12]++;
  buffer += '<div id="ks-scrollbar-arrow-up-';
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[13]++;
  var id0 = getPropertyOrRunCommandUtil(engine, scopes, {}, "id", 0, 1, undefined, false);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[14]++;
  buffer += getExpressionUtil(id0, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[15]++;
  buffer += '"\r\n        class="';
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[16]++;
  var config2 = {};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[17]++;
  var params3 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[18]++;
  var id4 = getPropertyOrRunCommandUtil(engine, scopes, {}, "axis", 0, 2, undefined, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[19]++;
  params3.push(id4 + ('-arrow-up'));
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[20]++;
  config2.params = params3;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[21]++;
  var id1 = getPropertyOrRunCommandUtil(engine, scopes, config2, "getBaseCssClasses", 0, 2, true, undefined);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[22]++;
  buffer += id1;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[23]++;
  buffer += '">\r\n    <a href="javascript:void(\'up\')">up</a>\r\n</div>\r\n<div id="ks-scrollbar-arrow-down-';
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[24]++;
  var id5 = getPropertyOrRunCommandUtil(engine, scopes, {}, "id", 0, 5, undefined, false);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[25]++;
  buffer += getExpressionUtil(id5, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[26]++;
  buffer += '"\r\n        class="';
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[27]++;
  var config7 = {};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[28]++;
  var params8 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[29]++;
  var id9 = getPropertyOrRunCommandUtil(engine, scopes, {}, "axis", 0, 6, undefined, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[30]++;
  params8.push(id9 + ('-arrow-down'));
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[31]++;
  config7.params = params8;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[32]++;
  var id6 = getPropertyOrRunCommandUtil(engine, scopes, config7, "getBaseCssClasses", 0, 6, true, undefined);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[33]++;
  buffer += id6;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[34]++;
  buffer += '">\r\n    <a href="javascript:void(\'down\')">down</a>\r\n</div>\r\n<div id="ks-scrollbar-track-';
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[35]++;
  var id10 = getPropertyOrRunCommandUtil(engine, scopes, {}, "id", 0, 9, undefined, false);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[36]++;
  buffer += getExpressionUtil(id10, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[37]++;
  buffer += '"\r\n     class="';
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[38]++;
  var config12 = {};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[39]++;
  var params13 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[40]++;
  var id14 = getPropertyOrRunCommandUtil(engine, scopes, {}, "axis", 0, 10, undefined, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[41]++;
  params13.push(id14 + ('-track'));
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[42]++;
  config12.params = params13;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[43]++;
  var id11 = getPropertyOrRunCommandUtil(engine, scopes, config12, "getBaseCssClasses", 0, 10, true, undefined);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[44]++;
  buffer += id11;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[45]++;
  buffer += '">\r\n<div id="ks-scrollbar-drag-';
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[46]++;
  var id15 = getPropertyOrRunCommandUtil(engine, scopes, {}, "id", 0, 11, undefined, false);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[47]++;
  buffer += getExpressionUtil(id15, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[48]++;
  buffer += '"\r\n     class="';
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[49]++;
  var config17 = {};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[50]++;
  var params18 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[51]++;
  var id19 = getPropertyOrRunCommandUtil(engine, scopes, {}, "axis", 0, 12, undefined, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[52]++;
  params18.push(id19 + ('-drag'));
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[53]++;
  config17.params = params18;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[54]++;
  var id16 = getPropertyOrRunCommandUtil(engine, scopes, config17, "getBaseCssClasses", 0, 12, true, undefined);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[55]++;
  buffer += id16;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[56]++;
  buffer += '">\r\n<div class="';
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[57]++;
  var config21 = {};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[58]++;
  var params22 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[59]++;
  var id23 = getPropertyOrRunCommandUtil(engine, scopes, {}, "axis", 0, 13, undefined, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[60]++;
  params22.push(id23 + ('-drag-top'));
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[61]++;
  config21.params = params22;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[62]++;
  var id20 = getPropertyOrRunCommandUtil(engine, scopes, config21, "getBaseCssClasses", 0, 13, true, undefined);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[63]++;
  buffer += id20;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[64]++;
  buffer += '">\r\n</div>\r\n<div class="';
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[65]++;
  var config25 = {};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[66]++;
  var params26 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[67]++;
  var id27 = getPropertyOrRunCommandUtil(engine, scopes, {}, "axis", 0, 15, undefined, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[68]++;
  params26.push(id27 + ('-drag-center'));
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[69]++;
  config25.params = params26;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[70]++;
  var id24 = getPropertyOrRunCommandUtil(engine, scopes, config25, "getBaseCssClasses", 0, 15, true, undefined);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[71]++;
  buffer += id24;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[72]++;
  buffer += '">\r\n</div>\r\n<div class="';
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[73]++;
  var config29 = {};
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[74]++;
  var params30 = [];
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[75]++;
  var id31 = getPropertyOrRunCommandUtil(engine, scopes, {}, "axis", 0, 17, undefined, true);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[76]++;
  params30.push(id31 + ('-drag-bottom'));
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[77]++;
  config29.params = params30;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[78]++;
  var id28 = getPropertyOrRunCommandUtil(engine, scopes, config29, "getBaseCssClasses", 0, 17, true, undefined);
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[79]++;
  buffer += id28;
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[80]++;
  buffer += '">\r\n</div>\r\n</div>\r\n</div>';
  _$jscoverage['/scrollbar/scrollbar-xtpl.js'].lineData[81]++;
  return buffer;
};
});
