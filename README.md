# diggit-chathelper v0.3.4

**IMPORTANT: The sites coldwallet and hotwallet have been drained and the admin of the site has been inactive for ages now. Reports have been coming in that withdrawals are not working properly and nobody is taking care of the issue. SADLY, I HAVE TO RECOMMEND AGAINST TRUSTING DIGGIT.IO FOR NOW**

A bunch of tools for the chat on https://diggit.io - by jet (#1761 on diggit)

### Installation

**Note**: After installing the script and refreshing the site you should see users IDs next to their usernames. If you do, it worked and you're done.

#### Firefox

If you have a version earlier than v0.3.0, disable it! Go to diggit, click the arrow next to the Greasemonkey icon and uncheck `diggit-chathelper v0.2.x`

- Install the [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) addon. *(requires a restart)*
- Click this: [+install](https://github.com/jetbtc/diggit-chathelper/raw/master/diggit-chathelper.user.js)
- Click `Install` in the Greasemonkey popup
- Refresh diggit

#### Chrome

Chrome support is **not** official. New versions are not being tested in Chrome before being released. Since Firefox and Chrome are *(about)* equally good with Javascript and none of the Greasemonkey/Tampermonkey features are being used, there should not be any problems.

- Install the [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) addon.
- Click this: [+install](https://github.com/jetbtc/diggit-chathelper/raw/master/diggit-chathelper.user.js)
- Click `Install` in the Tampermonkey popup
- Refresh diggit

#### Internet Explorer / Opera / Others

- Get a proper browser
- See the Firefox or Chrome instructions

### Updating

- Click this: [+update](https://github.com/jetbtc/diggit-chathelper/raw/master/diggit-chathelper.user.js)
- Refresh diggit
- No more steps. Enjoy!

### Usage

Alright. You can use commands with a leading exclamation mark `!` to control this thing. Type them in the chatbox, as you probably know it from other places. They won't be sent unless you do it wrong. I'll add more commands as we go, but the most important functionality, ignoring, works just fine.

The following commands are available as of now:

- `!help` - Get a help message with a summary of the available commands.
- `!version` - Check the current version number. Compare with the one on the github page
- `!user [user]` - Check the profile of a user. Same functionality as clicking a U:User link in chat, or clicking a users name.
- `!game [gameId]` - Check game details. Same as clicking G:gameId links in chat.
- `!ignore` - A list of ignored users
- `!ignore [user]` - Ignore users. Their names will be orange and the message will be hidden by default. You can hover over the names to show the message.
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
- `!block` - Get info about when the last block was found.
- `!tb` - Send info about the last block in chat. **Important:** This sends a message on your behalf.

#### Examples

- `!ignore` - Get a list of people you're ignoring
- `!ignore 8760` - Ignore testificate, the guy I use to test stuff.
- `!ignore 8,760` - fine, too
- `!ignore #8760` - yep, works.
- `!ignore testuser` - **New:** Optionally use names everywhere you had to use ids earlier!
- `!drop 8760` - Completely hide that stuff.
- `!unignore 8760` - That would work.
- `!ignore off` - The better choice: Temporarily turn ignoring off.
- `!ignore on` - And to get it back.. also works for `!drop`
- `!createlabel friend orange` - Create a label named `friend` in orange, with the default weight of 3
- `!createlabel friend #FF0 5` - Make the friend label yellow by using a hex code and a little wider. (Unlike ids, the `#` is important here)
- `!label 8760 friend` - Highlight a user with the newly created friend label
- `!unlabel 8760` - Or not.
- `!removelabel friend` - Remove a label entirely.
- `!labels` - To see check if any other labels are left (at least `default`)
- `!user jet` - stalk someone who is offline without having to post their name in chat. WIN
- `!game 232144` - Check the game details of that game. Simple as that.

### Filters

With the wave of spam that is hitting the chat lately, and the lack of proper moderation and especially administration, the Chathelper now drops all messages containing links by default.

This is done via patternmatching using regular expressions, and can be adjusted to your liking.

Active filter patterns can be viewed with the `!filter`/`!f` command in the chat.

#### Adding filters

Filters can be added with the `!addfilter`/`!af` command followed by the pattern, which can either be any string, or a regular expression body if it starts with `regexp:`.

##### Examples:

- `!af regex:(?:http|https|ftp)://` - Add the default pattern, dropping all messages containing links.
- `!af [deposit][withdraw]` - Drop beggars pasting their balance
- `!af http://goo.gl/` - Drop all links using this link shortener
- `!af ?ref=` - Drop all links with this reflink fragment

#### Deleting filters

Deleting filters is done with the `!deletefilter`/`!df` command, followed by the ID given when listing your filters with `!filter`/`!f`

##### Example

    [1] - regex:(?:http|https|ftp)://
    [2] - [deposit][withdraw] 0.00 b
    [3] - ?ref=

If your `!f` output looks like this, do `!df 3` to drop the `?ref=` filter.

**Note:** If you want to delete multiple filters, do `!f` inbetween, to make sure you get the right ID

### Security

I am doing my best to keep this script secure.

Complexity is being kept as low as possible, user inputs use the sites own functionality or are being treated properly. Output is being sanitized.

I have no intention to steal Bitcoins whatsoever, and I am encouraging you to look at - and audit - the source code all to your liking.

Yet, this is a hobby project. Please be aware of this.

### Changelog

#### v0.3.4
- Better support for multiple of my scripts in preparation for.. more scripts.
- Block commands switched from toshi.io to [blockr.io](http://btc.blockr.io/)
- Restructured README
- Added text based filtering `!filter`, `!addfilter`, `!deletefilter`
- Fix: whacky command parsing

#### v0.3.3
- Added `!block` to get info about the latest block, using [toshi.io](https://toshi.io/)
- Also added `!tellblock`/`!tb` to let others know without copy/pasting. **This posts a message on your behalf.**
- Added `!profile` and `!game`
- Fix: Hovering over the users id shows a full list of previous tracked names again.

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

### Feedback

I would love your feedback on this project! Suggestions and bug reports are very welcome and I will of course try to answer any questions.

You can probably find me in the diggit chat (jet, ID 1761). Alternatively, create issues in this project or mail me at jetbtc [at] outlook.com

If you like the chathelper, you are very welcome to send a coffee or two my way:

**17eGP2ksBHfWxz23fC3PZA7XVSJ7KrUQKE**

Thank you!
