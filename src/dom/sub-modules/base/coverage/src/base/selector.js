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
if (! _$jscoverage['/base/selector.js']) {
  _$jscoverage['/base/selector.js'] = {};
  _$jscoverage['/base/selector.js'].lineData = [];
  _$jscoverage['/base/selector.js'].lineData[6] = 0;
  _$jscoverage['/base/selector.js'].lineData[7] = 0;
  _$jscoverage['/base/selector.js'].lineData[8] = 0;
  _$jscoverage['/base/selector.js'].lineData[9] = 0;
  _$jscoverage['/base/selector.js'].lineData[29] = 0;
  _$jscoverage['/base/selector.js'].lineData[30] = 0;
  _$jscoverage['/base/selector.js'].lineData[33] = 0;
  _$jscoverage['/base/selector.js'].lineData[34] = 0;
  _$jscoverage['/base/selector.js'].lineData[35] = 0;
  _$jscoverage['/base/selector.js'].lineData[40] = 0;
  _$jscoverage['/base/selector.js'].lineData[41] = 0;
  _$jscoverage['/base/selector.js'].lineData[42] = 0;
  _$jscoverage['/base/selector.js'].lineData[43] = 0;
  _$jscoverage['/base/selector.js'].lineData[45] = 0;
  _$jscoverage['/base/selector.js'].lineData[48] = 0;
  _$jscoverage['/base/selector.js'].lineData[49] = 0;
  _$jscoverage['/base/selector.js'].lineData[50] = 0;
  _$jscoverage['/base/selector.js'].lineData[51] = 0;
  _$jscoverage['/base/selector.js'].lineData[52] = 0;
  _$jscoverage['/base/selector.js'].lineData[53] = 0;
  _$jscoverage['/base/selector.js'].lineData[55] = 0;
  _$jscoverage['/base/selector.js'].lineData[59] = 0;
  _$jscoverage['/base/selector.js'].lineData[60] = 0;
  _$jscoverage['/base/selector.js'].lineData[61] = 0;
  _$jscoverage['/base/selector.js'].lineData[62] = 0;
  _$jscoverage['/base/selector.js'].lineData[66] = 0;
  _$jscoverage['/base/selector.js'].lineData[67] = 0;
  _$jscoverage['/base/selector.js'].lineData[68] = 0;
  _$jscoverage['/base/selector.js'].lineData[72] = 0;
  _$jscoverage['/base/selector.js'].lineData[73] = 0;
  _$jscoverage['/base/selector.js'].lineData[74] = 0;
  _$jscoverage['/base/selector.js'].lineData[79] = 0;
  _$jscoverage['/base/selector.js'].lineData[80] = 0;
  _$jscoverage['/base/selector.js'].lineData[81] = 0;
  _$jscoverage['/base/selector.js'].lineData[84] = 0;
  _$jscoverage['/base/selector.js'].lineData[85] = 0;
  _$jscoverage['/base/selector.js'].lineData[94] = 0;
  _$jscoverage['/base/selector.js'].lineData[95] = 0;
  _$jscoverage['/base/selector.js'].lineData[96] = 0;
  _$jscoverage['/base/selector.js'].lineData[97] = 0;
  _$jscoverage['/base/selector.js'].lineData[99] = 0;
  _$jscoverage['/base/selector.js'].lineData[101] = 0;
  _$jscoverage['/base/selector.js'].lineData[102] = 0;
  _$jscoverage['/base/selector.js'].lineData[103] = 0;
  _$jscoverage['/base/selector.js'].lineData[105] = 0;
  _$jscoverage['/base/selector.js'].lineData[106] = 0;
  _$jscoverage['/base/selector.js'].lineData[108] = 0;
  _$jscoverage['/base/selector.js'].lineData[109] = 0;
  _$jscoverage['/base/selector.js'].lineData[110] = 0;
  _$jscoverage['/base/selector.js'].lineData[112] = 0;
  _$jscoverage['/base/selector.js'].lineData[113] = 0;
  _$jscoverage['/base/selector.js'].lineData[114] = 0;
  _$jscoverage['/base/selector.js'].lineData[116] = 0;
  _$jscoverage['/base/selector.js'].lineData[117] = 0;
  _$jscoverage['/base/selector.js'].lineData[119] = 0;
  _$jscoverage['/base/selector.js'].lineData[125] = 0;
  _$jscoverage['/base/selector.js'].lineData[126] = 0;
  _$jscoverage['/base/selector.js'].lineData[129] = 0;
  _$jscoverage['/base/selector.js'].lineData[130] = 0;
  _$jscoverage['/base/selector.js'].lineData[134] = 0;
  _$jscoverage['/base/selector.js'].lineData[137] = 0;
  _$jscoverage['/base/selector.js'].lineData[138] = 0;
  _$jscoverage['/base/selector.js'].lineData[141] = 0;
  _$jscoverage['/base/selector.js'].lineData[142] = 0;
  _$jscoverage['/base/selector.js'].lineData[143] = 0;
  _$jscoverage['/base/selector.js'].lineData[146] = 0;
  _$jscoverage['/base/selector.js'].lineData[150] = 0;
  _$jscoverage['/base/selector.js'].lineData[151] = 0;
  _$jscoverage['/base/selector.js'].lineData[152] = 0;
  _$jscoverage['/base/selector.js'].lineData[153] = 0;
  _$jscoverage['/base/selector.js'].lineData[156] = 0;
  _$jscoverage['/base/selector.js'].lineData[157] = 0;
  _$jscoverage['/base/selector.js'].lineData[165] = 0;
  _$jscoverage['/base/selector.js'].lineData[166] = 0;
  _$jscoverage['/base/selector.js'].lineData[167] = 0;
  _$jscoverage['/base/selector.js'].lineData[169] = 0;
  _$jscoverage['/base/selector.js'].lineData[170] = 0;
  _$jscoverage['/base/selector.js'].lineData[174] = 0;
  _$jscoverage['/base/selector.js'].lineData[175] = 0;
  _$jscoverage['/base/selector.js'].lineData[181] = 0;
  _$jscoverage['/base/selector.js'].lineData[183] = 0;
  _$jscoverage['/base/selector.js'].lineData[186] = 0;
  _$jscoverage['/base/selector.js'].lineData[187] = 0;
  _$jscoverage['/base/selector.js'].lineData[190] = 0;
  _$jscoverage['/base/selector.js'].lineData[191] = 0;
  _$jscoverage['/base/selector.js'].lineData[192] = 0;
  _$jscoverage['/base/selector.js'].lineData[193] = 0;
  _$jscoverage['/base/selector.js'].lineData[194] = 0;
  _$jscoverage['/base/selector.js'].lineData[195] = 0;
  _$jscoverage['/base/selector.js'].lineData[203] = 0;
  _$jscoverage['/base/selector.js'].lineData[205] = 0;
  _$jscoverage['/base/selector.js'].lineData[208] = 0;
  _$jscoverage['/base/selector.js'].lineData[211] = 0;
  _$jscoverage['/base/selector.js'].lineData[212] = 0;
  _$jscoverage['/base/selector.js'].lineData[216] = 0;
  _$jscoverage['/base/selector.js'].lineData[217] = 0;
  _$jscoverage['/base/selector.js'].lineData[218] = 0;
  _$jscoverage['/base/selector.js'].lineData[219] = 0;
  _$jscoverage['/base/selector.js'].lineData[221] = 0;
  _$jscoverage['/base/selector.js'].lineData[224] = 0;
  _$jscoverage['/base/selector.js'].lineData[225] = 0;
  _$jscoverage['/base/selector.js'].lineData[228] = 0;
  _$jscoverage['/base/selector.js'].lineData[229] = 0;
  _$jscoverage['/base/selector.js'].lineData[231] = 0;
  _$jscoverage['/base/selector.js'].lineData[232] = 0;
  _$jscoverage['/base/selector.js'].lineData[234] = 0;
  _$jscoverage['/base/selector.js'].lineData[235] = 0;
  _$jscoverage['/base/selector.js'].lineData[238] = 0;
  _$jscoverage['/base/selector.js'].lineData[247] = 0;
  _$jscoverage['/base/selector.js'].lineData[251] = 0;
  _$jscoverage['/base/selector.js'].lineData[261] = 0;
  _$jscoverage['/base/selector.js'].lineData[265] = 0;
  _$jscoverage['/base/selector.js'].lineData[266] = 0;
  _$jscoverage['/base/selector.js'].lineData[267] = 0;
  _$jscoverage['/base/selector.js'].lineData[268] = 0;
  _$jscoverage['/base/selector.js'].lineData[271] = 0;
  _$jscoverage['/base/selector.js'].lineData[275] = 0;
  _$jscoverage['/base/selector.js'].lineData[301] = 0;
  _$jscoverage['/base/selector.js'].lineData[313] = 0;
  _$jscoverage['/base/selector.js'].lineData[320] = 0;
  _$jscoverage['/base/selector.js'].lineData[321] = 0;
  _$jscoverage['/base/selector.js'].lineData[322] = 0;
  _$jscoverage['/base/selector.js'].lineData[325] = 0;
  _$jscoverage['/base/selector.js'].lineData[326] = 0;
  _$jscoverage['/base/selector.js'].lineData[327] = 0;
  _$jscoverage['/base/selector.js'].lineData[328] = 0;
  _$jscoverage['/base/selector.js'].lineData[331] = 0;
  _$jscoverage['/base/selector.js'].lineData[335] = 0;
  _$jscoverage['/base/selector.js'].lineData[337] = 0;
  _$jscoverage['/base/selector.js'].lineData[338] = 0;
  _$jscoverage['/base/selector.js'].lineData[340] = 0;
  _$jscoverage['/base/selector.js'].lineData[341] = 0;
  _$jscoverage['/base/selector.js'].lineData[342] = 0;
  _$jscoverage['/base/selector.js'].lineData[343] = 0;
  _$jscoverage['/base/selector.js'].lineData[344] = 0;
  _$jscoverage['/base/selector.js'].lineData[345] = 0;
  _$jscoverage['/base/selector.js'].lineData[347] = 0;
  _$jscoverage['/base/selector.js'].lineData[352] = 0;
  _$jscoverage['/base/selector.js'].lineData[365] = 0;
  _$jscoverage['/base/selector.js'].lineData[372] = 0;
  _$jscoverage['/base/selector.js'].lineData[375] = 0;
  _$jscoverage['/base/selector.js'].lineData[376] = 0;
  _$jscoverage['/base/selector.js'].lineData[377] = 0;
  _$jscoverage['/base/selector.js'].lineData[378] = 0;
  _$jscoverage['/base/selector.js'].lineData[379] = 0;
  _$jscoverage['/base/selector.js'].lineData[380] = 0;
  _$jscoverage['/base/selector.js'].lineData[384] = 0;
  _$jscoverage['/base/selector.js'].lineData[385] = 0;
  _$jscoverage['/base/selector.js'].lineData[389] = 0;
  _$jscoverage['/base/selector.js'].lineData[390] = 0;
  _$jscoverage['/base/selector.js'].lineData[393] = 0;
  _$jscoverage['/base/selector.js'].lineData[395] = 0;
  _$jscoverage['/base/selector.js'].lineData[396] = 0;
  _$jscoverage['/base/selector.js'].lineData[397] = 0;
  _$jscoverage['/base/selector.js'].lineData[402] = 0;
  _$jscoverage['/base/selector.js'].lineData[403] = 0;
  _$jscoverage['/base/selector.js'].lineData[405] = 0;
  _$jscoverage['/base/selector.js'].lineData[408] = 0;
  _$jscoverage['/base/selector.js'].lineData[420] = 0;
  _$jscoverage['/base/selector.js'].lineData[421] = 0;
  _$jscoverage['/base/selector.js'].lineData[425] = 0;
}
if (! _$jscoverage['/base/selector.js'].functionData) {
  _$jscoverage['/base/selector.js'].functionData = [];
  _$jscoverage['/base/selector.js'].functionData[0] = 0;
  _$jscoverage['/base/selector.js'].functionData[1] = 0;
  _$jscoverage['/base/selector.js'].functionData[2] = 0;
  _$jscoverage['/base/selector.js'].functionData[3] = 0;
  _$jscoverage['/base/selector.js'].functionData[4] = 0;
  _$jscoverage['/base/selector.js'].functionData[5] = 0;
  _$jscoverage['/base/selector.js'].functionData[6] = 0;
  _$jscoverage['/base/selector.js'].functionData[7] = 0;
  _$jscoverage['/base/selector.js'].functionData[8] = 0;
  _$jscoverage['/base/selector.js'].functionData[9] = 0;
  _$jscoverage['/base/selector.js'].functionData[10] = 0;
  _$jscoverage['/base/selector.js'].functionData[11] = 0;
  _$jscoverage['/base/selector.js'].functionData[12] = 0;
  _$jscoverage['/base/selector.js'].functionData[13] = 0;
  _$jscoverage['/base/selector.js'].functionData[14] = 0;
  _$jscoverage['/base/selector.js'].functionData[15] = 0;
  _$jscoverage['/base/selector.js'].functionData[16] = 0;
  _$jscoverage['/base/selector.js'].functionData[17] = 0;
  _$jscoverage['/base/selector.js'].functionData[18] = 0;
  _$jscoverage['/base/selector.js'].functionData[19] = 0;
  _$jscoverage['/base/selector.js'].functionData[20] = 0;
  _$jscoverage['/base/selector.js'].functionData[21] = 0;
  _$jscoverage['/base/selector.js'].functionData[22] = 0;
  _$jscoverage['/base/selector.js'].functionData[23] = 0;
  _$jscoverage['/base/selector.js'].functionData[24] = 0;
  _$jscoverage['/base/selector.js'].functionData[25] = 0;
  _$jscoverage['/base/selector.js'].functionData[26] = 0;
  _$jscoverage['/base/selector.js'].functionData[27] = 0;
  _$jscoverage['/base/selector.js'].functionData[28] = 0;
  _$jscoverage['/base/selector.js'].functionData[29] = 0;
}
if (! _$jscoverage['/base/selector.js'].branchData) {
  _$jscoverage['/base/selector.js'].branchData = {};
  _$jscoverage['/base/selector.js'].branchData['11'] = [];
  _$jscoverage['/base/selector.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['12'] = [];
  _$jscoverage['/base/selector.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['13'] = [];
  _$jscoverage['/base/selector.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['14'] = [];
  _$jscoverage['/base/selector.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['33'] = [];
  _$jscoverage['/base/selector.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['34'] = [];
  _$jscoverage['/base/selector.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['42'] = [];
  _$jscoverage['/base/selector.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['50'] = [];
  _$jscoverage['/base/selector.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['52'] = [];
  _$jscoverage['/base/selector.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['62'] = [];
  _$jscoverage['/base/selector.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['89'] = [];
  _$jscoverage['/base/selector.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['90'] = [];
  _$jscoverage['/base/selector.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['90'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['94'] = [];
  _$jscoverage['/base/selector.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['96'] = [];
  _$jscoverage['/base/selector.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['99'] = [];
  _$jscoverage['/base/selector.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['101'] = [];
  _$jscoverage['/base/selector.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['103'] = [];
  _$jscoverage['/base/selector.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['106'] = [];
  _$jscoverage['/base/selector.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['109'] = [];
  _$jscoverage['/base/selector.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['109'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['110'] = [];
  _$jscoverage['/base/selector.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['114'] = [];
  _$jscoverage['/base/selector.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['117'] = [];
  _$jscoverage['/base/selector.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['125'] = [];
  _$jscoverage['/base/selector.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['129'] = [];
  _$jscoverage['/base/selector.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['135'] = [];
  _$jscoverage['/base/selector.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['142'] = [];
  _$jscoverage['/base/selector.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['146'] = [];
  _$jscoverage['/base/selector.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['146'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['150'] = [];
  _$jscoverage['/base/selector.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['152'] = [];
  _$jscoverage['/base/selector.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['156'] = [];
  _$jscoverage['/base/selector.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['156'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['156'][3] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['165'] = [];
  _$jscoverage['/base/selector.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['167'] = [];
  _$jscoverage['/base/selector.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['170'] = [];
  _$jscoverage['/base/selector.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['175'] = [];
  _$jscoverage['/base/selector.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['186'] = [];
  _$jscoverage['/base/selector.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['191'] = [];
  _$jscoverage['/base/selector.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['192'] = [];
  _$jscoverage['/base/selector.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['193'] = [];
  _$jscoverage['/base/selector.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['211'] = [];
  _$jscoverage['/base/selector.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['212'] = [];
  _$jscoverage['/base/selector.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['212'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['213'] = [];
  _$jscoverage['/base/selector.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['217'] = [];
  _$jscoverage['/base/selector.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['218'] = [];
  _$jscoverage['/base/selector.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['225'] = [];
  _$jscoverage['/base/selector.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['225'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['225'][3] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['231'] = [];
  _$jscoverage['/base/selector.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['265'] = [];
  _$jscoverage['/base/selector.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['267'] = [];
  _$jscoverage['/base/selector.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['301'] = [];
  _$jscoverage['/base/selector.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['326'] = [];
  _$jscoverage['/base/selector.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['340'] = [];
  _$jscoverage['/base/selector.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['342'] = [];
  _$jscoverage['/base/selector.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['343'] = [];
  _$jscoverage['/base/selector.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['372'] = [];
  _$jscoverage['/base/selector.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['372'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['373'] = [];
  _$jscoverage['/base/selector.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['378'] = [];
  _$jscoverage['/base/selector.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['384'] = [];
  _$jscoverage['/base/selector.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['389'] = [];
  _$jscoverage['/base/selector.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['393'] = [];
  _$jscoverage['/base/selector.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['395'] = [];
  _$jscoverage['/base/selector.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['395'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['397'] = [];
  _$jscoverage['/base/selector.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['402'] = [];
  _$jscoverage['/base/selector.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['421'] = [];
  _$jscoverage['/base/selector.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['421'][2] = new BranchData();
}
_$jscoverage['/base/selector.js'].branchData['421'][2].init(103, 64, 'Dom.filter(elements, filter, context).length === elements.length');
function visit403_421_2(result) {
  _$jscoverage['/base/selector.js'].branchData['421'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['421'][1].init(83, 85, 'elements.length && (Dom.filter(elements, filter, context).length === elements.length)');
function visit402_421_1(result) {
  _$jscoverage['/base/selector.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['402'][1].init(1352, 28, 'typeof filter === \'function\'');
function visit401_402_1(result) {
  _$jscoverage['/base/selector.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['397'][1].init(37, 26, 'getAttr(elem, \'id\') === id');
function visit400_397_1(result) {
  _$jscoverage['/base/selector.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['395'][2].init(773, 12, '!tag && !cls');
function visit399_395_2(result) {
  _$jscoverage['/base/selector.js'].branchData['395'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['395'][1].init(767, 18, 'id && !tag && !cls');
function visit398_395_1(result) {
  _$jscoverage['/base/selector.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['393'][1].init(496, 14, 'clsRe && tagRe');
function visit397_393_1(result) {
  _$jscoverage['/base/selector.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['389'][1].init(352, 3, 'cls');
function visit396_389_1(result) {
  _$jscoverage['/base/selector.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['384'][1].init(175, 3, 'tag');
function visit395_384_1(result) {
  _$jscoverage['/base/selector.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['378'][1].init(136, 3, '!id');
function visit394_378_1(result) {
  _$jscoverage['/base/selector.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['373'][1].init(51, 85, '(filter = trim(filter)) && (match = rSimpleSelector.exec(filter))');
function visit393_373_1(result) {
  _$jscoverage['/base/selector.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['372'][2].init(215, 26, 'typeof filter === \'string\'');
function visit392_372_2(result) {
  _$jscoverage['/base/selector.js'].branchData['372'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['372'][1].init(215, 137, 'typeof filter === \'string\' && (filter = trim(filter)) && (match = rSimpleSelector.exec(filter))');
function visit391_372_1(result) {
  _$jscoverage['/base/selector.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['343'][1].init(34, 33, 'elements[i] === elements[i - 1]');
function visit390_343_1(result) {
  _$jscoverage['/base/selector.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['342'][1].init(92, 7, 'i < len');
function visit389_342_1(result) {
  _$jscoverage['/base/selector.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['340'][1].init(131, 12, 'hasDuplicate');
function visit388_340_1(result) {
  _$jscoverage['/base/selector.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['326'][1].init(26, 7, 'a === b');
function visit387_326_1(result) {
  _$jscoverage['/base/selector.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['301'][1].init(25, 35, 'query(selector, context)[0] || null');
function visit386_301_1(result) {
  _$jscoverage['/base/selector.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['267'][1].init(61, 20, 'matches.call(n, str)');
function visit385_267_1(result) {
  _$jscoverage['/base/selector.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['265'][1].init(149, 7, 'i < len');
function visit384_265_1(result) {
  _$jscoverage['/base/selector.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['231'][1].init(14, 56, '!a.compareDocumentPosition || !b.compareDocumentPosition');
function visit383_231_1(result) {
  _$jscoverage['/base/selector.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['225'][3].init(34, 49, 'el.nodeName.toLowerCase() === value.toLowerCase()');
function visit382_225_3(result) {
  _$jscoverage['/base/selector.js'].branchData['225'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['225'][2].init(17, 13, 'value === \'*\'');
function visit381_225_2(result) {
  _$jscoverage['/base/selector.js'].branchData['225'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['225'][1].init(17, 66, 'value === \'*\' || el.nodeName.toLowerCase() === value.toLowerCase()');
function visit380_225_1(result) {
  _$jscoverage['/base/selector.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['218'][1].init(66, 20, 'ret && ret.specified');
function visit379_218_1(result) {
  _$jscoverage['/base/selector.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['217'][1].init(20, 31, 'el && el.getAttributeNode(name)');
function visit378_217_1(result) {
  _$jscoverage['/base/selector.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['213'][1].init(67, 60, '(SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1');
function visit377_213_1(result) {
  _$jscoverage['/base/selector.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['212'][2].init(167, 128, '(className = className.replace(/[\\r\\t\\n]/g, SPACE)) && (SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1');
function visit376_212_2(result) {
  _$jscoverage['/base/selector.js'].branchData['212'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['212'][1].init(153, 142, 'className && (className = className.replace(/[\\r\\t\\n]/g, SPACE)) && (SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1');
function visit375_212_1(result) {
  _$jscoverage['/base/selector.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['211'][1].init(109, 26, 'el && getAttr(el, \'class\')');
function visit374_211_1(result) {
  _$jscoverage['/base/selector.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['193'][1].init(30, 35, 'Dom._contains(contexts[ci], tmp[i])');
function visit373_193_1(result) {
  _$jscoverage['/base/selector.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['192'][1].init(35, 16, 'ci < contextsLen');
function visit372_192_1(result) {
  _$jscoverage['/base/selector.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['191'][1].init(153, 7, 'i < len');
function visit371_191_1(result) {
  _$jscoverage['/base/selector.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['186'][1].init(1051, 14, '!simpleContext');
function visit370_186_1(result) {
  _$jscoverage['/base/selector.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['175'][1].init(654, 23, 'isDomNodeList(selector)');
function visit369_175_1(result) {
  _$jscoverage['/base/selector.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['170'][1].init(458, 17, 'isArray(selector)');
function visit368_170_1(result) {
  _$jscoverage['/base/selector.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['167'][1].init(312, 20, 'selector.getDOMNodes');
function visit367_167_1(result) {
  _$jscoverage['/base/selector.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['165'][1].init(204, 44, 'selector.nodeType || util.isWindow(selector)');
function visit366_165_1(result) {
  _$jscoverage['/base/selector.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['156'][3].init(266, 15, 'contextsLen > 1');
function visit365_156_3(result) {
  _$jscoverage['/base/selector.js'].branchData['156'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['156'][2].init(248, 14, 'ret.length > 1');
function visit364_156_2(result) {
  _$jscoverage['/base/selector.js'].branchData['156'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['156'][1].init(248, 33, 'ret.length > 1 && contextsLen > 1');
function visit363_156_1(result) {
  _$jscoverage['/base/selector.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['152'][1].init(57, 15, 'i < contextsLen');
function visit362_152_1(result) {
  _$jscoverage['/base/selector.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['150'][1].init(2396, 4, '!ret');
function visit361_150_1(result) {
  _$jscoverage['/base/selector.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['146'][2].init(1209, 18, 'parents.length > 1');
function visit360_146_2(result) {
  _$jscoverage['/base/selector.js'].branchData['146'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['146'][1].init(1198, 29, 'parents && parents.length > 1');
function visit359_146_1(result) {
  _$jscoverage['/base/selector.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['142'][1].init(568, 15, '!parents.length');
function visit358_142_1(result) {
  _$jscoverage['/base/selector.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['135'][1].init(80, 24, 'parentIndex < parentsLen');
function visit357_135_1(result) {
  _$jscoverage['/base/selector.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['129'][1].init(478, 12, 'i < partsLen');
function visit356_129_1(result) {
  _$jscoverage['/base/selector.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['125'][1].init(317, 12, 'i < partsLen');
function visit355_125_1(result) {
  _$jscoverage['/base/selector.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['117'][1].init(949, 59, 'isSimpleSelector(selector) && supportGetElementsByClassName');
function visit354_117_1(result) {
  _$jscoverage['/base/selector.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['114'][1].init(787, 27, 'rTagSelector.test(selector)');
function visit353_114_1(result) {
  _$jscoverage['/base/selector.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['110'][1].init(585, 26, 'rIdSelector.test(selector)');
function visit352_110_1(result) {
  _$jscoverage['/base/selector.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['109'][2].init(128, 39, 'el.nodeName.toLowerCase() === RegExp.$1');
function visit351_109_2(result) {
  _$jscoverage['/base/selector.js'].branchData['109'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['109'][1].init(122, 45, 'el && el.nodeName.toLowerCase() === RegExp.$1');
function visit350_109_1(result) {
  _$jscoverage['/base/selector.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['106'][1].init(343, 29, 'rTagIdSelector.test(selector)');
function visit349_106_1(result) {
  _$jscoverage['/base/selector.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['103'][1].init(142, 62, 'rClassSelector.test(selector) && supportGetElementsByClassName');
function visit348_103_1(result) {
  _$jscoverage['/base/selector.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['101'][1].init(51, 19, 'selector === \'body\'');
function visit347_101_1(result) {
  _$jscoverage['/base/selector.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['99'][1].init(60, 13, 'simpleContext');
function visit346_99_1(result) {
  _$jscoverage['/base/selector.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['96'][1].init(370, 16, 'isSelectorString');
function visit345_96_1(result) {
  _$jscoverage['/base/selector.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['94'][1].init(313, 9, '!selector');
function visit344_94_1(result) {
  _$jscoverage['/base/selector.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['90'][2].init(197, 27, '(simpleContext = 1) && [doc]');
function visit343_90_2(result) {
  _$jscoverage['/base/selector.js'].branchData['90'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['90'][1].init(155, 21, 'context !== undefined');
function visit342_90_1(result) {
  _$jscoverage['/base/selector.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['89'][1].init(101, 28, 'typeof selector === \'string\'');
function visit341_89_1(result) {
  _$jscoverage['/base/selector.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['62'][1].init(76, 35, 'match && Dom._contains(elem, match)');
function visit340_62_1(result) {
  _$jscoverage['/base/selector.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['52'][1].init(152, 9, 's === \'.\'');
function visit339_52_1(result) {
  _$jscoverage['/base/selector.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['50'][1].init(51, 9, 's === \'#\'');
function visit338_50_1(result) {
  _$jscoverage['/base/selector.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['42'][1].init(54, 5, '!name');
function visit337_42_1(result) {
  _$jscoverage['/base/selector.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['34'][1].init(18, 23, 'f(self[i], i) === false');
function visit336_34_1(result) {
  _$jscoverage['/base/selector.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['33'][1].init(94, 5, 'i < l');
function visit335_33_1(result) {
  _$jscoverage['/base/selector.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['14'][1].init(42, 66, 'docElem.oMatchesSelector || docElem.msMatchesSelector');
function visit334_14_1(result) {
  _$jscoverage['/base/selector.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['13'][1].init(45, 109, 'docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector');
function visit333_13_1(result) {
  _$jscoverage['/base/selector.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['12'][1].init(31, 155, 'docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector');
function visit332_12_1(result) {
  _$jscoverage['/base/selector.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['11'][1].init(89, 187, 'docElem.matches || docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector');
function visit331_11_1(result) {
  _$jscoverage['/base/selector.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/selector.js'].functionData[0]++;
  _$jscoverage['/base/selector.js'].lineData[7]++;
  var Dom = require('./api');
  _$jscoverage['/base/selector.js'].lineData[8]++;
  var util = require('util');
  _$jscoverage['/base/selector.js'].lineData[9]++;
  var doc = S.Env.host.document, docElem = doc.documentElement, matches = visit331_11_1(docElem.matches || visit332_12_1(docElem.webkitMatchesSelector || visit333_13_1(docElem.mozMatchesSelector || visit334_14_1(docElem.oMatchesSelector || docElem.msMatchesSelector)))), supportGetElementsByClassName = 'getElementsByClassName' in doc, isArray = util.isArray, makeArray = util.makeArray, isDomNodeList = Dom.isDomNodeList, SPACE = ' ', push = Array.prototype.push, rClassSelector = /^\.([\w-]+)$/, rIdSelector = /^#([\w-]+)$/, rTagSelector = /^([\w-])+$/, rTagIdSelector = /^([\w-]+)#([\w-]+)$/, rSimpleSelector = /^(?:#([\w-]+))?\s*([\w-]+|\*)?\.?([\w-]+)?$/, trim = util.trim;
  _$jscoverage['/base/selector.js'].lineData[29]++;
  function queryEach(f) {
    _$jscoverage['/base/selector.js'].functionData[1]++;
    _$jscoverage['/base/selector.js'].lineData[30]++;
    var self = this, l = self.length, i;
    _$jscoverage['/base/selector.js'].lineData[33]++;
    for (i = 0; visit335_33_1(i < l); i++) {
      _$jscoverage['/base/selector.js'].lineData[34]++;
      if (visit336_34_1(f(self[i], i) === false)) {
        _$jscoverage['/base/selector.js'].lineData[35]++;
        break;
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[40]++;
  function checkSelectorAndReturn(selector) {
    _$jscoverage['/base/selector.js'].functionData[2]++;
    _$jscoverage['/base/selector.js'].lineData[41]++;
    var name = selector.substr(1);
    _$jscoverage['/base/selector.js'].lineData[42]++;
    if (visit337_42_1(!name)) {
      _$jscoverage['/base/selector.js'].lineData[43]++;
      throw new Error('An invalid or illegal string was specified for selector.');
    }
    _$jscoverage['/base/selector.js'].lineData[45]++;
    return name;
  }
  _$jscoverage['/base/selector.js'].lineData[48]++;
  function makeMatch(selector) {
    _$jscoverage['/base/selector.js'].functionData[3]++;
    _$jscoverage['/base/selector.js'].lineData[49]++;
    var s = selector.charAt(0);
    _$jscoverage['/base/selector.js'].lineData[50]++;
    if (visit338_50_1(s === '#')) {
      _$jscoverage['/base/selector.js'].lineData[51]++;
      return makeIdMatch(checkSelectorAndReturn(selector));
    } else {
      _$jscoverage['/base/selector.js'].lineData[52]++;
      if (visit339_52_1(s === '.')) {
        _$jscoverage['/base/selector.js'].lineData[53]++;
        return makeClassMatch(checkSelectorAndReturn(selector));
      } else {
        _$jscoverage['/base/selector.js'].lineData[55]++;
        return makeTagMatch(selector);
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[59]++;
  function makeIdMatch(id) {
    _$jscoverage['/base/selector.js'].functionData[4]++;
    _$jscoverage['/base/selector.js'].lineData[60]++;
    return function(elem) {
  _$jscoverage['/base/selector.js'].functionData[5]++;
  _$jscoverage['/base/selector.js'].lineData[61]++;
  var match = Dom._getElementById(id, doc);
  _$jscoverage['/base/selector.js'].lineData[62]++;
  return visit340_62_1(match && Dom._contains(elem, match)) ? [match] : [];
};
  }
  _$jscoverage['/base/selector.js'].lineData[66]++;
  function makeClassMatch(className) {
    _$jscoverage['/base/selector.js'].functionData[6]++;
    _$jscoverage['/base/selector.js'].lineData[67]++;
    return function(elem) {
  _$jscoverage['/base/selector.js'].functionData[7]++;
  _$jscoverage['/base/selector.js'].lineData[68]++;
  return elem.getElementsByClassName(className);
};
  }
  _$jscoverage['/base/selector.js'].lineData[72]++;
  function makeTagMatch(tagName) {
    _$jscoverage['/base/selector.js'].functionData[8]++;
    _$jscoverage['/base/selector.js'].lineData[73]++;
    return function(elem) {
  _$jscoverage['/base/selector.js'].functionData[9]++;
  _$jscoverage['/base/selector.js'].lineData[74]++;
  return elem.getElementsByTagName(tagName);
};
  }
  _$jscoverage['/base/selector.js'].lineData[79]++;
  function isSimpleSelector(selector) {
    _$jscoverage['/base/selector.js'].functionData[10]++;
    _$jscoverage['/base/selector.js'].lineData[80]++;
    var complexReg = /,|\+|=|~|\[|\]|:|>|\||\$|\^|\*|\(|\)|[\w-]+\.[\w-]+|[\w-]+#[\w-]+/;
    _$jscoverage['/base/selector.js'].lineData[81]++;
    return !selector.match(complexReg);
  }
  _$jscoverage['/base/selector.js'].lineData[84]++;
  function query(selector, context) {
    _$jscoverage['/base/selector.js'].functionData[11]++;
    _$jscoverage['/base/selector.js'].lineData[85]++;
    var ret, i, el, simpleContext, isSelectorString = visit341_89_1(typeof selector === 'string'), contexts = visit342_90_1(context !== undefined) ? query(context) : visit343_90_2((simpleContext = 1) && [doc]), contextsLen = contexts.length;
    _$jscoverage['/base/selector.js'].lineData[94]++;
    if (visit344_94_1(!selector)) {
      _$jscoverage['/base/selector.js'].lineData[95]++;
      ret = [];
    } else {
      _$jscoverage['/base/selector.js'].lineData[96]++;
      if (visit345_96_1(isSelectorString)) {
        _$jscoverage['/base/selector.js'].lineData[97]++;
        selector = trim(selector);
        _$jscoverage['/base/selector.js'].lineData[99]++;
        if (visit346_99_1(simpleContext)) {
          _$jscoverage['/base/selector.js'].lineData[101]++;
          if (visit347_101_1(selector === 'body')) {
            _$jscoverage['/base/selector.js'].lineData[102]++;
            ret = [doc.body];
          } else {
            _$jscoverage['/base/selector.js'].lineData[103]++;
            if (visit348_103_1(rClassSelector.test(selector) && supportGetElementsByClassName)) {
              _$jscoverage['/base/selector.js'].lineData[105]++;
              ret = makeArray(doc.getElementsByClassName(RegExp.$1));
            } else {
              _$jscoverage['/base/selector.js'].lineData[106]++;
              if (visit349_106_1(rTagIdSelector.test(selector))) {
                _$jscoverage['/base/selector.js'].lineData[108]++;
                el = Dom._getElementById(RegExp.$2, doc);
                _$jscoverage['/base/selector.js'].lineData[109]++;
                ret = visit350_109_1(el && visit351_109_2(el.nodeName.toLowerCase() === RegExp.$1)) ? [el] : [];
              } else {
                _$jscoverage['/base/selector.js'].lineData[110]++;
                if (visit352_110_1(rIdSelector.test(selector))) {
                  _$jscoverage['/base/selector.js'].lineData[112]++;
                  el = Dom._getElementById(selector.substr(1), doc);
                  _$jscoverage['/base/selector.js'].lineData[113]++;
                  ret = el ? [el] : [];
                } else {
                  _$jscoverage['/base/selector.js'].lineData[114]++;
                  if (visit353_114_1(rTagSelector.test(selector))) {
                    _$jscoverage['/base/selector.js'].lineData[116]++;
                    ret = makeArray(doc.getElementsByTagName(selector));
                  } else {
                    _$jscoverage['/base/selector.js'].lineData[117]++;
                    if (visit354_117_1(isSimpleSelector(selector) && supportGetElementsByClassName)) {
                      _$jscoverage['/base/selector.js'].lineData[119]++;
                      var parts = selector.split(/\s+/), partsLen, parents = contexts, parentIndex, parentsLen;
                      _$jscoverage['/base/selector.js'].lineData[125]++;
                      for (i = 0 , partsLen = parts.length; visit355_125_1(i < partsLen); i++) {
                        _$jscoverage['/base/selector.js'].lineData[126]++;
                        parts[i] = makeMatch(parts[i]);
                      }
                      _$jscoverage['/base/selector.js'].lineData[129]++;
                      for (i = 0 , partsLen = parts.length; visit356_129_1(i < partsLen); i++) {
                        _$jscoverage['/base/selector.js'].lineData[130]++;
                        var part = parts[i], newParents = [], matches;
                        _$jscoverage['/base/selector.js'].lineData[134]++;
                        for (parentIndex = 0 , parentsLen = parents.length; visit357_135_1(parentIndex < parentsLen); parentIndex++) {
                          _$jscoverage['/base/selector.js'].lineData[137]++;
                          matches = part(parents[parentIndex]);
                          _$jscoverage['/base/selector.js'].lineData[138]++;
                          newParents.push.apply(newParents, makeArray(matches));
                        }
                        _$jscoverage['/base/selector.js'].lineData[141]++;
                        parents = newParents;
                        _$jscoverage['/base/selector.js'].lineData[142]++;
                        if (visit358_142_1(!parents.length)) {
                          _$jscoverage['/base/selector.js'].lineData[143]++;
                          break;
                        }
                      }
                      _$jscoverage['/base/selector.js'].lineData[146]++;
                      ret = visit359_146_1(parents && visit360_146_2(parents.length > 1)) ? Dom.unique(parents) : parents;
                    }
                  }
                }
              }
            }
          }
        }
        _$jscoverage['/base/selector.js'].lineData[150]++;
        if (visit361_150_1(!ret)) {
          _$jscoverage['/base/selector.js'].lineData[151]++;
          ret = [];
          _$jscoverage['/base/selector.js'].lineData[152]++;
          for (i = 0; visit362_152_1(i < contextsLen); i++) {
            _$jscoverage['/base/selector.js'].lineData[153]++;
            push.apply(ret, Dom._selectInternal(selector, contexts[i]));
          }
          _$jscoverage['/base/selector.js'].lineData[156]++;
          if (visit363_156_1(visit364_156_2(ret.length > 1) && visit365_156_3(contextsLen > 1))) {
            _$jscoverage['/base/selector.js'].lineData[157]++;
            Dom.unique(ret);
          }
        }
      } else {
        _$jscoverage['/base/selector.js'].lineData[165]++;
        if (visit366_165_1(selector.nodeType || util.isWindow(selector))) {
          _$jscoverage['/base/selector.js'].lineData[166]++;
          ret = [selector];
        } else {
          _$jscoverage['/base/selector.js'].lineData[167]++;
          if (visit367_167_1(selector.getDOMNodes)) {
            _$jscoverage['/base/selector.js'].lineData[169]++;
            ret = selector.getDOMNodes();
          } else {
            _$jscoverage['/base/selector.js'].lineData[170]++;
            if (visit368_170_1(isArray(selector))) {
              _$jscoverage['/base/selector.js'].lineData[174]++;
              ret = selector;
            } else {
              _$jscoverage['/base/selector.js'].lineData[175]++;
              if (visit369_175_1(isDomNodeList(selector))) {
                _$jscoverage['/base/selector.js'].lineData[181]++;
                ret = makeArray(selector);
              } else {
                _$jscoverage['/base/selector.js'].lineData[183]++;
                ret = [selector];
              }
            }
          }
        }
        _$jscoverage['/base/selector.js'].lineData[186]++;
        if (visit370_186_1(!simpleContext)) {
          _$jscoverage['/base/selector.js'].lineData[187]++;
          var tmp = ret, ci, len = tmp.length;
          _$jscoverage['/base/selector.js'].lineData[190]++;
          ret = [];
          _$jscoverage['/base/selector.js'].lineData[191]++;
          for (i = 0; visit371_191_1(i < len); i++) {
            _$jscoverage['/base/selector.js'].lineData[192]++;
            for (ci = 0; visit372_192_1(ci < contextsLen); ci++) {
              _$jscoverage['/base/selector.js'].lineData[193]++;
              if (visit373_193_1(Dom._contains(contexts[ci], tmp[i]))) {
                _$jscoverage['/base/selector.js'].lineData[194]++;
                ret.push(tmp[i]);
                _$jscoverage['/base/selector.js'].lineData[195]++;
                break;
              }
            }
          }
        }
      }
    }
    _$jscoverage['/base/selector.js'].lineData[203]++;
    ret.each = queryEach;
    _$jscoverage['/base/selector.js'].lineData[205]++;
    return ret;
  }
  _$jscoverage['/base/selector.js'].lineData[208]++;
  function hasSingleClass(el, cls) {
    _$jscoverage['/base/selector.js'].functionData[12]++;
    _$jscoverage['/base/selector.js'].lineData[211]++;
    var className = visit374_211_1(el && getAttr(el, 'class'));
    _$jscoverage['/base/selector.js'].lineData[212]++;
    return visit375_212_1(className && visit376_212_2((className = className.replace(/[\r\t\n]/g, SPACE)) && visit377_213_1((SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1)));
  }
  _$jscoverage['/base/selector.js'].lineData[216]++;
  function getAttr(el, name) {
    _$jscoverage['/base/selector.js'].functionData[13]++;
    _$jscoverage['/base/selector.js'].lineData[217]++;
    var ret = visit378_217_1(el && el.getAttributeNode(name));
    _$jscoverage['/base/selector.js'].lineData[218]++;
    if (visit379_218_1(ret && ret.specified)) {
      _$jscoverage['/base/selector.js'].lineData[219]++;
      return 'value' in ret ? ret.value : ret.nodeValue;
    }
    _$jscoverage['/base/selector.js'].lineData[221]++;
    return undefined;
  }
  _$jscoverage['/base/selector.js'].lineData[224]++;
  function isTag(el, value) {
    _$jscoverage['/base/selector.js'].functionData[14]++;
    _$jscoverage['/base/selector.js'].lineData[225]++;
    return visit380_225_1(visit381_225_2(value === '*') || visit382_225_3(el.nodeName.toLowerCase() === value.toLowerCase()));
  }
  _$jscoverage['/base/selector.js'].lineData[228]++;
  var compareNodeOrder = ('sourceIndex' in docElem) ? function(a, b) {
  _$jscoverage['/base/selector.js'].functionData[15]++;
  _$jscoverage['/base/selector.js'].lineData[229]++;
  return a.sourceIndex - b.sourceIndex;
} : function(a, b) {
  _$jscoverage['/base/selector.js'].functionData[16]++;
  _$jscoverage['/base/selector.js'].lineData[231]++;
  if (visit383_231_1(!a.compareDocumentPosition || !b.compareDocumentPosition)) {
    _$jscoverage['/base/selector.js'].lineData[232]++;
    return a.compareDocumentPosition ? -1 : 1;
  }
  _$jscoverage['/base/selector.js'].lineData[234]++;
  var bit = a.compareDocumentPosition(b) & 4;
  _$jscoverage['/base/selector.js'].lineData[235]++;
  return bit ? -1 : 1;
};
  _$jscoverage['/base/selector.js'].lineData[238]++;
  util.mix(Dom, {
  _getElementsByTagName: function(name, context) {
  _$jscoverage['/base/selector.js'].functionData[17]++;
  _$jscoverage['/base/selector.js'].lineData[247]++;
  return makeArray(context.querySelectorAll(name));
}, 
  _getElementById: function(id, doc) {
  _$jscoverage['/base/selector.js'].functionData[18]++;
  _$jscoverage['/base/selector.js'].lineData[251]++;
  return doc.getElementById(id);
}, 
  _getSimpleAttr: getAttr, 
  _isTag: isTag, 
  _hasSingleClass: hasSingleClass, 
  _matchesInternal: function(str, seeds) {
  _$jscoverage['/base/selector.js'].functionData[19]++;
  _$jscoverage['/base/selector.js'].lineData[261]++;
  var ret = [], i = 0, n, len = seeds.length;
  _$jscoverage['/base/selector.js'].lineData[265]++;
  for (; visit384_265_1(i < len); i++) {
    _$jscoverage['/base/selector.js'].lineData[266]++;
    n = seeds[i];
    _$jscoverage['/base/selector.js'].lineData[267]++;
    if (visit385_267_1(matches.call(n, str))) {
      _$jscoverage['/base/selector.js'].lineData[268]++;
      ret.push(n);
    }
  }
  _$jscoverage['/base/selector.js'].lineData[271]++;
  return ret;
}, 
  _selectInternal: function(str, context) {
  _$jscoverage['/base/selector.js'].functionData[20]++;
  _$jscoverage['/base/selector.js'].lineData[275]++;
  return makeArray(context.querySelectorAll(str));
}, 
  query: query, 
  get: function(selector, context) {
  _$jscoverage['/base/selector.js'].functionData[21]++;
  _$jscoverage['/base/selector.js'].lineData[301]++;
  return visit386_301_1(query(selector, context)[0] || null);
}, 
  unique: (function() {
  _$jscoverage['/base/selector.js'].functionData[22]++;
  _$jscoverage['/base/selector.js'].lineData[313]++;
  var hasDuplicate, baseHasDuplicate = true;
  _$jscoverage['/base/selector.js'].lineData[320]++;
  [0, 0].sort(function() {
  _$jscoverage['/base/selector.js'].functionData[23]++;
  _$jscoverage['/base/selector.js'].lineData[321]++;
  baseHasDuplicate = false;
  _$jscoverage['/base/selector.js'].lineData[322]++;
  return 0;
});
  _$jscoverage['/base/selector.js'].lineData[325]++;
  function sortOrder(a, b) {
    _$jscoverage['/base/selector.js'].functionData[24]++;
    _$jscoverage['/base/selector.js'].lineData[326]++;
    if (visit387_326_1(a === b)) {
      _$jscoverage['/base/selector.js'].lineData[327]++;
      hasDuplicate = true;
      _$jscoverage['/base/selector.js'].lineData[328]++;
      return 0;
    }
    _$jscoverage['/base/selector.js'].lineData[331]++;
    return compareNodeOrder(a, b);
  }
  _$jscoverage['/base/selector.js'].lineData[335]++;
  return function(elements) {
  _$jscoverage['/base/selector.js'].functionData[25]++;
  _$jscoverage['/base/selector.js'].lineData[337]++;
  hasDuplicate = baseHasDuplicate;
  _$jscoverage['/base/selector.js'].lineData[338]++;
  elements.sort(sortOrder);
  _$jscoverage['/base/selector.js'].lineData[340]++;
  if (visit388_340_1(hasDuplicate)) {
    _$jscoverage['/base/selector.js'].lineData[341]++;
    var i = 1, len = elements.length;
    _$jscoverage['/base/selector.js'].lineData[342]++;
    while (visit389_342_1(i < len)) {
      _$jscoverage['/base/selector.js'].lineData[343]++;
      if (visit390_343_1(elements[i] === elements[i - 1])) {
        _$jscoverage['/base/selector.js'].lineData[344]++;
        elements.splice(i, 1);
        _$jscoverage['/base/selector.js'].lineData[345]++;
        --len;
      } else {
        _$jscoverage['/base/selector.js'].lineData[347]++;
        i++;
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[352]++;
  return elements;
};
})(), 
  filter: function(selector, filter, context) {
  _$jscoverage['/base/selector.js'].functionData[26]++;
  _$jscoverage['/base/selector.js'].lineData[365]++;
  var elems = query(selector, context), id, tag, match, cls, ret = [];
  _$jscoverage['/base/selector.js'].lineData[372]++;
  if (visit391_372_1(visit392_372_2(typeof filter === 'string') && visit393_373_1((filter = trim(filter)) && (match = rSimpleSelector.exec(filter))))) {
    _$jscoverage['/base/selector.js'].lineData[375]++;
    id = match[1];
    _$jscoverage['/base/selector.js'].lineData[376]++;
    tag = match[2];
    _$jscoverage['/base/selector.js'].lineData[377]++;
    cls = match[3];
    _$jscoverage['/base/selector.js'].lineData[378]++;
    if (visit394_378_1(!id)) {
      _$jscoverage['/base/selector.js'].lineData[379]++;
      filter = function(elem) {
  _$jscoverage['/base/selector.js'].functionData[27]++;
  _$jscoverage['/base/selector.js'].lineData[380]++;
  var tagRe = true, clsRe = true;
  _$jscoverage['/base/selector.js'].lineData[384]++;
  if (visit395_384_1(tag)) {
    _$jscoverage['/base/selector.js'].lineData[385]++;
    tagRe = isTag(elem, tag);
  }
  _$jscoverage['/base/selector.js'].lineData[389]++;
  if (visit396_389_1(cls)) {
    _$jscoverage['/base/selector.js'].lineData[390]++;
    clsRe = hasSingleClass(elem, cls);
  }
  _$jscoverage['/base/selector.js'].lineData[393]++;
  return visit397_393_1(clsRe && tagRe);
};
    } else {
      _$jscoverage['/base/selector.js'].lineData[395]++;
      if (visit398_395_1(id && visit399_395_2(!tag && !cls))) {
        _$jscoverage['/base/selector.js'].lineData[396]++;
        filter = function(elem) {
  _$jscoverage['/base/selector.js'].functionData[28]++;
  _$jscoverage['/base/selector.js'].lineData[397]++;
  return visit400_397_1(getAttr(elem, 'id') === id);
};
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[402]++;
  if (visit401_402_1(typeof filter === 'function')) {
    _$jscoverage['/base/selector.js'].lineData[403]++;
    ret = util.filter(elems, filter);
  } else {
    _$jscoverage['/base/selector.js'].lineData[405]++;
    ret = Dom._matchesInternal(filter, elems);
  }
  _$jscoverage['/base/selector.js'].lineData[408]++;
  return ret;
}, 
  test: function(selector, filter, context) {
  _$jscoverage['/base/selector.js'].functionData[29]++;
  _$jscoverage['/base/selector.js'].lineData[420]++;
  var elements = query(selector, context);
  _$jscoverage['/base/selector.js'].lineData[421]++;
  return visit402_421_1(elements.length && (visit403_421_2(Dom.filter(elements, filter, context).length === elements.length)));
}});
  _$jscoverage['/base/selector.js'].lineData[425]++;
  return Dom;
});
