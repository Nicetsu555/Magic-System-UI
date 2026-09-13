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

    optionsMenu.prepend(menuItem);


    // =====================================================
    // DASHBOARD OVERLAY
    // =====================================================

    const dashboard = document.createElement('div');

    dashboard.id = 'dashboard-overlay';

    const quoteSettings = getDashboardSettings();

    dashboard.innerHTML = `

        <div class="dashboard-app">

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

                    <div class="page-heading">

                        <span>
                            BANK
                        </span>

                        <h1>
                            ธนาคาร
                        </h1>

                        <p>
                            บัญชีและรายการทางการเงิน
                        </p>

                    </div>


                    <div class="bank-page-layout">

                        <!-- HERO BALANCE CARD -->
                        <div class="large-bank-card">

                            <div class="large-bank-top">

                                <div>

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

                                <i class="fa-solid fa-building-columns large-bank-icon"></i>

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

                                <div class="bank-stat-icon">
                                    <i class="fa-solid fa-arrow-down-long"></i>
                                </div>

                                <div>
                                    <small>เงินเข้าเดือนนี้</small>
                                    <strong>+ ฿ 8,200</strong>
                                </div>

                            </div>

                            <div class="bank-stat-card expense">

                                <div class="bank-stat-icon">
                                    <i class="fa-solid fa-arrow-up-long"></i>
                                </div>

                                <div>
                                    <small>เงินออกเดือนนี้</small>
                                    <strong>− ฿ 3,150</strong>
                                </div>

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

                    <div class="page-heading">

                        <span>
                            MESSAGES
                        </span>

                        <h1>
                            ข้อความ
                        </h1>

                        <p>
                            ข้อความล่าสุดและการสนทนา
                        </p>

                    </div>


                    <div class="full-list-card">

                        <div class="full-message">
                            <b>เชส</b>
                            <span>แล้วพรุ่งนี้เจอกันนะ :)</span>
                            <time>02:12</time>
                        </div>

                        <div class="full-message">
                            <b>พี่เตชิน</b>
                            <span>อย่าลืมกินข้าวด้วย</span>
                            <time>00:48</time>
                        </div>

                        <div class="full-message">
                            <b>ระบบ</b>
                            <span>อัปเดตข้อมูลเรียบร้อยแล้ว</span>
                            <time>เมื่อวาน</time>
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

                }
            );

        });


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
    // OPEN DASHBOARD
    // =====================================================

    menuItem.addEventListener(
        'click',
        async () => {

            // Refresh {{user}}'s name/avatar in case the persona
            // changed since the dashboard was created.
            refreshUserInfo(dashboard);
            refreshStatusDisplays(dashboard);

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
