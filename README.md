# kol-topmenu-gcli

A small KoLmafia relay-browser helper that keeps **normal KoL chat in the existing right-side pane**, with an optional draggable horizontal gCLI split.

The design deliberately keeps KoLmafia's normal relay-script dropdown as the control entry point instead of adding another launcher over the top menu.

When enabled:

- the existing right-side `chatpane` stays on normal KoL chat in single-pane mode;
- no permanent integrated `/chat.html` wrapper is used;
- the outer KoL frameset is not resized;
- the existing relay-script dropdown is not moved;
- an optional **Split Chat Pane** can be enabled from Master Relay settings.

Split mode keeps normal chat on top and adds a dedicated gCLI pane on the bottom. gCLI starts at 25% of the existing right-pane height. The horizontal divider is draggable and its last height is remembered locally by the browser.

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
| **Master Relay** | Restores the right-pane page that was present before Master Relay took control. | Keeps the right pane on normal KoL chat. |
| **Split Chat Pane** | Normal chat uses the full existing right pane. | Normal chat stays on top and a dedicated gCLI pane opens on the bottom at 25% height. |

The settings are remembered in browser `localStorage`.

A complete reload of KoL's top-level `game.php` removes the injected controller because this project intentionally does **not** replace `game.php` or `topmenu.php`. Select **Master Relay** from `-run script-` again to reattach it.

## Normal chat while Relay is on

With **Master Relay = On** and **Split Chat Pane = Off**, the existing `chatpane` is held on normal chat:

```text
/chatlaunch.php
```

The project does not force KoLmafia's integrated `/chat.html` page anymore.

If some other browser action navigates the outer right-side pane away while Master Relay is on, the controller returns it to the selected managed view.

With **Master Relay = Off**, that enforcement stops and the pre-relay right-pane page is restored when available.

## Split Chat Pane

Set **Split Chat Pane = On** from the Master Relay settings page.

The right pane becomes:

```text
┌─────────────────────────────────────────┐
│              Normal Chat                │
│              /lchat.php                 │
│               ~75%                      │
├─────────────────────────────────────────┤
│             gCLI /cli.html              │
│               ~25%                      │
└─────────────────────────────────────────┘
```

The horizontal divider can be dragged vertically. The gCLI height is stored in browser `localStorage`, so reopening split mode returns to the last height you used. The first horizontal-split load defaults gCLI to 25% of the existing right-pane height.

The small divider button collapses/restores the bottom gCLI pane without disabling the setting. To return completely to normal single-pane chat, set **Split Chat Pane = Off** in Master Relay settings.

Importantly, split mode divides **only the existing right-side pane**. It does not make KoL's outer chat area wider or narrower and it does not reduce the main game pane by editing `rootset.cols`.

## Chat and gCLI surfaces

Single-pane mode uses KoL's normal `/chatlaunch.php` surface. Split mode embeds the normal chat UI directly from `/lchat.php` above KoLmafia's native `/cli.html`.

Using `/lchat.php` directly in the split avoids nesting KoLmafia's integrated `/chat.html` wrapper inside another iframe and keeps the normal chat input available.

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
3. keeps `chatpane` on `/chatlaunch.php` while Master Relay is on;
4. uses `/master_relay_split.html` instead when Split Chat Pane is on;
5. watches right-pane loads so managed mode remains permanent while enabled;
6. restores the previous right-pane URL when Master Relay is turned off;
7. stores the enabled/split settings in browser `localStorage`.

`master_relay_split.html` is a same-origin wrapper. It embeds normal KoL chat from `/lchat.php` above KoLmafia's native `/cli.html`. The bottom gCLI pane defaults to 25% height, with a vertically draggable horizontal divider and an iframe-safe drag shield.

No external service or runtime is required beyond KoLmafia's normal Relay Browser.

## Testing checklist

After installing/updating:

- [ ] Open the Relay Browser.
- [ ] Confirm **Master Relay** appears in KoLmafia's existing `-run script-` dropdown.
- [ ] Select **Master Relay** and confirm the settings page opens in `mainpane`.
- [ ] Confirm **Master Relay = On** with Split Off loads normal chat in the existing right pane, including the chat text entry box.
- [ ] Confirm the old custom G/C/L/I square is gone.
- [ ] Confirm KoLmafia's existing relay dropdown has not moved.
- [ ] Set **Split Chat Pane = On**.
- [ ] Confirm normal chat remains on top with its text entry box and dedicated gCLI appears on the bottom at about 25% height.
- [ ] Drag the horizontal divider up/down and confirm both panes resize inside the existing right pane.
- [ ] Reload split mode and confirm the saved gCLI height returns.
- [ ] Use the divider's collapse button and confirm the bottom gCLI pane slides away/restores.
- [ ] Set **Split Chat Pane = Off** and confirm full-height normal chat returns.
- [ ] Set **Master Relay = Off** and confirm the pre-relay right-pane page is restored.
- [ ] Turn Master Relay back on and confirm managed normal chat returns.
- [ ] Reload the whole Relay Browser, select **Master Relay** again, and confirm the remembered On/Off and Split settings are restored.

## License

MIT. See [LICENSE](LICENSE).
