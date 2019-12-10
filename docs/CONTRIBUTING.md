## Contributing [DRAFT]

> Soundplay is always open and welcoming to any and all changes from new (and old) contributors.

This document is intended to guide you through the process.

> **Tip**: An excellent place to start is to check out the project [Code of Conduct (`COC`)](https://github.com/Zero-1729/soundplay/docs/coc.md), if you haven't already, before contributing.
>
> **Note**: If you need any further clarification post your question(s) on [Reddit](http://www.reddit.com/r/soundplay).

At this point it should be noted that discussions about code base improvements happen in GitHub issues or in pull requests (i.e. when [bikeshedding]()).

### Coding Style

To make everyone's job easier, here are some coding style guidelines intended to streamline development of both readable and editable code;

- We use Tabs (4 spaces).
- Short lines; Soft limit 80, hard limit 120.
- No trailing whitespaces.
- `\n` for line-break.
- Single `\n` at the end of the file; for Atom users this done automatically.

There are two ways a user/dev can contribute to the project, through `PR`s and creating issues.

### Reporting Issues

This allows users and devs to discuss possible feature enhancements, report bugs & plan other changes to the App. It should also be used to report spelling mistakes or any other improvements (grammar or otherwise) to the docs (including the `README.md`).

#### Feature Enhancements

Any user or dev can open up an issue if they feel they have a (useful) feature request that would benefit a majority of App stakeholders. With that being said, the project maintainer(s) would label such issues `enhancement` to make it easier for those who want to work on them: if a dev wants to work on an enhancement, they could simply search for issues labeled `enhancement` and work on it.

#### Bug Reports

Without users/devs constantly (painstakingly) reporting bugs, the App would eventually become un-useable. As such, bug reports form a very helpful foundation for the overall stability of the App.

To report a bug, you are expected to open an issue with the category related to bug in the title, along with a short description. The body should be broken down into three parts: the first describes how to reproduce the bug; the second describes the expected behavior; and the last part is an optional bit, where a possible solution is proposed.

Below is a sample bug report for commit `10628759d30608a93d8fbdbdcc30a2b6bb257ae1`

**Title**
```
gui: Player cursor color reset when app theme changed
```

**Body**
```
The player cursor color seems to keep resetting to black in the `night` theme, whenever the App theme is changed.

Steps to reproduce:

- Launch the App.
- Start playing any track.
- Change to the `night` theme.
- Then proceed to trigger window reload with the shortcut `CmdOrCtrl+R`, or click `Reload` in the `View` Menu Item.
- Play any track.

Expected behavior:

Reloading the window after theme change shouldn't affect the Cursor color. It should still stay 'dodgerblue', instead of changing to black.

Possible fixes:

From digging through the source code, it looks like the cursor color is misspelled `dogerblue` instead of `dodgerblue` in the `src/renderer/data/wavecolors.json` file.

```

Issues related to bugs would be labeled `bug`.

## Pull Requests

In general, a pull request should have a clearly stated use case: to fix a demonstrable bug; add a (new) feature or for code refactoring; to increase modularization for example, but not do all at once.

### PR Workflow

To contribute your changes

- Fork the repository
- Create topic branch, e.g. `gui: redesigned EQ`.
- Commit changes

Contributors are expected to follow all the guidelines this document before attempting to contribute.

### Features

All members of the community would likely have numerous feature additions, however, features that fail to capture a reasonable amount of support or are deemed niche - affecting only a small group - would not be included.

### Refactoring

As the JS community continues to grow, we would be required to refactor the code, also, as the project evolves maintenance would demand refactoring from time to time. These refactoring changes are one of the following:

- Code re-organization: moving code chunks in files.
- Code style updates
- Project folder (re-)organization

It is generally advised that refactoring changes only contain no more than any two of the above change types. Code refactoring should not be made too complex, so project maintainers can easily review the changes and merge it.

New contributors should avoid trivial pull requests that make any unnecessary code changes with no clear benefit, as they would immediately be closed by the project maintainers as irrelevant.

### Decision Flow

The final decision to merge code rests with the project maintainers and ultimately the project lead. Generally, project maintainers check whether pull requests meets the general principles of the project, followed by assessing the consensus amongst other contributors on the proposed change before it is finally merged.

For those who feel they have a possible fix for a bug - whether it be one related to an existing or nonexistent issue or set of issues - they may proceed to opening a new PR.

First, it should be noted that bug fixes are the only pull requests that get merged to the `master` branch. To avoid sacrificing the stability of the `master`, any feature additions would go to an appropriate branch, or just the `dev` branch, then when properly tested would be merged into the `master` branch.

Further, it is possible that a bug or bugs could be caused by one of the numerous dependencies of the App. If that is the case, then an appropriate action would be to open an issue, to make others aware of this. However, if a you have a fix, you should open a PR on the project's repo, as it is an issue with their project. One should only open a PR if the conflicting code is from this project, or can be fixed by upgrading the decencies

### PR structure

To make contributing as smooth as possible, PRs and issues should be prefixed with one of the categories below in the title, to make sorting through and working on changes really easy.

- `gui` / `ui` : for anything related to the visual part of the App.
- `utils`: Any change that affects the modules in the utilities folder, `src/renderer/utils` or `src/main/utils`.
- `docs`: Any change that affects the App's Documentation. E.g. `README.md`, `docs/CONTRIBUTING.md`, etc.
- `player`: Any code that affects the App's Player or EQ.
- `tests`: Any test related code.

A PR should be titled accordingly;

`category: brief info`

E.g:

```
gui: Fix for Wavesurfer cursor color
```

### Commits

If your pull is in response to a particular issue, ensure you reference it in the commits, e.g. `refs #2194`, `closes #2194` or `fixes #2194`. This allows GitHub automatically close the issue when the PR is merged.

Commit messages should be kept short (50 chars max), with a blank line to separate any additional explanations as separate paragraph(s), this should be done only if the title alone is not self-explanatory (E.g. "Updated `App.vue`"). A good rule of thumb is to ensure commit messages are clear, so people reading it in the future would find it easy to comprehend the change(s).

Also, please avoid pushing [super commits]() - commits with numerous changes - instead they should be atomic: only changing a very specific aspect of the App.

#### Squashing Commits

Although super commits are discouraged, PRs would undoubtably require changes as other contributors chip in, or additional changes are required. Nevertheless, any of the project maintainers may still ask that you *squash* and or *rebase* your commits before it is merged, so that the '*no super commits*' rule is followed.

To provide more clarity on how to do this, below is a simple squash workflow:

```sh
git checkout your_branch_name

# 'n' - the number of commits in the pull request.
git rebase -i HEAD~n

# Set commits (except the one in the first line) from 'pick' to 'squash', save and quit.
# On the next screen, edit/refine commit messages.
# Save and quit.

git push -f # (force push to GitHub)
```

> **Note**: Ensure your commit message is appropriately renamed if necessary to should read as a coherent message. In most cases this means that you should not just list the interim commits.

As a new contributor, the process might seem daunting, so to make it easier you can enable "*Allow edits from maintainers*" on the sidebar located on the left and ask for help in the PR.

New contributors should also avoid opening numerous pull requests with the same change, instead you can just include any additional changes in the existing pull request. This is intended to make discussions, and reviews of the PR easier for both you and maintainers/contributors.

Lastly, as a new contributor, you should note that sometimes responses from maintainers/contributors may not be prompt. In such cases ensure you exercise patience, as they may be busy or away from their machines - remember, devs have lives also.

### Forks

Feel free fork the repo and create your own version of the App, assuming the vision of the maintainer(s) no longer aligns with yours. If not then just open up a PR.

### Branches

New features could sometimes require their own separate branch, to properly test it before merging into `master`. Additionally, each new target release starts off with its own branch. So assuming the target release is `v0.5.0`, a new branch with the title `v0.5.0` would be created, then later merged into `master` and tagged `v0.5.0`.

### Testing

[**Issue tracker**] : https://github.com/Zero-1729/soundplay/issues <br>
[**IRC**] : http://freenode.net/?channels=soundplay <br>
[**Project maintainers**]: https://github.com/Zero-1729/soundplay/wiki/Project-Organization
