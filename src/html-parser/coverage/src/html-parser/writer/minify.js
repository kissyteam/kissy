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
if (! _$jscoverage['/html-parser/writer/minify.js']) {
  _$jscoverage['/html-parser/writer/minify.js'] = {};
  _$jscoverage['/html-parser/writer/minify.js'].lineData = [];
  _$jscoverage['/html-parser/writer/minify.js'].lineData[6] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[7] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[8] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[9] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[11] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[19] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[20] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[23] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[24] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[26] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[27] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[30] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[33] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[36] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[39] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[40] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[43] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[44] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[71] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[72] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[75] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[76] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[79] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[80] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[94] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[95] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[106] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[107] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[110] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[111] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[114] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[115] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[116] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[118] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[119] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[120] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[122] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[125] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[126] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[131] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[132] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[144] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[145] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[146] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[147] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[150] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[155] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[156] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[157] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[165] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[166] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[167] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[169] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[176] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[177] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[178] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[180] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[187] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[188] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[192] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[198] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[201] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[204] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[206] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[207] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[211] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[213] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[215] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[218] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[225] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[226] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[228] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[230] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[234] = 0;
}
if (! _$jscoverage['/html-parser/writer/minify.js'].functionData) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData = [];
  _$jscoverage['/html-parser/writer/minify.js'].functionData[0] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[1] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[2] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[3] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[4] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[5] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[6] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[7] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[8] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[9] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[10] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[11] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[12] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[13] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[14] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[15] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[16] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[17] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].functionData[18] = 0;
}
if (! _$jscoverage['/html-parser/writer/minify.js'].branchData) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData = {};
  _$jscoverage['/html-parser/writer/minify.js'].branchData['24'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['26'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['27'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['27'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['27'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['27'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['42'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['45'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['45'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['45'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['46'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['46'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['47'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['49'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['49'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['49'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['50'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['50'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['51'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['53'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['53'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['53'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['54'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['54'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['55'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['57'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['57'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['57'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['58'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['58'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['59'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['61'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['61'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['61'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['62'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['62'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['63'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['65'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['65'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['66'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['66'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['67'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][5] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][6] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][5] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][6] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['90'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['90'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['90'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['90'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['90'][5] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][5] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][6] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][5] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][6] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['100'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['100'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['100'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['100'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][5] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][6] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][7] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['109'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['110'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['114'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['116'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['119'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['155'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['166'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['177'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['195'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['198'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['204'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['213'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['213'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['226'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['226'][1] = new BranchData();
}
_$jscoverage['/html-parser/writer/minify.js'].branchData['226'][1].init(48, 11, '!self.inPre');
function visit532_226_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['213'][2].init(692, 40, 'value && canRemoveAttributeQuotes(value)');
function visit531_213_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['213'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['213'][1].init(690, 43, '!(value && canRemoveAttributeQuotes(value))');
function visit530_213_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['204'][1].init(395, 24, 'isBooleanAttribute(name)');
function visit529_204_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['198'][1].init(201, 131, 'canDeleteEmptyAttribute(el, attr) || isAttributeRedundant(el, attr)');
function visit528_198_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['195'][1].init(110, 16, 'attr.value || \'\'');
function visit527_195_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['177'][1].init(48, 20, 'el.tagName === \'pre\'');
function visit526_177_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['166'][1].init(48, 20, 'el.tagName === \'pre\'');
function visit525_166_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['155'][1].init(18, 26, 'isConditionalComment(text)');
function visit524_155_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['119'][1].init(578, 20, 'attrName === \'style\'');
function visit523_119_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['116'][1].init(425, 86, 'isUriTypeAttribute(attrName, tag) || isNumberTypeAttribute(attrName, tag)');
function visit522_116_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['114'][1].init(318, 20, 'attrName === \'class\'');
function visit521_114_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['110'][1].init(124, 26, 'isEventAttribute(attrName)');
function visit520_110_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['109'][1].init(82, 16, 'attr.value || \'\'');
function visit519_109_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['102'][7].init(115, 22, 'attrName === \'colspan\'');
function visit518_102_7(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][7].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['102'][6].init(89, 22, 'attrName === \'rowspan\'');
function visit517_102_6(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['102'][5].init(89, 48, 'attrName === \'rowspan\' || attrName === \'colspan\'');
function visit516_102_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['102'][4].init(71, 12, 'tag === \'td\'');
function visit515_102_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['102'][3].init(55, 12, 'tag === \'th\'');
function visit514_102_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['102'][2].init(55, 28, 'tag === \'th\' || tag === \'td\'');
function visit513_102_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['102'][1].init(55, 83, '(tag === \'th\' || tag === \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\')');
function visit512_102_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['101'][4].init(453, 19, 'attrName === \'span\'');
function visit511_101_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['101'][3].init(436, 13, 'tag === \'col\'');
function visit510_101_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['101'][2].init(436, 36, 'tag === \'col\' && attrName === \'span\'');
function visit509_101_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['101'][1].init(59, 140, '(tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag === \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit508_101_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['100'][4].init(397, 19, 'attrName === \'span\'');
function visit507_100_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['100'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['100'][3].init(375, 18, 'tag === \'colgroup\'');
function visit506_100_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['100'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['100'][2].init(375, 41, 'tag === \'colgroup\' && attrName === \'span\'');
function visit505_100_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['100'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['100'][1].init(83, 200, '(tag === \'colgroup\' && attrName === \'span\') || (tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag === \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit504_100_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['99'][3].init(290, 18, 'tag === \'textarea\'');
function visit503_99_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['99'][2].init(290, 65, 'tag === \'textarea\' && (/^(?:rows|cols|tabindex)$/).test(attrName)');
function visit502_99_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['99'][1].init(86, 284, '(tag === \'textarea\' && (/^(?:rows|cols|tabindex)$/).test(attrName)) || (tag === \'colgroup\' && attrName === \'span\') || (tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag === \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit501_99_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['98'][6].init(246, 23, 'attrName === \'tabindex\'');
function visit500_98_6(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['98'][5].init(223, 19, 'attrName === \'size\'');
function visit499_98_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['98'][4].init(223, 46, 'attrName === \'size\' || attrName === \'tabindex\'');
function visit498_98_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['98'][3].init(202, 16, 'tag === \'select\'');
function visit497_98_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['98'][2].init(202, 68, 'tag === \'select\' && (attrName === \'size\' || attrName === \'tabindex\')');
function visit496_98_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['98'][1].init(90, 371, '(tag === \'select\' && (attrName === \'size\' || attrName === \'tabindex\')) || (tag === \'textarea\' && (/^(?:rows|cols|tabindex)$/).test(attrName)) || (tag === \'colgroup\' && attrName === \'span\') || (tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag === \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit495_98_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][6].init(158, 23, 'attrName === \'tabindex\'');
function visit494_97_6(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][5].init(130, 24, 'attrName === \'maxlength\'');
function visit493_97_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][4].init(130, 51, 'attrName === \'maxlength\' || attrName === \'tabindex\'');
function visit492_97_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][3].init(110, 15, 'tag === \'input\'');
function visit491_97_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][2].init(110, 72, 'tag === \'input\' && (attrName === \'maxlength\' || attrName === \'tabindex\')');
function visit490_97_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][1].init(84, 462, '(tag === \'input\' && (attrName === \'maxlength\' || attrName === \'tabindex\')) || (tag === \'select\' && (attrName === \'size\' || attrName === \'tabindex\')) || (tag === \'textarea\' && (/^(?:rows|cols|tabindex)$/).test(attrName)) || (tag === \'colgroup\' && attrName === \'span\') || (tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag === \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit489_97_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['96'][3].init(67, 23, 'attrName === \'tabindex\'');
function visit488_96_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['96'][2].init(24, 66, '(/^(?:a|area|object|button)$/).test(tag) && attrName === \'tabindex\'');
function visit487_96_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['96'][1].init(-1, 547, '((/^(?:a|area|object|button)$/).test(tag) && attrName === \'tabindex\') || (tag === \'input\' && (attrName === \'maxlength\' || attrName === \'tabindex\')) || (tag === \'select\' && (attrName === \'size\' || attrName === \'tabindex\')) || (tag === \'textarea\' && (/^(?:rows|cols|tabindex)$/).test(attrName)) || (tag === \'colgroup\' && attrName === \'span\') || (tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag === \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit486_96_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['90'][5].init(101, 18, 'attrName === \'for\'');
function visit485_90_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['90'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['90'][4].init(79, 18, 'attrName === \'src\'');
function visit484_90_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['90'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['90'][3].init(79, 40, 'attrName === \'src\' || attrName === \'for\'');
function visit483_90_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['90'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['90'][2].init(58, 16, 'tag === \'script\'');
function visit482_90_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['90'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['90'][1].init(58, 62, 'tag === \'script\' && (attrName === \'src\' || attrName === \'for\')');
function visit481_90_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['89'][4].init(629, 22, 'attrName === \'profile\'');
function visit480_89_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['89'][3].init(611, 14, 'tag === \'head\'');
function visit479_89_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['89'][2].init(611, 40, 'tag === \'head\' && attrName === \'profile\'');
function visit478_89_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['89'][1].init(82, 122, '(tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit477_89_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['88'][6].init(569, 21, 'attrName === \'usemap\'');
function visit476_88_6(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['88'][5].init(547, 18, 'attrName === \'src\'');
function visit475_88_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['88'][4].init(547, 43, 'attrName === \'src\' || attrName === \'usemap\'');
function visit474_88_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['88'][3].init(527, 15, 'tag === \'input\'');
function visit473_88_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['88'][2].init(527, 64, 'tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')');
function visit472_88_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['88'][1].init(57, 205, '(tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit471_88_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['87'][4].init(486, 21, 'attrName === \'action\'');
function visit470_87_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['87'][3].init(468, 14, 'tag === \'form\'');
function visit469_87_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['87'][2].init(468, 39, 'tag === \'form\' && attrName === \'action\'');
function visit468_87_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['87'][1].init(72, 263, '(tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit467_87_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['86'][6].init(429, 19, 'attrName === \'cite\'');
function visit466_86_6(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['86'][5].init(411, 13, 'tag === \'del\'');
function visit465_86_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['86'][4].init(394, 13, 'tag === \'ins\'');
function visit464_86_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['86'][3].init(394, 30, 'tag === \'ins\' || tag === \'del\'');
function visit463_86_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['86'][2].init(394, 54, '(tag === \'ins\' || tag === \'del\') && attrName === \'cite\'');
function visit462_86_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['86'][1].init(62, 336, '((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit461_86_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['85'][4].init(354, 19, 'attrName === \'cite\'');
function visit460_85_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['85'][3].init(330, 20, 'tag === \'blockquote\'');
function visit459_85_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['85'][2].init(330, 43, 'tag === \'blockquote\' && attrName === \'cite\'');
function visit458_85_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['85'][1].init(52, 399, '(tag === \'blockquote\' && attrName === \'cite\') || ((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit457_85_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['84'][4].init(291, 19, 'attrName === \'cite\'');
function visit456_84_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['84'][3].init(276, 11, 'tag === \'q\'');
function visit455_84_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['84'][2].init(276, 34, 'tag === \'q\' && attrName === \'cite\'');
function visit454_84_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['84'][1].init(91, 452, '(tag === \'q\' && attrName === \'cite\') || (tag === \'blockquote\' && attrName === \'cite\') || ((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit453_84_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['83'][3].init(183, 16, 'tag === \'object\'');
function visit452_83_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['83'][2].init(183, 73, 'tag === \'object\' && (/^(?:classid|codebase|data|usemap)$/).test(attrName)');
function visit451_83_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['83'][1].init(79, 544, '(tag === \'object\' && (/^(?:classid|codebase|data|usemap)$/).test(attrName)) || (tag === \'q\' && attrName === \'cite\') || (tag === \'blockquote\' && attrName === \'cite\') || ((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit450_83_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['82'][3].init(102, 13, 'tag === \'img\'');
function visit449_82_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['82'][2].init(102, 61, 'tag === \'img\' && (/^(?:src|longdesc|usemap)$/).test(attrName)');
function visit448_82_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['82'][1].init(76, 624, '(tag === \'img\' && (/^(?:src|longdesc|usemap)$/).test(attrName)) || (tag === \'object\' && (/^(?:classid|codebase|data|usemap)$/).test(attrName)) || (tag === \'q\' && attrName === \'cite\') || (tag === \'blockquote\' && attrName === \'cite\') || ((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit447_82_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['81'][3].init(63, 19, 'attrName === \'href\'');
function visit446_81_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['81'][2].init(24, 58, '(/^(?:a|area|link|base)$/).test(tag) && attrName === \'href\'');
function visit445_81_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['81'][1].init(-1, 701, '((/^(?:a|area|link|base)$/).test(tag) && attrName === \'href\') || (tag === \'img\' && (/^(?:src|longdesc|usemap)$/).test(attrName)) || (tag === \'object\' && (/^(?:classid|codebase|data|usemap)$/).test(attrName)) || (tag === \'q\' && attrName === \'cite\') || (tag === \'blockquote\' && attrName === \'cite\') || ((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit444_81_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['67'][1].init(40, 20, 'attrValue === \'rect\'');
function visit443_67_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['66'][2].init(157, 20, 'attrName === \'shape\'');
function visit442_66_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['66'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['66'][1].init(34, 61, 'attrName === \'shape\' && attrValue === \'rect\'');
function visit441_66_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['65'][2].init(120, 14, 'tag === \'area\'');
function visit440_65_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['65'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['65'][1].init(120, 96, 'tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\'');
function visit439_65_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['63'][1].init(39, 24, 'attrValue === \'text/css\'');
function visit438_63_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['62'][2].init(37, 19, 'attrName === \'type\'');
function visit437_62_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['62'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['62'][1].init(35, 64, 'attrName === \'type\' && attrValue === \'text/css\'');
function visit436_62_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['61'][3].init(518, 15, 'tag === \'style\'');
function visit435_61_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['61'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['61'][2].init(518, 100, 'tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\'');
function visit434_61_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['61'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['61'][1].init(128, 218, '(tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\') || (tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\')');
function visit433_61_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['59'][1].init(39, 31, 'attrValue === \'text/javascript\'');
function visit432_59_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['58'][2].init(38, 19, 'attrName === \'type\'');
function visit431_58_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['58'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['58'][1].init(36, 71, 'attrName === \'type\' && attrValue === \'text/javascript\'');
function visit430_58_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['57'][3].init(388, 16, 'tag === \'script\'');
function visit429_57_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['57'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['57'][2].init(388, 108, 'tag === \'script\' && attrName === \'type\' && attrValue === \'text/javascript\'');
function visit428_57_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['57'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['57'][1].init(116, 347, '(tag === \'script\' && attrName === \'type\' && attrValue === \'text/javascript\') || (tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\') || (tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\')');
function visit427_57_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['55'][1].init(39, 20, 'attrValue === \'text\'');
function visit426_55_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['54'][2].init(37, 19, 'attrName === \'type\'');
function visit425_54_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['54'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['54'][1].init(35, 60, 'attrName === \'type\' && attrValue === \'text\'');
function visit424_54_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['53'][3].init(270, 15, 'tag === \'input\'');
function visit423_53_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['53'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['53'][2].init(270, 96, 'tag === \'input\' && attrName === \'type\' && attrValue === \'text\'');
function visit422_53_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['53'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['53'][1].init(116, 464, '(tag === \'input\' && attrName === \'type\' && attrValue === \'text\') || (tag === \'script\' && attrName === \'type\' && attrValue === \'text/javascript\') || (tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\') || (tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\')');
function visit421_53_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['51'][1].init(41, 19, 'attrValue === \'get\'');
function visit420_51_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['50'][2].init(36, 21, 'attrName === \'method\'');
function visit419_50_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['50'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['50'][1].init(34, 61, 'attrName === \'method\' && attrValue === \'get\'');
function visit418_50_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['49'][3].init(152, 14, 'tag === \'form\'');
function visit417_49_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['49'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['49'][2].init(152, 96, 'tag === \'form\' && attrName === \'method\' && attrValue === \'get\'');
function visit416_49_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['49'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['49'][1].init(127, 581, '(tag === \'form\' && attrName === \'method\' && attrValue === \'get\') || (tag === \'input\' && attrName === \'type\' && attrValue === \'text\') || (tag === \'script\' && attrName === \'type\' && attrValue === \'text/javascript\') || (tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\') || (tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\')');
function visit415_49_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['47'][1].init(43, 26, 'attrValue === \'javascript\'');
function visit414_47_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['46'][2].init(38, 23, 'attrName === \'language\'');
function visit413_46_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['46'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['46'][1].init(36, 70, 'attrName === \'language\' && attrValue === \'javascript\'');
function visit412_46_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['45'][3].init(23, 16, 'tag === \'script\'');
function visit411_45_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['45'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['45'][2].init(23, 107, 'tag === \'script\' && attrName === \'language\' && attrValue === \'javascript\'');
function visit410_45_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['45'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['45'][1].init(-1, 709, '(tag === \'script\' && attrName === \'language\' && attrValue === \'javascript\') || (tag === \'form\' && attrName === \'method\' && attrValue === \'get\') || (tag === \'input\' && attrName === \'type\' && attrValue === \'text\') || (tag === \'script\' && attrName === \'type\' && attrValue === \'text/javascript\') || (tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\') || (tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\')');
function visit409_45_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['42'][1].init(82, 16, 'attr.value || \'\'');
function visit408_42_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['27'][4].init(42, 20, 'attrName === \'value\'');
function visit407_27_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['27'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['27'][3].init(23, 15, 'tag === \'input\'');
function visit406_27_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['27'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['27'][2].init(23, 39, 'tag === \'input\' && attrName === \'value\'');
function visit405_27_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['27'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['27'][1].init(23, 92, '(tag === \'input\' && attrName === \'value\') || reEmptyAttribute.test(attrName)');
function visit404_27_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['26'][1].init(92, 16, '!trim(attrValue)');
function visit403_26_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['24'][1].init(26, 16, 'attr.value || \'\'');
function visit402_24_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[0]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[7]++;
  var BasicWriter = require('./basic');
  _$jscoverage['/html-parser/writer/minify.js'].lineData[8]++;
  var Utils = require('../utils');
  _$jscoverage['/html-parser/writer/minify.js'].lineData[9]++;
  var util = require('util');
  _$jscoverage['/html-parser/writer/minify.js'].lineData[11]++;
  var trim = util.trim, isBooleanAttribute = Utils.isBooleanAttribute, collapseWhitespace = Utils.collapseWhitespace, reEmptyAttribute = new RegExp('^(?:class|id|style|title|lang|dir|on' + '(?:focus|blur|change|click|dblclick|mouse(' + '?:down|up|over|move|out)|key(?:press|down|up)))$');
  _$jscoverage['/html-parser/writer/minify.js'].lineData[19]++;
  function escapeAttrValue(str) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[1]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[20]++;
    return String(str).replace(/"/g, '&quot;');
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[23]++;
  function canDeleteEmptyAttribute(tag, attr) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[2]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[24]++;
    var attrValue = visit402_24_1(attr.value || ''), attrName = attr.name;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[26]++;
    if (visit403_26_1(!trim(attrValue))) {
      _$jscoverage['/html-parser/writer/minify.js'].lineData[27]++;
      return (visit404_27_1((visit405_27_2(visit406_27_3(tag === 'input') && visit407_27_4(attrName === 'value'))) || reEmptyAttribute.test(attrName)));
    }
    _$jscoverage['/html-parser/writer/minify.js'].lineData[30]++;
    return 0;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[33]++;
  function canRemoveAttributeQuotes(value) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[3]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[36]++;
    return !(/[ "'=<>`]/).test(value);
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[39]++;
  function isAttributeRedundant(el, attr) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[4]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[40]++;
    var tag = el.nodeName, attrName = attr.name, attrValue = visit408_42_1(attr.value || '');
    _$jscoverage['/html-parser/writer/minify.js'].lineData[43]++;
    attrValue = trim(attrValue.toLowerCase());
    _$jscoverage['/html-parser/writer/minify.js'].lineData[44]++;
    return (visit409_45_1((visit410_45_2(visit411_45_3(tag === 'script') && visit412_46_1(visit413_46_2(attrName === 'language') && visit414_47_1(attrValue === 'javascript')))) || visit415_49_1((visit416_49_2(visit417_49_3(tag === 'form') && visit418_50_1(visit419_50_2(attrName === 'method') && visit420_51_1(attrValue === 'get')))) || visit421_53_1((visit422_53_2(visit423_53_3(tag === 'input') && visit424_54_1(visit425_54_2(attrName === 'type') && visit426_55_1(attrValue === 'text')))) || visit427_57_1((visit428_57_2(visit429_57_3(tag === 'script') && visit430_58_1(visit431_58_2(attrName === 'type') && visit432_59_1(attrValue === 'text/javascript')))) || visit433_61_1((visit434_61_2(visit435_61_3(tag === 'style') && visit436_62_1(visit437_62_2(attrName === 'type') && visit438_63_1(attrValue === 'text/css')))) || (visit439_65_1(visit440_65_2(tag === 'area') && visit441_66_1(visit442_66_2(attrName === 'shape') && visit443_67_1(attrValue === 'rect'))))))))));
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[71]++;
  function isConditionalComment(text) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[5]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[72]++;
    return (/\[if[^\]]+\]/).test(text);
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[75]++;
  function isEventAttribute(attrName) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[6]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[76]++;
    return (/^on[a-z]+/).test(attrName);
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[79]++;
  function isUriTypeAttribute(attrName, tag) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[7]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[80]++;
    return (visit444_81_1((visit445_81_2((/^(?:a|area|link|base)$/).test(tag) && visit446_81_3(attrName === 'href'))) || visit447_82_1((visit448_82_2(visit449_82_3(tag === 'img') && (/^(?:src|longdesc|usemap)$/).test(attrName))) || visit450_83_1((visit451_83_2(visit452_83_3(tag === 'object') && (/^(?:classid|codebase|data|usemap)$/).test(attrName))) || visit453_84_1((visit454_84_2(visit455_84_3(tag === 'q') && visit456_84_4(attrName === 'cite'))) || visit457_85_1((visit458_85_2(visit459_85_3(tag === 'blockquote') && visit460_85_4(attrName === 'cite'))) || visit461_86_1((visit462_86_2((visit463_86_3(visit464_86_4(tag === 'ins') || visit465_86_5(tag === 'del'))) && visit466_86_6(attrName === 'cite'))) || visit467_87_1((visit468_87_2(visit469_87_3(tag === 'form') && visit470_87_4(attrName === 'action'))) || visit471_88_1((visit472_88_2(visit473_88_3(tag === 'input') && (visit474_88_4(visit475_88_5(attrName === 'src') || visit476_88_6(attrName === 'usemap'))))) || visit477_89_1((visit478_89_2(visit479_89_3(tag === 'head') && visit480_89_4(attrName === 'profile'))) || (visit481_90_1(visit482_90_2(tag === 'script') && (visit483_90_3(visit484_90_4(attrName === 'src') || visit485_90_5(attrName === 'for')))))))))))))));
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[94]++;
  function isNumberTypeAttribute(attrName, tag) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[8]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[95]++;
    return (visit486_96_1((visit487_96_2((/^(?:a|area|object|button)$/).test(tag) && visit488_96_3(attrName === 'tabindex'))) || visit489_97_1((visit490_97_2(visit491_97_3(tag === 'input') && (visit492_97_4(visit493_97_5(attrName === 'maxlength') || visit494_97_6(attrName === 'tabindex'))))) || visit495_98_1((visit496_98_2(visit497_98_3(tag === 'select') && (visit498_98_4(visit499_98_5(attrName === 'size') || visit500_98_6(attrName === 'tabindex'))))) || visit501_99_1((visit502_99_2(visit503_99_3(tag === 'textarea') && (/^(?:rows|cols|tabindex)$/).test(attrName))) || visit504_100_1((visit505_100_2(visit506_100_3(tag === 'colgroup') && visit507_100_4(attrName === 'span'))) || visit508_101_1((visit509_101_2(visit510_101_3(tag === 'col') && visit511_101_4(attrName === 'span'))) || (visit512_102_1((visit513_102_2(visit514_102_3(tag === 'th') || visit515_102_4(tag === 'td'))) && (visit516_102_5(visit517_102_6(attrName === 'rowspan') || visit518_102_7(attrName === 'colspan'))))))))))));
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[106]++;
  function cleanAttributeValue(el, attr) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[9]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[107]++;
    var tag = el.nodeName, attrName = attr.name, attrValue = visit519_109_1(attr.value || '');
    _$jscoverage['/html-parser/writer/minify.js'].lineData[110]++;
    if (visit520_110_1(isEventAttribute(attrName))) {
      _$jscoverage['/html-parser/writer/minify.js'].lineData[111]++;
      attrValue = trim(attrValue).replace(/^javascript:[\s\xa0]*/i, '').replace(/[\s\xa0]*;$/, '');
    } else {
      _$jscoverage['/html-parser/writer/minify.js'].lineData[114]++;
      if (visit521_114_1(attrName === 'class')) {
        _$jscoverage['/html-parser/writer/minify.js'].lineData[115]++;
        attrValue = collapseWhitespace(trim(attrValue));
      } else {
        _$jscoverage['/html-parser/writer/minify.js'].lineData[116]++;
        if (visit522_116_1(isUriTypeAttribute(attrName, tag) || isNumberTypeAttribute(attrName, tag))) {
          _$jscoverage['/html-parser/writer/minify.js'].lineData[118]++;
          attrValue = trim(attrValue);
        } else {
          _$jscoverage['/html-parser/writer/minify.js'].lineData[119]++;
          if (visit523_119_1(attrName === 'style')) {
            _$jscoverage['/html-parser/writer/minify.js'].lineData[120]++;
            attrValue = trim(attrValue).replace(/[\s\xa0]*;[\s\xa0]*$/, '');
          }
        }
      }
    }
    _$jscoverage['/html-parser/writer/minify.js'].lineData[122]++;
    return attrValue;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[125]++;
  function cleanConditionalComment(comment) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[10]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[126]++;
    return comment.replace(/^(\[[^\]]+\]>)[\s\xa0]*/, '$1').replace(/[\s\xa0]*(<!\[endif\])$/, '$1');
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[131]++;
  function removeCDATASections(text) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[11]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[132]++;
    return trim(text).replace(/^(?:[\s\xa0]*\/\*[\s\xa0]*<!\[CDATA\[[\s\xa0]*\*\/|[\s\xa0]*\/\/[\s\xa0]*<!\[CDATA\[.*)/, '').replace(/(?:\/\*[\s\xa0]*\]\]>[\s\xa0]*\*\/|\/\/[\s\xa0]*\]\]>)[\s\xa0]*$/, '');
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[144]++;
  function MinifyWriter() {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[12]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[145]++;
    var self = this;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[146]++;
    MinifyWriter.superclass.constructor.apply(self, arguments);
    _$jscoverage['/html-parser/writer/minify.js'].lineData[147]++;
    self.inPre = 0;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[150]++;
  util.extend(MinifyWriter, BasicWriter, {
  comment: function(text) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[13]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[155]++;
  if (visit524_155_1(isConditionalComment(text))) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[156]++;
    text = cleanConditionalComment(text);
    _$jscoverage['/html-parser/writer/minify.js'].lineData[157]++;
    MinifyWriter.superclass.comment.call(this, text);
  }
}, 
  openTag: function(el) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[14]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[165]++;
  var self = this;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[166]++;
  if (visit525_166_1(el.tagName === 'pre')) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[167]++;
    self.inPre = 1;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[169]++;
  MinifyWriter.superclass.openTag.apply(self, arguments);
}, 
  closeTag: function(el) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[15]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[176]++;
  var self = this;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[177]++;
  if (visit526_177_1(el.tagName === 'pre')) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[178]++;
    self.inPre = 0;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[180]++;
  MinifyWriter.superclass.closeTag.apply(self, arguments);
}, 
  cdata: function(cdata) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[16]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[187]++;
  cdata = removeCDATASections(cdata);
  _$jscoverage['/html-parser/writer/minify.js'].lineData[188]++;
  MinifyWriter.superclass.cdata.call(this, cdata);
}, 
  attribute: function(attr, el) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[17]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[192]++;
  var self = this, name = attr.name, normalizedValue, value = visit527_195_1(attr.value || '');
  _$jscoverage['/html-parser/writer/minify.js'].lineData[198]++;
  if (visit528_198_1(canDeleteEmptyAttribute(el, attr) || isAttributeRedundant(el, attr))) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[201]++;
    return;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[204]++;
  if (visit529_204_1(isBooleanAttribute(name))) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[206]++;
    self.append(' ', name);
    _$jscoverage['/html-parser/writer/minify.js'].lineData[207]++;
    return;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[211]++;
  normalizedValue = escapeAttrValue(cleanAttributeValue(el, attr));
  _$jscoverage['/html-parser/writer/minify.js'].lineData[213]++;
  if (visit530_213_1(!(visit531_213_2(value && canRemoveAttributeQuotes(value))))) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[215]++;
    normalizedValue = '"' + normalizedValue + '"';
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[218]++;
  self.append(' ', name, '=', normalizedValue);
}, 
  text: function(text) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[18]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[225]++;
  var self = this;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[226]++;
  if (visit532_226_1(!self.inPre)) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[228]++;
    text = collapseWhitespace(text);
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[230]++;
  self.append(text);
}});
  _$jscoverage['/html-parser/writer/minify.js'].lineData[234]++;
  return MinifyWriter;
});
