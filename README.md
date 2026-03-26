# SmartStudy

SmartStudy je sodobna spletna aplikacija, zasnovana za pomoč učencem in študentom pri organizaciji časa, predmetov, nalog ter komunikaciji z vrstniki. Razvita je z uporabo tehnologij **React**, **Vite**, **Tailwind CSS** (s pomirjujočo in moderno barvno paleto [Rosé Pine](https://rosepinetheme.com/)) ter **Firebase** za hrambo podatkov in varno avtentikacijo.

---

## 🚀 Glavne funkcionalnosti

*   **Avtentikacija**: Varna prijava in registracija uporabnikov z uporabo storitve Firebase Authentication.
*   **Nadzorna plošča (Dashboard)**: Hiter in celovit pregled trenutnih aktivnosti, prihajajočih obveznosti ter statistike učenja.
*   **Upravljanje predmetov (Subjects)**: Dodajanje in urejanje učnih predmetov za lažjo organizacijo gradiv in posameznih nalog.
*   **Naloge in zadolžitve (Tasks)**: Sledenje in upravljanje šolskih obveznosti (TODO seznam funkcionalnost z določanjem rokov in statusov).
*   **Urnik (Schedule)**: Planiranje učenja in enostaven pregled celotnega šolskega urnika.
*   **Klepet (Chat)**: Vgrajen sistem za pošiljanje sporočil med prijatelji v realnem času.
*   **Prijatelji (Friends)**: Dodajanje in upravljanje seznama prijateljev in sošolcev za lažje skupinsko učenje ter komunikacijo.
*   **Uporabniški profil (Profile)**: Urejanje osebnih nastavitev profila in personalizacija izkušnje.

---

## 🛠️ Uporabljene tehnologije

Projekt je zgrajen z najnovejšimi orodji za zagotavljanje hitrosti, varnosti in vrhunske uporabniške izkušnje:

*   **[React 19](https://react.dev/)** - Temeljna knjižnica za postopajočo gradnjo uporabniških vmesnikov (UI).
*   **[Vite](https://vitejs.dev/)** - Izjemno hitro orodje za razvoj in gradnjo spletnih aplikacij.
*   **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS ogrodje za hitro implementacijo stilov, obogateno z edinstveno in estetsko **Rosé Pine** barvno temo.
*   **[Firebase](https://firebase.google.com/)** - Backend as a Service (BaaS) za upravljanje s podatkovno bazo (Firestore) v realnem času ter avtentikacijo.
*   **React Router Dom** - Upravljanje navigacije in zaščitenih poti (Protected Routes) znotraj in po aplikaciji.

---

## 📂 Struktura projekta

Ključne datoteke so organizirane znotraj `src` mape, in sicer:

*   `/src/pages` - Vsebuje glavne ekrane oziroma poglede aplikacije (npr. *LoginPage*, *RegisterPage*, *DashboardPage*, *ChatPage*, *TasksPage*, *SchedulePage*, itd.).
*   `/src/components` - Vsebuje ponovno uporabne (reusable) komponente (npr. *Modali*, *Kartice nalog/predmetov*, *Layout*, oznake).
*   `/src/contexts` - Vsebuje React kontekste (npr. *AuthContext* za globalno upravljanje s stanjem in podatki prijavljenega uporabnika).
*   `/src/hooks` - Vsebuje prilagojene in namensko napisane React hooks za lažjo enkapsulacijo logike.
*   `/src/utils` - Razne pomožne funkcije in orodja.

---

## 💻 Namestitev in zagon projekta lokalno

Če želite projekt zagnati in testirati na svojem računalniku, sledite tem korakom:

1.  **Klonirajte repozitorij:**
    ```bash
    git clone https://github.com/ShelbyVG/SmartStudy.git
    cd SmartStudy
    ```

2.  **Namestite odvisnosti:**
    S pomočjo pakirnega upravitelja npm namestite vse potrebne pakete:
    ```bash
    npm install
    ```

3.  **Konfigurirajte spremenljivke okolja (Environment Variables):**
    Za nemoteno delovanje in povezavo z bazo je potrebno nastaviti ključe od Firebase storitve. Kopirajte vsebino iz `.env.example` in ustvarite novo datoteko imenovano `.env.local` ali `.env`.
    ```bash
    cp .env.example .env.local
    ```
    *(Nato v .env.local vnesite vaše pridobljene Firebase ključe API.)*

4.  **Zaženite razvojni strežnik:**
    ```bash
    npm run dev
    ```

5.  **Odprite aplikacijo:**
    V svojem najljubšem brskalniku odprite povezavo, ki jo vrne Vite, običajno je to: `http://localhost:5173`.

---

## 📜 Razpoložljive NPM skripte

V datoteki `package.json` so na voljo naslednji ukazi za upravljanje s projektom:
*   `npm run dev` – Zažene lokalni strežnik za razvoj (razvojni način).
*   `npm run build` – Zgradi optimizirano produkcijsko različico aplikacije z Vite (odloži datoteke v mapo `dist`).
*   `npm run lint` – Aktivira ESLint za pregled kode in iskanje morebitnih napak pri sintaksi ali pravilih koda.
*   `npm run preview` – Zažene poglede in simulira način, kako bi testirali že postavljeno (zgrajeno) produkcijsko različico lokalno aplikacije znotraj `dist`.
