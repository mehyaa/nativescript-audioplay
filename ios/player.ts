"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils = require("tns-core-modules/utils/utils");
var types_1 = require("tns-core-modules/utils/types");
var file_system_1 = require("tns-core-modules/file-system");
var common_1 = require("../common");
var TNSPlayer = (function (_super) {
    __extends(TNSPlayer, _super);
    function TNSPlayer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(TNSPlayer.prototype, "ios", {
        get: function () {
            return this._player;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TNSPlayer.prototype, "debug", {
        set: function (value) {
            common_1.TNSPlayerUtil.debug = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TNSPlayer.prototype, "volume", {
        get: function () {
            return this._player ? this._player.volume : 0;
        },
        set: function (value) {
            if (this._player) {
                this._player.volume = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TNSPlayer.prototype, "duration", {
        get: function () {
            if (this._player) {
                return this._player.currentItem.asset.duration;
                // return this._player.duration;
            }
            else {
                return 0;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TNSPlayer.prototype, "currentTime", {
        get: function () {

            return this._player ? ((this._player.currentTime().value / this._player.currentTime().timescale) ) : 0;
            // return this._player ? this._player.currentTime : 0;
        },
        enumerable: true,
        configurable: true
    });
    TNSPlayer.prototype.initFromFile = function (options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            options.autoPlay = false;
            _this.playFromFile(options).then(resolve, reject);
        });
    };
    TNSPlayer.prototype.playFromFile = function (options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (options.autoPlay !== false) {
                options.autoPlay = true;
            }
            try {
                var audioPath = void 0;
                var fileName = types_1.isString(options.audioFile) ? options.audioFile.trim() : '';
                if (fileName.indexOf('~/') === 0) {
                    fileName = file_system_1.path.join(file_system_1.knownFolders.currentApp().path, fileName.replace('~/', ''));
                }
                common_1.TNS_Player_Log('fileName', fileName);
                _this._completeCallback = options.completeCallback;
                _this._errorCallback = options.errorCallback;
                _this._infoCallback = options.infoCallback;
                var audioSession = AVAudioSession.sharedInstance();
                var output = audioSession.currentRoute.outputs.lastObject.portType;
                common_1.TNS_Player_Log('output', output);
                if (output.match(/Receiver/)) {
                    try {
                        // audioSession.setCategoryError(AVAudioSessionCategoryPlayAndRecord);
                        audioSession.setCategoryError(AVAudioSessionCategoryPlayback);
                        
                        audioSession.overrideOutputAudioPortError(1936747378);
                        audioSession.setActiveError(true);
                        audioSession.setActive(true);
                        common_1.TNS_Player_Log('audioSession category set and active');
                    }
                    catch (err) {
                        common_1.TNS_Player_Log('setting audioSession category failed');
                    }
                }
                var errorRef = new interop.Reference();
                // _this._player = AVAudioPlayer.alloc().initWithContentsOfURLError(NSURL.fileURLWithPath(fileName), errorRef);
                _this._player = AVPlayer.alloc().initWithURL(options.audioFile,options);

                if (errorRef && errorRef.value) {
                    reject(errorRef.value);
                    return;
                }
                else if (_this._player) {
                    _this._player.delegate = _this;
                    _this._player.enableRate = true;
                    common_1.TNS_Player_Log('this._player', _this._player);
                    if (options.metering) {
                        common_1.TNS_Player_Log('enabling metering...');
                        _this._player.meteringEnabled = true;
                    }
                    if (options.loop) {
                        _this._player.numberOfLoops = -1;
                    }
                    if (options.autoPlay) {
                        _this._player.play();
                    }
                    resolve();
                }
                else {
                    reject();
                }
            }
            catch (ex) {
                if (_this._errorCallback) {
                    _this._errorCallback({ ex: ex });
                }
                reject(ex);
            }
        });
    };
    TNSPlayer.prototype.initFromUrl = function (options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            options.autoPlay = false;
            _this.playFromUrl(options).then(resolve, reject);
        });
    };
    TNSPlayer.prototype.playFromUrl = function (options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (options.autoPlay !== false) {
                options.autoPlay = true;
            }
            try {
                var sharedSession = utils.ios.getter(NSURLSession, NSURLSession.sharedSession);
                _this._task = sharedSession.dataTaskWithURLCompletionHandler(NSURL.URLWithString(options.audioFile), function (data, response, error) {
                    if (error !== null) {
                        if (_this._errorCallback) {
                            _this._errorCallback({ error: error });
                        }
                        reject();
                    }
                    _this._completeCallback = options.completeCallback;
                    _this._errorCallback = options.errorCallback;
                    _this._infoCallback = options.infoCallback;
                    var audioSession = AVAudioSession.sharedInstance();
                    var output = audioSession.currentRoute.outputs.lastObject.portType;
                    if (output.match(/Receiver/)) {
                        try {
                            // audioSession.setCategoryError(AVAudioSessionCategoryPlayAndRecord);
                            audioSession.setCategoryError(AVAudioSessionCategoryPlayback);
                            audioSession.overrideOutputAudioPortError(1936747378);
                            audioSession.setActiveError(true);
                            common_1.TNS_Player_Log('audioSession category set and active');
                        }
                        catch (err) {
                            common_1.TNS_Player_Log('setting audioSession category failed');
                        }
                    }
                    var errorRef = new interop.Reference();
                    
                    common_1.TNS_Player_Log(data);

                    // _this._player = AVAudioPlayer.alloc().initWithDataError(data, errorRef);
                    _this._player = AVPlayer.alloc().initWithURL(NSURL.URLWithString(options.audioFile));
                    
                    if (errorRef && errorRef.value) {
                        reject(errorRef.value);
                        return;
                    }
                    else if (_this._player) {
                        _this._player.delegate = _this;
                        common_1.TNS_Player_Log('this._player', _this._player);
                        _this._player.enableRate = true;
                        _this._player.numberOfLoops = options.loop ? -1 : 0;
                        if (options.metering) {
                            common_1.TNS_Player_Log('enabling metering...');
                            _this._player.meteringEnabled = true;
                        }
                        if (options.autoPlay) {
                            _this._player.play();
                        }
                        resolve();
                    }
                    else {
                        reject();
                    }
                });
                _this._task.resume();
            }
            catch (ex) {
                if (_this._errorCallback) {
                    _this._errorCallback({ ex: ex });
                }
                reject(ex);
            }
        });
    };
    TNSPlayer.prototype.pause = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                // if (_this._player && _this._player.playing) {
                if (_this._player ) {
                    common_1.TNS_Player_Log('pausing player...');
                    _this._player.pause();
                    resolve(true);
                }
            }
            catch (ex) {
                if (_this._errorCallback) {
                    _this._errorCallback({ ex: ex });
                }
                common_1.TNS_Player_Log('pause error', ex);
                reject(ex);
            }
        });
    };
    TNSPlayer.prototype.play = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                if (!_this.isAudioPlaying()) {
                    common_1.TNS_Player_Log('player play...');
                    _this._player.play();
                    resolve(true);
                }
            }
            catch (ex) {
                if (_this._errorCallback) {
                    _this._errorCallback({ ex: ex });
                }
                common_1.TNS_Player_Log('play error', ex);
                reject(ex);
            }
        });
    };
    TNSPlayer.prototype.resume = function () {
        if (this._player) {
            common_1.TNS_Player_Log('resuming player...');
            this._player.play();
        }
    };
    TNSPlayer.prototype.playAtTime = function (time) {
        if (this._player) {
            common_1.TNS_Player_Log('playAtTime', time);
            this._player.playAtTime(time);
        }
    };
    TNSPlayer.prototype.seekTo = function (time) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                if (_this._player) {
                    common_1.TNS_Player_Log('seekTo', time);
                    _this._player.currentTime = time;
                    resolve(true);
                }
            }
            catch (ex) {
                common_1.TNS_Player_Log('seekTo error', ex);
                reject(ex);
            }
        });
    };
    TNSPlayer.prototype.dispose = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                common_1.TNS_Player_Log('disposing TNSPlayer...');
                if (_this._player && _this.isAudioPlaying()) {
                    _this._player.stop();
                }
                _this._reset();
                resolve();
            }
            catch (ex) {
                if (_this._errorCallback) {
                    _this._errorCallback({ ex: ex });
                }
                common_1.TNS_Player_Log('dispose error', ex);
                reject(ex);
            }
        });
    };
    TNSPlayer.prototype.isAudioPlaying = function () {
        // return (this._player.rate != 0 && this._player.error == nil);
        return this._player ? (this._player.rate != 0) : false;
    };
    TNSPlayer.prototype.getAudioTrackDuration = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                // var duration = _this._player ? _this._player.duration : 0;
                var duration = _this._player ? (CMTimeGetSeconds(_this._player.currentItem.asset.duration)) : 0;
                common_1.TNS_Player_Log('audio track duration', duration);
                if(duration.toString()=="NaN"){ duration = 0; }
                resolve(duration.toString());
            }
            catch (ex) {
                if (_this._errorCallback) {
                    _this._errorCallback({ ex: ex });
                }
                common_1.TNS_Player_Log('getAudioTrackDuration error', ex);
                reject(ex);
            }
        });
    };
    TNSPlayer.prototype.changePlayerSpeed = function (speed) {
        if (this._player && speed) {
            if (typeof speed === 'string') {
                speed = parseFloat(speed);
            }
            this._player.rate = speed;
        }
    };
    TNSPlayer.prototype.audioPlayerDidFinishPlayingSuccessfully = function (player, flag) {
        if (flag && this._completeCallback) {
            this._completeCallback({ player: player, flag: flag });
        }
        else if (!flag && this._errorCallback) {
            this._errorCallback({ player: player, flag: flag });
        }
    };
    TNSPlayer.prototype.audioPlayerDecodeErrorDidOccurError = function (player, error) {
        if (this._errorCallback) {
            this._errorCallback({ player: player, error: error });
        }
    };
    TNSPlayer.prototype._reset = function () {
        if (this._player) {
            this._player = undefined;
        }
        if (this._task) {
            this._task.cancel();
            this._task = undefined;
        }
    };
    TNSPlayer.ObjCProtocols = [AVAudioPlayerDelegate];
    return TNSPlayer;
}(NSObject));
exports.TNSPlayer = TNSPlayer;
