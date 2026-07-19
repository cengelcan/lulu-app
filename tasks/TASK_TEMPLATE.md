# Lulu Task Şablonu

Bu dosya, `tasks/` altında oluşturulacak bütün ürün ve mühendislik görevlerinin ortak şablonudur. Yeni task açılırken bu dosya kopyalanır; ilgili olmayan başlıklar silinmez, `Uygulanmıyor` olarak işaretlenir. Böylece kararlar, kapsam, güvenlik, test ve yayın koşulları tek yerde izlenir.

## Dosya adı

`NNN-kisa-ve-acik-task-adi.md`

- `NNN`: Yol haritasındaki sıra.
- Dosya adı küçük harf ve kebab-case olmalı.
- Bir task tek bir kullanıcı sonucuna hizmet etmeli.

---

# NNN — Task Başlığı

## Task özeti

| Alan | Değer |
|---|---|
| Durum | `Backlog` / `Ready` / `In Progress` / `Blocked` / `QA` / `Done` |
| Öncelik | `P0` / `P1` / `P2` / `P3` |
| Hedef sürüm | Örn. `v1.1` |
| Task türü | Ürün / UX / Altyapı / Plus / Güvenlik / Büyüme |
| Tahmini efor | S / M / L / XL |
| Ürün katmanı | Free / Plus / Her ikisi |
| Bağımlılıklar | Task numaraları veya `Yok` |
| Son güncelleme | `YYYY-MM-DD` |

## Bağlam ve problem

Mevcut davranış, kullanıcı sorunu ve bu işin neden yapılması gerektiği kısa ama kanıtlanabilir biçimde yazılır.

## Kullanıcı sonucu

> Bir kullanıcı olarak … yapabilmek istiyorum; böylece …

## Başarı ölçütleri

- Ölçülebilir ürün sonucu.
- Kalite veya güvenilirlik sonucu.
- Guardrail: iyileşirken bozulmaması gereken metrik/davranış.

## Kapsam

### Dahil

- [ ] Gereksinim

### Kapsam dışı

- Bu task içinde bilinçli olarak yapılmayacak işler.

## Ürün ve UX gereksinimleri

### Ana akış

1. Kullanıcı başlangıç noktası.
2. Ana etkileşim.
3. Başarı durumu.

### Durumlar

- Boş durum
- Yükleniyor
- Hata ve yeniden deneme
- Offline/senkronizasyon
- Yetkisiz veya Plus kilitli
- Silme/geri alma gerekiyorsa ilgili durumlar

### İçerik ve görsel hiyerarşi

- Birincil CTA
- İkincil CTA
- Kullanıcıya gösterilecek kritik bilgi
- Dynamic Type ve dar ekran davranışı

## İş kuralları

- Kural ve sınırlar açık, test edilebilir ifadelerle yazılır.

## Free / Plus davranışı

| Yetenek | Free | Plus |
|---|---|---|
| Örnek | Davranış | Davranış |

Kilit, kullanıcının kendi sağlık verisini kaybetmesine veya kritik bakım kaydı oluşturamamasına neden olmamalıdır.

## Veri modeli ve teknik taslak

### Veri modeli

- Yeni tipler, tablolar, alanlar ve ilişkiler.

### Servis ve senkronizasyon

- Local-first davranış.
- Supabase/RevenueCat/notification etkileri.
- Idempotency, conflict resolution ve migration yaklaşımı.

### Muhtemel dosyalar

- `path/to/file.ts`

Bu liste bağlayıcı değildir; implementasyon öncesi yeniden keşif yapılır.

## Gizlilik, güvenlik ve sağlık sınırları

- Toplanan veya paylaşılan sağlık verisi.
- Kullanıcı onayı ve erişim iptali.
- Sağlık tavsiyesi/teşhis sınırı.
- Log ve analytics içinde hassas veri bulunmaması.

## Lokalizasyon ve erişilebilirlik

- [ ] EN ve DE metinleri birlikte eklenir.
- [ ] VoiceOver etiketleri ve odak sırası.
- [ ] Dynamic Type, Reduce Motion ve renk kontrastı.
- [ ] Tarih, saat, sayı ve ölçü birimi locale uyumlu.

## Analytics

Hassas sağlık içeriği event parametrelerine yazılmaz.

- `feature_viewed`
- `feature_started`
- `feature_completed`
- `feature_failed` — yalnızca sınıflandırılmış hata kodu

## Uygulama fazları

### Faz 1 — Temel altyapı

- [ ] İş kalemi

### Faz 2 — Kullanıcı akışı

- [ ] İş kalemi

### Faz 3 — Sertleştirme ve yayın

- [ ] Test, telemetry, migration ve rollout

## Kabul kriterleri

- [ ] Kullanıcı sonucu uçtan uca tamamlanabiliyor.
- [ ] Free ve Plus davranışı doğru.
- [ ] Offline, hata ve boş durumlar tasarlanmış.
- [ ] EN/DE, Dynamic Type ve VoiceOver doğrulanmış.
- [ ] Analytics hassas veri taşımıyor.
- [ ] Yeni davranış otomatik ve manuel testlerle korunuyor.

## Test planı

### Otomatik

- Unit testler
- Store/service testleri
- Migration ve permission testleri

### Manuel QA

- [ ] iPhone küçük ekran
- [ ] iPhone büyük ekran
- [ ] iPad portrait ve landscape
- [ ] Light/dark destekleniyorsa ikisi
- [ ] EN/DE
- [ ] Free/Plus
- [ ] Offline → online
- [ ] Yeni kullanıcı → mevcut kullanıcı migration

## Rollout ve geri dönüş

- Feature flag veya kademeli yayın yaklaşımı.
- Migration geri dönüşü.
- Başarısızlık halinde güvenli fallback.

## Açık sorular

- [ ] Implementasyon başlamadan cevaplanması gereken soru.

## Definition of Done

- [ ] Kod review tamamlandı.
- [ ] Testler ve lint hedeflenen kapsamda geçti.
- [ ] Kullanıcı akışı gerçek cihazda doğrulandı.
- [ ] App Store/Plus metinleri gerçekle birebir uyumlu.
- [ ] İlgili task ve ürün dokümantasyonu güncellendi.
