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
  _$jscoverage['/control/render-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[10] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[12] = 0;
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
  _$jscoverage['/control/render-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[39] = 0;
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
  _$jscoverage['/control/render-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[57] = 0;
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
  _$jscoverage['/control/render-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/control/render-xtpl.js'].lineData[79] = 0;
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
  _$jscoverage['/control/render-xtpl.js'].branchData['9'] = [];
  _$jscoverage['/control/render-xtpl.js'].branchData['9'][1] = new BranchData();
  _$jscoverage['/control/render-xtpl.js'].branchData['9'][2] = new BranchData();
}
_$jscoverage['/control/render-xtpl.js'].branchData['9'][2].init(165, 29, 'typeof module !== "undefined"');
function visit12_9_2(result) {
  _$jscoverage['/control/render-xtpl.js'].branchData['9'][2].ranCondition(result);
  return result;
}_$jscoverage['/control/render-xtpl.js'].branchData['9'][1].init(165, 45, 'typeof module !== "undefined" && module.kissy');
function visit11_9_1(result) {
  _$jscoverage['/control/render-xtpl.js'].branchData['9'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/control/render-xtpl.js'].functionData[0]++;
  _$jscoverage['/control/render-xtpl.js'].lineData[4]++;
  return function(scope, S, undefined) {
  _$jscoverage['/control/render-xtpl.js'].functionData[1]++;
  _$jscoverage['/control/render-xtpl.js'].lineData[5]++;
  var buffer = "", config = this.config, engine = this, moduleWrap, utils = config.utils;
  _$jscoverage['/control/render-xtpl.js'].lineData[9]++;
  if (visit11_9_1(visit12_9_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/control/render-xtpl.js'].lineData[10]++;
    moduleWrap = module;
  }
  _$jscoverage['/control/render-xtpl.js'].lineData[12]++;
  var runBlockCommandUtil = utils.runBlockCommand, renderOutputUtil = utils.renderOutput, getPropertyUtil = utils.getProperty, runInlineCommandUtil = utils.runInlineCommand, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
  _$jscoverage['/control/render-xtpl.js'].lineData[17]++;
  buffer += '<div id="';
  _$jscoverage['/control/render-xtpl.js'].lineData[18]++;
  var id0 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 1);
  _$jscoverage['/control/render-xtpl.js'].lineData[19]++;
  buffer += renderOutputUtil(id0, true);
  _$jscoverage['/control/render-xtpl.js'].lineData[20]++;
  buffer += '"\n class="';
  _$jscoverage['/control/render-xtpl.js'].lineData[21]++;
  var config2 = {};
  _$jscoverage['/control/render-xtpl.js'].lineData[22]++;
  var params3 = [];
  _$jscoverage['/control/render-xtpl.js'].lineData[23]++;
  params3.push('');
  _$jscoverage['/control/render-xtpl.js'].lineData[24]++;
  config2.params = params3;
  _$jscoverage['/control/render-xtpl.js'].lineData[25]++;
  var id1 = runInlineCommandUtil(engine, scope, config2, "getBaseCssClasses", 2);
  _$jscoverage['/control/render-xtpl.js'].lineData[26]++;
  buffer += renderOutputUtil(id1, true);
  _$jscoverage['/control/render-xtpl.js'].lineData[27]++;
  buffer += '\n';
  _$jscoverage['/control/render-xtpl.js'].lineData[28]++;
  var config4 = {};
  _$jscoverage['/control/render-xtpl.js'].lineData[29]++;
  var params5 = [];
  _$jscoverage['/control/render-xtpl.js'].lineData[30]++;
  var id6 = getPropertyUtil(engine, scope, "elCls", 0, 3);
  _$jscoverage['/control/render-xtpl.js'].lineData[31]++;
  params5.push(id6);
  _$jscoverage['/control/render-xtpl.js'].lineData[32]++;
  config4.params = params5;
  _$jscoverage['/control/render-xtpl.js'].lineData[33]++;
  config4.fn = function(scope) {
  _$jscoverage['/control/render-xtpl.js'].functionData[2]++;
  _$jscoverage['/control/render-xtpl.js'].lineData[34]++;
  var buffer = "";
  _$jscoverage['/control/render-xtpl.js'].lineData[35]++;
  buffer += '\n ';
  _$jscoverage['/control/render-xtpl.js'].lineData[36]++;
  var id7 = getPropertyOrRunCommandUtil(engine, scope, {}, ".", 0, 4);
  _$jscoverage['/control/render-xtpl.js'].lineData[37]++;
  buffer += renderOutputUtil(id7, true);
  _$jscoverage['/control/render-xtpl.js'].lineData[38]++;
  buffer += '  \n';
  _$jscoverage['/control/render-xtpl.js'].lineData[39]++;
  return buffer;
};
  _$jscoverage['/control/render-xtpl.js'].lineData[41]++;
  buffer += runBlockCommandUtil(engine, scope, config4, "each", 3);
  _$jscoverage['/control/render-xtpl.js'].lineData[42]++;
  buffer += '\n"\n\n';
  _$jscoverage['/control/render-xtpl.js'].lineData[43]++;
  var config8 = {};
  _$jscoverage['/control/render-xtpl.js'].lineData[44]++;
  var params9 = [];
  _$jscoverage['/control/render-xtpl.js'].lineData[45]++;
  var id10 = getPropertyUtil(engine, scope, "elAttrs", 0, 8);
  _$jscoverage['/control/render-xtpl.js'].lineData[46]++;
  params9.push(id10);
  _$jscoverage['/control/render-xtpl.js'].lineData[47]++;
  config8.params = params9;
  _$jscoverage['/control/render-xtpl.js'].lineData[48]++;
  config8.fn = function(scope) {
  _$jscoverage['/control/render-xtpl.js'].functionData[3]++;
  _$jscoverage['/control/render-xtpl.js'].lineData[49]++;
  var buffer = "";
  _$jscoverage['/control/render-xtpl.js'].lineData[50]++;
  buffer += ' \n ';
  _$jscoverage['/control/render-xtpl.js'].lineData[51]++;
  var id11 = getPropertyOrRunCommandUtil(engine, scope, {}, "xindex", 0, 9);
  _$jscoverage['/control/render-xtpl.js'].lineData[52]++;
  buffer += renderOutputUtil(id11, true);
  _$jscoverage['/control/render-xtpl.js'].lineData[53]++;
  buffer += '="';
  _$jscoverage['/control/render-xtpl.js'].lineData[54]++;
  var id12 = getPropertyOrRunCommandUtil(engine, scope, {}, ".", 0, 9);
  _$jscoverage['/control/render-xtpl.js'].lineData[55]++;
  buffer += renderOutputUtil(id12, true);
  _$jscoverage['/control/render-xtpl.js'].lineData[56]++;
  buffer += '"\n';
  _$jscoverage['/control/render-xtpl.js'].lineData[57]++;
  return buffer;
};
  _$jscoverage['/control/render-xtpl.js'].lineData[59]++;
  buffer += runBlockCommandUtil(engine, scope, config8, "each", 8);
  _$jscoverage['/control/render-xtpl.js'].lineData[60]++;
  buffer += '\n\nstyle="\n';
  _$jscoverage['/control/render-xtpl.js'].lineData[61]++;
  var config13 = {};
  _$jscoverage['/control/render-xtpl.js'].lineData[62]++;
  var params14 = [];
  _$jscoverage['/control/render-xtpl.js'].lineData[63]++;
  var id15 = getPropertyUtil(engine, scope, "elStyle", 0, 13);
  _$jscoverage['/control/render-xtpl.js'].lineData[64]++;
  params14.push(id15);
  _$jscoverage['/control/render-xtpl.js'].lineData[65]++;
  config13.params = params14;
  _$jscoverage['/control/render-xtpl.js'].lineData[66]++;
  config13.fn = function(scope) {
  _$jscoverage['/control/render-xtpl.js'].functionData[4]++;
  _$jscoverage['/control/render-xtpl.js'].lineData[67]++;
  var buffer = "";
  _$jscoverage['/control/render-xtpl.js'].lineData[68]++;
  buffer += ' \n ';
  _$jscoverage['/control/render-xtpl.js'].lineData[69]++;
  var id16 = getPropertyOrRunCommandUtil(engine, scope, {}, "xindex", 0, 14);
  _$jscoverage['/control/render-xtpl.js'].lineData[70]++;
  buffer += renderOutputUtil(id16, true);
  _$jscoverage['/control/render-xtpl.js'].lineData[71]++;
  buffer += ':';
  _$jscoverage['/control/render-xtpl.js'].lineData[72]++;
  var id17 = getPropertyOrRunCommandUtil(engine, scope, {}, ".", 0, 14);
  _$jscoverage['/control/render-xtpl.js'].lineData[73]++;
  buffer += renderOutputUtil(id17, true);
  _$jscoverage['/control/render-xtpl.js'].lineData[74]++;
  buffer += ';\n';
  _$jscoverage['/control/render-xtpl.js'].lineData[75]++;
  return buffer;
};
  _$jscoverage['/control/render-xtpl.js'].lineData[77]++;
  buffer += runBlockCommandUtil(engine, scope, config13, "each", 13);
  _$jscoverage['/control/render-xtpl.js'].lineData[78]++;
  buffer += '\n">';
  _$jscoverage['/control/render-xtpl.js'].lineData[79]++;
  return buffer;
};
});
