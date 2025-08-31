// Только переключение светлой/тёмной темы
const btn = document.getElementById('btnToggleTheme');
btn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    btn.textContent = document.body.classList.contains('dark') ? 'Light Theme' : 'Dark Theme';
});