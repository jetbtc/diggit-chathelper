// ==UserScript==
// @name        diggit-chathelper
// @namespace   https://github.com/jetbtc/diggit-chathelper
// @include     https://diggit.io/
// @version     0.3.1
// @grant       none
// ==/UserScript==

var jetstuff = window.jetstuff = jetstuff || {};
(function() {
    var demoObj = document.createElement('a'),
        style = $('<style>').append('.infomsg,.chatmsg{position:relative;overflow:hidden;}.infomsg .chattime,.chatmsg .chattime{position:absolute;top:0;right:0;float:none}.jetstuff-ignoreduser{position:relative;}.jetstuff-ignoreduser .chatusertext,.jetstuff-ignoreduser .chattime,.jetstuff-ignoreduser .jetstuff-userid{color:#b57a5a}.jetstuff-ignoreduser .chatmsg{position:absolute;top:100%;left:0;right:0;opacity:.92;background-color:#344c45;transform-origin:0 0;transform:rotateX(-90deg);transition:transform .15s linear;z-index:2}.jetstuff-ignoreduser:hover .chatmsg{margin-bottom:0;transform:rotateX(0)}.jetstuff-highlight{border-left:3px solid #31c471;margin-left:-7px;padding-left:4px}.jetstuff-mention{border-color:#ffed75}.jetstuff-userid{color:#31c471;vertical-align:text-top;cursor:default;font-size:11px;margin-left:4px;opacity:.5}.jetstuff-hasalts{cursor:pointer}.jetstuff-help{font-size:12px;overflow:hidden;margin-bottom:6px;}.jetstuff-help dt{float:left;clear:left;font-weight:normal;font-style:normal;}.jetstuff-help dt:after{content:"-";display:inline-block;padding:0 6px}.jetstuff-help dd{margin-left:24px}.jetstuff-userlist{font-size:12px;margin:0 0 6px;padding:0 6px;list-style:none}.jetstuff-labellist{font-size:12px;margin:0 0 6px;padding:0 6px 0 0;list-style:none;}.jetstuff-labellist li{margin-bottom:3px;padding-left:12px;}.jetstuff-labellist li:last-child{margin-bottom:0}.jetstuff-credits,.jetstuff-summary{opacity:.66;font-size:12px;}.jetstuff-credits a,.jetstuff-summary a{color:#31c471;text-decoration:underline;outline:0;}.jetstuff-credits a:hover,.jetstuff-summary a:hover,.jetstuff-credits a:active,.jetstuff-summary a:active,.jetstuff-credits a:focus,.jetstuff-summary a:focus{text-decoration:none}').appendTo(document.head),
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
        version: '0.3.1',
        chatIgnore: true,
        chatDrop: true,
        unignorable: [0, 1],
        userlist: {},
        usersById: {},
        usersByName: {},
        labels: {
            "default": {
                width: 3,
                color: '#31c471'
            }
        },
        commandRe: /^!(help|version|v|ignore|drop|unignore|undrop|hl|labels|label|unhl|unlabel|addlabel|createlabel|removelabel|deletelabel|tip|rain|rainyes)\s*(.*)?/,
        argsplitRe: /\s+/,
        labelFilterRe: /[^a-z0-9\-]/gi,
        nameFilterRe: /[^a-z0-9]/gi,
        init: function() {
            this.loadUserlist();
            this.loadLabels();

            this.cleanup();

            console.info("chathelper active");

            return;

            // this.rebindChatsubmit();
            // this.rebindChathandler();

        },
        isIgnored: function(id) {
            return this.userlist.hasOwnProperty(id) ? this.userlist[id].ignored : false;
        },
        isHardignored: function(id) {
            return this.userlist.hasOwnProperty(id) ? this.userlist[id].hardignored : false;
        },
        ignoreUser: function(id, hardignore) {
            var user = this.getUserById(id) ;

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
            var user = this.getUserById(id);

            if(user) {
                delete user["hardignored"];
                delete user["ignored"];

                this.saveUserlist();
                return true;
            }
            return false;
        },
        setLabel: function(name, color, width) {
            var name = name ? name.replace(this.labelFilterRe, "") : "";

            if(name.length) {
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

                this.saveLabels();

                return name;                
            }
            return null;
        },
        getLabel: function(name) {
            var name = name ? name.replace(this.labelFilterRe, "") : "";

            return name.length ? this.labels[name] || null : null;
        },
        deleteLabel: function(name, width, color) {
            var name = name ? name.replace(this.labelFilterRe, "") : "",
                users = this.userlist,
                user, k;

            if(name.length && name !== "default" && this.labels[name]) {
                delete this.labels[name];
                this.saveLabels();

                for(k in users) {
                    user = users[k];

                    if(user.label === name) delete user["label"];
                }

                return name;
            }
            return null;
        },
        loadLabels: function() {
            var data = localStorage.getItem('jetstuff.chathelper.labels');

            if(data) {
                this.labels = JSON.parse(data);
            }

            return this.labels;
        },
        saveLabels: function() {
            localStorage.setItem('jetstuff.chathelper.labels', JSON.stringify(this.labels));
        },
        labelUser: function(id, labelName) {
            var user = this.getUserById(id),
                labelName = labelName ? labelName.replace(this.labelFilterRe, "") : false;

            if(user && labelName) {
                user.label = labelName;
                this.saveUserlist();

                return labelName;
            }
            return false;
        },
        unlabelUser: function(id) {
            var user = this.getUserById(id);

            if(user && user.label) {
                delete user.label;
                this.saveUserlist();

                return true;
            }
            return false;
        },
        getLabeledUsers: function() {
            var users = this.userlist,
                labeledUsers = [],
                label, user, k;

            for(k in this.userlist) {
                user = users[k];

                if( user.label ) {
                    labeledUsers.push(+k);
                }
            }

            labeledUsers.sort(function(a, b) {
                return b < a;
            });

            return labeledUsers;
        },
        getUserById: function(id) {
            var id = parseInt(id) || 0,
                users = this.userlist,
                user = null,
                length, lastIndex;

            if(!id) {
                return null;
            }

            if(users.hasOwnProperty(id)) {
                user = users[id];
            } else {
                user = users[id] = {
                    ignored: false,
                    names: name ? [name] : []
                };
                this.saveUserlist();
            }
            return user;
        },
        getUserByName: function(name) {
            var name = name ? name.replace(this.nameFilterRe, "") : false,
                users = this.userlist,
                user = null, k, lastIndex;

            if(name.length) {
                for(k in users) {
                    user = users[k];
                    lastIndex = user.names.length ? user.names.length - 1 : false;

                    if(name && lastIndex !== false && (user.names[lastIndex] === name)) {
                        return user;
                    }
                }
            }

            return user;
        },
        setUsername: function(id, name) {
            var user = this.getUserById(id),
                lastIndex = user ? user.names.length - 1 : false;

            if(name && lastIndex !== false && (lastIndex === -1 || user.names[lastIndex] !== name)) {
                user.names.push(name);
                this.saveUserlist();
            }
        },
        getUsername: function(user) {
            var user = (typeof user === "object") ? user : this.getUserById(user) || this.getUserByName(user);

            if(user && user.names) {
                return user.names[user.names.length-1];
            }
            return null;
        },
        getUserString: function(id) {
            var user = this.getUserById(id);

            if(user && user.names) {
                return user.names[user.names.length-1]+' (#'+id+')';
            } else {
                return 'user #'+id;
            }
            
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
            var data = localStorage.getItem('jetstuff.chathelper.userlist'),
                usersById = this.usersById,
                usersByName = this.usersByName,
                users;

            if(data) {
                users = this.userlist = JSON.parse(data);

                if(users instanceof Array) {
                    users.forEach(function(user) {
                        usersById[user.id] = user;
                        
                        if(user.name) usersByName[user.name] = user;
                    });
                }
            }

            return this.userlist;
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
            var id = args[0] ? args[0].replace(/[^0-9]/, '') : 0,
                name;

            if(typeof args[0] === "undefined") {
                this.listIgnoredUsers(false);
            } else if(args[0] === 'on') {
                this.showInfoMsg('Ignoring enabled. Use `!ignore off` to disable it again');
                this.chatIgnore = true;
            } else if(args[0] === 'off') {
                this.showInfoMsg('Ignoring disabled. Use `!ignore on` to enable it again');
                this.chatIgnore = false;
            } else if( this.ignoreUser(id) ) {
                name = this.getUserString(id);

                this.showInfoMsg('Ignored '+name);
            } else {
                this.showInfoMsg('You can\'t ignore yourself or staffmembers.');
            }
        },
        cmdDrop: function(args) {
            var id = args[0] ? args[0].replace(/[^0-9]/, '') : 0,
                name;

            if(typeof args[0] === "undefined") {
                this.listIgnoredUsers(true);
            } else if(args[0] === 'on') {
                this.showInfoMsg('Dropping enabled. Use `!drop off` to disable it again');
                this.chatDrop = true;
            } else if(args[0] === 'off') {
                this.showInfoMsg('Dropping disabled. Use `!drop on` to enable it again');
                this.chatDrop = false;
            } else if( this.ignoreUser(id, 1) ) {
                name = this.getUserString(id);

                this.showInfoMsg('Dropped '+name);
            } else {
                this.showInfoMsg('You can\'t ignore yourself or staffmembers.');
            }
        },
        cmdUnignore: function(args) {
            var id = args[0] ? args[0].replace(/[^0-9]/, '') : 0,
                name;

            if( this.unignoreUser(id) ) {
                name = this.getUserString(id);

                this.showInfoMsg('Unignored '+name);
            } else {
                this.showInfoMsg('No id given');
            }
        },
        cmdCreateLabel: function(args) {
            var name = args[0],
                color = args[1],
                width = args[2],
                labelName = this.setLabel(name, color, width),
                label;

            if(labelName) {
                label = this.getLabel(labelName);
                this.showInfoMsg('Created label: '+labelName+' (color: '+label.color+', weight: '+label.width+')');
            } else {
                this.showInfoMsg('Could not create label. Did you pass a valid label name? Only letters and numbers are allowed. Sorry!');
            }
        },
        cmdRemoveLabel: function(args) {
            var name = args[0],
                labelName = this.deleteLabel(name);

            if(labelName) {
                this.showInfoMsg('Removed label '+labelName+'.');
            } else {
                this.showInfoMsg('Could not remove label. Did you pass a valid label name?');
            }
        },
        cmdLabel: function(args) {
            var id = args[0] ? args[0].replace(/[^0-9]/, '') : 0,
                name = args[1] || "default",
                labelName, username;


            if(!id) {
                this.listLabeledUsers();
            } else {
                labelName = this.labelUser(id, name);
                username = this.getUserString(id);

                if(labelName) {
                    this.showInfoMsg(username+' was labeled as '+labelName+'!');
                } else {
                    this.showInfoMsg('Could label user. Did you pass a valid id?');
                }
            }   
        },
        cmdUnlabel: function(args) {
            var id = args[0] ? args[0].replace(/[^0-9]/, '') : 0,
                username = this.getUserString(id);

            if(this.unlabelUser(id)) {
                this.showInfoMsg('Removed label from '+username+'!');
            } else {
                this.showInfoMsg('Not working. Is the user id valid?');
            }
        },
        commandHandler: function(msg) {
            var match = msg.match(this.commandRe) || [],
                command = match[1] ? match[1] : null,
                args = match[2] ? match[2].split(this.argsplitRe) : [];

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
                case 'labels':
                    this.listLabels();
                    break;
                case 'hl':
                case 'label':
                    this.cmdLabel(args);
                    break;
                case 'unhl':
                case 'unlabel':
                    this.cmdUnlabel(args);
                    break;
                case 'addlabel':
                case 'createlabel':
                    this.cmdCreateLabel(args);
                    break;
                case 'removelabel':
                case 'deletelabel':
                    this.cmdRemoveLabel(args);
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
                user = this.getUserById(id),
                altNames = "",
                ignored = false,
                idString, label, labelString = "";

            if(user) {
                this.setUsername(id, name);
                // Has label?
                label = this.getLabel(user.label);

                if(label) {
                    labelString = label ? 'style="border-left:'+label.width+'px solid '+label.color+';margin-left:'+(-label.width-6)+'px;padding-left:6px;"' : "";
                }
                altNames = user.names.length > 1 ? "Previous names: " + user.names.slice(0,-1).join(', ') : "";
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

            $chatbox.append('' + '<div class="chatmsgcontainer '+(ignored ? 'jetstuff-ignoreduser' : '')+'" '+labelString+'>' + '<div class="chatuser">' + trophyString + '<span class="chatusertext ' + ((id) ? 'updateableusername puser' : '') + '" data-userid="' + id + '">' + '' + name + '</span> ' + (data["admin"] ? ' <span class="chatuseradmin">(staff)</span>' : "") + '<span class="activeText" data-userid="' + id + '"></span>' + '</div>' + idString + ' <div class="chattime">' + ("0" + hour).slice(-2) + ':' + ("0" + minute).slice(-2) + '</div>' + '    <div class="chatmsg ' + (data["userid"] == myuser.getID() ? "chatmsgme" : "") + (!data["userid"] ? "chatmsgbot" : "") + (data["admin"] ? " chatmsgadmin" : "") + '">' + msg + '</div></div>');
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
        listLabels: function() {
            var labels = this.labels,
                i = 0,
                html, label, width, k, labelString;

            if(labels) {
                html = 'List of labels: <ul class="jetstuff-labellist">';

                for(k in labels) {
                    label = labels[k];
                    labelString = 'style="box-shadow: inset '+(2*label.width)+'px 0 0 '+(-label.width)+'px '+label.color+'"';
                    html += '<li '+labelString+'>'+k+' - color: '+label.color+', weight: '+label.width+'</li>';
                    i++;
                }

                html += '</ul><div class="jetstuff-summary">Total: '+i+'</div>';
            } else {
                html = "No labels created yet. Use `!createlabel [labelname] [color] [weight]` to create labels.";
            }
            this.showInfoMsg(html);
        },
        listLabeledUsers: function() {
            var labeledUsers = this.getLabeledUsers(),
                id, user, label, labelString, name, html;

            html = "Labeled users:";

            if(labeledUsers) {
                html += '<ul class="jetstuff-labellist">';
                for(var i=0; i<labeledUsers.length; i++) {
                    id = labeledUsers[i];
                    user = this.getUserById(id);
                    label = this.getLabel(user.label);
                    labelString = label ? 'style="box-shadow: inset '+(2*label.width)+'px 0 0 '+(-label.width)+'px '+label.color+'"' : "";
                    name = this.getUsername(user);
                    html += '<li '+labelString+'>#'+id+(name ? ' - '+name : '')+' - '+user.label+'</li>';
                }
                html += '</ul><div class="jetstuff-summary">Total: '+labeledUsers.length+'</div>';
            } else {
                html = "No users labeled. Use `!createlabel [labelname] [color] [weight]` followed by `!label [id] [name]` to label users";
            }
            this.showInfoMsg(html);
        },
        cleanup: function() {
            var users = this.userlist,
                userArr = [],
                user, k;

            // Convert local user directory to latest schema
            if( !(users instanceof Array) ) {
                for(k in users) {
                    user = users[k];

                    user.id = k;
                    if(user.names.length) {

                    }

                    if(user.names.length) user.name = user.names.pop();
                    if(user.ignored === false) delete user["ignored"];
                    if(user.hardignored === false) delete user["hardignored"];
                    if(user.label && !this.getLabel(user.label)) delete user["label"];

                    userArr.push(user);
                }

                this.userlist = userArr;
                this.saveUserlist();
                this.loadUserlist();
            }
        }
    });

    jetstuff.chatHelper = new ChatHelper();
})();
