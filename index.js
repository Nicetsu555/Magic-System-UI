function init() {

    console.log('[Magic System UI] Initializing...');

    // ป้องกันการสร้างเมนูซ้ำ
    if (document.getElementById('magic-system-menu')) {
        return;
    }

    // รอให้ Chat Options ของ SillyTavern โหลดก่อน
    const waitForMenu = setInterval(() => {

        const optionsMenu = document.querySelector('#options .options-content');

        if (!optionsMenu) {
            return;
        }

        clearInterval(waitForMenu);

        // ==============================
        // MAGIC SYSTEM MENU ITEM
        // ==============================

        const menuItem = document.createElement('a');

        menuItem.id = 'magic-system-menu';

        menuItem.innerHTML = `
            <i class="fa-lg fa-solid fa-wand-magic-sparkles"></i>
            <span>Magic System</span>
        `;

        // ใส่ไว้ด้านบนของเมนู
        optionsMenu.prepend(menuItem);

        // ==============================
        // SYSTEM WINDOW
        // ==============================

        const overlay = document.createElement('div');

        overlay.id = 'magic-system-overlay';

        overlay.innerHTML = `

            <div class="magic-system-window">

                <div class="magic-system-header">

                    <div>
                        <div class="system-small-title">
                            PLAYER INTERFACE
                        </div>

                        <div class="system-title">
                            THE SYSTEM
                        </div>
                    </div>

                    <button
                        id="magic-system-close"
                        type="button"
                    >
                        ×
                    </button>

                </div>


                <div class="system-tabs">

                    <button class="system-tab active">
                        STATUS
                    </button>

                    <button class="system-tab">
                        MISSIONS
                    </button>

                    <button class="system-tab">
                        SKILLS
                    </button>

                    <button class="system-tab">
                        SUMMONS
                    </button>

                    <button class="system-tab">
                        INVENTORY
                    </button>

                </div>


                <div class="system-content">

                    <div class="system-section">

                        <div class="section-title">
                            PLAYER STATUS
                        </div>

                        <div class="status-card">

                            <div class="status-name">
                                PLAYER
                            </div>

                            <div class="status-row">

                                <span>HP</span>

                                <div class="status-bar">
                                    <div class="status-fill hp"></div>
                                </div>

                                <span>100 / 100</span>

                            </div>


                            <div class="status-row">

                                <span>MP</span>

                                <div class="status-bar">
                                    <div class="status-fill mp"></div>
                                </div>

                                <span>80 / 100</span>

                            </div>


                            <div class="status-row">

                                <span>EXP</span>

                                <div class="status-bar">
                                    <div class="status-fill exp"></div>
                                </div>

                                <span>65%</span>

                            </div>

                        </div>

                    </div>


                    <div class="system-section">

                        <div class="section-title">
                            ATTRIBUTES
                        </div>

                        <div class="attribute-grid">

                            <div class="attribute-card">
                                <span>STR</span>
                                <strong>12</strong>
                                <button>+</button>
                            </div>

                            <div class="attribute-card">
                                <span>AGI</span>
                                <strong>15</strong>
                                <button>+</button>
                            </div>

                            <div class="attribute-card">
                                <span>INT</span>
                                <strong>18</strong>
                                <button>+</button>
                            </div>

                            <div class="attribute-card">
                                <span>VIT</span>
                                <strong>10</strong>
                                <button>+</button>
                            </div>

                        </div>

                    </div>


                    <div class="system-section">

                        <div class="section-title">
                            SYSTEM RECORD
                        </div>

                        <div class="record-card">
                            <span>Current Level</span>
                            <strong>Lv. 01</strong>
                        </div>

                        <div class="record-card">
                            <span>Available Points</span>
                            <strong>05</strong>
                        </div>

                        <div class="record-card">
                            <span>System Status</span>
                            <strong>ONLINE</strong>
                        </div>

                    </div>

                </div>


                <div class="system-footer">

                    <span>
                        MAGIC SYSTEM UI
                    </span>

                    <span>
                        VERSION 1.0.0
                    </span>

                </div>

            </div>
        `;

        document.body.appendChild(overlay);


        // ==============================
        // OPEN SYSTEM
        // ==============================

        menuItem.addEventListener('click', (event) => {

            event.preventDefault();

            overlay.classList.add('open');

        });


        // ==============================
        // CLOSE SYSTEM
        // ==============================

        const closeButton =
            document.getElementById('magic-system-close');

        closeButton.addEventListener('click', () => {

            overlay.classList.remove('open');

        });


        // คลิกพื้นที่มืดด้านนอกเพื่อปิด
        overlay.addEventListener('click', (event) => {

            if (event.target === overlay) {

                overlay.classList.remove('open');

            }

        });


        console.log('[Magic System UI] Ready.');

    }, 500);
}

export { init };
