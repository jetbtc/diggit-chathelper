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

There isn't much yet. It's WIP and version `0.0.3`, so the cool stuff has yet to come. Including a GUI. If you can't use a console, this is not for you yet.

But you can ignore people. It's plain and simple: You ignore their ID, their messages get dropped. No hint whatsoever that they wrote something.

How to do that (no GUI yet):

- Get the ID of the user you would rather punch in the face than ignore *(there is only so much I can help you with)* by clicking on their name in the chat
- Open the console
- Enter this: `jetstuff.chatHelper.ignoreUser(id)` and replace `id` with the users ID in the form of `15979` instead of `15,979`.
- Press `Enter`
- Enjoy!

Unignoring is a thing, but who wants that?

    jetstuff.chatHelper.unignoreUser(id)

I plan to implement a hard ignore (like this) and a soft ignore that displays the users name, but not the message. (Maybe on mouseover? Suggestions?)

### Planned features

- Ignore users (Basics implemented. No GUI yet)
- Highlight users
- Filter ChatBot announcements
- Keep track of IDs, names
- Keep track of your tips
- Maybe some kind of import/export functionality

