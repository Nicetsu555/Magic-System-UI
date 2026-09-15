function init() {

    console.log('[Dashboard] Initializing...');

    // Prevent duplicate initialization
    if (document.getElementById('dashboard-menu-item')) {
        return;
    }

    // =====================================================
    // WAIT FOR SILLYTAVERN CHAT OPTIONS
    // =====================================================

    const waitForOptions = setInterval(() => {

        const optionsMenu = document.querySelector('#options');

        if (!optionsMenu) {
            return;
        }

        clearInterval(waitForOptions);

        createDashboard(optionsMenu);

    }, 500);
}


// =========================================================
// SILLYTAVERN USER HELPERS
// =========================================================

// Extension settings namespace used to persist the editable quote.
const DASHBOARD_EXT_KEY = 'dashboardWidget';

// =========================================================
// WELCOME / BOOT SCREEN — paste your hosted image links here
// =========================================================
// Paste a direct image link (e.g. from an image host) between the
// quotes. Leave empty ('') to fall back to a plain gradient / a
// plain star glyph until you have links ready.
const DASHBOARD_WELCOME_BACKGROUND_URL = 'https://files.catbox.moe/bjknck.png';
const DASHBOARD_WELCOME_STAR_URL = 'https://files.catbox.moe/9xwggq.png';

function getDashboardContext() {

    try {

        if (typeof SillyTavern !== 'undefined' && SillyTavern.getContext) {

            return SillyTavern.getContext();

        }

    } catch (error) {

        console.log('[Dashboard] Could not get SillyTavern context', error);

    }

    return null;

}

// Gets the persisted quote settings, creating defaults on first run.
function getDashboardSettings() {

    const context = getDashboardContext();

    if (!context || !context.extensionSettings) {
        return {
            quote: 'ใช้ชีวิตในแบบที่ต้องการ',
            quoteEn: 'Live the life you want.'
        };
    }

    if (!context.extensionSettings[DASHBOARD_EXT_KEY]) {
        context.extensionSettings[DASHBOARD_EXT_KEY] = {};
    }

    const settings = context.extensionSettings[DASHBOARD_EXT_KEY];

    if (settings.quote === undefined) {
        settings.quote = 'ใช้ชีวิตในแบบที่ต้องการ';
    }

    if (settings.quoteEn === undefined) {
        settings.quoteEn = 'Live the life you want.';
    }

    if (settings.status === undefined) {
        settings.status = 'online';
    }

    return settings;

}

// =========================================================
// ONLINE / OFFLINE STATUS
// =========================================================

function getStatus() {

    const settings = getDashboardSettings();

    return settings.status === 'offline' ? 'offline' : 'online';

}

function setStatus(status) {

    const settings = getDashboardSettings();

    settings.status = status === 'offline' ? 'offline' : 'online';

    saveDashboardSettings();

}

function getStatusLabel(status) {

    return status === 'offline'
        ? '● ออฟไลน์'
        : '● ออนไลน์';

}

// Updates every status text and every online-dot in the dashboard
// to match the currently saved status.
function refreshStatusDisplays(dashboard) {

    const status = getStatus();

    dashboard
        .querySelectorAll('[data-status-text]')
        .forEach((element) => {

            element.textContent = getStatusLabel(status);

            element.classList.toggle(
                'is-offline',
                status === 'offline'
            );

        });

    dashboard
        .querySelectorAll('.online-dot')
        .forEach((dot) => {

            dot.classList.toggle(
                'offline',
                status === 'offline'
            );

        });

}

function saveDashboardSettings() {

    const context = getDashboardContext();

    try {

        if (context && context.saveSettingsDebounced) {
            context.saveSettingsDebounced();
        }

    } catch (error) {

        console.log('[Dashboard] Could not save settings', error);

    }

}

// Gets {{user}}'s current persona name. Falls back to "Player".
function getUserName() {

    const context = getDashboardContext();

    if (context && context.name1) {
        return context.name1;
    }

    return 'Player';

}

// Gets {{user}}'s current persona avatar URL, or null if unavailable.
// Different SillyTavern versions expose the avatar filename under
// slightly different property names, so a few are tried in order.
function getUserAvatarUrl() {

    const context = getDashboardContext();

    if (!context) {
        return null;
    }

    const avatarFile =
        context.userAvatar ||
        context.user_avatar ||
        context?.powerUserSettings?.default_persona ||
        context?.power_user?.default_persona;

    if (avatarFile) {
        return `/User Avatars/${avatarFile}`;
    }

    return null;

}

// Fills an avatar container with the user's real picture, falling back
// to the initial-letter placeholder if no persona image is available
// (or if it fails to load).
function renderUserAvatar(container, size) {

    if (!container) {
        return;
    }

    const userName = getUserName();
    const initial = userName ? userName.charAt(0).toUpperCase() : 'P';
    const avatarUrl = getUserAvatarUrl();

    container.innerHTML = '';

    // The picture/placeholder lives in its own circular, clipped
    // wrapper so the online-dot (a sibling) never gets cut off by
    // the image's rounded corners.
    const visual = document.createElement('div');

    visual.className = 'avatar-visual';

    if (avatarUrl) {

        const img = document.createElement('img');

        img.src = avatarUrl;
        img.alt = userName;
        img.className = 'avatar-image';

        img.addEventListener('error', () => {

            visual.innerHTML = `<div class="avatar-placeholder">${initial}</div>`;

        });

        visual.appendChild(img);

    } else {

        const placeholder = document.createElement('div');

        placeholder.className = 'avatar-placeholder';
        placeholder.textContent = initial;

        visual.appendChild(placeholder);

    }

    container.appendChild(visual);

    if (size === 'small') {

        const dot = document.createElement('span');

        dot.className = 'online-dot';

        dot.classList.toggle(
            'offline',
            getStatus() === 'offline'
        );

        container.appendChild(dot);

    }

}

// Refreshes every place {{user}}'s name/avatar is shown in the dashboard.
function refreshUserInfo(dashboard) {

    const userName = getUserName();

    dashboard
        .querySelectorAll('[data-user-name]')
        .forEach((element) => {
            element.textContent = userName;
        });

    dashboard
        .querySelectorAll('[data-user-avatar="small"]')
        .forEach((element) => {
            renderUserAvatar(element, 'small');
        });

    dashboard
        .querySelectorAll('[data-user-avatar="large"]')
        .forEach((element) => {
            renderUserAvatar(element, 'large');
        });

}


// =========================================================
// CREATE DASHBOARD
// =========================================================

function createDashboard(optionsMenu) {

    // =====================================================
    // MENU ITEM
    // =====================================================

    const menuItem = document.createElement('div');

    menuItem.id = 'dashboard-menu-item';

    menuItem.className =
        'list-group-item flex-container flexGap5';

    menuItem.innerHTML = `
        <i class="fa-solid fa-chart-pie"></i>
        <span>Dashboard</span>
    `;

    optionsMenu.appendChild(menuItem);


    // =====================================================
    // DASHBOARD OVERLAY
    // =====================================================

    const dashboard = document.createElement('div');

    dashboard.id = 'dashboard-overlay';

    const quoteSettings = getDashboardSettings();

    dashboard.innerHTML = `

        <div class="dashboard-app">

            <!-- =========================================
                 WELCOME / BOOT SCREEN
                 ========================================= -->

            <div class="dashboard-boot" id="dashboard-boot-screen">

                <div
                    class="dashboard-boot-bg"
                    id="dashboard-boot-bg"
                ></div>

                <div class="dashboard-boot-scrim"></div>

                <div class="dashboard-boot-corner dashboard-boot-corner-tr">
                    GOOD THINGS<br>AHEAD
                    <span class="dashboard-boot-corner-line"></span>
                </div>

                <div class="dashboard-boot-corner dashboard-boot-corner-bl">
                    SIMPLE<br>SAFE<br>FOR A BRIGHTER YOU
                    <span class="dashboard-boot-corner-line"></span>
                </div>

                <div class="dashboard-boot-corner dashboard-boot-corner-br">
                    YOUR WORLD<br>YOUR CONTROL
                    <span class="dashboard-boot-corner-line"></span>
                </div>

                <div class="dashboard-boot-content">

                    <div
                        class="dashboard-boot-star"
                        id="dashboard-boot-star"
                    >✦</div>

                    <h1 class="dashboard-boot-title">
                        Dashboard System
                    </h1>

                    <div class="dashboard-boot-subtitle">
                        WELCOME
                    </div>

                    <div class="dashboard-boot-divider">
                        <span></span>
                        <i>✦</i>
                        <span></span>
                    </div>

                    <div class="dashboard-boot-caption">
                        A MORE ORGANIZED TOMORROW
                    </div>

                    <button
                        type="button"
                        class="dashboard-boot-button"
                        id="dashboard-boot-continue"
                    >
                        TAP TO CONTINUE
                        <span class="dashboard-boot-button-icon">
                            <i class="fa-solid fa-arrow-right"></i>
                        </span>
                    </button>

                </div>

            </div>


            <!-- =========================================
                 TOP BAR
                 ========================================= -->

            <header class="dashboard-topbar">

                <div class="dashboard-brand">

                    <div class="dashboard-logo">
                        ✦
                    </div>

                    <div>

                        <div class="dashboard-title">
                            DASHBOARD
                        </div>

                        <div class="dashboard-subtitle">
                            for a better day
                        </div>

                    </div>

                </div>


                <!-- PAGE SELECT -->

                <div class="dashboard-selector">

                    <button
                        id="dashboard-selector-button"
                        class="dashboard-selector-button"
                        type="button"
                    >

                        <span
                            id="dashboard-current-icon"
                            class="dashboard-current-icon"
                        >
                            <i class="fa-solid fa-house"></i>
                        </span>

                        <span>

                            <strong id="dashboard-current-title">
                                หน้าหลัก
                            </strong>

                            <small id="dashboard-current-subtitle">
                                Home
                            </small>

                        </span>

                        <i class="fa-solid fa-chevron-down"></i>

                    </button>


                    <div
                        id="dashboard-selector-menu"
                        class="dashboard-selector-menu"
                    >

                        <button
                            data-page="home"
                            data-title="หน้าหลัก"
                            data-subtitle="Home"
                            data-icon="fa-house"
                            class="dashboard-select-item active"
                        >
                            <i class="fa-solid fa-house"></i>
                            <span>
                                หน้าหลัก
                                <small>Home</small>
                            </span>
                        </button>


                        <button
                            data-page="account"
                            data-title="ACCOUNT"
                            data-subtitle="Account"
                            data-icon="fa-user"
                            class="dashboard-select-item"
                        >
                            <i class="fa-solid fa-user"></i>
                            <span>
                                ACCOUNT
                                <small>Account</small>
                            </span>
                        </button>


                        <button
                            data-page="bank"
                            data-title="ธนาคาร"
                            data-subtitle="Bank"
                            data-icon="fa-wallet"
                            class="dashboard-select-item"
                        >
                            <i class="fa-solid fa-wallet"></i>
                            <span>
                                ธนาคาร
                                <small>Bank</small>
                            </span>
                        </button>


                        <button
                            data-page="messages"
                            data-title="ข้อความ"
                            data-subtitle="Messages"
                            data-icon="fa-message"
                            class="dashboard-select-item"
                        >
                            <i class="fa-solid fa-message"></i>
                            <span>
                                ข้อความ
                                <small>Messages</small>
                            </span>
                        </button>


                        <button
                            data-page="schedule"
                            data-title="ตารางงาน"
                            data-subtitle="Schedule"
                            data-icon="fa-calendar"
                            class="dashboard-select-item"
                        >
                            <i class="fa-solid fa-calendar"></i>
                            <span>
                                ตารางงาน
                                <small>Schedule</small>
                            </span>
                        </button>


                        <button
                            data-page="notes"
                            data-title="บันทึก"
                            data-subtitle="Notes"
                            data-icon="fa-note-sticky"
                            class="dashboard-select-item"
                        >
                            <i class="fa-solid fa-note-sticky"></i>
                            <span>
                                บันทึก
                                <small>Notes</small>
                            </span>
                        </button>


                        <button
                            data-page="files"
                            data-title="ไฟล์ส่วนตัว"
                            data-subtitle="Files"
                            data-icon="fa-folder"
                            class="dashboard-select-item"
                        >
                            <i class="fa-solid fa-folder"></i>
                            <span>
                                ไฟล์ส่วนตัว
                                <small>Files</small>
                            </span>
                        </button>


                        <button
                            data-page="settings"
                            data-title="ตั้งค่า"
                            data-subtitle="Settings"
                            data-icon="fa-gear"
                            class="dashboard-select-item"
                        >
                            <i class="fa-solid fa-gear"></i>
                            <span>
                                ตั้งค่า
                                <small>Settings</small>
                            </span>
                        </button>

                    </div>

                </div>


                <!-- RIGHT SIDE -->

                <div class="dashboard-top-actions">

                    <button
                        class="dashboard-icon-button"
                        title="Notifications"
                    >
                        <i class="fa-solid fa-bell"></i>
                        <span class="notification-dot"></span>
                    </button>

                    <div class="dashboard-time">
                        <small id="dashboard-date">
                            14 Sep 2026
                        </small>

                        <strong id="dashboard-clock">
                            03:07
                        </strong>
                    </div>

                    <button
                        id="dashboard-close"
                        class="dashboard-close"
                        type="button"
                    >
                        ×
                    </button>

                </div>

            </header>


            <!-- =========================================
                 PAGE AREA
                 ========================================= -->

            <main
                id="dashboard-pages"
                class="dashboard-pages"
            >


                <!-- =====================================
                     HOME
                     ===================================== -->

                <section
                    class="dashboard-page active"
                    data-page-content="home"
                >

                    <div class="dashboard-welcome">

                        <div>

                            <span>
                                Good morning,
                            </span>

                            <h1 data-user-name>
                                Player
                            </h1>

                            <p>
                                ขอให้วันนี้เป็นวันที่ดีนะ
                            </p>

                        </div>

                        <div class="dashboard-sparkle">
                            ✦
                        </div>

                    </div>


                    <div class="dashboard-grid home-grid">

                        <!-- ACCOUNT CARD -->

                        <div class="dashboard-card account-card">

                            <div class="card-header">

                                <div>
                                    <h2>
                                        ACCOUNT
                                    </h2>
                                </div>

                                <button class="card-more">
                                    <i class="fa-solid fa-ellipsis"></i>
                                </button>

                            </div>


                            <div class="account-main">

                                <div
                                    class="profile-avatar"
                                    data-user-avatar="small"
                                >

                                    <div class="avatar-placeholder">
                                        P
                                    </div>

                                    <span class="online-dot"></span>

                                </div>


                                <div class="account-info">

                                    <h2 data-user-name>
                                        Player
                                    </h2>

                                    <p>
                                        #0001-9987
                                    </p>

                                    <span
                                        class="status-toggle"
                                        data-status-text
                                        title="แตะเพื่อสลับสถานะ"
                                    >
                                        ● ออนไลน์
                                    </span>

                                </div>

                            </div>


                            <div class="account-quote">

                                <span
                                    id="dashboard-quote-text"
                                    class="quote-text"
                                    contenteditable="false"
                                >"${quoteSettings.quote}"</span>

                                <button
                                    id="dashboard-quote-edit"
                                    class="quote-edit-btn"
                                    type="button"
                                    title="แก้ไข"
                                >
                                    <i class="fa-solid fa-pen"></i>
                                </button>

                                <small id="dashboard-quote-sub">
                                    ${quoteSettings.quoteEn}
                                </small>

                            </div>

                        </div>


                        <!-- BANK CARD -->

                        <div class="dashboard-card bank-card">

                            <div class="card-header">

                                <div>
                                    <span class="card-label">
                                        BANK
                                    </span>

                                    <h2>
                                        บัญชีหลัก
                                    </h2>
                                </div>

                                <i class="fa-solid fa-building-columns card-icon"></i>

                            </div>


                            <div class="bank-balance">

                                <small>
                                    ยอดเงินคงเหลือ
                                </small>

                                <strong>
                                    ฿ 12,450.00
                                </strong>

                                <span>
                                    •••• •••• •••• 9987
                                </span>

                            </div>


                            <div class="bank-actions">

                                <button>
                                    <i class="fa-solid fa-arrow-up"></i>
                                    <span>โอนเงิน</span>
                                </button>

                                <button>
                                    <i class="fa-solid fa-arrow-down"></i>
                                    <span>รับเงิน</span>
                                </button>

                                <button>
                                    <i class="fa-solid fa-receipt"></i>
                                    <span>ประวัติ</span>
                                </button>

                                <button>
                                    <i class="fa-solid fa-credit-card"></i>
                                    <span>บัตร</span>
                                </button>

                            </div>

                        </div>


                        <!-- CALENDAR -->

                        <div class="dashboard-card calendar-card">

                            <div class="card-header">

                                <h2>
                                    กันยายน 2026
                                </h2>

                                <div class="calendar-arrows">
                                    ‹ &nbsp; ›
                                </div>

                            </div>


                            <div class="calendar-week">

                                <span>อา.</span>
                                <span>จ.</span>
                                <span>อ.</span>
                                <span>พ.</span>
                                <span>พฤ.</span>
                                <span>ศ.</span>
                                <span>ส.</span>

                            </div>


                            <div class="calendar-days">

                                ${generateCalendar()}

                            </div>

                        </div>


                        <!-- MESSAGES -->

                        <div class="dashboard-card messages-card">

                            <div class="card-header">

                                <div>

                                    <span class="card-label">
                                        MESSAGES
                                    </span>

                                    <h2>
                                        ข้อความล่าสุด
                                    </h2>

                                </div>

                                <span class="view-all">
                                    ดูทั้งหมด ›
                                </span>

                            </div>


                            <div class="message-list">

                                <div class="message-item">

                                    <div class="message-avatar">
                                        C
                                    </div>

                                    <div class="message-text">

                                        <strong>
                                            เชส
                                        </strong>

                                        <span>
                                            แล้วพรุ่งนี้เจอกันนะ :)
                                        </span>

                                    </div>

                                    <time>
                                        02:12
                                    </time>

                                </div>


                                <div class="message-item">

                                    <div class="message-avatar">
                                        T
                                    </div>

                                    <div class="message-text">

                                        <strong>
                                            พี่เตชิน
                                        </strong>

                                        <span>
                                            อย่าลืมกินข้าวด้วย
                                        </span>

                                    </div>

                                    <time>
                                        00:48
                                    </time>

                                </div>


                                <div class="message-item">

                                    <div class="message-avatar system-avatar">
                                        ⚙
                                    </div>

                                    <div class="message-text">

                                        <strong>
                                            ระบบ
                                        </strong>

                                        <span>
                                            อัปเดตข้อมูลเรียบร้อยแล้ว
                                        </span>

                                    </div>

                                    <time>
                                        เมื่อวาน
                                    </time>

                                </div>

                            </div>

                        </div>


                        <!-- TASKS -->

                        <div class="dashboard-card tasks-card">

                            <div class="card-header">

                                <div>

                                    <span class="card-label">
                                        TASKS
                                    </span>

                                    <h2>
                                        ภารกิจวันนี้
                                    </h2>

                                </div>

                                <span class="task-progress">
                                    2 / 5
                                </span>

                            </div>


                            <div class="task-progress-bar">

                                <div></div>

                            </div>


                            <div class="task-list">

                                <label class="task-item done">

                                    <input
                                        type="checkbox"
                                        checked
                                    >

                                    <span>
                                        ตรวจสอบยอดเงินบัญชี
                                    </span>

                                </label>


                                <label class="task-item done">

                                    <input
                                        type="checkbox"
                                        checked
                                    >

                                    <span>
                                        ส่งรายงานโปรเจกต์
                                    </span>

                                </label>


                                <label class="task-item">

                                    <input
                                        type="checkbox"
                                    >

                                    <span>
                                        ตอบข้อความที่ค้าง
                                    </span>

                                </label>


                                <label class="task-item">

                                    <input
                                        type="checkbox"
                                    >

                                    <span>
                                        อ่านเอกสารสำหรับพรุ่งนี้
                                    </span>

                                </label>

                            </div>

                        </div>


                        <!-- NOTES -->

                        <div class="dashboard-card notes-card">

                            <div class="card-header">

                                <div>

                                    <span class="card-label">
                                        QUICK NOTE
                                    </span>

                                    <h2>
                                        บันทึกสั้น ๆ
                                    </h2>

                                </div>

                                <button class="add-note">
                                    +
                                </button>

                            </div>


                            <div class="note-content">

                                “อย่าลืมว่า...

                                <br>

                                คุณเก่งมากแล้วในแบบของคุณ” ✨

                            </div>

                        </div>


                    </div>

                </section>


                <!-- =====================================
                     GENERIC PAGES
                     ===================================== -->

                <section
                    class="dashboard-page"
                    data-page-content="account"
                >

                    <div class="page-heading">

                        <span>
                            ACCOUNT
                        </span>

                        <h1>
                            ACCOUNT
                        </h1>

                        <p>
                            จัดการข้อมูลและรายละเอียดของบัญชี
                        </p>

                    </div>


                    <div class="large-info-card">

                        <div
                            class="large-avatar"
                            data-user-avatar="large"
                        >
                            P
                        </div>

                        <div>

                            <h2 data-user-name>
                                Player
                            </h2>

                            <p>
                                #0001-9987
                            </p>

                            <span
                                class="status-badge status-toggle"
                                data-status-text
                                title="แตะเพื่อสลับสถานะ"
                            >
                                ● ออนไลน์
                            </span>

                        </div>

                    </div>

                </section>


                <section
                    class="dashboard-page"
                    data-page-content="bank"
                >

                    <div class="page-heading bank-heading">

                        <div class="bank-heading-decor">

                            <div class="bank-hero-script">
                                Banking for a better tomorrow
                            </div>

                            <div class="bank-hero-illustration">
                                <i class="fa-solid fa-star sparkle-one"></i>
                                <i class="fa-solid fa-star sparkle-two"></i>
                                <i class="fa-solid fa-leaf leaf-one"></i>
                                <i class="fa-solid fa-leaf leaf-two"></i>
                                <i class="fa-solid fa-building-columns"></i>
                            </div>

                        </div>

                        <span>
                            BANK
                        </span>

                        <h1>
                            ธนาคาร
                        </h1>

                        <p>
                            บัญชีและรายการทางการเงิน
                        </p>

                        <div class="bank-heading-caption">
                            SAFE &bull; SIMPLE &bull; ALWAYS WITH YOU
                        </div>

                    </div>


                    <div class="bank-page-layout">

                        <!-- HERO BALANCE CARD -->
                        <div class="large-bank-card">

                            <div class="large-bank-sparkle sparkle-a">
                                <i class="fa-solid fa-star"></i>
                            </div>

                            <div class="large-bank-sparkle sparkle-b">
                                <i class="fa-solid fa-star"></i>
                            </div>

                            <div class="large-bank-top">

                                <div>

                                    <small>
                                        ยอดเงินคงเหลือ
                                    </small>

                                    <strong>
                                        ฿ 12,450.00
                                    </strong>

                                    <span class="large-bank-number">
                                        •••• •••• •••• 9987
                                        <button
                                            class="bank-copy-btn"
                                            id="bank-copy-btn"
                                            type="button"
                                            aria-label="คัดลอกเลขบัญชี"
                                        >
                                            <i class="fa-solid fa-copy"></i>
                                        </button>
                                    </span>

                                </div>

                                <div class="large-bank-icon-wrap">

                                    <i class="fa-solid fa-building-columns large-bank-icon"></i>

                                    <div class="large-bank-icon-caption">
                                        <strong>MY ACCOUNT</strong>
                                        <span>YOUR FUTURE<br>IN GOOD HANDS.</span>
                                    </div>

                                </div>

                            </div>


                            <div class="large-bank-actions">

                                <button>
                                    <i class="fa-solid fa-arrow-up"></i>
                                    <span>โอนเงิน</span>
                                </button>

                                <button>
                                    <i class="fa-solid fa-arrow-down"></i>
                                    <span>รับเงิน</span>
                                </button>

                                <button>
                                    <i class="fa-solid fa-receipt"></i>
                                    <span>ประวัติ</span>
                                </button>

                                <button>
                                    <i class="fa-solid fa-credit-card"></i>
                                    <span>บัตร</span>
                                </button>

                            </div>

                        </div>


                        <!-- QUICK STATS -->
                        <div class="bank-stats">

                            <div class="bank-stat-card income">

                                <div class="bank-stat-row">

                                    <div class="bank-stat-icon">
                                        <i class="fa-solid fa-arrow-down-long"></i>
                                    </div>

                                    <div class="bank-stat-text">
                                        <small>เงินเข้าเดือนนี้</small>
                                        <strong>+ ฿ 8,200</strong>
                                    </div>

                                    <i class="fa-solid fa-chart-simple bank-stat-trend-icon"></i>

                                </div>

                                <svg
                                    class="bank-stat-graph"
                                    viewBox="0 0 120 28"
                                    preserveAspectRatio="none"
                                >
                                    <path d="M0,24 C20,23 30,15 45,15 C65,15 72,4 120,2" />
                                </svg>

                            </div>

                            <div class="bank-stat-card expense">

                                <div class="bank-stat-row">

                                    <div class="bank-stat-icon">
                                        <i class="fa-solid fa-arrow-up-long"></i>
                                    </div>

                                    <div class="bank-stat-text">
                                        <small>เงินออกเดือนนี้</small>
                                        <strong>− ฿ 3,150</strong>
                                    </div>

                                    <i class="fa-solid fa-chart-simple bank-stat-trend-icon"></i>

                                </div>

                                <svg
                                    class="bank-stat-graph"
                                    viewBox="0 0 120 28"
                                    preserveAspectRatio="none"
                                >
                                    <path d="M0,20 C20,22 30,26 45,20 C65,14 72,6 120,4" />
                                </svg>

                            </div>

                        </div>


                        <!-- TRANSACTIONS -->
                        <div class="bank-transactions">

                            <div class="bank-transactions-header">
                                <h2>รายการล่าสุด</h2>
                                <span class="view-all">ดูทั้งหมด ›</span>
                            </div>

                            <div class="transaction-item">

                                <div class="transaction-icon in">
                                    <i class="fa-solid fa-arrow-down"></i>
                                </div>

                                <div class="transaction-text">
                                    <strong>เงินเดือนเข้า</strong>
                                    <span>วันนี้ • 09:24</span>
                                </div>

                                <div class="transaction-amount in">
                                    + ฿ 8,200.00
                                </div>

                            </div>

                            <div class="transaction-item">

                                <div class="transaction-icon out">
                                    <i class="fa-solid fa-cart-shopping"></i>
                                </div>

                                <div class="transaction-text">
                                    <strong>ซื้อของออนไลน์</strong>
                                    <span>เมื่อวาน • 21:10</span>
                                </div>

                                <div class="transaction-amount out">
                                    − ฿ 1,290.00
                                </div>

                            </div>

                            <div class="transaction-item">

                                <div class="transaction-icon out">
                                    <i class="fa-solid fa-bolt"></i>
                                </div>

                                <div class="transaction-text">
                                    <strong>ค่าไฟฟ้า</strong>
                                    <span>12 ก.ย. • 14:02</span>
                                </div>

                                <div class="transaction-amount out">
                                    − ฿ 860.00
                                </div>

                            </div>

                            <div class="transaction-item">

                                <div class="transaction-icon out">
                                    <i class="fa-solid fa-mug-hot"></i>
                                </div>

                                <div class="transaction-text">
                                    <strong>ร้านกาแฟ</strong>
                                    <span>10 ก.ย. • 08:15</span>
                                </div>

                                <div class="transaction-amount out">
                                    − ฿ 120.00
                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                <section
                    class="dashboard-page"
                    data-page-content="messages"
                >

                    <div class="messages-hero">

                        <div class="messages-hero-decor">
                            <i class="fa-solid fa-comment"></i>
                            <i class="fa-solid fa-comment-dots"></i>
                        </div>

                        <div class="messages-hero-top">

                            <div class="messages-hero-icon">
                                <i class="fa-solid fa-comment-dots"></i>
                            </div>

                            <div class="messages-hero-heading">

                                <span>
                                    MESSAGES
                                </span>

                                <h1>
                                    ข้อความ
                                </h1>

                            </div>

                        </div>

                        <div class="messages-hero-script">
                            Keep in touch
                        </div>

                        <div class="messages-hero-caption">
                            GOOD CONVERSATIONS<br>
                            BRIGHTEN YOUR DAY ✦
                        </div>

                    </div>


                    <div class="full-list-card" id="full-list-card">

                        <div
                            class="full-message"
                            id="system-message-row"
                            data-chat-name="ระบบ"
                            data-chat-initial="⚙"
                            data-chat-system="true"
                            data-chat-time="เมื่อวาน"
                        >
                            <div class="full-message-avatar system-avatar">⚙</div>
                            <div class="full-message-text">
                                <b>ระบบ</b>
                                <span>อัปเดตข้อมูลเรียบร้อยแล้ว</span>
                            </div>
                            <div class="full-message-meta">
                                <time>เมื่อวาน</time>
                                <i class="fa-solid fa-chevron-right"></i>
                            </div>
                        </div>

                    </div>

                </section>


                <section
                    class="dashboard-page"
                    data-page-content="schedule"
                >

                    <div class="page-heading">

                        <span>
                            SCHEDULE
                        </span>

                        <h1>
                            ตารางงาน
                        </h1>

                        <p>
                            ตารางและกิจกรรมของคุณ
                        </p>

                    </div>

                    <div class="empty-page-card">
                        <i class="fa-solid fa-calendar"></i>
                        <h2>ไม่มีรายการเพิ่มเติม</h2>
                        <p>ตารางงานของคุณจะแสดงที่นี่</p>
                    </div>

                </section>


                <section
                    class="dashboard-page"
                    data-page-content="notes"
                >

                    <div class="page-heading">

                        <span>
                            NOTES
                        </span>

                        <h1>
                            บันทึก
                        </h1>

                        <p>
                            เก็บข้อความและความคิดของคุณ
                        </p>

                    </div>

                    <div class="empty-page-card">
                        <i class="fa-solid fa-note-sticky"></i>
                        <h2>ยังไม่มีบันทึก</h2>
                        <p>เริ่มสร้างบันทึกแรกของคุณ</p>
                    </div>

                </section>


                <section
                    class="dashboard-page"
                    data-page-content="files"
                >

                    <div class="page-heading">

                        <span>
                            FILES
                        </span>

                        <h1>
                            ไฟล์ส่วนตัว
                        </h1>

                        <p>
                            เอกสารและไฟล์ล่าสุด
                        </p>

                    </div>

                    <div class="file-list-card">

                        <div>
                            <i class="fa-solid fa-file-word"></i>
                            <span>เอกสารสรุป.docx</span>
                            <small>2.4 MB</small>
                        </div>

                        <div>
                            <i class="fa-solid fa-file-image"></i>
                            <span>รูปภาพ.png</span>
                            <small>1.8 MB</small>
                        </div>

                        <div>
                            <i class="fa-solid fa-file-excel"></i>
                            <span>รายการค่าใช้จ่าย.xlsx</span>
                            <small>980 KB</small>
                        </div>

                    </div>

                </section>


                <section
                    class="dashboard-page"
                    data-page-content="settings"
                >

                    <div class="page-heading">

                        <span>
                            SETTINGS
                        </span>

                        <h1>
                            ตั้งค่า
                        </h1>

                        <p>
                            ปรับแต่ง Dashboard ของคุณ
                        </p>

                    </div>


                    <div class="settings-list">

                        <button>
                            <i class="fa-solid fa-palette"></i>
                            <span>การแสดงผล</span>
                            <i class="fa-solid fa-chevron-right"></i>
                        </button>

                        <button>
                            <i class="fa-solid fa-language"></i>
                            <span>ภาษา</span>
                            <i class="fa-solid fa-chevron-right"></i>
                        </button>

                        <button>
                            <i class="fa-solid fa-bell"></i>
                            <span>การแจ้งเตือน</span>
                            <i class="fa-solid fa-chevron-right"></i>
                        </button>

                        <button>
                            <i class="fa-solid fa-lock"></i>
                            <span>ความเป็นส่วนตัว</span>
                            <i class="fa-solid fa-chevron-right"></i>
                        </button>

                    </div>

                </section>


            </main>


            <!-- =========================================
                 CHAT THREAD (messages detail overlay)
                 ========================================= -->

            <div
                class="chat-thread"
                id="chat-thread"
            >

                <div class="chat-thread-header">

                    <button
                        class="chat-thread-back"
                        id="chat-thread-back"
                        type="button"
                    >
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>

                    <div
                        class="chat-thread-avatar"
                        id="chat-thread-avatar"
                    ></div>

                    <div class="chat-thread-name">
                        <strong id="chat-thread-name"></strong>
                        <span id="chat-thread-status">ออนไลน์</span>
                    </div>

                </div>

                <div
                    class="chat-thread-body"
                    id="chat-thread-body"
                ></div>

                <div class="chat-thread-composer">

                    <input
                        type="text"
                        class="chat-thread-input"
                        id="chat-thread-input"
                        placeholder="พิมพ์ข้อความ..."
                        autocomplete="off"
                    />

                    <button
                        class="chat-thread-send"
                        id="chat-thread-send"
                        type="button"
                    >
                        <i class="fa-solid fa-paper-plane"></i>
                    </button>

                </div>

            </div>


            <!-- =========================================
                 FOOTER
                 ========================================= -->

            <footer class="dashboard-footer">

                <span>
                    Good things take time.
                </span>

                <div>

                    <span>
                        DASHBOARD v2.0
                    </span>

                    <span>
                        ●
                    </span>

                </div>

            </footer>

        </div>
    `;


    document.body.appendChild(dashboard);


    // =====================================================
    // ELEMENTS
    // =====================================================

    const selectorButton =
        dashboard.querySelector(
            '#dashboard-selector-button'
        );

    const selectorMenu =
        dashboard.querySelector(
            '#dashboard-selector-menu'
        );

    const closeButton =
        dashboard.querySelector(
            '#dashboard-close'
        );


    // =====================================================
    // FILL IN {{user}}'S NAME / AVATAR
    // =====================================================

    refreshUserInfo(dashboard);
    refreshStatusDisplays(dashboard);

    dashboard
        .querySelectorAll('.status-toggle')
        .forEach((element) => {

            element.addEventListener(
                'click',
                () => {

                    const nextStatus =
                        getStatus() === 'online'
                            ? 'offline'
                            : 'online';

                    setStatus(nextStatus);

                    refreshStatusDisplays(dashboard);

                }
            );

        });


    // =====================================================
    // EDITABLE QUOTE
    // =====================================================

    const quoteText =
        dashboard.querySelector(
            '#dashboard-quote-text'
        );

    const quoteEditBtn =
        dashboard.querySelector(
            '#dashboard-quote-edit'
        );

    function saveQuote() {

        const rawValue =
            quoteText.textContent
                .replace(/^"|"$/g, '')
                .trim();

        const finalValue =
            rawValue.length > 0
                ? rawValue
                : quoteSettings.quote;

        quoteSettings.quote = finalValue;

        saveDashboardSettings();

        quoteText.textContent = `"${finalValue}"`;

        quoteText.setAttribute(
            'contenteditable',
            'false'
        );

        quoteText.classList.remove('editing');

        quoteEditBtn.innerHTML =
            '<i class="fa-solid fa-pen"></i>';

    }

    quoteEditBtn.addEventListener(
        'click',
        () => {

            const isEditing =
                quoteText.getAttribute(
                    'contenteditable'
                ) === 'true';

            if (!isEditing) {

                quoteText.setAttribute(
                    'contenteditable',
                    'true'
                );

                quoteText.classList.add('editing');

                quoteText.focus();

                // Place the caret at the end of the text.
                const range = document.createRange();
                const selection = window.getSelection();

                range.selectNodeContents(quoteText);
                range.collapse(false);

                selection.removeAllRanges();
                selection.addRange(range);

                quoteEditBtn.innerHTML =
                    '<i class="fa-solid fa-check"></i>';

            } else {

                saveQuote();

            }

        }
    );

    quoteText.addEventListener(
        'keydown',
        (event) => {

            if (event.key === 'Enter') {

                event.preventDefault();
                saveQuote();

            }

        }
    );


    // =====================================================
    // SELECTOR OPEN / CLOSE
    // =====================================================

    selectorButton.addEventListener(
        'click',
        (event) => {

            event.stopPropagation();

            selectorMenu.classList.toggle('open');

        }
    );


    document.addEventListener(
        'click',
        (event) => {

            if (
                !selectorButton.contains(event.target) &&
                !selectorMenu.contains(event.target)
            ) {

                selectorMenu.classList.remove(
                    'open'
                );

            }

        }
    );


    // =====================================================
    // PAGE SELECTION
    // =====================================================

    dashboard
        .querySelectorAll(
            '.dashboard-select-item'
        )
        .forEach((item) => {

            item.addEventListener(
                'click',
                () => {

                    const page =
                        item.dataset.page;

                    const title =
                        item.dataset.title;

                    const subtitle =
                        item.dataset.subtitle;

                    const icon =
                        item.dataset.icon;


                    // Update selector
                    dashboard.querySelector(
                        '#dashboard-current-title'
                    ).textContent = title;

                    dashboard.querySelector(
                        '#dashboard-current-subtitle'
                    ).textContent = subtitle;

                    dashboard.querySelector(
                        '#dashboard-current-icon'
                    ).innerHTML =
                        `<i class="fa-solid ${icon}"></i>`;


                    // Active selector
                    dashboard
                        .querySelectorAll(
                            '.dashboard-select-item'
                        )
                        .forEach(
                            (button) => {
                                button.classList.remove(
                                    'active'
                                );
                            }
                        );

                    item.classList.add('active');


                    // Change page
                    dashboard
                        .querySelectorAll(
                            '.dashboard-page'
                        )
                        .forEach(
                            (pageElement) => {

                                pageElement.classList.remove(
                                    'active'
                                );

                            }
                        );


                    const targetPage =
                        dashboard.querySelector(
                            `[data-page-content="${page}"]`
                        );

                    if (targetPage) {

                        targetPage.classList.add(
                            'active'
                        );

                    }


                    selectorMenu.classList.remove(
                        'open'
                    );


                    // Leaving the messages page should reset any
                    // open chat thread so it isn't still showing
                    // next time the page is visited.
                    if (page !== 'messages') {

                        const openThread =
                            dashboard.querySelector('#chat-thread.open');

                        if (openThread) {
                            openThread.classList.remove('open');
                        }

                    }

                }
            );

        });


    // =====================================================
    // MESSAGES / CHAT THREAD
    // =====================================================

    // Conversation history, keyed by contact name. Real story
    // contacts start empty (their thread seeds itself from the last
    // actual chat line — see openChatThread) and fill up from there
    // as generateQuietPrompt replies come in. "ระบบ" is the one
    // fixed, non-story entry, so it keeps its scripted notices.
    const chatConversations = {

        'ระบบ': [
            { from: 'in', text: 'ระบบได้ทำการสำรองข้อมูลของคุณเรียบร้อยแล้ว', time: 'เมื่อวาน' },
            { from: 'in', text: 'อัปเดตข้อมูลเรียบร้อยแล้ว', time: 'เมื่อวาน' }
        ]

    };

    const chatThread =
        dashboard.querySelector('#chat-thread');

    const chatThreadBack =
        dashboard.querySelector('#chat-thread-back');

    const chatThreadAvatar =
        dashboard.querySelector('#chat-thread-avatar');

    const chatThreadName =
        dashboard.querySelector('#chat-thread-name');

    const chatThreadStatus =
        dashboard.querySelector('#chat-thread-status');

    const chatThreadBody =
        dashboard.querySelector('#chat-thread-body');

    const chatThreadInput =
        dashboard.querySelector('#chat-thread-input');

    const chatThreadSend =
        dashboard.querySelector('#chat-thread-send');

    // Name of whichever contact's thread is currently open, so the
    // composer knows which conversation to read from / write into.
    let activeChatName = null;

    // Adds a brief pressed-state class for touch/click feedback,
    // since :active alone can be unreliable on some mobile browsers.
    function addPressEffect(element) {

        if (!element) {
            return;
        }

        const press = () => element.classList.add('is-pressed');
        const release = () => element.classList.remove('is-pressed');

        element.addEventListener('mousedown', press);
        element.addEventListener('touchstart', press, { passive: true });

        element.addEventListener('mouseup', release);
        element.addEventListener('mouseleave', release);
        element.addEventListener('touchend', release);
        element.addEventListener('touchcancel', release);

    }

    function isThreadOpenFor(name) {

        return !!(
            chatThread &&
            chatThread.classList.contains('open') &&
            activeChatName === name
        );

    }

    function openChatThread(item) {

        if (!chatThread) {
            return;
        }

        const name = item.dataset.chatName || '';
        const initial = item.dataset.chatInitial || '?';
        const isSystem = item.dataset.chatSystem === 'true';

        activeChatName = name;

        // "ระบบ" (system) notifications aren't a real contact —
        // there's no one to reply, so hide the composer for it.
        if (chatThreadInput && chatThreadSend) {

            const canReply = !isSystem;

            chatThreadInput.disabled = !canReply;
            chatThreadSend.disabled = !canReply;

            const composer =
                dashboard.querySelector('.chat-thread-composer');

            if (composer) {
                composer.classList.toggle('is-hidden', isSystem);
            }

        }

        chatThreadName.textContent = name;
        chatThreadStatus.textContent =
            isSystem ? 'การแจ้งเตือนอัตโนมัติ' : 'ออนไลน์';

        chatThreadAvatar.textContent = initial;
        chatThreadAvatar.classList.toggle('system-avatar', isSystem);

        renderChatBody(
            isSystem
                ? (chatConversations[name] || [])
                : getMirroredHistory(name)
        );

        chatThread.classList.add('open');

    }

    function closeChatThread() {

        if (chatThread) {
            chatThread.classList.remove('open');
        }

        activeChatName = null;

    }

    // Escapes text before it goes into innerHTML, since chat lines
    // come straight from the real story and may contain stray
    // <, >, or & characters.
    function escapeHtml(text) {

        const div = document.createElement('div');

        div.textContent = text == null ? '' : String(text);

        return div.innerHTML;

    }

    // Wipes and rebuilds the whole thread body from a list of
    // {from, text, time} bubbles. Used both for the first open and
    // for every live refresh, so the panel always matches the real
    // chat exactly rather than drifting from it.
    function renderChatBody(history) {

        if (!chatThreadBody) {
            return;
        }

        chatThreadBody.innerHTML = history
            .map((message) => `
                <div class="chat-bubble ${message.from}">
                    ${escapeHtml(message.text)}
                    <time>${escapeHtml(message.time)}</time>
                </div>
            `)
            .join('');

        chatThreadBody.scrollTop =
            chatThreadBody.scrollHeight;

    }

    // Small "..." bubble shown while the bot is generating a reply.
    function showTypingBubble() {

        if (!chatThreadBody) {
            return null;
        }

        const bubble = document.createElement('div');

        bubble.className = 'chat-bubble in chat-bubble-typing';

        bubble.innerHTML = `
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        `;

        chatThreadBody.appendChild(bubble);

        chatThreadBody.scrollTop =
            chatThreadBody.scrollHeight;

        return bubble;

    }

    // Strips the kind of formatting a roleplay LLM tends to add
    // (asterisked actions, surrounding quotes) so a story line reads
    // like a plain text message rather than prose.
    function cleanBotReply(text) {

        if (!text) {
            return '';
        }

        return text
            .replace(/\*[^*]*\*/g, '')
            .replace(/^["'“”]+|["'“”]+$/g, '')
            .replace(/\r?\n+/g, ' ')
            .trim();

    }

    function formatEntryTime(entry) {

        if (!entry || !entry.send_date) {
            return '';
        }

        const parsed = new Date(entry.send_date);

        if (Number.isNaN(parsed.getTime())) {
            return '';
        }

        return parsed.toLocaleTimeString(
            'th-TH',
            { hour: '2-digit', minute: '2-digit' }
        );

    }

    // The actual mirror: reads SillyTavern's real chat log and turns
    // it into phone bubbles for one contact. Solo chats show every
    // line (it's all {{user}} <-> that one character anyway); group
    // chats are filtered down to {{user}}'s lines plus only this
    // character's own lines, so each NPC's thread stays "of this
    // character only" per the story.
    function getMirroredHistory(characterName) {

        const context = getDashboardContext();
        const chatLog = context && context.chat;

        if (!Array.isArray(chatLog)) {
            return [];
        }

        const isGroup = !!context.groupId;

        return chatLog
            .filter((entry) => (
                entry &&
                entry.mes &&
                (
                    entry.is_user ||
                    !isGroup ||
                    entry.name === characterName
                )
            ))
            .map((entry) => ({
                from: entry.is_user ? 'out' : 'in',
                text: cleanBotReply(entry.mes),
                time: formatEntryTime(entry)
            }));

    }

    // Simulates the user actually typing into SillyTavern's real
    // message box and hitting send, so the phone composer produces
    // a genuine story turn (and a genuine generation) rather than a
    // side-channel reply.
    async function sendToRealChat(text) {

        const textarea = document.getElementById('send_textarea');
        const sendButton = document.getElementById('send_but');

        if (!textarea || !sendButton) {
            throw new Error('ไม่พบช่องพิมพ์ข้อความหลักของ SillyTavern');
        }

        textarea.value = text;

        textarea.dispatchEvent(
            new Event('input', { bubbles: true })
        );

        sendButton.click();

    }

    // Sends whatever is in the composer straight into the real
    // story as {{user}}. The outgoing bubble and the character's
    // reply both arrive through the live chat-event listeners below
    // once SillyTavern actually processes the turn — this just
    // kicks that off and shows a typing indicator while it's out.
    async function sendChatMessage() {

        if (!chatThreadInput || !activeChatName || activeChatName === 'ระบบ') {
            return;
        }

        const text = chatThreadInput.value.trim();

        if (!text) {
            return;
        }

        chatThreadInput.value = '';
        chatThreadInput.disabled = true;

        if (chatThreadSend) {
            chatThreadSend.disabled = true;
        }

        try {

            await sendToRealChat(text);

        } catch (error) {

            console.log(
                '[Dashboard] Failed to send into the real chat',
                error
            );

            chatThreadInput.disabled = false;
            chatThreadInput.value = text;

            if (chatThreadSend) {
                chatThreadSend.disabled = false;
            }

        }

    }

    // =====================================================
    // LIVE SYNC WITH THE REAL CHAT
    // =====================================================

    // Called whenever the real chat gains a message (from either
    // side) or otherwise changes. Keeps the contact-list previews
    // current, and — if a real contact's thread is open — re-mirrors
    // it so what's on screen never drifts from the real story.
    function handleLiveChatChange() {

        renderStoryContacts();

        if (
            activeChatName &&
            activeChatName !== 'ระบบ' &&
            isThreadOpenFor(activeChatName)
        ) {

            renderChatBody(getMirroredHistory(activeChatName));

        }

    }

    // On top of the generic refresh above: right after {{user}}'s
    // own line lands, show a typing indicator (the character's
    // reply is presumably still generating) and lock the composer
    // until it arrives.
    function handleMessageSent() {

        handleLiveChatChange();

        if (isThreadOpenFor(activeChatName)) {
            showTypingBubble();
        }

    }

    // The character's reply has landed for real — the refresh above
    // already rebuilt the thread with it (which also clears the
    // typing indicator), so just unlock the composer again.
    function handleMessageReceived() {

        handleLiveChatChange();

        if (
            isThreadOpenFor(activeChatName) &&
            chatThreadInput &&
            chatThreadSend
        ) {

            chatThreadInput.disabled = false;
            chatThreadSend.disabled = false;

        }

    }

    (function wireLiveChatEvents() {

        const context = getDashboardContext();

        if (!context || !context.eventSource || !context.event_types) {

            console.log(
                '[Dashboard] No eventSource available — phone chat won\'t live-update.'
            );

            return;

        }

        const events = context.event_types;

        if (events.MESSAGE_SENT) {
            context.eventSource.on(events.MESSAGE_SENT, handleMessageSent);
        }

        if (events.MESSAGE_RECEIVED) {
            context.eventSource.on(events.MESSAGE_RECEIVED, handleMessageReceived);
        }

        [
            events.MESSAGE_SWIPED,
            events.MESSAGE_EDITED,
            events.MESSAGE_DELETED,
            events.CHAT_CHANGED
        ]
            .filter(Boolean)
            .forEach((eventName) => {
                context.eventSource.on(eventName, handleLiveChatChange);
            });

    })();


    // Wires up press-feedback + open-thread behavior for one
    // contact row. Used both for the static "ระบบ" row and for
    // every dynamically-generated story contact row below.
    function bindFullMessageItem(item) {

        addPressEffect(item);

        item.addEventListener(
            'click',
            () => openChatThread(item)
        );

    }

    dashboard
        .querySelectorAll('.full-message')
        .forEach(bindFullMessageItem);


    // =====================================================
    // STORY CONTACTS (current bot + in-story NPCs)
    // =====================================================

    const fullListCard =
        dashboard.querySelector('#full-list-card');

    const systemMessageRow =
        dashboard.querySelector('#system-message-row');

    // Figures out which characters belong in the contact list:
    // the character/bot the user is currently chatting with, plus
    // — if it's a group chat — every other NPC member of that
    // same story. Returns [] if SillyTavern context isn't available
    // (e.g. previewing this file outside SillyTavern).
    function getStoryCharacters() {

        const context = getDashboardContext();

        if (!context) {
            return [];
        }

        const allCharacters = context.characters || [];

        // Group chat: every member is an NPC in the current story.
        if (context.groupId && Array.isArray(context.groups)) {

            const group = context.groups.find(
                (g) => g.id === context.groupId
            );

            if (!group || !Array.isArray(group.members)) {
                return [];
            }

            return group.members
                .map((avatarFile) => allCharacters.find(
                    (c) => c.avatar === avatarFile
                ))
                .filter(Boolean)
                .map((c) => ({ name: c.name, avatar: c.avatar }));

        }

        // Solo chat: just the one character currently loaded.
        if (context.name2) {

            const current = allCharacters[context.characterId];

            return [{
                name: context.name2,
                avatar: current ? current.avatar : null
            }];

        }

        return [];

    }

    // Finds that character's most recent line in the actual
    // SillyTavern chat log, to use as the message preview / the
    // thread's starting bubble.
    function getLastLineFrom(characterName) {

        const context = getDashboardContext();
        const chatLog = context && context.chat;

        if (!Array.isArray(chatLog)) {
            return null;
        }

        for (let i = chatLog.length - 1; i >= 0; i--) {

            const entry = chatLog[i];

            if (
                entry &&
                !entry.is_user &&
                entry.name === characterName &&
                entry.mes
            ) {

                return cleanBotReply(entry.mes);

            }

        }

        return null;

    }

    // Fills an avatar box with the character's real card image,
    // falling back to the same initial-letter circle used
    // elsewhere if there's no image (or it fails to load).
    function renderContactAvatarInto(box, avatarFile, initial) {

        box.textContent = '';

        if (!avatarFile) {
            box.textContent = initial;
            return;
        }

        const img = document.createElement('img');

        img.src = `/characters/${encodeURIComponent(avatarFile)}`;
        img.alt = initial;

        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '50%';

        img.addEventListener('error', () => {
            box.textContent = initial;
        });

        box.appendChild(img);

    }

    // Builds one contact row for a story character, matching the
    // exact markup/classes (and therefore colors) of the original
    // static rows.
    function buildStoryContactRow(character) {

        const initial =
            character.name ? character.name.charAt(0).toUpperCase() : '?';

        const lastLine = getLastLineFrom(character.name);

        const row = document.createElement('div');

        row.className = 'full-message story-contact';
        row.dataset.chatName = character.name;
        row.dataset.chatInitial = initial;

        const avatar = document.createElement('div');
        avatar.className = 'full-message-avatar';

        renderContactAvatarInto(avatar, character.avatar, initial);

        const textBox = document.createElement('div');
        textBox.className = 'full-message-text';

        const nameEl = document.createElement('b');
        nameEl.textContent = character.name;

        const previewEl = document.createElement('span');
        previewEl.textContent =
            lastLine || 'แตะเพื่อเริ่มบทสนทนา';

        textBox.appendChild(nameEl);
        textBox.appendChild(previewEl);

        const meta = document.createElement('div');
        meta.className = 'full-message-meta';
        meta.innerHTML =
            '<time></time><i class="fa-solid fa-chevron-right"></i>';

        row.appendChild(avatar);
        row.appendChild(textBox);
        row.appendChild(meta);

        return row;

    }

    // Rebuilds the contact list from scratch — clears out any
    // previously-rendered story rows and re-adds one per current
    // character/NPC, ahead of the fixed "ระบบ" row. Safe to call
    // every time the dashboard opens, since the active character
    // can change between visits.
    function renderStoryContacts() {

        if (!fullListCard) {
            return;
        }

        fullListCard
            .querySelectorAll('.story-contact')
            .forEach((row) => row.remove());

        const characters = getStoryCharacters();

        characters.forEach((character) => {

            const row = buildStoryContactRow(character);

            bindFullMessageItem(row);

            if (systemMessageRow) {
                fullListCard.insertBefore(row, systemMessageRow);
            } else {
                fullListCard.appendChild(row);
            }

        });

    }

    if (chatThreadBack) {

        addPressEffect(chatThreadBack);

        chatThreadBack.addEventListener(
            'click',
            closeChatThread
        );

    }

    if (chatThreadSend) {

        addPressEffect(chatThreadSend);

        chatThreadSend.addEventListener(
            'click',
            sendChatMessage
        );

    }

    if (chatThreadInput) {

        chatThreadInput.addEventListener(
            'keydown',
            (event) => {

                if (event.key === 'Enter') {
                    event.preventDefault();
                    sendChatMessage();
                }

            }
        );

    }


    // =====================================================
    // BANK COPY BUTTON
    // =====================================================

    const bankCopyBtn =
        dashboard.querySelector('#bank-copy-btn');

    if (bankCopyBtn) {

        bankCopyBtn.addEventListener(
            'click',
            async (event) => {

                event.stopPropagation();

                try {

                    await navigator.clipboard.writeText('9987');

                } catch (error) {

                    console.log(
                        '[Dashboard] Copy failed',
                        error
                    );

                }

                bankCopyBtn.innerHTML =
                    '<i class="fa-solid fa-check"></i>';

                bankCopyBtn.classList.add('copied');

                setTimeout(() => {

                    bankCopyBtn.innerHTML =
                        '<i class="fa-solid fa-copy"></i>';

                    bankCopyBtn.classList.remove('copied');

                }, 1500);

            }
        );

    }


    // =====================================================
    // CLOSE DASHBOARD
    // =====================================================

    closeButton.addEventListener(
        'click',
        async () => {

            dashboard.classList.remove(
                'open'
            );

            try {

                if (
                    document.fullscreenElement
                ) {

                    await document.exitFullscreen();

                }

            } catch (error) {

                console.log(
                    '[Dashboard] Fullscreen exit failed',
                    error
                );

            }

        }
    );


    // =====================================================
    // WELCOME / BOOT SCREEN
    // =====================================================

    const dashboardBootScreen =
        dashboard.querySelector('#dashboard-boot-screen');

    const dashboardBootBg =
        dashboard.querySelector('#dashboard-boot-bg');

    const dashboardBootStar =
        dashboard.querySelector('#dashboard-boot-star');

    const dashboardBootContinue =
        dashboard.querySelector('#dashboard-boot-continue');

    // Drop in the hosted background image if a link has been
    // pasted into DASHBOARD_WELCOME_BACKGROUND_URL up top —
    // otherwise the plain CSS gradient fallback stays as-is.
    if (dashboardBootBg && DASHBOARD_WELCOME_BACKGROUND_URL) {

        dashboardBootBg.style.backgroundImage =
            `url('${DASHBOARD_WELCOME_BACKGROUND_URL}')`;

    }

    // Same for the star/compass graphic — swap the plain "✦"
    // glyph for the real image once a link is pasted in.
    if (dashboardBootStar && DASHBOARD_WELCOME_STAR_URL) {

        dashboardBootStar.textContent = '';

        const starImg = document.createElement('img');

        starImg.src = DASHBOARD_WELCOME_STAR_URL;
        starImg.alt = '';

        starImg.addEventListener('error', () => {
            dashboardBootStar.textContent = '✦';
        });

        dashboardBootStar.appendChild(starImg);

    }

    if (dashboardBootContinue) {

        addPressEffect(dashboardBootContinue);

        dashboardBootContinue.addEventListener(
            'click',
            () => {

                if (dashboardBootScreen) {
                    dashboardBootScreen.classList.add('is-dismissed');
                }

            }
        );

    }


    // =====================================================
    // OPEN DASHBOARD
    // =====================================================

    menuItem.addEventListener(
        'click',
        async () => {

            // Shown fresh every time, like a boot screen —
            // reset it before the dashboard is revealed.
            if (dashboardBootScreen) {
                dashboardBootScreen.classList.remove('is-dismissed');
            }

            // Refresh {{user}}'s name/avatar in case the persona
            // changed since the dashboard was created.
            refreshUserInfo(dashboard);
            refreshStatusDisplays(dashboard);
            renderStoryContacts();

            dashboard.classList.add(
                'open'
            );

            try {

                if (
                    !document.fullscreenElement
                ) {

                    await document.documentElement
                        .requestFullscreen();

                }

            } catch (error) {

                console.log(
                    '[Dashboard] Fullscreen unavailable',
                    error
                );

            }

        }
    );


    // =====================================================
    // ESC / FULLSCREEN CHANGE
    // =====================================================

    document.addEventListener(
        'fullscreenchange',
        () => {

            if (
                !document.fullscreenElement &&
                dashboard.classList.contains('open')
            ) {

                // Keep dashboard visible.
                // Browser fullscreen and Dashboard UI
                // are independent.
                console.log(
                    '[Dashboard] Browser fullscreen closed.'
                );

            }

        }
    );


    // =====================================================
    // CLOCK
    // =====================================================

    function updateClock() {

        const now = new Date();

        const time =
            now.toLocaleTimeString(
                'th-TH',
                {
                    hour: '2-digit',
                    minute: '2-digit'
                }
            );

        const date =
            now.toLocaleDateString(
                'en-GB',
                {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                }
            );


        const clock =
            dashboard.querySelector(
                '#dashboard-clock'
            );

        const dateElement =
            dashboard.querySelector(
                '#dashboard-date'
            );


        if (clock) {
            clock.textContent = time;
        }

        if (dateElement) {
            dateElement.textContent = date;
        }

    }


    updateClock();

    setInterval(
        updateClock,
        1000
    );


    console.log(
        '[Dashboard] Ready.'
    );
}


// =========================================================
// CALENDAR
// =========================================================

function generateCalendar() {

    const days = [];

    const firstDay =
        new Date(
            2026,
            8,
            1
        ).getDay();

    const totalDays = 30;


    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        days.push(
            '<span class="calendar-empty"></span>'
        );

    }


    for (
        let day = 1;
        day <= totalDays;
        day++
    ) {

        const active =
            day === 14
                ? 'today'
                : '';

        days.push(
            `
            <span class="${active}">
                ${day}
            </span>
            `
        );

    }


    return days.join('');
}


export {
    init
};
