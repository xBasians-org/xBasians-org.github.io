/* ========= Глобальные переменные ========= */
const state = {
    settings: JSON.parse(localStorage.getItem('harbourSettings') || '{}'),
    recentPaths: JSON.parse(localStorage.getItem('harbourRecentPaths') || '[]')
};

const refs = {
    os:           document.getElementById('comboOS'),
    compiler:     document.getElementById('comboCompiler'),
    cpu:          document.getElementById('comboCPU'),
    shell:        document.getElementById('comboShell'),
    ndk:          document.getElementById('txtNDKPath'),
    qt:           document.getElementById('txtQtPath'),
    workspace:    document.getElementById('txtWorkspacePath'),
    dynamic:      document.getElementById('chkDynamic'),
    thirdParty:   document.getElementById('chk3rdParty'),
    debug:        document.getElementById('chkDebug'),
    persist:      document.getElementById('chkPersistEnv'),
    envList:      document.getElementById('listEnvVars'),
    recentList:   document.getElementById('listRecentPaths'),
    script:       document.getElementById('textBoxScript'),
    status:       document.getElementById('statusBar')
};

/* ========= Утилиты ========= */
const setStatus = (msg, type = 'info') => {
    refs.status.textContent = msg;
    refs.status.style.color = type === 'success' ? 'var(--success)'
                            : type === 'warning' ? 'var(--warning)'
                            : type === 'error'   ? 'var(--error)'
                            : 'var(--text2)';
};

const saveSettings = () => {
    const cfg = {
        lastOS: refs.os.value,
        lastCPU: refs.cpu.value,
        lastNDK: refs.ndk.value,
        lastQt: refs.qt.value,
        lastWorkspace: refs.workspace.value,
        buildDynamicLibs: refs.dynamic.checked,
        build3rdParty: refs.thirdParty.checked,
        debugBuild: refs.debug.checked,
        persistEnv: refs.persist.checked
    };
    localStorage.setItem('harbourSettings', JSON.stringify(cfg));
};

const updateRecent = (path) => {
    if (!path) return;
    state.recentPaths = [path, ...state.recentPaths.filter(p => p !== path)].slice(0, 10);
    localStorage.setItem('harbourRecentPaths', JSON.stringify(state.recentPaths));
    populateRecentList();
};

/* ========= Инициализация ========= */
const populateCompiler = () => {
    const os = refs.os.value;
    const map = {
        Windows: ['MSVC', 'Clang', 'MinGW'],
        Android: ['Clang', 'GCC'],
        Linux:   ['GCC', 'Clang'],
        macOS:   ['Clang', 'GCC']
    };
    refs.compiler.innerHTML = (map[os] || []).map(c => `<option>${c}</option>`).join('');
};

const populateEnvList = () => {
    const vars = [
        'ANDROID_NDK_HOME', 'ANDROID_HOME', 'ANDROID_SDK_ROOT', 'JAVA_HOME',
        'HB_PLATFORM', 'HB_COMPILER', 'HB_CPU', 'HB_INSTALL_PREFIX',
        'XBASE_WORKSPACE', 'HB_WITH_QT'
    ];
    refs.envList.innerHTML = vars.map(v => {
        const val = localStorage.getItem(v) || '';
        const ok = val ? '[OK]' : '[X]';
        const disp = val.length > 50 ? val.slice(0, 47) + '...' : val;
        return `<li>${ok} ${v} = ${disp}</li>`;
    }).join('');
};

const populateRecentList = () => {
    refs.recentList.innerHTML = state.recentPaths.map(p =>
        `<li>${p.length > 57 ? '...' + p.slice(-57) : p}</li>`).join('');
};

const loadSettings = () => {
    const s = state.settings;
    refs.os.value = s.lastOS || 'Windows';
    refs.cpu.value = s.lastCPU || 'x86_64';
    refs.ndk.value = s.lastNDK || '';
    refs.qt.value = s.lastQt || '';
    refs.workspace.value = s.lastWorkspace || `${navigator.platform.includes('Win') ? process.env.USERPROFILE : process.env.HOME}/xbase_workspace`;
    refs.dynamic.checked = s.buildDynamicLibs ?? true;
    refs.thirdParty.checked = s.build3rdParty ?? false;
    refs.debug.checked = s.debugBuild ?? false;
    refs.persist.checked = s.persistEnv ?? true;
    populateCompiler();
    populateEnvList();
    populateRecentList();
};

/* ========= Обработчики ========= */
refs.os.addEventListener('change', () => { populateCompiler(); saveSettings(); });

[refs.ndk, refs.qt, refs.workspace].forEach((el, idx) => {
    const label = ['NDK', 'Qt', 'Workspace'][idx];
    el.addEventListener('input', saveSettings);
    el.nextElementSibling.addEventListener('click', async () => {
        const dir = await pickFolder();
        if (dir) {
            el.value = dir;
            if (idx === 2) updateRecent(dir);
            saveSettings();
            populateEnvList();
            setStatus(`${label} path selected: ${dir}`, 'success');
        }
    });
});

document.getElementById('btnCreateWorkspace').addEventListener('click', () => {
    const path = refs.workspace.value || `${navigator.platform.includes('Win') ? process.env.USERPROFILE : process.env.HOME}/xbase_workspace`;
    // В браузере нельзя «создать» папку на диске, только показать путь
    refs.workspace.value = path;
    updateRecent(path);
    saveSettings();
    populateEnvList();
    setStatus(`Workspace configured: ${path}`, 'success');
});

document.getElementById('btnSetWorkspaceEnv').addEventListener('click', () => {
    localStorage.setItem('XBASE_WORKSPACE', refs.workspace.value);
    populateEnvList();
    setStatus(`XBASE_WORKSPACE set to: ${refs.workspace.value}`, 'success');
});

document.getElementById('btnSetEnv').addEventListener('click', () => {
    const { os, compiler, cpu, ndk, qt, workspace, persist } = refs;
    const vars = {
        HB_PLATFORM:  os.value.toLowerCase(),
        HB_COMPILER:  compiler.value.toLowerCase(),
        HB_CPU:       cpu.value,
        XBASE_WORKSPACE: workspace.value,
        HB_WITH_QT:   qt.value
    };
    if (ndk.value) vars.ANDROID_NDK_HOME = ndk.value;

    Object.entries(vars).forEach(([k, v]) => {
        if (v) localStorage.setItem(k, v);
    });
    populateEnvList();
    setStatus('Environment variables updated', 'success');
    saveSettings();
});

document.getElementById('btnGenerate').addEventListener('click', () => {
    const script = generateScript();
    refs.script.value = script;
    setStatus('Build script generated', 'success');
});

refs.recentList.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
        const idx = [...e.currentTarget.children].indexOf(e.target);
        refs.workspace.value = state.recentPaths[idx];
        saveSettings();
        setStatus(`Selected recent path: ${state.recentPaths[idx]}`, 'success');
    }
});

/* ========= Генератор скрипта ========= */
const generateScript = () => {
    const { os, compiler, cpu, shell, dynamic, thirdParty, debug, ndk, qt, workspace } = refs;

    const lines = [
        `# Harbour build script generated ${new Date().toLocaleString()}`,
        '',
        `# Settings:`,
        `#   Platform : ${os.value}`,
        `#   Compiler : ${compiler.value}`,
        `#   CPU      : ${cpu.value}`,
        `#   Shell    : ${shell.value}`,
        `#   Dynamic  : ${dynamic.checked}`,
        `#   3rdParty : ${thirdParty.checked}`,
        `#   Debug    : ${debug.checked}`,
        '',
        `export HB_PLATFORM="${os.value.toLowerCase()}"`,
        `export HB_COMPILER="${compiler.value.toLowerCase()}"`,
        `export HB_CPU="${cpu.value}"`,
        `export XBASE_WORKSPACE="${workspace.value}"`,
        qt.value ? `export HB_WITH_QT="${qt.value}"` : '',
        ndk.value ? `export ANDROID_NDK_HOME="${ndk.value}"` : '',
        '',
        '# Run build...',
        'hbmk2 project.hbp' + (debug.checked ? ' -debug' : '') +
                            (dynamic.checked ? ' -shared' : '') +
                            (thirdParty.checked ? ' -hbcontrib' : '')
    ].filter(Boolean);

    return lines.join('\n');
};

/* ========= File-system helpers ========= */
async function pickFolder() {
    if (!window.showDirectoryPicker) {
        alert('Your browser does not support directory selection. Please type the path manually.');
        return null;
    }
    try {
        const dirHandle = await window.showDirectoryPicker();
        return dirHandle.name; // пока только имя, нужно – полный путь можно собрать
    } catch {
        return null;
    }
}

/* ========= Старт ========= */
loadSettings();
setStatus('Application initialized', 'success');