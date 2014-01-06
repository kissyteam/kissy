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
if (! _$jscoverage['/picker/render.js']) {
  _$jscoverage['/picker/render.js'] = {};
  _$jscoverage['/picker/render.js'].lineData = [];
  _$jscoverage['/picker/render.js'].lineData[6] = 0;
  _$jscoverage['/picker/render.js'].lineData[7] = 0;
  _$jscoverage['/picker/render.js'].lineData[10] = 0;
  _$jscoverage['/picker/render.js'].lineData[11] = 0;
  _$jscoverage['/picker/render.js'].lineData[12] = 0;
  _$jscoverage['/picker/render.js'].lineData[13] = 0;
  _$jscoverage['/picker/render.js'].lineData[14] = 0;
  _$jscoverage['/picker/render.js'].lineData[23] = 0;
  _$jscoverage['/picker/render.js'].lineData[24] = 0;
  _$jscoverage['/picker/render.js'].lineData[26] = 0;
  _$jscoverage['/picker/render.js'].lineData[27] = 0;
  _$jscoverage['/picker/render.js'].lineData[32] = 0;
  _$jscoverage['/picker/render.js'].lineData[33] = 0;
  _$jscoverage['/picker/render.js'].lineData[38] = 0;
  _$jscoverage['/picker/render.js'].lineData[39] = 0;
  _$jscoverage['/picker/render.js'].lineData[43] = 0;
  _$jscoverage['/picker/render.js'].lineData[44] = 0;
  _$jscoverage['/picker/render.js'].lineData[45] = 0;
  _$jscoverage['/picker/render.js'].lineData[47] = 0;
  _$jscoverage['/picker/render.js'].lineData[51] = 0;
  _$jscoverage['/picker/render.js'].lineData[52] = 0;
  _$jscoverage['/picker/render.js'].lineData[53] = 0;
  _$jscoverage['/picker/render.js'].lineData[55] = 0;
  _$jscoverage['/picker/render.js'].lineData[59] = 0;
  _$jscoverage['/picker/render.js'].lineData[60] = 0;
  _$jscoverage['/picker/render.js'].lineData[63] = 0;
  _$jscoverage['/picker/render.js'].lineData[65] = 0;
  _$jscoverage['/picker/render.js'].lineData[66] = 0;
  _$jscoverage['/picker/render.js'].lineData[67] = 0;
  _$jscoverage['/picker/render.js'].lineData[68] = 0;
  _$jscoverage['/picker/render.js'].lineData[69] = 0;
  _$jscoverage['/picker/render.js'].lineData[70] = 0;
  _$jscoverage['/picker/render.js'].lineData[74] = 0;
  _$jscoverage['/picker/render.js'].lineData[75] = 0;
  _$jscoverage['/picker/render.js'].lineData[76] = 0;
  _$jscoverage['/picker/render.js'].lineData[77] = 0;
  _$jscoverage['/picker/render.js'].lineData[78] = 0;
  _$jscoverage['/picker/render.js'].lineData[79] = 0;
  _$jscoverage['/picker/render.js'].lineData[80] = 0;
  _$jscoverage['/picker/render.js'].lineData[81] = 0;
  _$jscoverage['/picker/render.js'].lineData[85] = 0;
  _$jscoverage['/picker/render.js'].lineData[86] = 0;
  _$jscoverage['/picker/render.js'].lineData[87] = 0;
  _$jscoverage['/picker/render.js'].lineData[88] = 0;
  _$jscoverage['/picker/render.js'].lineData[89] = 0;
  _$jscoverage['/picker/render.js'].lineData[90] = 0;
  _$jscoverage['/picker/render.js'].lineData[101] = 0;
  _$jscoverage['/picker/render.js'].lineData[102] = 0;
  _$jscoverage['/picker/render.js'].lineData[103] = 0;
  _$jscoverage['/picker/render.js'].lineData[104] = 0;
  _$jscoverage['/picker/render.js'].lineData[105] = 0;
  _$jscoverage['/picker/render.js'].lineData[106] = 0;
  _$jscoverage['/picker/render.js'].lineData[107] = 0;
  _$jscoverage['/picker/render.js'].lineData[109] = 0;
  _$jscoverage['/picker/render.js'].lineData[122] = 0;
  _$jscoverage['/picker/render.js'].lineData[126] = 0;
  _$jscoverage['/picker/render.js'].lineData[149] = 0;
  _$jscoverage['/picker/render.js'].lineData[150] = 0;
  _$jscoverage['/picker/render.js'].lineData[151] = 0;
  _$jscoverage['/picker/render.js'].lineData[152] = 0;
  _$jscoverage['/picker/render.js'].lineData[153] = 0;
  _$jscoverage['/picker/render.js'].lineData[155] = 0;
  _$jscoverage['/picker/render.js'].lineData[156] = 0;
  _$jscoverage['/picker/render.js'].lineData[157] = 0;
  _$jscoverage['/picker/render.js'].lineData[158] = 0;
  _$jscoverage['/picker/render.js'].lineData[159] = 0;
  _$jscoverage['/picker/render.js'].lineData[160] = 0;
  _$jscoverage['/picker/render.js'].lineData[161] = 0;
  _$jscoverage['/picker/render.js'].lineData[162] = 0;
  _$jscoverage['/picker/render.js'].lineData[163] = 0;
  _$jscoverage['/picker/render.js'].lineData[165] = 0;
  _$jscoverage['/picker/render.js'].lineData[166] = 0;
  _$jscoverage['/picker/render.js'].lineData[169] = 0;
  _$jscoverage['/picker/render.js'].lineData[170] = 0;
  _$jscoverage['/picker/render.js'].lineData[171] = 0;
  _$jscoverage['/picker/render.js'].lineData[172] = 0;
  _$jscoverage['/picker/render.js'].lineData[173] = 0;
  _$jscoverage['/picker/render.js'].lineData[174] = 0;
  _$jscoverage['/picker/render.js'].lineData[179] = 0;
  _$jscoverage['/picker/render.js'].lineData[180] = 0;
  _$jscoverage['/picker/render.js'].lineData[181] = 0;
  _$jscoverage['/picker/render.js'].lineData[182] = 0;
  _$jscoverage['/picker/render.js'].lineData[183] = 0;
  _$jscoverage['/picker/render.js'].lineData[185] = 0;
  _$jscoverage['/picker/render.js'].lineData[186] = 0;
  _$jscoverage['/picker/render.js'].lineData[188] = 0;
  _$jscoverage['/picker/render.js'].lineData[189] = 0;
  _$jscoverage['/picker/render.js'].lineData[190] = 0;
  _$jscoverage['/picker/render.js'].lineData[192] = 0;
  _$jscoverage['/picker/render.js'].lineData[193] = 0;
  _$jscoverage['/picker/render.js'].lineData[195] = 0;
  _$jscoverage['/picker/render.js'].lineData[196] = 0;
  _$jscoverage['/picker/render.js'].lineData[198] = 0;
  _$jscoverage['/picker/render.js'].lineData[199] = 0;
  _$jscoverage['/picker/render.js'].lineData[200] = 0;
  _$jscoverage['/picker/render.js'].lineData[203] = 0;
  _$jscoverage['/picker/render.js'].lineData[204] = 0;
  _$jscoverage['/picker/render.js'].lineData[205] = 0;
  _$jscoverage['/picker/render.js'].lineData[213] = 0;
  _$jscoverage['/picker/render.js'].lineData[219] = 0;
  _$jscoverage['/picker/render.js'].lineData[221] = 0;
  _$jscoverage['/picker/render.js'].lineData[223] = 0;
  _$jscoverage['/picker/render.js'].lineData[224] = 0;
  _$jscoverage['/picker/render.js'].lineData[228] = 0;
  _$jscoverage['/picker/render.js'].lineData[232] = 0;
  _$jscoverage['/picker/render.js'].lineData[233] = 0;
  _$jscoverage['/picker/render.js'].lineData[234] = 0;
  _$jscoverage['/picker/render.js'].lineData[235] = 0;
  _$jscoverage['/picker/render.js'].lineData[236] = 0;
  _$jscoverage['/picker/render.js'].lineData[237] = 0;
  _$jscoverage['/picker/render.js'].lineData[238] = 0;
  _$jscoverage['/picker/render.js'].lineData[239] = 0;
  _$jscoverage['/picker/render.js'].lineData[240] = 0;
  _$jscoverage['/picker/render.js'].lineData[242] = 0;
  _$jscoverage['/picker/render.js'].lineData[243] = 0;
  _$jscoverage['/picker/render.js'].lineData[244] = 0;
  _$jscoverage['/picker/render.js'].lineData[250] = 0;
  _$jscoverage['/picker/render.js'].lineData[251] = 0;
  _$jscoverage['/picker/render.js'].lineData[252] = 0;
  _$jscoverage['/picker/render.js'].lineData[253] = 0;
  _$jscoverage['/picker/render.js'].lineData[254] = 0;
  _$jscoverage['/picker/render.js'].lineData[255] = 0;
  _$jscoverage['/picker/render.js'].lineData[256] = 0;
  _$jscoverage['/picker/render.js'].lineData[257] = 0;
  _$jscoverage['/picker/render.js'].lineData[258] = 0;
  _$jscoverage['/picker/render.js'].lineData[259] = 0;
  _$jscoverage['/picker/render.js'].lineData[260] = 0;
  _$jscoverage['/picker/render.js'].lineData[261] = 0;
  _$jscoverage['/picker/render.js'].lineData[264] = 0;
  _$jscoverage['/picker/render.js'].lineData[265] = 0;
  _$jscoverage['/picker/render.js'].lineData[266] = 0;
  _$jscoverage['/picker/render.js'].lineData[267] = 0;
  _$jscoverage['/picker/render.js'].lineData[268] = 0;
  _$jscoverage['/picker/render.js'].lineData[269] = 0;
  _$jscoverage['/picker/render.js'].lineData[271] = 0;
}
if (! _$jscoverage['/picker/render.js'].functionData) {
  _$jscoverage['/picker/render.js'].functionData = [];
  _$jscoverage['/picker/render.js'].functionData[0] = 0;
  _$jscoverage['/picker/render.js'].functionData[1] = 0;
  _$jscoverage['/picker/render.js'].functionData[2] = 0;
  _$jscoverage['/picker/render.js'].functionData[3] = 0;
  _$jscoverage['/picker/render.js'].functionData[4] = 0;
  _$jscoverage['/picker/render.js'].functionData[5] = 0;
  _$jscoverage['/picker/render.js'].functionData[6] = 0;
  _$jscoverage['/picker/render.js'].functionData[7] = 0;
  _$jscoverage['/picker/render.js'].functionData[8] = 0;
  _$jscoverage['/picker/render.js'].functionData[9] = 0;
  _$jscoverage['/picker/render.js'].functionData[10] = 0;
  _$jscoverage['/picker/render.js'].functionData[11] = 0;
  _$jscoverage['/picker/render.js'].functionData[12] = 0;
  _$jscoverage['/picker/render.js'].functionData[13] = 0;
}
if (! _$jscoverage['/picker/render.js'].branchData) {
  _$jscoverage['/picker/render.js'].branchData = {};
  _$jscoverage['/picker/render.js'].branchData['33'] = [];
  _$jscoverage['/picker/render.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['33'][2] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['34'] = [];
  _$jscoverage['/picker/render.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['34'][2] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['35'] = [];
  _$jscoverage['/picker/render.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['39'] = [];
  _$jscoverage['/picker/render.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['39'][2] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['40'] = [];
  _$jscoverage['/picker/render.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['44'] = [];
  _$jscoverage['/picker/render.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['47'] = [];
  _$jscoverage['/picker/render.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['47'][2] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['48'] = [];
  _$jscoverage['/picker/render.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['52'] = [];
  _$jscoverage['/picker/render.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['55'] = [];
  _$jscoverage['/picker/render.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['55'][2] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['56'] = [];
  _$jscoverage['/picker/render.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['104'] = [];
  _$jscoverage['/picker/render.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['158'] = [];
  _$jscoverage['/picker/render.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['159'] = [];
  _$jscoverage['/picker/render.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['161'] = [];
  _$jscoverage['/picker/render.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['171'] = [];
  _$jscoverage['/picker/render.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['173'] = [];
  _$jscoverage['/picker/render.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['179'] = [];
  _$jscoverage['/picker/render.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['185'] = [];
  _$jscoverage['/picker/render.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['188'] = [];
  _$jscoverage['/picker/render.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['192'] = [];
  _$jscoverage['/picker/render.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['195'] = [];
  _$jscoverage['/picker/render.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['198'] = [];
  _$jscoverage['/picker/render.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['204'] = [];
  _$jscoverage['/picker/render.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['204'][2] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['237'] = [];
  _$jscoverage['/picker/render.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['252'] = [];
  _$jscoverage['/picker/render.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['258'] = [];
  _$jscoverage['/picker/render.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['258'][2] = new BranchData();
}
_$jscoverage['/picker/render.js'].branchData['258'][2].init(337, 42, 'disabledDate && disabledDate(value, value)');
function visit61_258_2(result) {
  _$jscoverage['/picker/render.js'].branchData['258'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['258'][1].init(335, 45, '!(disabledDate && disabledDate(value, value))');
function visit60_258_1(result) {
  _$jscoverage['/picker/render.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['252'][1].init(95, 28, 'isSameMonth(preValue, value)');
function visit59_252_1(result) {
  _$jscoverage['/picker/render.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['237'][1].init(261, 1, 'v');
function visit58_237_1(result) {
  _$jscoverage['/picker/render.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['204'][2].init(1020, 53, 'dateRender && (dateHtml = dateRender(current, value))');
function visit57_204_2(result) {
  _$jscoverage['/picker/render.js'].branchData['204'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['204'][1].init(1018, 56, '!(dateRender && (dateHtml = dateRender(current, value)))');
function visit56_204_1(result) {
  _$jscoverage['/picker/render.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['198'][1].init(791, 44, 'disabledDate && disabledDate(current, value)');
function visit55_198_1(result) {
  _$jscoverage['/picker/render.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['195'][1].init(648, 37, 'afterCurrentMonthYear(current, value)');
function visit54_195_1(result) {
  _$jscoverage['/picker/render.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['192'][1].init(504, 38, 'beforeCurrentMonthYear(current, value)');
function visit53_192_1(result) {
  _$jscoverage['/picker/render.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['188'][1].init(324, 37, '!isClear && isSameDay(current, value)');
function visit52_188_1(result) {
  _$jscoverage['/picker/render.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['185'][1].init(200, 25, 'isSameDay(current, today)');
function visit51_185_1(result) {
  _$jscoverage['/picker/render.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['179'][1].init(338, 18, 'j < DATE_COL_COUNT');
function visit50_179_1(result) {
  _$jscoverage['/picker/render.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['173'][1].init(68, 14, 'showWeekNumber');
function visit49_173_1(result) {
  _$jscoverage['/picker/render.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['171'][1].init(2136, 18, 'i < DATE_ROW_COUNT');
function visit48_171_1(result) {
  _$jscoverage['/picker/render.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['161'][1].init(67, 6, 'passed');
function visit47_161_1(result) {
  _$jscoverage['/picker/render.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['159'][1].init(29, 18, 'j < DATE_COL_COUNT');
function visit46_159_1(result) {
  _$jscoverage['/picker/render.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['158'][1].init(1663, 18, 'i < DATE_ROW_COUNT');
function visit45_158_1(result) {
  _$jscoverage['/picker/render.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['104'][1].init(1043, 18, 'i < DATE_COL_COUNT');
function visit44_104_1(result) {
  _$jscoverage['/picker/render.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['56'][1].init(52, 37, 'current.getMonth() > today.getMonth()');
function visit43_56_1(result) {
  _$jscoverage['/picker/render.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['55'][2].init(99, 37, 'current.getYear() === today.getYear()');
function visit42_55_2(result) {
  _$jscoverage['/picker/render.js'].branchData['55'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['55'][1].init(99, 90, 'current.getYear() === today.getYear() && current.getMonth() > today.getMonth()');
function visit41_55_1(result) {
  _$jscoverage['/picker/render.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['52'][1].init(13, 35, 'current.getYear() > today.getYear()');
function visit40_52_1(result) {
  _$jscoverage['/picker/render.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['48'][1].init(52, 37, 'current.getMonth() < today.getMonth()');
function visit39_48_1(result) {
  _$jscoverage['/picker/render.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['47'][2].init(99, 37, 'current.getYear() === today.getYear()');
function visit38_47_2(result) {
  _$jscoverage['/picker/render.js'].branchData['47'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['47'][1].init(99, 90, 'current.getYear() === today.getYear() && current.getMonth() < today.getMonth()');
function visit37_47_1(result) {
  _$jscoverage['/picker/render.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['44'][1].init(13, 35, 'current.getYear() < today.getYear()');
function visit36_44_1(result) {
  _$jscoverage['/picker/render.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['40'][1].init(46, 33, 'one.getMonth() === two.getMonth()');
function visit35_40_1(result) {
  _$jscoverage['/picker/render.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['39'][2].init(16, 31, 'one.getYear() === two.getYear()');
function visit34_39_2(result) {
  _$jscoverage['/picker/render.js'].branchData['39'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['39'][1].init(16, 80, 'one.getYear() === two.getYear() && one.getMonth() === two.getMonth()');
function visit33_39_1(result) {
  _$jscoverage['/picker/render.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['35'][1].init(48, 43, 'one.getDayOfMonth() === two.getDayOfMonth()');
function visit32_35_1(result) {
  _$jscoverage['/picker/render.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['34'][2].init(65, 33, 'one.getMonth() === two.getMonth()');
function visit31_34_2(result) {
  _$jscoverage['/picker/render.js'].branchData['34'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['34'][1].init(46, 92, 'one.getMonth() === two.getMonth() && one.getDayOfMonth() === two.getDayOfMonth()');
function visit30_34_1(result) {
  _$jscoverage['/picker/render.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['33'][2].init(16, 31, 'one.getYear() === two.getYear()');
function visit29_33_2(result) {
  _$jscoverage['/picker/render.js'].branchData['33'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['33'][1].init(16, 139, 'one.getYear() === two.getYear() && one.getMonth() === two.getMonth() && one.getDayOfMonth() === two.getDayOfMonth()');
function visit28_33_1(result) {
  _$jscoverage['/picker/render.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/picker/render.js'].functionData[0]++;
  _$jscoverage['/picker/render.js'].lineData[7]++;
  var DateTimeFormat = require('date/format'), PickerTpl = require('date/picker-xtpl'), Control = require('component/control');
  _$jscoverage['/picker/render.js'].lineData[10]++;
  var dateRowTplStart = '<tr role="row">';
  _$jscoverage['/picker/render.js'].lineData[11]++;
  var dateRowTplEnd = '</tr>';
  _$jscoverage['/picker/render.js'].lineData[12]++;
  var dateCellTpl = '<td role="gridcell" data-index="{index}" title="{title}" class="{cls}">{content}</td>';
  _$jscoverage['/picker/render.js'].lineData[13]++;
  var weekNumberCellTpl = '<td role="gridcell" class="{cls}">{content}</td>';
  _$jscoverage['/picker/render.js'].lineData[14]++;
  var dateTpl = '<a ' + ' id="{id}" ' + ' hidefocus="on" ' + ' unselectable="on" ' + ' tabindex="-1" ' + ' class="{cls}" ' + ' href="#" ' + ' aria-selected="{selected}" ' + ' aria-disabled="{disabled}">{content}</a>';
  _$jscoverage['/picker/render.js'].lineData[23]++;
  var DATE_ROW_COUNT = 6;
  _$jscoverage['/picker/render.js'].lineData[24]++;
  var DATE_COL_COUNT = 7;
  _$jscoverage['/picker/render.js'].lineData[26]++;
  function getIdFromDate(d) {
    _$jscoverage['/picker/render.js'].functionData[1]++;
    _$jscoverage['/picker/render.js'].lineData[27]++;
    return 'ks-date-picker-date-' + d.getYear() + '-' + d.getMonth() + '-' + d.getDayOfMonth();
  }
  _$jscoverage['/picker/render.js'].lineData[32]++;
  function isSameDay(one, two) {
    _$jscoverage['/picker/render.js'].functionData[2]++;
    _$jscoverage['/picker/render.js'].lineData[33]++;
    return visit28_33_1(visit29_33_2(one.getYear() === two.getYear()) && visit30_34_1(visit31_34_2(one.getMonth() === two.getMonth()) && visit32_35_1(one.getDayOfMonth() === two.getDayOfMonth())));
  }
  _$jscoverage['/picker/render.js'].lineData[38]++;
  function isSameMonth(one, two) {
    _$jscoverage['/picker/render.js'].functionData[3]++;
    _$jscoverage['/picker/render.js'].lineData[39]++;
    return visit33_39_1(visit34_39_2(one.getYear() === two.getYear()) && visit35_40_1(one.getMonth() === two.getMonth()));
  }
  _$jscoverage['/picker/render.js'].lineData[43]++;
  function beforeCurrentMonthYear(current, today) {
    _$jscoverage['/picker/render.js'].functionData[4]++;
    _$jscoverage['/picker/render.js'].lineData[44]++;
    if (visit36_44_1(current.getYear() < today.getYear())) {
      _$jscoverage['/picker/render.js'].lineData[45]++;
      return 1;
    }
    _$jscoverage['/picker/render.js'].lineData[47]++;
    return visit37_47_1(visit38_47_2(current.getYear() === today.getYear()) && visit39_48_1(current.getMonth() < today.getMonth()));
  }
  _$jscoverage['/picker/render.js'].lineData[51]++;
  function afterCurrentMonthYear(current, today) {
    _$jscoverage['/picker/render.js'].functionData[5]++;
    _$jscoverage['/picker/render.js'].lineData[52]++;
    if (visit40_52_1(current.getYear() > today.getYear())) {
      _$jscoverage['/picker/render.js'].lineData[53]++;
      return 1;
    }
    _$jscoverage['/picker/render.js'].lineData[55]++;
    return visit41_55_1(visit42_55_2(current.getYear() === today.getYear()) && visit43_56_1(current.getMonth() > today.getMonth()));
  }
  _$jscoverage['/picker/render.js'].lineData[59]++;
  function renderDatesCmd() {
    _$jscoverage['/picker/render.js'].functionData[6]++;
    _$jscoverage['/picker/render.js'].lineData[60]++;
    return this.config.view.renderDates();
  }
  _$jscoverage['/picker/render.js'].lineData[63]++;
  return Control.getDefaultRender().extend({
  getMonthYearLabel: function() {
  _$jscoverage['/picker/render.js'].functionData[7]++;
  _$jscoverage['/picker/render.js'].lineData[65]++;
  var self = this;
  _$jscoverage['/picker/render.js'].lineData[66]++;
  var control = self.control;
  _$jscoverage['/picker/render.js'].lineData[67]++;
  var locale = control.get('locale');
  _$jscoverage['/picker/render.js'].lineData[68]++;
  var value = control.get('value');
  _$jscoverage['/picker/render.js'].lineData[69]++;
  var dateLocale = value.getLocale();
  _$jscoverage['/picker/render.js'].lineData[70]++;
  return new DateTimeFormat(locale.monthYearFormat, dateLocale).format(value);
}, 
  getTodayTimeLabel: function() {
  _$jscoverage['/picker/render.js'].functionData[8]++;
  _$jscoverage['/picker/render.js'].lineData[74]++;
  var self = this;
  _$jscoverage['/picker/render.js'].lineData[75]++;
  var control = self.control;
  _$jscoverage['/picker/render.js'].lineData[76]++;
  var locale = control.get('locale');
  _$jscoverage['/picker/render.js'].lineData[77]++;
  var value = control.get('value');
  _$jscoverage['/picker/render.js'].lineData[78]++;
  var dateLocale = value.getLocale();
  _$jscoverage['/picker/render.js'].lineData[79]++;
  var today = value.clone();
  _$jscoverage['/picker/render.js'].lineData[80]++;
  today.setTime(S.now());
  _$jscoverage['/picker/render.js'].lineData[81]++;
  return new DateTimeFormat(locale.dateFormat, dateLocale).format(today);
}, 
  beforeCreateDom: function(renderData, childrenSelectors, renderCommands) {
  _$jscoverage['/picker/render.js'].functionData[9]++;
  _$jscoverage['/picker/render.js'].lineData[85]++;
  var self = this;
  _$jscoverage['/picker/render.js'].lineData[86]++;
  var control = self.control;
  _$jscoverage['/picker/render.js'].lineData[87]++;
  var locale = control.get('locale');
  _$jscoverage['/picker/render.js'].lineData[88]++;
  var value = control.get('value');
  _$jscoverage['/picker/render.js'].lineData[89]++;
  var dateLocale = value.getLocale();
  _$jscoverage['/picker/render.js'].lineData[90]++;
  S.mix(childrenSelectors, {
  monthSelectEl: '#ks-date-picker-month-select-{id}', 
  monthSelectContentEl: '#ks-date-picker-month-select-content-{id}', 
  previousMonthBtn: '#ks-date-picker-previous-month-btn-{id}', 
  nextMonthBtn: '#ks-date-picker-next-month-btn-{id}', 
  previousYearBtn: '#ks-date-picker-previous-year-btn-{id}', 
  nextYearBtn: '#ks-date-picker-next-year-btn-{id}', 
  todayBtnEl: '#ks-date-picker-today-btn-{id}', 
  clearBtnEl: '#ks-date-picker-clear-btn-{id}', 
  tbodyEl: '#ks-date-picker-tbody-{id}'});
  _$jscoverage['/picker/render.js'].lineData[101]++;
  var veryShortWeekdays = [];
  _$jscoverage['/picker/render.js'].lineData[102]++;
  var weekDays = [];
  _$jscoverage['/picker/render.js'].lineData[103]++;
  var firstDayOfWeek = value.getFirstDayOfWeek();
  _$jscoverage['/picker/render.js'].lineData[104]++;
  for (var i = 0; visit44_104_1(i < DATE_COL_COUNT); i++) {
    _$jscoverage['/picker/render.js'].lineData[105]++;
    var index = (firstDayOfWeek + i) % DATE_COL_COUNT;
    _$jscoverage['/picker/render.js'].lineData[106]++;
    veryShortWeekdays[i] = locale.veryShortWeekdays[index];
    _$jscoverage['/picker/render.js'].lineData[107]++;
    weekDays[i] = dateLocale.weekdays[index];
  }
  _$jscoverage['/picker/render.js'].lineData[109]++;
  S.mix(renderData, {
  monthSelectLabel: locale.monthSelect, 
  monthYearLabel: self.getMonthYearLabel(), 
  previousMonthLabel: locale.previousMonth, 
  nextMonthLabel: locale.nextMonth, 
  previousYearLabel: locale.previousYear, 
  nextYearLabel: locale.nextYear, 
  weekdays: weekDays, 
  veryShortWeekdays: veryShortWeekdays, 
  todayLabel: locale.today, 
  clearLabel: locale.clear, 
  todayTimeLabel: self.getTodayTimeLabel()});
  _$jscoverage['/picker/render.js'].lineData[122]++;
  renderCommands.renderDates = renderDatesCmd;
}, 
  renderDates: function() {
  _$jscoverage['/picker/render.js'].functionData[10]++;
  _$jscoverage['/picker/render.js'].lineData[126]++;
  var self = this, i, j, dateTable = [], current, control = self.control, isClear = control.get('clear'), showWeekNumber = control.get('showWeekNumber'), locale = control.get('locale'), value = control.get('value'), today = value.clone(), cellClass = self.getBaseCssClasses('cell'), weekNumberCellClass = self.getBaseCssClasses('week-number-cell'), dateClass = self.getBaseCssClasses('date'), dateRender = control.get('dateRender'), disabledDate = control.get('disabledDate'), dateLocale = value.getLocale(), dateFormatter = new DateTimeFormat(locale.dateFormat, dateLocale), todayClass = self.getBaseCssClasses('today'), selectedClass = self.getBaseCssClasses('selected-day'), lastMonthDayClass = self.getBaseCssClasses('last-month-cell'), nextMonthDayClass = self.getBaseCssClasses('next-month-btn-day'), disabledClass = self.getBaseCssClasses('disabled-cell');
  _$jscoverage['/picker/render.js'].lineData[149]++;
  today.setTime(S.now());
  _$jscoverage['/picker/render.js'].lineData[150]++;
  var month1 = value.clone();
  _$jscoverage['/picker/render.js'].lineData[151]++;
  month1.set(value.getYear(), value.getMonth(), 1);
  _$jscoverage['/picker/render.js'].lineData[152]++;
  var day = month1.getDayOfWeek();
  _$jscoverage['/picker/render.js'].lineData[153]++;
  var lastMonthDiffDay = (day + 7 - value.getFirstDayOfWeek()) % 7;
  _$jscoverage['/picker/render.js'].lineData[155]++;
  var lastMonth1 = month1.clone();
  _$jscoverage['/picker/render.js'].lineData[156]++;
  lastMonth1.addDayOfMonth(-lastMonthDiffDay);
  _$jscoverage['/picker/render.js'].lineData[157]++;
  var passed = 0;
  _$jscoverage['/picker/render.js'].lineData[158]++;
  for (i = 0; visit45_158_1(i < DATE_ROW_COUNT); i++) {
    _$jscoverage['/picker/render.js'].lineData[159]++;
    for (j = 0; visit46_159_1(j < DATE_COL_COUNT); j++) {
      _$jscoverage['/picker/render.js'].lineData[160]++;
      current = lastMonth1;
      _$jscoverage['/picker/render.js'].lineData[161]++;
      if (visit47_161_1(passed)) {
        _$jscoverage['/picker/render.js'].lineData[162]++;
        current = current.clone();
        _$jscoverage['/picker/render.js'].lineData[163]++;
        current.addDayOfMonth(passed);
      }
      _$jscoverage['/picker/render.js'].lineData[165]++;
      dateTable.push(current);
      _$jscoverage['/picker/render.js'].lineData[166]++;
      passed++;
    }
  }
  _$jscoverage['/picker/render.js'].lineData[169]++;
  var tableHtml = '';
  _$jscoverage['/picker/render.js'].lineData[170]++;
  passed = 0;
  _$jscoverage['/picker/render.js'].lineData[171]++;
  for (i = 0; visit48_171_1(i < DATE_ROW_COUNT); i++) {
    _$jscoverage['/picker/render.js'].lineData[172]++;
    var rowHtml = dateRowTplStart;
    _$jscoverage['/picker/render.js'].lineData[173]++;
    if (visit49_173_1(showWeekNumber)) {
      _$jscoverage['/picker/render.js'].lineData[174]++;
      rowHtml += S.substitute(weekNumberCellTpl, {
  cls: weekNumberCellClass, 
  content: dateTable[passed].getWeekOfYear()});
    }
    _$jscoverage['/picker/render.js'].lineData[179]++;
    for (j = 0; visit50_179_1(j < DATE_COL_COUNT); j++) {
      _$jscoverage['/picker/render.js'].lineData[180]++;
      current = dateTable[passed];
      _$jscoverage['/picker/render.js'].lineData[181]++;
      var cls = cellClass;
      _$jscoverage['/picker/render.js'].lineData[182]++;
      var disabled = false;
      _$jscoverage['/picker/render.js'].lineData[183]++;
      var selected = false;
      _$jscoverage['/picker/render.js'].lineData[185]++;
      if (visit51_185_1(isSameDay(current, today))) {
        _$jscoverage['/picker/render.js'].lineData[186]++;
        cls += ' ' + todayClass;
      }
      _$jscoverage['/picker/render.js'].lineData[188]++;
      if (visit52_188_1(!isClear && isSameDay(current, value))) {
        _$jscoverage['/picker/render.js'].lineData[189]++;
        cls += ' ' + selectedClass;
        _$jscoverage['/picker/render.js'].lineData[190]++;
        selected = true;
      }
      _$jscoverage['/picker/render.js'].lineData[192]++;
      if (visit53_192_1(beforeCurrentMonthYear(current, value))) {
        _$jscoverage['/picker/render.js'].lineData[193]++;
        cls += ' ' + lastMonthDayClass;
      }
      _$jscoverage['/picker/render.js'].lineData[195]++;
      if (visit54_195_1(afterCurrentMonthYear(current, value))) {
        _$jscoverage['/picker/render.js'].lineData[196]++;
        cls += ' ' + nextMonthDayClass;
      }
      _$jscoverage['/picker/render.js'].lineData[198]++;
      if (visit55_198_1(disabledDate && disabledDate(current, value))) {
        _$jscoverage['/picker/render.js'].lineData[199]++;
        cls += ' ' + disabledClass;
        _$jscoverage['/picker/render.js'].lineData[200]++;
        disabled = true;
      }
      _$jscoverage['/picker/render.js'].lineData[203]++;
      var dateHtml = '';
      _$jscoverage['/picker/render.js'].lineData[204]++;
      if (visit56_204_1(!(visit57_204_2(dateRender && (dateHtml = dateRender(current, value)))))) {
        _$jscoverage['/picker/render.js'].lineData[205]++;
        dateHtml = S.substitute(dateTpl, {
  cls: dateClass, 
  id: getIdFromDate(current), 
  selected: selected, 
  disabled: disabled, 
  content: current.getDayOfMonth()});
      }
      _$jscoverage['/picker/render.js'].lineData[213]++;
      rowHtml += S.substitute(dateCellTpl, {
  cls: cls, 
  index: passed, 
  title: dateFormatter.format(current), 
  content: dateHtml});
      _$jscoverage['/picker/render.js'].lineData[219]++;
      passed++;
    }
    _$jscoverage['/picker/render.js'].lineData[221]++;
    tableHtml += rowHtml + dateRowTplEnd;
  }
  _$jscoverage['/picker/render.js'].lineData[223]++;
  control.dateTable = dateTable;
  _$jscoverage['/picker/render.js'].lineData[224]++;
  return tableHtml;
}, 
  createDom: function() {
  _$jscoverage['/picker/render.js'].functionData[11]++;
  _$jscoverage['/picker/render.js'].lineData[228]++;
  this.$el.attr('aria-activedescendant', getIdFromDate(this.control.get('value')));
}, 
  '_onSetClear': function(v) {
  _$jscoverage['/picker/render.js'].functionData[12]++;
  _$jscoverage['/picker/render.js'].lineData[232]++;
  var control = this.control;
  _$jscoverage['/picker/render.js'].lineData[233]++;
  var value = control.get('value');
  _$jscoverage['/picker/render.js'].lineData[234]++;
  var selectedCls = this.getBaseCssClasses('selected-day');
  _$jscoverage['/picker/render.js'].lineData[235]++;
  var id = getIdFromDate(value);
  _$jscoverage['/picker/render.js'].lineData[236]++;
  var currentA = this.$('#' + id);
  _$jscoverage['/picker/render.js'].lineData[237]++;
  if (visit58_237_1(v)) {
    _$jscoverage['/picker/render.js'].lineData[238]++;
    currentA.parent().removeClass(selectedCls);
    _$jscoverage['/picker/render.js'].lineData[239]++;
    currentA.attr('aria-selected', false);
    _$jscoverage['/picker/render.js'].lineData[240]++;
    this.$el.attr('aria-activedescendant', '');
  } else {
    _$jscoverage['/picker/render.js'].lineData[242]++;
    currentA.parent().addClass(selectedCls);
    _$jscoverage['/picker/render.js'].lineData[243]++;
    currentA.attr('aria-selected', true);
    _$jscoverage['/picker/render.js'].lineData[244]++;
    this.$el.attr('aria-activedescendant', id);
  }
}, 
  _onSetValue: function(value, e) {
  _$jscoverage['/picker/render.js'].functionData[13]++;
  _$jscoverage['/picker/render.js'].lineData[250]++;
  var control = this.control;
  _$jscoverage['/picker/render.js'].lineData[251]++;
  var preValue = e.prevVal;
  _$jscoverage['/picker/render.js'].lineData[252]++;
  if (visit59_252_1(isSameMonth(preValue, value))) {
    _$jscoverage['/picker/render.js'].lineData[253]++;
    var disabledDate = control.get('disabledDate');
    _$jscoverage['/picker/render.js'].lineData[254]++;
    var selectedCls = this.getBaseCssClasses('selected-day');
    _$jscoverage['/picker/render.js'].lineData[255]++;
    var prevA = this.$('#' + getIdFromDate(preValue));
    _$jscoverage['/picker/render.js'].lineData[256]++;
    prevA.parent().removeClass(selectedCls);
    _$jscoverage['/picker/render.js'].lineData[257]++;
    prevA.attr('aria-selected', false);
    _$jscoverage['/picker/render.js'].lineData[258]++;
    if (visit60_258_1(!(visit61_258_2(disabledDate && disabledDate(value, value))))) {
      _$jscoverage['/picker/render.js'].lineData[259]++;
      var currentA = this.$('#' + getIdFromDate(value));
      _$jscoverage['/picker/render.js'].lineData[260]++;
      currentA.parent().addClass(selectedCls);
      _$jscoverage['/picker/render.js'].lineData[261]++;
      currentA.attr('aria-selected', true);
    }
  } else {
    _$jscoverage['/picker/render.js'].lineData[264]++;
    var tbodyEl = control.get('tbodyEl');
    _$jscoverage['/picker/render.js'].lineData[265]++;
    var monthSelectContentEl = control.get('monthSelectContentEl');
    _$jscoverage['/picker/render.js'].lineData[266]++;
    var todayBtnEl = control.get('todayBtnEl');
    _$jscoverage['/picker/render.js'].lineData[267]++;
    monthSelectContentEl.html(this.getMonthYearLabel());
    _$jscoverage['/picker/render.js'].lineData[268]++;
    todayBtnEl.attr('title', this.getTodayTimeLabel());
    _$jscoverage['/picker/render.js'].lineData[269]++;
    tbodyEl.html(this.renderDates());
  }
  _$jscoverage['/picker/render.js'].lineData[271]++;
  this.$el.attr('aria-activedescendant', getIdFromDate(value));
}}, {
  name: 'date-picker-render', 
  ATTRS: {
  contentTpl: {
  value: PickerTpl}}});
});
