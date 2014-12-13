# diggit-chathelper v0.2.1
==========================

A bunch of tools for the chat on https://diggit.io - by jet (#1761 on diggit)

### Installation

- Make sure you actually want to install this. **Do NOT trust strangers with your Bitcoins. Ever.**
- You need Firefox
- Install the [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) addon
- Click this: [+install](https://github.com/jetbtc/diggit-chathelper/raw/master/diggit-chathelper.user.js)
- Refresh diggit

**Info:** Peoples user ID will show up next to their names in chat. That's how you can tell it worked.

### Updating

- Click +install again
- Refresh diggit
- No more steps. Enjoy!

### Usage

Alright. You can use commands with a leading explamation mark `!` to control this thing. Type them in the chatbox, as you probably know it from other places. They won't be sent unless you do it wrong. I'll add more commands as we go, but the most important functionality, ignoring, works just fine.

The following commands are available as of now:

- `!help` - Get a help message with a summary of the available commands.
- `!version` - Check the current version number. Compare with the one on the github page
- `!ignore` - Get a list of ignored users
- `!ignore [id]` - Ignore users. Their names will be orange and the message will be hidden by default. You can hover over the names to show the message.
- `!drop` - get a list of dropped users
- `!ignore on/off` - toggle ignoring on/off to get an idea what this script is saving you from
- `!drop on/off` - toggle dropping of messages on/off
- `!drop [id]` - For the annoying spammers, you have this gem. Completely drop their messages from the chat!
- `!unignore [id]` - Undo `!ignore` and `!drop`
- `!undrop [id]` - Alias of `!unignore`

Examples:

- `!ignore` - Get a list of people you're ignoring
- `!ignore 8760` - Ignore testificate, the guy I use to test stuff.
- `!ignore 8,760` - fine, too
- `!ignore #8760` - yep, works.
- `!drop 8760` - Completely hide that stuff.
- `!unignore 8760` - That would work.
- `!ignore off` - The better choice: Temporarily turn ignoring off.
- `!ignore on` - And to get it back.. same works for `!drop`

### Changelog

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
