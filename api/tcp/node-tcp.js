"use strict"

var util = require('util');
var unirest = require('unirest');
var xml2js = require('xml2js')

module.exports = TCPConnected;

var RequestString = 'cmd=%s&data=%s&fmt=xml';
var GetStateString = ['<gwrcmds><gwrcmd><gcmd>RoomGetCarousel</gcmd><gdata><gip><version>1</version><token>1234567890</token><fields>name,control,power,product,class,realtype,status</fields></gip></gdata></gwrcmd></gwrcmds>'].join('\n');
var SceneGetListCommand = ['<gwrcmds><gwrcmd><gcmd>SceneGetList</gcmd><gdata><gip><version>1</version><token>1234567890</token><fields>bigicon,detail,imageurl</fields><islocal>1</islocal></gip></gdata></gwrcmd></gwrcmds>'].join('\n');
var RoomSendCommand = ['<gip><version>1</version><token>1234567890</token><rid>%s</rid><value>%s</value></gip>'].join('\n');
var RoomSendLevelCommand = ['<gip><version>1</version><token>1234567890</token><rid>%s</rid><value>%s</value><type>level</type></gip>'].join('\n');
var SceneRunCommand = ['<gip><version>1</version><token>1234567890</token><sid>%s</sid></gip>'].join('\n');

function TCPConnected(host) {
    var self = this;

    if (!host) {
        host = "lighting.local"
    }

    self._host = host;
    self.rooms = [];
    self.scenes = [];

    var payload = util.format(RequestString, 'GWRBatch', encodeURIComponent(GetStateString));

    self._request(payload, function (error, xml) {
        if (xml) {
            try {
                self.rooms = xml['gwrcmd']['gdata']['gip']['room'];
                if (typeof (self.rooms["rid"]) !== 'undefined') {
                    self.rooms = [self.rooms];
                }
								console.log('%d rooms found.', self.rooms.length);
            } catch (err) {
                var error = {
                    error: 'Unkown Error'
                }
            }
        }
    })

    var scenesData = util.format(RequestString, 'GWRBatch', encodeURIComponent(SceneGetListCommand));

    self._request(scenesData, function (error, xml) {
        if (xml) {
            try {
                self.scenes = xml['gwrcmd']['gdata']['gip']['scene'];
                if (typeof (self.scenes["sid"]) !== 'undefined') {
                    self.scenes = [self.scenes];
                }
								console.log('%d scenes found.', self.scenes.length);
            } catch (err) {
                console.log("SceneGetList error: " + err);
                var error = {
                    error: 'Unkown Error'
                }
            }
        }
    })

};

TCPConnected.prototype._request = function (payload, callback) {
  console.log("TCPConnected request with payload: " + payload);
    unirest
        .post('http://' + this._host + '/gwr/gop.php')
        .headers({
            'Content-Type': 'text/xml; charset="utf-8"',
            'Content-Length': payload.length
        })
        .send(payload)
        .end(function (result) {
            if (!result.ok) {
                console.log("# TCPConnected._request", "error", result.error)
                callback(result.error, null)
            } else if (result.body) {
                xml2js.parseString(result.body, function (error, result) {
                    callback(null, flatten(result.gwrcmds))
                });
            } else {
                console.log("# TCPConnected._request", "no body - unexpected")
                callback("no body", null)
            }
        });
}

/**
 *  This converts what xml-to-js makes to xml2js
 */
var flatten = function (o) {
    if (Array.isArray(o)) {
        if (o.length === 1) {
            return flatten(o[0])
        } else {
            var ns = []
            for (var oi in o) {
                ns.push(flatten(o[oi]))
            }
            return ns
        }
    } else if (typeof o === "object") {
        var nd = {}
        for (var nkey in o) {
            nd[nkey] = flatten(o[nkey])
        }
        return nd
    } else {
        return o
    }
}

/**
 *  This bridges
 */
TCPConnected.prototype.GetState = function (cb) {
    var self = this;

    var payload = util.format(RequestString, 'GWRBatch', encodeURIComponent(GetStateString));

    self._request(payload, function (error, xml) {
        if (xml) {
            try {
                self.rooms = xml['gwrcmd']['gdata']['gip']['room'];
                if (typeof (self.rooms["rid"]) !== 'undefined') {
                    self.rooms = [self.rooms];
                }
            } catch (err) {
                var error = {
                    error: 'Unkown Error'
                }
            }
        }

        cb(error || null, self.rooms);
    })
}

TCPConnected.prototype.GetRoomStateByName = function (name, cb) {
    var self = this;
    console.log("attempting to get room state by name: " + name);
    self.rooms.forEach(function (room) {
        if (room["name"] == name) {
            var state = 0;
            var i = 0;
            var sum = 0;
            var devices = room["device"];
            if (typeof (devices["did"]) !== 'undefined') {
                i = i + 1;
                if (devices["state"] != "0") {
                    state = 1;
                    sum = sum + parseInt(devices["level"]);
                }
            } else {
                devices.forEach(function (device) {
                    i = i + 1;
                    if (device["state"] != "0") {
                        state = 1;
                        sum = sum + parseInt(device["level"]);
                    }
                });

            }
            if (i == 0) {
                sum = 0;
                i = 1;
                state = 0;
            }
            var level = sum / i;
            cb(null, state, level);
        }
    });
}

TCPConnected.prototype.GetRIDByName = function (name) {
    var self = this;

    var rid = 0;
		var re = new RegExp( name, "i" );
    //console.log(self.rooms);
    self.rooms.forEach(function (room) {
        //console.log(room);
        if ( re.test(room["name"])) {
            rid = room["rid"];
        }
    });
    //console.log(rid);
    return rid;
}

TCPConnected.prototype.TurnOnRoomByName = function (name) {
    var self = this
    var rid = this.GetRIDByName(name);

    var RoomCommand = util.format(RoomSendCommand, rid, 1);
    var payload = util.format(RequestString, 'RoomSendCommand', encodeURIComponent(RoomCommand));

    self._request(payload, function (error, xml) {})
}

TCPConnected.prototype.TurnOffRoomByName = function (name, cb) {
    var self = this
        // console.log("Turn Off Room");
    var rid = this.GetRIDByName(name);

    var RoomCommand = util.format(RoomSendCommand, rid, 0);
    var payload = util.format(RequestString, 'RoomSendCommand', encodeURIComponent(RoomCommand));

    self._request(payload, function (error, xml) {
        if (xml) {
            _process_result(xml)
        }
    })
}

TCPConnected.prototype.SetRoomLevelByName = function (name, level, cb) {
    var self = this
    var rid = this.GetRIDByName(name);

    var RoomLevelCommand = util.format(RoomSendLevelCommand, rid, level);
    var payload = util.format(RequestString, 'RoomSendCommand', encodeURIComponent(RoomLevelCommand));

    self._request(payload, function (error, xml) {})
}

TCPConnected.prototype.GetSIDByName = function (name) {
    var self = this;

    var sid = 0;
		var re = new RegExp( name, "i" );
    self.scenes.forEach(function (scene) {
        //console.log(room);
        if (re.text(scene["name"])) {
            sid = scene["side"];
        }
    });
    console.log("GetSIDByName return: " + sid + " for name: " + name);
    return sid;
}

TCPConnected.prototype.SceneRunByName = function (name) {
    var self = this
    console.log("Run scene: " + name);
    var sid = this.GetSIDByName(name);
		this.SceneRunById(sid);
}

TCPConnected.prototype.SceneRunById = function (sceneId) {
    var self = this

    var SceneCommand = util.format(SceneRunCommand, sceneId);
    var payload = util.format(RequestString, 'SceneRun', encodeURIComponent(SceneCommand));

    self._request(payload, function (error, xml) {})
}
