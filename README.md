🇺🇦
Опис проєкту

Це frontend-застосунок для відображення та відстеження рухомих об’єктів на мапі в режимі реального часу.

Кожен об’єкт має:

унікальний ідентифікатор
координати
напрям руху
тип: свій / чужий

Дані надходять через WebSocket із mock-сервера.

Основний функціонал
авторизація за унікальним ключем
відображення об’єктів на мапі
відображення напрямку руху
розділення на свої та чужі об’єкти
автоматичне визначення втрачених об’єктів (lost)
видалення втрачених об’єктів через 5 хвилин
індикатор стану WebSocket-з’єднання
автоматичне перепідключення при втраті з’єднання
вибір об’єкта по кліку
панель з деталями вибраного об’єкта
mock-сервер, який генерує, рухає та поступово прибирає об’єкти
Логіка об’єктів
Активний об’єкт

Об’єкт вважається активним, поки по ньому регулярно надходять оновлення з сервера.

Втрачений об’єкт (lost)

Якщо сервер перестає надсилати інформацію по об’єкту, фронтенд сам визначає його як втрачений.

Поточна логіка:

якщо об’єкт не оновлювався більше 10 секунд, він переходить у стан lost
після цього він більше не рухається
через 5 хвилин після переходу в lost об’єкт прибирається з мапи

Важливо:

сервер не надсилає стан lost
фронтенд обчислює його самостійно
це відповідає умові задачі
Авторизація

Авторизація реалізована через структурований ключ доступу.

Формат ключа:

base64 від рядка виду:
access:<seed>

де:

access — фіксований префікс
seed — число довжиною від 4 до 8 цифр

Приклад вихідного рядка:

access:48291

Приклад валідного ключа:

YWNjZXNzOjQ4Mjkx

Такий підхід дозволяє:

уникнути “будь-якого тексту як пароля”
зробити авторизацію більш схожою на реальний API key/token

Технології
React
TypeScript
MobX
Material UI
Leaflet
WebSocket
Express
Node.js
Архітектурні рішення

У застосунку розділено кілька типів стану:

AuthStore — авторизація
ObjectStore — доменні дані по об’єктах
ConnectionStore — стан WebSocket-з’єднання
MapUiStore — UI-стан мапи (вибраний об’єкт)

Також були винесені окремо:

WebSocket client
карта
шар маркерів
панель інформації про вибраний об’єкт
Оптимізація продуктивності

Застосунок оптимізовано під сценарій 100–200 об’єктів одночасно, як і в умові задачі.

Що вже зроблено:

прибрано важкий React-рендер кожного marker через JSX
використано imperative оновлення Leaflet-маркерів
рендеряться тільки об’єкти в поточному viewport
прибрано Popup на кожному marker
інформація показується в окремій панелі
знижено частоту візуальної анімації для кращої стабільності
Що можна було б покращити при масштабуванні

Якщо б система мала працювати зі значно більшою кількістю об’єктів, я б далі працював у таких напрямках:

перехід з DOM-based marker rendering на Canvas або WebGL
кластеризація об’єктів
spatial indexing для швидкої фільтрації у viewport
батчинг оновлень
винесення анімаційних розрахунків у Web Worker
подальше зменшення реактивного навантаження на UI

Поточна архітектура дозволяє це зробити без повного переписування застосунку.

Запуск локально

1. Встановити залежності
   npm install
2. Запуск у режимі розробки
   npm run start

Це запустить:

Vite dev server
Node/WebSocket server 3. Production-like запуск
npm run build
npm run serve

Після цього застосунок буде доступний на:

http://localhost:3001
Деплой

Для простоти деплою застосунок був адаптований до моделі:

один Node server
один WebSocket server
фронтенд роздається тим самим сервером

Це спрощує розгортання на платформах на кшталт:

Render
Railway
Fly.io
VPS / Docker

Структура проєкту
src/
app/
pages/
stores/
shared/
widgets/

server/
index.js

English version
Project Overview

This is a frontend application for real-time tracking of moving objects on a map.

Each object has:

unique identifier
coordinates
movement direction
type: own / foreign

Data is delivered through WebSocket from a mock server.

Main Features
API key-based authentication
map visualization of moving objects
direction rendering
own vs foreign object distinction
automatic lost object detection
automatic removal of lost objects after 5 minutes
WebSocket connection status indicator
automatic reconnect
object selection on click
details panel for selected object
mock server that generates, moves, and removes objects
Object Lifecycle Logic
Active object

An object is considered active while updates for it continue to arrive from the server.

Lost object

If the server stops sending updates for an object, the frontend determines that the object is lost.

Current logic:

if an object is not updated for more than 10 seconds, it becomes lost
once lost, it stops moving
after 5 minutes, it is removed from the map

Important:

the server does not send lost state
the frontend calculates it independently
this matches the task requirements
Authentication

Authentication is implemented using a structured access key.

Key format:

base64 of a string in the form:
access:<seed>

where:

access is a fixed prefix
seed is a 4 to 8 digit number

Example raw string:

access:48291

Example valid key:

YWNjZXNzOjQ4Mjkx

This approach:

avoids using any random plain string as a password
makes authentication closer to a real API key/token format
keeps the test task implementation simple
Tech Stack
React
TypeScript
MobX
Material UI
Leaflet
WebSocket
Express
Node.js
Architecture

The application separates several types of state:

AuthStore — authentication state
ObjectStore — object domain state
ConnectionStore — WebSocket connection state
MapUiStore — map UI state (selected object)

Also separated into dedicated modules:

WebSocket client
map widget
markers layer
selected object details panel
Performance Optimizations

The application is optimized for the task scale of 100–200 simultaneous objects.

Implemented optimizations:

removed heavy React rendering of each map marker
switched to imperative Leaflet marker updates
render only objects inside the current viewport
removed Popup from every marker
replaced marker popups with a separate info panel
reduced animation frequency for better runtime stability
Scaling Considerations

If the system had to support significantly larger scale, the next steps would be:

switch from DOM-based marker rendering to Canvas or WebGL
add marker clustering
introduce spatial indexing for fast viewport filtering
batch updates more aggressively
move animation calculations to Web Workers
further reduce UI reactivity overhead

The current architecture allows these improvements without a complete rewrite.

Local Run

1. Install dependencies
   npm install
2. Start in development mode
   npm run start

This starts:

Vite dev server
Node/WebSocket server 3. Production-like run
npm run build
npm run serve

Then the app will be available at:

http://localhost:3001
Deployment

To simplify deployment, the application was adapted to the following model:

one Node server
one WebSocket server
frontend static build served by the same server

This makes deployment straightforward on platforms such as:

Render
Railway
Fly.io
VPS / Docker
Project Structure
src/
app/
pages/
stores/
shared/
widgets/

server/
index.js
