// Глобальные переменные
let isDarkMode = true;
let currentTheme = 'dark';
let appSettings = {
    recentPaths: [],
    lastOS: 'Windows',
    lastCPU: 'x86_64',
    lastToolchainPath: '',
    buildDynamicLibs: false,
    build3rdParty: false,
    debugBuild: false,
    persistEnvironment: false
};

// DOM-элементы
const toggleThemeBtn = document.getElementById('toggleTheme');
const osSelect = document.getElementById('os');
const compilerSelect = document.getElementById('compiler');
const cpuSelect = document.getElementById('cpu');
const shellSelect = document.getElementById('shell');
const dynamicLibsCheckbox = document.getElementById('dynamicLibs');
const thirdPartyCheckbox = document.getElementById('thirdParty');
const debugBuildCheckbox = document.getElementById('debugBuild');
const persistEnvCheckbox = document.getElementById('persistEnv');
const ndkPathInput = document.getElementById('ndkPath');
const qtPathInput = document.getElementById('qtPath');
const workspacePathInput = document.getElementById('workspacePath');
const browseNDKBtn = document.getElementById('browseNDK');
const browseQtBtn = document.getElementById('browseQt');
const browseWorkspaceBtn = document.getElementById('browseWorkspace');
const createWorkspaceBtn = document.getElementById('createWorkspace');
const setWorkspaceEnvBtn = document.getElementById('setWorkspaceEnv');
const setEnvBtn = document.getElementById('setEnv');
const generateScriptBtn = document.getElementById('generateScript');
const envVarsList = document.getElementById('envVarsList');
const recentPathsList = document.getElementById('recentPathsList');
const scriptOutput = document.getElementById('scriptOutput');
const statusText = document.getElementById('statusText');

// Инициализация
function init() {
    loadSettings();
    updateUI();
    updateCompilerOptions();
    updateEnvVarsList();
    updateRecentPathsList();
    setStatus('Application initialized successfully', 'success');
}

// Переключение темы
toggleThemeBtn.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    currentTheme = isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    toggleThemeBtn.textContent = isDarkMode ? 'Light Theme' : 'Dark Theme';
    toggleThemeBtn.style.backgroundColor = isDarkMode ? '#ffeb3b' : '#424242';
    toggleThemeBtn.style.color = isDarkMode ? 'black' : 'white';
    setStatus(`Switched to ${isDarkMode ? 'Dark' : 'Light'} theme`, 'success');
});

// Обновление интерфейса при изменении ОС
osSelect.addEventListener('change', () => {
    updateCompilerOptions();
    setStatus(`Configuration updated for ${osSelect.value}`, 'info');
});

// Обновление списка компиляторов
function updateCompilerOptions() {
    const os = osSelect.value;
    compilerSelect.innerHTML = '';
    let compilers = [];
    switch (os) {
        case 'Windows':
            compilers = ['MSVC', 'Clang', 'MinGW'];
            break;
        case 'Android':
            compilers = ['Clang', 'GCC'];
            break;
        case 'Linux':
        case 'macOS':
            compilers = ['GCC', 'Clang'];
            break;
    }
    compilers.forEach(compiler => {
        const option = document.createElement('option');
        option.value = compiler;
        option.textContent = compiler;
        compilerSelect.appendChild(option);
    });
}

// Обзор файлов (заглушка)
browseNDKBtn.addEventListener('click', () => browsePath('ndk'));
browseQtBtn.addEventListener('click', () => browsePath('qt'));
browseWorkspaceBtn.addEventListener('click', () => browsePath('workspace'));

// Создание рабочей области
createWorkspaceBtn.addEventListener('click', () => {
    const workspacePath = workspacePathInput.value || `${getHomeDirectory()}\\xbase_workspace`;
    workspacePathInput.value = workspacePath;
    setStatus(`Workspace created: ${workspacePath}`, 'success');
});

// Установка переменных окружения
setWorkspaceEnvBtn.addEventListener('click', () => {
    const workspacePath = workspacePathInput.value || `${getHomeDirectory()}\\xbase_workspace`;
    setStatus(`XBASE_WORKSPACE set to: ${workspacePath}`, 'success');
});

// Генерация скрипта
generateScriptBtn.addEventListener('click', () => {
    const script = generateBuildScript();
    scriptOutput.value = script;
    setStatus('Build script generated successfully', 'success');
});

// Вспомогательные функции
function setStatus(text, type = 'info') {
    statusText.textContent = text;
    switch (type) {
        case 'success':
            statusText.style.color = 'var(--success)';
            break;
        case 'warning':
            statusText.style.color = 'var(--warning)';
            break;
        case 'error':
            statusText.style.color = 'var(--error)';
            break;
        default:
            statusText.style.color = 'var(--text-secondary)';
    }
}

function updateEnvVarsList() {
    envVarsList.innerHTML = '';
    const envVars = [
        'ANDROID_NDK_HOME', 'ANDROID_HOME', 'ANDROID_SDK_ROOT', 'JAVA_HOME',
        'HB_PLATFORM', 'HB_COMPILER', 'HB_CPU', 'HB_INSTALL_PREFIX',
        'XBASE_WORKSPACE', 'HB_WITH_QT'
    ];
    envVars.forEach(varName => {
        const li = document.createElement('li');
        const value = localStorage.getItem(varName) || '';
        const icon = value ? '[OK]' : '[X]';
        const displayValue = value.length > 50 ? value.substring(0, 47) + '...' : value;
        li.textContent = `${icon} ${varName} = ${displayValue}`;
        envVarsList.appendChild(li);
    });
}

function updateRecentPathsList() {
    recentPathsList.innerHTML = '';
    appSettings.recentPaths.forEach(path => {
        const li = document.createElement('li');
        const displayPath = path.length > 60 ? '...' + path.substring(path.length - 57) : path;
        li.textContent = displayPath;
        li.addEventListener('click', () => {
            workspacePathInput.value = path;
            setStatus(`Selected recent path: ${path}`, 'success');
        });
        recentPathsList.appendChild(li);
    });
}

function generateBuildScript() {
    const os = osSelect.value;
    const compiler = compilerSelect.value;
    const cpu = cpuSelect.value;
    const shell = shellSelect.value;
    const dynamicLibs = dynamicLibsCheckbox.checked;
    const thirdParty = thirdPartyCheckbox.checked;
    const debugBuild = debugBuildCheckbox.checked;
    const persistEnv = persistEnvCheckbox.checked;
    const ndkPath = ndkPathInput.value;
    const qtPath = qtPathInput.value;
    const workspacePath = workspacePathInput.value;

    return `# Harbour Build Script for ${os} (${compiler}, ${cpu})
# Generated on ${new Date().toISOString()}

# Environment Setup
export HB_PLATFORM=${os.toLowerCase()}
export HB_COMPILER=${compiler.toLowerCase()}
export HB_CPU=${cpu}
${ndkPath ? `export ANDROID_NDK_HOME=${ndkPath}` : ''}
${workspacePath ? `export XBASE_WORKSPACE=${workspacePath}` : ''}
${qtPath ? `export HB_WITH_QT=${qtPath}` : ''}

# Build Options
BUILD_DYNAMIC=${dynamicLibs}
BUILD_3RDPARTY=${thirdParty}
DEBUG_BUILD=${debugBuild}

# Script Logic Here...
echo "Build script generated for ${os} with ${compiler} (${cpu})"
`;
}

// Загрузка и сохранение настроек
function loadSettings() {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
        appSettings = JSON.parse(savedSettings);
        osSelect.value = appSettings.lastOS;
        cpuSelect.value = appSettings.lastCPU;
        dynamicLibsCheckbox.checked = appSettings.buildDynamicLibs;
        thirdPartyCheckbox.checked = appSettings.build3rdParty;
        debugBuildCheckbox.checked = appSettings.debugBuild;
        persistEnvCheckbox.checked = appSettings.persistEnvironment;
    }
}

function saveSettings() {
    appSettings.lastOS = osSelect.value;
    appSettings.lastCPU = cpuSelect.value;
    appSettings.buildDynamicLibs = dynamicLibsCheckbox.checked;
    appSettings.build3rdParty = thirdPartyCheckbox.checked;
    appSettings.debugBuild = debugBuildCheckbox.checked;
    appSettings.persistEnvironment = persistEnvCheckbox.checked;
    localStorage.setItem('appSettings', JSON.stringify(appSettings));
}

// Заглушка для диалога выбора файлов
function browsePath(type) {
    // В реальном приложении здесь будет вызов API для открытия диалога выбора файлов
    alert(`Browse for ${type} path (simulated)`);
    setStatus(`Selected ${type} path (simulated)`, 'success');
}

// Заглушка для получения домашней директории
function getHomeDirectory() {
    return 'C:\\Users\\User'; // Замените на реальную логику
}

// Инициализация при загрузке страницы
window.addEventListener('DOMContentLoaded', init);
