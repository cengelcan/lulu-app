# 001 — Plus Vaadi ve Monetizasyon Sınırları

## Task özeti

| Alan | Değer |
|---|---|
| Durum | Done |
| Öncelik | P0 |
| Hedef sürüm | v1.1 |
| Task türü | Ürün / Plus / Güven |
| Tahmini efor | M |
| Ürün katmanı | Her ikisi |
| Bağımlılıklar | İlk App Store yayını |
| Son güncelleme | 2026-07-27 |

## Bağlam ve problem

Paywall, profil Plus kartı ve gerçek entitlement kuralları aynı kaynaklardan beslenmesine rağmen bugün birebir aynı ürünü anlatmıyor. `Advanced Insights` Plus faydası olarak listelenirken temel trendler Free kullanıcıya açık; `Smart Reminders` metni gelişmiş otomasyon izlenimi verirken mevcut fark aylık adet limitidir. `All pets` ifadesinin arkasında 10 aktif pet güvenlik sınırı bulunur. Ayrıca ayda 5 kayıt/3 hatırlatıcı engeli, kritik sağlık verisinin kaydedilememesi hissi yaratabilir.

## Kapanış kararı — 2026-07-27

Mevcut Free/Plus sınırları bu aşamada korunur: Free katmanda 1 aktif pet, ayda
5 sağlık kaydı ve ayda 3 hatırlatıcı; Plus katmanda 10 aktif pet güvenlik sınırı
uygulanır. Daha kapsamlı monetizasyon ve temel sağlık kaydı politikası sonraki
ayrı ürün güncellemesinde yeniden ele alınacaktır. v1.3 ve öncesi için client,
Supabase enforcement ve kullanıcı metinleri mevcut kurala göre kabul edilmiştir.

## Kullanıcı sonucu

> Bir kullanıcı olarak neyin ücretsiz, neyin Plus olduğunu özellik ile karşılaştığım her yerde aynı ve dürüst biçimde görmek istiyorum.

## Başarı ölçütleri

- Paywall, profil, kilitler ve gerçek entitlement arasında sıfır tutarsızlık.
- Mevcut Free limitleri kullanıcıya açık ve tutarlı biçimde anlatılır; temel
  sağlık kaydı politikası sonraki monetizasyon güncellemesinde yeniden ele alınır.
- Paywall görüntüleme → satın alma dönüşümü izlenir; refund/şikâyet guardrail olur.

## Kapsam

### Dahil

- [x] Mevcut bütün `PlusFeature` kullanımlarını ve pazarlama metinlerini matrise dök.
- [x] Free kullanıcının temel sağlık kaydı ve hatırlatıcı davranışını yeniden kararlaştır.
- [x] Plus değerini limit yerine otomasyon, işbirliği, rapor ve insight çevresinde tanımla.
- [x] Paywall, Profile Plus Card, Family upsell ve kilit rozetlerini aynı ürün kataloğundan üret.
- [x] Limit yaklaşımı değişirse local/Supabase enforcement ve hata metinlerini birlikte güncelle.

### Kapsam dışı

- Yeni Plus özelliklerinin implementasyonu.
- Fiyat ve plan değişikliği; Task 005 kapsamındadır.

## Hedef ürün matrisi

| Yetenek | Free | Plus |
|---|---|---|
| Aktif pet | 1 | 10 güvenlik sınırı; UI “10’a kadar” der |
| Günlük check-in | Temel kullanım açık | Gelişmiş analiz ve otomasyon |
| Sağlık kaydı | Ayda 5 kayıt | Sınırsız kayıt; ekler, otomatik belge işleme ve gelişmiş raporlar ayrı özelliklerle genişler |
| Hatırlatıcı | Ayda 3 hatırlatıcı | Sınırsız hatırlatıcı; doz ve aile koordinasyonu ayrı özelliklerle genişler |
| Trendler | Temel özet | Uzun dönem, karşılaştırma, açıklanabilir uyarılar |
| PDF/Visit Mode | Önizleme veya temel özet | Export ve paylaşım |
| Family | Davetle sınırlı katılım kararı korunabilir | Grup oluşturma ve yönetme |

## Teknik taslak

- `constants/subscription.ts`: feature isimleri ve sınırlar.
- `constants/plus-features.ts`: tek ürün kataloğu.
- `utils/subscription-limits.ts`: entitlement kararları.
- `hooks/use-plus-feature.ts`: UI erişim sözleşmesi.
- `components/paywall/LuluPlusPaywall.tsx` ve `components/profile/LuluPlusCard.tsx`.
- Supabase limit fonksiyonları ve RevenueCat entitlement `plus` korunur.

Ürün kataloğu her feature için `id`, `availability`, `paywallCopyKey`, `lockBehavior`, `analyticsKey` taşımalıdır. UI’da bağımsız, elle yazılmış Plus listeleri kalmamalıdır.

## Gizlilik ve sağlık sınırları

- Kullanıcının daha önce oluşturduğu sağlık verisine erişim abonelik sona erince kaybolmaz.
- Kritik sağlık kaydı yalnızca ödeme amacıyla reddedilmez.
- Analytics event’leri kayıt içeriğini veya pet sağlık durumunu içermez.

## Uygulama fazları

### Faz 1 — Audit ve karar

- [x] Feature/copy/enforcement matrisi çıkar.
- [x] Free temel kayıt politikası için ürün kararı al.
- [x] EN/DE terminoloji sözlüğünü kilitle.

### Faz 2 — Tek kaynak

- [x] Plus ürün kataloğunu oluştur.
- [x] Paywall, profil ve upsell ekranlarını kataloğa bağla.
- [x] Server/local limitleri yeni kararla eşleştir.

### Faz 3 — Doğrulama

- [x] Her feature için Free/Plus otomatik test matrisi.
- [x] App Review screenshot ve açıklamalarını gerçek ürünle karşılaştır.

## Kabul kriterleri

- [x] Paywall’da listelenen her özellik production’da çalışıyor ve doğru kilitleniyor.
- [x] “Smart” veya “advanced” sözcüğü yalnızca karşılığı olan özellikte kullanılıyor.
- [x] Pet sınırı kullanıcıya doğru sayı ile gösteriliyor.
- [x] Abonelik kaybında mevcut veriler okunabiliyor.
- [x] EN/DE ve App Store subscription metinleri uyumlu.

## Test planı

- Unit: bütün feature/context kombinasyonları.
- Integration: Free → Plus → expired → restored.
- Manual: paywall’a Home, Records, Reminders, My Pets, Family ve Profile girişleri.

## Açık sorular

- [x] Free temel kayıt ve hatırlatıcılar tamamen sınırsız mı olacak? — Hayır; mevcut aylık 5 kayıt ve 3 hatırlatıcı sınırı sonraki monetizasyon güncellemesine kadar korunacak.
- [x] Free aile üyesi davet koduyla gruba katılmaya devam edecek mi? — Evet; mevcut bir family'ye member olarak katılım kendi Plus entitlement'ını gerektirmez.
- [x] 10 pet sınırı pazarlama metninde açıkça gösterilecek mi? — Evet; desteklenen bütün dillerde “10 pet'e kadar” sınırı gösteriliyor.

## Definition of Done

- [x] Tek ürün kataloğu kullanılıyor.
- [x] Client/server enforcement ve metinler eşleşiyor.
- [x] App Review açısından yanıltıcı ifade kalmadı.
- [x] Free/Plus regresyon testleri geçti.
