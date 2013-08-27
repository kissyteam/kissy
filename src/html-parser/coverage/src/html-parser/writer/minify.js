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
  _$jscoverage['/html-parser/writer/minify.js'].lineData[5] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[7] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[14] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[15] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[18] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[19] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[21] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[22] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[25] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[28] = 0;
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
  _$jscoverage['/html-parser/writer/minify.js'].lineData[114] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[115] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[117] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[119] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[121] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[122] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[124] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[127] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[128] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[133] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[134] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[141] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[142] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[143] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[144] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[147] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[152] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[153] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[154] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[162] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[163] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[164] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[166] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[173] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[174] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[175] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[177] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[184] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[185] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[189] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[195] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[198] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[201] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[203] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[204] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[208] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[210] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[213] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[216] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[223] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[224] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[226] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[228] = 0;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[232] = 0;
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
  _$jscoverage['/html-parser/writer/minify.js'].functionData[19] = 0;
}
if (! _$jscoverage['/html-parser/writer/minify.js'].branchData) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData = {};
  _$jscoverage['/html-parser/writer/minify.js'].branchData['19'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['21'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['22'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['22'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['22'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['22'][4] = new BranchData();
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
  _$jscoverage['/html-parser/writer/minify.js'].branchData['114'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['117'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['121'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['152'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['163'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['174'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['192'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['195'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['201'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['210'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/minify.js'].branchData['224'] = [];
  _$jscoverage['/html-parser/writer/minify.js'].branchData['224'][1] = new BranchData();
}
_$jscoverage['/html-parser/writer/minify.js'].branchData['224'][1].init(48, 11, '!self.inPre');
function visit521_224_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['210'][1].init(690, 40, 'value && canRemoveAttributeQuotes(value)');
function visit520_210_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['201'][1].init(395, 24, 'isBooleanAttribute(name)');
function visit519_201_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['195'][1].init(201, 131, 'canDeleteEmptyAttribute(el, attr) || isAttributeRedundant(el, attr)');
function visit518_195_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['192'][1].init(110, 16, 'attr.value || ""');
function visit517_192_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['174'][1].init(48, 19, 'el.tagName == \'pre\'');
function visit516_174_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['163'][1].init(48, 19, 'el.tagName == \'pre\'');
function visit515_163_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['152'][1].init(18, 26, 'isConditionalComment(text)');
function visit514_152_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['121'][1].init(605, 20, 'attrName === \'style\'');
function visit513_121_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['117'][1].init(443, 86, 'isUriTypeAttribute(attrName, tag) || isNumberTypeAttribute(attrName, tag)');
function visit512_117_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['114'][1].init(327, 20, 'attrName === \'class\'');
function visit511_114_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['109'][1].init(124, 26, 'isEventAttribute(attrName)');
function visit510_109_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['108'][1].init(82, 16, 'attr.value || ""');
function visit509_108_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['101'][7].init(118, 22, 'attrName === \'colspan\'');
function visit508_101_7(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][7].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['101'][6].init(92, 22, 'attrName === \'rowspan\'');
function visit507_101_6(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['101'][5].init(92, 48, 'attrName === \'rowspan\' || attrName === \'colspan\'');
function visit506_101_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['101'][4].init(75, 11, 'tag == \'td\'');
function visit505_101_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['101'][3].init(59, 12, 'tag === \'th\'');
function visit504_101_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['101'][2].init(59, 27, 'tag === \'th\' || tag == \'td\'');
function visit503_101_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['101'][1].init(59, 82, '(tag === \'th\' || tag == \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\')');
function visit502_101_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['100'][4].init(473, 19, 'attrName === \'span\'');
function visit501_100_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['100'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['100'][3].init(456, 13, 'tag === \'col\'');
function visit500_100_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['100'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['100'][2].init(456, 36, 'tag === \'col\' && attrName === \'span\'');
function visit499_100_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['100'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['100'][1].init(63, 143, '(tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag == \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit498_100_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['99'][4].init(413, 19, 'attrName === \'span\'');
function visit497_99_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['99'][3].init(391, 18, 'tag === \'colgroup\'');
function visit496_99_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['99'][2].init(391, 41, 'tag === \'colgroup\' && attrName === \'span\'');
function visit495_99_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['99'][1].init(87, 207, '(tag === \'colgroup\' && attrName === \'span\') || (tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag == \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit494_99_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['98'][3].init(302, 18, 'tag === \'textarea\'');
function visit493_98_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['98'][2].init(302, 65, 'tag === \'textarea\' && (/^(?:rows|cols|tabindex)$/).test(attrName)');
function visit492_98_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['98'][1].init(90, 295, '(tag === \'textarea\' && (/^(?:rows|cols|tabindex)$/).test(attrName)) || (tag === \'colgroup\' && attrName === \'span\') || (tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag == \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit491_98_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][6].init(254, 23, 'attrName === \'tabindex\'');
function visit490_97_6(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][5].init(231, 19, 'attrName === \'size\'');
function visit489_97_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][4].init(231, 46, 'attrName === \'size\' || attrName === \'tabindex\'');
function visit488_97_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][3].init(210, 16, 'tag === \'select\'');
function visit487_97_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][2].init(210, 68, 'tag === \'select\' && (attrName === \'size\' || attrName === \'tabindex\')');
function visit486_97_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['97'][1].init(94, 386, '(tag === \'select\' && (attrName === \'size\' || attrName === \'tabindex\')) || (tag === \'textarea\' && (/^(?:rows|cols|tabindex)$/).test(attrName)) || (tag === \'colgroup\' && attrName === \'span\') || (tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag == \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit485_97_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['96'][6].init(162, 23, 'attrName === \'tabindex\'');
function visit484_96_6(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['96'][5].init(134, 24, 'attrName === \'maxlength\'');
function visit483_96_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['96'][4].init(134, 51, 'attrName === \'maxlength\' || attrName === \'tabindex\'');
function visit482_96_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['96'][3].init(114, 15, 'tag === \'input\'');
function visit481_96_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['96'][2].init(114, 72, 'tag === \'input\' && (attrName === \'maxlength\' || attrName === \'tabindex\')');
function visit480_96_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['96'][1].init(88, 481, '(tag === \'input\' && (attrName === \'maxlength\' || attrName === \'tabindex\')) || (tag === \'select\' && (attrName === \'size\' || attrName === \'tabindex\')) || (tag === \'textarea\' && (/^(?:rows|cols|tabindex)$/).test(attrName)) || (tag === \'colgroup\' && attrName === \'span\') || (tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag == \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit479_96_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['95'][3].init(67, 23, 'attrName === \'tabindex\'');
function visit478_95_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['95'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['95'][2].init(24, 66, '(/^(?:a|area|object|button)$/).test(tag) && attrName === \'tabindex\'');
function visit477_95_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['95'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['95'][1].init(-1, 570, '((/^(?:a|area|object|button)$/).test(tag) && attrName === \'tabindex\') || (tag === \'input\' && (attrName === \'maxlength\' || attrName === \'tabindex\')) || (tag === \'select\' && (attrName === \'size\' || attrName === \'tabindex\')) || (tag === \'textarea\' && (/^(?:rows|cols|tabindex)$/).test(attrName)) || (tag === \'colgroup\' && attrName === \'span\') || (tag === \'col\' && attrName === \'span\') || ((tag === \'th\' || tag == \'td\') && (attrName === \'rowspan\' || attrName === \'colspan\'))');
function visit476_95_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['89'][5].init(105, 18, 'attrName === \'for\'');
function visit475_89_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['89'][4].init(83, 18, 'attrName === \'src\'');
function visit474_89_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['89'][3].init(83, 40, 'attrName === \'src\' || attrName === \'for\'');
function visit473_89_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['89'][2].init(62, 16, 'tag === \'script\'');
function visit472_89_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['89'][1].init(62, 62, 'tag === \'script\' && (attrName === \'src\' || attrName === \'for\')');
function visit471_89_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['88'][4].init(661, 22, 'attrName === \'profile\'');
function visit470_88_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['88'][3].init(643, 14, 'tag === \'head\'');
function visit469_88_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['88'][2].init(643, 40, 'tag === \'head\' && attrName === \'profile\'');
function visit468_88_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['88'][1].init(86, 126, '(tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit467_88_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['87'][6].init(597, 21, 'attrName === \'usemap\'');
function visit466_87_6(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['87'][5].init(575, 18, 'attrName === \'src\'');
function visit465_87_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['87'][4].init(575, 43, 'attrName === \'src\' || attrName === \'usemap\'');
function visit464_87_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['87'][3].init(555, 15, 'tag === \'input\'');
function visit463_87_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['87'][2].init(555, 64, 'tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')');
function visit462_87_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['87'][1].init(61, 213, '(tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit461_87_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['86'][4].init(510, 21, 'attrName === \'action\'');
function visit460_86_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['86'][3].init(492, 14, 'tag === \'form\'');
function visit459_86_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['86'][2].init(492, 39, 'tag === \'form\' && attrName === \'action\'');
function visit458_86_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['86'][1].init(76, 275, '(tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit457_86_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['85'][6].init(449, 19, 'attrName === \'cite\'');
function visit456_85_6(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['85'][5].init(431, 13, 'tag === \'del\'');
function visit455_85_5(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['85'][4].init(414, 13, 'tag === \'ins\'');
function visit454_85_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['85'][3].init(414, 30, 'tag === \'ins\' || tag === \'del\'');
function visit453_85_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['85'][2].init(414, 54, '(tag === \'ins\' || tag === \'del\') && attrName === \'cite\'');
function visit452_85_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['85'][1].init(66, 352, '((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit451_85_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['84'][4].init(370, 19, 'attrName === \'cite\'');
function visit450_84_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['84'][3].init(346, 20, 'tag === \'blockquote\'');
function visit449_84_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['84'][2].init(346, 43, 'tag === \'blockquote\' && attrName === \'cite\'');
function visit448_84_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['84'][1].init(56, 419, '(tag === \'blockquote\' && attrName === \'cite\') || ((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit447_84_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['83'][4].init(303, 19, 'attrName === \'cite\'');
function visit446_83_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['83'][3].init(288, 11, 'tag === \'q\'');
function visit445_83_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['83'][2].init(288, 34, 'tag === \'q\' && attrName === \'cite\'');
function visit444_83_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['83'][1].init(95, 476, '(tag === \'q\' && attrName === \'cite\') || (tag === \'blockquote\' && attrName === \'cite\') || ((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit443_83_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['82'][3].init(191, 16, 'tag === \'object\'');
function visit442_82_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['82'][2].init(191, 73, 'tag === \'object\' && (/^(?:classid|codebase|data|usemap)$/).test(attrName)');
function visit441_82_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['82'][1].init(83, 572, '(tag === \'object\' && (/^(?:classid|codebase|data|usemap)$/).test(attrName)) || (tag === \'q\' && attrName === \'cite\') || (tag === \'blockquote\' && attrName === \'cite\') || ((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit440_82_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['81'][3].init(106, 13, 'tag === \'img\'');
function visit439_81_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['81'][2].init(106, 61, 'tag === \'img\' && (/^(?:src|longdesc|usemap)$/).test(attrName)');
function visit438_81_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['81'][1].init(80, 656, '(tag === \'img\' && (/^(?:src|longdesc|usemap)$/).test(attrName)) || (tag === \'object\' && (/^(?:classid|codebase|data|usemap)$/).test(attrName)) || (tag === \'q\' && attrName === \'cite\') || (tag === \'blockquote\' && attrName === \'cite\') || ((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit437_81_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['80'][3].init(63, 19, 'attrName === \'href\'');
function visit436_80_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['80'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['80'][2].init(24, 58, '(/^(?:a|area|link|base)$/).test(tag) && attrName === \'href\'');
function visit435_80_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['80'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['80'][1].init(-1, 737, '((/^(?:a|area|link|base)$/).test(tag) && attrName === \'href\') || (tag === \'img\' && (/^(?:src|longdesc|usemap)$/).test(attrName)) || (tag === \'object\' && (/^(?:classid|codebase|data|usemap)$/).test(attrName)) || (tag === \'q\' && attrName === \'cite\') || (tag === \'blockquote\' && attrName === \'cite\') || ((tag === \'ins\' || tag === \'del\') && attrName === \'cite\') || (tag === \'form\' && attrName === \'action\') || (tag === \'input\' && (attrName === \'src\' || attrName === \'usemap\')) || (tag === \'head\' && attrName === \'profile\') || (tag === \'script\' && (attrName === \'src\' || attrName === \'for\'))');
function visit434_80_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['66'][1].init(44, 20, 'attrValue === \'rect\'');
function visit433_66_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['65'][2].init(173, 20, 'attrName === \'shape\'');
function visit432_65_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['65'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['65'][1].init(38, 65, 'attrName === \'shape\' && attrValue === \'rect\'');
function visit431_65_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['64'][2].init(132, 14, 'tag === \'area\'');
function visit430_64_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['64'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['64'][1].init(132, 104, 'tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\'');
function visit429_64_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['62'][1].init(43, 24, 'attrValue === \'text/css\'');
function visit428_62_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['61'][2].init(41, 19, 'attrName === \'type\'');
function visit427_61_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['61'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['61'][1].init(39, 68, 'attrName === \'type\' && attrValue === \'text/css\'');
function visit426_61_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['60'][3].init(558, 15, 'tag === \'style\'');
function visit425_60_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['60'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['60'][2].init(558, 108, 'tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\'');
function visit424_60_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['60'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['60'][1].init(140, 238, '(tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\') || (tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\')');
function visit423_60_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['58'][1].init(43, 31, 'attrValue === \'text/javascript\'');
function visit422_58_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['57'][2].init(42, 19, 'attrName === \'type\'');
function visit421_57_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['57'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['57'][1].init(40, 75, 'attrName === \'type\' && attrValue === \'text/javascript\'');
function visit420_57_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['56'][3].init(416, 16, 'tag === \'script\'');
function visit419_56_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['56'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['56'][2].init(416, 116, 'tag === \'script\' && attrName === \'type\' && attrValue === \'text/javascript\'');
function visit418_56_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['56'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['56'][1].init(128, 379, '(tag === \'script\' && attrName === \'type\' && attrValue === \'text/javascript\') || (tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\') || (tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\')');
function visit417_56_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['54'][1].init(43, 20, 'attrValue === \'text\'');
function visit416_54_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['53'][2].init(41, 19, 'attrName === \'type\'');
function visit415_53_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['53'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['53'][1].init(39, 64, 'attrName === \'type\' && attrValue === \'text\'');
function visit414_53_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['52'][3].init(286, 15, 'tag === \'input\'');
function visit413_52_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['52'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['52'][2].init(286, 104, 'tag === \'input\' && attrName === \'type\' && attrValue === \'text\'');
function visit412_52_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['52'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['52'][1].init(128, 508, '(tag === \'input\' && attrName === \'type\' && attrValue === \'text\') || (tag === \'script\' && attrName === \'type\' && attrValue === \'text/javascript\') || (tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\') || (tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\')');
function visit411_52_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['50'][1].init(45, 19, 'attrValue === \'get\'');
function visit410_50_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['49'][2].init(40, 21, 'attrName === \'method\'');
function visit409_49_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['49'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['49'][1].init(38, 65, 'attrName === \'method\' && attrValue === \'get\'');
function visit408_49_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['48'][3].init(156, 14, 'tag === \'form\'');
function visit407_48_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['48'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['48'][2].init(156, 104, 'tag === \'form\' && attrName === \'method\' && attrValue === \'get\'');
function visit406_48_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['48'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['48'][1].init(131, 637, '(tag === \'form\' && attrName === \'method\' && attrValue === \'get\') || (tag === \'input\' && attrName === \'type\' && attrValue === \'text\') || (tag === \'script\' && attrName === \'type\' && attrValue === \'text/javascript\') || (tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\') || (tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\')');
function visit405_48_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['46'][1].init(43, 26, 'attrValue === \'javascript\'');
function visit404_46_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['45'][2].init(38, 23, 'attrName === \'language\'');
function visit403_45_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['45'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['45'][1].init(36, 70, 'attrName === \'language\' && attrValue === \'javascript\'');
function visit402_45_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['44'][3].init(23, 16, 'tag === \'script\'');
function visit401_44_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['44'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['44'][2].init(23, 107, 'tag === \'script\' && attrName === \'language\' && attrValue === \'javascript\'');
function visit400_44_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['44'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['44'][1].init(-1, 769, '(tag === \'script\' && attrName === \'language\' && attrValue === \'javascript\') || (tag === \'form\' && attrName === \'method\' && attrValue === \'get\') || (tag === \'input\' && attrName === \'type\' && attrValue === \'text\') || (tag === \'script\' && attrName === \'type\' && attrValue === \'text/javascript\') || (tag === \'style\' && attrName === \'type\' && attrValue === \'text/css\') || (tag === \'area\' && attrName === \'shape\' && attrValue === \'rect\')');
function visit399_44_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['41'][1].init(82, 16, 'attr.value || ""');
function visit398_41_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['22'][4].init(42, 20, 'attrName === \'value\'');
function visit397_22_4(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['22'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['22'][3].init(23, 15, 'tag === \'input\'');
function visit396_22_3(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['22'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['22'][2].init(23, 39, 'tag === \'input\' && attrName === \'value\'');
function visit395_22_2(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['22'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['22'][1].init(23, 92, '(tag === \'input\' && attrName === \'value\') || reEmptyAttribute.test(attrName)');
function visit394_22_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['21'][1].init(92, 16, '!trim(attrValue)');
function visit393_21_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].branchData['19'][1].init(26, 16, 'attr.value || ""');
function visit392_19_1(result) {
  _$jscoverage['/html-parser/writer/minify.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/minify.js'].lineData[5]++;
KISSY.add("html-parser/writer/minify", function(S, BasicWriter, Utils) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[0]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[7]++;
  var trim = S.trim, collapseWhitespace = Utils.collapseWhitespace, reEmptyAttribute = new RegExp('^(?:class|id|style|title|lang|dir|on' + '(?:focus|blur|change|click|dblclick|mouse(' + '?:down|up|over|move|out)|key(?:press|down|up)))$');
  _$jscoverage['/html-parser/writer/minify.js'].lineData[14]++;
  function escapeAttrValue(str) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[1]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[15]++;
    return String(str).replace(/"/g, "&quote;");
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[18]++;
  function canDeleteEmptyAttribute(tag, attr) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[2]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[19]++;
    var attrValue = visit392_19_1(attr.value || ""), attrName = attr.name;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[21]++;
    if (visit393_21_1(!trim(attrValue))) {
      _$jscoverage['/html-parser/writer/minify.js'].lineData[22]++;
      return (visit394_22_1((visit395_22_2(visit396_22_3(tag === 'input') && visit397_22_4(attrName === 'value'))) || reEmptyAttribute.test(attrName)));
    }
    _$jscoverage['/html-parser/writer/minify.js'].lineData[25]++;
    return 0;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[28]++;
  function isBooleanAttribute(attrName) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[3]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[29]++;
    return (/^(?:checked|disabled|selected|readonly|defer|multiple|nohref|noshape|nowrap|noresize|compact|ismap)$/i).test(attrName);
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[32]++;
  function canRemoveAttributeQuotes(value) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[4]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[35]++;
    return !(/[ "'=<>`]/).test(value);
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[38]++;
  function isAttributeRedundant(el, attr) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[5]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[39]++;
    var tag = el.nodeName, attrName = attr.name, attrValue = visit398_41_1(attr.value || "");
    _$jscoverage['/html-parser/writer/minify.js'].lineData[42]++;
    attrValue = trim(attrValue.toLowerCase());
    _$jscoverage['/html-parser/writer/minify.js'].lineData[43]++;
    return (visit399_44_1((visit400_44_2(visit401_44_3(tag === 'script') && visit402_45_1(visit403_45_2(attrName === 'language') && visit404_46_1(attrValue === 'javascript')))) || visit405_48_1((visit406_48_2(visit407_48_3(tag === 'form') && visit408_49_1(visit409_49_2(attrName === 'method') && visit410_50_1(attrValue === 'get')))) || visit411_52_1((visit412_52_2(visit413_52_3(tag === 'input') && visit414_53_1(visit415_53_2(attrName === 'type') && visit416_54_1(attrValue === 'text')))) || visit417_56_1((visit418_56_2(visit419_56_3(tag === 'script') && visit420_57_1(visit421_57_2(attrName === 'type') && visit422_58_1(attrValue === 'text/javascript')))) || visit423_60_1((visit424_60_2(visit425_60_3(tag === 'style') && visit426_61_1(visit427_61_2(attrName === 'type') && visit428_62_1(attrValue === 'text/css')))) || (visit429_64_1(visit430_64_2(tag === 'area') && visit431_65_1(visit432_65_2(attrName === 'shape') && visit433_66_1(attrValue === 'rect'))))))))));
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[70]++;
  function isConditionalComment(text) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[6]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[71]++;
    return (/\[if[^\]]+\]/).test(text);
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[74]++;
  function isEventAttribute(attrName) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[7]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[75]++;
    return (/^on[a-z]+/).test(attrName);
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[78]++;
  function isUriTypeAttribute(attrName, tag) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[8]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[79]++;
    return (visit434_80_1((visit435_80_2((/^(?:a|area|link|base)$/).test(tag) && visit436_80_3(attrName === 'href'))) || visit437_81_1((visit438_81_2(visit439_81_3(tag === 'img') && (/^(?:src|longdesc|usemap)$/).test(attrName))) || visit440_82_1((visit441_82_2(visit442_82_3(tag === 'object') && (/^(?:classid|codebase|data|usemap)$/).test(attrName))) || visit443_83_1((visit444_83_2(visit445_83_3(tag === 'q') && visit446_83_4(attrName === 'cite'))) || visit447_84_1((visit448_84_2(visit449_84_3(tag === 'blockquote') && visit450_84_4(attrName === 'cite'))) || visit451_85_1((visit452_85_2((visit453_85_3(visit454_85_4(tag === 'ins') || visit455_85_5(tag === 'del'))) && visit456_85_6(attrName === 'cite'))) || visit457_86_1((visit458_86_2(visit459_86_3(tag === 'form') && visit460_86_4(attrName === 'action'))) || visit461_87_1((visit462_87_2(visit463_87_3(tag === 'input') && (visit464_87_4(visit465_87_5(attrName === 'src') || visit466_87_6(attrName === 'usemap'))))) || visit467_88_1((visit468_88_2(visit469_88_3(tag === 'head') && visit470_88_4(attrName === 'profile'))) || (visit471_89_1(visit472_89_2(tag === 'script') && (visit473_89_3(visit474_89_4(attrName === 'src') || visit475_89_5(attrName === 'for')))))))))))))));
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[93]++;
  function isNumberTypeAttribute(attrName, tag) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[9]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[94]++;
    return (visit476_95_1((visit477_95_2((/^(?:a|area|object|button)$/).test(tag) && visit478_95_3(attrName === 'tabindex'))) || visit479_96_1((visit480_96_2(visit481_96_3(tag === 'input') && (visit482_96_4(visit483_96_5(attrName === 'maxlength') || visit484_96_6(attrName === 'tabindex'))))) || visit485_97_1((visit486_97_2(visit487_97_3(tag === 'select') && (visit488_97_4(visit489_97_5(attrName === 'size') || visit490_97_6(attrName === 'tabindex'))))) || visit491_98_1((visit492_98_2(visit493_98_3(tag === 'textarea') && (/^(?:rows|cols|tabindex)$/).test(attrName))) || visit494_99_1((visit495_99_2(visit496_99_3(tag === 'colgroup') && visit497_99_4(attrName === 'span'))) || visit498_100_1((visit499_100_2(visit500_100_3(tag === 'col') && visit501_100_4(attrName === 'span'))) || (visit502_101_1((visit503_101_2(visit504_101_3(tag === 'th') || visit505_101_4(tag == 'td'))) && (visit506_101_5(visit507_101_6(attrName === 'rowspan') || visit508_101_7(attrName === 'colspan'))))))))))));
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[105]++;
  function cleanAttributeValue(el, attr) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[10]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[106]++;
    var tag = el.nodeName, attrName = attr.name, attrValue = visit509_108_1(attr.value || "");
    _$jscoverage['/html-parser/writer/minify.js'].lineData[109]++;
    if (visit510_109_1(isEventAttribute(attrName))) {
      _$jscoverage['/html-parser/writer/minify.js'].lineData[110]++;
      attrValue = trim(attrValue).replace(/^javascript:[\s\xa0]*/i, '').replace(/[\s\xa0]*;$/, '');
    } else {
      _$jscoverage['/html-parser/writer/minify.js'].lineData[114]++;
      if (visit511_114_1(attrName === 'class')) {
        _$jscoverage['/html-parser/writer/minify.js'].lineData[115]++;
        attrValue = collapseWhitespace(trim(attrValue));
      } else {
        _$jscoverage['/html-parser/writer/minify.js'].lineData[117]++;
        if (visit512_117_1(isUriTypeAttribute(attrName, tag) || isNumberTypeAttribute(attrName, tag))) {
          _$jscoverage['/html-parser/writer/minify.js'].lineData[119]++;
          attrValue = trim(attrValue);
        } else {
          _$jscoverage['/html-parser/writer/minify.js'].lineData[121]++;
          if (visit513_121_1(attrName === 'style')) {
            _$jscoverage['/html-parser/writer/minify.js'].lineData[122]++;
            attrValue = trim(attrValue).replace(/[\s\xa0]*;[\s\xa0]*$/, '');
          }
        }
      }
    }
    _$jscoverage['/html-parser/writer/minify.js'].lineData[124]++;
    return attrValue;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[127]++;
  function cleanConditionalComment(comment) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[11]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[128]++;
    return comment.replace(/^(\[[^\]]+\]>)[\s\xa0]*/, '$1').replace(/[\s\xa0]*(<!\[endif\])$/, '$1');
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[133]++;
  function removeCDATASections(text) {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[12]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[134]++;
    return trim(text).replace(/^(?:[\s\xa0]*\/\*[\s\xa0]*<!\[CDATA\[[\s\xa0]*\*\/|[\s\xa0]*\/\/[\s\xa0]*<!\[CDATA\[.*)/, '').replace(/(?:\/\*[\s\xa0]*\]\]>[\s\xa0]*\*\/|\/\/[\s\xa0]*\]\]>)[\s\xa0]*$/, '');
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[141]++;
  function Minifier() {
    _$jscoverage['/html-parser/writer/minify.js'].functionData[13]++;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[142]++;
    var self = this;
    _$jscoverage['/html-parser/writer/minify.js'].lineData[143]++;
    Minifier.superclass.constructor.apply(self, arguments);
    _$jscoverage['/html-parser/writer/minify.js'].lineData[144]++;
    self.inPre = 0;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[147]++;
  S.extend(Minifier, BasicWriter, {
  comment: function(text) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[14]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[152]++;
  if (visit514_152_1(isConditionalComment(text))) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[153]++;
    text = cleanConditionalComment(text);
    _$jscoverage['/html-parser/writer/minify.js'].lineData[154]++;
    Minifier.superclass.comment.call(this, text);
  }
}, 
  openTag: function(el) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[15]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[162]++;
  var self = this;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[163]++;
  if (visit515_163_1(el.tagName == 'pre')) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[164]++;
    self.inPre = 1;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[166]++;
  Minifier.superclass.openTag.apply(self, arguments);
}, 
  closeTag: function(el) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[16]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[173]++;
  var self = this;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[174]++;
  if (visit516_174_1(el.tagName == 'pre')) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[175]++;
    self.inPre = 0;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[177]++;
  Minifier.superclass.closeTag.apply(self, arguments);
}, 
  cdata: function(cdata) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[17]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[184]++;
  cdata = removeCDATASections(cdata);
  _$jscoverage['/html-parser/writer/minify.js'].lineData[185]++;
  Minifier.superclass.cdata.call(this, cdata);
}, 
  attribute: function(attr, el) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[18]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[189]++;
  var self = this, name = attr.name, normalizedValue, value = visit517_192_1(attr.value || "");
  _$jscoverage['/html-parser/writer/minify.js'].lineData[195]++;
  if (visit518_195_1(canDeleteEmptyAttribute(el, attr) || isAttributeRedundant(el, attr))) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[198]++;
    return;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[201]++;
  if (visit519_201_1(isBooleanAttribute(name))) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[203]++;
    self.append(" ", name);
    _$jscoverage['/html-parser/writer/minify.js'].lineData[204]++;
    return;
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[208]++;
  normalizedValue = escapeAttrValue(cleanAttributeValue(el, attr));
  _$jscoverage['/html-parser/writer/minify.js'].lineData[210]++;
  if (visit520_210_1(value && canRemoveAttributeQuotes(value))) {
  } else {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[213]++;
    normalizedValue = '"' + normalizedValue + '"';
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[216]++;
  self.append(" ", name, "=", normalizedValue);
}, 
  text: function(text) {
  _$jscoverage['/html-parser/writer/minify.js'].functionData[19]++;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[223]++;
  var self = this;
  _$jscoverage['/html-parser/writer/minify.js'].lineData[224]++;
  if (visit521_224_1(!self.inPre)) {
    _$jscoverage['/html-parser/writer/minify.js'].lineData[226]++;
    text = collapseWhitespace(text);
  }
  _$jscoverage['/html-parser/writer/minify.js'].lineData[228]++;
  self.append(text);
}});
  _$jscoverage['/html-parser/writer/minify.js'].lineData[232]++;
  return Minifier;
}, {
  requires: ['./basic', '../utils']});
