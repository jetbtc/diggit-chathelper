# diggit-chathelper v0.3.2

A bunch of tools for the chat on https://diggit.io - by jet (#1761 on diggit)

### Installation

- Make sure you actually want to install this. **Do NOT trust strangers with your Bitcoins. Ever.**
- You need Firefox
- Install the [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) addon
- **Important:** If you have a version earlier than v0.3.0, disable it! Go to diggit, click the arrow next to the Greasemonkey icon and uncheck `diggit-chathelper v0.2.x`
- Click this: [+install](https://github.com/jetbtc/diggit-chathelper/raw/master/diggit-chathelper.user.js)
- Refresh diggit
- Done!

**Info:** Peoples user ID will show up next to their names in chat. That's how you can tell it worked.

### Updating

- Click +install again
- Refresh diggit
- No more steps. Enjoy!

### Usage

Alright. You can use commands with a leading exclamation mark `!` to control this thing. Type them in the chatbox, as you probably know it from other places. They won't be sent unless you do it wrong. I'll add more commands as we go, but the most important functionality, ignoring, works just fine.

The following commands are available as of now:

- `!help` - Get a help message with a summary of the available commands.
- `!version` - Check the current version number. Compare with the one on the github page
- `!ignore` - A list of ignored users
- `!ignore [useruser]` - Ignore users. Their names will be orange and the message will be hidden by default. You can hover over the names to show the message.
- `!drop` - A list of dropped users
- `!ignore on/off` - Toggle ignoring on/off to get an idea what this script is saving you from
- `!drop on/off` - Toggle dropping of messages on/off
- `!drop [user]` - For the annoying spammers, you have this gem. Completely drop their messages from the chat!
- `!unignore [user]` - Undo `!ignore` and `!drop`
- `!undrop [user]` - Alias of `!unignore`
- `!createlabel [name] [color] [weight]` - Create a label to use on people. `color` can be any valid CSS color: A hex code, rgb or hsl values, or one of the 140+ available color names ([external list](http://www.cssportal.com/css3-color-names/)) while `weight` is the width of the label in chat. `1` - `6` are valid, `3` being the default.
- `!labels` - A list of labels you created
- `!label` - A list of users you labeled
- `!label [user] [labelname]` - Label/highlight a user. `labelname` is optional.

Examples:

- `!ignore` - Get a list of people you're ignoring
- `!ignore 8760` - Ignore testificate, the guy I use to test stuff.
- `!ignore 8,760` - fine, too
- `!ignore #8760` - yep, works.
- `!ignore testuser` - **New:** Optionally use names everywhere you had to use ids earler!
- `!drop 8760` - Completely hide that stuff.
- `!unignore 8760` - That would work.
- `!ignore off` - The better choice: Temporarily turn ignoring off.
- `!ignore on` - And to get it back.. same works for `!drop`
- `!createlabel friend orange` - Create a label named `friend` in orange, with the default weight of 3
- `!createlabel friend #FF0 5` - Make the friend label yellow by using a hex code and a little wider. (Unlike ids, the `#` is important here)
- `!label 8760 friend` - Highlight a user with the newly created friend label
- `!unlabel 8760` - Or not.
- `!removelabel friend` - Remove a label entirely.
- `!labels` - To see check if any other labels are left (at least `default`)

### Changelog

#### v0.3.2
- Major restructuring of the locally kept user directory for more flexibility!
- As a result, user names now work in commands instead of ids
- Labels! `!createlabel`, `!labels`, `!label`/`!hl`, `!unlabel`/ `!unhl`
- Page title of the unfocused window *(number of new messages in chat)* does no longer get updated by ignored users
- Fix: Double clicking on user ids also selects part of the time
- Fix: Documented `!undrop` not actually a command

#### v0.3.1
- Ignore didn't fully work after trophy update. Works now!

#### v0.3.0
- Support newly added trophies
- Can't ignore yourself anymore
- Small CSS adjustment

#### v0.2.1
- Added my credentials to `!help` to prevent confusion
- IDs copied with separators or hash are now supported in commands
- Added `!version` and `!v` to see the current version of the script
- `!ignore` and `!drop` with no ID now show a list of ignored/dropped people
- Added switches to turn on/off ignoring and dropping of messages
- Added `!undrop` as alias for `!unignore`. Both have both functionalities.

#### v0.2.0
- First public release.

### Planned features

- Highlight users
- Filter ChatBot announcements
- Keep track of your tips
- Maybe some kind of import/export functionality

Suggestions are welcome! And so are pull requests.

### Donations

Tip me all you have! You'll have to do it manually since I didn't get around to add that to this script just yet. JK. Tips are welcome, though!

*(I'm jet, my ID on the site is `1761`. Totally forgot about that..)*
