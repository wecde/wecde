5.3.0
=====

Changes
-------

*   Add "Desktop Mode" which ignores the viewport tag and allows for larger than screen views
*   Add "Zooming" option to Preview Webview to allow toggling of zoom
*   Volume +/- buttons now act as Up/Down arrow keys when Editor is in focus
    *   If Editor is unfocused, they behave as regular volume buttons.
*   New overwrite warning when "Import Files" imports an existing file
*   Add new Spck Bot that provides a way to quickly run custom commands
*   Improvements to JavaScript highlighting, function calls are now highlighted
*   Optimizations to editor initialization
*   Add "\_" key to Python extra keyboard

Spck Bot Features
-----------------

*   Spck Bot is currently still in development, but will be available to run custom scripts in the future
*   Spck Bot: New named Bookmarks feature, allows saving bookmarks and jumping to them
*   Spck Bot: New named Clipboard feature, allows copying to a named slot in the clipboard
*   Spck Bot: String manipulations, convert between camelCase, snake\_case, UPPER\_CASE etc.
*   Spck Bot: Precise cursor manipulation with multiple cursors without memorizing shortcuts

Fixes
-----

*   "Import Files" will now update the current editor file if overwritten
*   Fix "Next Error" command not working
*   Fix opening of files with multiple cursors from previous save point
*   Touch Keyboard arrows now work with multiple cursors
*   Fix "Go to Definition" not working until file is modified
*   Fix "Go to Definition" shortcut not working

5.2.3
=====

Fixes
-----

*   Fix editor build for older browser/Webview versions (now supports Chrome 44+)
*   Fix color picker layout problems on older Webview versions

5.2.2
=====

Changes
-------

*   Optimizations to preview side window
*   Update CSS highlighted keywords
*   New fonts, remove buggy fonts, change in font format
*   Smarter autocomplete suggestions for Javascript
*   Snippets suggestions are hidden until a partial match
*   Interface improvements
*   Missing files removed from Recent Files dialog

Fixes
-----

*   Fix autocompletion bugs in .html and .vue files inside `script` and `style` tag
*   Fix autocompletion bug with multiple cursors
*   Fix autocompletion bug with indentation and HTML tags
*   Fix autocompletion bug with triggering on Return
*   Fix Find & Replace not displaying semicolon properly
*   Fix text overflow rendering in Find & Replace
*   Fix HTML escaping in delete projects message
*   Fix Source Control cache issue when deleting files
*   Fix validation bug in CSS

5.2.1
=====

Changes
-------

*   Allow preview of markdown in side-preview layout in Tablet mode
*   Relative links & images in markdown preview now works

Fixes
-----

*   Fix side-preview layout in Tablet mode
*   Fix console button in side-preview

5.2.0
=====

Changes
-------

*   Redesign editor appearance for Mobile, Tablet, and Desktop
*   Editing: Autocomplete will not trigger when inside comments
*   Editing: Autocomplete will not trigger when pressing just 'Enter' if 0% of the word matches
*   Editing: Autocomplete insertion fixed for HTML completions starting with @, </, :, .
*   Editing: Autocomplete CSS colors now show the color inside the completer
*   Add search to Source Control section in Files menu
*   Add a local mode if editor server failed to start: no preview, editing only
*   Add multiple file uploads, and improved support for larger files in upload
*   Rename Upload File to "Import Files"
*   Optimize project delete to be faster

Fixes
-----

*   Fix text selection in editor searchbox
*   Fix git statuses not updating when project renamed
*   Improve reliability of project renaming
*   Refactoring: Fix 'Rename Symbols' functionaility

5.1.3
=====

Changes
-------

*   Make editor subscribe to git changes to files (git pull should now update current file)
*   Add React 17 + Hot-Reloading (Experimental) to list of PRO templates
*   Remove setting empty section headers when doing settings search
*   Git: Logs now have option to view Author email
*   Improved responsiveness of Extra keyboard mode changes (HTML, CSS, JS, etc.)
*   Add additonal Extra keyboard modes (Python, Java, C, C++, C#, Markdown, JSON)
*   Files with unknown Extra keyboard mode will not show Extra keyboard instead of using JS mode
*   Reduce long press delay on extra keyboard keys
*   Fix alignment on extra keyboard keys, and minor tweaks to existing key options
*   Add a button to quickly switch between preview and editor for .md and .svg files

Fixes
-----

*   Git: Fix duplicated branch names in Select Upstream prompt
*   Git: More reliable Git proxying method for Android Q+ (fixes HTTPS URL not found)
*   Git: Add Credentials Failed message when remote URL fails authorization
*   Git: Remove additional processing done to Git URLS which strip out credentials to Auth header, this was found to interfere to connecting to some git providers
*   Fix unique project name generator increment bug
*   Fix changes made < 1s of pressing Run not being instantly previewable
*   Removed .git folder from showing in file navigation
*   Fix About settings not showing up in settings search
*   Syntax highlighting of .babelrc files changed to 'text' from 'json'

5.1.2
=====

Annoucement
-----------

Spck Editor Pro is not stable on Android 11, when testing on emulator. The app will crash after launching the terminal and running the node program in the terminal. The app will remain in beta test until crashes can be fixed on Android 11 (API 30).

Changes
-------

*   Add hints/help to each setting
*   Add new setting "Top Bar Transparency" to change the appearance of the editor top bar. This may fix an issues where the top bar dissappears, or does not render when transparency is set.
*   Add new setting "Print Margin"
*   Add .cshtml (razor) support
*   Add column number to Find & Replace results
*   Tweaks to Dracula-X theme selection color
*   Improvements to Find & Replace click behavior
*   \[Ctrl + Click\] is no longer Multi-Cursor mode, use \[Ctrl + Alt + Click\] for Multi-Cursor
*   \[Ctrl + Click\] now acts as "Go to Definition"
*   Copying and Pasting reformatting now respects "Soft Tab" setting

Fixes
-----

*   Fix Find & Replace not displaying certain punctuation properly
*   Fix Find & Replace mangling output of multiple replacements on 1 line
*   Fix Find & Replace mangling order of display results on a single line

5.1.1
=====

Annoucement
-----------

Spck Editor Pro is released and is available for beta testers! You can become a beta tester for early access [here](https://play.google.com/apps/testing/io.spck.editor.node). The app will be scheduled to be released to everyone December 6, if no major issues are found.

Changes
-------

*   Remove 'Center' cursor behavior for Android devices (results in less buggy interactions with the cursor)
*   Added PRO templates, but they will not be runnable without Node (Spck Editor Pro)
*   Add Korean/German translations, improve some existing translations
*   Add Azure DevOps to list of Providers in Git Credentials (Reminder that you should use App passwords/tokens with both Read+Write Repo permissions for access to your hosted repository)
*   Add support for .mjs files
*   Fix behavior where 'Unlisted' acted as default credentials in Git. 'Unlisted' credentials will only be used if the provider is not any of the other options.
*   Update React JS (SystemJS) template to 17.0.1

5.1.0
=====

Annoucement
-----------

"Spck Editor Pro" release is delayed. It will be released around mid-late November. The development experienced issues surrounding permissions on Android 29+. Here are a few details on Spck Editor Pro:

*   Spck Editor Pro will be a premium app that will have all the features of Spck Editor
*   Spck Editor Pro will be bundled with NodeJS and can run a wide variety of Node applications as long as they satisfy Android permission requirements
*   Most newer Android versions will not have execute permissions on writable storage, therefore using sh to execute scripts is not allowed
*   For devices that are rooted to have execute permissions the above restriction does not apply
*   Node is bundled as a shared library and not as an executable, so it can only be called only from the in-app terminal and not sh
*   Templates are available for React, Vue, Svelte, TypeScript, Babel, Sass, Less
*   Free users can use free daily tokens to run the terminal, options to expand the number of daily tokens will be available in the future
*   Creation of symlinks is not allowed for filesystems that do not support it (FAT32, NTFS), which means SD cards and external storage will not allow creating symlinks (unless formatted as ext\[3/4\], but this is non-standard)
*   Global modules are stored in internal storage for the reason above

Changes
-------

*   Redesigned New Project templates dialog
*   Projects templates that do not require SystemJS can now work offline
*   Added new setting 'IME Mode', set to 'Basic' to disable IME completion
*   Added 'Dracula X' theme
*   Minor interface redesign in Tablet mode
*   File system optimizations
*   Change 'IME Mode' to 'Basic' for Chrome < 60
*   If your app has keyboard issues and changing your keyboard to Gboard does not work, you can try setting 'IME Mode' to 'Basic' which will disable completions

Bug Fixes
---------

*   Fix character duplication of deletion of quotes
*   Fix line deletion issue in special circumstance
*   Fix holding delete causes the cursor to jump to another location
*   Fix various keyboard issues around IME
*   Fix back key not responding
*   Fix opening files from filemanager
*   Increase maximum line editing limit

5.0.4
=====

Special Annoucement
-------------------

A new project is in the works at the moment, "Spck Editor Pro" is going to be a separate premium app released for Android. More details will be available in the next update, ETA expected to be mid-September.

*   Application will be 50-80 MB in download size
*   App will be able to run NodeJS (likely npm, react, vue, Angular, babel, typescript, sass, less, etc.)

Changes
-------

*   Add additional editor font size options 8px-26px
*   Add Refresh icon to Files menu
*   Minor interface changes and improvements
*   Git: Additional feature to checkout from Git Logs (checkout previous commits to new branch)
*   Git: Add new option to Checkout Commit in Git menu
*   Git: Add 'Cancel/Abort' to networking Git tasks (clone, pull, push, checkout, fetch)
*   Git: Add short commit SHA to Branches screen
*   Git: Optimize git pushing
*   Git: Add Git Reset option

Bug Fixes
---------

*   App no longer freezes when encountering an unzipping error, or cloning error
*   Fix ZIP generation problems causing corrupt ZIP
*   Fix delete project prompt closing on incorrect confirmation phrase
*   Fix External projects list not sorted by last modified date
*   Fix Git merge failure due to missing author name
*   Fix incorrect Git push count when no common ancestor is found

5.0.3
=====

Changes
-------

*   Improved JSX support highlighting
*   Improved Copy & Paste formatting logic
*   Add Documentation link in Settings tab

Bug Fixes
---------

*   Fixed ES6-ES7 Support Syntax highlighting issue

5.0.2
=====

Changes
-------

*   JSX supported in .js files
*   JS/TS Autocompletion supported in `script` tag
*   CSS Autocompletion supported in `style` tag
*   Basic support for .vue files
    *   TS/JS modes supported in `script` tag for autocomplete
    *   Pug is not supported in `template` tag
    *   SCSS/CSS/LESS supported in `style` tag
*   Extra keyboard key now changes with HTML context (inside style/script tag)
*   New file type icons
*   Editor now detects shebang lines `#!/usr/bin/env node` for files without extensions
    *   If you change the shebang line, please reopen the file to get updated syntax highlighting
    *   Detection for the following modes: bash, python, node
*   Improved marking of the default file to run
*   Add setting to change cursor style (non-blink available)

Bug Fixes
---------

*   Fix opening external files for editing (broken after 5.0 release)
*   Fix file not saving when pressing 'Run' too quickly

5.0.1
=====

Changes
-------

*   Add Download option to Export ZIP (Save ZIP directly to Downloads folder)
*   Add Refresh button to projects list (if files modified outside of app)

Bug Fixes
---------

*   Fix Projects not showing if External Storage check fails
*   Fix "Copy To" to the same project not updating file tree

5.0.0
=====

Breaking
--------

*   Root Directory of Web Server now changes with Project to accomodate for external storage
    *   '/' now refers to the project 'index.html' instead of the root of internal storage
    *   Accessing files outside of the current project is no longer supported

Changes
-------

*   Feature: Import ZIP, Git Clone, New Project now modified to accomodate setting a storage location
*   Feature: New project menu option "Move to..." to move project to external storage
*   Feature: New file menu option "Copy to..." to copy files/folders between projects
*   Feature: Ctrl+O now opens "Recently Opened/Bookmarks" dialog (also accessible from filepath context menu)
*   Feature: Add git status refresh button, statuses now cached locally for faster project load
*   Feature: Add shallow clone toggle to Git Clone dialog
*   Performance: Lazy-loaded file tree (improved performance for large projects)
*   Performance: Lazy-loaded file tree searching
*   Performance: ZIP Import/Export use WASM zlib when available
*   Performance: Faster status checks on large git repos
*   Performance: Faster rendering of large lists
*   Performance: Optimize filesystem querying
*   Performance: Add .gitignore cache for faster performance
*   Performance: Improve Android Webview crash handling
*   Change: Modifying .gitignore files will live update git status
*   Change: Increased maximum project search results to 1000
*   Change: Add TypeScript to external file recognized MIME types
*   Change: Interface improvements
*   Change: Git Auth "Default" host option renamed to "Unlisted"
*   Theme: One Dark theme highlights import/export keywords