// ==UserScript==
// @name        diggit-chathelper
// @namespace   https://github.com/jetbtc/diggit-chathelper
// @include     https://diggit.io/
// @version     0.0.2
// @grant       none
// ==/UserScript==

var jetstuff = window.jetstuff = jetstuff || {};

(function() {
    function ChatHelper() {
        this.init();
    }

    $.extend(ChatHelper.prototype, {
        ignoredUsers: [],
        init: function() {
            this.loadIgnoredUsers();

            this.rebindChathandler();

            console.log("Chathelper initialized", this.ignoredUsers);
        },
        isIgnored: function(id) {
            return this.ignoredUsers.indexOf(id) !== -1;
        },
        ignoreUser: function(id) {
            if(!this.isIgnored(id)) {
                this.ignoredUsers.push(id);
                this.saveIgnoredUsers();
            }
        },
        unignoreUser: function(id) {
            var index = this.ignoredUsers.indexOf(id);

            if(index !== -1) {
                this.ignoredUsers.splice(index, 1);
                this.saveIgnoredUsers();
            }
        },
        loadIgnoredUsers: function() {
            var data = localStorage.getItem('jetstuff.chathelper.ignoredusers');

            if(data) {
                this.ignoredUsers = JSON.parse(data);
            }
        },
        saveIgnoredUsers: function() {
            localStorage.setItem('jetstuff.chathelper.ignoredusers', JSON.stringify(this.ignoredUsers));
        },
        rebindChathandler: function() {
            socketio.off("new_chatmsg");
            socketio.on("new_chatmsg", this.chatHandler.bind(this));
        },
        chatHandler: function(data) {
            // This function is an extended version of the diggit.io source.
            var id = data["userid"];
            var name = data["username"];
            var msg = data["msg"];
            if (!msg) {
                return;
            }

            // User ignored?
            if(this.isIgnored(id)) {
                return;
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
            $("#chatbox").append('' + '<div class="chatmsgcontainer">' + '    <div class="chatuser"><span class="chatusertext ' + ((id) ? 'updateableusername puser' : '') + '" data-userid="' + id + '">' + name + '</span> ' + (data["admin"] ? ' <span class="chatuseradmin">(staff)</span>' : "") + '<span class="activeText" data-userid="' + id + '"></span>' + '</div>' + '    <div class="chattime">' + ("0" + hour).slice(-2) + ':' + ("0" + minute).slice(-2) + '</div>' + '    <div class="chatmsg ' + (data["userid"] == myuser.getID() ? "chatmsgme" : "") + (!data["userid"] ? "chatmsgbot" : "") + (data["admin"] ? " chatmsgadmin" : "") + '">' + msg + '</div>' + '</div>');
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
        }
    });

    jetstuff.chatHelper = new ChatHelper();
})();
