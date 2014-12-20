// ==UserScript==
// @name        diggit-chathelper
// @namespace   https://github.com/jetbtc/diggit-chathelper
// @include     https://diggit.io/
// @version     {{version}}
// @grant       none
// ==/UserScript==

var jetstuff = window.jetstuff = jetstuff || {};
(function() {
    var demoObj = document.createElement('a'),
        style = $('<style>').append('{{styles}}').appendTo(document.head),
        helptext = 'Chathelper Help <dl class="jetstuff-help">'
                + '<dt>!help</dt> <dd>Get this message</dd>'
                + '<dt>!version</dt> <dd>Check the current version number. Compare with the one on the github page</dd>'
                + '<dt>!ignore</dt> <dd>Get a list of ignored users</dd>'
                + '<dt>!ignore on/off</dt> <dd>toggle ignoring on/off</dd>'
                + '<dt>!ignore [id]</dt> <dd>Ignore users. Their names will be orange and the message will be hidden by default. You can hover over the names to show the message.</dd>'
                + '<dt>!drop</dt> <dd>get a list of dropped users</dd>'
                + '<dt>!drop on/off</dt> <dd>toggle dropping of messages on/off</dd>'
                + '<dt>!drop [id]</dt> <dd>For the annoying spammers, you have this gem. Completely drop their messages from the chat!</dd>'
                + '<dt>!unignore [id]</dt> <dd>Undo !ignore and !drop</dd>'
                + '<dt>!undrop [id]</dt> <dd>Alias of !unignore</dd>'
            + '</dl><div class="jetstuff-credits">More info on <a href="https://github.com/jetbtc/diggit-chathelper" target="_blank">github</a><br> Created by jet (#1761)</div>';

    function ChatHelper() {
        this.init();
    }

    $.extend(ChatHelper.prototype, {
        version: '{{version}}',
        chatIgnore: true,
        chatDrop: true,
        unignorable: [0, 1],
        userlist: {},
        labels: {
            "default": {
                width: 3,
                color: '#31c471'
            }
        },
        commandRe: /^!(help|version|v|tip|ignore|drop|unignore|undrop|rain|rainyes)\s*(.*)?/,
        argsplitRe: /\s+/,
        init: function() {
            this.cleanup();

            this.loadUserlist();

            this.rebindChatsubmit();
            this.rebindChathandler();

            console.info("chathelper active");
        },
        isIgnored: function(id) {
            return this.userlist.hasOwnProperty(id) ? this.userlist[id].ignored : false;
        },
        isHardignored: function(id) {
            return this.userlist.hasOwnProperty(id) ? this.userlist[id].hardignored : false;
        },
        ignoreUser: function(id, hardignore) {
            var user = this.trackUser(id);

            if(user && this.unignorable.indexOf(id) === -1 && id != myuser.getID()) {

                this.unignoreUser(id);

                if(hardignore) {
                    user.hardignored = true;
                } else {
                    user.ignored = true;
                }

                this.saveUserlist();
                return true;
            }
            return false;
        },
        unignoreUser: function(id) {
            var user = this.trackUser(id);

            if(user) {
                user.hardignored = false;
                user.ignored = false;

                this.saveUserlist();
                return true;
            }
            return false;
        },
        setLabel: function(name, width, color) {
            name = name.replace(/[^a-z0-9\-]/gi, "");

            // Valid number between 1 and 6, default 3
            width = Math.min(6, Math.max(1, parseInt(width)||3));

            // Make sure the color is valid
            demoObj.style.color = "";
            demoObj.style.color = color;
            color = demoObj.style.color || '#31c471';

            this.labels[name] = {
                width: width,
                color: color
            };

            console.log(this.labels[name]);

            return name;
        },
        getLabel: function(name) {
            name = name.replace(/[^a-z0-9\-]/gi, "");

            return this.labels[name] || this.labels["default"];
        },
        deleteLabel: function(name, width, color) {
            name = name.replace(/[^a-z0-9\-]/gi, "");
            
            if(name !== "default" && this.labels[name]) {
                delete this.labels[name];
                return true;
            }
            return false;
        },
        loadLabels: function() {
            var data = localStorage.getItem('jetstuff.chathelper.labels');

            if(data) {
                this.labels = JSON.parse(data);
            }
        },
        saveLabels: function() {
            localStorage.setItem('jetstuff.chathelper.labels', JSON.stringify(this.labels));
        },
        labelUser: function(id, labelName) {
            var user = this.trackUser(id),
                labelName = labelName.replace(/[^a-z0-9\-]/gi, "");

            if(user && labelName) {
                user.label = labelName;
                this.saveUserlist();

                return true;
            }
            return false;
        },
        unlabelUser: function(id) {
            var user = this.trackUser(id);

            if(user && user.label) {
                delete user.label;
                this.saveUserlist();

                return true;
            }
            return false;
        },
        trackUser: function(id, name) {
            var user = null,
                users = this.userlist,
                length, lastIndex;

            if(!id) {
                return null;
            }

            if(users.hasOwnProperty(id)) {
                user = users[id];

                if(name) {
                    lastIndex = user.names.length - 1;
                    if(lastIndex === -1 || user.names[lastIndex] !== name) {
                        user.names.push(name);
                        this.saveUserlist();
                    }
                }
            } else {
                user = users[id] = {
                    ignored: false,
                    names: name ? [name] : []
                };
                this.saveUserlist();
            }
            return user;
        },
        getUsername: function(id) {
            var user = this.trackUser(id);

            if(user && user.names) {
                return user.names[user.names.length-1];
            }
            return null;
        },
        getIgnoredUsers: function(hardignore) {
            var users = this.userlist,
                ignoredUsers = [],
                user, k;

            for(k in this.userlist) {
                user = users[k];

                if( (!hardignore && user.ignored) || (hardignore && user.hardignored) ) {
                    ignoredUsers.push(+k);
                }
            }

            ignoredUsers.sort(function(a, b) {
                return b < a;
            });

            return ignoredUsers;
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
        rebindChatsubmit: function() {
            $('#chatform').off('submit').on('submit', this.chatSubmitHandler.bind(this));
        },
        rebindChathandler: function() {
            socketio.off("new_chatmsg");
            socketio.on("new_chatmsg", this.chatHandler.bind(this));
        },
        chatSubmitHandler: function(event) {
            var $chatform = $(this),
                $chattext = $("#chattext"),
                msg = $chattext.val();

            $chattext.val('');

            if(!this.commandHandler(msg)) {
                socketio.emit("chat", {
                    msg: msg
                });
            }
            
            return false;
        },
        cmdIgnore: function(args) {
            var id = args[0] ? args[0].replace(/[^0-9]/, '') : 0;

            if(typeof args[0] === "undefined") {
                this.listIgnoredUsers(false);
            } else if(args[0] === 'on') {
                this.showInfoMsg('Ignoring enabled. Use `!ignore off` to disable it again');
                this.chatIgnore = true;
            } else if(args[0] === 'off') {
                this.showInfoMsg('Ignoring disabled. Use `!ignore on` to enable it again');
                this.chatIgnore = false;
            } else if( this.ignoreUser(id) ) {
                var name = this.getUsername(id);

                if(name) {
                    this.showInfoMsg('Ignored '+name+' (#'+id+')');
                } else {
                    this.showInfoMsg('Ignored user #'+id);
                }
            } else {
                this.showInfoMsg('You can\'t ignore yourself or staffmembers.');
            }
        },
        cmdDrop: function(args) {
            var id = args[0] ? args[0].replace(/[^0-9]/, '') : 0;

            if(typeof args[0] === "undefined") {
                this.listIgnoredUsers(true);
            } else if(args[0] === 'on') {
                this.showInfoMsg('Dropping enabled. Use `!drop off` to disable it again');
                this.chatDrop = true;
            } else if(args[0] === 'off') {
                this.showInfoMsg('Dropping disabled. Use `!drop on` to enable it again');
                this.chatDrop = false;
            } else if( this.ignoreUser(id, 1) ) {
                var name = this.getUsername(id);

                if(name) {
                    this.showInfoMsg('Dropped '+name+' (#'+id+')');
                } else {
                    this.showInfoMsg('Dropped user #'+id);
                }
            } else {
                this.showInfoMsg('You can\'t ignore yourself or staffmembers.');
            }
        },
        cmdUnignore: function(args) {
            var id = args[0] ? args[0].replace(/[^0-9]/, '') : 0;
            if( this.unignoreUser(id) ) {
                var name = this.getUsername(id);

                if(name) {
                    this.showInfoMsg('Unignored '+name+' (#'+id+')');
                } else {
                    this.showInfoMsg('Unignored user #'+id);
                }
            } else {
                this.showInfoMsg('No id given');
            }
        },
        commandHandler: function(msg) {
            var match = msg.match(this.commandRe) || [],
                command = match[1] ? match[1] : null,
                args = match[2] ? match[2].split(this.argsplitReg) : [],
                id, html, name, ignoredUsers;

            if(!command) {
                return false;
            }

            switch(command) {
                case 'help':
                    this.showInfoMsg(helptext);
                    break;
                case 'ignore':
                    this.cmdIgnore(args);
                    break;
                case 'drop':
                    this.cmdDrop(args);
                    break;
                case 'unignore':
                case 'undrop':
                    this.cmdUnignore(args);
                    break;
                case 'version':
                case 'v':
                    this.showInfoMsg('chathelper v'+this.version);
                    break;
                default:
                    // Treat unrecognized commands as chat message
                    return false;
            }
            return true;
        },
        chatHandler: function(data) {
            // This function is an extended version of the diggit.io source.
            var $chatbox = $("#chatbox"),
                id = data["userid"],
                name = data["username"],
                msg = data["msg"],
                user = this.trackUser(id, name),
                altNames = "",
                ignored = false,
                idString;

            if(id) {
                altNames = user.names.length > 1 ? "Previous names: " + this.userlist[id].names.slice(0,-1).join(', ') : "";
            }

            idString = altNames
                        ? '<span class="jetstuff-userid jetstuff-hasalts" title="'+altNames+'">'+(id || "")+'</span>'
                        : '<span class="jetstuff-userid">'+(id || "")+'</span>';

            if (!msg) {
                return;
            }

            // User ignored?
            if(id && !data["admin"] && this.isIgnored(id) && this.chatIgnore) {
                ignored = true;
            }
            // Fuck that guy?
            if(id && !data["admin"] && this.isHardignored(id) && this.chatDrop) {
                return;
            }

            msg = msg.replace(/["']/g, "");
            msg = msg.replace(/'/g, '');

            var date = convertToLocalTime(new Date(data["date"])),
                hour = date.getHours(),
                minute = date.getMinutes(),
                doScroll = true;

            if($chatbox.scrollTop() + $chatbox.innerHeight() + 100 < $chatbox.get(0).scrollHeight) {
                doScroll = false;
            }
            msg = msg.split(" ");


            for(var i = 0; i < msg.length; i++) {
                msg[i] = msg[i].replace(/["']/g, '');
                var firsttwo = msg[i].substring(0, 2);
                if(firsttwo == "G:" || firsttwo == "g:" || firsttwo == "B:" || firsttwo == "b:") {
                    var split = msg[i].split(":");
                    if(split.length > 0 && !isNaN(split[1])) {
                        if(split[1].length <= 0 && split[1].length > 11 || split[1] < 0) {} else {
                            msg[i] = '<span style="color:lightgreen" class="gameid" data-gameid="' + split[1] + '">G:' + split[1] + '</span>';
                        }
                    }
                } else if(firsttwo == "U:" || firsttwo == "u:") {
                    var split = msg[i].split(":");
                    if(split.length > 0) {
                        if(split[1].length <= 0 || split[1].length > 12 || split[1] < 0) {} else {
                            if(isNaN(split[1])) {
                                msg[i] = '<span style="color:lightgreen" class="puser" data-username="' + split[1] + '">U:' + split[1] + '</span>';
                            } else {
                                msg[i] = '<span style="color:lightgreen" class="puser" data-userid="' + split[1] + '">U:' + split[1] + '</span>';
                            }
                        }
                    }
                } else if(msg[i].length >= 26 && msg[i].length <= 34 && (msg[i].substring(0, 1) == "1" || msg[i].substring(0, 1) == "3")) {
                    msg[i] = '<span style="color:lightgreen" class="hoverlink" onclick="window.open(\'https://blockchain.info/address/' + msg[i] + '\', \'_blank\');">' + msg[i] + '</span>';
                } else if(!id && msg[i] == "%BTC" && data["amount"]) {
                    msg[i] = tobtc(data["amount"]);
                } else if(!id && msg[i] == "%TROPHY" && data["trophy"]) {
                    var trophyid = data["trophy"]["id"];
                    var trophytier = data["trophy"]["tier"];
                    var trophyuserid = data["trophy"]["userid"];
                    var trophy = trophies[trophyid];
                    if(trophy) {
                        msg[i] = trophy.getIcon(trophytier, trophyuserid) + ' (<span style="color:' + trophy.getColor(trophytier) + '">' + trophy.getTierName(trophytier) + '</span> ' + trophy.getName() + ')';
                    }
                } else if(isURL(msg[i]) && msg[i].indexOf("'") === -1) {
                    lastUrlID++;
                    msg[i] = encodeURI(msg[i]);
                    msg[i] = '<span style="color:lightgreen" class="hoverlink" id="url' + lastUrlID + '" onclick="openURL(' + lastUrlID + ');">' + msg[i] + '</span>';
                }
            }
            msg = msg.join(" ");

            var trophyString = "";
            if(data["atrophy"]) {
                trophyString = '<span>' + trophies[data["atrophy"]["id"]].getIcon(data["atrophy"]["tier"], id) + '</span> ';
            }

            $chatbox.append('' + '<div class="chatmsgcontainer '+(ignored ? 'jetstuff-ignoreduser' : '')+'">' + '<div class="chatuser">' + trophyString + '<span class="chatusertext ' + ((id) ? 'updateableusername puser' : '') + '" data-userid="' + id + '">' + '' + name + '</span> ' + (data["admin"] ? ' <span class="chatuseradmin">(staff)</span>' : "") + '<span class="activeText" data-userid="' + id + '"></span>' + '</div>' + idString + ' <div class="chattime">' + ("0" + hour).slice(-2) + ':' + ("0" + minute).slice(-2) + '</div>' + '    <div class="chatmsg ' + (data["userid"] == myuser.getID() ? "chatmsgme" : "") + (!data["userid"] ? "chatmsgbot" : "") + (data["admin"] ? " chatmsgadmin" : "") + '">' + msg + '</div></div>');
            $chatbox.stop();
            if(!document.hasFocus() && !ignored) {
                chatmsgsblur++;
                var chatmsgstring = chatmsgsblur;
                if(chatmsgsblur > 99) {
                    chatmsgstring = "99+";
                }
                document.title = '(' + chatmsgstring + ') ' + title;
            }
            update_chatPreview();
            if(doScroll) {
                $("#chatbox").animate({
                    "scrollTop": $('#chatbox')[0].scrollHeight
                }, "slow");
            }
        },
        showInfoMsg: function(msg) {
            var $chatbox = $("#chatbox"),
                html = '<div class="chatmsgcontainer"><div class="infomsg">' + msg + '</div></div>';

            $chatbox.append(html).animate({
                "scrollTop": $chatbox[0].scrollHeight
            }, "slow");
        },
        listIgnoredUsers: function(hardignore) {
            var ignoredUsers = this.getIgnoredUsers(hardignore),
                id, name, html;

            html = (hardignore) ? "Dropped users:" : "Ignored users:";

            if(ignoredUsers) {
                html += '<ul class="jetstuff-userlist">';
                for(var i=0; i<ignoredUsers.length; i++) {
                    id = ignoredUsers[i];
                    name = this.getUsername(id);
                    html += '<li>#'+id+(name ? ' - '+name : '')+'</li>';
                }
                html += '</ul><div class="jetstuff-summary">Total: '+ignoredUsers.length+'</div>';
            } else {
                html = "No ignored users yet. Use `!ignore [id]` to ignore annoying users";
            }
            this.showInfoMsg(html);
        },
        listDroppedUsers: function() {

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
                    };
                }
                this.saveUserlist();
                localStorage.removeItem('jetstuff.chathelper.ignoredusers');
            }
        }
    });

    jetstuff.chatHelper = new ChatHelper();
})();
