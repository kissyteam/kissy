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
if (! _$jscoverage['/control/render-xtpl.js']) {
  _$jscoverage['/control/render-xtpl.js'] = {};
  _$jscoverage['/control/render-xtpl.js'].lineData = [];
  _$jscoverage['/control/render-xtpl.js'].lineData[3] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[12] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[13] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[14] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[15] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[16] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[17] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[18] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[19] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[74] = 0;
}
if (! _$jscoverage['/control/render-xtpl.js'].functionData) {
  _$jscoverage['/control/render-xtpl.js'].functionData = [];
  _$jscoverage['/control/render-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/control/render-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/control/render-xtpl.js'].functionData[2] = 0;
  _$jscoverage['/control/render-xtpl.js'].functionData[3] = 0;
  _$jscoverage['/control/render-xtpl.js'].functionData[4] = 0;
}
if (! _$jscoverage['/control/render-xtpl.js'].branchData) {
  _$jscoverage['/control/render-xtpl.js'].branchData = {};
}
_$jscoverage['/control/render-xtpl.js'].lineData[3]++;
KISSY.add('component/control/render-xtpl', function() {
  _$jscoverage['/control/render-xtpl.js'].functionData[0]++;
  _$jscoverage['/control/render-xtpl.js'].lineData[4]++;
  return function(scopes, S, undefined) {
  _$jscoverage['/control/render-xtpl.js'].functionData[1]++;
  _$jscoverage['/control/render-xtpl.js'].lineData[5]++;
  var buffer = "", config = this.config, engine = this, utils = config.utils;
  _$jscoverage['/control/render-xtpl.js'].lineData[9]++;
  var runBlockCommandUtil = utils["runBlockCommand"], getExpressionUtil = utils["getExpression"], getPropertyOrRunCommandUtil = utils["getPropertyOrRunCommand"];
  _$jscoverage['/control/render-xtpl.js'].lineData[12]++;
  buffer += '<div id="';
  _$jscoverage['/control/render-xtpl.js'].lineData[13]++;
  var id0 = getPropertyOrRunCommandUtil(engine, scopes, {}, "id", 0, 1, undefined, false);
  _$jscoverage['/control/render-xtpl.js'].lineData[14]++;
  buffer += getExpressionUtil(id0, true);
  _$jscoverage['/control/render-xtpl.js'].lineData[15]++;
  buffer += '"\r\n class="';
  _$jscoverage['/control/render-xtpl.js'].lineData[16]++;
  var config2 = {};
  _$jscoverage['/control/render-xtpl.js'].lineData[17]++;
  var params3 = [];
  _$jscoverage['/control/render-xtpl.js'].lineData[18]++;
  params3.push('');
  _$jscoverage['/control/render-xtpl.js'].lineData[19]++;
  config2.params = params3;
  _$jscoverage['/control/render-xtpl.js'].lineData[20]++;
  var id1 = getPropertyOrRunCommandUtil(engine, scopes, config2, "getBaseCssClasses", 0, 2, true, undefined);
  _$jscoverage['/control/render-xtpl.js'].lineData[21]++;
  buffer += id1;
  _$jscoverage['/control/render-xtpl.js'].lineData[22]++;
  buffer += '\r\n';
  _$jscoverage['/control/render-xtpl.js'].lineData[23]++;
  var config4 = {};
  _$jscoverage['/control/render-xtpl.js'].lineData[24]++;
  var params5 = [];
  _$jscoverage['/control/render-xtpl.js'].lineData[25]++;
  var id6 = getPropertyOrRunCommandUtil(engine, scopes, {}, "elCls", 0, 3, undefined, true);
  _$jscoverage['/control/render-xtpl.js'].lineData[26]++;
  params5.push(id6);
  _$jscoverage['/control/render-xtpl.js'].lineData[27]++;
  config4.params = params5;
  _$jscoverage['/control/render-xtpl.js'].lineData[28]++;
  config4.fn = function(scopes) {
  _$jscoverage['/control/render-xtpl.js'].functionData[2]++;
  _$jscoverage['/control/render-xtpl.js'].lineData[29]++;
  var buffer = "";
  _$jscoverage['/control/render-xtpl.js'].lineData[30]++;
  buffer += '\r\n ';
  _$jscoverage['/control/render-xtpl.js'].lineData[31]++;
  var id7 = getPropertyOrRunCommandUtil(engine, scopes, {}, ".", 0, 4, undefined, false);
  _$jscoverage['/control/render-xtpl.js'].lineData[32]++;
  buffer += getExpressionUtil(id7, true);
  _$jscoverage['/control/render-xtpl.js'].lineData[33]++;
  buffer += '  \r\n';
  _$jscoverage['/control/render-xtpl.js'].lineData[34]++;
  return buffer;
};
  _$jscoverage['/control/render-xtpl.js'].lineData[36]++;
  buffer += runBlockCommandUtil(engine, scopes, config4, "each", 3);
  _$jscoverage['/control/render-xtpl.js'].lineData[37]++;
  buffer += '\r\n"\r\n\r\n';
  _$jscoverage['/control/render-xtpl.js'].lineData[38]++;
  var config8 = {};
  _$jscoverage['/control/render-xtpl.js'].lineData[39]++;
  var params9 = [];
  _$jscoverage['/control/render-xtpl.js'].lineData[40]++;
  var id10 = getPropertyOrRunCommandUtil(engine, scopes, {}, "elAttrs", 0, 8, undefined, true);
  _$jscoverage['/control/render-xtpl.js'].lineData[41]++;
  params9.push(id10);
  _$jscoverage['/control/render-xtpl.js'].lineData[42]++;
  config8.params = params9;
  _$jscoverage['/control/render-xtpl.js'].lineData[43]++;
  config8.fn = function(scopes) {
  _$jscoverage['/control/render-xtpl.js'].functionData[3]++;
  _$jscoverage['/control/render-xtpl.js'].lineData[44]++;
  var buffer = "";
  _$jscoverage['/control/render-xtpl.js'].lineData[45]++;
  buffer += ' \r\n ';
  _$jscoverage['/control/render-xtpl.js'].lineData[46]++;
  var id11 = getPropertyOrRunCommandUtil(engine, scopes, {}, "xindex", 0, 9, undefined, false);
  _$jscoverage['/control/render-xtpl.js'].lineData[47]++;
  buffer += getExpressionUtil(id11, true);
  _$jscoverage['/control/render-xtpl.js'].lineData[48]++;
  buffer += '="';
  _$jscoverage['/control/render-xtpl.js'].lineData[49]++;
  var id12 = getPropertyOrRunCommandUtil(engine, scopes, {}, ".", 0, 9, undefined, false);
  _$jscoverage['/control/render-xtpl.js'].lineData[50]++;
  buffer += getExpressionUtil(id12, true);
  _$jscoverage['/control/render-xtpl.js'].lineData[51]++;
  buffer += '"\r\n';
  _$jscoverage['/control/render-xtpl.js'].lineData[52]++;
  return buffer;
};
  _$jscoverage['/control/render-xtpl.js'].lineData[54]++;
  buffer += runBlockCommandUtil(engine, scopes, config8, "each", 8);
  _$jscoverage['/control/render-xtpl.js'].lineData[55]++;
  buffer += '\r\n\r\nstyle="\r\n';
  _$jscoverage['/control/render-xtpl.js'].lineData[56]++;
  var config13 = {};
  _$jscoverage['/control/render-xtpl.js'].lineData[57]++;
  var params14 = [];
  _$jscoverage['/control/render-xtpl.js'].lineData[58]++;
  var id15 = getPropertyOrRunCommandUtil(engine, scopes, {}, "elStyle", 0, 13, undefined, true);
  _$jscoverage['/control/render-xtpl.js'].lineData[59]++;
  params14.push(id15);
  _$jscoverage['/control/render-xtpl.js'].lineData[60]++;
  config13.params = params14;
  _$jscoverage['/control/render-xtpl.js'].lineData[61]++;
  config13.fn = function(scopes) {
  _$jscoverage['/control/render-xtpl.js'].functionData[4]++;
  _$jscoverage['/control/render-xtpl.js'].lineData[62]++;
  var buffer = "";
  _$jscoverage['/control/render-xtpl.js'].lineData[63]++;
  buffer += ' \r\n ';
  _$jscoverage['/control/render-xtpl.js'].lineData[64]++;
  var id16 = getPropertyOrRunCommandUtil(engine, scopes, {}, "xindex", 0, 14, undefined, false);
  _$jscoverage['/control/render-xtpl.js'].lineData[65]++;
  buffer += getExpressionUtil(id16, true);
  _$jscoverage['/control/render-xtpl.js'].lineData[66]++;
  buffer += ':';
  _$jscoverage['/control/render-xtpl.js'].lineData[67]++;
  var id17 = getPropertyOrRunCommandUtil(engine, scopes, {}, ".", 0, 14, undefined, false);
  _$jscoverage['/control/render-xtpl.js'].lineData[68]++;
  buffer += getExpressionUtil(id17, true);
  _$jscoverage['/control/render-xtpl.js'].lineData[69]++;
  buffer += ';\r\n';
  _$jscoverage['/control/render-xtpl.js'].lineData[70]++;
  return buffer;
};
  _$jscoverage['/control/render-xtpl.js'].lineData[72]++;
  buffer += runBlockCommandUtil(engine, scopes, config13, "each", 13);
  _$jscoverage['/control/render-xtpl.js'].lineData[73]++;
  buffer += '\r\n">';
  _$jscoverage['/control/render-xtpl.js'].lineData[74]++;
  return buffer;
};
});
