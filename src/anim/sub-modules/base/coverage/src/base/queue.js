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
if (! _$jscoverage['/base/queue.js']) {
  _$jscoverage['/base/queue.js'] = {};
  _$jscoverage['/base/queue.js'].lineData = [];
  _$jscoverage['/base/queue.js'].lineData[5] = 0;
  _$jscoverage['/base/queue.js'].lineData[7] = 0;
  _$jscoverage['/base/queue.js'].lineData[13] = 0;
  _$jscoverage['/base/queue.js'].lineData[14] = 0;
  _$jscoverage['/base/queue.js'].lineData[16] = 0;
  _$jscoverage['/base/queue.js'].lineData[19] = 0;
  _$jscoverage['/base/queue.js'].lineData[20] = 0;
  _$jscoverage['/base/queue.js'].lineData[23] = 0;
  _$jscoverage['/base/queue.js'].lineData[24] = 0;
  _$jscoverage['/base/queue.js'].lineData[25] = 0;
  _$jscoverage['/base/queue.js'].lineData[26] = 0;
  _$jscoverage['/base/queue.js'].lineData[30] = 0;
  _$jscoverage['/base/queue.js'].lineData[33] = 0;
  _$jscoverage['/base/queue.js'].lineData[38] = 0;
  _$jscoverage['/base/queue.js'].lineData[39] = 0;
  _$jscoverage['/base/queue.js'].lineData[40] = 0;
  _$jscoverage['/base/queue.js'].lineData[44] = 0;
  _$jscoverage['/base/queue.js'].lineData[46] = 0;
  _$jscoverage['/base/queue.js'].lineData[47] = 0;
  _$jscoverage['/base/queue.js'].lineData[48] = 0;
  _$jscoverage['/base/queue.js'].lineData[49] = 0;
  _$jscoverage['/base/queue.js'].lineData[52] = 0;
  _$jscoverage['/base/queue.js'].lineData[54] = 0;
  _$jscoverage['/base/queue.js'].lineData[56] = 0;
  _$jscoverage['/base/queue.js'].lineData[60] = 0;
  _$jscoverage['/base/queue.js'].lineData[64] = 0;
  _$jscoverage['/base/queue.js'].lineData[65] = 0;
  _$jscoverage['/base/queue.js'].lineData[66] = 0;
  _$jscoverage['/base/queue.js'].lineData[67] = 0;
  _$jscoverage['/base/queue.js'].lineData[69] = 0;
  _$jscoverage['/base/queue.js'].lineData[70] = 0;
  _$jscoverage['/base/queue.js'].lineData[75] = 0;
  _$jscoverage['/base/queue.js'].lineData[76] = 0;
  _$jscoverage['/base/queue.js'].lineData[77] = 0;
  _$jscoverage['/base/queue.js'].lineData[78] = 0;
  _$jscoverage['/base/queue.js'].lineData[80] = 0;
  _$jscoverage['/base/queue.js'].lineData[83] = 0;
}
if (! _$jscoverage['/base/queue.js'].functionData) {
  _$jscoverage['/base/queue.js'].functionData = [];
  _$jscoverage['/base/queue.js'].functionData[0] = 0;
  _$jscoverage['/base/queue.js'].functionData[1] = 0;
  _$jscoverage['/base/queue.js'].functionData[2] = 0;
  _$jscoverage['/base/queue.js'].functionData[3] = 0;
  _$jscoverage['/base/queue.js'].functionData[4] = 0;
  _$jscoverage['/base/queue.js'].functionData[5] = 0;
  _$jscoverage['/base/queue.js'].functionData[6] = 0;
}
if (! _$jscoverage['/base/queue.js'].branchData) {
  _$jscoverage['/base/queue.js'].branchData = {};
  _$jscoverage['/base/queue.js'].branchData['14'] = [];
  _$jscoverage['/base/queue.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/base/queue.js'].branchData['19'] = [];
  _$jscoverage['/base/queue.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/base/queue.js'].branchData['23'] = [];
  _$jscoverage['/base/queue.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/base/queue.js'].branchData['25'] = [];
  _$jscoverage['/base/queue.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/base/queue.js'].branchData['46'] = [];
  _$jscoverage['/base/queue.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/base/queue.js'].branchData['48'] = [];
  _$jscoverage['/base/queue.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/base/queue.js'].branchData['52'] = [];
  _$jscoverage['/base/queue.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/base/queue.js'].branchData['64'] = [];
  _$jscoverage['/base/queue.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/base/queue.js'].branchData['66'] = [];
  _$jscoverage['/base/queue.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/base/queue.js'].branchData['69'] = [];
  _$jscoverage['/base/queue.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/base/queue.js'].branchData['76'] = [];
  _$jscoverage['/base/queue.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/base/queue.js'].branchData['78'] = [];
  _$jscoverage['/base/queue.js'].branchData['78'][1] = new BranchData();
}
_$jscoverage['/base/queue.js'].branchData['78'][1].init(51, 10, '!qu.length');
function visit12_78_1(result) {
  _$jscoverage['/base/queue.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/queue.js'].branchData['76'][1].init(66, 2, 'qu');
function visit11_76_1(result) {
  _$jscoverage['/base/queue.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/queue.js'].branchData['69'][1].init(219, 29, 'S.isEmptyObject(quCollection)');
function visit10_69_1(result) {
  _$jscoverage['/base/queue.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/queue.js'].branchData['66'][1].init(126, 12, 'quCollection');
function visit9_66_1(result) {
  _$jscoverage['/base/queue.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/queue.js'].branchData['64'][1].init(22, 17, 'queue || queueKey');
function visit8_64_1(result) {
  _$jscoverage['/base/queue.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/queue.js'].branchData['52'][1].init(270, 16, 'qu && !qu.length');
function visit7_52_1(result) {
  _$jscoverage['/base/queue.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/queue.js'].branchData['48'][1].init(68, 10, 'index > -1');
function visit6_48_1(result) {
  _$jscoverage['/base/queue.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/queue.js'].branchData['46'][1].init(90, 2, 'qu');
function visit5_46_1(result) {
  _$jscoverage['/base/queue.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/queue.js'].branchData['25'][1].init(56, 16, '!qu && !readOnly');
function visit4_25_1(result) {
  _$jscoverage['/base/queue.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/queue.js'].branchData['23'][1].init(257, 12, 'quCollection');
function visit3_23_1(result) {
  _$jscoverage['/base/queue.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/queue.js'].branchData['19'][1].init(133, 26, '!quCollection && !readOnly');
function visit2_19_1(result) {
  _$jscoverage['/base/queue.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/queue.js'].branchData['14'][1].init(17, 16, 'name || queueKey');
function visit1_14_1(result) {
  _$jscoverage['/base/queue.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/queue.js'].lineData[5]++;
KISSY.add('anim/base/queue', function(S, Dom) {
  _$jscoverage['/base/queue.js'].functionData[0]++;
  _$jscoverage['/base/queue.js'].lineData[7]++;
  var queueCollectionKey = S.guid('ks-queue-' + S.now() + '-'), queueKey = S.guid('ks-queue-' + S.now() + '-'), Q;
  _$jscoverage['/base/queue.js'].lineData[13]++;
  function getQueue(node, name, readOnly) {
    _$jscoverage['/base/queue.js'].functionData[1]++;
    _$jscoverage['/base/queue.js'].lineData[14]++;
    name = visit1_14_1(name || queueKey);
    _$jscoverage['/base/queue.js'].lineData[16]++;
    var qu, quCollection = Dom.data(node, queueCollectionKey);
    _$jscoverage['/base/queue.js'].lineData[19]++;
    if (visit2_19_1(!quCollection && !readOnly)) {
      _$jscoverage['/base/queue.js'].lineData[20]++;
      Dom.data(node, queueCollectionKey, quCollection = {});
    }
    _$jscoverage['/base/queue.js'].lineData[23]++;
    if (visit3_23_1(quCollection)) {
      _$jscoverage['/base/queue.js'].lineData[24]++;
      qu = quCollection[name];
      _$jscoverage['/base/queue.js'].lineData[25]++;
      if (visit4_25_1(!qu && !readOnly)) {
        _$jscoverage['/base/queue.js'].lineData[26]++;
        qu = quCollection[name] = [];
      }
    }
    _$jscoverage['/base/queue.js'].lineData[30]++;
    return qu;
  }
  _$jscoverage['/base/queue.js'].lineData[33]++;
  return Q = {
  queueCollectionKey: queueCollectionKey, 
  queue: function(node, queue, item) {
  _$jscoverage['/base/queue.js'].functionData[2]++;
  _$jscoverage['/base/queue.js'].lineData[38]++;
  var qu = getQueue(node, queue);
  _$jscoverage['/base/queue.js'].lineData[39]++;
  qu.push(item);
  _$jscoverage['/base/queue.js'].lineData[40]++;
  return qu;
}, 
  remove: function(node, queue, item) {
  _$jscoverage['/base/queue.js'].functionData[3]++;
  _$jscoverage['/base/queue.js'].lineData[44]++;
  var qu = getQueue(node, queue, 1), index;
  _$jscoverage['/base/queue.js'].lineData[46]++;
  if (visit5_46_1(qu)) {
    _$jscoverage['/base/queue.js'].lineData[47]++;
    index = S.indexOf(item, qu);
    _$jscoverage['/base/queue.js'].lineData[48]++;
    if (visit6_48_1(index > -1)) {
      _$jscoverage['/base/queue.js'].lineData[49]++;
      qu.splice(index, 1);
    }
  }
  _$jscoverage['/base/queue.js'].lineData[52]++;
  if (visit7_52_1(qu && !qu.length)) {
    _$jscoverage['/base/queue.js'].lineData[54]++;
    Q.clearQueue(node, queue);
  }
  _$jscoverage['/base/queue.js'].lineData[56]++;
  return qu;
}, 
  'clearQueues': function(node) {
  _$jscoverage['/base/queue.js'].functionData[4]++;
  _$jscoverage['/base/queue.js'].lineData[60]++;
  Dom.removeData(node, queueCollectionKey);
}, 
  clearQueue: function clearQueue(node, queue) {
  _$jscoverage['/base/queue.js'].functionData[5]++;
  _$jscoverage['/base/queue.js'].lineData[64]++;
  queue = visit8_64_1(queue || queueKey);
  _$jscoverage['/base/queue.js'].lineData[65]++;
  var quCollection = Dom.data(node, queueCollectionKey);
  _$jscoverage['/base/queue.js'].lineData[66]++;
  if (visit9_66_1(quCollection)) {
    _$jscoverage['/base/queue.js'].lineData[67]++;
    delete quCollection[queue];
  }
  _$jscoverage['/base/queue.js'].lineData[69]++;
  if (visit10_69_1(S.isEmptyObject(quCollection))) {
    _$jscoverage['/base/queue.js'].lineData[70]++;
    Dom.removeData(node, queueCollectionKey);
  }
}, 
  dequeue: function(node, queue) {
  _$jscoverage['/base/queue.js'].functionData[6]++;
  _$jscoverage['/base/queue.js'].lineData[75]++;
  var qu = getQueue(node, queue, 1);
  _$jscoverage['/base/queue.js'].lineData[76]++;
  if (visit11_76_1(qu)) {
    _$jscoverage['/base/queue.js'].lineData[77]++;
    qu.shift();
    _$jscoverage['/base/queue.js'].lineData[78]++;
    if (visit12_78_1(!qu.length)) {
      _$jscoverage['/base/queue.js'].lineData[80]++;
      Q.clearQueue(node, queue);
    }
  }
  _$jscoverage['/base/queue.js'].lineData[83]++;
  return qu;
}};
}, {
  requires: ['dom']});
