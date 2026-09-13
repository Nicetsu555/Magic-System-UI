function init() {
    console.log('[Magic System UI] Loaded');

    // ป้องกันสร้างซ้ำ
    if (document.getElementById('magic-system-home')) {
        return;
    }

    // =========================
    // HOME BUTTON
    // =========================

    const homeButton = document.createElement('button');

    homeButton.id = 'magic-system-home';
    homeButton.type = 'button';
    homeButton.title = 'Open Magic System';

    homeButton.innerHTML = `
        <span class="magic-system-home-icon">✦</span>
    `;

    document.body.appendChild(homeButton);


    // =========================
    // SYSTEM OVERLAY
    // =========================

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

            </div>


            <div class="system-footer">
                <span>MAGIC SYSTEM UI</span>
                <span>VERSION 1.0.0</span>
            </div>

        </div>
    `;

    document.body.appendChild(overlay);


    // =========================
    // OPEN
    // =========================

    homeButton.addEventListener('click', () => {
        overlay.classList.add('open');
    });


    // =========================
    // CLOSE
    // =========================

    const closeButton =
        document.getElementById('magic-system-close');

    closeButton.addEventListener('click', () => {
        overlay.classList.remove('open');
    });


    console.log('[Magic System UI] Ready');
}


// SillyTavern Extension entry point
export { init };
