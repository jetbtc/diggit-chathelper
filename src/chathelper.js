// ==UserScript==
// @name        diggit-chathelper
// @namespace   https://github.com/jetbtc/diggit-chathelper
// @include     https://diggit.io/
// @version     {{version}}
// @grant       none
// ==/UserScript==

window.jetstuff = window.jetstuff || {};
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
        usersById: {},
        usersByName: {},
        hidespam: true,
        filterList: ["regex:(?:http|https|ftp)://"],
        filterReList: [],
        config: {
          hidespam: true,
          automute: false
        },
        labels: {
            "default": {
                width: 3,
                color: '#31c471'
            }
        },
        commandRe: /^!(help|version|v|user|game|block|tellblock|tb|ignore|drop|unignore|undrop|hl|labels|label|unhl|unlabel|addlabel|createlabel|removelabel|deletelabel|tip|rain|rainyes|hidespam|automute|filters|f|addfilter|af|deletefilter|df)\b\s*(.*)?/,
        argsplitRe: /\s+/,
        labelFilterRe: /[^a-z0-9\-]/gi,
        nameFilterRe: /[^a-z0-9]/gi,
        nameCheckRe: /^[a-z0-9]{1,12}$/i,
        init: function() {
            this.loadUserlist();
            this.loadLabels();
            this.loadSpamfilters();

            this.cleanup();

            console.info("chathelper active");

            this.rebindChatsubmit();
            this.rebindChathandler();
        },
        isIgnored: function(user) {
            var user = this.getUser(user);
            return user ? user.ignored : false;
        },
        isHardignored: function(user) {
            var user = this.getUser(user);
            return user ? user.hardignored : false;
        },
        ignoreUser: function(user, hardignore) {
            var user = this.getUser(user);

            if(user && this.unignorable.indexOf(user.id) === -1 && user.id != myuser.getID()) {

                this.unignoreUser(user);

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
        unignoreUser: function(user) {
            var user = this.getUser(user);

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
        deleteLabel: function(labelName, width, color) {
            var labelName = labelName ? labelName.replace(this.labelFilterRe, "") : "",
                users = this.userlist,
                user;

            if(labelName.length && labelName !== "default" && this.labels[labelName]) {
                delete this.labels[labelName];
                this.saveLabels();

                users.forEach(function(user) {
                    if(user.label === labelName) delete user["label"];
                });

                return labelName;
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
        loadSpamfilters: function() {
            var data = localStorage.getItem('jetstuff.chathelper.filters');

            if(data) {
                try {
                  this.filterList = JSON.parse(data);
                } catch(e) {
                  console.error('Could not parse spam filters');
                }
            }
            
            this.updateSpamfilters();
        },
        saveSpamfilters: function() {
            localStorage.setItem('jetstuff.chathelper.filters', JSON.stringify(this.filterList));
        },
        updateSpamfilters: function() {
            this.filterReList = this.filterList.map(function(str) {
                if(str.indexOf('regex:') === 0) {
                  return new RegExp(str.substr(6), 'i');
                } else {
                  return str;
                }
            });
        },
        labelUser: function(user, labelName) {
            var user = this.getUser(user),
                labelName = labelName ? labelName.replace(this.labelFilterRe, "") : false;

            if(user && labelName) {
                user.label = labelName;
                this.saveUserlist();

                return labelName;
            }
            return false;
        },
        unlabelUser: function(user) {
            var user = this.getUser(user);

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

            labeledUsers = users.filter(function(user) {
                return !!user.label;
            });

            labeledUsers.sort(function(a, b) {
                return b.id < a.id;
            });

            return labeledUsers;
        },
        getUser: function(user) {
            var userObj = null;

            if(!user) {
                return null;
            } else if(user instanceof Object) {
                return user;
            }

            if(typeof user === "number" || user == parseInt(user)) {
                userObj = this.usersById[ user ];
            }
            if(!userObj && user.toString().indexOf('#') === 0) {
                userObj = this.usersById[ user.toString().replace(/[^0-9]/g, "") ];
            }
            if(!userObj) {
                userObj = this.usersByName[ user.toString().toLowerCase().replace(this.nameFilterRe, "") ];
            }

            return userObj;
        },
        registerUser: function(id, name) {
            var name = name.toString().replace(this.nameFilterRe, ""),
                user;

            if(id && name) {
                if(!this.usersById[id]) {
                    user = this.usersById[id] = this.usersByName[name.toLowerCase()] = {
                        id: id,
                        name: name
                    };
                    this.userlist.push(user);
                    this.saveUserlist();
                } else {
                    user = this.usersById[id];

                    if(user.name !== name) {
                        if(user.name) {
                            if(user.names instanceof Array) {
                                user.names.push(user.name);
                            } else {
                                user.names = [name];
                            }
                            delete this.usersByName[user.name.toLowerCase()];
                        }

                        user.name = name;
                        this.usersByName[name.toLowerCase()] = user;
                        this.saveUserlist();
                    }
                }
                return true;
            }
            return false;
        },
        getUserString: function(user) {
            var user = this.getUser(user);

            if(user && user.name) {
                return user.name+' (#'+user.id+')';
            } else {
                return 'user #'+user.id;
            }
        },
        getIgnoredUsers: function(hardignore) {
            var users = this.userlist,
                ignoredUsers = [],
                user, k;
            
            ignoredUsers = users.filter(function(user) {
                return (hardignore && user.hardignored) || (!hardignore && user.ignored);
            });

            ignoredUsers.sort(function(a, b) {
                return b.id < a.id;
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
                        
                        if(user.name) usersByName[user.name.toLowerCase()] = user;
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
        getLatestBlock: function(callback) {
            $.getJSON('//btc.blockr.io/api/v1/block/info/latest', function(xhr) {
                var data = xhr.data || {},
                    timediff = 0,
                    timestr = " ",
                    txcount = 0,
                    hours, min, sec;

                if(!data) {
                    return callback("Could not retrieve block data.");
                }

                if(data.time_utc) {
                    timediff = Math.max(0, Date.now() - new Date(data.time_utc).getTime());

                    hours = Math.floor( timediff/3600000 );
                    timediff -= hours * 3600000;

                    min = Math.floor( timediff/60000 );
                    timediff -= min * 60000;

                    sec = Math.floor( timediff / 1000 );

                    if(hours) timestr += hours+" hours ";
                    if(min) timestr += min+" minutes ";
                    if(sec) timestr += sec+" seconds ";

                    timestr += "ago";
                } else {
                    timestr = "[unknown time, sorry]";
                }

                return callback(null, {
                    time: data.time_utc,
                    timestr: timestr,
                    txcount: data.nb_txs || 0
                });
            });
        },
        cmdGetBlock: function() {
            this.getLatestBlock(function(error, data) {
                if(error) {
                    return this.showInfoMsg(error);
                } else {
                    this.showInfoMsg('The last block was found '+data.timestr+' and included '+data.txcount+' transactions. [via <a href="https://blockr.io/" target="_blank">blockr.io</a>]');
                }
            }.bind(this));
        },
        cmdTellBlock: function() {
            this.getLatestBlock(function(error, data) {
                if(error) {
                    return this.showInfoMsg(error);
                } else {
                    socketio.emit("chat", {
                        msg: 'The last block was found '+data.timestr
                    });
                }
            }.bind(this));
        },
        cmdIgnore: function(args) {
            var user = this.getUser(args[0]),
                name;

            if(typeof args[0] === "undefined") {
                this.listIgnoredUsers(false);
            } else if(args[0] === 'on') {
                this.showInfoMsg('Ignoring enabled. Use `!ignore off` to disable it again');
                this.chatIgnore = true;
            } else if(args[0] === 'off') {
                this.showInfoMsg('Ignoring disabled. Use `!ignore on` to enable it again');
                this.chatIgnore = false;
            } else if( this.ignoreUser(user) ) {
                name = this.getUserString(user);

                this.showInfoMsg('Ignored '+name);
            } else {
                this.showInfoMsg('You can\'t ignore yourself or staffmembers.');
            }
        },
        cmdDrop: function(args) {
            var user = this.getUser(args[0]),
                name;

            if(typeof args[0] === "undefined") {
                this.listIgnoredUsers(true);
            } else if(args[0] === 'on') {
                this.showInfoMsg('Dropping enabled. Use `!drop off` to disable it again');
                this.chatDrop = true;
            } else if(args[0] === 'off') {
                this.showInfoMsg('Dropping disabled. Use `!drop on` to enable it again');
                this.chatDrop = false;
            } else if( this.ignoreUser(user, 1) ) {
                name = this.getUserString(user);

                this.showInfoMsg('Dropped '+name);
            } else {
                this.showInfoMsg('You can\'t ignore yourself or staffmembers.');
            }
        },
        cmdUnignore: function(args) {
            var user = this.getUser(args[0]),
                name;

            if( this.unignoreUser(user) ) {
                name = this.getUserString(user);

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
            var user = this.getUser(args[0]),
                name = args[1] || "default",
                labelName, username;


            if(typeof args[0] === "undefined") {
                this.listLabeledUsers();
            } else if(user) {
                labelName = this.labelUser(user, name);
                username = this.getUserString(user);

                if(labelName) {
                    this.showInfoMsg(username+' was labeled as '+labelName+'!');
                } else {
                    this.showInfoMsg('Could label user. The label name seems to be wrong.');
                }
            } else {
                this.showInfoMsg('Could not label user. The user id/name seems to be wrong.');
            }
        },
        cmdUnlabel: function(args) {
            var user = this.getUser(args[0]),
                username;

            if(this.unlabelUser(user)) {
                username = this.getUserString(user);
                this.showInfoMsg('Removed label from '+username+'!');
            } else {
                this.showInfoMsg('Not working. Is the user id valid?');
            }
        },
        cmdUser: function(args) {
            var user = this.getUser(args[0]),
                id = parseInt(args[0]);

            if(user) {
                socketio.emit("get_user_details", {
                    userid: user.id
                });
            } else if(id) {
                socketio.emit("get_user_details", {
                    userid: id
                });
            } else if(this.nameCheckRe.test(args[0])) {
                socketio.emit("get_user_details", {
                    username: args[0]
                });
            } else {
                this.showInfoMsg('Invalid username');
            }
        },
        cmdGame: function(args) {
            var id = parseInt(args[0]);

            if(id) {
                socketio.emit("get_game_details", {
                    gameid: id
                });
            } else {
                this.showInfoMsg('Invalid game id');
            }
            
        },
        cmdListFilters: function(args) {
            var filters = this.filterList,
                filter;

            html = "Filters:";

            if(filters) {
                html += '<ul class="jetstuff-filterlist">';
                for(var i=0; i<filters.length; i++) {
                    filter = filters[i];
                    html += '<li>['+(i+1)+'] - '+filter+'</li>';
                }
                html += '</ul><div class="jetstuff-summary">Total: '+filters.length+'</div>';
            } else {
                html = "No filters added. Use `!addfilter [filterstring]`";
            }
            this.showInfoMsg(html);
        },
        cmdAddFilter: function(filter) {
            if(filter) {
                this.filterList.push(filter);

                try {
                  this.updateSpamfilters();
                  this.showInfoMsg("Added filter: "+filter);
                } catch(e) {
                  this.filterList.pop();
                  this.showInfoMsg("Invalid filter: "+filter+" - Please make sure to escape regexp characters");
                }

                this.saveSpamfilters();
            }
        },
        cmdDeleteFilter: function(args) {
            var filters = this.filterList,
                id = parseInt(args[0]),
                filter;

            if(id && id <= filters.length) {
                filter = filters[id-1];
                this.filterList.splice(id-1,1);
                this.saveSpamfilters();
                this.updateSpamfilters();

                this.showInfoMsg("Removed filter: "+filter);
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
                case 'user':
                    this.cmdUser(args);
                    break;
                case 'game':
                    this.cmdGame(args);
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
                case 'block':
                    this.cmdGetBlock();
                    break;
                case 'tellblock':
                case 'tb':
                    this.cmdTellBlock();
                    break;
                case 'filters':
                case 'f':
                    this.cmdListFilters();
                    break;
                case 'addfilter':
                case 'af':
                    this.cmdAddFilter(match[2]);
                    break;
                case 'deletefilter':
                case 'df':
                    this.cmdDeleteFilter(args);
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
                altNames = "",
                ignored = false,
                isSpam = false,
                idString, user, label, labelString = "";


            this.registerUser(id, name);
            user = this.getUser(id);

            if(user) {
                // Has label?
                label = this.getLabel(user.label);

                if(label) {
                    labelString = label ? 'style="border-left:'+label.width+'px solid '+label.color+';margin-left:'+(-label.width-6)+'px;padding-left:6px;"' : "";
                }
                altNames = user.names && user.names.length > 1 ? "Previous names: " + user.names.join(', ') : "";

                // Take care of spammers
                if(!user.messages) {
                    user.messages = [];
                }

                user.messages.push(msg);
                if(user.messages.length > 4) {
                    user.messages = user.messages.slice(-4);
                }

                isSpam = !data["admin"] && (myuser.getID() !== id) && this.checkSpam(user);
            }

            idString = altNames
                        ? ' <span class="jetstuff-userid jetstuff-hasalts" title="'+altNames+'">'+(id || "")+'</span> '
                        : ' <span class="jetstuff-userid">'+(id || "")+'</span> ';

            if (!msg || (isSpam && this.config.hidespam)) {
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

            $chatbox.append('' + '<div class="chatmsgcontainer '+(ignored ? 'jetstuff-ignoreduser' : '')+'" '+labelString+'>' + '<div class="chatuser">' + trophyString + '<span class="chatusertext ' + ((id) ? 'updateableusername puser' : '') + '" data-userid="' + id + '">' + '' + name + '</span> ' + (data["admin"] ? ' <span class="chatuseradmin">(staff)</span>' : "") + '<span class="activeText" data-userid="' + id + '"></span>' + '</div>' + idString + '<div class="chattime">' + ("0" + hour).slice(-2) + ':' + ("0" + minute).slice(-2) + '</div>' + '    <div class="chatmsg ' + (data["userid"] == myuser.getID() ? "chatmsgme" : "") + (!data["userid"] ? "chatmsgbot" : "") + (data["admin"] ? " chatmsgadmin" : "") + '">' + msg + '</div></div>');
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
        checkSpam: function(user) {
            var user = this.getUser(user),
                filters = this.filterReList,
                m = user.messages || [],
                muteDuration = 60 * 6e4,
                isSpam = false,
                msg = "";

            // Eh.
            if(!filters.length || !m.length) {
                return;
            }

            msg = m[m.length - 1];

            // Spam
            filters.forEach(function(filter) {
              if(typeof filter === "string") {
                isSpam |= msg.indexOf(filter) !== -1;
              } else {
                isSpam |= (msg.match(filter)||[]).length > 0;
              }
            });

            // Don't mute twice
            if(user.lastMute && user.lastMute > Date.now()) {
                return isSpam;
            }

            if(isSpam && myuser.getStaffLevel() && this.config.automute) {
                user.muteCount = user.muteCount ? user.muteCount++ : 1;
                user.lastMute = Date.now() + muteDuration;
                this.saveUserlist();

                socketio.emit('mod_global_mute', {
                    userid: user.id,
                    mute: true,
                    time: muteDuration
                });
            }

            return isSpam;
        },
        showInfoMsg: function(msg) {
            var $chatbox = $("#chatbox"),
                html = '<div class="chatmsgcontainer"><div class="infomsg">' + msg + '</div></div>';

            $chatbox.append(html).stop(true).animate({
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
                    user = ignoredUsers[i];
                    html += '<li>#'+user.id+(user.name ? ' - '+user.name : '')+'</li>';
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
                    user = labeledUsers[i];
                    label = this.getLabel(user.label);
                    labelString = label ? 'style="box-shadow: inset '+(2*label.width)+'px 0 0 '+(-label.width)+'px '+label.color+'"' : "";
                    html += '<li '+labelString+'>#'+user.id+(user.name ? ' - '+user.name : '')+' - '+user.label+'</li>';
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
