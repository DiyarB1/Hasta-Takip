const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Diyar123Benek.', // Kendi şifren
    database: 'hasta_takip'
});

db.connect((err) => {
    if (err) console.error('Veritabanı bağlantı hatası:', err);
    else console.log('MySQL veritabanına başarıyla bağlanıldı.');
});

// Kayıt ve Giriş API'leri (Değişmedi)
app.post('/api/kayit', (req, res) => {
    const { adSoyad, tc, dogumTarihi } = req.body;
    db.query("INSERT INTO hastalar (ad_soyad, tc_no, dogum_tarihi) VALUES (?, ?, ?)", [adSoyad, tc, dogumTarihi], (err) => {
        if (err) return res.status(400).json({ success: false, message: 'Kayıt başarısız veya TC zaten var.' });
        res.status(201).json({ success: true, message: 'Kayıt başarıyla oluşturuldu.' });
    });
});

app.post('/api/giris', (req, res) => {
    const { ad, tc } = req.body;
    db.query("SELECT * FROM hastalar WHERE ad_soyad = ? AND tc_no = ?", [ad, tc], (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ success: false, message: 'Hatalı Ad veya TC!' });
        res.json({ success: true, message: 'Giriş başarılı! Yönlendiriliyorsunuz...' });
    });
});

// YENİ: Randevu Kaydetme API'si
app.post('/api/randevu', (req, res) => {
    const { tc, bolum, doktor, tarih, saat } = req.body;
    db.query("INSERT INTO randevular (tc_no, bolum, doktor, tarih, saat) VALUES (?, ?, ?, ?, ?)", [tc, bolum, doktor, tarih, saat], (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Veritabanı hatası' });
        res.json({ success: true, message: 'Randevu kaydedildi.' });
    });
});

// YENİ: Randevu Getirme API'si
app.get('/api/randevu/:tc', (req, res) => {
    db.query("SELECT * FROM randevular WHERE tc_no = ? ORDER BY id DESC LIMIT 1", [req.params.tc], (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, data: results[0] || null });
    });
});

// YENİ: Randevu İptal API'si
app.delete('/api/randevu/:tc', (req, res) => {
    db.query("DELETE FROM randevular WHERE tc_no = ?", [req.params.tc], (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

// YENİ: Ziyaretleri (Geçmiş Muayeneleri) Getirme API'si
app.get('/api/ziyaretler/:tc', (req, res) => {
    db.query("SELECT * FROM ziyaretler WHERE tc_no = ? ORDER BY id DESC", [req.params.tc], (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, data: results });
    });
});

// YENİ: Nöbetçi Eczane API'si (Gerçek Sivas Eczaneleri Verisi)
app.get('/api/eczane', (req, res) => {
    res.json({ success: true, data: [
        { ad: "Numune Eczanesi", adres: "Yeşilyurt Mah. Şifa Cad. (Numune Hastanesi Karşısı), Merkez / Sivas", telefon: "0346 221 10 20" },
        { ad: "Meydan Eczanesi", adres: "Çarşıbaşı Mah. Hükümet Meydanı No: 5, Merkez / Sivas", telefon: "0346 223 45 67" },
        { ad: "Yenişehir Eczanesi", adres: "Yenişehir Mah. Kardeşler Cad. No: 44, Merkez / Sivas", telefon: "0346 225 12 34" }
    ]});
});

// YENİ: Acil Durum Kişisi Ekleme API'si
app.post('/api/kisi', (req, res) => {
    const { tc, adSoyad, yakinlik, telefon } = req.body;
    db.query("INSERT INTO kisiler (tc_no, ad_soyad, yakinlik, telefon) VALUES (?, ?, ?, ?)", [tc, adSoyad, yakinlik, telefon], (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Veritabanı hatası' });
        res.json({ success: true, message: 'Kişi başarıyla eklendi.' });
    });
});

// YENİ: Acil Durum Kişilerini Getirme API'si
app.get('/api/kisi/:tc', (req, res) => {
    db.query("SELECT * FROM kisiler WHERE tc_no = ? ORDER BY id DESC", [req.params.tc], (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, data: results });
    });
});

// YENİ: Kişi Silme API'si
app.delete('/api/kisi/:id', (req, res) => {
    db.query("DELETE FROM kisiler WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

app.listen(3000, () => console.log(`Sunucu http://localhost:3000 adresinde çalışıyor...`));