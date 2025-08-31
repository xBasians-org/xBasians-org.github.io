# xBasians-org.github.io
Home of xBasians.org: sharing tools, knowledge, and resources for the xBase developer community.

...

## TODO — Environment & Compiler Setup

- [ ] **Выбор Windows SDK**  
      - Убедиться, что выбран SDK совместим с компилятором (MSVC / MinGW / Clang).  
      - Проверить пути к include/lib/dll.  

- [ ] **Выбор версии компилятора**  
      - Указать точные версии Visual Studio / MinGW / Clang.  
      - Проверить доступность `cl.exe` / `gcc` / `clang`.  
      - Настроить переменные окружения (`PATH`, `INCLUDE`, `LIB`).  

- [ ] **Выбор include/*.h**  
      - Собрать список необходимых заголовочных файлов для VFP, Harbour, HBQt.  
      - Проверить совместимость с SDK и версией компилятора.  

- [ ] **Настройка XBASE_WORKSPACE**  
      - Структура каталогов: VFP_Projects, HB_Projects, HBQT_Projects.  
      - Сохранение конфигураций и переменных окружения в `.bashrc` / `.zshrc` / PowerShell.  

- [ ] **Установка и проверка компиляторов**  
      - VFP 9 + Service Packs.  
      - Harbour + Qt (HBQt) + C/C++ toolchain.  
      - Проверка команд: `vfp`, `hbmk2`, `gcc --version`, `clang --version`.  

- [ ] **Библиотеки и зависимости**  
      - C стандартные библиотеки (glibc / musl) для Linux.  
      - Prebuilt Harbour libs / Qt libs для Windows.  
      - Доп. dev-пакеты (например, для 32-битной совместимости).  

- [ ] **Скрипты автоматизации**  
      - Скрипты для установки и обновления компиляторов и библиотек.  
      - Скрипты для генерации workspace структуры и переменных окружения.  

- [ ] **Документация и ссылки**  
      - README.md с инструкциями.  
      - Ссылки на Google Groups и GitHub Discussions.  
      - Шаблоны конфигурационных файлов для разных ОС.  

- [ ] **Проверка совместимости и тестов**  
      - Минимальный проект для сборки и запуска в VFP, Harbour, HBQt.  
      - Проверка работы на Windows, Linux, macOS.  

- [ ] **Опционально: CI/CD**  
      - GitHub Actions для проверки сборки проектов.  
      - Автоматические тесты для примеров и библиотек.  

- [ ] Раздел по IDEs 

- [ ] To finish project [Harbour language analyzer](https://sourceforge.net/projects/harbour-language-analyzer/)
