/*
    SPDX-FileCopyrightText: 2024 Lukas Erhard <luerhard@googlemail.com>

    SPDX-License-Identifier: GPL-2.0-or-later
*/
class WalkThroughDesktopsShortcut {

    constructor() {

        this.prev_desktops = [];

        this.delay = 600;
        this.last_trigger = 0;

        this.buffer = "";
        this.index = 1;
        this.lock = false;

        workspace.currentDesktopChanged.connect(desktop => {
            if (!this.lock) {
                this.push_desktop_on_stack(desktop.id);
            }
        });

        registerShortcut("Walk Through Last Used Desktops", "Walk Through Last Used Desktops", "Meta+Tab", () => {

            this.lock = false;

            const cur_desktop = workspace.currentDesktop.id;
            const is_continue = this.is_continue();
            console.info("continue: " + is_continue);

            if (is_continue) {
                if (this.index < this.prev_desktops.length) {
                    this.index = this.index + 1;
                }
                this.lock = true;
            } else {
                this.index = 1;
                if (this.buffer != "") {
                    this.push_desktop_on_stack(this.buffer);
                }
            }

            let switch_to = this.prev_desktops[this.prev_desktops.length - this.index];
            if (cur_desktop == switch_to) {
                if (this.index < this.prev_desktops.length) {
                    this.index = this.index + 1;
                }
                switch_to = this.prev_desktops[this.prev_desktops.length - this.index];
            }

            this.change_desktop(switch_to);
            this.buffer = switch_to;

            this.lock = false;

        });

    }

    is_continue() {
        let now = Date.now();
        if ((now - this.last_trigger) < this.delay) {
            this.last_trigger = now;
            return true;
        } else {
            this.last_trigger = now;
            return false;
        }
    }

    push_desktop_on_stack(desktop_id) {
        if (this.prev_desktops[this.prev_desktops.length - 1] != desktop_id) {
            let index = this.prev_desktops.indexOf(desktop_id);
            if (index != -1) {
                this.prev_desktops.splice(index, 1);
            }
            if (typeof desktop_id !== "undefined") {
                console.info("Pushing " + desktop_id);
                this.prev_desktops.push(desktop_id);
            }
        }
    }

    change_desktop(desktop_id) {
        if (typeof desktop_id === "undefined") {
            return false;
        }
        console.info("changing desktop to: " + desktop_id);
        for (const desktop of workspace.desktops) {
            if (desktop.id == desktop_id) {
                workspace.currentDesktop = desktop;
                break;
            }
        }
    }
}

new WalkThroughDesktopsShortcut();

// journalctl -g "js:" -f
