function init() {
    console.log('[Magic System UI] Initializing...');

    // ป้องกันการสร้างซ้ำ
    if (document.getElementById('magic-system-menu')) {
        return;
    }

    // รอให้เมนู Options ของ SillyTavern พร้อม
    const waitForOptions = setInterval(() => {
        const optionsMenu = document.querySelector('#options');

        if (!optionsMenu) {
            return;
        }

        clearInterval(waitForOptions);

        // ==============================
        // MAGIC SYSTEM MENU
        // ==============================

        const menuItem = document.createElement('div');

        menuItem.id = 'magic-system-menu';
        menuItem.className = 'list-group-item flex-container flexGap5';

        menuItem.innerHTML = `
            <i class="fa-solid fa-wand-magic-sparkles"></i>
            <span>Magic System</span>
        `;

        optionsMenu.prepend(menuItem);


        // ==============================
        // SYSTEM OVERLAY
        // ==============================

        const overlay = document.createElement('div');

        overlay.id = 'magic-system-overlay';

        overlay.innerHTML = `
            <div class="magic-system-window">

                <!-- HEADER -->
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


                <!-- TABS -->
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


                <!-- CONTENT -->
                <div class="system-content">

                    <!-- PLAYER STATUS -->
                    <section class="system-section">

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
                                    <div
                                        class="status-fill hp"
                                    ></div>
                                </div>

                                <span>100 / 100</span>

                            </div>


                            <div class="status-row">

                                <span>MP</span>

                                <div class="status-bar">
                                    <div
                                        class="status-fill mp"
                                    ></div>
                                </div>

                                <span>80 / 100</span>

                            </div>


                            <div class="status-row">

                                <span>EXP</span>

                                <div class="status-bar">
                                    <div
                                        class="status-fill exp"
                                    ></div>
                                </div>

                                <span>65%</span>

                            </div>

                        </div>

                    </section>


                    <!-- ATTRIBUTES -->
                    <section class="system-section">

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

                    </section>


                    <!-- SYSTEM RECORD -->
                    <section class="system-section">

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

                    </section>

                </div>


                <!-- FOOTER -->
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
        // OPEN
        // ==============================

        menuItem.addEventListener('click', async () => {

            overlay.classList.add('open');

            // พยายามเข้า Fullscreen
            try {
                if (!document.fullscreenElement) {
                    await document.documentElement.requestFullscreen();
                }
            } catch (error) {
                console.log(
                    '[Magic System UI] Fullscreen unavailable',
                    error
                );
            }

        });


        // ==============================
        // CLOSE
        // ==============================

        const closeButton =
            overlay.querySelector('#magic-system-close');

        closeButton.addEventListener(
            'click',
            async () => {

                overlay.classList.remove('open');

                try {
                    if (document.fullscreenElement) {
                        await document.exitFullscreen();
                    }
                } catch (error) {
                    console.log(
                        '[Magic System UI] Exit fullscreen',
                        error
                    );
                }

            }
        );


        // ==============================
        // ESC / FULLSCREEN CHANGE
        // ==============================

        document.addEventListener(
            'fullscreenchange',
            () => {

                if (!document.fullscreenElement) {
                    overlay.classList.remove('open');
                }

            }
        );


        console.log(
            '[Magic System UI] Ready.'
        );
    }, 500);
}


// SillyTavern Extension entry point
export {
    init
};
