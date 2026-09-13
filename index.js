/* =========================================================
   DASHBOARD
   SillyTavern Extension
   ========================================================= */

const MODULE_NAME = 'Dashboard';

let dashboardOverlay = null;
let personaSyncTimer = null;
let clockTimer = null;
let initialized = false;


/* =========================================================
   SILLYTAVERN CONTEXT
   ========================================================= */

function getSTContext() {
    try {
        return window.SillyTavern?.getContext?.() || null;
    } catch (error) {
        console.warn(`[${MODULE_NAME}] Cannot get SillyTavern context`, error);
        return null;
    }
}


/* =========================================================
   PERSONA
   ========================================================= */

function getPersonaData() {
    const context = getSTContext();

    let name = 'User';

    try {
        if (context?.name1) {
            name = String(context.name1).trim();
        }
    } catch (error) {}

    // สำรองด้วย {{user}}
    if (!name || name === 'User') {
        try {
            if (typeof context?.substituteParams === 'function') {
                const substituted = context.substituteParams('{{user}}');

                if (
                    substituted &&
                    substituted !== '{{user}}' &&
                    substituted.trim()
                ) {
                    name = substituted.trim();
                }
            }
        } catch (error) {}
    }

    // สำรองอีกชั้นจาก DOM
    if (!name || name === 'User') {
        try {
            const nameInput =
                document.querySelector('#name1') ||
                document.querySelector('[name="name1"]');

            if (nameInput?.value?.trim()) {
                name = nameInput.value.trim();
            }
        } catch (error) {}
    }

    let avatar = '';

    /*
     * พยายามหา avatar ของ Persona ปัจจุบันจาก DOM
     * ไม่ import personas.js เพื่อป้องกัน extension พัง
     */
    const avatarSelectors = [
        '#user_avatar img',
        '#user_avatar',
        '.persona_avatar img',
        '.persona-avatar img',
        '[data-persona-avatar] img',
        '[data-persona-avatar]'
    ];

    for (const selector of avatarSelectors) {
        try {
            const element = document.querySelector(selector);

            if (element) {
                const src =
                    element.src ||
                    element.getAttribute('src') ||
                    element.style.backgroundImage;

                if (src) {
                    avatar = src
                        .replace(/^url\(["']?/, '')
                        .replace(/["']?\)$/, '');

                    if (avatar) break;
                }
            }
        } catch (error) {}
    }

    return {
        name: name || 'User',
        avatar
    };
}


/* =========================================================
   PERSONA SYNC
   ========================================================= */

function syncPersona() {
    if (!dashboardOverlay) return;

    const persona = getPersonaData();

    // ชื่อ
    dashboardOverlay
        .querySelectorAll('[data-dashboard-user-name]')
        .forEach(element => {
            element.textContent = persona.name;
        });

    // Avatar
    if (persona.avatar) {
        dashboardOverlay
            .querySelectorAll('[data-dashboard-avatar]')
            .forEach(element => {
                element.src = persona.avatar;
                element.style.display = 'block';
            });

        dashboardOverlay
            .querySelectorAll('[data-dashboard-large-avatar]')
            .forEach(element => {
                element.src = persona.avatar;
                element.style.display = 'block';
            });
    }
}


function setupPersonaSync() {
    const context = getSTContext();

    syncPersona();

    /*
     * PERSONA_CHANGED
     */
    try {
        const eventSource = context?.eventSource;
        const eventTypes =
            context?.event_types ||
            context?.eventTypes;

        const personaChanged =
            eventTypes?.PERSONA_CHANGED;

        if (
            eventSource &&
            personaChanged
        ) {
            eventSource.on(
                personaChanged,
                () => {
                    setTimeout(syncPersona, 50);
                }
            );
        }
    } catch (error) {
        console.warn(
            `[${MODULE_NAME}] Persona event unavailable`,
            error
        );
    }

    /*
     * Fallback
     *
     * เผื่อ ST รุ่นเก่าหรือบางธีมไม่ได้ส่ง event
     */
    let lastName = '';
    let lastAvatar = '';

    if (personaSyncTimer) {
        clearInterval(personaSyncTimer);
    }

    personaSyncTimer = setInterval(() => {
        const persona = getPersonaData();

        if (
            persona.name !== lastName ||
            persona.avatar !== lastAvatar
        ) {
            lastName = persona.name;
            lastAvatar = persona.avatar;

            syncPersona();
        }
    }, 1000);
}


/* =========================================================
   BIO
   ========================================================= */

const BIO_STORAGE_KEY = 'dashboard_persona_bio';

function getBio() {
    try {
        return localStorage.getItem(BIO_STORAGE_KEY) || '';
    } catch (error) {
        return '';
    }
}

function saveBio(value) {
    try {
        localStorage.setItem(
            BIO_STORAGE_KEY,
            value
        );
    } catch (error) {
        console.warn(
            `[${MODULE_NAME}] Cannot save bio`,
            error
        );
    }
}


/* =========================================================
   HTML HELPERS
   ========================================================= */

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


/* =========================================================
   CLOCK
   ========================================================= */

function updateClock() {
    if (!dashboardOverlay) return;

    const now = new Date();

    const timeElement =
        dashboardOverlay.querySelector(
            '[data-dashboard-clock]'
        );

    const dateElement =
        dashboardOverlay.querySelector(
            '[data-dashboard-date]'
        );

    if (timeElement) {
        timeElement.textContent =
            now.toLocaleTimeString(
                'th-TH',
                {
                    hour: '2-digit',
                    minute: '2-digit'
                }
            );
    }

    if (dateElement) {
        dateElement.textContent =
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
   DASHBOARD HTML
   ========================================================= */

function createDashboard() {

    if (dashboardOverlay) {
        return dashboardOverlay;
    }

    const persona = getPersonaData();

    const avatarHTML = persona.avatar
        ? `
            <img
                src="${escapeHTML(persona.avatar)}"
                alt=""
                data-dashboard-avatar
            >
        `
        : `
            <div class="dashboard-avatar-placeholder"
                 data-dashboard-avatar-placeholder>
                ${escapeHTML(
                    persona.name
                        .charAt(0)
                        .toUpperCase()
                )}
            </div>
        `;

    dashboardOverlay =
        document.createElement('div');

    dashboardOverlay.id =
        'dashboard-overlay';

    dashboardOverlay.innerHTML = `

        <div class="dashboard-shell">

            <!-- HEADER -->

            <header class="dashboard-topbar">

                <div class="dashboard-brand">

                    <div class="dashboard-brand-text">
                        <div class="dashboard-brand-small">
                            PERSONAL SPACE
                        </div>

                        <div class="dashboard-brand-title">
                            DASHBOARD
                        </div>
                    </div>

                </div>


                <div class="dashboard-top-controls">

                    <div class="dashboard-clock">
                        <div
                            data-dashboard-clock>
                            --:--
                        </div>

                        <small
                            data-dashboard-date>
                            ---
                        </small>
                    </div>


                    <button
                        type="button"
                        class="dashboard-icon-button"
                        data-dashboard-close
                        aria-label="Close"
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

            <main
                class="dashboard-content"
                data-dashboard-content
            >

                <!-- HOME -->

                <section
                    class="dashboard-page active"
                    data-dashboard-page="home"
                >

                    <div class="dashboard-welcome">

                        <div>
                            <div class="dashboard-eyebrow">
                                WELCOME BACK
                            </div>

                            <h1>
                                Hello,
                                <span data-dashboard-user-name>
                                    ${escapeHTML(persona.name)}
                                </span>
                            </h1>

                            <p>
                                Your personal dashboard
                            </p>
                        </div>

                    </div>


                    <div class="dashboard-grid">

                        <!-- ACCOUNT -->

                        <section
                            class="dashboard-card dashboard-account-card"
                        >

                            <div class="dashboard-card-header">

                                <div>
                                    <div class="dashboard-card-label">
                                        ACCOUNT
                                    </div>
                                </div>

                                <div class="dashboard-profile-avatar">

                                    ${avatarHTML}

                                    ${
                                        !persona.avatar
                                            ? ''
                                            : ''
                                    }

                                </div>

                            </div>


                            <div class="dashboard-account-name">

                                <strong
                                    data-dashboard-user-name
                                >
                                    ${escapeHTML(persona.name)}
                                </strong>

                            </div>


                            <div class="dashboard-account-edit">

                                <textarea
                                    id="dashboard-bio"
                                    class="dashboard-bio"
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


                        <!-- CALENDAR -->

                        <section class="dashboard-card">

                            <div class="dashboard-card-label">
                                SCHEDULE
                            </div>

                            <div class="dashboard-calendar-date">
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


                        <!-- QUICK NOTE -->

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


                <!-- ACCOUNT PAGE -->

                <section
                    class="dashboard-page"
                    data-dashboard-page="account"
                >

                    <div class="dashboard-page-heading">

                        <div class="dashboard-eyebrow">
                            PROFILE
                        </div>

                        <h2>Account</h2>

                    </div>


                    <div class="dashboard-large-profile">

                        <div class="dashboard-large-avatar">

                            ${
                                persona.avatar
                                    ? `
                                        <img
                                            src="${escapeHTML(persona.avatar)}"
                                            alt=""
                                            data-dashboard-large-avatar
                                        >
                                    `
                                    : `
                                        <div
                                            class="dashboard-avatar-placeholder large"
                                            data-dashboard-avatar-placeholder
                                        >
                                            ${escapeHTML(
                                                persona.name
                                                    .charAt(0)
                                                    .toUpperCase()
                                            )}
                                        </div>
                                    `
                            }

                        </div>


                        <div class="dashboard-large-profile-info">

                            <div class="dashboard-card-label">
                                ACCOUNT
                            </div>

                            <h2
                                data-dashboard-user-name
                            >
                                ${escapeHTML(persona.name)}
                            </h2>

                            <textarea
                                id="dashboard-bio-large"
                                class="dashboard-bio"
                                placeholder="Write something about yourself..."
                            ></textarea>

                            <button
                                type="button"
                                class="dashboard-save-button"
                                data-dashboard-save-large
                            >
                                Save
                            </button>

                        </div>

                    </div>

                </section>


                <!-- GENERIC PAGES -->

                <section
                    class="dashboard-page"
                    data-dashboard-page="bank"
                >
                    <div class="dashboard-page-heading">
                        <div class="dashboard-eyebrow">
                            FINANCE
                        </div>
                        <h2>Bank</h2>
                    </div>

                    <div class="dashboard-empty-card">
                        No bank data yet.
                    </div>
                </section>


                <section
                    class="dashboard-page"
                    data-dashboard-page="messages"
                >
                    <div class="dashboard-page-heading">
                        <div class="dashboard-eyebrow">
                            COMMUNICATION
                        </div>
                        <h2>Messages</h2>
                    </div>

                    <div class="dashboard-empty-card">
                        No messages yet.
                    </div>
                </section>


                <section
                    class="dashboard-page"
                    data-dashboard-page="schedule"
                >
                    <div class="dashboard-page-heading">
                        <div class="dashboard-eyebrow">
                            CALENDAR
                        </div>
                        <h2>Schedule</h2>
                    </div>

                    <div class="dashboard-empty-card">
                        No scheduled events.
                    </div>
                </section>


                <section
                    class="dashboard-page"
                    data-dashboard-page="notes"
                >
                    <div class="dashboard-page-heading">
                        <div class="dashboard-eyebrow">
                            PERSONAL
                        </div>
                        <h2>Notes</h2>
                    </div>

                    <div class="dashboard-empty-card">
                        No notes yet.
                    </div>
                </section>


                <section
                    class="dashboard-page"
                    data-dashboard-page="files"
                >
                    <div class="dashboard-page-heading">
                        <div class="dashboard-eyebrow">
                            STORAGE
                        </div>
                        <h2>Files</h2>
                    </div>

                    <div class="dashboard-empty-card">
                        No files yet.
                    </div>
                </section>


                <section
                    class="dashboard-page"
                    data-dashboard-page="settings"
                >
                    <div class="dashboard-page-heading">
                        <div class="dashboard-eyebrow">
                            SYSTEM
                        </div>
                        <h2>Settings</h2>
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

    setupPersonaSync();

    return dashboardOverlay;
}


/* =========================================================
   DASHBOARD EVENTS
   ========================================================= */

function setupDashboardEvents() {

    if (!dashboardOverlay) return;


    // Close
    const closeButton =
        dashboardOverlay.querySelector(
            '[data-dashboard-close]'
        );

    closeButton?.addEventListener(
        'click',
        closeDashboard
    );


    // Navigation
    const pageSelect =
        dashboardOverlay.querySelector(
            '[data-dashboard-page-select]'
        );

    pageSelect?.addEventListener(
        'change',
        event => {
            switchPage(
                event.target.value
            );
        }
    );


    // Save home bio
    const saveBioButton =
        dashboardOverlay.querySelector(
            '#dashboard-save-bio'
        );

    saveBioButton?.addEventListener(
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

            showSavedState(
                saveBioButton
            );
        }
    );


    // Save account bio
    const saveLargeButton =
        dashboardOverlay.querySelector(
            '[data-dashboard-save-large]'
        );

    saveLargeButton?.addEventListener(
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

            const homeTextarea =
                dashboardOverlay.querySelector(
                    '#dashboard-bio'
                );

            if (homeTextarea) {
                homeTextarea.value =
                    textarea.value;
            }

            showSavedState(
                saveLargeButton
            );
        }
    );


    // Sync the two bio fields
    const homeBio =
        dashboardOverlay.querySelector(
            '#dashboard-bio'
        );

    const largeBio =
        dashboardOverlay.querySelector(
            '#dashboard-bio-large'
        );

    homeBio?.addEventListener(
        'input',
        () => {
            if (largeBio) {
                largeBio.value =
                    homeBio.value;
            }
        }
    );

    largeBio?.addEventListener(
        'input',
        () => {
            if (homeBio) {
                homeBio.value =
                    largeBio.value;
            }
        }
    );
}


/* =========================================================
   PAGE SWITCH
   ========================================================= */

function switchPage(pageName) {

    if (!dashboardOverlay) return;

    dashboardOverlay
        .querySelectorAll(
            '[data-dashboard-page]'
        )
        .forEach(page => {

            page.classList.toggle(
                'active',
                page.dataset.dashboardPage === pageName
            );

        });
}


/* =========================================================
   BIO LOAD
   ========================================================= */

function loadBio() {

    if (!dashboardOverlay) return;

    const bio = getBio();

    const homeBio =
        dashboardOverlay.querySelector(
            '#dashboard-bio'
        );

    const largeBio =
        dashboardOverlay.querySelector(
            '#dashboard-bio-large'
        );

    if (homeBio) {
        homeBio.value = bio;
    }

    if (largeBio) {
        largeBio.value = bio;
    }
}


/* =========================================================
   SAVED STATE
   ========================================================= */

function showSavedState(button) {

    if (!button) return;

    const original =
        button.textContent;

    button.textContent =
        'Saved ✓';

    button.classList.add(
        'saved'
    );

    setTimeout(() => {

        button.textContent =
            original;

        button.classList.remove(
            'saved'
        );

    }, 1200);
}


/* =========================================================
   OPEN / CLOSE
   ========================================================= */

async function openDashboard() {

    if (!dashboardOverlay) {
        createDashboard();
    }

    if (!dashboardOverlay) return;

    dashboardOverlay.classList.add(
        'is-open'
    );

    syncPersona();

    try {
        if (
            !document.fullscreenElement &&
            document.documentElement.requestFullscreen
        ) {
            await document.documentElement.requestFullscreen();
        }
    } catch (error) {
        // Fullscreen may be blocked on some mobile browsers.
    }
}


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
    } catch (error) {
        // Ignore fullscreen errors.
    }
}


/* =========================================================
   SILLYTAVERN MENU
   ========================================================= */

function createMenuItem() {

    const optionsMenu =
        document.querySelector('#options');

    if (!optionsMenu) {
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


    const open = event => {

        event?.preventDefault();
        event?.stopPropagation();

        openDashboard();

    };


    item.addEventListener(
        'click',
        open
    );

    item.addEventListener(
        'keydown',
        event => {

            if (
                event.key === 'Enter' ||
                event.key === ' '
            ) {
                open(event);
            }

        }
    );


    optionsMenu.prepend(item);

    return true;
}


/* =========================================================
   INITIALIZATION
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


function init() {

    if (initialized) {
        return;
    }

    initialized = true;

    console.log(
        `[${MODULE_NAME}] Loading...`
    );

    /*
     * ไม่สร้าง UI จนกว่า options menu
     * ของ SillyTavern จะพร้อม
     */
    waitForOptions();

    console.log(
        `[${MODULE_NAME}] Loaded successfully`
    );
}


/* =========================================================
   EXPORT
   ========================================================= */

export {
    init
};
