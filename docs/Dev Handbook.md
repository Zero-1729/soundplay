# Dev Handbook

This document is intended to be a reference guide for new and old developers.

## Contents

- Folder Structure
- Terms
- UI/UX
- Internal Design and Workings
- Soundcloud Integration

# Folder Structure

> **Note**: The following folders and files were excluded from the listing, as their purpose should be obvious:
> 
> - `.git/`
> - `.electron-vue`
> - `node_modules` 
> - `.travis.yml`
> - `appveyor.yml`
> - `.gitignore`
> - `electron-builder.yaml`
> - `package.json`

```
.
| build/                    -> built App binaries
| dist/                     -> Webpack built App folders/content
| docs/                     -> App documentation: COC, ABOUT, CONTRIBUTING.md & Dev Handbook
| src/                      -> App source code
| | main/                   -> All main renederer code: utils and Electron main file
| | renderer/               -> Main Vue file (App.vue), utilities, Vuex store, Vue router, data files and Vue components
| | index.ejs               -> Index HTML template
| static/                   -> Themes, icons & font
| LICENSE.md                -> Repo License
| README                    -> Repo Readme
| screenshot.png            -> App screenshot
.
```

# Terms

These are words used in previous commits on all branches, comments in the code base, and elsewhere. Some of them are made up, or just popped into my head during often extending long night coding escapades.

**Session** - A session is just the term we use to describe a period which is started by launching the App to Quitting the App.

**WIP** - Work In Progress 

**edna** (or **Edna**) - Refers to a continuation of changes that are related to somme commit in the past.

**ugs** (User Given Suggestion) - As the name implies, this a suggestion given by one or more early users.

**bhu** (Behaviour Update) - Changed App behaviour. It could be in how it handles importing, playback, etc.

**inc** (Interim Necessary Change) - Any change required to build stability for other changes being made; A stability change any WIP.

**dhu** (Dev Handbook Update) - Any content update to Dev Handbook

**DnD** (Drag 'n' Drop)

**floor** - an abstract concept that refers to the end if playback, when the last track in playing queue is hit.

# Internal Design and Workings

### GetNextRandom

It first add the currentTrack (really the previous track) before the new one in the `playHistory` Array.
This insertion happens after the first track ends, since the first track previous index is -1

Essentially its as below:

if the randoms was [5, 4, 6, 3, 2, 0]

| PlayHistory | Playing |  randoms  |
|-------------|---------|-----------|
| [5, 4]      |    6    | [3, 2, 0] |

So effectively, `playHistory` + `randoms` + 1 = `filteredPool`, because there is always one playing.

## Playback

The Audio player can be controlled from the host media keys (prev, play/pause, next) or through the playback Menu Item.

#### Audio Context Change

Q) What happens if the playing track is not in the filteredPool?

A) The first track in the current (new) filteredPool is played.

## Audio playback behavaiour

Tracks that are no longer in the same path on the filesystem are skipped (then track item is dimmed). This causes the track listing to re-adjust according to the listing criteria: alphabetic and meta criteria, such as Album, Artist, Title and Genre.

###  Prev

Triggering the prev media key or Menu Item would:

> **Note**: The previous track might be skipped for example, when the file has been moved on the filesystem, or if the track item has been deleted in the playing pool in the shuffle mode which would seek to the previous track before it.

| Shuffle | Loop All | Loop Single | Behaviour |
|---------|----------|-------------|-----------|
| No      | Yes/No   | Yes/No      | Seeks to the track above the currenlty playing track, until the first track in the current view is reached. |
| Yes     | Yes/No   | Yes/No      | Seeks to the track in the player's `playHistory` Array. |

### Next

> Seek does not function when the last track in the pool is playing, you can't then seek to the first track in the pool, even in the `Loop All` mode, however, this behaviour might change in future releases.

Triggering the prev media key or Menu Item would:

> **Note**: The next track might be skipped for example, when the file has been moved on the filesystem, or if the track item has been deleted in the playing pool in the shuffle mode which would seek to the next random track after it.

| Shuffle | Loop All | Loop Single | Behaviour |
|---------|----------|-------------|-----------|
| No      | Yes/No   | Yes/No      | Seeks to the track below the currenlty playing track, until the last track in the current view is reached. |
| Yes     | Yes/No   | Yes/No      | Seeks to the track next in the player's `randoms` Array. |

## Shuffle Mode

Shuffle mode allows tracks to be randomly ordered for playback, however, this ordering if truely random (i.e. potential of track collisions exists) then it results in a poor audio experience. Nobody wants the track they just heard to be replayed again, hence, Soundplay's shuffle mode is intended to provide true shuffle behaviour: each track is only played once, and can only be played again once all the tracks in the pool have been exhausted.

### Player behaviour

The player keeps track of the indexes of the randomly ordered tracks, and remember Soundplay keeps a track of the currently playing Criteria and Target, which means, if the user were to switch to a separate criteria (and target) then the player needs to rebuild the `randoms` array. However, if the user user changes the criteria (and target) to a different one from the one playing and then back, the player rebuilds the list but excludes indexes of the tracks already played - the indexes in its `playHistory` array.

### playback behaviour

In shuffle mode, whenever the user triggers the next track the player fetches a new index from `randoms`. However, when the user triggers the previous track, the player pops the index of the previously played track in the `tmpPlayHistory` array, which only spans the last five tracks, this way we keep the possibility of collisions.

### `tmpPlayHistory` vs `playHistory`

The `tmpPlayHistory` is a temporary array that stores the indexes of the last 10 played tracks in shuffle mode, however, the `playHistory` is an array that keeps track of all played tracks in shuffle mode, and gets emptied once all tracks have been played, before then getting refilled again.

### Note on histories

Our play history is dependent on the current playing target, if it is changed then the history needs to go.

### TODO

```
Q) What happens when the `tmpPlayHistory` is exhausted from user triggering previous?

A) For now it just prevents them from going any further until new tracks are played. The real issue is trying to ensure they can trigger previous tracks but without causing the playback to appear to have collisions.
```

---

## Audio EQ

While the EQ currently lets the user select some presets, it is also possible to manually set the values. However, the preamp is currenlt not connected to the player, meaning changes its value has no effect on the audio.

> Note: The preamp would be connected to the player in the comming Beta release.

---

## Import

> **Note:** In shuffle mode, newly imported tracks are added the `randoms` array.

Soundplay allows tracks to be imported from a variety of methods and sources:

### Drag 'n' Drop

Tracks or folders containing tracks can be dropped directly on the App window to be imported.

### Menu items

The App menu items provides two options:

- **Import Tracks...** : This open the OS native folder window which allows the user to select a single or multiple tracks.

- **Import Folder** : This other option allows users to select a single or multiple folders containing tracks. The immediate folder does not necessarily need to have tracks, as Soundplay traverses the folder (including its child folders) until tracks are found.

> Is multi folder selection is enabled, and if it works

### Settings Music Folder Sync

Renember Soundplay allows users to specify a musoc folder to sync tracks from. When the `sync` button is clicked, the folder traversed down to the deepest child folder, importing each track or set of tracks included alon the way.

### Command line argument

Soundplay allows users to specify a track path (or numerous track paths) or folder path (or numerous paths) to launch soundplay with, which autoplays it after importing it - that is, if it isn't already included in the App.

E.g. on mac:

```sh
# To import and play a single track
$ /Applications/Soundplay.app/Contents/MacOS/Soundplay ~/Music/sound.mp3

# Or for multiple tracks
# Note: only the latest imported traxk would be autoplayed
$ /Applications/Soundplay.app/Contents/MacOS/Soundplay ~/Music/sound.mp3 ~/Music/sound-1.mp3 ...

# Or to import and play tracks from a folder
# Note: only the latest imported track would be autoplayed
$ /Applications/Soundplay.app/Contents/MacOS/Soundplay ~/Music/SAINt\ JHN/Collection\ One/

# Or to import and play tracks from multiple folders
# Note: only the latest imported track from the latest imported folder would be autoplayed
$ /Applications/Soundplay.app/Contents/MacOS/Soundplay ~/Music/SAINt\ JHN/Collection\ One/ ~/Music/SAINt\ JHN/Ghetto\ Lenny\'s\ Love\ Songs/

```

### Open behaviour

The first track in the folder or list selection passed by the OS (in our `startup_args` & `trigger_files` Arrays) is played if CLI launch, open with, or track file default open is used. In the future we allow the user to specify whether to play the first or last track instead.

### Drop on Icon

The users can drop a track or tracks on the App icon on the dock, and then the App launches and it imports it or them, and the latest imported one is autoplayed.
It is also possible to drop a single or multiple folders (all at once) to import their tracks, however, only the latest imported track is autoplayed.

### Open with ...

From the Native window manager the user can open supported audio files (mp3, m4a, wav & ogg) using Soundplay, by right clicking on the file and selecting it under the `Open with ...` menu item.

> **Note**: Only files can be imported this way, and not folders.

## Import Flow (simplified)

The sudo code below illustrates an overview of the steps

```
import (array_of_import_items):
    [ list of items ] # Could be a mix of folders and track paths

    log the number of single sound files

    for each item in the list above:

        is the current item folder?

        [yes]

        # Traverse (recursive decent style)
        Are there tracks here item? (^)
            [yes]

            log the number of sound files

            for track in tracks:
                import_track(track)

            [no]

            return to the (^) condition: decend_folder(item)

        [no]
    
        # Might be a track
        import_track(item)

    report warnings, warnings and successful imports


import_track (track):

    is track a valid audio file: 
    # mp3, m4a, wav or ogg

        [yes]

        attempt_import(track)

        [no]

        Record track in import errors
        log_error(track, 'Not a valid audio file')


attempt_import (track):
    is the App music store Array longer with the track?

    [yes]

    We log it as a successful import
    # Add track meta
    try:
        scrap_metadata(track)
    catch:
        # log error
        log_warn(track, 'Could not detect track metadata')

    [no]

    # Log Warning
    log_warn(track, 'Track already exists')
```

## Import Errors and Warning

| Type | Trigger     |
|------------|-------------|
| Error | Attempting to import a non audio file |
| Warn | Track does have properfly formatted metadata |
| Fail | Track already exists |

`error_imports`, `warn_imports`, and `failed_imports` are there to trigger reporting errors, warnings and failed imports, along with keep count of the suspect items.

### Fn notes

#### crawl()

Traverses entire folders and their subfolders, returning the sound files.

### Import code key info

In any software project errors should be reported faster than successful code execution, and in this case that means successful importing. It should be noted however that for software with crypto involved the fail and code success time should be equivalent to avoid timing attacks and such. Thankfully we do not yet have any crypto in the project.

Make any synchronous code blocks: i.e. `for (var i = 0) ...`

| fn | triggers |
|----|----------|
| addFiles | DnD, drop on icon, CLI args, open with ..., `Import Track(s)`, `Import Folder(s)` |
| deref | `addFiles` |

> Future: Make import flow faster.


# Soundcloud Integration


Soundplay provides support for track categorization through the following;

- Artists
- Album
- Genres
- Playlists
- Favourites

Soundcloud offers the same categorization, meaning, syncing the contents of these categories would be very easy. It would mean that, the user would be asked to sign in to their Soundcloud in the settings pane.

That would of course mean, there would be a Soundcloud `targetOption` in the `sidepane`. The pane would have a sign in field, maybe other settings option like stay 'logging in', 'sign in' (linking to the WebApp) etc. could be added as well, primarily for convenience to avoid requiring re-logging in between sessions.

Upon successful login, the App syncs the tracks in each of the categories mentioned above, creating track items with the relevant metadata. This would allow the user to seamlessly listen to both local and streamed tracks in a single category, i.e. Playlists, assuming they have access to the Internet. The streamed tracks added from Soundcloud would have a little symbol displayed when offline, to ensure the user knows they need an Internet connection to stream it.

Assuming the App player attempts to play these streamed tracks, an alert message is displayed, alerting the user that they require an internet connection, skipping the track to another track, only playing locally available track. The Soundloud settings pane we mentioned previously, could have another setting option, `Download All tracks`, etc. This would allow the entire App player to fully play all tracks in the App, all without requiring an Internet Connection.

However, the `Download All Tracks` option is a bit of a monolithic option, so to provide some more flexibility to the user, another option `Download tracks...`, which would display a list of tracks to download when next connected to the internet. An `add` option would be display above the list, which would popup a list of tracks that are streamed from Soundcloud. To make it easy for App to scrap these tracks, a `streamed` flag is added to the Track object stored by the App. The flag would have the following available values;

- `true` - This shows that the track purely a streamed track, only playable when connected to the Internet.
- `loaded` - This shows that the track is originally a streamed track, but downloaded, so can be locally loaded.
- `false` - This means it is a local file.

> **Note**: the Location of tracks downloaded from Soundcloud would be stored in a `soundcloud` folder created at the user home folder.

When this `streamed` flag is on, the track is assumed to be a track from Soundcloud. When they are downloaded offline, the flag could be set to `loaded`. The Track object would have an added `url` option, for the url of each Soundcloud track. This is what the player loads and plays from when connected to the Internet. When the `streamed` flag is set to loaded, the default `source` track value would be set to `${user_home}/soundcloud/${track name}.mp3`.

Lets consider a situation that would likely arise from using this feature, suppose the user's machine is running low on space, what do they do? Usually they would delete the tracks locally. We would include another option in the Soundcloud settings pane, `Delete All Downloaded`, which deletes all the tracks that were downloaded from Soundcloud. But as usual, a monolithic option would require a more flexible parallel option, so we also provide a `Delete Downloaded`, which would have an `add` option, that shows a popup with all (currently) Soundcloud downloaded tracks.

The tracks would simply replace the local location value stored in the `source` field of the track to `null`, then reset the `streamed` flag to `true`.

The Player currently, without the Soundcloud integration, loads local file blobs. So when a track with the `url` value set to a non `null` value, and a `streamed` flag value of `true`, the Player instead loads the track from the `url` field value.
