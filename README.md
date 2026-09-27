# kol-topmenu-gcli

A small KoLmafia relay-browser helper that adds a compact **2×2 Master Relay launcher** to the upper-left menu/icon pane so you can switch the existing right-side pane between chat and gCLI without sacrificing chat width.

It is designed around KoLmafia's existing relay UI rather than replacing it:

- keeps KoLmafia's normal **`-run script-`** relay dropdown where it already lives;
- does **not** resize the root frameset or shrink the chat pane;
- does **not** claim `topmenu.ash` or `game.ash` as permanent overrides;
- uses the full existing right-side pane for chat/gCLI;
- re-injects the launcher if the top menu itself reloads during the current relay-browser session.

## Install with KoLmafia

Run this in the KoLmafia gCLI:

```text
git checkout https://github.com/donCannoli-burns/kol-topmenu-gcli main
```

Then refresh or reopen the Relay Browser.

KoLmafia should add **Master Relay** to its normal `-run script-` relay dropdown. Select **Master Relay** once to activate the launcher for the current relay-browser session.

## Manual install

Copy these two files into your KoLmafia `relay/` directory:

```text
relay_Master_Relay.ash
master_relay_launcher.js
```

Then refresh or reopen the Relay Browser and select **Master Relay** from the relay dropdown.

## Launcher layout

```text
+---+---+
| G | C |
+---+---+
| L | I |
+---+---+
```

| Button | Action |
| --- | --- |
| **G** | Opens KoLmafia's native `/cli.html` in the full existing right pane. |
| **C** | Opens `/chatlaunch.php` in the full existing right pane. |
| **L** | Returns to the previous right-pane URL. |
| **I** | Opens KoLmafia's native `/chat.html` integrated Chat / gCLI page. |

Hover over the square—or keyboard-focus one of its buttons—and its small information drawer slides out to the right. Only the launcher's overlay expands; it does not change frame dimensions.

## What it deliberately does not move

The existing KoLmafia relay-script dropdown is treated as authoritative UI. The launcher does not relocate it.

The preferred launcher position is the upper-left corner of the menu pane. If that area would overlap the existing relay dropdown, the launcher moves itself below the dropdown instead.

## Chat width is preserved

The launcher never edits KoL's root frameset, `rootset.cols`, or the `chatpane` width. Switching between Chat, gCLI, and Integrated simply changes the URL loaded into the already-existing right-side frame.

This is the main reason for the design: **gCLI becomes directly available without trading away chat-pane space.**

## Session behavior

Activation is browser-session scoped.

After selecting **Master Relay**, the launcher is installed into the top `game.php` document and watches `menupane` reloads so the 2×2 launcher can be re-injected when KoL refreshes the top menu.

A full reload/recreation of `game.php` clears that injected state. If that happens, just choose **Master Relay** from `-run script-` again.

This avoids permanently overriding `game.php` or `topmenu.php`, which makes the helper much less likely to collide with unrelated relay overrides.

## Disable without uninstalling

Select **Master Relay** from the relay dropdown again and click **Disable dock**.

That removes the browser-side launcher for the current page. It does not change KoL character/account state.

## Update

Use KoLmafia's normal Git update command:

```text
git update kol-topmenu-gcli
```

If KoLmafia identifies the checkout under a slightly different project name, `git list` will show the installed Git projects and their names.

## Uninstall

Use KoLmafia's Git manager/gCLI to remove the installed project, or manually remove these files from `relay/` if you installed them by hand:

```text
relay_Master_Relay.ash
master_relay_launcher.js
```

Refresh the Relay Browser afterward.

## Repository layout

```text
kol-topmenu-gcli/
├── LICENSE
├── README.md
├── manifest.json
└── kolmafia/
    └── relay/
        ├── relay_Master_Relay.ash
        └── master_relay_launcher.js
```

`manifest.json` declares `kolmafia/` as the KoLmafia installation root, allowing the Git checkout to place the relay files in the expected `relay/` subtree.

## Technical notes

The relay entry point is `relay_Master_Relay.ash`. KoLmafia recognizes `relay_*.ash` relay scripts and exposes them through its relay-script menu. When selected, the ASH page injects `master_relay_launcher.js` into the top relay-browser document.

The JavaScript then:

1. locates the existing named `menupane`, `chatpane`, and `mainpane` frames;
2. injects the 60×60 2×2 launcher into `menupane`;
3. detects the existing `-run script-` dropdown and avoids covering it;
4. changes only `chatpane.location.href` when **G**, **C**, **L**, or **I** is selected;
5. listens for menu-frame reloads and restores the dock while the session injection remains active.

No network service or external runtime is required beyond KoLmafia's normal Relay Browser.

## Testing checklist

After installation:

- [ ] Open the Relay Browser.
- [ ] Confirm **Master Relay** appears in `-run script-`.
- [ ] Select **Master Relay**.
- [ ] Confirm the 2×2 **G C / L I** square appears in the upper-left menu/icon pane.
- [ ] Confirm the existing relay dropdown has not moved.
- [ ] Confirm the right-side pane has not become narrower.
- [ ] Click **G** and execute a harmless gCLI command such as `version`.
- [ ] Click **C** and confirm normal chat returns in the same full-width right pane.
- [ ] Click **I** and confirm KoLmafia's integrated Chat / gCLI UI loads.
- [ ] Use **L** and confirm it returns to the previous right-pane view.
- [ ] Trigger a normal top-menu refresh and confirm the launcher reappears.
- [ ] Reload the whole Relay Browser and confirm selecting **Master Relay** again restores it.

## License

MIT. See [LICENSE](LICENSE).
