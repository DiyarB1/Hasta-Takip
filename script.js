window.tcKontrol = function(input) {
    input.value = input.value.replace(/[^0-9]/g, '');
    if (input.value.length > 11) {
        input.value = input.value.slice(0, 11);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. GİRİŞ İŞLEMLERİ
    const girisForm = document.getElementById('girisForm');
    if (girisForm) {
        girisForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const ad = document.getElementById('ad').value;
            const tc = document.getElementById('tc').value;

            if(tc.length !== 11) {
                alert("TC Kimlik Numarası 11 haneli olmalıdır!");
                return;
            }

            try {
                const response = await fetch('http://127.0.0.1:3000/api/giris', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ad, tc })
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message); 
                    localStorage.setItem('aktifKullaniciAdi', ad); 
                    localStorage.setItem('aktifKullaniciTC', tc); 
                    
                    const profilTamam = localStorage.getItem('profilTamamlandi_' + tc);
                    
                    if(profilTamam === 'evet') {
                        window.location.href = 'anasayfa.html';
                    } else {
                        window.location.href = 'kisiselbilgiler.html';
                    }
                } else {
                    alert('Hata: ' + data.message); 
                }
            } catch (error) {
                console.error('Giriş hatası:', error);
                alert('Sunucuya bağlanılamadı. Node.js sunucusunun açık olduğundan emin olun.');
            }
        });
    }

    // 2. KAYIT İŞLEMLERİ
    const kayitForm = document.getElementById('kayitForm');
    if (kayitForm) {
        kayitForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const adSoyad = document.getElementById('adSoyad').value;
            const tc = document.getElementById('tc').value;
            const dogumTarihi = document.getElementById('dogumTarihi').value;

            if(tc.length !== 11) {
                alert("TC Kimlik Numarası 11 haneli olmalıdır!");
                return;
            }

            try {
                const response = await fetch('http://127.0.0.1:3000/api/kayit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adSoyad, tc, dogumTarihi })
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message); 
                    window.location.href = 'giriş.html'; 
                } else {
                    alert('Hata: ' + data.message); 
                }
            } catch (error) {
                console.error('Bağlantı hatası:', error);
                alert('Sunucuya bağlanılamadı. Lütfen sunucunun açık olduğundan emin olun.');
            }
        });
    }

    // İSİM YAZDIRMA
    const adAlani = document.getElementById('kullaniciAdAlani');
    if(adAlani) {
        const girisYapanAd = localStorage.getItem('aktifKullaniciAdi');
        adAlani.innerText = girisYapanAd ? girisYapanAd.toUpperCase() : "MISAFIR KULLANICI";
    }

// ORGAN BAĞIŞI KONTROLÜ
    const organBagisiKutusu = document.getElementById('organBagisiKutusu');
    if(organBagisiKutusu) {
        const aktifTC = localStorage.getItem('aktifKullaniciTC');
        const bagisDurumu = localStorage.getItem('organBagisi_' + aktifTC);
        
        if(bagisDurumu === 'onaylandi') {
            organBagisiKutusu.innerHTML = `
                <i class="fa-solid fa-address-card" style="color: #10b981; font-size: 24px; margin-bottom: 12px; padding: 8px; border: 2px solid #10b981; border-radius: 50%;"></i>
                <span style="font-weight: 700; font-size: 16px; color: #10b981; margin-bottom: 5px;">Bağışçısınız</span>
                <span style="font-size: 12px; color: #475569; font-weight: normal; text-align: left; line-height: 1.4;">İnsanlığa yaptığınız katkı için teşekkür ederiz.</span>
            `;
            
            organBagisiKutusu.onclick = function() {
                const modal = document.getElementById('bilgiModal');
                if(modal) {
                    let kayitTarihi = localStorage.getItem('bagisTarihi_' + aktifTC);
                    let kayitSaati = localStorage.getItem('bagisSaati_' + aktifTC);
                    let kayitGunu = localStorage.getItem('bagisGunu_' + aktifTC);
                    
                    // YENİ: Hangi organların bağışlandığını dinamik olarak hafızadan çek
                    let bagislananOrganlar = localStorage.getItem('bagislananOrganlar_' + aktifTC) || 'Tüm Doku ve Organlar';

                    if (!kayitTarihi) {
                        const simdi = new Date();
                        const gunler = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
                        kayitTarihi = simdi.toLocaleDateString('tr-TR');
                        kayitSaati = simdi.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
                        kayitGunu = gunler[simdi.getDay()];
                        
                        localStorage.setItem('bagisTarihi_' + aktifTC, kayitTarihi);
                        localStorage.setItem('bagisSaati_' + aktifTC, kayitSaati);
                        localStorage.setItem('bagisGunu_' + aktifTC, kayitGunu);
                    }

                    document.getElementById('bilgiBaslik').innerText = 'Organ Bağışçısı Detayları';
                    
                    // İçeriği dinamik tarih, saat, gün ve dinamik organ listesi ile değiştir
                    document.getElementById('bilgiIcerik').innerHTML = `
                        <div style="text-align: left; font-size: 14px; margin-top: 10px; color: #334155;">
                            <p style="margin-bottom: 15px; text-align: center;">İnsanlığa yaptığınız bu eşsiz katkı için teşekkür ederiz!</p>
                            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                <p style="margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0;"><strong><i class="fa-solid fa-hand-holding-heart" style="color:#0284c7; width:20px;"></i> Bağışlanan:</strong> ${bagislananOrganlar}</p>
                                <p style="margin-bottom: 8px;"><strong><i class="fa-regular fa-calendar-days" style="color:#0284c7; width:20px;"></i> Tarih:</strong> ${kayitTarihi}</p>
                                <p style="margin-bottom: 8px;"><strong><i class="fa-regular fa-calendar" style="color:#0284c7; width:20px;"></i> Gün:</strong> ${kayitGunu}</p>
                                <p style="margin-bottom: 0;"><strong><i class="fa-regular fa-clock" style="color:#0284c7; width:20px;"></i> Saat:</strong> ${kayitSaati}</p>
                            </div>
                        </div>
                    `;
                    
                    const ikon = document.getElementById('bilgiİkon');
                    ikon.className = 'fa-solid fa-heart-circle-check';
                    ikon.style.color = '#10b981';
                    
                    const formAlani = modal.querySelector('.modal-box');
                    const eskiButonlar = formAlani.querySelectorAll('.bagis-iptal-btn');
                    eskiButonlar.forEach(btn => btn.remove());
                    
                    const iptalButonu = document.createElement('button');
                    iptalButonu.className = 'update-btn bagis-iptal-btn';
                    iptalButonu.style.backgroundColor = '#ef4444';
                    iptalButonu.style.marginTop = '15px';
                    iptalButonu.innerText = 'Bağışımı İptal Et';
                    iptalButonu.onclick = function() {
                        if(confirm('Organ bağışınızı iptal etmek istediğinize emin misiniz?')) {
                            localStorage.removeItem('organBagisi_' + aktifTC);
                            localStorage.removeItem('bagisTarihi_' + aktifTC);
                            localStorage.removeItem('bagisSaati_' + aktifTC);
                            localStorage.removeItem('bagisGunu_' + aktifTC);
                            localStorage.removeItem('bagislananOrganlar_' + aktifTC); // Organ bilgisini de sil
                            alert('Organ bağışınız sistemden iptal edilmiştir.');
                            window.location.reload(); 
                        }
                    };
                    
                    formAlani.appendChild(iptalButonu);
                    modal.style.display = 'flex';
                }
            };
        }
    }

    // 3. PROFİL VE SİGORTA AYARLARI KAYDI
    const ayarlarForm = document.getElementById('ayarlarForm');
    if(ayarlarForm) {
        ayarlarForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const aktifTC = localStorage.getItem('aktifKullaniciTC'); 
            
            const guncelVeriler = {
                babaAdi: document.getElementById('ayarBabaAdi').value,
                anneAdi: document.getElementById('ayarAnneAdi').value,
                kanGrubu: document.getElementById('ayarKanGrubu').value,
                sigorta: document.getElementById('ayarSigorta').value,
                telefon: document.getElementById('ayarTelefon').value,
                boy: document.getElementById('ayarBoy').value,
                kilo: document.getElementById('ayarKilo').value,
                adres: document.getElementById('ayarAdres').value,
                hastaliklar: document.getElementById('ayarHastaliklar').value
            };
            
            localStorage.setItem('profilVerileri_' + aktifTC, JSON.stringify(guncelVeriler));
            bilgiModalAc('Başarılı', 'Kişisel ve Sigorta bilgileriniz sisteme başarıyla kaydedildi.', 'fa-circle-check', '#10b981');
            ayarlarModalKapat();
        });
    }

    // 4. VERİTABANI API İLE YÜKLEMELER
    randevuYukle();
    ziyaretleriYukle();

    const randevuForm = document.getElementById('randevuForm');
    if(randevuForm) {
        randevuForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const aktifTC = localStorage.getItem('aktifKullaniciTC');
            
            const randevuVerisi = {
                tc: aktifTC,
                bolum: document.getElementById('randevuBolum').value,
                doktor: document.getElementById('randevuDoktor').value,
                tarih: document.getElementById('randevuTarih').value,
                saat: document.getElementById('randevuSaat').value
            };
            
            try {
                await fetch('http://127.0.0.1:3000/api/randevu', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(randevuVerisi)
                });
                bilgiModalAc('Randevu Onayı', 'Randevunuz veritabanına başarıyla kaydedildi.', 'fa-calendar-check', '#10b981');
                randevuModalKapat();
                randevuYukle(); 
            } catch(error) {
                bilgiModalAc('Hata', 'Randevu kaydedilemedi. Sunucu bağlantısını kontrol edin.', 'fa-triangle-exclamation', '#ef4444');
            }
        });
    }

    // ARAMA ÇUBUĞU İŞLEVİ
    const aramaInput = document.getElementById('aramaCubugu');
    if(aramaInput) {
        aramaInput.addEventListener('keypress', function(e) {
            if(e.key === 'Enter' && this.value.trim() !== '') {
                bilgiModalAc('Arama Sonucu', '"' + this.value + '" araması için sisteminizde eşleşen bir kayıt bulunamadı.', 'fa-magnifying-glass', '#64748b');
                this.value = '';
            }
        });
    }
});

// AÇILIR MENÜ GİZLE/GÖSTER
window.toggleDropdown = function() {
    const dropdown = document.getElementById("userDropdown");
    if(dropdown) dropdown.classList.toggle("show");
}

// AYARLAR MODALI İŞLEMLERİ
window.ayarlarModalAc = function() {
    const modal = document.getElementById('ayarlarModal');
    const aktifTC = localStorage.getItem('aktifKullaniciTC'); 
    
    if(modal) {
        modal.style.display = 'flex';
        document.getElementById("userDropdown").classList.remove("show");
        
        const kayitliVeriler = JSON.parse(localStorage.getItem('profilVerileri_' + aktifTC));
        
        if(kayitliVeriler) {
            document.getElementById('ayarBabaAdi').value = kayitliVeriler.babaAdi || '';
            document.getElementById('ayarAnneAdi').value = kayitliVeriler.anneAdi || '';
            document.getElementById('ayarKanGrubu').value = kayitliVeriler.kanGrubu || '';
            document.getElementById('ayarSigorta').value = kayitliVeriler.sigorta || '';
            document.getElementById('ayarTelefon').value = kayitliVeriler.telefon || '';
            document.getElementById('ayarBoy').value = kayitliVeriler.boy || '';
            document.getElementById('ayarKilo').value = kayitliVeriler.kilo || '';
            document.getElementById('ayarAdres').value = kayitliVeriler.adres || '';
            document.getElementById('ayarHastaliklar').value = kayitliVeriler.hastaliklar || '';
        } else {
            document.getElementById('ayarlarForm').reset();
        }
    }
}

window.ayarlarModalKapat = function() {
    document.getElementById('ayarlarModal').style.display = 'none';
}

// RANDEVU SİSTEMİ FONKSİYONLARI (VERİTABANINDAN)
window.randevuModalAc = function() {
    const modal = document.getElementById('randevuModal');
    if(modal) modal.style.display = 'flex';
}

window.randevuModalKapat = function() {
    document.getElementById('randevuModal').style.display = 'none';
}

// RANDEVU SİSTEMİ FONKSİYONLARI (Tarih Kontrollü ve Otomatik Silme)
window.randevuYukle = async function() {
    const aktifTC = localStorage.getItem('aktifKullaniciTC');
    const mesajAlani = document.getElementById('randevuYokMesaji');
    const kartAlani = document.getElementById('randevuKarti');
    
    if(mesajAlani && kartAlani) {
        try {
            const response = await fetch('http://127.0.0.1:3000/api/randevu/' + aktifTC);
            const data = await response.json();
            
            if(data.success && data.data) {
                const randevuTarihiStr = data.data.tarih.split('T')[0]; // YYYY-MM-DD
                const randevuZamani = new Date(randevuTarihiStr + 'T' + data.data.saat);
                const simdi = new Date(); // Şu anki tarih ve saat
                
                // Eğer randevu tarihi ve saati geçtiyse otomatik sil ve bildir
                if (simdi >= randevuZamani) {
                    await fetch('http://127.0.0.1:3000/api/randevu/' + aktifTC, { method: 'DELETE' });
                    mesajAlani.style.display = 'block';
                    kartAlani.style.display = 'none';
                    bilgiModalAc('Randevu Süresi Doldu', `Geçmiş tarihli randevunuz (${randevuTarihiStr.split('-').reverse().join('.')} ${data.data.saat}) tamamlandığı için sistemden otomatik olarak kaldırılmıştır.`, 'fa-clock', '#f59e0b');
                    return;
                }
                
                // Tarih henüz geçmediyse randevuyu göster
                document.getElementById('rBolum').innerText = data.data.bolum + " (" + data.data.doktor + ")";
                const formatliTarih = randevuTarihiStr.split('-').reverse().join('.');
                document.getElementById('rTarihSaat').innerText = formatliTarih + " | Saat: " + data.data.saat;
                
                mesajAlani.style.display = 'none';
                kartAlani.style.display = 'block';
            } else {
                mesajAlani.style.display = 'block';
                kartAlani.style.display = 'none';
            }
        } catch(e) {
            console.log("Randevu yüklenemedi");
        }
    }
}

window.randevuIptal = async function() {
    if(confirm("Randevunuzu iptal etmek istediğinize emin misiniz?")) {
        const aktifTC = localStorage.getItem('aktifKullaniciTC');
        try {
            await fetch('http://127.0.0.1:3000/api/randevu/' + aktifTC, { method: 'DELETE' });
            randevuYukle(); 
            bilgiModalAc('İptal Edildi', 'Randevunuz veritabanından silinmiştir.', 'fa-circle-xmark', '#ef4444');
        } catch(e) {
            bilgiModalAc('Hata', 'Silme işlemi başarısız.', 'fa-triangle-exclamation', '#ef4444');
        }
    }
}

// ZİYARETLERİ VERİTABANINDAN ÇEKME
window.ziyaretleriYukle = async function() {
    const alan = document.getElementById('ziyaretAlani');
    if(!alan) return;
    
    const aktifTC = localStorage.getItem('aktifKullaniciTC');
    try {
        const response = await fetch('http://127.0.0.1:3000/api/ziyaretler/' + aktifTC);
        const data = await response.json();
        
        if(data.success && data.data.length > 0) {
            let html = '';
            data.data.forEach(z => {
                const tarihParca = z.tarih.split(' ');
                html += `
                <div class="v-card" onclick="muayeneGoster('${z.hastane}', '${z.bolum}', '${z.doktor}', '${z.tarih}', '${z.teshis}', '${z.notlar}', '${z.recete}')">
                    <div class="v-date"><span>${tarihParca[0]}</span> ${tarihParca[1]} ${tarihParca[2]}</div>
                    <div class="v-info">
                        <h4>${z.hastane}</h4>
                        <p class="clinic">${z.bolum}</p>
                        <p class="dr">${z.doktor}</p>
                    </div>
                </div>`;
            });
            alan.innerHTML = html;
        } else {
            alan.innerHTML = '<p style="color: #64748b; font-size: 14px;">Geçmiş hastane kaydınız bulunmamaktadır.</p>';
        }
    } catch(e) {
        alan.innerHTML = '<p style="color: #ef4444; font-size: 14px;">Veritabanına bağlanılamadı.</p>';
    }
}

// TIBBİ GEÇMİŞ / MUAYENE VE TEŞHİS FONKSİYONU
window.muayeneGoster = function(hastane, bolum, doktor, tarih, teshis, notlar, recete) {
    document.getElementById('mHastane').innerText = hastane;
    document.getElementById('mBolumDr').innerText = bolum + " - " + doktor;
    document.getElementById('mTarih').innerText = tarih;
    document.getElementById('mTeshis').innerText = teshis;
    document.getElementById('mNotlar').innerText = notlar;
    document.getElementById('mRecete').innerText = recete;
    
    document.getElementById('muayeneModal').style.display = 'flex';
}

// GENEL BİLGİ VE UYARI MODALINI AÇAN FONKSİYON
window.bilgiModalAc = function(baslik, icerik, ikonClass = 'fa-circle-info', ikonRenk = '#0284c7') {
    const modal = document.getElementById('bilgiModal');
    if(modal) {
        document.getElementById('bilgiBaslik').innerText = baslik;
        document.getElementById('bilgiIcerik').innerText = icerik;
        
        const ikon = document.getElementById('bilgiİkon');
        ikon.className = 'fa-solid ' + ikonClass;
        ikon.style.color = ikonRenk;
        
        modal.style.display = 'flex';
    }
}

// Ekranda boş bir yere tıklayınca menüleri kapatma
window.addEventListener('click', function(event) {
    if (!event.target.closest('.user-menu-btn')) {
        const dropdowns = document.getElementsByClassName("dropdown-menu");
        for (let i = 0; i < dropdowns.length; i++) {
            if (dropdowns[i].classList.contains('show')) dropdowns[i].classList.remove('show');
        }
    }
});

// =========================================
// AKILLI ARAMA ÇUBUĞU (Otomatik Tamamlama Motoru)
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const aramaCubugu = document.getElementById('aramaCubugu');
    const searchBoxContainer = document.querySelector('.search-box');

    if (aramaCubugu && searchBoxContainer) {
        // Otomatik tamamlama kutusunu dinamik olarak oluştur
        const oneriKutusu = document.createElement('div');
        oneriKutusu.id = 'aramaOnerileri';
        oneriKutusu.className = 'arama-onerileri-dropdown';
        searchBoxContainer.appendChild(oneriKutusu);
        searchBoxContainer.style.position = 'relative'; // Kutunun hizalanması için

        // Sistemdeki sayfalar ve anahtar kelimeleri
        const sayfalar = [
            { ad: 'Randevularım', anahtar: ['r', 'ra', 'ran', 'randevu', 'doktor', 'hastane'], islem: () => { if(typeof randevuModalAc === 'function') randevuModalAc(); } },
            { ad: 'Reçetelerim', anahtar: ['r', 're', 'reç', 'reçete', 'ilaç'], islem: () => { window.location.href = 'recetelerim.html'; } },
            { ad: 'Radyoloji (Röntgen/MR)', anahtar: ['r', 'ra', 'rad', 'radyoloji', 'röntgen', 'emar'], islem: () => { window.location.href = 'radyoloji.html'; } },
            { ad: 'Tahlillerim', anahtar: ['t', 'ta', 'tah', 'tahlil', 'kan'], islem: () => { window.location.href = 'tahlillerim.html'; } },
            { ad: 'Nöbetçi Eczane', anahtar: ['n', 'nö', 'nöb', 'eczane', 'nöbetçi'], islem: () => { window.location.href = 'nobetcieczane.html'; } },
            { ad: 'Kişi Ekle (Acil Durum)', anahtar: ['k', 'ki', 'kiş', 'kişi', 'ekle', 'acil'], islem: () => { window.location.href = 'kisiekle.html'; } },
            { ad: 'Organ Bağışı', anahtar: ['o', 'or', 'org', 'organ', 'bağış'], islem: () => { window.location.href = 'organbagisi.html'; } },
            { ad: 'Aşı Takvimi', anahtar: ['a', 'aş', 'aşı', 'takvim'], islem: () => { window.location.href = 'asitakvimi.html'; } },
            { ad: 'Ayarlar', anahtar: ['a', 'ay', 'aya', 'ayar', 'profil', 'şifre'], islem: () => { if(typeof ayarlarModalAc === 'function') ayarlarModalAc(); } }
        ];

        // Klavye ile yazıldıkça önerileri filtrele
        aramaCubugu.addEventListener('input', function() {
            const kelime = this.value.toLowerCase().trim();
            oneriKutusu.innerHTML = ''; 

            if (!kelime) {
                oneriKutusu.style.display = 'none';
                return;
            }

            // İçinde geçen veya ilgili harfle başlayan sayfaları bul
            const eslesenler = sayfalar.filter(s => s.ad.toLowerCase().includes(kelime) || s.anahtar.some(a => a.startsWith(kelime)));

            if (eslesenler.length > 0) {
                eslesenler.forEach(eslesme => {
                    const div = document.createElement('div');
                    div.className = 'oneri-oge';
                    div.innerHTML = `<i class="fa-solid fa-magnifying-glass" style="margin-right: 8px; color: #94a3b8;"></i> ${eslesme.ad}`;
                    div.onclick = function() {
                        aramaCubugu.value = ''; // Tıklanınca kutuyu temizle
                        oneriKutusu.style.display = 'none';
                        eslesme.islem(); 
                    };
                    oneriKutusu.appendChild(div);
                });
                oneriKutusu.style.display = 'block';
            } else {
                oneriKutusu.style.display = 'none';
            }
        });

        // Ekranda boş bir yere tıklanırsa öneri listesini kapat
        document.addEventListener('click', function(e) {
            if (!searchBoxContainer.contains(e.target)) {
                oneriKutusu.style.display = 'none';
            }
        });

        // Enter tuşuna basılırsa (liste yerine direkt tıklanırsa) ilk eşleşeni aç
        aramaCubugu.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const kelime = this.value.toLowerCase().trim();
                if (!kelime) return;
                const eslesenler = sayfalar.filter(s => s.ad.toLowerCase().includes(kelime) || s.anahtar.some(a => a.startsWith(kelime)));
                if (eslesenler.length > 0) {
                    eslesenler[0].islem();
                } else {
                    if (typeof bilgiModalAc === 'function') {
                        bilgiModalAc('Arama Sonucu', `"${this.value}" araması için sisteminizde eşleşen bir kayıt bulunamadı.`, 'fa-magnifying-glass', '#0284c7');
                    }
                }
            }
        });
    }
}); 