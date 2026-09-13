(() => {
    'use strict';

    console.log('[Magic System UI] Extension loaded.');

    // ==============================
    // CREATE HOME BUTTON
    // ==============================

    const homeButton = document.createElement('button');

    homeButton.id = 'magic-system-home';
    homeButton.type = 'button';
    homeButton.title = 'Open Magic System';

    homeButton.innerHTML = `
        <span class="magic-system-home-icon">✦</span>
    `;

    document.body.appendChild(homeButton);


    // ==============================
    // CREATE SYSTEM WINDOW
    // ==============================

    const systemOverlay = document.createElement('div');

    systemOverlay.id = 'magic-system-overlay';

    systemOverlay.innerHTML = `
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
                <span>MAGIC SYSTEM UI</span>
                <span>VERSION 1.0.0</span>
            </div>

        </div>
    `;

    document.body.appendChild(systemOverlay);


    // ==============================
    // OPEN / CLOSE
    // ==============================

    homeButton.addEventListener('click', () => {

        systemOverlay.classList.add('open');

    });


    document
        .getElementById('magic-system-close')
        .addEventListener('click', () => {

            systemOverlay.classList.remove('open');

        });


    console.log('[Magic System UI] Ready.');
})();
