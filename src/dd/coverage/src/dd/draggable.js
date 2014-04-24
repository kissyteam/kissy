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
if (! _$jscoverage['/dd/draggable.js']) {
  _$jscoverage['/dd/draggable.js'] = {};
  _$jscoverage['/dd/draggable.js'].lineData = [];
  _$jscoverage['/dd/draggable.js'].lineData[6] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[7] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[13] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[21] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[22] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[23] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[24] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[29] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[30] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[33] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[34] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[37] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[38] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[46] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[48] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[49] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[50] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[214] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[216] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[220] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[223] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[224] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[225] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[227] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[232] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[236] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[238] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[244] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[249] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[251] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[256] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[261] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[263] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[264] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[266] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[270] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[273] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[275] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[276] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[277] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[278] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[280] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[282] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[286] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[287] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[288] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[290] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[294] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[296] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[298] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[299] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[300] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[314] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[315] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[322] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[323] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[326] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[327] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[332] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[333] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[337] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[338] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[347] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[351] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[356] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[357] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[360] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[365] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[375] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[377] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[378] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[379] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[381] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[382] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[383] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[387] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[390] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[393] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[394] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[397] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[401] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[402] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[405] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[407] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[416] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[417] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[422] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[424] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[427] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[430] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[432] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[434] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[435] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[440] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[445] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[447] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[459] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[460] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[463] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[470] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[471] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[473] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[477] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[486] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[509] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[510] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[512] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[555] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[556] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[557] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[559] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[560] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[561] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[564] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[565] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[567] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[568] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[570] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[572] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[573] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[734] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[736] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[737] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[740] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[741] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[746] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[747] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[748] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[751] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[752] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[762] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[763] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[769] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[770] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[773] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[774] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[775] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[778] = 0;
}
if (! _$jscoverage['/dd/draggable.js'].functionData) {
  _$jscoverage['/dd/draggable.js'].functionData = [];
  _$jscoverage['/dd/draggable.js'].functionData[0] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[1] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[2] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[3] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[4] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[5] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[6] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[7] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[8] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[9] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[10] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[11] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[12] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[13] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[14] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[15] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[16] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[17] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[18] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[19] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[20] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[21] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[22] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[23] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[24] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[25] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[26] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[27] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[28] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[29] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[30] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[31] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[32] = 0;
}
if (! _$jscoverage['/dd/draggable.js'].branchData) {
  _$jscoverage['/dd/draggable.js'].branchData = {};
  _$jscoverage['/dd/draggable.js'].branchData['23'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['223'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['224'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['238'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['251'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['263'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['275'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['275'][2] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['287'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['287'][2] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['298'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['314'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['322'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['326'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['356'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['377'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['393'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['401'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['405'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['416'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['422'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['509'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['509'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['556'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['556'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['560'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['560'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['564'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['564'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['567'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['567'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['740'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['740'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['751'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['751'][1] = new BranchData();
}
_$jscoverage['/dd/draggable.js'].branchData['751'][1].init(310, 19, 'doc.body.setCapture');
function visit81_751_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['751'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['740'][1].init(263, 23, 'doc.body.releaseCapture');
function visit80_740_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['740'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['567'][1].init(346, 10, 'v.nodeType');
function visit79_567_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['567'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['564'][1].init(207, 21, 'typeof v === \'string\'');
function visit78_564_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['564'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['560'][1].init(30, 23, 'typeof v === \'function\'');
function visit77_560_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['560'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['556'][1].init(64, 10, '!vs.length');
function visit76_556_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['556'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['509'][1].init(26, 20, '!(v instanceof Node)');
function visit75_509_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['509'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['422'][1].init(18, 7, 'e || {}');
function visit74_422_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['416'][1].init(18, 17, 'this._isValidDrag');
function visit73_416_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['405'][1].init(1582, 11, 'def && move');
function visit72_405_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['401'][1].init(1475, 32, 'self.get(\'preventDefaultOnMove\')');
function visit71_401_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['393'][1].init(1273, 40, 'self.fire(\'drag\', customEvent) === false');
function visit70_393_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['377'][1].init(704, 4, 'move');
function visit69_377_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['356'][1].init(155, 25, 'e.gestureType === \'touch\'');
function visit68_356_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['326'][1].init(1102, 15, 'self._allowMove');
function visit67_326_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['322'][1].init(1002, 25, 'e.gestureType === \'mouse\'');
function visit66_322_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['314'][1].init(704, 16, 'self.get(\'halt\')');
function visit65_314_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['298'][1].init(88, 2, 'ie');
function visit64_298_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['287'][2].init(81, 13, 'e.which !== 1');
function visit63_287_2(result) {
  _$jscoverage['/dd/draggable.js'].branchData['287'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['287'][1].init(48, 46, 'self.get(\'primaryButtonOnly\') && e.which !== 1');
function visit62_287_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['275'][2].init(53, 16, 'handler[0] === t');
function visit61_275_2(result) {
  _$jscoverage['/dd/draggable.js'].branchData['275'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['275'][1].init(53, 39, 'handler[0] === t || handler.contains(t)');
function visit60_275_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['263'][1].init(94, 4, 'node');
function visit59_263_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['251'][1].init(97, 4, 'node');
function visit58_251_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['238'][1].init(97, 4, 'node');
function visit57_238_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['224'][1].init(22, 22, '!self._checkHandler(t)');
function visit56_224_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['223'][1].init(81, 28, 'self._checkDragStartValid(e)');
function visit55_223_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['23'][1].init(18, 17, 'this._isValidDrag');
function visit54_23_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dd/draggable.js'].functionData[0]++;
  _$jscoverage['/dd/draggable.js'].lineData[7]++;
  var Node = require('node'), BaseGesture = require('event/gesture/base'), DDM = require('./ddm'), Base = require('base'), DragGesture = require('event/gesture/drag');
  _$jscoverage['/dd/draggable.js'].lineData[13]++;
  var UA = require('ua'), $ = Node.all, $doc = $(document), each = S.each, ie = UA.ie, PREFIX_CLS = DDM.PREFIX_CLS, doc = S.Env.host.document;
  _$jscoverage['/dd/draggable.js'].lineData[21]++;
  function checkValid(fn) {
    _$jscoverage['/dd/draggable.js'].functionData[1]++;
    _$jscoverage['/dd/draggable.js'].lineData[22]++;
    return function() {
  _$jscoverage['/dd/draggable.js'].functionData[2]++;
  _$jscoverage['/dd/draggable.js'].lineData[23]++;
  if (visit54_23_1(this._isValidDrag)) {
    _$jscoverage['/dd/draggable.js'].lineData[24]++;
    fn.apply(this, arguments);
  }
};
  }
  _$jscoverage['/dd/draggable.js'].lineData[29]++;
  var onDragStart = checkValid(function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[3]++;
  _$jscoverage['/dd/draggable.js'].lineData[30]++;
  this._start(e);
});
  _$jscoverage['/dd/draggable.js'].lineData[33]++;
  var onDrag = checkValid(function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[4]++;
  _$jscoverage['/dd/draggable.js'].lineData[34]++;
  this._move(e);
});
  _$jscoverage['/dd/draggable.js'].lineData[37]++;
  var onDragEnd = checkValid(function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[5]++;
  _$jscoverage['/dd/draggable.js'].lineData[38]++;
  this._end(e);
});
  _$jscoverage['/dd/draggable.js'].lineData[46]++;
  var Draggable = Base.extend({
  initializer: function() {
  _$jscoverage['/dd/draggable.js'].functionData[6]++;
  _$jscoverage['/dd/draggable.js'].lineData[48]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[49]++;
  self.addTarget(DDM);
  _$jscoverage['/dd/draggable.js'].lineData[50]++;
  self._allowMove = self.get('move');
}, 
  _onSetNode: function(n) {
  _$jscoverage['/dd/draggable.js'].functionData[7]++;
  _$jscoverage['/dd/draggable.js'].lineData[214]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[216]++;
  self.setInternal('dragNode', n);
}, 
  onGestureStart: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[8]++;
  _$jscoverage['/dd/draggable.js'].lineData[220]++;
  var self = this, t = e.target;
  _$jscoverage['/dd/draggable.js'].lineData[223]++;
  if (visit55_223_1(self._checkDragStartValid(e))) {
    _$jscoverage['/dd/draggable.js'].lineData[224]++;
    if (visit56_224_1(!self._checkHandler(t))) {
      _$jscoverage['/dd/draggable.js'].lineData[225]++;
      return;
    }
    _$jscoverage['/dd/draggable.js'].lineData[227]++;
    self._prepare(e);
  }
}, 
  getEventTargetEl: function() {
  _$jscoverage['/dd/draggable.js'].functionData[9]++;
  _$jscoverage['/dd/draggable.js'].lineData[232]++;
  return this.get('node');
}, 
  start: function() {
  _$jscoverage['/dd/draggable.js'].functionData[10]++;
  _$jscoverage['/dd/draggable.js'].lineData[236]++;
  var self = this, node = self.getEventTargetEl();
  _$jscoverage['/dd/draggable.js'].lineData[238]++;
  if (visit57_238_1(node)) {
    _$jscoverage['/dd/draggable.js'].lineData[244]++;
    node.on(DragGesture.DRAG_START, onDragStart, self).on(DragGesture.DRAG, onDrag, self).on(DragGesture.DRAG_END, onDragEnd, self).on(BaseGesture.START, onGestureStart, self).on(['dragstart', 'touchmove'], preventDefault);
  }
}, 
  stop: function() {
  _$jscoverage['/dd/draggable.js'].functionData[11]++;
  _$jscoverage['/dd/draggable.js'].lineData[249]++;
  var self = this, node = self.getEventTargetEl();
  _$jscoverage['/dd/draggable.js'].lineData[251]++;
  if (visit58_251_1(node)) {
    _$jscoverage['/dd/draggable.js'].lineData[256]++;
    node.detach(DragGesture.DRAG_START, onDragStart, self).detach(DragGesture.DRAG, onDrag, self).detach(DragGesture.DRAG_END, onDragEnd, self).detach(BaseGesture.START, onGestureStart, self).detach(['dragstart', 'touchmove'], preventDefault);
  }
}, 
  _onSetDisabled: function(d) {
  _$jscoverage['/dd/draggable.js'].functionData[12]++;
  _$jscoverage['/dd/draggable.js'].lineData[261]++;
  var self = this, node = self.get('dragNode');
  _$jscoverage['/dd/draggable.js'].lineData[263]++;
  if (visit59_263_1(node)) {
    _$jscoverage['/dd/draggable.js'].lineData[264]++;
    node[d ? 'addClass' : 'removeClass'](PREFIX_CLS + '-disabled');
  }
  _$jscoverage['/dd/draggable.js'].lineData[266]++;
  self[d ? 'stop' : 'start']();
}, 
  _checkHandler: function(t) {
  _$jscoverage['/dd/draggable.js'].functionData[13]++;
  _$jscoverage['/dd/draggable.js'].lineData[270]++;
  var self = this, handlers = self.get('handlers'), ret = 0;
  _$jscoverage['/dd/draggable.js'].lineData[273]++;
  each(handlers, function(handler) {
  _$jscoverage['/dd/draggable.js'].functionData[14]++;
  _$jscoverage['/dd/draggable.js'].lineData[275]++;
  if (visit60_275_1(visit61_275_2(handler[0] === t) || handler.contains(t))) {
    _$jscoverage['/dd/draggable.js'].lineData[276]++;
    ret = 1;
    _$jscoverage['/dd/draggable.js'].lineData[277]++;
    self.setInternal('activeHandler', handler);
    _$jscoverage['/dd/draggable.js'].lineData[278]++;
    return false;
  }
  _$jscoverage['/dd/draggable.js'].lineData[280]++;
  return undefined;
});
  _$jscoverage['/dd/draggable.js'].lineData[282]++;
  return ret;
}, 
  _checkDragStartValid: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[15]++;
  _$jscoverage['/dd/draggable.js'].lineData[286]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[287]++;
  if (visit62_287_1(self.get('primaryButtonOnly') && visit63_287_2(e.which !== 1))) {
    _$jscoverage['/dd/draggable.js'].lineData[288]++;
    return 0;
  }
  _$jscoverage['/dd/draggable.js'].lineData[290]++;
  return 1;
}, 
  _prepare: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[16]++;
  _$jscoverage['/dd/draggable.js'].lineData[294]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[296]++;
  self._isValidDrag = 1;
  _$jscoverage['/dd/draggable.js'].lineData[298]++;
  if (visit64_298_1(ie)) {
    _$jscoverage['/dd/draggable.js'].lineData[299]++;
    fixIEMouseDown();
    _$jscoverage['/dd/draggable.js'].lineData[300]++;
    $doc.on(BaseGesture.END, {
  fn: fixIEMouseUp, 
  once: true});
  }
  _$jscoverage['/dd/draggable.js'].lineData[314]++;
  if (visit65_314_1(self.get('halt'))) {
    _$jscoverage['/dd/draggable.js'].lineData[315]++;
    e.stopPropagation();
  }
  _$jscoverage['/dd/draggable.js'].lineData[322]++;
  if (visit66_322_1(e.gestureType === 'mouse')) {
    _$jscoverage['/dd/draggable.js'].lineData[323]++;
    e.preventDefault();
  }
  _$jscoverage['/dd/draggable.js'].lineData[326]++;
  if (visit67_326_1(self._allowMove)) {
    _$jscoverage['/dd/draggable.js'].lineData[327]++;
    self.setInternal('startNodePos', self.get('node').offset());
  }
}, 
  _start: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[17]++;
  _$jscoverage['/dd/draggable.js'].lineData[332]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[333]++;
  self.mousePos = {
  left: e.pageX, 
  top: e.pageY};
  _$jscoverage['/dd/draggable.js'].lineData[337]++;
  DDM.start(e, self);
  _$jscoverage['/dd/draggable.js'].lineData[338]++;
  self.fire('dragstart', {
  drag: self, 
  gestureType: e.gestureType, 
  startPos: e.startPos, 
  deltaX: e.deltaX, 
  deltaY: e.deltaY, 
  pageX: e.pageX, 
  pageY: e.pageY});
  _$jscoverage['/dd/draggable.js'].lineData[347]++;
  self.get('dragNode').addClass(PREFIX_CLS + 'dragging');
}, 
  _move: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[18]++;
  _$jscoverage['/dd/draggable.js'].lineData[351]++;
  var self = this, pageX = e.pageX, pageY = e.pageY;
  _$jscoverage['/dd/draggable.js'].lineData[356]++;
  if (visit68_356_1(e.gestureType === 'touch')) {
    _$jscoverage['/dd/draggable.js'].lineData[357]++;
    e.preventDefault();
  }
  _$jscoverage['/dd/draggable.js'].lineData[360]++;
  self.mousePos = {
  left: pageX, 
  top: pageY};
  _$jscoverage['/dd/draggable.js'].lineData[365]++;
  var customEvent = {
  drag: self, 
  gestureType: e.gestureType, 
  startPos: e.startPos, 
  deltaX: e.deltaX, 
  deltaY: e.deltaY, 
  pageX: e.pageX, 
  pageY: e.pageY};
  _$jscoverage['/dd/draggable.js'].lineData[375]++;
  var move = self._allowMove;
  _$jscoverage['/dd/draggable.js'].lineData[377]++;
  if (visit69_377_1(move)) {
    _$jscoverage['/dd/draggable.js'].lineData[378]++;
    var startNodePos = self.get('startNodePos');
    _$jscoverage['/dd/draggable.js'].lineData[379]++;
    var left = startNodePos.left + e.deltaX, top = startNodePos.top + e.deltaY;
    _$jscoverage['/dd/draggable.js'].lineData[381]++;
    customEvent.left = left;
    _$jscoverage['/dd/draggable.js'].lineData[382]++;
    customEvent.top = top;
    _$jscoverage['/dd/draggable.js'].lineData[383]++;
    self.setInternal('actualPos', {
  left: left, 
  top: top});
    _$jscoverage['/dd/draggable.js'].lineData[387]++;
    self.fire('dragalign', customEvent);
  }
  _$jscoverage['/dd/draggable.js'].lineData[390]++;
  var def = 1;
  _$jscoverage['/dd/draggable.js'].lineData[393]++;
  if (visit70_393_1(self.fire('drag', customEvent) === false)) {
    _$jscoverage['/dd/draggable.js'].lineData[394]++;
    def = 0;
  }
  _$jscoverage['/dd/draggable.js'].lineData[397]++;
  DDM.move(e, self);
  _$jscoverage['/dd/draggable.js'].lineData[401]++;
  if (visit71_401_1(self.get('preventDefaultOnMove'))) {
    _$jscoverage['/dd/draggable.js'].lineData[402]++;
    e.preventDefault();
  }
  _$jscoverage['/dd/draggable.js'].lineData[405]++;
  if (visit72_405_1(def && move)) {
    _$jscoverage['/dd/draggable.js'].lineData[407]++;
    self.get('node').offset(self.get('actualPos'));
  }
}, 
  stopDrag: function() {
  _$jscoverage['/dd/draggable.js'].functionData[19]++;
  _$jscoverage['/dd/draggable.js'].lineData[416]++;
  if (visit73_416_1(this._isValidDrag)) {
    _$jscoverage['/dd/draggable.js'].lineData[417]++;
    this._end();
  }
}, 
  _end: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[20]++;
  _$jscoverage['/dd/draggable.js'].lineData[422]++;
  e = visit74_422_1(e || {});
  _$jscoverage['/dd/draggable.js'].lineData[424]++;
  var self = this, activeDrop;
  _$jscoverage['/dd/draggable.js'].lineData[427]++;
  self._isValidDrag = 0;
  _$jscoverage['/dd/draggable.js'].lineData[430]++;
  self.get('node').removeClass(PREFIX_CLS + 'drag-over');
  _$jscoverage['/dd/draggable.js'].lineData[432]++;
  self.get('dragNode').removeClass(PREFIX_CLS + 'dragging');
  _$jscoverage['/dd/draggable.js'].lineData[434]++;
  if ((activeDrop = DDM.get('activeDrop'))) {
    _$jscoverage['/dd/draggable.js'].lineData[435]++;
    self.fire('dragdrophit', {
  drag: self, 
  drop: activeDrop});
  } else {
    _$jscoverage['/dd/draggable.js'].lineData[440]++;
    self.fire('dragdropmiss', {
  drag: self});
  }
  _$jscoverage['/dd/draggable.js'].lineData[445]++;
  DDM.end(e, self);
  _$jscoverage['/dd/draggable.js'].lineData[447]++;
  self.fire('dragend', {
  drag: self, 
  gestureType: e.gestureType, 
  startPos: e.startPos, 
  deltaX: e.deltaX, 
  deltaY: e.deltaY, 
  pageX: e.pageX, 
  pageY: e.pageY});
}, 
  _handleOut: function() {
  _$jscoverage['/dd/draggable.js'].functionData[21]++;
  _$jscoverage['/dd/draggable.js'].lineData[459]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[460]++;
  self.get('node').removeClass(PREFIX_CLS + 'drag-over');
  _$jscoverage['/dd/draggable.js'].lineData[463]++;
  self.fire('dragexit', {
  drag: self, 
  drop: DDM.get('activeDrop')});
}, 
  _handleEnter: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[22]++;
  _$jscoverage['/dd/draggable.js'].lineData[470]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[471]++;
  self.get('node').addClass(PREFIX_CLS + 'drag-over');
  _$jscoverage['/dd/draggable.js'].lineData[473]++;
  self.fire('dragenter', e);
}, 
  _handleOver: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[23]++;
  _$jscoverage['/dd/draggable.js'].lineData[477]++;
  this.fire('dragover', e);
}, 
  destructor: function() {
  _$jscoverage['/dd/draggable.js'].functionData[24]++;
  _$jscoverage['/dd/draggable.js'].lineData[486]++;
  this.stop();
}}, {
  name: 'Draggable', 
  ATTRS: {
  node: {
  setter: function(v) {
  _$jscoverage['/dd/draggable.js'].functionData[25]++;
  _$jscoverage['/dd/draggable.js'].lineData[509]++;
  if (visit75_509_1(!(v instanceof Node))) {
    _$jscoverage['/dd/draggable.js'].lineData[510]++;
    return $(v);
  }
  _$jscoverage['/dd/draggable.js'].lineData[512]++;
  return undefined;
}}, 
  dragNode: {}, 
  shim: {
  value: false}, 
  handlers: {
  value: [], 
  getter: function(vs) {
  _$jscoverage['/dd/draggable.js'].functionData[26]++;
  _$jscoverage['/dd/draggable.js'].lineData[555]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[556]++;
  if (visit76_556_1(!vs.length)) {
    _$jscoverage['/dd/draggable.js'].lineData[557]++;
    vs[0] = self.get('node');
  }
  _$jscoverage['/dd/draggable.js'].lineData[559]++;
  each(vs, function(v, i) {
  _$jscoverage['/dd/draggable.js'].functionData[27]++;
  _$jscoverage['/dd/draggable.js'].lineData[560]++;
  if (visit77_560_1(typeof v === 'function')) {
    _$jscoverage['/dd/draggable.js'].lineData[561]++;
    v = v.call(self);
  }
  _$jscoverage['/dd/draggable.js'].lineData[564]++;
  if (visit78_564_1(typeof v === 'string')) {
    _$jscoverage['/dd/draggable.js'].lineData[565]++;
    v = self.get('node').one(v);
  }
  _$jscoverage['/dd/draggable.js'].lineData[567]++;
  if (visit79_567_1(v.nodeType)) {
    _$jscoverage['/dd/draggable.js'].lineData[568]++;
    v = $(v);
  }
  _$jscoverage['/dd/draggable.js'].lineData[570]++;
  vs[i] = v;
});
  _$jscoverage['/dd/draggable.js'].lineData[572]++;
  self.setInternal('handlers', vs);
  _$jscoverage['/dd/draggable.js'].lineData[573]++;
  return vs;
}}, 
  activeHandler: {}, 
  mode: {
  value: 'point'}, 
  disabled: {
  value: false}, 
  move: {
  value: false}, 
  primaryButtonOnly: {
  value: true}, 
  halt: {
  value: true}, 
  groups: {
  value: true}, 
  startNodePos: {}, 
  actualPos: {}, 
  preventDefaultOnMove: {
  value: true}}, 
  inheritedStatics: {
  DropMode: {
  POINT: 'point', 
  INTERSECT: 'intersect', 
  STRICT: 'strict'}}});
  _$jscoverage['/dd/draggable.js'].lineData[734]++;
  var _ieSelectBack;
  _$jscoverage['/dd/draggable.js'].lineData[736]++;
  function fixIEMouseUp() {
    _$jscoverage['/dd/draggable.js'].functionData[28]++;
    _$jscoverage['/dd/draggable.js'].lineData[737]++;
    doc.body.onselectstart = _ieSelectBack;
    _$jscoverage['/dd/draggable.js'].lineData[740]++;
    if (visit80_740_1(doc.body.releaseCapture)) {
      _$jscoverage['/dd/draggable.js'].lineData[741]++;
      doc.body.releaseCapture();
    }
  }
  _$jscoverage['/dd/draggable.js'].lineData[746]++;
  function fixIEMouseDown() {
    _$jscoverage['/dd/draggable.js'].functionData[29]++;
    _$jscoverage['/dd/draggable.js'].lineData[747]++;
    _ieSelectBack = doc.body.onselectstart;
    _$jscoverage['/dd/draggable.js'].lineData[748]++;
    doc.body.onselectstart = fixIESelect;
    _$jscoverage['/dd/draggable.js'].lineData[751]++;
    if (visit81_751_1(doc.body.setCapture)) {
      _$jscoverage['/dd/draggable.js'].lineData[752]++;
      doc.body.setCapture();
    }
  }
  _$jscoverage['/dd/draggable.js'].lineData[762]++;
  function preventDefault(e) {
    _$jscoverage['/dd/draggable.js'].functionData[30]++;
    _$jscoverage['/dd/draggable.js'].lineData[763]++;
    e.preventDefault();
  }
  _$jscoverage['/dd/draggable.js'].lineData[769]++;
  function fixIESelect() {
    _$jscoverage['/dd/draggable.js'].functionData[31]++;
    _$jscoverage['/dd/draggable.js'].lineData[770]++;
    return false;
  }
  _$jscoverage['/dd/draggable.js'].lineData[773]++;
  function onGestureStart(e) {
    _$jscoverage['/dd/draggable.js'].functionData[32]++;
    _$jscoverage['/dd/draggable.js'].lineData[774]++;
    this._isValidDrag = 0;
    _$jscoverage['/dd/draggable.js'].lineData[775]++;
    this.onGestureStart(e);
  }
  _$jscoverage['/dd/draggable.js'].lineData[778]++;
  return Draggable;
});
