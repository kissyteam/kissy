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
if (! _$jscoverage['/utils.js']) {
  _$jscoverage['/utils.js'] = {};
  _$jscoverage['/utils.js'].lineData = [];
  _$jscoverage['/utils.js'].lineData[6] = 0;
  _$jscoverage['/utils.js'].lineData[7] = 0;
  _$jscoverage['/utils.js'].lineData[21] = 0;
  _$jscoverage['/utils.js'].lineData[22] = 0;
  _$jscoverage['/utils.js'].lineData[24] = 0;
  _$jscoverage['/utils.js'].lineData[25] = 0;
  _$jscoverage['/utils.js'].lineData[29] = 0;
  _$jscoverage['/utils.js'].lineData[33] = 0;
  _$jscoverage['/utils.js'].lineData[34] = 0;
  _$jscoverage['/utils.js'].lineData[36] = 0;
  _$jscoverage['/utils.js'].lineData[37] = 0;
  _$jscoverage['/utils.js'].lineData[39] = 0;
  _$jscoverage['/utils.js'].lineData[40] = 0;
  _$jscoverage['/utils.js'].lineData[41] = 0;
  _$jscoverage['/utils.js'].lineData[42] = 0;
  _$jscoverage['/utils.js'].lineData[45] = 0;
  _$jscoverage['/utils.js'].lineData[47] = 0;
  _$jscoverage['/utils.js'].lineData[48] = 0;
  _$jscoverage['/utils.js'].lineData[51] = 0;
  _$jscoverage['/utils.js'].lineData[55] = 0;
  _$jscoverage['/utils.js'].lineData[56] = 0;
  _$jscoverage['/utils.js'].lineData[58] = 0;
  _$jscoverage['/utils.js'].lineData[59] = 0;
  _$jscoverage['/utils.js'].lineData[61] = 0;
  _$jscoverage['/utils.js'].lineData[64] = 0;
  _$jscoverage['/utils.js'].lineData[66] = 0;
  _$jscoverage['/utils.js'].lineData[67] = 0;
  _$jscoverage['/utils.js'].lineData[70] = 0;
  _$jscoverage['/utils.js'].lineData[71] = 0;
  _$jscoverage['/utils.js'].lineData[73] = 0;
  _$jscoverage['/utils.js'].lineData[76] = 0;
  _$jscoverage['/utils.js'].lineData[77] = 0;
  _$jscoverage['/utils.js'].lineData[79] = 0;
  _$jscoverage['/utils.js'].lineData[80] = 0;
  _$jscoverage['/utils.js'].lineData[81] = 0;
  _$jscoverage['/utils.js'].lineData[82] = 0;
  _$jscoverage['/utils.js'].lineData[83] = 0;
  _$jscoverage['/utils.js'].lineData[87] = 0;
  _$jscoverage['/utils.js'].lineData[88] = 0;
  _$jscoverage['/utils.js'].lineData[89] = 0;
  _$jscoverage['/utils.js'].lineData[90] = 0;
  _$jscoverage['/utils.js'].lineData[91] = 0;
  _$jscoverage['/utils.js'].lineData[97] = 0;
  _$jscoverage['/utils.js'].lineData[98] = 0;
  _$jscoverage['/utils.js'].lineData[99] = 0;
  _$jscoverage['/utils.js'].lineData[100] = 0;
  _$jscoverage['/utils.js'].lineData[102] = 0;
  _$jscoverage['/utils.js'].lineData[105] = 0;
  _$jscoverage['/utils.js'].lineData[106] = 0;
  _$jscoverage['/utils.js'].lineData[109] = 0;
  _$jscoverage['/utils.js'].lineData[110] = 0;
  _$jscoverage['/utils.js'].lineData[111] = 0;
  _$jscoverage['/utils.js'].lineData[113] = 0;
  _$jscoverage['/utils.js'].lineData[116] = 0;
  _$jscoverage['/utils.js'].lineData[124] = 0;
  _$jscoverage['/utils.js'].lineData[127] = 0;
  _$jscoverage['/utils.js'].lineData[129] = 0;
  _$jscoverage['/utils.js'].lineData[130] = 0;
  _$jscoverage['/utils.js'].lineData[131] = 0;
  _$jscoverage['/utils.js'].lineData[134] = 0;
  _$jscoverage['/utils.js'].lineData[137] = 0;
  _$jscoverage['/utils.js'].lineData[141] = 0;
  _$jscoverage['/utils.js'].lineData[145] = 0;
  _$jscoverage['/utils.js'].lineData[146] = 0;
  _$jscoverage['/utils.js'].lineData[147] = 0;
  _$jscoverage['/utils.js'].lineData[150] = 0;
  _$jscoverage['/utils.js'].lineData[154] = 0;
  _$jscoverage['/utils.js'].lineData[155] = 0;
  _$jscoverage['/utils.js'].lineData[159] = 0;
  _$jscoverage['/utils.js'].lineData[169] = 0;
  _$jscoverage['/utils.js'].lineData[170] = 0;
  _$jscoverage['/utils.js'].lineData[171] = 0;
  _$jscoverage['/utils.js'].lineData[174] = 0;
  _$jscoverage['/utils.js'].lineData[178] = 0;
  _$jscoverage['/utils.js'].lineData[182] = 0;
  _$jscoverage['/utils.js'].lineData[183] = 0;
  _$jscoverage['/utils.js'].lineData[184] = 0;
  _$jscoverage['/utils.js'].lineData[186] = 0;
  _$jscoverage['/utils.js'].lineData[187] = 0;
  _$jscoverage['/utils.js'].lineData[188] = 0;
  _$jscoverage['/utils.js'].lineData[189] = 0;
  _$jscoverage['/utils.js'].lineData[190] = 0;
  _$jscoverage['/utils.js'].lineData[191] = 0;
  _$jscoverage['/utils.js'].lineData[192] = 0;
  _$jscoverage['/utils.js'].lineData[193] = 0;
  _$jscoverage['/utils.js'].lineData[195] = 0;
  _$jscoverage['/utils.js'].lineData[198] = 0;
  _$jscoverage['/utils.js'].lineData[202] = 0;
  _$jscoverage['/utils.js'].lineData[203] = 0;
  _$jscoverage['/utils.js'].lineData[204] = 0;
  _$jscoverage['/utils.js'].lineData[212] = 0;
  _$jscoverage['/utils.js'].lineData[221] = 0;
  _$jscoverage['/utils.js'].lineData[223] = 0;
  _$jscoverage['/utils.js'].lineData[224] = 0;
  _$jscoverage['/utils.js'].lineData[227] = 0;
  _$jscoverage['/utils.js'].lineData[233] = 0;
  _$jscoverage['/utils.js'].lineData[239] = 0;
  _$jscoverage['/utils.js'].lineData[240] = 0;
  _$jscoverage['/utils.js'].lineData[242] = 0;
  _$jscoverage['/utils.js'].lineData[247] = 0;
  _$jscoverage['/utils.js'].lineData[249] = 0;
  _$jscoverage['/utils.js'].lineData[250] = 0;
  _$jscoverage['/utils.js'].lineData[251] = 0;
  _$jscoverage['/utils.js'].lineData[254] = 0;
  _$jscoverage['/utils.js'].lineData[255] = 0;
  _$jscoverage['/utils.js'].lineData[257] = 0;
  _$jscoverage['/utils.js'].lineData[258] = 0;
  _$jscoverage['/utils.js'].lineData[260] = 0;
  _$jscoverage['/utils.js'].lineData[264] = 0;
  _$jscoverage['/utils.js'].lineData[268] = 0;
  _$jscoverage['/utils.js'].lineData[272] = 0;
  _$jscoverage['/utils.js'].lineData[273] = 0;
  _$jscoverage['/utils.js'].lineData[275] = 0;
  _$jscoverage['/utils.js'].lineData[276] = 0;
  _$jscoverage['/utils.js'].lineData[281] = 0;
  _$jscoverage['/utils.js'].lineData[282] = 0;
  _$jscoverage['/utils.js'].lineData[283] = 0;
  _$jscoverage['/utils.js'].lineData[288] = 0;
  _$jscoverage['/utils.js'].lineData[290] = 0;
  _$jscoverage['/utils.js'].lineData[291] = 0;
  _$jscoverage['/utils.js'].lineData[293] = 0;
  _$jscoverage['/utils.js'].lineData[297] = 0;
  _$jscoverage['/utils.js'].lineData[298] = 0;
  _$jscoverage['/utils.js'].lineData[299] = 0;
  _$jscoverage['/utils.js'].lineData[300] = 0;
  _$jscoverage['/utils.js'].lineData[302] = 0;
}
if (! _$jscoverage['/utils.js'].functionData) {
  _$jscoverage['/utils.js'].functionData = [];
  _$jscoverage['/utils.js'].functionData[0] = 0;
  _$jscoverage['/utils.js'].functionData[1] = 0;
  _$jscoverage['/utils.js'].functionData[2] = 0;
  _$jscoverage['/utils.js'].functionData[3] = 0;
  _$jscoverage['/utils.js'].functionData[4] = 0;
  _$jscoverage['/utils.js'].functionData[5] = 0;
  _$jscoverage['/utils.js'].functionData[6] = 0;
  _$jscoverage['/utils.js'].functionData[7] = 0;
  _$jscoverage['/utils.js'].functionData[8] = 0;
  _$jscoverage['/utils.js'].functionData[9] = 0;
  _$jscoverage['/utils.js'].functionData[10] = 0;
  _$jscoverage['/utils.js'].functionData[11] = 0;
  _$jscoverage['/utils.js'].functionData[12] = 0;
  _$jscoverage['/utils.js'].functionData[13] = 0;
  _$jscoverage['/utils.js'].functionData[14] = 0;
  _$jscoverage['/utils.js'].functionData[15] = 0;
  _$jscoverage['/utils.js'].functionData[16] = 0;
  _$jscoverage['/utils.js'].functionData[17] = 0;
  _$jscoverage['/utils.js'].functionData[18] = 0;
  _$jscoverage['/utils.js'].functionData[19] = 0;
  _$jscoverage['/utils.js'].functionData[20] = 0;
  _$jscoverage['/utils.js'].functionData[21] = 0;
  _$jscoverage['/utils.js'].functionData[22] = 0;
  _$jscoverage['/utils.js'].functionData[23] = 0;
  _$jscoverage['/utils.js'].functionData[24] = 0;
  _$jscoverage['/utils.js'].functionData[25] = 0;
  _$jscoverage['/utils.js'].functionData[26] = 0;
  _$jscoverage['/utils.js'].functionData[27] = 0;
  _$jscoverage['/utils.js'].functionData[28] = 0;
  _$jscoverage['/utils.js'].functionData[29] = 0;
}
if (! _$jscoverage['/utils.js'].branchData) {
  _$jscoverage['/utils.js'].branchData = {};
  _$jscoverage['/utils.js'].branchData['25'] = [];
  _$jscoverage['/utils.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['30'] = [];
  _$jscoverage['/utils.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['30'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['33'] = [];
  _$jscoverage['/utils.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['33'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['41'] = [];
  _$jscoverage['/utils.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['45'] = [];
  _$jscoverage['/utils.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['46'] = [];
  _$jscoverage['/utils.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['48'] = [];
  _$jscoverage['/utils.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['58'] = [];
  _$jscoverage['/utils.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['66'] = [];
  _$jscoverage['/utils.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['70'] = [];
  _$jscoverage['/utils.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['79'] = [];
  _$jscoverage['/utils.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['81'] = [];
  _$jscoverage['/utils.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['82'] = [];
  _$jscoverage['/utils.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['89'] = [];
  _$jscoverage['/utils.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['90'] = [];
  _$jscoverage['/utils.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['105'] = [];
  _$jscoverage['/utils.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['106'] = [];
  _$jscoverage['/utils.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['124'] = [];
  _$jscoverage['/utils.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['129'] = [];
  _$jscoverage['/utils.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['130'] = [];
  _$jscoverage['/utils.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['131'] = [];
  _$jscoverage['/utils.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['134'] = [];
  _$jscoverage['/utils.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['141'] = [];
  _$jscoverage['/utils.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['146'] = [];
  _$jscoverage['/utils.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['155'] = [];
  _$jscoverage['/utils.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['155'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['155'][3] = new BranchData();
  _$jscoverage['/utils.js'].branchData['158'] = [];
  _$jscoverage['/utils.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['169'] = [];
  _$jscoverage['/utils.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['170'] = [];
  _$jscoverage['/utils.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['183'] = [];
  _$jscoverage['/utils.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['189'] = [];
  _$jscoverage['/utils.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['191'] = [];
  _$jscoverage['/utils.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['192'] = [];
  _$jscoverage['/utils.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['204'] = [];
  _$jscoverage['/utils.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['212'] = [];
  _$jscoverage['/utils.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['223'] = [];
  _$jscoverage['/utils.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['249'] = [];
  _$jscoverage['/utils.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['254'] = [];
  _$jscoverage['/utils.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['257'] = [];
  _$jscoverage['/utils.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['272'] = [];
  _$jscoverage['/utils.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['282'] = [];
  _$jscoverage['/utils.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['290'] = [];
  _$jscoverage['/utils.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['298'] = [];
  _$jscoverage['/utils.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['298'][2] = new BranchData();
}
_$jscoverage['/utils.js'].branchData['298'][2].init(66, 28, 'module.factory !== undefined');
function visit284_298_2(result) {
  _$jscoverage['/utils.js'].branchData['298'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['298'][1].init(56, 38, 'module && module.factory !== undefined');
function visit283_298_1(result) {
  _$jscoverage['/utils.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['290'][1].init(90, 5, 'i < l');
function visit282_290_1(result) {
  _$jscoverage['/utils.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['282'][1].init(63, 5, 'i < l');
function visit281_282_1(result) {
  _$jscoverage['/utils.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['272'][1].init(18, 25, 'typeof names === \'string\'');
function visit280_272_1(result) {
  _$jscoverage['/utils.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['257'][1].init(112, 19, 'cfg && cfg.requires');
function visit279_257_1(result) {
  _$jscoverage['/utils.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['254'][1].init(186, 6, 'module');
function visit278_254_1(result) {
  _$jscoverage['/utils.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['249'][1].init(58, 7, '!module');
function visit277_249_1(result) {
  _$jscoverage['/utils.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['223'][1].init(85, 8, '--i > -1');
function visit276_223_1(result) {
  _$jscoverage['/utils.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['212'][1].init(21, 58, 'doc.getElementsByTagName(\'head\')[0] || doc.documentElement');
function visit275_212_1(result) {
  _$jscoverage['/utils.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['204'][1].init(119, 29, 'urlParts1[0] === urlParts2[0]');
function visit274_204_1(result) {
  _$jscoverage['/utils.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['192'][1].init(114, 16, 'subPart === \'..\'');
function visit273_192_1(result) {
  _$jscoverage['/utils.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['191'][1].init(66, 15, 'subPart === \'.\'');
function visit272_191_1(result) {
  _$jscoverage['/utils.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['189'][1].init(307, 5, 'i < l');
function visit271_189_1(result) {
  _$jscoverage['/utils.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['183'][1].init(66, 17, 'firstChar !== \'.\'');
function visit270_183_1(result) {
  _$jscoverage['/utils.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['170'][1].init(22, 15, 'arr[i] === item');
function visit269_170_1(result) {
  _$jscoverage['/utils.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['169'][1].init(46, 5, 'i < l');
function visit268_169_1(result) {
  _$jscoverage['/utils.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['158'][1].init(1280, 69, 'Date.now || function() {\n  return +new Date();\n}');
function visit267_158_1(result) {
  _$jscoverage['/utils.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['155'][3].init(84, 32, 'str.indexOf(suffix, ind) === ind');
function visit266_155_3(result) {
  _$jscoverage['/utils.js'].branchData['155'][3].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['155'][2].init(72, 8, 'ind >= 0');
function visit265_155_2(result) {
  _$jscoverage['/utils.js'].branchData['155'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['155'][1].init(72, 44, 'ind >= 0 && str.indexOf(suffix, ind) === ind');
function visit264_155_1(result) {
  _$jscoverage['/utils.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['146'][1].init(22, 15, 'p !== undefined');
function visit263_146_1(result) {
  _$jscoverage['/utils.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['141'][1].init(21, 32, 'str.lastIndexOf(prefix, 0) === 0');
function visit262_141_1(result) {
  _$jscoverage['/utils.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['134'][1].init(43, 15, 'context || this');
function visit261_134_1(result) {
  _$jscoverage['/utils.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['131'][1].init(106, 108, 'el || i in arr');
function visit260_131_1(result) {
  _$jscoverage['/utils.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['130'][1].init(31, 23, 'typeof arr === \'string\'');
function visit259_130_1(result) {
  _$jscoverage['/utils.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['129'][1].init(116, 7, 'i < len');
function visit258_129_1(result) {
  _$jscoverage['/utils.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['124'][1].init(43, 15, 'context || this');
function visit257_124_1(result) {
  _$jscoverage['/utils.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['106'][1].init(17, 56, 'Object.prototype.toString.call(obj) === \'[object Array]\'');
function visit256_106_1(result) {
  _$jscoverage['/utils.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['105'][1].init(2810, 114, 'Array.isArray || function(obj) {\n  return Object.prototype.toString.call(obj) === \'[object Array]\';\n}');
function visit255_105_1(result) {
  _$jscoverage['/utils.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['90'][1].init(22, 44, 'fn(obj[myKeys[i]], myKeys[i], obj) === false');
function visit254_90_1(result) {
  _$jscoverage['/utils.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['89'][1].init(86, 5, 'i < l');
function visit253_89_1(result) {
  _$jscoverage['/utils.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['82'][1].init(22, 28, 'fn(obj[i], i, obj) === false');
function visit252_82_1(result) {
  _$jscoverage['/utils.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['81'][1].init(50, 5, 'i < l');
function visit251_81_1(result) {
  _$jscoverage['/utils.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['79'][1].init(58, 12, 'isArray(obj)');
function visit250_79_1(result) {
  _$jscoverage['/utils.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['70'][1].init(157, 27, 'Utils.endsWith(name, \'.js\')');
function visit249_70_1(result) {
  _$jscoverage['/utils.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['66'][1].init(40, 36, 'name.charAt(name.length - 1) === \'/\'');
function visit248_66_1(result) {
  _$jscoverage['/utils.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['58'][1].init(56, 46, '!(m = str.match(/^\\s*["\']([^\'"\\s]+)["\']\\s*$/))');
function visit247_58_1(result) {
  _$jscoverage['/utils.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['48'][1].init(60, 18, 'Utils.trident || 1');
function visit246_48_1(result) {
  _$jscoverage['/utils.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['46'][1].init(79, 12, 'm[1] || m[2]');
function visit245_46_1(result) {
  _$jscoverage['/utils.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['45'][1].init(1160, 94, '(m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\\s|:)?([0-9.]+)/)) && (v = (m[1] || m[2]))');
function visit244_45_1(result) {
  _$jscoverage['/utils.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['41'][1].init(80, 36, '(m = ua.match(/rv:([\\d.]*)/)) && m[1]');
function visit243_41_1(result) {
  _$jscoverage['/utils.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['33'][2].init(699, 76, '(m = ua.match(/AppleWebKit\\/([\\d.]*)/)) || (m = ua.match(/Safari\\/([\\d.]*)/))');
function visit242_33_2(result) {
  _$jscoverage['/utils.js'].branchData['33'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['33'][1].init(699, 85, '((m = ua.match(/AppleWebKit\\/([\\d.]*)/)) || (m = ua.match(/Safari\\/([\\d.]*)/))) && m[1]');
function visit241_33_1(result) {
  _$jscoverage['/utils.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['30'][2].init(24, 20, 'host.navigator || {}');
function visit240_30_2(result) {
  _$jscoverage['/utils.js'].branchData['30'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['30'][1].init(24, 37, '(host.navigator || {}).userAgent || \'\'');
function visit239_30_1(result) {
  _$jscoverage['/utils.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['25'][1].init(22, 9, 'c++ === 0');
function visit238_25_1(result) {
  _$jscoverage['/utils.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/utils.js'].functionData[0]++;
  _$jscoverage['/utils.js'].lineData[7]++;
  var Loader = S.Loader, Env = S.Env, mods = Env.mods, map = Array.prototype.map, host = Env.host, Utils = Loader.Utils = {}, doc = host.document;
  _$jscoverage['/utils.js'].lineData[21]++;
  function numberify(s) {
    _$jscoverage['/utils.js'].functionData[1]++;
    _$jscoverage['/utils.js'].lineData[22]++;
    var c = 0;
    _$jscoverage['/utils.js'].lineData[24]++;
    return parseFloat(s.replace(/\./g, function() {
  _$jscoverage['/utils.js'].functionData[2]++;
  _$jscoverage['/utils.js'].lineData[25]++;
  return (visit238_25_1(c++ === 0)) ? '.' : '';
}));
  }
  _$jscoverage['/utils.js'].lineData[29]++;
  var m, v, ua = visit239_30_1((visit240_30_2(host.navigator || {})).userAgent || '');
  _$jscoverage['/utils.js'].lineData[33]++;
  if (visit241_33_1((visit242_33_2((m = ua.match(/AppleWebKit\/([\d.]*)/)) || (m = ua.match(/Safari\/([\d.]*)/)))) && m[1])) {
    _$jscoverage['/utils.js'].lineData[34]++;
    Utils.webkit = numberify(m[1]);
  }
  _$jscoverage['/utils.js'].lineData[36]++;
  if ((m = ua.match(/Trident\/([\d.]*)/))) {
    _$jscoverage['/utils.js'].lineData[37]++;
    Utils.trident = numberify(m[1]);
  }
  _$jscoverage['/utils.js'].lineData[39]++;
  if ((m = ua.match(/Gecko/))) {
    _$jscoverage['/utils.js'].lineData[40]++;
    Utils.gecko = 0.1;
    _$jscoverage['/utils.js'].lineData[41]++;
    if (visit243_41_1((m = ua.match(/rv:([\d.]*)/)) && m[1])) {
      _$jscoverage['/utils.js'].lineData[42]++;
      Utils.gecko = numberify(m[1]);
    }
  }
  _$jscoverage['/utils.js'].lineData[45]++;
  if (visit244_45_1((m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/)) && (v = (visit245_46_1(m[1] || m[2]))))) {
    _$jscoverage['/utils.js'].lineData[47]++;
    Utils.ie = numberify(v);
    _$jscoverage['/utils.js'].lineData[48]++;
    Utils.trident = visit246_48_1(Utils.trident || 1);
  }
  _$jscoverage['/utils.js'].lineData[51]++;
  var urlReg = /http(s)?:\/\/([^/]+)(?::(\d+))?/, commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg, requireRegExp = /[^.'"]\s*require\s*\(([^)]+)\)/g;
  _$jscoverage['/utils.js'].lineData[55]++;
  function getRequireVal(str) {
    _$jscoverage['/utils.js'].functionData[3]++;
    _$jscoverage['/utils.js'].lineData[56]++;
    var m;
    _$jscoverage['/utils.js'].lineData[58]++;
    if (visit247_58_1(!(m = str.match(/^\s*["']([^'"\s]+)["']\s*$/)))) {
      _$jscoverage['/utils.js'].lineData[59]++;
      S.error('can not find required mod in require call: ' + str);
    }
    _$jscoverage['/utils.js'].lineData[61]++;
    return m[1];
  }
  _$jscoverage['/utils.js'].lineData[64]++;
  function normalizeName(name) {
    _$jscoverage['/utils.js'].functionData[4]++;
    _$jscoverage['/utils.js'].lineData[66]++;
    if (visit248_66_1(name.charAt(name.length - 1) === '/')) {
      _$jscoverage['/utils.js'].lineData[67]++;
      name += 'index';
    }
    _$jscoverage['/utils.js'].lineData[70]++;
    if (visit249_70_1(Utils.endsWith(name, '.js'))) {
      _$jscoverage['/utils.js'].lineData[71]++;
      name = name.slice(0, -3);
    }
    _$jscoverage['/utils.js'].lineData[73]++;
    return name;
  }
  _$jscoverage['/utils.js'].lineData[76]++;
  function each(obj, fn) {
    _$jscoverage['/utils.js'].functionData[5]++;
    _$jscoverage['/utils.js'].lineData[77]++;
    var i = 0, myKeys, l;
    _$jscoverage['/utils.js'].lineData[79]++;
    if (visit250_79_1(isArray(obj))) {
      _$jscoverage['/utils.js'].lineData[80]++;
      l = obj.length;
      _$jscoverage['/utils.js'].lineData[81]++;
      for (; visit251_81_1(i < l); i++) {
        _$jscoverage['/utils.js'].lineData[82]++;
        if (visit252_82_1(fn(obj[i], i, obj) === false)) {
          _$jscoverage['/utils.js'].lineData[83]++;
          break;
        }
      }
    } else {
      _$jscoverage['/utils.js'].lineData[87]++;
      myKeys = keys(obj);
      _$jscoverage['/utils.js'].lineData[88]++;
      l = myKeys.length;
      _$jscoverage['/utils.js'].lineData[89]++;
      for (; visit253_89_1(i < l); i++) {
        _$jscoverage['/utils.js'].lineData[90]++;
        if (visit254_90_1(fn(obj[myKeys[i]], myKeys[i], obj) === false)) {
          _$jscoverage['/utils.js'].lineData[91]++;
          break;
        }
      }
    }
  }
  _$jscoverage['/utils.js'].lineData[97]++;
  function keys(obj) {
    _$jscoverage['/utils.js'].functionData[6]++;
    _$jscoverage['/utils.js'].lineData[98]++;
    var ret = [];
    _$jscoverage['/utils.js'].lineData[99]++;
    for (var key in obj) {
      _$jscoverage['/utils.js'].lineData[100]++;
      ret.push(key);
    }
    _$jscoverage['/utils.js'].lineData[102]++;
    return ret;
  }
  _$jscoverage['/utils.js'].lineData[105]++;
  var isArray = visit255_105_1(Array.isArray || function(obj) {
  _$jscoverage['/utils.js'].functionData[7]++;
  _$jscoverage['/utils.js'].lineData[106]++;
  return visit256_106_1(Object.prototype.toString.call(obj) === '[object Array]');
});
  _$jscoverage['/utils.js'].lineData[109]++;
  function mix(to, from) {
    _$jscoverage['/utils.js'].functionData[8]++;
    _$jscoverage['/utils.js'].lineData[110]++;
    for (var i in from) {
      _$jscoverage['/utils.js'].lineData[111]++;
      to[i] = from[i];
    }
    _$jscoverage['/utils.js'].lineData[113]++;
    return to;
  }
  _$jscoverage['/utils.js'].lineData[116]++;
  mix(Utils, {
  mix: mix, 
  noop: function() {
  _$jscoverage['/utils.js'].functionData[9]++;
}, 
  map: map ? function(arr, fn, context) {
  _$jscoverage['/utils.js'].functionData[10]++;
  _$jscoverage['/utils.js'].lineData[124]++;
  return map.call(arr, fn, visit257_124_1(context || this));
} : function(arr, fn, context) {
  _$jscoverage['/utils.js'].functionData[11]++;
  _$jscoverage['/utils.js'].lineData[127]++;
  var len = arr.length, res = new Array(len);
  _$jscoverage['/utils.js'].lineData[129]++;
  for (var i = 0; visit258_129_1(i < len); i++) {
    _$jscoverage['/utils.js'].lineData[130]++;
    var el = visit259_130_1(typeof arr === 'string') ? arr.charAt(i) : arr[i];
    _$jscoverage['/utils.js'].lineData[131]++;
    if (visit260_131_1(el || i in arr)) {
      _$jscoverage['/utils.js'].lineData[134]++;
      res[i] = fn.call(visit261_134_1(context || this), el, i, arr);
    }
  }
  _$jscoverage['/utils.js'].lineData[137]++;
  return res;
}, 
  startsWith: function(str, prefix) {
  _$jscoverage['/utils.js'].functionData[12]++;
  _$jscoverage['/utils.js'].lineData[141]++;
  return visit262_141_1(str.lastIndexOf(prefix, 0) === 0);
}, 
  isEmptyObject: function(o) {
  _$jscoverage['/utils.js'].functionData[13]++;
  _$jscoverage['/utils.js'].lineData[145]++;
  for (var p in o) {
    _$jscoverage['/utils.js'].lineData[146]++;
    if (visit263_146_1(p !== undefined)) {
      _$jscoverage['/utils.js'].lineData[147]++;
      return false;
    }
  }
  _$jscoverage['/utils.js'].lineData[150]++;
  return true;
}, 
  endsWith: function(str, suffix) {
  _$jscoverage['/utils.js'].functionData[14]++;
  _$jscoverage['/utils.js'].lineData[154]++;
  var ind = str.length - suffix.length;
  _$jscoverage['/utils.js'].lineData[155]++;
  return visit264_155_1(visit265_155_2(ind >= 0) && visit266_155_3(str.indexOf(suffix, ind) === ind));
}, 
  now: visit267_158_1(Date.now || function() {
  _$jscoverage['/utils.js'].functionData[15]++;
  _$jscoverage['/utils.js'].lineData[159]++;
  return +new Date();
}), 
  each: each, 
  keys: keys, 
  isArray: isArray, 
  indexOf: function(item, arr) {
  _$jscoverage['/utils.js'].functionData[16]++;
  _$jscoverage['/utils.js'].lineData[169]++;
  for (var i = 0, l = arr.length; visit268_169_1(i < l); i++) {
    _$jscoverage['/utils.js'].lineData[170]++;
    if (visit269_170_1(arr[i] === item)) {
      _$jscoverage['/utils.js'].lineData[171]++;
      return i;
    }
  }
  _$jscoverage['/utils.js'].lineData[174]++;
  return -1;
}, 
  normalizeSlash: function(str) {
  _$jscoverage['/utils.js'].functionData[17]++;
  _$jscoverage['/utils.js'].lineData[178]++;
  return str.replace(/\\/g, '/');
}, 
  normalizePath: function(parentPath, subPath) {
  _$jscoverage['/utils.js'].functionData[18]++;
  _$jscoverage['/utils.js'].lineData[182]++;
  var firstChar = subPath.charAt(0);
  _$jscoverage['/utils.js'].lineData[183]++;
  if (visit270_183_1(firstChar !== '.')) {
    _$jscoverage['/utils.js'].lineData[184]++;
    return subPath;
  }
  _$jscoverage['/utils.js'].lineData[186]++;
  var parts = parentPath.split('/');
  _$jscoverage['/utils.js'].lineData[187]++;
  var subParts = subPath.split('/');
  _$jscoverage['/utils.js'].lineData[188]++;
  parts.pop();
  _$jscoverage['/utils.js'].lineData[189]++;
  for (var i = 0, l = subParts.length; visit271_189_1(i < l); i++) {
    _$jscoverage['/utils.js'].lineData[190]++;
    var subPart = subParts[i];
    _$jscoverage['/utils.js'].lineData[191]++;
    if (visit272_191_1(subPart === '.')) {
    } else {
      _$jscoverage['/utils.js'].lineData[192]++;
      if (visit273_192_1(subPart === '..')) {
        _$jscoverage['/utils.js'].lineData[193]++;
        parts.pop();
      } else {
        _$jscoverage['/utils.js'].lineData[195]++;
        parts.push(subPart);
      }
    }
  }
  _$jscoverage['/utils.js'].lineData[198]++;
  return parts.join('/');
}, 
  isSameOriginAs: function(url1, url2) {
  _$jscoverage['/utils.js'].functionData[19]++;
  _$jscoverage['/utils.js'].lineData[202]++;
  var urlParts1 = url1.match(urlReg);
  _$jscoverage['/utils.js'].lineData[203]++;
  var urlParts2 = url2.match(urlReg);
  _$jscoverage['/utils.js'].lineData[204]++;
  return visit274_204_1(urlParts1[0] === urlParts2[0]);
}, 
  docHead: function() {
  _$jscoverage['/utils.js'].functionData[20]++;
  _$jscoverage['/utils.js'].lineData[212]++;
  return visit275_212_1(doc.getElementsByTagName('head')[0] || doc.documentElement);
}, 
  getHash: function(str) {
  _$jscoverage['/utils.js'].functionData[21]++;
  _$jscoverage['/utils.js'].lineData[221]++;
  var hash = 5381, i;
  _$jscoverage['/utils.js'].lineData[223]++;
  for (i = str.length; visit276_223_1(--i > -1); ) {
    _$jscoverage['/utils.js'].lineData[224]++;
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  _$jscoverage['/utils.js'].lineData[227]++;
  return hash + '';
}, 
  getRequiresFromFn: function(fn) {
  _$jscoverage['/utils.js'].functionData[22]++;
  _$jscoverage['/utils.js'].lineData[233]++;
  var requires = [];
  _$jscoverage['/utils.js'].lineData[239]++;
  fn.toString().replace(commentRegExp, '').replace(requireRegExp, function(match, dep) {
  _$jscoverage['/utils.js'].functionData[23]++;
  _$jscoverage['/utils.js'].lineData[240]++;
  requires.push(getRequireVal(dep));
});
  _$jscoverage['/utils.js'].lineData[242]++;
  return requires;
}, 
  createModule: function(name, cfg) {
  _$jscoverage['/utils.js'].functionData[24]++;
  _$jscoverage['/utils.js'].lineData[247]++;
  var module = mods[name];
  _$jscoverage['/utils.js'].lineData[249]++;
  if (visit277_249_1(!module)) {
    _$jscoverage['/utils.js'].lineData[250]++;
    name = normalizeName(name);
    _$jscoverage['/utils.js'].lineData[251]++;
    module = mods[name];
  }
  _$jscoverage['/utils.js'].lineData[254]++;
  if (visit278_254_1(module)) {
    _$jscoverage['/utils.js'].lineData[255]++;
    mix(module, cfg);
    _$jscoverage['/utils.js'].lineData[257]++;
    if (visit279_257_1(cfg && cfg.requires)) {
      _$jscoverage['/utils.js'].lineData[258]++;
      module.setRequiresModules(cfg.requires);
    }
    _$jscoverage['/utils.js'].lineData[260]++;
    return module;
  }
  _$jscoverage['/utils.js'].lineData[264]++;
  mods[name] = module = new Loader.Module(mix({
  name: name}, cfg));
  _$jscoverage['/utils.js'].lineData[268]++;
  return module;
}, 
  createModules: function(names) {
  _$jscoverage['/utils.js'].functionData[25]++;
  _$jscoverage['/utils.js'].lineData[272]++;
  if (visit280_272_1(typeof names === 'string')) {
    _$jscoverage['/utils.js'].lineData[273]++;
    names = names.replace(/\s+/g, '').split(',');
  }
  _$jscoverage['/utils.js'].lineData[275]++;
  return Utils.map(names, function(name) {
  _$jscoverage['/utils.js'].functionData[26]++;
  _$jscoverage['/utils.js'].lineData[276]++;
  return Utils.createModule(name);
});
}, 
  attachModules: function(mods) {
  _$jscoverage['/utils.js'].functionData[27]++;
  _$jscoverage['/utils.js'].lineData[281]++;
  var l = mods.length, i;
  _$jscoverage['/utils.js'].lineData[282]++;
  for (i = 0; visit281_282_1(i < l); i++) {
    _$jscoverage['/utils.js'].lineData[283]++;
    mods[i].attach();
  }
}, 
  getModulesExports: function(mods) {
  _$jscoverage['/utils.js'].functionData[28]++;
  _$jscoverage['/utils.js'].lineData[288]++;
  var l = mods.length, i, ret = [];
  _$jscoverage['/utils.js'].lineData[290]++;
  for (i = 0; visit282_290_1(i < l); i++) {
    _$jscoverage['/utils.js'].lineData[291]++;
    ret.push(mods[i].getExports());
  }
  _$jscoverage['/utils.js'].lineData[293]++;
  return ret;
}, 
  addModule: function(name, factory, config) {
  _$jscoverage['/utils.js'].functionData[29]++;
  _$jscoverage['/utils.js'].lineData[297]++;
  var module = mods[name];
  _$jscoverage['/utils.js'].lineData[298]++;
  if (visit283_298_1(module && visit284_298_2(module.factory !== undefined))) {
    _$jscoverage['/utils.js'].lineData[299]++;
    S.log(name + ' is defined more than once', 'warn');
    _$jscoverage['/utils.js'].lineData[300]++;
    return;
  }
  _$jscoverage['/utils.js'].lineData[302]++;
  Utils.createModule(name, mix({
  name: name, 
  status: Loader.Status.LOADED, 
  factory: factory}, config));
}});
})(KISSY);
