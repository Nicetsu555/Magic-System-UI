import { getContext } from '../../../script.js';
import { user_avatar } from '../../../personas.js';

let initialized = false;
let dashboard = null;
let clockTimer = null;


/* =====================================================
   INIT
   ===================================================== */

function init() {

    console.log('[Dashboard] Initializing...');

    if (initialized) {
        return;
    }

    initialized = true;

    const waitForOptions = setInterval(() => {

        const optionsMenu =
            document.querySelector('#options');

        if (!optionsMenu) {
            return;
        }

        clearInterval(waitForOptions);

        createDashboard(optionsMenu);

    }, 500);
}


/* =====================================================
   CREATE DASHBOARD
   ===================================================== */

function createDashboard(optionsMenu) {

    if (document.getElementById('dashboard-menu-item')) {
        return;
    }


    /* =================================================
       MENU ITEM
       ================================================= */

    const menuItem =
        document.createElement('div');

    menuItem.id =
        'dashboard-menu-item';

    menuItem.className =
        'list-group-item flex-container flexGap5';

    menuItem.innerHTML = `
        <i class="fa-solid fa-chart-pie"></i>
        <span>Dashboard</span>
    `;

    optionsMenu.prepend(menuItem);


    /* =================================================
       DASHBOARD
       ================================================= */

    dashboard =
        document.createElement('div');

    dashboard.id =
        'dashboard-overlay';

    dashboard.innerHTML = `

        <div class="dashboard-app">

            <!-- =====================================
                 TOP BAR
            ====================================== -->

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

                        ${createSelectorItem(
                            'home',
                            'หน้าหลัก',
                            'Home',
                            'fa-house',
                            true
                        )}

                        ${createSelectorItem(
                            'account',
                            'ACCOUNT',
                            'Account',
                            'fa-user'
                        )}

                        ${createSelectorItem(
                            'bank',
                            'ธนาคาร',
                            'Bank',
                            'fa-wallet'
                        )}

                        ${createSelectorItem(
                            'messages',
                            'ข้อความ',
                            'Messages',
                            'fa-message'
                        )}

                        ${createSelectorItem(
                            'schedule',
                            'ตารางงาน',
                            'Schedule',
                            'fa-calendar'
                        )}

                        ${createSelectorItem(
                            'notes',
                            'บันทึก',
                            'Notes',
                            'fa-note-sticky'
                        )}

                        ${createSelectorItem(
                            'files',
                            'ไฟล์ส่วนตัว',
                            'Files',
                            'fa-folder'
                        )}

                        ${createSelectorItem(
                            'settings',
                            'ตั้งค่า',
                            'Settings',
                            'fa-gear'
                        )}

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


            <!-- =====================================
                 PAGE AREA
            ====================================== -->

            <main
                id="dashboard-pages"
                class="dashboard-pages"
            >

                ${renderHome()}

                ${renderAccount()}

                ${renderBank()}

                ${renderMessages()}

                ${renderSchedule()}

                ${renderNotes()}

                ${renderFiles()}

                ${renderSettings()}

            </main>


            <!-- =====================================
                 FOOTER
            ====================================== -->

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


    setupSelector();
    setupCloseButton();
    setupPersonaSync();
    setupBio();

    updateClock();

    clockTimer =
        setInterval(
            updateClock,
            1000
        );


    /* =================================================
       OPEN
       ================================================= */

    menuItem.addEventListener(
        'click',
        async () => {

            dashboard.classList.add('open');

            syncPersona();

            try {

                if (
                    !document.fullscreenElement &&
                    document.documentElement.requestFullscreen
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


    console.log(
        '[Dashboard] Ready.'
    );
}


/* =====================================================
   SELECTOR ITEM
   ===================================================== */

function createSelectorItem(
    page,
    title,
    subtitle,
    icon,
    active = false
) {

    return `

        <button
            data-page="${page}"
            data-title="${title}"
            data-subtitle="${subtitle}"
            data-icon="${icon}"
            class="dashboard-select-item ${active ? 'active' : ''}"
        >

            <i class="fa-solid ${icon}"></i>

            <span>

                ${title}

                <small>
                    ${subtitle}
                </small>

            </span>

        </button>

    `;
}


/* =====================================================
   GET CURRENT PERSONA
   ===================================================== */

function getPersonaData() {

    const context =
        getContext();

    /*
     * สำคัญ:
     * name1 = ชื่อ Persona ที่กำลังใช้งานจริง
     */

    const name =
        context?.name1?.trim()
        || 'User';


    /*
     * user_avatar เป็น avatar filename
     * ของ Persona ปัจจุบัน
     */

    let avatar = '';

    try {

        if (
            user_avatar &&
            context?.getThumbnailUrl
        ) {

            avatar =
                context.getThumbnailUrl(
                    'persona',
                    user_avatar
                );

        }

    } catch (error) {

        console.log(
            '[Dashboard] Persona avatar error',
            error
        );

    }


    /*
     * fallback จาก DOM
     */

    if (!avatar) {

        const avatarElement =
            document.querySelector(
                '#user_avatar img'
            );

        if (
            avatarElement &&
            avatarElement.src
        ) {

            avatar =
                avatarElement.src;

        }

    }


    return {
        name,
        avatar
    };
}


/* =====================================================
   SYNC PERSONA
   ===================================================== */

function syncPersona() {

    if (!dashboard) {
        return;
    }


    const persona =
        getPersonaData();


    /*
     * HOME NAME
     */

    dashboard
        .querySelectorAll(
            '[data-dashboard-user-name]'
        )
        .forEach(
            element => {

                element.textContent =
                    persona.name;

            }
        );


    /*
     * ACCOUNT NAME
     */

    dashboard
        .querySelectorAll(
            '[data-dashboard-avatar]'
        )
        .forEach(
            element => {

                if (persona.avatar) {

                    element.innerHTML = `
                        <img
                            src="${escapeAttribute(
                                persona.avatar
                            )}"
                            alt=""
                        >

                        <span class="online-dot"></span>
                    `;

                } else {

                    element.innerHTML = `

                        <div class="avatar-placeholder">
                            ${escapeHTML(
                                persona.name
                                    .charAt(0)
                                    .toUpperCase()
                            )}
                        </div>

                        <span class="online-dot"></span>

                    `;

                }

            }
        );


    /*
     * ACCOUNT PAGE AVATAR
     */

    dashboard
        .querySelectorAll(
            '[data-dashboard-large-avatar]'
        )
        .forEach(
            element => {

                if (persona.avatar) {

                    element.innerHTML = `
                        <img
                            src="${escapeAttribute(
                                persona.avatar
                            )}"
                            alt=""
                        >
                    `;

                } else {

                    element.textContent =
                        persona.name
                            .charAt(0)
                            .toUpperCase();

                }

            }
        );

}


/* =====================================================
   PERSONA CHANGE EVENT
   ===================================================== */

function setupPersonaSync() {

    try {

        const context =
            getContext();

        const eventSource =
            context?.eventSource;

        const eventTypes =
            context?.eventTypes;


        if (
            eventSource &&
            eventTypes?.PERSONA_CHANGED
        ) {

            eventSource.on(
                eventTypes.PERSONA_CHANGED,
                () => {

                    console.log(
                        '[Dashboard] Persona changed.'
                    );

                    setTimeout(
                        syncPersona,
                        50
                    );

                }
            );

        }

    } catch (error) {

        console.log(
            '[Dashboard] Persona event unavailable',
            error
        );

    }


    /*
     * เพิ่ม observer เป็น fallback
     * เผื่อ UI ของ persona เปลี่ยนโดยไม่มี event
     */

    let lastName =
        getPersonaData().name;


    setInterval(() => {

        const currentName =
            getPersonaData().name;

        if (
            currentName !== lastName
        ) {

            lastName =
                currentName;

            syncPersona();

        }

    }, 500);

}


/* =====================================================
   BIO
   ===================================================== */

function getBio() {

    return localStorage.getItem(
        'dashboard_persona_bio'
    ) || 'ใช้ชีวิตในแบบที่ต้องการ';

}


function saveBio(value) {

    localStorage.setItem(
        'dashboard_persona_bio',
        value
    );

}


function setupBio() {

    if (!dashboard) {
        return;
    }


    const input =
        dashboard.querySelector(
            '#dashboard-bio'
        );

    const save =
        dashboard.querySelector(
            '#dashboard-save-bio'
        );


    if (
        !input ||
        !save
    ) {
        return;
    }


    input.value =
        getBio();


    save.addEventListener(
        'click',
        () => {

            saveBio(
                input.value.trim()
            );


            save.textContent =
                'บันทึกแล้ว ✓';


            setTimeout(
                () => {

                    save.textContent =
                        'บันทึก';

                },
                1200
            );

        }
    );

}


/* =====================================================
   SELECTOR
   ===================================================== */

function setupSelector() {

    const button =
        dashboard.querySelector(
            '#dashboard-selector-button'
        );

    const menu =
        dashboard.querySelector(
            '#dashboard-selector-menu'
        );


    button.addEventListener(
        'click',
        event => {

            event.stopPropagation();

            menu.classList.toggle(
                'open'
            );

        }
    );


    dashboard.addEventListener(
        'click',
        event => {

            if (
                !button.contains(event.target) &&
                !menu.contains(event.target)
            ) {

                menu.classList.remove(
                    'open'
                );

            }

        }
    );


    dashboard
        .querySelectorAll(
            '.dashboard-select-item'
        )
        .forEach(item => {

            item.addEventListener(
                'click',
                () => {

                    const page =
                        item.dataset.page;

                    dashboard
                        .querySelectorAll(
                            '.dashboard-select-item'
                        )
                        .forEach(
                            button => {
                                button.classList.remove(
                                    'active'
                                );
                            }
                        );


                    item.classList.add(
                        'active'
                    );


                    dashboard
                        .querySelector(
                            '#dashboard-current-title'
                        )
                        .textContent =
                        item.dataset.title;


                    dashboard
                        .querySelector(
                            '#dashboard-current-subtitle'
                        )
                        .textContent =
                        item.dataset.subtitle;


                    dashboard
                        .querySelector(
                            '#dashboard-current-icon'
                        )
                        .innerHTML = `
                            <i class="fa-solid ${item.dataset.icon}"></i>
                        `;


                    dashboard
                        .querySelectorAll(
                            '.dashboard-page'
                        )
                        .forEach(
                            pageElement => {

                                pageElement.classList.remove(
                                    'active'
                                );

                            }
                        );


                    const target =
                        dashboard.querySelector(
                            `[data-page-content="${page}"]`
                        );


                    if (target) {

                        target.classList.add(
                            'active'
                        );

                    }


                    menu.classList.remove(
                        'open'
                    );


                    syncPersona();

                }
            );

        });

}


/* =====================================================
   CLOSE
   ===================================================== */

function setupCloseButton() {

    const close =
        dashboard.querySelector(
            '#dashboard-close'
        );


    close.addEventListener(
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
                    '[Dashboard] Exit fullscreen error',
                    error
                );

            }

        }
    );

}


/* =====================================================
   CLOCK
   ===================================================== */

function updateClock() {

    if (!dashboard) {
        return;
    }


    const now =
        new Date();


    const clock =
        dashboard.querySelector(
            '#dashboard-clock'
        );


    const date =
        dashboard.querySelector(
            '#dashboard-date'
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
                'en-GB',
                {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                }
            );

    }

}


/* =====================================================
   HOME
   ===================================================== */

function renderHome() {

    return `

        <section
            class="dashboard-page active"
            data-page-content="home"
        >

            <div class="dashboard-welcome">

                <div>

                    <span>
                        Good morning,
                    </span>

                    <h1 data-dashboard-user-name>
                        User
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


                <!-- ACCOUNT -->

                <div class="dashboard-card account-card">

                    <div class="card-header">

                        <div>

                            <span class="card-label">
                                ACCOUNT
                            </span>

                        </div>

                        <button class="card-more">
                            <i class="fa-solid fa-ellipsis"></i>
                        </button>

                    </div>


                    <div class="account-main">

                        <div
                            class="profile-avatar"
                            data-dashboard-avatar
                        >

                            <div class="avatar-placeholder">
                                U
                            </div>

                            <span class="online-dot"></span>

                        </div>


                        <div class="account-info">

                            <h2 data-dashboard-user-name>
                                User
                            </h2>

                            <span>
                                ● ออนไลน์
                            </span>

                        </div>

                    </div>


                    <div class="account-edit-area">

                        <textarea
                            id="dashboard-bio"
                            placeholder="เขียนข้อความเกี่ยวกับตัวคุณ..."
                            maxlength="200"
                        ></textarea>


                        <div class="account-edit-bottom">

                            <small>
                                แก้ไขข้อมูลส่วนตัว
                            </small>

                            <button
                                id="dashboard-save-bio"
                            >
                                บันทึก
                            </button>

                        </div>

                    </div>

                </div>


                <!-- BANK -->

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

                        <i
                            class="fa-solid fa-building-columns card-icon"
                        ></i>

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

                                <strong>เชส</strong>

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

                                <strong>พี่เตชิน</strong>

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

                                <strong>ระบบ</strong>

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

                            <input type="checkbox">

                            <span>
                                ตอบข้อความที่ค้าง
                            </span>

                        </label>


                        <label class="task-item">

                            <input type="checkbox">

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
    `;
}


/* =====================================================
   ACCOUNT PAGE
   ===================================================== */

function renderAccount() {

    return `

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
                    ข้อมูลของ Persona ที่กำลังใช้งาน
                </p>

            </div>


            <div class="large-info-card">

                <div
                    class="large-avatar"
                    data-dashboard-large-avatar
                >
                    U
                </div>

                <div>

                    <h2 data-dashboard-user-name>
                        User
                    </h2>

                    <span class="status-badge">
                        ● ออนไลน์
                    </span>

                </div>

            </div>

        </section>
    `;
}


/* =====================================================
   BANK
   ===================================================== */

function renderBank() {

    return `

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


            <div class="large-bank-card">

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

        </section>
    `;
}


/* =====================================================
   MESSAGES
   ===================================================== */

function renderMessages() {

    return `

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
    `;
}


/* =====================================================
   SCHEDULE
   ===================================================== */

function renderSchedule() {

    return `

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

                <h2>
                    ไม่มีรายการเพิ่มเติม
                </h2>

                <p>
                    ตารางงานของคุณจะแสดงที่นี่
                </p>

            </div>

        </section>
    `;
}


/* =====================================================
   NOTES
   ===================================================== */

function renderNotes() {

    return `

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

                <h2>
                    ยังไม่มีบันทึก
                </h2>

                <p>
                    เริ่มสร้างบันทึกแรกของคุณ
                </p>

            </div>

        </section>
    `;
}


/* =====================================================
   FILES
   ===================================================== */

function renderFiles() {

    return `

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
    `;
}


/* =====================================================
   SETTINGS
   ===================================================== */

function renderSettings() {

    return `

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
    `;
}


/* =====================================================
   CALENDAR
   ===================================================== */

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

        days.push(`
            <span class="${active}">
                ${day}
            </span>
        `);

    }


    return days.join('');
}


/* =====================================================
   ESCAPE
   ===================================================== */

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


/* =====================================================
   EXPORT
   ===================================================== */

export {
    init
};
