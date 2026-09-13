/* =========================================================
   DASHBOARD - SillyTavern Extension
   ========================================================= */

let dashboardOverlay = null;
let initialized = false;
let clockTimer = null;


/* =========================================================
   GET USER NAME
   ========================================================= */

function getUserName() {
    try {
        const context = window.SillyTavern?.getContext?.();

        if (context?.name1) {
            return String(context.name1).trim();
        }
    } catch (e) {}

    try {
        const nameInput = document.querySelector('#name1');

        if (nameInput?.value) {
            return nameInput.value.trim();
        }
    } catch (e) {}

    return 'User';
}


/* =========================================================
   GET USER AVATAR
   ========================================================= */

function getUserAvatar() {

    const selectors = [
        '#user_avatar img',
        '#user_avatar',
        '.persona_avatar img',
        '.persona-avatar img'
    ];

    for (const selector of selectors) {

        try {

            const el =
                document.querySelector(selector);

            if (!el) continue;

            if (el.tagName === 'IMG' && el.src) {
                return el.src;
            }

            const img =
                el.querySelector?.('img');

            if (img?.src) {
                return img.src;
            }

            const bg =
                getComputedStyle(el).backgroundImage;

            if (
                bg &&
                bg !== 'none'
            ) {
                return bg
                    .replace(/^url\(["']?/, '')
                    .replace(/["']?\)$/, '');
            }

        } catch (e) {}
    }

    return '';
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(text) {

    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

}


/* =========================================================
   CREATE DASHBOARD
   ========================================================= */

function createDashboard() {

    if (dashboardOverlay) {
        return dashboardOverlay;
    }

    const name = getUserName();
    const avatar = getUserAvatar();

    dashboardOverlay =
        document.createElement('div');

    dashboardOverlay.id =
        'dashboard-overlay';

    dashboardOverlay.innerHTML = `

        <div class="dashboard-shell">

            <!-- HEADER -->

            <header class="dashboard-topbar">

                <div class="dashboard-brand">

                    <div class="dashboard-brand-small">
                        PERSONAL SPACE
                    </div>

                    <div class="dashboard-brand-title">
                        DASHBOARD
                    </div>

                </div>


                <div class="dashboard-top-right">

                    <div class="dashboard-clock">

                        <div
                            class="dashboard-time"
                            data-dashboard-clock>
                            --:--
                        </div>

                        <div
                            class="dashboard-date"
                            data-dashboard-date>
                            ---
                        </div>

                    </div>


                    <button
                        type="button"
                        class="dashboard-close"
                        data-dashboard-close
                    >
                        ×
                    </button>

                </div>

            </header>


            <!-- NAVIGATION -->

            <div class="dashboard-navigation">

                <select
                    class="dashboard-page-select"
                    data-dashboard-page-select
                >

                    <option value="home">
                        Home
                    </option>

                    <option value="account">
                        Account
                    </option>

                    <option value="bank">
                        Bank
                    </option>

                    <option value="messages">
                        Messages
                    </option>

                    <option value="schedule">
                        Schedule
                    </option>

                    <option value="notes">
                        Notes
                    </option>

                    <option value="files">
                        Files
                    </option>

                    <option value="settings">
                        Settings
                    </option>

                </select>

            </div>


            <!-- CONTENT -->

            <main class="dashboard-content">


                <!-- HOME -->

                <section
                    class="dashboard-page active"
                    data-dashboard-page="home"
                >

                    <div class="dashboard-welcome">

                        <div class="dashboard-eyebrow">
                            WELCOME BACK
                        </div>

                        <h1>
                            Hello,
                            <span data-dashboard-user-name>
                                ${escapeHTML(name)}
                            </span>
                        </h1>

                        <p>
                            Your personal dashboard
                        </p>

                    </div>


                    <div class="dashboard-grid">


                        <!-- ACCOUNT -->

                        <section
                            class="dashboard-card dashboard-account-card"
                        >

                            <div class="dashboard-card-header">

                                <div
                                    class="dashboard-card-label"
                                >
                                    ACCOUNT
                                </div>


                                <div
                                    class="dashboard-profile-avatar"
                                >

                                    ${
                                        avatar
                                        ? `
                                            <img
                                                src="${escapeHTML(avatar)}"
                                                data-dashboard-avatar
                                                alt=""
                                            >
                                        `
                                        : `
                                            <div
                                                class="dashboard-avatar-letter"
                                                data-dashboard-avatar-letter
                                            >
                                                ${escapeHTML(
                                                    name
                                                        .charAt(0)
                                                        .toUpperCase()
                                                )}
                                            </div>
                                        `
                                    }

                                </div>

                            </div>


                            <div
                                class="dashboard-account-name"
                                data-dashboard-user-name
                            >
                                ${escapeHTML(name)}
                            </div>


                            <div
                                class="dashboard-account-edit"
                            >

                                <textarea
                                    id="dashboard-bio"
                                    placeholder="Write something about yourself..."
                                ></textarea>


                                <button
                                    type="button"
                                    id="dashboard-save-bio"
                                    class="dashboard-save-button"
                                >
                                    Save
                                </button>

                            </div>

                        </section>


                        <!-- BANK -->

                        <section class="dashboard-card">

                            <div class="dashboard-card-label">
                                BANK
                            </div>

                            <div class="dashboard-big-number">
                                ฿ 0.00
                            </div>

                            <div class="dashboard-muted">
                                Available balance
                            </div>

                        </section>


                        <!-- SCHEDULE -->

                        <section class="dashboard-card">

                            <div class="dashboard-card-label">
                                SCHEDULE
                            </div>

                            <div class="dashboard-calendar-number">
                                ${new Date().getDate()}
                            </div>

                            <div class="dashboard-muted">
                                ${new Date().toLocaleDateString(
                                    'en-US',
                                    {
                                        month: 'long',
                                        year: 'numeric'
                                    }
                                )}
                            </div>

                        </section>


                        <!-- MESSAGES -->

                        <section class="dashboard-card">

                            <div class="dashboard-card-label">
                                MESSAGES
                            </div>

                            <div class="dashboard-big-number">
                                0
                            </div>

                            <div class="dashboard-muted">
                                Unread messages
                            </div>

                        </section>


                        <!-- TASKS -->

                        <section class="dashboard-card">

                            <div class="dashboard-card-label">
                                TASKS
                            </div>

                            <div class="dashboard-big-number">
                                0
                            </div>

                            <div class="dashboard-muted">
                                Pending tasks
                            </div>

                        </section>


                        <!-- NOTE -->

                        <section class="dashboard-card">

                            <div class="dashboard-card-label">
                                QUICK NOTE
                            </div>

                            <div class="dashboard-note-preview">
                                Nothing here yet.
                            </div>

                        </section>


                    </div>

                </section>


                <!-- ACCOUNT -->

                <section
                    class="dashboard-page"
                    data-dashboard-page="account"
                >

                    <div class="dashboard-page-heading">

                        <div class="dashboard-eyebrow">
                            PROFILE
                        </div>

                        <h2>
                            Account
                        </h2>

                    </div>


                    <div class="dashboard-large-profile">

                        <div
                            class="dashboard-large-avatar"
                        >

                            ${
                                avatar
                                ? `
                                    <img
                                        src="${escapeHTML(avatar)}"
                                        data-dashboard-large-avatar
                                        alt=""
                                    >
                                `
                                : `
                                    <div
                                        class="dashboard-avatar-letter large"
                                    >
                                        ${escapeHTML(
                                            name
                                                .charAt(0)
                                                .toUpperCase()
                                        )}
                                    </div>
                                `
                            }

                        </div>


                        <div
                            class="dashboard-large-profile-info"
                        >

                            <div class="dashboard-card-label">
                                ACCOUNT
                            </div>

                            <h2 data-dashboard-user-name>
                                ${escapeHTML(name)}
                            </h2>


                            <textarea
                                id="dashboard-bio-large"
                                placeholder="Write something about yourself..."
                            ></textarea>


                            <button
                                type="button"
                                class="dashboard-save-button"
                                id="dashboard-save-large"
                            >
                                Save
                            </button>

                        </div>

                    </div>

                </section>


                <!-- BANK -->

                <section
                    class="dashboard-page"
                    data-dashboard-page="bank"
                >

                    <div class="dashboard-page-heading">

                        <div class="dashboard-eyebrow">
                            FINANCE
                        </div>

                        <h2>
                            Bank
                        </h2>

                    </div>

                    <div class="dashboard-empty-card">
                        No bank data yet.
                    </div>

                </section>


                <!-- MESSAGES -->

                <section
                    class="dashboard-page"
                    data-dashboard-page="messages"
                >

                    <div class="dashboard-page-heading">

                        <div class="dashboard-eyebrow">
                            COMMUNICATION
                        </div>

                        <h2>
                            Messages
                        </h2>

                    </div>

                    <div class="dashboard-empty-card">
                        No messages yet.
                    </div>

                </section>


                <!-- SCHEDULE -->

                <section
                    class="dashboard-page"
                    data-dashboard-page="schedule"
                >

                    <div class="dashboard-page-heading">

                        <div class="dashboard-eyebrow">
                            CALENDAR
                        </div>

                        <h2>
                            Schedule
                        </h2>

                    </div>

                    <div class="dashboard-empty-card">
                        No scheduled events.
                    </div>

                </section>


                <!-- NOTES -->

                <section
                    class="dashboard-page"
                    data-dashboard-page="notes"
                >

                    <div class="dashboard-page-heading">

                        <div class="dashboard-eyebrow">
                            PERSONAL
                        </div>

                        <h2>
                            Notes
                        </h2>

                    </div>

                    <div class="dashboard-empty-card">
                        No notes yet.
                    </div>

                </section>


                <!-- FILES -->

                <section
                    class="dashboard-page"
                    data-dashboard-page="files"
                >

                    <div class="dashboard-page-heading">

                        <div class="dashboard-eyebrow">
                            STORAGE
                        </div>

                        <h2>
                            Files
                        </h2>

                    </div>

                    <div class="dashboard-empty-card">
                        No files yet.
                    </div>

                </section>


                <!-- SETTINGS -->

                <section
                    class="dashboard-page"
                    data-dashboard-page="settings"
                >

                    <div class="dashboard-page-heading">

                        <div class="dashboard-eyebrow">
                            SYSTEM
                        </div>

                        <h2>
                            Settings
                        </h2>

                    </div>

                    <div class="dashboard-empty-card">
                        Dashboard settings will appear here.
                    </div>

                </section>


            </main>


            <footer class="dashboard-footer">

                <span>
                    DASHBOARD
                </span>

                <span>
                    PERSONAL SPACE
                </span>

            </footer>

        </div>
    `;


    document.body.appendChild(
        dashboardOverlay
    );


    setupDashboardEvents();

    loadBio();

    updateClock();

    if (clockTimer) {
        clearInterval(clockTimer);
    }

    clockTimer = setInterval(
        updateClock,
        1000
    );


    return dashboardOverlay;
}


/* =========================================================
   EVENTS
   ========================================================= */

function setupDashboardEvents() {

    if (!dashboardOverlay) return;


    /* CLOSE */

    dashboardOverlay
        .querySelector(
            '[data-dashboard-close]'
        )
        ?.addEventListener(
            'click',
            closeDashboard
        );


    /* PAGE SELECT */

    dashboardOverlay
        .querySelector(
            '[data-dashboard-page-select]'
        )
        ?.addEventListener(
            'change',
            event => {

                const page =
                    event.target.value;

                dashboardOverlay
                    .querySelectorAll(
                        '[data-dashboard-page]'
                    )
                    .forEach(section => {

                        section.classList.toggle(
                            'active',
                            section.dataset.dashboardPage === page
                        );

                    });

            }
        );


    /* SAVE BIO */

    dashboardOverlay
        .querySelector(
            '#dashboard-save-bio'
        )
        ?.addEventListener(
            'click',
            () => {

                const textarea =
                    dashboardOverlay.querySelector(
                        '#dashboard-bio'
                    );

                if (!textarea) return;

                saveBio(
                    textarea.value
                );

                showSaved(
                    '#dashboard-save-bio'
                );

            }
        );


    /* SAVE LARGE BIO */

    dashboardOverlay
        .querySelector(
            '#dashboard-save-large'
        )
        ?.addEventListener(
            'click',
            () => {

                const textarea =
                    dashboardOverlay.querySelector(
                        '#dashboard-bio-large'
                    );

                if (!textarea) return;

                saveBio(
                    textarea.value
                );

                const small =
                    dashboardOverlay.querySelector(
                        '#dashboard-bio'
                    );

                if (small) {
                    small.value =
                        textarea.value;
                }

                showSaved(
                    '#dashboard-save-large'
                );

            }
        );


    /* SYNC BIO FIELDS */

    const small =
        dashboardOverlay.querySelector(
            '#dashboard-bio'
        );

    const large =
        dashboardOverlay.querySelector(
            '#dashboard-bio-large'
        );


    small?.addEventListener(
        'input',
        () => {

            if (large) {
                large.value =
                    small.value;
            }

        }
    );


    large?.addEventListener(
        'input',
        () => {

            if (small) {
                small.value =
                    large.value;
            }

        }
    );

}


/* =========================================================
   BIO STORAGE
   ========================================================= */

function saveBio(value) {

    try {

        localStorage.setItem(
            'dashboard_persona_bio',
            value
        );

    } catch (e) {}

}


function loadBio() {

    if (!dashboardOverlay) return;

    let value = '';

    try {

        value =
            localStorage.getItem(
                'dashboard_persona_bio'
            ) || '';

    } catch (e) {}


    const small =
        dashboardOverlay.querySelector(
            '#dashboard-bio'
        );

    const large =
        dashboardOverlay.querySelector(
            '#dashboard-bio-large'
        );


    if (small) {
        small.value = value;
    }

    if (large) {
        large.value = value;
    }

}


/* =========================================================
   SAVED MESSAGE
   ========================================================= */

function showSaved(selector) {

    const button =
        dashboardOverlay?.querySelector(
            selector
        );

    if (!button) return;

    const old =
        button.textContent;

    button.textContent =
        'Saved ✓';

    setTimeout(
        () => {
            button.textContent =
                old;
        },
        1200
    );

}


/* =========================================================
   CLOCK
   ========================================================= */

function updateClock() {

    if (!dashboardOverlay) return;

    const now =
        new Date();


    const clock =
        dashboardOverlay.querySelector(
            '[data-dashboard-clock]'
        );

    const date =
        dashboardOverlay.querySelector(
            '[data-dashboard-date]'
        );


    if (clock) {

        clock.textContent =
            now.toLocaleTimeString(
                'th-TH',
                {
                    hour: '2-digit',
                    minute: '2-digit'
                }
            );

    }


    if (date) {

        date.textContent =
            now.toLocaleDateString(
                'th-TH',
                {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                }
            );

    }

}


/* =========================================================
   OPEN
   ========================================================= */

async function openDashboard() {

    if (!dashboardOverlay) {
        createDashboard();
    }

    if (!dashboardOverlay) {
        return;
    }


    dashboardOverlay.classList.add(
        'is-open'
    );


    /* Update user every time dashboard opens */

    const name =
        getUserName();

    dashboardOverlay
        .querySelectorAll(
            '[data-dashboard-user-name]'
        )
        .forEach(el => {

            el.textContent =
                name;

        });


    /* Fullscreen */

    try {

        if (
            !document.fullscreenElement &&
            document.documentElement.requestFullscreen
        ) {

            await document
                .documentElement
                .requestFullscreen();

        }

    } catch (e) {}

}


/* =========================================================
   CLOSE
   ========================================================= */

async function closeDashboard() {

    if (!dashboardOverlay) return;

    dashboardOverlay.classList.remove(
        'is-open'
    );


    try {

        if (
            document.fullscreenElement &&
            document.exitFullscreen
        ) {

            await document.exitFullscreen();

        }

    } catch (e) {}

}


/* =========================================================
   MENU ITEM
   ========================================================= */

function createMenuItem() {

    const options =
        document.querySelector(
            '#options'
        );

    if (!options) {
        return false;
    }


    if (
        document.querySelector(
            '#dashboard-menu-item'
        )
    ) {
        return true;
    }


    const item =
        document.createElement('div');


    item.id =
        'dashboard-menu-item';


    item.className =
        'list-group-item flex-container flexGap5';


    item.setAttribute(
        'role',
        'button'
    );


    item.setAttribute(
        'tabindex',
        '0'
    );


    item.innerHTML = `
        <i class="fa-solid fa-table-columns"></i>
        <span>Dashboard</span>
    `;


    item.addEventListener(
        'click',
        event => {

            event.preventDefault();
            event.stopPropagation();

            openDashboard();

        }
    );


    item.addEventListener(
        'keydown',
        event => {

            if (
                event.key === 'Enter' ||
                event.key === ' '
            ) {

                event.preventDefault();

                openDashboard();

            }

        }
    );


    options.prepend(item);

    return true;
}


/* =========================================================
   WAIT FOR ST
   ========================================================= */

function waitForOptions() {

    if (
        createMenuItem()
    ) {
        return;
    }


    setTimeout(
        waitForOptions,
        500
    );

}


/* =========================================================
   INIT
   ========================================================= */

function init() {

    if (initialized) {
        return;
    }

    initialized = true;

    console.log(
        '[Dashboard] Initializing'
    );


    waitForOptions();


    console.log(
        '[Dashboard] Loaded'
    );

}


/* =========================================================
   EXPORT
   ========================================================= */

export {
    init
};
