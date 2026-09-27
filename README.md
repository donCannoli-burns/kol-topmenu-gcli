# kol-topmenu-gcli

A small KoLmafia relay-browser helper that keeps KoLmafia's **integrated Chat / gCLI interface permanently in the existing right-side pane while Master Relay is on**.

The design deliberately keeps KoLmafia's normal relay-script dropdown as the control entry point instead of adding another launcher over the top menu.

When enabled:

- the existing right-side `chatpane` is kept on KoLmafia's native `/chat.html` integrated interface;
- KoLmafia's own small **Chat / gCLI** controls at the top of that interface remain the primary way to revolve between those views;
- the outer KoL frameset is not resized;
- the existing relay-script dropdown is not moved;
- an optional **Split Chat Pane** can be enabled from Master Relay settings.

Split mode keeps the integrated Chat / gCLI interface on the left and adds a second live chat pane on the right. The divider is draggable and its width is remembered locally by the browser.

## Install with KoLmafia

Run this in the KoLmafia gCLI:

```text
git checkout https://github.com/donCannoli-burns/kol-topmenu-gcli main
```

Then refresh or reopen the Relay Browser.

KoLmafia should add **Master Relay** to its normal `-run script-` relay dropdown. Select **Master Relay** to open its settings/control page.

## Controls

The Master Relay page contains two simple drop-down controls:

| Setting | Off | On |
| --- | --- | --- |
| **Master Relay** | Restores the right-pane page that was present before Master Relay took control. | Keeps the right pane on KoLmafia's native integrated Chat / gCLI interface. |
| **Split Chat Pane** | Integrated Chat / gCLI uses the full existing right pane. | Integrated Chat / gCLI stays on the left and an additional live chat pane slides in on the right. |

The settings are remembered in browser `localStorage`.

A complete reload of KoL's top-level `game.php` removes the injected controller because this project intentionally does **not** replace `game.php` or `topmenu.php`. Select **Master Relay** from `-run script-` again to reattach it.

## Permanent integrated mode while Relay is on

This project now uses KoLmafia's own integrated page rather than drawing a separate G/C/L/I launcher.

With **Master Relay = On**, the existing `chatpane` is held on:

```text
/chat.html
```

That is KoLmafia's native integrated Chat / gCLI interface, including its small top controls for switching between the two views.

If some other browser action navigates the outer right-side pane away while Master Relay is on, the controller returns it to the selected managed view.

With **Master Relay = Off**, that enforcement stops and the pre-relay right-pane page is restored when available.

## Split Chat Pane

Set **Split Chat Pane = On** from the Master Relay settings page.

The right pane becomes:

```text
┌──────────────────────┬─┬─────────────────┐
│ Integrated Chat/gCLI │↔│ Persistent Chat │
│      /chat.html      │ │    /lchat.php   │
└──────────────────────┴─┴─────────────────┘
```

The center divider can be dragged horizontally. The split ratio is stored in browser `localStorage`, so reopening split mode returns to the last width you used.

The small divider button collapses/restores the extra chat pane without disabling the setting. To return completely to normal single-pane integrated mode, set **Split Chat Pane = Off** in Master Relay settings.

Importantly, split mode divides **only the existing right-side pane**. It does not make KoL's outer chat area wider or narrower and it does not reduce the main game pane by editing `rootset.cols`.

## Why `/chat.html` is the authority

KoLmafia already ships an integrated Chat / gCLI page. This project uses that existing UI rather than recreating its command console or chat logic.

That means the project only manages which page lives in `chatpane`; KoLmafia remains responsible for the actual Chat/gCLI interface and command submission behavior.

## Manual install

Copy these files into your KoLmafia `relay/` directory:

```text
relay_Master_Relay.ash
master_relay_launcher.js
master_relay_split.html
```

Then refresh or reopen the Relay Browser and select **Master Relay** from KoLmafia's relay dropdown.

## Update

Use KoLmafia's normal Git update command:

```text
git update kol-topmenu-gcli
```

If KoLmafia identifies the checkout under a different project name, `git list` will show the installed Git projects and their names.

## Uninstall

Use KoLmafia's Git manager/gCLI to remove the installed project, or manually remove these files from `relay/` if you installed them by hand:

```text
relay_Master_Relay.ash
master_relay_launcher.js
master_relay_split.html
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
        ├── master_relay_launcher.js
        └── master_relay_split.html
```

`manifest.json` declares `kolmafia/` as the KoLmafia installation root, so KoLmafia's Git checkout places the three runtime files into `relay/`.

## Technical behavior

`relay_Master_Relay.ash` is the relay-menu entry point and settings page. On load it attaches `master_relay_launcher.js` to the top Relay Browser document.

The controller:

1. finds the existing named `chatpane` and `mainpane` frames;
2. remembers the current right-pane URL before taking control;
3. keeps `chatpane` on `/chat.html` while Master Relay is on;
4. uses `/master_relay_split.html` instead when Split Chat Pane is on;
5. watches right-pane loads so managed mode remains permanent while enabled;
6. restores the previous right-pane URL when Master Relay is turned off;
7. stores the enabled/split settings in browser `localStorage`.

`master_relay_split.html` is a same-origin wrapper. It embeds KoLmafia's native `/chat.html` on the left and `/lchat.php` on the right, with a draggable divider and an iframe-safe drag shield.

No external service or runtime is required beyond KoLmafia's normal Relay Browser.

## Testing checklist

After installing/updating:

- [ ] Open the Relay Browser.
- [ ] Confirm **Master Relay** appears in KoLmafia's existing `-run script-` dropdown.
- [ ] Select **Master Relay** and confirm the settings page opens in `mainpane`.
- [ ] Confirm **Master Relay = On** loads KoLmafia's native integrated `/chat.html` in the existing right pane.
- [ ] Confirm the native small **Chat / gCLI** controls work repeatedly without changing the outer pane width.
- [ ] Confirm the old custom G/C/L/I square is gone.
- [ ] Confirm KoLmafia's existing relay dropdown has not moved.
- [ ] Set **Split Chat Pane = On**.
- [ ] Confirm integrated Chat/gCLI remains on the left and a second live chat appears on the right.
- [ ] Drag the divider and confirm both panes resize inside the existing right pane.
- [ ] Reload split mode and confirm the saved divider position returns.
- [ ] Use the divider's collapse button and confirm the extra chat slides away/restores.
- [ ] Set **Split Chat Pane = Off** and confirm full-width integrated mode returns.
- [ ] Set **Master Relay = Off** and confirm the pre-relay right-pane page is restored.
- [ ] Turn Master Relay back on and confirm managed integrated mode returns.
- [ ] Reload the whole Relay Browser, select **Master Relay** again, and confirm the remembered On/Off and Split settings are restored.

## License

MIT. See [LICENSE](LICENSE).
