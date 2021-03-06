# History

The insufficient variety of visually aesthetic audio players on Linux led to my discovery of [museeks](https://museeks.io), a very well designed audio player with a decent UI.

The App's inclusion of features such as gapless playback and [Play Gain](http://www.bobulous.org.uk/misc/Replay-Gain.html) were extremely appreciated, however, there were also a few issues that came with using the audio player: inter alia, the inability to easily sync audio from local music folder (at the time), and other personal preferences.

As a developer, the natural option was to build my own alternative that would satisfy all my needs - including quirky ones like having two seperate night/dark themes. Thus, Soundplay was born.

> Sidenote: The discovery of [Electron](https://electronjs.org) prompted the desire to create a bunch Apps to find out how they work. Wanting to know audio players worked was a real driving force as well.

# Purpose

This audio player aims to:

- Be asthetically pleasing
- Work well
- Easily integrate in the host machine and be easily removed (i.e. no rndom folders left behind).

The asthetical aspects of any App leave a permanent imprint on the user's mind (in this case that was me), as such, ensuring the App looked as minimalist as possible while being intutitive enough was of paramount importance. Personally, as a UI/UX designer the asthetics of an App matters quite a lot, I mean, I don't enjoy using Apps that look like they have been teleported from the 90s (unless it's VLC).

Beyond wanting eye candy, often times Apps that are asthetically pleasing are trying to compensate for their lack of functionlity. As someone who enjoys using very specific audio features, such as PlayGain, EQs, and gapless playback, no amount UI/UX can replace these features, therefore, if an App can combine both, it is a sure sell.

Soundplay, unlike certain audio players, is supposed to just recieve filepaths, and organize them into a suitable structure which can be played. At no point would it try to create wierd folders, or modify the user's filesystem in anyway.

# Design (UI)

### Side panel

[discuss logical/intuitive arrangement of buttons]

[discuss option items]

In the future, we might devise a way to collapse the side panel to give more space to the track list. To do so, we would have to collapse in a way that hides the panel, including the search panel and side buttons so that only the track listing and player header are visible.

### Media Controls

As you can probably spot there is no play/pause, next, or previous buttons as is common in other Apps, this is because Soundplay supports media keys, which means the player controls become redundant in function and frankly just takes up unnecessary space. However, for those who wish to have clickable media controls, the 'Playback' menu item contains the desired controls.

[show image]

# Features

Soundplay is supposed to contribute to the (lacking) list of visually aesthetic audio players - that work well - for a modern audience, whilst building on the rock solid foundation from previously built audio players.

Users should have a good looking App; enjoy as much flexibility as possible in terms of its use; and have create a worthwhile (listening) experience.

The few features mentioned below were designed to meet this goal.

- Cross-platform
- Intuitive UI
- formats supported: mp3, mp4, m4a/aac, flac, wav, ogg, 3gpp
- Sleep Blocker (can be toggled on/off in settings)
- Persisted app player state (player state is held even after machine slept)
- App Themes (light/night/dark)
- Auto Night Mode (night/dark)
- Night Theme change (night/dark)
- Player EQ
- Track/Folder importing
- Drag'n'Drop track and or folders (with tracks) support
- Playlists
- Auto track categorization (title, album, artist, genre)
- Player Looping (Single and All) and [(True) Shuffle](./docs/Dev%20Handbook#shuffle)
- Persisted play history (aids True shuffle)
- Album art support
- Playback rate control
- Sleep mode blocker
- Minimize to tray
- Support for media keys (prev/play/pause/next)
- Flexible 'Music' folder syncing
- Play tracks by pressing the space key on a fresh launch. (Check commit `541d2c`)
- Imported tracks added to currently playing playlist (as of commit `3e7144` v0.2.0-alpha)


# Future of Soundplay

It is no surprise at this point that companies like Apple have discontinued support for [iTunes](https://apple.com/itunes) in favour of its sister streaming service [Apple Music](https://apple.com/music). The growing popularity, majorly due to successes from platforms like Soundcloud can not be denied, further justifying the evident shift from local consumption of audio content to cloud based content. In addition, the shift is also more convenient for users as Internet access continues to penetrate areas with previously low levels therefore providing the necessary foundation for easier consumption of cloud based audio content.

Further, Soundplay was designed in a rather abstract way: the player has no concept of file location, as it loads blobs, it could also support loading urls as it uses [wavesurferjs](https://wavesurfejs.org) in the backend.

Soundplay could very trivially support the integration of Streaming platform such as [Soundcloud](https://soundcloud.io). More to that point, with some more extra modifications to the code base, support for other popular streaming platforms such as [spotify](https://spotify.com) could also be added. As such, integration of Soundcloud would seem only natural moving forward.

## Case Study: Integration of Soundcloud :sound:

The current design of the App makes it possible to play streamed music without much change to the code base, as [wavesurferjs](https://wavesurfejs.org) accepts stream urls to play. This neat feature coupled with the categorization below

- Artists
- Album
- Genres
- Playlists
- Favourites

allows us to easily integrate Soundcloud which offers the same categorization. In theory syncing the contents of these categories would be very easy. 

To integrate a user's Soundcloud account, they would be asked to sign in to their Soundcloud in the settings pane. Upon successful login, the App syncs the tracks in each of the categories mentioned above, creating track items with the relevant metadata. This would allow the user to seamlessly listen to both local and streamed tracks in a single category, i.e. Playlists - assuming they have access to the Internet.

The streamed tracks added from Soundcloud would have a little symbol displayed when offline, to ensure the user knows they need Internet connection to stream it.

Assuming the App player attempts to play these streamed tracks, an alert message could be displayed, alerting the user that they require an internet connection, skipping the track playback and instead moving on to playing locally available tracks.

We could provide a `Download All Tracks` or `Download Tracks ...` option in the settings for those who would like to enjoy all their tracks offline.
