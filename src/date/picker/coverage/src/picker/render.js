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
  _$jscoverage['/picker/render.js'].lineData[8] = 0;
  _$jscoverage['/picker/render.js'].lineData[11] = 0;
  _$jscoverage['/picker/render.js'].lineData[12] = 0;
  _$jscoverage['/picker/render.js'].lineData[13] = 0;
  _$jscoverage['/picker/render.js'].lineData[14] = 0;
  _$jscoverage['/picker/render.js'].lineData[15] = 0;
  _$jscoverage['/picker/render.js'].lineData[24] = 0;
  _$jscoverage['/picker/render.js'].lineData[25] = 0;
  _$jscoverage['/picker/render.js'].lineData[27] = 0;
  _$jscoverage['/picker/render.js'].lineData[28] = 0;
  _$jscoverage['/picker/render.js'].lineData[33] = 0;
  _$jscoverage['/picker/render.js'].lineData[34] = 0;
  _$jscoverage['/picker/render.js'].lineData[39] = 0;
  _$jscoverage['/picker/render.js'].lineData[40] = 0;
  _$jscoverage['/picker/render.js'].lineData[44] = 0;
  _$jscoverage['/picker/render.js'].lineData[45] = 0;
  _$jscoverage['/picker/render.js'].lineData[46] = 0;
  _$jscoverage['/picker/render.js'].lineData[48] = 0;
  _$jscoverage['/picker/render.js'].lineData[52] = 0;
  _$jscoverage['/picker/render.js'].lineData[53] = 0;
  _$jscoverage['/picker/render.js'].lineData[54] = 0;
  _$jscoverage['/picker/render.js'].lineData[56] = 0;
  _$jscoverage['/picker/render.js'].lineData[60] = 0;
  _$jscoverage['/picker/render.js'].lineData[61] = 0;
  _$jscoverage['/picker/render.js'].lineData[64] = 0;
  _$jscoverage['/picker/render.js'].lineData[66] = 0;
  _$jscoverage['/picker/render.js'].lineData[67] = 0;
  _$jscoverage['/picker/render.js'].lineData[68] = 0;
  _$jscoverage['/picker/render.js'].lineData[69] = 0;
  _$jscoverage['/picker/render.js'].lineData[70] = 0;
  _$jscoverage['/picker/render.js'].lineData[71] = 0;
  _$jscoverage['/picker/render.js'].lineData[75] = 0;
  _$jscoverage['/picker/render.js'].lineData[76] = 0;
  _$jscoverage['/picker/render.js'].lineData[77] = 0;
  _$jscoverage['/picker/render.js'].lineData[78] = 0;
  _$jscoverage['/picker/render.js'].lineData[79] = 0;
  _$jscoverage['/picker/render.js'].lineData[80] = 0;
  _$jscoverage['/picker/render.js'].lineData[81] = 0;
  _$jscoverage['/picker/render.js'].lineData[82] = 0;
  _$jscoverage['/picker/render.js'].lineData[86] = 0;
  _$jscoverage['/picker/render.js'].lineData[87] = 0;
  _$jscoverage['/picker/render.js'].lineData[88] = 0;
  _$jscoverage['/picker/render.js'].lineData[89] = 0;
  _$jscoverage['/picker/render.js'].lineData[90] = 0;
  _$jscoverage['/picker/render.js'].lineData[91] = 0;
  _$jscoverage['/picker/render.js'].lineData[102] = 0;
  _$jscoverage['/picker/render.js'].lineData[103] = 0;
  _$jscoverage['/picker/render.js'].lineData[104] = 0;
  _$jscoverage['/picker/render.js'].lineData[105] = 0;
  _$jscoverage['/picker/render.js'].lineData[106] = 0;
  _$jscoverage['/picker/render.js'].lineData[107] = 0;
  _$jscoverage['/picker/render.js'].lineData[108] = 0;
  _$jscoverage['/picker/render.js'].lineData[110] = 0;
  _$jscoverage['/picker/render.js'].lineData[123] = 0;
  _$jscoverage['/picker/render.js'].lineData[127] = 0;
  _$jscoverage['/picker/render.js'].lineData[150] = 0;
  _$jscoverage['/picker/render.js'].lineData[151] = 0;
  _$jscoverage['/picker/render.js'].lineData[152] = 0;
  _$jscoverage['/picker/render.js'].lineData[153] = 0;
  _$jscoverage['/picker/render.js'].lineData[154] = 0;
  _$jscoverage['/picker/render.js'].lineData[156] = 0;
  _$jscoverage['/picker/render.js'].lineData[157] = 0;
  _$jscoverage['/picker/render.js'].lineData[158] = 0;
  _$jscoverage['/picker/render.js'].lineData[159] = 0;
  _$jscoverage['/picker/render.js'].lineData[160] = 0;
  _$jscoverage['/picker/render.js'].lineData[161] = 0;
  _$jscoverage['/picker/render.js'].lineData[162] = 0;
  _$jscoverage['/picker/render.js'].lineData[163] = 0;
  _$jscoverage['/picker/render.js'].lineData[164] = 0;
  _$jscoverage['/picker/render.js'].lineData[166] = 0;
  _$jscoverage['/picker/render.js'].lineData[167] = 0;
  _$jscoverage['/picker/render.js'].lineData[170] = 0;
  _$jscoverage['/picker/render.js'].lineData[171] = 0;
  _$jscoverage['/picker/render.js'].lineData[172] = 0;
  _$jscoverage['/picker/render.js'].lineData[173] = 0;
  _$jscoverage['/picker/render.js'].lineData[174] = 0;
  _$jscoverage['/picker/render.js'].lineData[175] = 0;
  _$jscoverage['/picker/render.js'].lineData[180] = 0;
  _$jscoverage['/picker/render.js'].lineData[181] = 0;
  _$jscoverage['/picker/render.js'].lineData[182] = 0;
  _$jscoverage['/picker/render.js'].lineData[183] = 0;
  _$jscoverage['/picker/render.js'].lineData[184] = 0;
  _$jscoverage['/picker/render.js'].lineData[186] = 0;
  _$jscoverage['/picker/render.js'].lineData[187] = 0;
  _$jscoverage['/picker/render.js'].lineData[189] = 0;
  _$jscoverage['/picker/render.js'].lineData[190] = 0;
  _$jscoverage['/picker/render.js'].lineData[191] = 0;
  _$jscoverage['/picker/render.js'].lineData[193] = 0;
  _$jscoverage['/picker/render.js'].lineData[194] = 0;
  _$jscoverage['/picker/render.js'].lineData[196] = 0;
  _$jscoverage['/picker/render.js'].lineData[197] = 0;
  _$jscoverage['/picker/render.js'].lineData[199] = 0;
  _$jscoverage['/picker/render.js'].lineData[200] = 0;
  _$jscoverage['/picker/render.js'].lineData[201] = 0;
  _$jscoverage['/picker/render.js'].lineData[204] = 0;
  _$jscoverage['/picker/render.js'].lineData[205] = 0;
  _$jscoverage['/picker/render.js'].lineData[207] = 0;
  _$jscoverage['/picker/render.js'].lineData[215] = 0;
  _$jscoverage['/picker/render.js'].lineData[221] = 0;
  _$jscoverage['/picker/render.js'].lineData[223] = 0;
  _$jscoverage['/picker/render.js'].lineData[225] = 0;
  _$jscoverage['/picker/render.js'].lineData[226] = 0;
  _$jscoverage['/picker/render.js'].lineData[230] = 0;
  _$jscoverage['/picker/render.js'].lineData[234] = 0;
  _$jscoverage['/picker/render.js'].lineData[235] = 0;
  _$jscoverage['/picker/render.js'].lineData[236] = 0;
  _$jscoverage['/picker/render.js'].lineData[237] = 0;
  _$jscoverage['/picker/render.js'].lineData[238] = 0;
  _$jscoverage['/picker/render.js'].lineData[239] = 0;
  _$jscoverage['/picker/render.js'].lineData[240] = 0;
  _$jscoverage['/picker/render.js'].lineData[241] = 0;
  _$jscoverage['/picker/render.js'].lineData[242] = 0;
  _$jscoverage['/picker/render.js'].lineData[244] = 0;
  _$jscoverage['/picker/render.js'].lineData[245] = 0;
  _$jscoverage['/picker/render.js'].lineData[246] = 0;
  _$jscoverage['/picker/render.js'].lineData[252] = 0;
  _$jscoverage['/picker/render.js'].lineData[253] = 0;
  _$jscoverage['/picker/render.js'].lineData[254] = 0;
  _$jscoverage['/picker/render.js'].lineData[255] = 0;
  _$jscoverage['/picker/render.js'].lineData[256] = 0;
  _$jscoverage['/picker/render.js'].lineData[257] = 0;
  _$jscoverage['/picker/render.js'].lineData[258] = 0;
  _$jscoverage['/picker/render.js'].lineData[259] = 0;
  _$jscoverage['/picker/render.js'].lineData[260] = 0;
  _$jscoverage['/picker/render.js'].lineData[262] = 0;
  _$jscoverage['/picker/render.js'].lineData[263] = 0;
  _$jscoverage['/picker/render.js'].lineData[264] = 0;
  _$jscoverage['/picker/render.js'].lineData[267] = 0;
  _$jscoverage['/picker/render.js'].lineData[268] = 0;
  _$jscoverage['/picker/render.js'].lineData[269] = 0;
  _$jscoverage['/picker/render.js'].lineData[270] = 0;
  _$jscoverage['/picker/render.js'].lineData[271] = 0;
  _$jscoverage['/picker/render.js'].lineData[272] = 0;
  _$jscoverage['/picker/render.js'].lineData[274] = 0;
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
  _$jscoverage['/picker/render.js'].branchData['34'] = [];
  _$jscoverage['/picker/render.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['34'][2] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['35'] = [];
  _$jscoverage['/picker/render.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['35'][2] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['36'] = [];
  _$jscoverage['/picker/render.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['40'] = [];
  _$jscoverage['/picker/render.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['40'][2] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['41'] = [];
  _$jscoverage['/picker/render.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['45'] = [];
  _$jscoverage['/picker/render.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['48'] = [];
  _$jscoverage['/picker/render.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['48'][2] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['49'] = [];
  _$jscoverage['/picker/render.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['53'] = [];
  _$jscoverage['/picker/render.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['56'] = [];
  _$jscoverage['/picker/render.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['56'][2] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['57'] = [];
  _$jscoverage['/picker/render.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['105'] = [];
  _$jscoverage['/picker/render.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['159'] = [];
  _$jscoverage['/picker/render.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['160'] = [];
  _$jscoverage['/picker/render.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['162'] = [];
  _$jscoverage['/picker/render.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['172'] = [];
  _$jscoverage['/picker/render.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['174'] = [];
  _$jscoverage['/picker/render.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['180'] = [];
  _$jscoverage['/picker/render.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['186'] = [];
  _$jscoverage['/picker/render.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['189'] = [];
  _$jscoverage['/picker/render.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['193'] = [];
  _$jscoverage['/picker/render.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['196'] = [];
  _$jscoverage['/picker/render.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['199'] = [];
  _$jscoverage['/picker/render.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['205'] = [];
  _$jscoverage['/picker/render.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['239'] = [];
  _$jscoverage['/picker/render.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['254'] = [];
  _$jscoverage['/picker/render.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/picker/render.js'].branchData['260'] = [];
  _$jscoverage['/picker/render.js'].branchData['260'][1] = new BranchData();
}
_$jscoverage['/picker/render.js'].branchData['260'][1].init(335, 42, 'disabledDate && disabledDate(value, value)');
function visit50_260_1(result) {
  _$jscoverage['/picker/render.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['254'][1].init(95, 28, 'isSameMonth(preValue, value)');
function visit49_254_1(result) {
  _$jscoverage['/picker/render.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['239'][1].init(261, 1, 'v');
function visit48_239_1(result) {
  _$jscoverage['/picker/render.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['205'][1].init(1018, 53, 'dateRender && (dateHtml = dateRender(current, value))');
function visit47_205_1(result) {
  _$jscoverage['/picker/render.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['199'][1].init(791, 44, 'disabledDate && disabledDate(current, value)');
function visit46_199_1(result) {
  _$jscoverage['/picker/render.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['196'][1].init(648, 37, 'afterCurrentMonthYear(current, value)');
function visit45_196_1(result) {
  _$jscoverage['/picker/render.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['193'][1].init(504, 38, 'beforeCurrentMonthYear(current, value)');
function visit44_193_1(result) {
  _$jscoverage['/picker/render.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['189'][1].init(324, 37, '!isClear && isSameDay(current, value)');
function visit43_189_1(result) {
  _$jscoverage['/picker/render.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['186'][1].init(200, 25, 'isSameDay(current, today)');
function visit42_186_1(result) {
  _$jscoverage['/picker/render.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['180'][1].init(338, 18, 'j < DATE_COL_COUNT');
function visit41_180_1(result) {
  _$jscoverage['/picker/render.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['174'][1].init(68, 14, 'showWeekNumber');
function visit40_174_1(result) {
  _$jscoverage['/picker/render.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['172'][1].init(2136, 18, 'i < DATE_ROW_COUNT');
function visit39_172_1(result) {
  _$jscoverage['/picker/render.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['162'][1].init(67, 6, 'passed');
function visit38_162_1(result) {
  _$jscoverage['/picker/render.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['160'][1].init(29, 18, 'j < DATE_COL_COUNT');
function visit37_160_1(result) {
  _$jscoverage['/picker/render.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['159'][1].init(1663, 18, 'i < DATE_ROW_COUNT');
function visit36_159_1(result) {
  _$jscoverage['/picker/render.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['105'][1].init(1043, 18, 'i < DATE_COL_COUNT');
function visit35_105_1(result) {
  _$jscoverage['/picker/render.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['57'][1].init(51, 37, 'current.getMonth() > today.getMonth()');
function visit34_57_1(result) {
  _$jscoverage['/picker/render.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['56'][2].init(99, 36, 'current.getYear() == today.getYear()');
function visit33_56_2(result) {
  _$jscoverage['/picker/render.js'].branchData['56'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['56'][1].init(99, 89, 'current.getYear() == today.getYear() && current.getMonth() > today.getMonth()');
function visit32_56_1(result) {
  _$jscoverage['/picker/render.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['53'][1].init(13, 35, 'current.getYear() > today.getYear()');
function visit31_53_1(result) {
  _$jscoverage['/picker/render.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['49'][1].init(51, 37, 'current.getMonth() < today.getMonth()');
function visit30_49_1(result) {
  _$jscoverage['/picker/render.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['48'][2].init(99, 36, 'current.getYear() == today.getYear()');
function visit29_48_2(result) {
  _$jscoverage['/picker/render.js'].branchData['48'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['48'][1].init(99, 89, 'current.getYear() == today.getYear() && current.getMonth() < today.getMonth()');
function visit28_48_1(result) {
  _$jscoverage['/picker/render.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['45'][1].init(13, 35, 'current.getYear() < today.getYear()');
function visit27_45_1(result) {
  _$jscoverage['/picker/render.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['41'][1].init(45, 32, 'one.getMonth() == two.getMonth()');
function visit26_41_1(result) {
  _$jscoverage['/picker/render.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['40'][2].init(16, 30, 'one.getYear() == two.getYear()');
function visit25_40_2(result) {
  _$jscoverage['/picker/render.js'].branchData['40'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['40'][1].init(16, 78, 'one.getYear() == two.getYear() && one.getMonth() == two.getMonth()');
function visit24_40_1(result) {
  _$jscoverage['/picker/render.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['36'][1].init(47, 42, 'one.getDayOfMonth() == two.getDayOfMonth()');
function visit23_36_1(result) {
  _$jscoverage['/picker/render.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['35'][2].init(64, 32, 'one.getMonth() == two.getMonth()');
function visit22_35_2(result) {
  _$jscoverage['/picker/render.js'].branchData['35'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['35'][1].init(45, 90, 'one.getMonth() == two.getMonth() && one.getDayOfMonth() == two.getDayOfMonth()');
function visit21_35_1(result) {
  _$jscoverage['/picker/render.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['34'][2].init(16, 30, 'one.getYear() == two.getYear()');
function visit20_34_2(result) {
  _$jscoverage['/picker/render.js'].branchData['34'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].branchData['34'][1].init(16, 136, 'one.getYear() == two.getYear() && one.getMonth() == two.getMonth() && one.getDayOfMonth() == two.getDayOfMonth()');
function visit19_34_1(result) {
  _$jscoverage['/picker/render.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/render.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/picker/render.js'].functionData[0]++;
  _$jscoverage['/picker/render.js'].lineData[7]++;
  var module = this;
  _$jscoverage['/picker/render.js'].lineData[8]++;
  var DateTimeFormat = module.require('date/format'), PickerTpl = module.require('./picker-xtpl'), Control = module.require('component/control');
  _$jscoverage['/picker/render.js'].lineData[11]++;
  var dateRowTplStart = '<tr role="row">';
  _$jscoverage['/picker/render.js'].lineData[12]++;
  var dateRowTplEnd = '</tr>';
  _$jscoverage['/picker/render.js'].lineData[13]++;
  var dateCellTpl = '<td role="gridcell" data-index="{index}" title="{title}" class="{cls}">{content}</td>';
  _$jscoverage['/picker/render.js'].lineData[14]++;
  var weekNumberCellTpl = '<td role="gridcell" class="{cls}">{content}</td>';
  _$jscoverage['/picker/render.js'].lineData[15]++;
  var dateTpl = '<a ' + ' id="{id}" ' + ' hidefocus="on" ' + ' unselectable="on" ' + ' tabindex="-1" ' + ' class="{cls}" ' + ' href="#" ' + ' aria-selected="{selected}" ' + ' aria-disabled="{disabled}">{content}</a>';
  _$jscoverage['/picker/render.js'].lineData[24]++;
  var DATE_ROW_COUNT = 6;
  _$jscoverage['/picker/render.js'].lineData[25]++;
  var DATE_COL_COUNT = 7;
  _$jscoverage['/picker/render.js'].lineData[27]++;
  function getIdFromDate(d) {
    _$jscoverage['/picker/render.js'].functionData[1]++;
    _$jscoverage['/picker/render.js'].lineData[28]++;
    return 'ks-date-picker-date-' + d.getYear() + '-' + d.getMonth() + '-' + d.getDayOfMonth();
  }
  _$jscoverage['/picker/render.js'].lineData[33]++;
  function isSameDay(one, two) {
    _$jscoverage['/picker/render.js'].functionData[2]++;
    _$jscoverage['/picker/render.js'].lineData[34]++;
    return visit19_34_1(visit20_34_2(one.getYear() == two.getYear()) && visit21_35_1(visit22_35_2(one.getMonth() == two.getMonth()) && visit23_36_1(one.getDayOfMonth() == two.getDayOfMonth())));
  }
  _$jscoverage['/picker/render.js'].lineData[39]++;
  function isSameMonth(one, two) {
    _$jscoverage['/picker/render.js'].functionData[3]++;
    _$jscoverage['/picker/render.js'].lineData[40]++;
    return visit24_40_1(visit25_40_2(one.getYear() == two.getYear()) && visit26_41_1(one.getMonth() == two.getMonth()));
  }
  _$jscoverage['/picker/render.js'].lineData[44]++;
  function beforeCurrentMonthYear(current, today) {
    _$jscoverage['/picker/render.js'].functionData[4]++;
    _$jscoverage['/picker/render.js'].lineData[45]++;
    if (visit27_45_1(current.getYear() < today.getYear())) {
      _$jscoverage['/picker/render.js'].lineData[46]++;
      return 1;
    }
    _$jscoverage['/picker/render.js'].lineData[48]++;
    return visit28_48_1(visit29_48_2(current.getYear() == today.getYear()) && visit30_49_1(current.getMonth() < today.getMonth()));
  }
  _$jscoverage['/picker/render.js'].lineData[52]++;
  function afterCurrentMonthYear(current, today) {
    _$jscoverage['/picker/render.js'].functionData[5]++;
    _$jscoverage['/picker/render.js'].lineData[53]++;
    if (visit31_53_1(current.getYear() > today.getYear())) {
      _$jscoverage['/picker/render.js'].lineData[54]++;
      return 1;
    }
    _$jscoverage['/picker/render.js'].lineData[56]++;
    return visit32_56_1(visit33_56_2(current.getYear() == today.getYear()) && visit34_57_1(current.getMonth() > today.getMonth()));
  }
  _$jscoverage['/picker/render.js'].lineData[60]++;
  function renderDatesCmd() {
    _$jscoverage['/picker/render.js'].functionData[6]++;
    _$jscoverage['/picker/render.js'].lineData[61]++;
    return this.config.view.renderDates();
  }
  _$jscoverage['/picker/render.js'].lineData[64]++;
  return Control.getDefaultRender().extend({
  getMonthYearLabel: function() {
  _$jscoverage['/picker/render.js'].functionData[7]++;
  _$jscoverage['/picker/render.js'].lineData[66]++;
  var self = this;
  _$jscoverage['/picker/render.js'].lineData[67]++;
  var control = self.control;
  _$jscoverage['/picker/render.js'].lineData[68]++;
  var locale = control.get('locale');
  _$jscoverage['/picker/render.js'].lineData[69]++;
  var value = control.get('value');
  _$jscoverage['/picker/render.js'].lineData[70]++;
  var dateLocale = value.getLocale();
  _$jscoverage['/picker/render.js'].lineData[71]++;
  return new DateTimeFormat(locale.monthYearFormat, dateLocale).format(value);
}, 
  getTodayTimeLabel: function() {
  _$jscoverage['/picker/render.js'].functionData[8]++;
  _$jscoverage['/picker/render.js'].lineData[75]++;
  var self = this;
  _$jscoverage['/picker/render.js'].lineData[76]++;
  var control = self.control;
  _$jscoverage['/picker/render.js'].lineData[77]++;
  var locale = control.get('locale');
  _$jscoverage['/picker/render.js'].lineData[78]++;
  var value = control.get('value');
  _$jscoverage['/picker/render.js'].lineData[79]++;
  var dateLocale = value.getLocale();
  _$jscoverage['/picker/render.js'].lineData[80]++;
  var today = value.clone();
  _$jscoverage['/picker/render.js'].lineData[81]++;
  today.setTime(S.now());
  _$jscoverage['/picker/render.js'].lineData[82]++;
  return new DateTimeFormat(locale.dateFormat, dateLocale).format(today);
}, 
  beforeCreateDom: function(renderData, childrenSelectors, renderCommands) {
  _$jscoverage['/picker/render.js'].functionData[9]++;
  _$jscoverage['/picker/render.js'].lineData[86]++;
  var self = this;
  _$jscoverage['/picker/render.js'].lineData[87]++;
  var control = self.control;
  _$jscoverage['/picker/render.js'].lineData[88]++;
  var locale = control.get('locale');
  _$jscoverage['/picker/render.js'].lineData[89]++;
  var value = control.get('value');
  _$jscoverage['/picker/render.js'].lineData[90]++;
  var dateLocale = value.getLocale();
  _$jscoverage['/picker/render.js'].lineData[91]++;
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
  _$jscoverage['/picker/render.js'].lineData[102]++;
  var veryShortWeekdays = [];
  _$jscoverage['/picker/render.js'].lineData[103]++;
  var weekDays = [];
  _$jscoverage['/picker/render.js'].lineData[104]++;
  var firstDayOfWeek = value.getFirstDayOfWeek();
  _$jscoverage['/picker/render.js'].lineData[105]++;
  for (var i = 0; visit35_105_1(i < DATE_COL_COUNT); i++) {
    _$jscoverage['/picker/render.js'].lineData[106]++;
    var index = (firstDayOfWeek + i) % DATE_COL_COUNT;
    _$jscoverage['/picker/render.js'].lineData[107]++;
    veryShortWeekdays[i] = locale.veryShortWeekdays[index];
    _$jscoverage['/picker/render.js'].lineData[108]++;
    weekDays[i] = dateLocale.weekdays[index];
  }
  _$jscoverage['/picker/render.js'].lineData[110]++;
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
  _$jscoverage['/picker/render.js'].lineData[123]++;
  renderCommands.renderDates = renderDatesCmd;
}, 
  renderDates: function() {
  _$jscoverage['/picker/render.js'].functionData[10]++;
  _$jscoverage['/picker/render.js'].lineData[127]++;
  var self = this, i, j, dateTable = [], current, control = self.control, isClear = control.get('clear'), showWeekNumber = control.get('showWeekNumber'), locale = control.get('locale'), value = control.get('value'), today = value.clone(), cellClass = self.getBaseCssClasses('cell'), weekNumberCellClass = self.getBaseCssClasses('week-number-cell'), dateClass = self.getBaseCssClasses('date'), dateRender = control.get('dateRender'), disabledDate = control.get('disabledDate'), dateLocale = value.getLocale(), dateFormatter = new DateTimeFormat(locale.dateFormat, dateLocale), todayClass = self.getBaseCssClasses('today'), selectedClass = self.getBaseCssClasses('selected-day'), lastMonthDayClass = self.getBaseCssClasses('last-month-cell'), nextMonthDayClass = self.getBaseCssClasses('next-month-btn-day'), disabledClass = self.getBaseCssClasses('disabled-cell');
  _$jscoverage['/picker/render.js'].lineData[150]++;
  today.setTime(S.now());
  _$jscoverage['/picker/render.js'].lineData[151]++;
  var month1 = value.clone();
  _$jscoverage['/picker/render.js'].lineData[152]++;
  month1.set(value.getYear(), value.getMonth(), 1);
  _$jscoverage['/picker/render.js'].lineData[153]++;
  var day = month1.getDayOfWeek();
  _$jscoverage['/picker/render.js'].lineData[154]++;
  var lastMonthDiffDay = (day + 7 - value.getFirstDayOfWeek()) % 7;
  _$jscoverage['/picker/render.js'].lineData[156]++;
  var lastMonth1 = month1.clone();
  _$jscoverage['/picker/render.js'].lineData[157]++;
  lastMonth1.addDayOfMonth(-lastMonthDiffDay);
  _$jscoverage['/picker/render.js'].lineData[158]++;
  var passed = 0;
  _$jscoverage['/picker/render.js'].lineData[159]++;
  for (i = 0; visit36_159_1(i < DATE_ROW_COUNT); i++) {
    _$jscoverage['/picker/render.js'].lineData[160]++;
    for (j = 0; visit37_160_1(j < DATE_COL_COUNT); j++) {
      _$jscoverage['/picker/render.js'].lineData[161]++;
      current = lastMonth1;
      _$jscoverage['/picker/render.js'].lineData[162]++;
      if (visit38_162_1(passed)) {
        _$jscoverage['/picker/render.js'].lineData[163]++;
        current = current.clone();
        _$jscoverage['/picker/render.js'].lineData[164]++;
        current.addDayOfMonth(passed);
      }
      _$jscoverage['/picker/render.js'].lineData[166]++;
      dateTable.push(current);
      _$jscoverage['/picker/render.js'].lineData[167]++;
      passed++;
    }
  }
  _$jscoverage['/picker/render.js'].lineData[170]++;
  var tableHtml = '';
  _$jscoverage['/picker/render.js'].lineData[171]++;
  passed = 0;
  _$jscoverage['/picker/render.js'].lineData[172]++;
  for (i = 0; visit39_172_1(i < DATE_ROW_COUNT); i++) {
    _$jscoverage['/picker/render.js'].lineData[173]++;
    var rowHtml = dateRowTplStart;
    _$jscoverage['/picker/render.js'].lineData[174]++;
    if (visit40_174_1(showWeekNumber)) {
      _$jscoverage['/picker/render.js'].lineData[175]++;
      rowHtml += S.substitute(weekNumberCellTpl, {
  cls: weekNumberCellClass, 
  content: dateTable[passed].getWeekOfYear()});
    }
    _$jscoverage['/picker/render.js'].lineData[180]++;
    for (j = 0; visit41_180_1(j < DATE_COL_COUNT); j++) {
      _$jscoverage['/picker/render.js'].lineData[181]++;
      current = dateTable[passed];
      _$jscoverage['/picker/render.js'].lineData[182]++;
      var cls = cellClass;
      _$jscoverage['/picker/render.js'].lineData[183]++;
      var disabled = false;
      _$jscoverage['/picker/render.js'].lineData[184]++;
      var selected = false;
      _$jscoverage['/picker/render.js'].lineData[186]++;
      if (visit42_186_1(isSameDay(current, today))) {
        _$jscoverage['/picker/render.js'].lineData[187]++;
        cls += ' ' + todayClass;
      }
      _$jscoverage['/picker/render.js'].lineData[189]++;
      if (visit43_189_1(!isClear && isSameDay(current, value))) {
        _$jscoverage['/picker/render.js'].lineData[190]++;
        cls += ' ' + selectedClass;
        _$jscoverage['/picker/render.js'].lineData[191]++;
        selected = true;
      }
      _$jscoverage['/picker/render.js'].lineData[193]++;
      if (visit44_193_1(beforeCurrentMonthYear(current, value))) {
        _$jscoverage['/picker/render.js'].lineData[194]++;
        cls += ' ' + lastMonthDayClass;
      }
      _$jscoverage['/picker/render.js'].lineData[196]++;
      if (visit45_196_1(afterCurrentMonthYear(current, value))) {
        _$jscoverage['/picker/render.js'].lineData[197]++;
        cls += ' ' + nextMonthDayClass;
      }
      _$jscoverage['/picker/render.js'].lineData[199]++;
      if (visit46_199_1(disabledDate && disabledDate(current, value))) {
        _$jscoverage['/picker/render.js'].lineData[200]++;
        cls += ' ' + disabledClass;
        _$jscoverage['/picker/render.js'].lineData[201]++;
        disabled = true;
      }
      _$jscoverage['/picker/render.js'].lineData[204]++;
      var dateHtml = '';
      _$jscoverage['/picker/render.js'].lineData[205]++;
      if (visit47_205_1(dateRender && (dateHtml = dateRender(current, value)))) {
      } else {
        _$jscoverage['/picker/render.js'].lineData[207]++;
        dateHtml = S.substitute(dateTpl, {
  cls: dateClass, 
  id: getIdFromDate(current), 
  selected: selected, 
  disabled: disabled, 
  content: current.getDayOfMonth()});
      }
      _$jscoverage['/picker/render.js'].lineData[215]++;
      rowHtml += S.substitute(dateCellTpl, {
  cls: cls, 
  index: passed, 
  title: dateFormatter.format(current), 
  content: dateHtml});
      _$jscoverage['/picker/render.js'].lineData[221]++;
      passed++;
    }
    _$jscoverage['/picker/render.js'].lineData[223]++;
    tableHtml += rowHtml + dateRowTplEnd;
  }
  _$jscoverage['/picker/render.js'].lineData[225]++;
  control.dateTable = dateTable;
  _$jscoverage['/picker/render.js'].lineData[226]++;
  return tableHtml;
}, 
  createDom: function() {
  _$jscoverage['/picker/render.js'].functionData[11]++;
  _$jscoverage['/picker/render.js'].lineData[230]++;
  this.$el.attr('aria-activedescendant', getIdFromDate(this.control.get('value')));
}, 
  '_onSetClear': function(v) {
  _$jscoverage['/picker/render.js'].functionData[12]++;
  _$jscoverage['/picker/render.js'].lineData[234]++;
  var control = this.control;
  _$jscoverage['/picker/render.js'].lineData[235]++;
  var value = control.get('value');
  _$jscoverage['/picker/render.js'].lineData[236]++;
  var selectedCls = this.getBaseCssClasses('selected-day');
  _$jscoverage['/picker/render.js'].lineData[237]++;
  var id = getIdFromDate(value);
  _$jscoverage['/picker/render.js'].lineData[238]++;
  var currentA = this.$('#' + id);
  _$jscoverage['/picker/render.js'].lineData[239]++;
  if (visit48_239_1(v)) {
    _$jscoverage['/picker/render.js'].lineData[240]++;
    currentA.parent().removeClass(selectedCls);
    _$jscoverage['/picker/render.js'].lineData[241]++;
    currentA.attr('aria-selected', false);
    _$jscoverage['/picker/render.js'].lineData[242]++;
    this.$el.attr('aria-activedescendant', '');
  } else {
    _$jscoverage['/picker/render.js'].lineData[244]++;
    currentA.parent().addClass(selectedCls);
    _$jscoverage['/picker/render.js'].lineData[245]++;
    currentA.attr('aria-selected', true);
    _$jscoverage['/picker/render.js'].lineData[246]++;
    this.$el.attr('aria-activedescendant', id);
  }
}, 
  _onSetValue: function(value, e) {
  _$jscoverage['/picker/render.js'].functionData[13]++;
  _$jscoverage['/picker/render.js'].lineData[252]++;
  var control = this.control;
  _$jscoverage['/picker/render.js'].lineData[253]++;
  var preValue = e.prevVal;
  _$jscoverage['/picker/render.js'].lineData[254]++;
  if (visit49_254_1(isSameMonth(preValue, value))) {
    _$jscoverage['/picker/render.js'].lineData[255]++;
    var disabledDate = control.get('disabledDate');
    _$jscoverage['/picker/render.js'].lineData[256]++;
    var selectedCls = this.getBaseCssClasses('selected-day');
    _$jscoverage['/picker/render.js'].lineData[257]++;
    var prevA = this.$('#' + getIdFromDate(preValue));
    _$jscoverage['/picker/render.js'].lineData[258]++;
    prevA.parent().removeClass(selectedCls);
    _$jscoverage['/picker/render.js'].lineData[259]++;
    prevA.attr('aria-selected', false);
    _$jscoverage['/picker/render.js'].lineData[260]++;
    if (visit50_260_1(disabledDate && disabledDate(value, value))) {
    } else {
      _$jscoverage['/picker/render.js'].lineData[262]++;
      var currentA = this.$('#' + getIdFromDate(value));
      _$jscoverage['/picker/render.js'].lineData[263]++;
      currentA.parent().addClass(selectedCls);
      _$jscoverage['/picker/render.js'].lineData[264]++;
      currentA.attr('aria-selected', true);
    }
  } else {
    _$jscoverage['/picker/render.js'].lineData[267]++;
    var tbodyEl = control.get('tbodyEl');
    _$jscoverage['/picker/render.js'].lineData[268]++;
    var monthSelectContentEl = control.get('monthSelectContentEl');
    _$jscoverage['/picker/render.js'].lineData[269]++;
    var todayBtnEl = control.get('todayBtnEl');
    _$jscoverage['/picker/render.js'].lineData[270]++;
    monthSelectContentEl.html(this.getMonthYearLabel());
    _$jscoverage['/picker/render.js'].lineData[271]++;
    todayBtnEl.attr('title', this.getTodayTimeLabel());
    _$jscoverage['/picker/render.js'].lineData[272]++;
    tbodyEl.html(this.renderDates());
  }
  _$jscoverage['/picker/render.js'].lineData[274]++;
  this.$el.attr('aria-activedescendant', getIdFromDate(value));
}}, {
  name: 'date-picker-render', 
  ATTRS: {
  contentTpl: {
  value: PickerTpl}}});
});
