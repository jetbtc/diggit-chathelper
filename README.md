diggit-chathelper
=================

A set of tools for the chat on diggit.io.

### Installation

- Make sure you actually want to install this. **Do NOT trust strangers with your Bitcoins. Ever.**
- You need Firefox
- Install the [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) addon
- Click this: [+install](https://github.com/jetbtc/diggit-chathelper/raw/master/diggit-chathelper.user.js)

### Updating

- Click +install again
- Refresh diggit
- No more steps. Enjoy!

### Usage

There isn't much yet. It's WIP and an early version, so the cool stuff has yet to come. Including a GUI. If you can't use a console, this is not for you yet.

~~But you can ignore people. It's plain and simple: You ignore their ID, their messages get dropped. No hint whatsoever that they wrote something.~~

~~Changed to a soft ignore. Hard ignore will be back soon.~~

Both are now possible.

#### Ignore

If you ignore people, new messages will only show their name and such, but not the message itself. You'll know they said something, but chat space is saved and you don't have to put up with the shit they said. If you want to, **you can hover over the name to see the message**.

How to ignore:

- Get the ID of the user you would rather punch in the face than ignore *(there is only so much I can help you with)* ~~by clicking on their name in the chat~~ it's displayed next to their name and you can copy/paste that
- Open the console (`CTRL + Shift + K`)
- Enter this: `jetstuff.chatHelper.ignoreUser(id)` and replace `id` with the users id, for example `jetstuff.chatHelper.ignoreUser(21861)`
- Press `Enter`
- Enjoy!

Unignoring is a thing, but who wants that?

    jetstuff.chatHelper.unignoreUser(id)

#### Ignoring is not enough?

People can be annoying. If that's the case, just drop their messages. No hint of them in chat. At all.

How to do that:

Same thing as above, but add this `1` as a second parameter:

    jetstuff.chatHelper.ignoreUser(21861, 1)

It's like hellbanning, but just for you.

If you ever want to undo that, just unignore the user. Same as above. But of course you won't know their id, because you already forgot about those people. No loss, right?

### Planned features

- Ignore users (Basics implemented. No GUI yet)
- Highlight users
- Filter ChatBot announcements
- Keep track of IDs, names
- Keep track of your tips
- Maybe some kind of import/export functionality

