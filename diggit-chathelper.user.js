// ==UserScript==
// @name        diggit-chathelper
// @namespace   https://github.com/jetbtc/diggit-chathelper
// @include     https://diggit.io/
// @version     0.0.3
// @grant       none
// ==/UserScript==

var jetstuff = window.jetstuff = jetstuff || {};

(function() {
    function ChatHelper() {
        this.init();
    }

    $.extend(ChatHelper.prototype, {
        userlist: {},
        init: function() {
            this.cleanup();

            this.loadUserlist();

            this.rebindChathandler();

            console.log("Chathelper initialized", this.userlist);
        },
        isIgnored: function(id) {
            return this.userlist.hasOwnProperty(id) ? this.userlist[id].ignored : false;
        },
        ignoreUser: function(id) {
            if(id !== 1 && !this.isIgnored(id)) {

                this.trackUser(id);

                this.userlist[id].ignored = true;

                this.saveUserlist();

                return true;
            }
            return false;
        },
        unignoreUser: function(id) {
            this.trackUser(id);

            if(this.userlist.hasOwnProperty(id)) {
                this.userlist[id].ignored = false;
                return true;
            }
            return false;
        },
        trackUser: function(id, name) {
            var users = this.userlist,
                length;

            if(!id) {
                return false;
            } else if(!users.hasOwnProperty(id)) {
                users[id] = {
                    ignored: false,
                    names: name ? [name] : []
                }
                this.saveUserlist();
            } else if(name) {
                lastIndex = users[id].names.length - 1;
                if(lastIndex === -1 || users[id].names[lastIndex] !== name) {
                    users[id].names.push(name);
                    this.saveUserlist();
                }
            }
        },
        loadUserlist: function() {
            var data = localStorage.getItem('jetstuff.chathelper.userlist');

            if(data) {
                this.userlist = JSON.parse(data);
            }
        },
        saveUserlist: function() {
            localStorage.setItem('jetstuff.chathelper.userlist', JSON.stringify(this.userlist));
        },
        rebindChathandler: function() {
            socketio.off("new_chatmsg");
            socketio.on("new_chatmsg", this.chatHandler.bind(this));
        },
        chatHandler: function(data) {
            // This function is an extended version of the diggit.io source.
            var id = data["userid"],
                name = data["username"],
                msg = data["msg"],
                altNames = "";
                ignored = false,
                messageHead = "";
                messageBody = "";

            if(id) {
                this.trackUser(id, name);
                altNames = this.userlist[id].names.length > 1 ? "Previous names: " + this.userlist[id].names.slice(0,-1).join(', ') : "";
            }

            if (!msg) {
                return;
            }

            // User ignored?
            if(id && !data["admin"] && this.isIgnored(id)) {
                ignored = true;
            }

            var date = convertToLocalTime(new Date(data["date"]));
            var hour = date.getHours();
            var minute = date.getMinutes();
            var doScroll = true;
            if ($("#chatbox").scrollTop() + $("#chatbox").innerHeight() + 100 < $("#chatbox").get(0).scrollHeight) {
                doScroll = false;
            }
            msg = msg.split(" ");
            for (var i = 0; i < msg.length; i++) {
                var firsttwo = msg[i].substring(0, 2);
                if (firsttwo == "G:" || firsttwo == "g:" || firsttwo == "B:" || firsttwo == "b:") {
                    var split = msg[i].split(":");
                    if (split.length > 0 && !isNaN(split[1])) {
                        if (split[1].length <= 0 && split[1].length > 11 || split[1] < 0) {} else {
                            msg[i] = '<span style="color:lightgreen" class="gameid" data-gameid="' + split[1] + '">G:' + split[1] + '</span>';
                        }
                    }
                } else if (firsttwo == "U:" || firsttwo == "u:") {
                    var split = msg[i].split(":");
                    if (split.length > 0) {
                        if (split[1].length <= 0 && split[1].length > 16 || split[1] < 0) {} else {
                            if (isNaN(split[1])) {
                                msg[i] = '<span style="color:lightgreen" class="puser" data-username="' + split[1] + '">U:' + split[1] + '</span>';
                            } else {
                                msg[i] = '<span style="color:lightgreen" class="puser" data-userid="' + split[1] + '">U:' + split[1] + '</span>';
                            }
                        }
                    }
                } else if (msg[i].length >= 26 && msg[i].length <= 34 && (msg[i].substring(0, 1) == "1" || msg[i].substring(0, 1) == "3")) {
                    msg[i] = '<span style="color:lightgreen" class="hoverlink" onclick="window.open(\'https://blockchain.info/address/' + msg[i] + '\', \'_blank\');">' + msg[i] + '</span>';
                } else if (!id && msg[i] == "%BTC") {
                    msg[i] = tobtc(data["amount"]);
                } else if (isURL(msg[i])) {
                    msg[i] = '<span style="color:lightgreen" class="hoverlink" onclick="openURL(\'' + msg[i] + '\');">' + msg[i] + '</span>';
                }
            }
            msg = msg.join(" ");

            messageHead = '<div class="chatuser"><span class="chatusertext ' + ((id) ? 'updateableusername puser' : '') + '" '+(ignored ? 'style="color:#b57a5a"' : '')+' data-userid="' + id + '">' + name + '</span> ' + (data["admin"] ? ' <span class="chatuseradmin">(staff)</span>' : "") + '<span class="activeText" data-userid="' + id + '"></span>' + '<span class="jetstuff-userid" style="font-size: 11px; margin-left: 4px; opacity: 0.5;cursor:'+(altNames ? 'pointer' : 'default')+';" title="'+altNames+'">'+(id || "")+'</span>' + '</div><div class="chattime">' + ("0" + hour).slice(-2) + ':' + ("0" + minute).slice(-2) + '</div>';
            
            if(ignored) {
                messageBody = '<div style="clear:both"></div>';
            } else {
                messageBody = '<div class="chatmsg ' + (data["userid"] == myuser.getID() ? "chatmsgme" : "") + (!data["userid"] ? "chatmsgbot" : "") + (data["admin"] ? " chatmsgadmin" : "") + '">' + msg + '</div>';
            }
            

            $("#chatbox").append('<div class="chatmsgcontainer'+  (ignored ? ' jetstuff-ignoredUser' : '') +'">' + messageHead + messageBody + '</div>');
            $("#chatbox").stop();
            if (!document.hasFocus()) {
                chatmsgsblur++;
                document.title = '(' + chatmsgsblur + ') ' + title;
            }
            update_chatPreview();
            if (doScroll) {
                $("#chatbox").animate({
                    "scrollTop": $('#chatbox')[0].scrollHeight
                }, "slow");
            }
        },
        cleanup: function() {
            // Upgrade storage to latest version
            var ignoredUsers = localStorage.getItem('jetstuff.chathelper.ignoredusers'),
                id;

            if(ignoredUsers) {
                ignoredUsers = JSON.parse(ignoredUsers);
                for(var i = 0; i < ignoredUsers.length; i++) {
                    id = ignoredUsers[i];
                    this.userlist[id] = {
                        names: [],
                        ignored: true
                    }
                }
                this.saveUserlist();
                localStorage.removeItem('jetstuff.chathelper.ignoredusers');
            }
        }
    });

    jetstuff.chatHelper = new ChatHelper();
})();
