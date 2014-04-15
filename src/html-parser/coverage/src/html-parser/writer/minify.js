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
  _$jscoverage['/html-parser/writer/minify.js'].lineData[10] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[18] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[19] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[22] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[23] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[25] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[26] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[29] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[32] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[35] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[38] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[39] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[42] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[43] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[70] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[71] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[74] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[75] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[78] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[79] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[93] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[94] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[105] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[106] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[109] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[110] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[113] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[114] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[115] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[117] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[118] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[119] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[121] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[124] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[125] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[130] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[131] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[143] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[144] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[145] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[146] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[149] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[154] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[155] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[156] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[164] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[165] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[166] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[168] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[175] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[176] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[177] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[179] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[186] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[187] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[191] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[197] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[200] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[203] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[205] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[206] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[210] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[212] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[214] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[217] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[224] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[225] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[227] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[229] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[233] = 0;
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
  _$jscoverage['/html-parser/writer/minify.js'].branchData['23'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['25'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['26'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['26'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['26'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['26'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['41'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['44'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['44'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['44'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['45'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['45'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['46'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['48'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['48'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['48'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['49'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['49'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['50'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['52'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['52'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['52'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['53'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['53'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['54'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['56'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['56'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['56'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['57'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['57'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['58'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['60'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['60'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['60'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['61'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['61'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['62'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['64'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['64'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['65'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['65'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['66'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['80'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['80'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['80'][3] = new BranchData();
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
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][4] = new BranchData();
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
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][5] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][6] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][5] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][6] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][5] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['95'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['95'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['95'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][4] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][5] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][6] = new BranchData();
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
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][4] = new BranchData();
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
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][5] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][6] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][7] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['108'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['109'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['113'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['115'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['118'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['154'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['165'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['176'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['194'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['197'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['203'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['212'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['212'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['225'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['225'][1] = new BranchData();
}
_$jscoverage['/html-parser/writer/minify.js'].branchData['225'][1].init(48, 11, '!self.inPre');
function visit533_225_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['212'][2].init(692, 40, 'value && canRemoveAttributeQuotes(value)');
function visit532_212_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['212'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['212'][1].init(690, 43, '!(value && canRemoveAttributeQuotes(value))');
function visit531_212_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['203'][1].init(395, 24, 'isBooleanAttribute(name)');
function visit530_203_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['197'][1].init(201, 131, 'canDeleteEmptyAttribute(el, attr) || isAttributeRedundant(el, attr)');
function visit529_197_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['194'][1].init(110, 16, 'attr.value || \'\'');
function visit528_194_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['176'][1].init(48, 20, 'el.tagName === \'pre\'');
function visit527_176_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['165'][1].init(48, 20, 'el.tagName === \'pre\'');
function visit526_165_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['154'][1].init(18, 26, 'isConditionalComment(text)');
function visit525_154_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['118'][1].init(578, 20, 'attrName === \'style\'');
function visit524_118_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['115'][1].init(425, 86, 'isUriTypeAttribute(attrName, tag) || isNumberTypeAttribute(attrName, tag)');
function visit523_115_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['113'][1].init(318, 20, 'attrName === \'class\'');
function visit522_113_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['109'][1].init(124, 26, 'isEventAttribute(attrName)');
function visit521_109_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['108'][1].init(82, 16, 'attr.value || \'\'');
function visit520_108_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['101'][7].init(119, 22, 'attrName === \'colspan\'');
function visit519_101_7(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][7].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['101'][6].init(93, 22, 'attrName === \'rowspan\'');
function visit518_101_6(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['101'][5].init(93, 48, 'attrName === \'rowspan\' || attrName === \'colspan\'');
function visit517_101_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['101'][4].init(75, 12, 'tag === \'td\'');
function visit516_101_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['101'][3].init(59, 12, 'tag === \'th\'');
function visit515_101_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['101'][2].init(59, 28, 'tag === \'th\' || tag === \'td\'');
function visit514_101_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['101'][1].init(59, 83, '(tag === \'th\' || tag === \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\')');
function visit513_101_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['100'][4].init(473, 19, 'attrName === \'span\'');
function visit512_100_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['100'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['100'][3].init(456, 13, 'tag === \'col\'');
function visit511_100_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['100'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['100'][2].init(456, 36, 'tag === \'col\' && attrName === \'span\'');
function visit510_100_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['100'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['100'][1].init(63, 144, '(tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag === \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit509_100_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['99'][4].init(413, 19, 'attrName === \'span\'');
function visit508_99_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['99'][3].init(391, 18, 'tag === \'colgroup\'');
function visit507_99_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['99'][2].init(391, 41, 'tag === \'colgroup\' && attrName === \'span\'');
function visit506_99_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['99'][1].init(87, 208, '(tag === \'colgroup\' && attrName === \'span\') || (tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag === \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit505_99_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['98'][3].init(302, 18, 'tag === \'textarea\'');
function visit504_98_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['98'][2].init(302, 65, 'tag === \'textarea\' && (/^(?:rows|cols|tabindex)$/).test(attrName)');
function visit503_98_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['98'][1].init(90, 296, '(tag === \'textarea\' && (/^(?:rows|cols|tabindex)$/).test(attrName)) || (tag === \'colgroup\' && attrName === \'span\') || (tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag === \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit502_98_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][6].init(254, 23, 'attrName === \'tabindex\'');
function visit501_97_6(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][5].init(231, 19, 'attrName === \'size\'');
function visit500_97_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][4].init(231, 46, 'attrName === \'size\' || attrName === \'tabindex\'');
function visit499_97_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][3].init(210, 16, 'tag === \'select\'');
function visit498_97_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][2].init(210, 68, 'tag === \'select\' && (attrName === \'size\' || attrName === \'tabindex\')');
function visit497_97_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][1].init(94, 387, '(tag === \'select\' && (attrName === \'size\' || attrName === \'tabindex\')) || (tag === \'textarea\' && (/^(?:rows|cols|tabindex)$/).test(attrName)) || (tag === \'colgroup\' && attrName === \'span\') || (tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag === \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit496_97_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['96'][6].init(162, 23, 'attrName === \'tabindex\'');
function visit495_96_6(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['96'][5].init(134, 24, 'attrName === \'maxlength\'');
function visit494_96_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['96'][4].init(134, 51, 'attrName === \'maxlength\' || attrName === \'tabindex\'');
function visit493_96_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['96'][3].init(114, 15, 'tag === \'input\'');
function visit492_96_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['96'][2].init(114, 72, 'tag === \'input\' && (attrName === \'maxlength\' || attrName === \'tabindex\')');
function visit491_96_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['96'][1].init(88, 482, '(tag === \'input\' && (attrName === \'maxlength\' || attrName === \'tabindex\')) || (tag === \'select\' && (attrName === \'size\' || attrName === \'tabindex\')) || (tag === \'textarea\' && (/^(?:rows|cols|tabindex)$/).test(attrName)) || (tag === \'colgroup\' && attrName === \'span\') || (tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag === \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit490_96_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['95'][3].init(67, 23, 'attrName === \'tabindex\'');
function visit489_95_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['95'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['95'][2].init(24, 66, '(/^(?:a|area|object|button)$/).test(tag) && attrName === \'tabindex\'');
function visit488_95_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['95'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['95'][1].init(-1, 571, '((/^(?:a|area|object|button)$/).test(tag) && attrName === \'tabindex\') || (tag === \'input\' && (attrName === \'maxlength\' || attrName === \'tabindex\')) || (tag === \'select\' && (attrName === \'size\' || attrName === \'tabindex\')) || (tag === \'textarea\' && (/^(?:rows|cols|tabindex)$/).test(attrName)) || (tag === \'colgroup\' && attrName === \'span\') || (tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag === \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit487_95_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['89'][5].init(105, 18, 'attrName === \'for\'');
function visit486_89_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['89'][4].init(83, 18, 'attrName === \'src\'');
function visit485_89_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['89'][3].init(83, 40, 'attrName === \'src\' || attrName === \'for\'');
function visit484_89_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['89'][2].init(62, 16, 'tag === \'script\'');
function visit483_89_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['89'][1].init(62, 62, 'tag === \'script\' && (attrName === \'src\' || attrName === \'for\')');
function visit482_89_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['88'][4].init(661, 22, 'attrName === \'profile\'');
function visit481_88_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['88'][3].init(643, 14, 'tag === \'head\'');
function visit480_88_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['88'][2].init(643, 40, 'tag === \'head\' && attrName === \'profile\'');
function visit479_88_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['88'][1].init(86, 126, '(tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit478_88_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['87'][6].init(597, 21, 'attrName === \'usemap\'');
function visit477_87_6(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['87'][5].init(575, 18, 'attrName === \'src\'');
function visit476_87_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['87'][4].init(575, 43, 'attrName === \'src\' || attrName === \'usemap\'');
function visit475_87_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['87'][3].init(555, 15, 'tag === \'input\'');
function visit474_87_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['87'][2].init(555, 64, 'tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')');
function visit473_87_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['87'][1].init(61, 213, '(tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit472_87_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['86'][4].init(510, 21, 'attrName === \'action\'');
function visit471_86_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['86'][3].init(492, 14, 'tag === \'form\'');
function visit470_86_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['86'][2].init(492, 39, 'tag === \'form\' && attrName === \'action\'');
function visit469_86_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['86'][1].init(76, 275, '(tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit468_86_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['85'][6].init(449, 19, 'attrName === \'cite\'');
function visit467_85_6(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['85'][5].init(431, 13, 'tag === \'del\'');
function visit466_85_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['85'][4].init(414, 13, 'tag === \'ins\'');
function visit465_85_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['85'][3].init(414, 30, 'tag === \'ins\' || tag === \'del\'');
function visit464_85_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['85'][2].init(414, 54, '(tag === \'ins\' || tag === \'del\') && attrName === \'cite\'');
function visit463_85_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['85'][1].init(66, 352, '((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit462_85_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['84'][4].init(370, 19, 'attrName === \'cite\'');
function visit461_84_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['84'][3].init(346, 20, 'tag === \'blockquote\'');
function visit460_84_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['84'][2].init(346, 43, 'tag === \'blockquote\' && attrName === \'cite\'');
function visit459_84_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['84'][1].init(56, 419, '(tag === \'blockquote\' && attrName === \'cite\') || ((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit458_84_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['83'][4].init(303, 19, 'attrName === \'cite\'');
function visit457_83_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['83'][3].init(288, 11, 'tag === \'q\'');
function visit456_83_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['83'][2].init(288, 34, 'tag === \'q\' && attrName === \'cite\'');
function visit455_83_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['83'][1].init(95, 476, '(tag === \'q\' && attrName === \'cite\') || (tag === \'blockquote\' && attrName === \'cite\') || ((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit454_83_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['82'][3].init(191, 16, 'tag === \'object\'');
function visit453_82_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['82'][2].init(191, 73, 'tag === \'object\' && (/^(?:classid|codebase|data|usemap)$/).test(attrName)');
function visit452_82_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['82'][1].init(83, 572, '(tag === \'object\' && (/^(?:classid|codebase|data|usemap)$/).test(attrName)) || (tag === \'q\' && attrName === \'cite\') || (tag === \'blockquote\' && attrName === \'cite\') || ((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit451_82_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['81'][3].init(106, 13, 'tag === \'img\'');
function visit450_81_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['81'][2].init(106, 61, 'tag === \'img\' && (/^(?:src|longdesc|usemap)$/).test(attrName)');
function visit449_81_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['81'][1].init(80, 656, '(tag === \'img\' && (/^(?:src|longdesc|usemap)$/).test(attrName)) || (tag === \'object\' && (/^(?:classid|codebase|data|usemap)$/).test(attrName)) || (tag === \'q\' && attrName === \'cite\') || (tag === \'blockquote\' && attrName === \'cite\') || ((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit448_81_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['80'][3].init(63, 19, 'attrName === \'href\'');
function visit447_80_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['80'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['80'][2].init(24, 58, '(/^(?:a|area|link|base)$/).test(tag) && attrName === \'href\'');
function visit446_80_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['80'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['80'][1].init(-1, 737, '((/^(?:a|area|link|base)$/).test(tag) && attrName === \'href\') || (tag === \'img\' && (/^(?:src|longdesc|usemap)$/).test(attrName)) || (tag === \'object\' && (/^(?:classid|codebase|data|usemap)$/).test(attrName)) || (tag === \'q\' && attrName === \'cite\') || (tag === \'blockquote\' && attrName === \'cite\') || ((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit445_80_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['66'][1].init(44, 20, 'attrValue === \'rect\'');
function visit444_66_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['65'][2].init(173, 20, 'attrName === \'shape\'');
function visit443_65_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['65'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['65'][1].init(38, 65, 'attrName === \'shape\' && attrValue === \'rect\'');
function visit442_65_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['64'][2].init(132, 14, 'tag === \'area\'');
function visit441_64_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['64'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['64'][1].init(132, 104, 'tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\'');
function visit440_64_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['62'][1].init(43, 24, 'attrValue === \'text/css\'');
function visit439_62_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['61'][2].init(41, 19, 'attrName === \'type\'');
function visit438_61_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['61'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['61'][1].init(39, 68, 'attrName === \'type\' && attrValue === \'text/css\'');
function visit437_61_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['60'][3].init(558, 15, 'tag === \'style\'');
function visit436_60_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['60'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['60'][2].init(558, 108, 'tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\'');
function visit435_60_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['60'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['60'][1].init(140, 238, '(tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\') || (tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\')');
function visit434_60_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['58'][1].init(43, 31, 'attrValue === \'text/javascript\'');
function visit433_58_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['57'][2].init(42, 19, 'attrName === \'type\'');
function visit432_57_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['57'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['57'][1].init(40, 75, 'attrName === \'type\' && attrValue === \'text/javascript\'');
function visit431_57_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['56'][3].init(416, 16, 'tag === \'script\'');
function visit430_56_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['56'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['56'][2].init(416, 116, 'tag === \'script\' && attrName === \'type\' && attrValue === \'text/javascript\'');
function visit429_56_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['56'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['56'][1].init(128, 379, '(tag === \'script\' && attrName === \'type\' && attrValue === \'text/javascript\') || (tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\') || (tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\')');
function visit428_56_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['54'][1].init(43, 20, 'attrValue === \'text\'');
function visit427_54_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['53'][2].init(41, 19, 'attrName === \'type\'');
function visit426_53_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['53'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['53'][1].init(39, 64, 'attrName === \'type\' && attrValue === \'text\'');
function visit425_53_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['52'][3].init(286, 15, 'tag === \'input\'');
function visit424_52_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['52'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['52'][2].init(286, 104, 'tag === \'input\' && attrName === \'type\' && attrValue === \'text\'');
function visit423_52_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['52'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['52'][1].init(128, 508, '(tag === \'input\' && attrName === \'type\' && attrValue === \'text\') || (tag === \'script\' && attrName === \'type\' && attrValue === \'text/javascript\') || (tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\') || (tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\')');
function visit422_52_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['50'][1].init(45, 19, 'attrValue === \'get\'');
function visit421_50_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['49'][2].init(40, 21, 'attrName === \'method\'');
function visit420_49_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['49'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['49'][1].init(38, 65, 'attrName === \'method\' && attrValue === \'get\'');
function visit419_49_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['48'][3].init(156, 14, 'tag === \'form\'');
function visit418_48_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['48'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['48'][2].init(156, 104, 'tag === \'form\' && attrName === \'method\' && attrValue === \'get\'');
function visit417_48_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['48'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['48'][1].init(131, 637, '(tag === \'form\' && attrName === \'method\' && attrValue === \'get\') || (tag === \'input\' && attrName === \'type\' && attrValue === \'text\') || (tag === \'script\' && attrName === \'type\' && attrValue === \'text/javascript\') || (tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\') || (tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\')');
function visit416_48_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['46'][1].init(43, 26, 'attrValue === \'javascript\'');
function visit415_46_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['45'][2].init(38, 23, 'attrName === \'language\'');
function visit414_45_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['45'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['45'][1].init(36, 70, 'attrName === \'language\' && attrValue === \'javascript\'');
function visit413_45_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['44'][3].init(23, 16, 'tag === \'script\'');
function visit412_44_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['44'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['44'][2].init(23, 107, 'tag === \'script\' && attrName === \'language\' && attrValue === \'javascript\'');
function visit411_44_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['44'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['44'][1].init(-1, 769, '(tag === \'script\' && attrName === \'language\' && attrValue === \'javascript\') || (tag === \'form\' && attrName === \'method\' && attrValue === \'get\') || (tag === \'input\' && attrName === \'type\' && attrValue === \'text\') || (tag === \'script\' && attrName === \'type\' && attrValue === \'text/javascript\') || (tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\') || (tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\')');
function visit410_44_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['41'][1].init(82, 16, 'attr.value || \'\'');
function visit409_41_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['26'][4].init(42, 20, 'attrName === \'value\'');
function visit408_26_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['26'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['26'][3].init(23, 15, 'tag === \'input\'');
function visit407_26_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['26'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['26'][2].init(23, 39, 'tag === \'input\' && attrName === \'value\'');
function visit406_26_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['26'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['26'][1].init(23, 92, '(tag === \'input\' && attrName === \'value\') || reEmptyAttribute.test(attrName)');
function visit405_26_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['25'][1].init(92, 16, '!trim(attrValue)');
function visit404_25_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['23'][1].init(26, 16, 'attr.value || \'\'');
function visit403_23_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[0]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[7]++;
  var BasicWriter = require('./basic');
  _$jscoverage['/html-parser/writer/minify.js'].lineData[8]++;
  var Utils = require('../utils');
  _$jscoverage['/html-parser/writer/minify.js'].lineData[10]++;
  var trim = S.trim, isBooleanAttribute = Utils.isBooleanAttribute, collapseWhitespace = Utils.collapseWhitespace, reEmptyAttribute = new RegExp('^(?:class|id|style|title|lang|dir|on' + '(?:focus|blur|change|click|dblclick|mouse(' + '?:down|up|over|move|out)|key(?:press|down|up)))$');
  _$jscoverage['/html-parser/writer/minify.js'].lineData[18]++;
  function escapeAttrValue(str) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[1]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[19]++;
    return String(str).replace(/"/g, '&quote;');
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[22]++;
  function canDeleteEmptyAttribute(tag, attr) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[2]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[23]++;
    var attrValue = visit403_23_1(attr.value || ''), attrName = attr.name;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[25]++;
    if (visit404_25_1(!trim(attrValue))) {
      _$jscoverage['/html-parser/writer/minify.js'].lineData[26]++;
      return (visit405_26_1((visit406_26_2(visit407_26_3(tag === 'input') && visit408_26_4(attrName === 'value'))) || reEmptyAttribute.test(attrName)));
    }
    _$jscoverage['/html-parser/writer/minify.js'].lineData[29]++;
    return 0;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[32]++;
  function canRemoveAttributeQuotes(value) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[3]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[35]++;
    return !(/[ "'=<>`]/).test(value);
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[38]++;
  function isAttributeRedundant(el, attr) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[4]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[39]++;
    var tag = el.nodeName, attrName = attr.name, attrValue = visit409_41_1(attr.value || '');
    _$jscoverage['/html-parser/writer/minify.js'].lineData[42]++;
    attrValue = trim(attrValue.toLowerCase());
    _$jscoverage['/html-parser/writer/minify.js'].lineData[43]++;
    return (visit410_44_1((visit411_44_2(visit412_44_3(tag === 'script') && visit413_45_1(visit414_45_2(attrName === 'language') && visit415_46_1(attrValue === 'javascript')))) || visit416_48_1((visit417_48_2(visit418_48_3(tag === 'form') && visit419_49_1(visit420_49_2(attrName === 'method') && visit421_50_1(attrValue === 'get')))) || visit422_52_1((visit423_52_2(visit424_52_3(tag === 'input') && visit425_53_1(visit426_53_2(attrName === 'type') && visit427_54_1(attrValue === 'text')))) || visit428_56_1((visit429_56_2(visit430_56_3(tag === 'script') && visit431_57_1(visit432_57_2(attrName === 'type') && visit433_58_1(attrValue === 'text/javascript')))) || visit434_60_1((visit435_60_2(visit436_60_3(tag === 'style') && visit437_61_1(visit438_61_2(attrName === 'type') && visit439_62_1(attrValue === 'text/css')))) || (visit440_64_1(visit441_64_2(tag === 'area') && visit442_65_1(visit443_65_2(attrName === 'shape') && visit444_66_1(attrValue === 'rect'))))))))));
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[70]++;
  function isConditionalComment(text) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[5]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[71]++;
    return (/\[if[^\]]+\]/).test(text);
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[74]++;
  function isEventAttribute(attrName) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[6]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[75]++;
    return (/^on[a-z]+/).test(attrName);
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[78]++;
  function isUriTypeAttribute(attrName, tag) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[7]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[79]++;
    return (visit445_80_1((visit446_80_2((/^(?:a|area|link|base)$/).test(tag) && visit447_80_3(attrName === 'href'))) || visit448_81_1((visit449_81_2(visit450_81_3(tag === 'img') && (/^(?:src|longdesc|usemap)$/).test(attrName))) || visit451_82_1((visit452_82_2(visit453_82_3(tag === 'object') && (/^(?:classid|codebase|data|usemap)$/).test(attrName))) || visit454_83_1((visit455_83_2(visit456_83_3(tag === 'q') && visit457_83_4(attrName === 'cite'))) || visit458_84_1((visit459_84_2(visit460_84_3(tag === 'blockquote') && visit461_84_4(attrName === 'cite'))) || visit462_85_1((visit463_85_2((visit464_85_3(visit465_85_4(tag === 'ins') || visit466_85_5(tag === 'del'))) && visit467_85_6(attrName === 'cite'))) || visit468_86_1((visit469_86_2(visit470_86_3(tag === 'form') && visit471_86_4(attrName === 'action'))) || visit472_87_1((visit473_87_2(visit474_87_3(tag === 'input') && (visit475_87_4(visit476_87_5(attrName === 'src') || visit477_87_6(attrName === 'usemap'))))) || visit478_88_1((visit479_88_2(visit480_88_3(tag === 'head') && visit481_88_4(attrName === 'profile'))) || (visit482_89_1(visit483_89_2(tag === 'script') && (visit484_89_3(visit485_89_4(attrName === 'src') || visit486_89_5(attrName === 'for')))))))))))))));
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[93]++;
  function isNumberTypeAttribute(attrName, tag) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[8]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[94]++;
    return (visit487_95_1((visit488_95_2((/^(?:a|area|object|button)$/).test(tag) && visit489_95_3(attrName === 'tabindex'))) || visit490_96_1((visit491_96_2(visit492_96_3(tag === 'input') && (visit493_96_4(visit494_96_5(attrName === 'maxlength') || visit495_96_6(attrName === 'tabindex'))))) || visit496_97_1((visit497_97_2(visit498_97_3(tag === 'select') && (visit499_97_4(visit500_97_5(attrName === 'size') || visit501_97_6(attrName === 'tabindex'))))) || visit502_98_1((visit503_98_2(visit504_98_3(tag === 'textarea') && (/^(?:rows|cols|tabindex)$/).test(attrName))) || visit505_99_1((visit506_99_2(visit507_99_3(tag === 'colgroup') && visit508_99_4(attrName === 'span'))) || visit509_100_1((visit510_100_2(visit511_100_3(tag === 'col') && visit512_100_4(attrName === 'span'))) || (visit513_101_1((visit514_101_2(visit515_101_3(tag === 'th') || visit516_101_4(tag === 'td'))) && (visit517_101_5(visit518_101_6(attrName === 'rowspan') || visit519_101_7(attrName === 'colspan'))))))))))));
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[105]++;
  function cleanAttributeValue(el, attr) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[9]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[106]++;
    var tag = el.nodeName, attrName = attr.name, attrValue = visit520_108_1(attr.value || '');
    _$jscoverage['/html-parser/writer/minify.js'].lineData[109]++;
    if (visit521_109_1(isEventAttribute(attrName))) {
      _$jscoverage['/html-parser/writer/minify.js'].lineData[110]++;
      attrValue = trim(attrValue).replace(/^javascript:[\s\xa0]*/i, '').replace(/[\s\xa0]*;$/, '');
    } else {
      _$jscoverage['/html-parser/writer/minify.js'].lineData[113]++;
      if (visit522_113_1(attrName === 'class')) {
        _$jscoverage['/html-parser/writer/minify.js'].lineData[114]++;
        attrValue = collapseWhitespace(trim(attrValue));
      } else {
        _$jscoverage['/html-parser/writer/minify.js'].lineData[115]++;
        if (visit523_115_1(isUriTypeAttribute(attrName, tag) || isNumberTypeAttribute(attrName, tag))) {
          _$jscoverage['/html-parser/writer/minify.js'].lineData[117]++;
          attrValue = trim(attrValue);
        } else {
          _$jscoverage['/html-parser/writer/minify.js'].lineData[118]++;
          if (visit524_118_1(attrName === 'style')) {
            _$jscoverage['/html-parser/writer/minify.js'].lineData[119]++;
            attrValue = trim(attrValue).replace(/[\s\xa0]*;[\s\xa0]*$/, '');
          }
        }
      }
    }
    _$jscoverage['/html-parser/writer/minify.js'].lineData[121]++;
    return attrValue;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[124]++;
  function cleanConditionalComment(comment) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[10]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[125]++;
    return comment.replace(/^(\[[^\]]+\]>)[\s\xa0]*/, '$1').replace(/[\s\xa0]*(<!\[endif\])$/, '$1');
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[130]++;
  function removeCDATASections(text) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[11]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[131]++;
    return trim(text).replace(/^(?:[\s\xa0]*\/\*[\s\xa0]*<!\[CDATA\[[\s\xa0]*\*\/|[\s\xa0]*\/\/[\s\xa0]*<!\[CDATA\[.*)/, '').replace(/(?:\/\*[\s\xa0]*\]\]>[\s\xa0]*\*\/|\/\/[\s\xa0]*\]\]>)[\s\xa0]*$/, '');
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[143]++;
  function MinifyWriter() {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[12]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[144]++;
    var self = this;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[145]++;
    MinifyWriter.superclass.constructor.apply(self, arguments);
    _$jscoverage['/html-parser/writer/minify.js'].lineData[146]++;
    self.inPre = 0;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[149]++;
  S.extend(MinifyWriter, BasicWriter, {
  comment: function(text) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[13]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[154]++;
  if (visit525_154_1(isConditionalComment(text))) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[155]++;
    text = cleanConditionalComment(text);
    _$jscoverage['/html-parser/writer/minify.js'].lineData[156]++;
    MinifyWriter.superclass.comment.call(this, text);
  }
}, 
  openTag: function(el) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[14]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[164]++;
  var self = this;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[165]++;
  if (visit526_165_1(el.tagName === 'pre')) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[166]++;
    self.inPre = 1;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[168]++;
  MinifyWriter.superclass.openTag.apply(self, arguments);
}, 
  closeTag: function(el) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[15]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[175]++;
  var self = this;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[176]++;
  if (visit527_176_1(el.tagName === 'pre')) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[177]++;
    self.inPre = 0;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[179]++;
  MinifyWriter.superclass.closeTag.apply(self, arguments);
}, 
  cdata: function(cdata) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[16]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[186]++;
  cdata = removeCDATASections(cdata);
  _$jscoverage['/html-parser/writer/minify.js'].lineData[187]++;
  MinifyWriter.superclass.cdata.call(this, cdata);
}, 
  attribute: function(attr, el) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[17]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[191]++;
  var self = this, name = attr.name, normalizedValue, value = visit528_194_1(attr.value || '');
  _$jscoverage['/html-parser/writer/minify.js'].lineData[197]++;
  if (visit529_197_1(canDeleteEmptyAttribute(el, attr) || isAttributeRedundant(el, attr))) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[200]++;
    return;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[203]++;
  if (visit530_203_1(isBooleanAttribute(name))) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[205]++;
    self.append(' ', name);
    _$jscoverage['/html-parser/writer/minify.js'].lineData[206]++;
    return;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[210]++;
  normalizedValue = escapeAttrValue(cleanAttributeValue(el, attr));
  _$jscoverage['/html-parser/writer/minify.js'].lineData[212]++;
  if (visit531_212_1(!(visit532_212_2(value && canRemoveAttributeQuotes(value))))) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[214]++;
    normalizedValue = '"' + normalizedValue + '"';
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[217]++;
  self.append(' ', name, '=', normalizedValue);
}, 
  text: function(text) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[18]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[224]++;
  var self = this;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[225]++;
  if (visit533_225_1(!self.inPre)) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[227]++;
    text = collapseWhitespace(text);
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[229]++;
  self.append(text);
}});
  _$jscoverage['/html-parser/writer/minify.js'].lineData[233]++;
  return MinifyWriter;
});
