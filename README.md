# CV Maker — AI-Powered Resume Editor 🚀

Sebuah aplikasi pembuat CV pintar berbasis AI yang dirancang untuk mempercepat pembuatan CV profesional. Aplikasi ini memiliki fitur *Real-time preview*, integrasi AI Chat untuk memperbaiki tata bahasa, menyesuaikan CV dengan lowongan pekerjaan (*Job Match*), dan sinkronisasi otomatis menggunakan **Supabase**.

## 🌟 Fitur Utama
- **AI Chat Assistant:** Ngobrol dengan AI untuk memperbaiki bahasa, menerjemahkan, atau memperkuat deskripsi pengalaman kerja Anda (Didukung oleh Groq Llama 3).
- **Auto-Sync to Cloud:** CV akan otomatis tersimpan ke **Supabase** secara real-time.
- **Library CV:** Anda bisa menyimpan hingga 10 versi CV yang berbeda.
- **Job Matching Score:** Paste deskripsi lowongan pekerjaan (*Job Description*), dan AI akan memberikan skor kecocokan serta saran perbaikan.
- **Export to PDF & JSON:** Unduh CV Anda dalam format PDF yang rapi atau JSON untuk dicadangkan.

---

## 🛠️ Persyaratan Sistem & Deployment

Aplikasi ini dibangun menggunakan **React (Vite)** dan sangat mudah di-*deploy* ke **Netlify** atau Vercel.

### 1. Kredensial yang Dibutuhkan
Sebelum melakukan deploy, Anda perlu menyiapkan 3 kredensial utama:

- **Supabase URL & Anon Key**: Buat project gratis di [Supabase](https://supabase.com/).
- **Groq API Key**: Dapatkan kunci API Llama 3 gratis dari [Groq Console](https://console.groq.com/).

### 2. Setup Supabase (Database & Auth)
Setelah membuat project di Supabase, Anda harus mengatur tabel database.
1. Buka menu **SQL Editor** di dashboard Supabase.
2. Jalankan *query* berikut:
```sql
CREATE TABLE cv_documents (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Mengaktifkan Row Level Security (RLS)
ALTER TABLE cv_documents ENABLE ROW LEVEL SECURITY;

-- Membuat Policy agar User hanya bisa melihat CV miliknya sendiri
CREATE POLICY "Users can only access own CVs"
  ON cv_documents FOR ALL
  USING (auth.uid() = user_id);
```
3. Buka menu **Authentication > Providers**, lalu nyalakan **Google**.

### 3. Cara Deploy ke Netlify
1. *Fork* atau *Push* repositori ini ke akun GitHub Anda.
2. Buka [Netlify](https://app.netlify.com/), pilih **Add new site > Import an existing project**.
3. Pilih repositori GitHub ini.
4. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
5. **Environment Variables:** Tambahkan 3 variabel ini (tanpa tanda kutip):
   - `VITE_SUPABASE_URL` = (URL project Supabase Anda)
   - `VITE_SUPABASE_ANON_KEY` = (Anon public key Supabase Anda)
   - `VITE_GROQ_API_KEY` = (API key Groq Anda)
6. Klik **Deploy Site**.
7. **PENTING:** Setelah Netlify selesai *deploy*, copy URL Netlify Anda (misal: `https://my-cv.netlify.app`). Buka Supabase ➔ **Authentication > URL Configuration**, lalu tambahkan URL Netlify Anda ke kolom **Site URL** dan **Redirect URLs**.

---

## 💻 Cara Menjalankan di Lokal (Local Development)

1. Clone repositori ini:
   ```bash
   git clone https://github.com/USERNAME/cv-maker-public.git
   cd cv-maker-public
   ```
2. Install dependensi:
   ```bash
   npm install
   ```
3. Buat file `.env` di folder utama dan isi dengan kredensial Anda (lihat file `.env.example`).
4. Jalankan aplikasi:
   ```bash
   npm run dev
   ```
5. Buka `http://localhost:5173` di browser Anda.
