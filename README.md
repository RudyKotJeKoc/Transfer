# Transfer Management System - Backend Architecture

## Projekt Transformacji Architektonicznej

Aplikacja zarządzania transferem maszyn z profesjonalnym backendem (Node.js + Express + SQLite) oraz bezpiecznym uwierzytelnianiem (JWT + bcrypt).

## Struktura Projektu

```
Transfer/
├── server/                 # Backend API
│   ├── config/            # Konfiguracja bazy danych
│   ├── models/            # Modele danych (User, Machine)
│   ├── routes/            # API endpoints (auth, machines)
│   ├── middleware/        # JWT authentication middleware
│   ├── scripts/           # Skrypty pomocnicze (initDb.js)
│   ├── .env               # Zmienne środowiskowe
│   ├── server.js          # Główny plik serwera
│   └── package.json       # Zależności backendu
├── public/                # Frontend assets
│   ├── config.js          # Konfiguracja API
│   └── api.js             # API helper functions
├── login.html             # Strona logowania
├── index.html             # Główna aplikacja (Dashboard + Gantt)
└── README.md              # Ta dokumentacja
```

## Architektura Backend

### Baza Danych (SQLite)

#### Tabele:
1. **users** - Użytkownicy systemu
   - id, username, password (bcrypt), email, role
   - Domyślni użytkownicy: Roy, Jiri (admin), Hans, Remon, Patrick (technician), itd.

2. **machines** - Maszyny
   - Podstawowe: type, number, status, destination, line, responsible
   - Techniczne: weight, dimensions, power, voltage, oil
   - Planowanie: dismantling_date, transport_date, installation_date, ppap_date
   - Dokumentacja: ce_certificate, manual_link

3. **machine_history** - Audit trail
   - Automatyczne logowanie wszystkich zmian

### API Endpoints

#### Uwierzytelnianie (`/api/auth`)
- `POST /login` - Logowanie użytkownika → zwraca JWT token
- `POST /register` - Rejestracja nowego użytkownika
- `GET /me` - Pobranie danych zalogowanego użytkownika
- `POST /verify` - Weryfikacja ważności tokenu

#### Maszyny (`/api/machines`)
- `GET /` - Lista maszyn (z filtrami: status, destination, responsible, search)
- `GET /statistics` - Statystyki (total, by destination, by status)
- `GET /:id` - Szczegóły maszyny
- `GET /:id/history` - Historia zmian maszyny
- `POST /` - Dodanie nowej maszyny
- `PUT /:id` - Aktualizacja maszyny
- `DELETE /:id` - Usunięcie maszyny

Wszystkie endpointy maszyn wymagają autoryzacji (Bearer token).

## Instalacja i Uruchomienie

### Backend

```bash
cd server

# Instalacja zależności
npm install

# Inicjalizacja bazy danych z domyślnymi użytkownikami
npm run init-db

# Uruchomienie serwera
npm start

# Lub w trybie development (auto-restart)
npm run dev
```

Serwer będzie dostępny na: `http://localhost:3000`

### Frontend

Uruchom prosty serwer HTTP w głównym katalogu:

```bash
# Python 3
python -m http.server 8080

# Lub Node.js
npx http-server -p 8080
```

Aplikacja będzie dostępna na: `http://localhost:8080/login.html`

## Domyślne Konta

| Username | Password | Rola        |
|----------|----------|-------------|
| Roy      | roy123   | admin       |
| Jiri     | jiri123  | admin       |
| Hans     | hans123  | technician  |
| Remon    | remon123 | technician  |
| Patrick  | patrick123 | technician |

**WAŻNE:** Zmień hasła przed wdrożeniem produkcyjnym!

## Bezpieczeństwo

### Zaimplementowane zabezpieczenia:
✅ Hashowanie haseł (bcrypt, 10 rounds)
✅ JWT token authentication (30 min expiry)
✅ CORS protection
✅ SQL injection prevention (parametryzowane zapytania)
✅ Password leak prevention (hasła nigdy nie są zwracane w API)
✅ Audit trail (historia zmian)

### Usunięte zagrożenia:
❌ Niezabezpieczony PIN ("112", "00323")
❌ localStorage do przechowywania wrażliwych danych
❌ Brak uwierzytelniania

## Główne Zmiany

### Przed (Old Architecture)
- ❌ Dane w localStorage
- ❌ PIN zamiast prawdziwego uwierzytelniania
- ❌ Brak backendu
- ❌ Brak audit trail
- ❌ Duplikacja kodu (index.html + transfer.html)

### Po (New Architecture)
- ✅ SQLite database
- ✅ JWT authentication + bcrypt
- ✅ RESTful API (Node.js + Express)
- ✅ Pełny audit trail
- ✅ Scalone pliki frontend

## Konfiguracja

### Zmienne środowiskowe (server/.env)

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=change_this_in_production
JWT_EXPIRES_IN=30m
DB_PATH=./database.sqlite
CORS_ORIGIN=http://localhost:8080
```

## API Usage Examples

### Login
```javascript
const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'Roy', password: 'roy123' })
});

const { token, user } = await response.json();
```

### Get Machines
```javascript
const response = await fetch('http://localhost:3000/api/machines', {
    headers: { 'Authorization': `Bearer ${token}` }
});

const { data: machines } = await response.json();
```

### Create Machine
```javascript
const response = await fetch('http://localhost:3000/api/machines', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        type: 'Spuitgietmachine',
        number: '23',
        status: 'In productie',
        destination: 'CZ',
        responsible: 'Roy',
        notes: 'PPAP vereist'
    })
});
```

## Development Roadmap

### ✅ Faza 1: Backend (COMPLETED)
- [x] Struktura projektu
- [x] SQLite database schema
- [x] User model z bcrypt
- [x] Machine model
- [x] JWT authentication
- [x] API endpoints
- [x] Database initialization

### 🔄 Faza 2: Frontend Refactor (IN PROGRESS)
- [x] Login page
- [x] API helper functions
- [ ] Refactor index.html (localStorage → API)
- [ ] Merge transfer.html functionality
- [ ] Real-time updates

### 📋 Faza 3: Testing & Deployment (PENDING)
- [ ] Integration tests
- [ ] E2E tests
- [ ] Production deployment
- [ ] Documentation
- [ ] Pull Request

## Wsparcie

Aby zgłosić problem lub zaproponować poprawkę, utwórz Issue w repozytorium GitHub.

## Licencja

ISC