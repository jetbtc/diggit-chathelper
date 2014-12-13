diggit-chathelper
=================

A set of tools for the chat on diggit.io.

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
- `!ignore [id]` - Ignore users. Their names will be orange and the message will be hidden by default. You can hover over the names to show the message.
- `!drop [id]` - For the annoying spammers, you have this gem. Completely drop their messages from the chat!
- `!unignore [id]` - Undo `!ignore` and `!drop`

Examples:

- `!ignore 8760` - Ignore testificate, the guy I use to test stuff.
- `!drop 8760` - Completely hide that stuff.
- `!drop 1` - Yeah... no. Nice try.
- `!unignore 2` - That would work.


### Planned features

- Highlight users
- Filter ChatBot announcements
- Keep track of your tips
- Maybe some kind of import/export functionality

### Suggestions?

Let me know in the chat. Implement them and make a pull request, if you want.

### Donations

Tip me all you have! You'll have to do it manually since I didn't get around to add that to this script just yet. JK. Tips are welcome, though!

*(I'm jet, my ID on the site is `1761`. Totally forgot about that..)*
