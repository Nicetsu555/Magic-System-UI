/* =========================================================
   DASHBOARD
   Modern Personal Dashboard for SillyTavern
   ========================================================= */

const DASHBOARD_ID = 'st-dashboard-overlay';
const DASHBOARD_MENU_ID = 'st-dashboard-menu-item';

let dashboardInitialized = false;
let dashboardClockTimer = null;


/* =========================================================
   INIT
   ========================================================= */

export async function init() {
    if (dashboardInitialized) return;

    dashboardInitialized = true;

    await waitForSillyTavern();

    addDashboardMenu();
    createDashboard();
}


/* =========================================================
   WAIT FOR SILLYTAVERN
   ========================================================= */

function waitForSillyTavern() {
    return new Promise((resolve) => {

        if (document.querySelector('#options')) {
            resolve();
            return;
        }

        const observer = new MutationObserver(() => {

            if (document.querySelector('#options')) {
                observer.disconnect();
                resolve();
            }

        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

    });
}


/* =========================================================
   ADD DASHBOARD TO CHAT OPTIONS
   ========================================================= */

function addDashboardMenu() {

    if (document.querySelector(`#${DASHBOARD_MENU_ID}`)) {
        return;
    }

    const options =
        document.querySelector('#options');

    if (!options) return;


    const menuItem = document.createElement('div');

    menuItem.id = DASHBOARD_MENU_ID;

    menuItem.className =
        'list-group-item flex-container flexGap5';


    menuItem.innerHTML = `
        <i class="fa-solid fa-chart-pie"></i>
        <span>Dashboard</span>
    `;


    menuItem.addEventListener('click', async (event) => {

        event.preventDefault();
        event.stopPropagation();

        closeChatOptions();

        await openDashboard();

    });


    /*
     * ใส่ Dashboard ไว้บนสุด
     */

    const content =
        options.querySelector('.options-content');

    if (content) {
        content.prepend(menuItem);
    } else {
        options.prepend(menuItem);
    }
}


/* =========================================================
   CLOSE SILLYTAVERN CHAT OPTIONS
   ========================================================= */

function closeChatOptions() {

    const options =
        document.querySelector('#options');

    if (!options) return;

    options.classList.remove('open');

    /*
     * พยายามกดปุ่ม options ของ ST
     */

    const button =
        document.querySelector('#options_button');

    if (button) {

        try {
            button.click();
        } catch (error) {
            // ignore
        }

    }
}


/* =========================================================
   CREATE DASHBOARD
   ========================================================= */

function createDashboard() {

    if (document.querySelector(`#${DASHBOARD_ID}`)) {
        return;
    }


    const overlay =
        document.createElement('div');

    overlay.id = DASHBOARD_ID;


    overlay.innerHTML = `

        <div class="dashboard-app">

            <!-- =========================================
                 HEADER
            ========================================== -->

            <header class="dashboard-header">

                <div class="dashboard-brand">

                    <div class="dashboard-brand-icon">
                        <i class="fa-solid fa-sparkles"></i>
                    </div>

                    <div class="dashboard-brand-text">

                        <div class="dashboard-title">
                            DASHBOARD
                        </div>

                        <div class="dashboard-subtitle">
                            for a better day
                        </div>

                    </div>

                </div>


                <!-- SELECT NAVIGATION -->

                <div class="dashboard-navigation">

                    <div class="dashboard-nav-icon">
                        <i class="fa-solid fa-house"></i>
                    </div>

                    <div class="dashboard-select-wrap">

                        <div class="dashboard-select-main">

                            <span
                                id="dashboard-current-title"
                            >
                                หน้าหลัก
                            </span>

                            <span
                                id="dashboard-current-subtitle"
                            >
                                Home
                            </span>

                        </div>

                        <select
                            id="dashboard-page-select"
                            aria-label="Dashboard navigation"
                        >

                            <option value="home">
                                หน้าหลัก
                            </option>

                            <option value="account">
                                บัญชี
                            </option>

                            <option value="bank">
                                ธนาคาร
                            </option>

                            <option value="messages">
                                ข้อความ
                            </option>

                            <option value="schedule">
                                ตารางเวลา
                            </option>

                            <option value="notes">
                                โน้ต
                            </option>

                            <option value="files">
                                ไฟล์
                            </option>

                            <option value="settings">
                                ตั้งค่า
                            </option>

                        </select>

                        <i class="fa-solid fa-chevron-down dashboard-select-arrow"></i>

                    </div>

                </div>


                <!-- HEADER ACTIONS -->

                <div class="dashboard-header-actions">

                    <button
                        class="dashboard-icon-button notification-button"
                        title="Notifications"
                    >

                        <i class="fa-solid fa-bell"></i>

                        <span class="notification-dot"></span>

                    </button>


                    <button
                        id="dashboard-close"
                        class="dashboard-icon-button"
                        title="Close"
                    >

                        <i class="fa-solid fa-xmark"></i>

                    </button>

                </div>

            </header>


            <!-- =========================================
                 CONTENT
            ========================================== -->

            <main
                id="dashboard-content"
                class="dashboard-content"
            ></main>


        </div>

    `;


    document.body.appendChild(overlay);


    setupDashboardEvents();

    renderDashboardPage('home');

}


/* =========================================================
   DASHBOARD EVENTS
   ========================================================= */

function setupDashboardEvents() {

    const overlay =
        document.querySelector(`#${DASHBOARD_ID}`);

    if (!overlay) return;


    /*
     * Select navigation
     */

    const select =
        overlay.querySelector('#dashboard-page-select');

    if (select) {

        select.addEventListener('change', () => {

            renderDashboardPage(select.value);

        });

    }


    /*
     * Close button
     */

    const closeButton =
        overlay.querySelector('#dashboard-close');

    if (closeButton) {

        closeButton.addEventListener('click', () => {

            closeDashboard();

        });

    }


    /*
     * Click outside app
     */

    overlay.addEventListener('click', (event) => {

        if (event.target === overlay) {
            closeDashboard();
        }

    });

}


/* =========================================================
   OPEN DASHBOARD
   ========================================================= */

async function openDashboard() {

    const overlay =
        document.querySelector(`#${DASHBOARD_ID}`);

    if (!overlay) return;


    overlay.classList.add('dashboard-visible');


    /*
     * พยายาม Fullscreen
     */

    try {

        if (
            document.documentElement.requestFullscreen &&
            !document.fullscreenElement
        ) {

            await document.documentElement.requestFullscreen();

        }

    } catch (error) {

        /*
         * ถ้า browser ไม่อนุญาต fullscreen
         * Dashboard overlay ยังเปิดตามปกติ
         */

        console.log(
            '[Dashboard] Fullscreen unavailable'
        );

    }


    updateDashboardClock();

    if (dashboardClockTimer) {
        clearInterval(dashboardClockTimer);
    }

    dashboardClockTimer =
        setInterval(
            updateDashboardClock,
            1000
        );

}


/* =========================================================
   CLOSE DASHBOARD
   ========================================================= */

async function closeDashboard() {

    const overlay =
        document.querySelector(`#${DASHBOARD_ID}`);

    if (overlay) {
        overlay.classList.remove('dashboard-visible');
    }


    if (dashboardClockTimer) {

        clearInterval(
            dashboardClockTimer
        );

        dashboardClockTimer = null;

    }


    try {

        if (document.fullscreenElement) {

            await document.exitFullscreen();

        }

    } catch (error) {

        console.log(
            '[Dashboard] Exit fullscreen unavailable'
        );

    }

}


/* =========================================================
   CLOCK
   ========================================================= */

function updateDashboardClock() {

    const timeElement =
        document.querySelector(
            '#dashboard-clock'
        );

    const dateElement =
        document.querySelector(
            '#dashboard-date'
        );


    const now = new Date();


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
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }
            );

    }

}


/* =========================================================
   RENDER PAGE
   ========================================================= */

function renderDashboardPage(page) {

    const content =
        document.querySelector(
            '#dashboard-content'
        );

    if (!content) return;


    switch (page) {

        case 'account':
            content.innerHTML =
                renderAccountPage();
            break;


        case 'bank':
            content.innerHTML =
                renderBankPage();
            break;


        case 'messages':
            content.innerHTML =
                renderMessagesPage();
            break;


        case 'schedule':
            content.innerHTML =
                renderSchedulePage();
            break;


        case 'notes':
            content.innerHTML =
                renderNotesPage();
            break;


        case 'files':
            content.innerHTML =
                renderFilesPage();
            break;


        case 'settings':
            content.innerHTML =
                renderSettingsPage();
            break;


        default:
            content.innerHTML =
                renderHomePage();

    }


    updateNavigationText(page);

    setupPageEvents(page);

}


/* =========================================================
   NAVIGATION TEXT
   ========================================================= */

function updateNavigationText(page) {

    const title =
        document.querySelector(
            '#dashboard-current-title'
        );

    const subtitle =
        document.querySelector(
            '#dashboard-current-subtitle'
        );


    const pages = {

        home: [
            'หน้าหลัก',
            'Home'
        ],

        account: [
            'บัญชี',
            'Account'
        ],

        bank: [
            'ธนาคาร',
            'Bank'
        ],

        messages: [
            'ข้อความ',
            'Messages'
        ],

        schedule: [
            'ตารางเวลา',
            'Schedule'
        ],

        notes: [
            'โน้ต',
            'Notes'
        ],

        files: [
            'ไฟล์',
            'Files'
        ],

        settings: [
            'ตั้งค่า',
            'Settings'
        ]

    };


    const data =
        pages[page] || pages.home;


    if (title) {
        title.textContent = data[0];
    }

    if (subtitle) {
        subtitle.textContent = data[1];
    }

}


/* =========================================================
   USER DATA
   ========================================================= */

function getUserName() {

    /*
     * SillyTavern global
     */

    if (
        typeof window.name1 === 'string' &&
        window.name1.trim()
    ) {

        return window.name1.trim();

    }


    /*
     * DOM fallback
     */

    const possibleElements = [

        '#user_avatar + .avatar_name',

        '#name1',

        '.user-name'

    ];


    for (
        const selector of possibleElements
    ) {

        const element =
            document.querySelector(selector);

        if (
            element &&
            element.textContent.trim()
        ) {

            return element.textContent.trim();

        }

    }


    return 'User';

}


/* =========================================================
   USER AVATAR
   ========================================================= */

function getUserAvatar() {

    const selectors = [

        '#user_avatar img',

        '#user_avatar',

        '.user_avatar img',

        '.avatar.user img'

    ];


    for (
        const selector of selectors
    ) {

        const element =
            document.querySelector(selector);

        if (!element) continue;


        if (
            element.tagName === 'IMG' &&
            element.src
        ) {

            return element.src;

        }


        const background =
            getComputedStyle(element)
                .backgroundImage;


        if (
            background &&
            background !== 'none'
        ) {

            const match =
                background.match(
                    /url\(["']?(.*?)["']?\)/
                );

            if (match) {
                return match[1];
            }

        }

    }


    return '';

}


/* =========================================================
   USER DESCRIPTION
   ========================================================= */

function getUserDescription() {

    return localStorage.getItem(
        'st_dashboard_user_description'
    ) || 'ชีวิตในแบบที่ต้องการ';

}


function saveUserDescription(value) {

    localStorage.setItem(
        'st_dashboard_user_description',
        value
    );

}


/* =========================================================
   HOME
   ========================================================= */

function renderHomePage() {

    const username =
        getUserName();

    const avatar =
        getUserAvatar();

    const description =
        getUserDescription();


    return `

        <div class="dashboard-inner">

            <section class="dashboard-welcome">

                <div>

                    <div class="welcome-small">
                        Good morning,
                    </div>

                    <h1>
                        ${escapeHTML(username)}
                    </h1>

                    <p>
                        ขอให้วันนี้เป็นวันที่ดีนะ
                    </p>

                </div>

                <div class="welcome-decoration">
                    ✦
                </div>

            </section>


            <div class="dashboard-grid">


                <!-- ACCOUNT -->

                <section class="dashboard-card account-card">

                    <div class="dashboard-card-header">

                        <div class="dashboard-card-label">
                            ACCOUNT
                        </div>

                        <button
                            class="dashboard-card-more"
                            type="button"
                        >
                            •••
                        </button>

                    </div>


                    <div class="account-main">

                        <div class="account-avatar-wrap">

                            ${
                                avatar
                                ?
                                `
                                <img
                                    class="account-avatar"
                                    src="${escapeAttribute(avatar)}"
                                    alt=""
                                >
                                `
                                :
                                `
                                <div class="account-avatar fallback">
                                    ${escapeHTML(
                                        username
                                            .charAt(0)
                                            .toUpperCase()
                                    )}
                                </div>
                                `
                            }

                            <span
                                class="account-online-dot"
                            ></span>

                        </div>


                        <div class="account-info">

                            <div class="account-name">
                                ${escapeHTML(username)}
                            </div>

                            <div class="account-status">

                                <span></span>

                                ออนไลน์

                            </div>

                        </div>

                    </div>


                    <!-- EDITABLE BIO -->

                    <div class="account-description-wrap">

                        <textarea
                            id="dashboard-user-description"
                            class="account-description-input"
                            maxlength="160"
                            placeholder="เขียนสิ่งที่อยากบอกเกี่ยวกับตัวคุณ..."
                        >${escapeHTML(description)}</textarea>


                        <div class="account-edit-row">

                            <span class="account-edit-hint">
                                แก้ไขข้อมูลส่วนตัว
                            </span>

                            <button
                                id="dashboard-save-description"
                                class="account-save-btn"
                                type="button"
                            >
                                บันทึก
                            </button>

                        </div>

                    </div>

                </section>


                <!-- BANK -->

                <section class="dashboard-card bank-card">

                    <div class="dashboard-card-header">

                        <div>

                            <div class="dashboard-card-label">
                                BANK
                            </div>

                            <div class="dashboard-card-title">
                                บัญชีหลัก
                            </div>

                        </div>

                        <i class="fa-solid fa-building-columns bank-icon"></i>

                    </div>


                    <div class="bank-balance-card">

                        <div class="bank-balance-label">
                            ยอดเงินคงเหลือ
                        </div>

                        <div class="bank-balance">
                            ฿ 12,450.00
                        </div>

                        <div class="bank-number">
                            •••• &nbsp; •••• &nbsp; •••• &nbsp; 9987
                        </div>

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
                            <i class="fa-regular fa-credit-card"></i>
                            <span>บัตร</span>
                        </button>

                    </div>

                </section>


                <!-- CALENDAR -->

                <section class="dashboard-card calendar-card">

                    <div class="dashboard-card-header">

                        <div>

                            <div class="dashboard-card-label">
                                SCHEDULE
                            </div>

                            <div class="dashboard-card-title">
                                September 2026
                            </div>

                        </div>

                        <i class="fa-regular fa-calendar"></i>

                    </div>

                    <div
                        id="dashboard-calendar"
                        class="dashboard-calendar"
                    ></div>

                </section>


                <!-- MESSAGES -->

                <section class="dashboard-card messages-card">

                    <div class="dashboard-card-header">

                        <div>

                            <div class="dashboard-card-label">
                                MESSAGES
                            </div>

                            <div class="dashboard-card-title">
                                ข้อความล่าสุด
                            </div>

                        </div>

                        <span class="message-count">
                            3
                        </span>

                    </div>


                    <div class="message-list">

                        <div class="message-item">

                            <div class="message-avatar">
                                A
                            </div>

                            <div>

                                <strong>
                                    Alex
                                </strong>

                                <p>
                                    แล้วเจอกันนะ
                                </p>

                            </div>

                            <time>
                                10:24
                            </time>

                        </div>


                        <div class="message-item">

                            <div class="message-avatar">
                                M
                            </div>

                            <div>

                                <strong>
                                    Mina
                                </strong>

                                <p>
                                    ส่งไฟล์ให้แล้ว
                                </p>

                            </div>

                            <time>
                                09:18
                            </time>

                        </div>


                        <div class="message-item">

                            <div class="message-avatar">
                                K
                            </div>

                            <div>

                                <strong>
                                    Kim
                                </strong>

                                <p>
                                    อย่าลืมนัดวันนี้
                                </p>

                            </div>

                            <time>
                                เมื่อวาน
                            </time>

                        </div>

                    </div>

                </section>


                <!-- TASKS -->

                <section class="dashboard-card tasks-card">

                    <div class="dashboard-card-header">

                        <div>

                            <div class="dashboard-card-label">
                                TASKS
                            </div>

                            <div class="dashboard-card-title">
                                วันนี้
                            </div>

                        </div>

                    </div>


                    <div class="task-list">

                        <label class="task-item">

                            <input
                                type="checkbox"
                            >

                            <span>
                                ตรวจสอบข้อความ
                            </span>

                        </label>


                        <label class="task-item">

                            <input
                                type="checkbox"
                            >

                            <span>
                                อัปเดตไฟล์งาน
                            </span>

                        </label>


                        <label class="task-item">

                            <input
                                type="checkbox"
                            >

                            <span>
                                เขียนโน้ตสำหรับพรุ่งนี้
                            </span>

                        </label>

                    </div>

                </section>


                <!-- QUICK NOTE -->

                <section class="dashboard-card quick-note-card">

                    <div class="dashboard-card-header">

                        <div>

                            <div class="dashboard-card-label">
                                QUICK NOTE
                            </div>

                            <div class="dashboard-card-title">
                                โน้ตสั้น ๆ
                            </div>

                        </div>

                    </div>


                    <textarea
                        class="quick-note-input"
                        placeholder="เขียนอะไรไว้ตรงนี้..."
                    ></textarea>

                </section>


            </div>

        </div>

    `;

}


/* =========================================================
   ACCOUNT PAGE
   ========================================================= */

function renderAccountPage() {

    const username =
        getUserName();

    const avatar =
        getUserAvatar();

    const description =
        getUserDescription();


    return `

        <div class="dashboard-inner dashboard-single-page">

            <section class="dashboard-page-heading">

                <div class="dashboard-card-label">
                    ACCOUNT
                </div>

                <h1>
                    บัญชีของคุณ
                </h1>

                <p>
                    จัดการข้อมูลส่วนตัวและโปรไฟล์
                </p>

            </section>


            <section class="dashboard-card account-page-card">

                <div class="account-main">

                    <div class="account-avatar-wrap">

                        ${
                            avatar
                            ?
                            `
                            <img
                                class="account-avatar"
                                src="${escapeAttribute(avatar)}"
                                alt=""
                            >
                            `
                            :
                            `
                            <div class="account-avatar fallback">
                                ${escapeHTML(
                                    username
                                        .charAt(0)
                                        .toUpperCase()
                                )}
                            </div>
                            `
                        }

                        <span class="account-online-dot"></span>

                    </div>


                    <div class="account-info">

                        <div class="account-name">
                            ${escapeHTML(username)}
                        </div>

                        <div class="account-status">
                            <span></span>
                            ออนไลน์
                        </div>

                    </div>

                </div>


                <div class="account-description-wrap">

                    <textarea
                        id="dashboard-user-description"
                        class="account-description-input"
                        maxlength="160"
                    >${escapeHTML(description)}</textarea>


                    <div class="account-edit-row">

                        <span class="account-edit-hint">
                            ข้อความเกี่ยวกับตัวคุณ
                        </span>

                        <button
                            id="dashboard-save-description"
                            class="account-save-btn"
                            type="button"
                        >
                            บันทึก
                        </button>

                    </div>

                </div>

            </section>

        </div>

    `;

}


/* =========================================================
   BANK PAGE
   ========================================================= */

function renderBankPage() {

    return `

        <div class="dashboard-inner dashboard-single-page">

            <section class="dashboard-page-heading">

                <div class="dashboard-card-label">
                    BANK
                </div>

                <h1>
                    บัญชีหลัก
                </h1>

                <p>
                    ข้อมูลทางการเงิน
                </p>

            </section>


            <section class="dashboard-card large-bank-card">

                <div class="bank-balance-label">
                    ยอดเงินคงเหลือ
                </div>

                <div class="bank-balance large">
                    ฿ 12,450.00
                </div>

                <div class="bank-number">
                    •••• &nbsp; •••• &nbsp; •••• &nbsp; 9987
                </div>

            </section>

        </div>

    `;

}


/* =========================================================
   MESSAGES PAGE
   ========================================================= */

function renderMessagesPage() {

    return `

        <div class="dashboard-inner dashboard-single-page">

            <section class="dashboard-page-heading">

                <div class="dashboard-card-label">
                    MESSAGES
                </div>

                <h1>
                    ข้อความ
                </h1>

                <p>
                    ข้อความล่าสุดของคุณ
                </p>

            </section>


            <section class="dashboard-card">

                <div class="message-list">

                    <div class="message-item">

                        <div class="message-avatar">
                            A
                        </div>

                        <div>

                            <strong>
                                Alex
                            </strong>

                            <p>
                                แล้วเจอกันนะ
                            </p>

                        </div>

                    </div>


                    <div class="message-item">

                        <div class="message-avatar">
                            M
                        </div>

                        <div>

                            <strong>
                                Mina
                            </strong>

                            <p>
                                ส่งไฟล์ให้แล้ว
                            </p>

                        </div>

                    </div>

                </div>

            </section>

        </div>

    `;

}


/* =========================================================
   SCHEDULE PAGE
   ========================================================= */

function renderSchedulePage() {

    return `

        <div class="dashboard-inner dashboard-single-page">

            <section class="dashboard-page-heading">

                <div class="dashboard-card-label">
                    SCHEDULE
                </div>

                <h1>
                    ตารางเวลา
                </h1>

                <p>
                    สิ่งที่ต้องทำและนัดหมาย
                </p>

            </section>


            <section class="dashboard-card">

                <div class="task-list">

                    <label class="task-item">
                        <input type="checkbox">
                        <span>ตรวจสอบข้อความ</span>
                    </label>

                    <label class="task-item">
                        <input type="checkbox">
                        <span>อัปเดตไฟล์งาน</span>
                    </label>

                    <label class="task-item">
                        <input type="checkbox">
                        <span>เขียนโน้ตสำหรับพรุ่งนี้</span>
                    </label>

                </div>

            </section>

        </div>

    `;

}


/* =========================================================
   NOTES PAGE
   ========================================================= */

function renderNotesPage() {

    return `

        <div class="dashboard-inner dashboard-single-page">

            <section class="dashboard-page-heading">

                <div class="dashboard-card-label">
                    NOTES
                </div>

                <h1>
                    โน้ต
                </h1>

                <p>
                    พื้นที่สำหรับจดสิ่งต่าง ๆ
                </p>

            </section>


            <section class="dashboard-card notes-editor-card">

                <textarea
                    id="dashboard-main-note"
                    class="dashboard-main-note"
                    placeholder="เขียนโน้ตของคุณ..."
                ></textarea>

            </section>

        </div>

    `;

}


/* =========================================================
   FILES PAGE
   ========================================================= */

function renderFilesPage() {

    return `

        <div class="dashboard-inner dashboard-single-page">

            <section class="dashboard-page-heading">

                <div class="dashboard-card-label">
                    FILES
                </div>

                <h1>
                    ไฟล์
                </h1>

                <p>
                    จัดการไฟล์ของคุณ
                </p>

            </section>


            <section class="dashboard-card file-list">

                <div class="file-item">

                    <i class="fa-regular fa-file"></i>

                    <div>
                        <strong>My Notes.txt</strong>
                        <span>Text file</span>
                    </div>

                </div>


                <div class="file-item">

                    <i class="fa-regular fa-image"></i>

                    <div>
                        <strong>Profile.png</strong>
                        <span>Image</span>
                    </div>

                </div>


                <div class="file-item">

                    <i class="fa-regular fa-file-lines"></i>

                    <div>
                        <strong>Dashboard.css</strong>
                        <span>Stylesheet</span>
                    </div>

                </div>

            </section>

        </div>

    `;

}


/* =========================================================
   SETTINGS PAGE
   ========================================================= */

function renderSettingsPage() {

    return `

        <div class="dashboard-inner dashboard-single-page">

            <section class="dashboard-page-heading">

                <div class="dashboard-card-label">
                    SETTINGS
                </div>

                <h1>
                    ตั้งค่า
                </h1>

                <p>
                    ปรับแต่ง Dashboard
                </p>

            </section>


            <section class="dashboard-card settings-list">

                <div class="setting-item">

                    <div>
                        <strong>
                            Glass Effect
                        </strong>

                        <span>
                            เอฟเฟกต์กระจกโปร่งแสง
                        </span>
                    </div>

                    <input
                        type="checkbox"
                        checked
                    >

                </div>


                <div class="setting-item">

                    <div>
                        <strong>
                            Notifications
                        </strong>

                        <span>
                            แสดงการแจ้งเตือน
                        </span>
                    </div>

                    <input
                        type="checkbox"
                        checked
                    >

                </div>

            </section>

        </div>

    `;

}


/* =========================================================
   PAGE EVENTS
   ========================================================= */

function setupPageEvents(page) {

    /*
     * Account save
     */

    if (
        page === 'home' ||
        page === 'account'
    ) {

        const saveButton =
            document.querySelector(
                '#dashboard-save-description'
            );

        const textarea =
            document.querySelector(
                '#dashboard-user-description'
            );


        if (
            saveButton &&
            textarea
        ) {

            saveButton.addEventListener(
                'click',
                () => {

                    saveUserDescription(
                        textarea.value.trim()
                    );


                    saveButton.textContent =
                        'บันทึกแล้ว';


                    setTimeout(() => {

                        saveButton.textContent =
                            'บันทึก';

                    }, 1200);

                }
            );

        }

    }


    /*
     * Calendar
     */

    if (page === 'home') {

        const calendar =
            document.querySelector(
                '#dashboard-calendar'
            );

        if (calendar) {
            generateCalendar(calendar);
        }

    }

}


/* =========================================================
   CALENDAR
   ========================================================= */

function generateCalendar(container) {

    const year = 2026;
    const month = 8; // September

    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const weekdays = [
        'S',
        'M',
        'T',
        'W',
        'T',
        'F',
        'S'
    ];


    let html = '';


    weekdays.forEach(day => {

        html += `
            <div class="calendar-weekday">
                ${day}
            </div>
        `;

    });


    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        html += `
            <div class="calendar-empty"></div>
        `;

    }


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const selected =
            day === 14
                ? 'calendar-selected'
                : '';


        html += `
            <div class="calendar-day ${selected}">
                ${day}
            </div>
        `;

    }


    container.innerHTML = html;

}


/* =========================================================
   SECURITY HELPERS
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

}


function escapeAttribute(value) {

    return escapeHTML(value);

}
