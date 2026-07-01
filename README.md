# Maternal Health Risk Prediction System

Bu proje, hamilelik sürecindeki anne adaylarının hayati bulgularını (tansiyon, kan şekeri, vücut ısısı vb.) analiz ederek Makine Öğrenmesi (Random Forest) algoritması ile risk seviyelerini (Düşük/Orta/Yüksek) anlık olarak tahmin eden tam kapsamlı bir web uygulamasıdır.

## Projeyi Çalıştırma Talimatları

Proje iki ana kısımdan oluşmaktadır: **Backend (Django)** ve **Frontend (React)**. Projeyi lokal bilgisayarınızda çalıştırmak için aşağıdaki adımları sırasıyla uygulayınız.

### 1. Backend (Sunucu) Kurulumu ve Çalıştırılması
Backend, projenin ana dizininde yer almaktadır.

1. Bir terminal (Komut İstemi veya PowerShell) açın ve projenin ana klasörüne gidin.
2. Python sanal ortamını (virtual environment) oluşturun ve aktif edin:
   - **Windows:** 
     ```bash
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **Mac/Linux:** 
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Gerekli kütüphaneleri (Makine öğrenmesi ve Django) yükleyin:
   ```bash
   pip install -r requirements.txt
   ```
4. Veritabanı tablolarını oluşturun:
   ```bash
   python manage.py migrate
   ```
5. Django sunucusunu başlatın:
   ```bash
   python manage.py runserver
   ```
Backend sunucusu `http://127.0.0.1:8000/` adresinde çalışmaya başlayacaktır.

---

### 2. Frontend (Kullanıcı Arayüzü) Kurulumu ve Çalıştırılması
Frontend klasörü, projenin React uygulamasını barındırır. **Yeni bir terminal penceresi açın** ve aşağıdaki adımları uygulayın:

1. Frontend klasörüne gidin:
   ```bash
   cd frontend
   ```
2. Gerekli Node.js paketlerini yükleyin:
   ```bash
   npm install
   ```
3. React geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

Frontend sunucusu genellikle `http://localhost:5173/` adresinde çalışacaktır. Terminalde verilen linke Ctrl'ye basılı tutarak tıklayabilir ve projeyi tarayıcınızda görüntüleyebilirsiniz.

---
**Grup Üyeleri:**
- Fatih Ömer (Backend & AI)
- Mohamad Ghannam (Frontend & UX/UI)
- Obada Alghourani (Database & QA)
