# 001 — Plus Vaadi ve Monetizasyon Sınırları

## Task özeti

| Alan | Değer |
|---|---|
| Durum | Ready |
| Öncelik | P0 |
| Hedef sürüm | v1.1 |
| Task türü | Ürün / Plus / Güven |
| Tahmini efor | M |
| Ürün katmanı | Her ikisi |
| Bağımlılıklar | İlk App Store yayını |
| Son güncelleme | 2026-07-15 |

## Bağlam ve problem

Paywall, profil Plus kartı ve gerçek entitlement kuralları aynı kaynaklardan beslenmesine rağmen bugün birebir aynı ürünü anlatmıyor. `Advanced Insights` Plus faydası olarak listelenirken temel trendler Free kullanıcıya açık; `Smart Reminders` metni gelişmiş otomasyon izlenimi verirken mevcut fark aylık adet limitidir. `All pets` ifadesinin arkasında 10 aktif pet güvenlik sınırı bulunur. Ayrıca ayda 5 kayıt/3 hatırlatıcı engeli, kritik sağlık verisinin kaydedilememesi hissi yaratabilir.

## Kullanıcı sonucu

> Bir kullanıcı olarak neyin ücretsiz, neyin Plus olduğunu özellik ile karşılaştığım her yerde aynı ve dürüst biçimde görmek istiyorum.

## Başarı ölçütleri

- Paywall, profil, kilitler ve gerçek entitlement arasında sıfır tutarsızlık.
- Kritik kayıt oluşturma kullanıcı güvenini bozacak şekilde engellenmez.
- Paywall görüntüleme → satın alma dönüşümü izlenir; refund/şikâyet guardrail olur.

## Kapsam

### Dahil

- [ ] Mevcut bütün `PlusFeature` kullanımlarını ve pazarlama metinlerini matrise dök.
- [ ] Free kullanıcının temel sağlık kaydı ve hatırlatıcı davranışını yeniden kararlaştır.
- [ ] Plus değerini limit yerine otomasyon, işbirliği, rapor ve insight çevresinde tanımla.
- [ ] Paywall, Profile Plus Card, Family upsell ve kilit rozetlerini aynı ürün kataloğundan üret.
- [ ] Limit yaklaşımı değişirse local/Supabase enforcement ve hata metinlerini birlikte güncelle.

### Kapsam dışı

- Yeni Plus özelliklerinin implementasyonu.
- Fiyat ve plan değişikliği; Task 005 kapsamındadır.

## Hedef ürün matrisi

| Yetenek | Free | Plus |
|---|---|---|
| Aktif pet | 1 | 10 güvenlik sınırı; UI “10’a kadar” der |
| Günlük check-in | Temel kullanım açık | Gelişmiş analiz ve otomasyon |
| Sağlık kaydı | Kritik kayıt engellenmez | Ekler, otomatik belge işleme, gelişmiş rapor |
| Hatırlatıcı | Temel manuel hatırlatıcılar | Akıllı plan, doz, aile koordinasyonu |
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

- [ ] Feature/copy/enforcement matrisi çıkar.
- [ ] Free temel kayıt politikası için ürün kararı al.
- [ ] EN/DE terminoloji sözlüğünü kilitle.

### Faz 2 — Tek kaynak

- [ ] Plus ürün kataloğunu oluştur.
- [ ] Paywall, profil ve upsell ekranlarını kataloğa bağla.
- [ ] Server/local limitleri yeni kararla eşleştir.

### Faz 3 — Doğrulama

- [ ] Her feature için Free/Plus otomatik test matrisi.
- [ ] App Review screenshot ve açıklamalarını gerçek ürünle karşılaştır.

## Kabul kriterleri

- [ ] Paywall’da listelenen her özellik production’da çalışıyor ve doğru kilitleniyor.
- [ ] “Smart” veya “advanced” sözcüğü yalnızca karşılığı olan özellikte kullanılıyor.
- [ ] Pet sınırı kullanıcıya doğru sayı ile gösteriliyor.
- [ ] Abonelik kaybında mevcut veriler okunabiliyor.
- [ ] EN/DE ve App Store subscription metinleri uyumlu.

## Test planı

- Unit: bütün feature/context kombinasyonları.
- Integration: Free → Plus → expired → restored.
- Manual: paywall’a Home, Records, Reminders, My Pets, Family ve Profile girişleri.

## Açık sorular

- [ ] Free temel kayıt ve hatırlatıcılar tamamen sınırsız mı olacak?
- [ ] Free aile üyesi davet koduyla gruba katılmaya devam edecek mi?
- [ ] 10 pet sınırı pazarlama metninde açıkça gösterilecek mi?

## Definition of Done

- [ ] Tek ürün kataloğu kullanılıyor.
- [ ] Client/server enforcement ve metinler eşleşiyor.
- [ ] App Review açısından yanıltıcı ifade kalmadı.
- [ ] Free/Plus regresyon testleri geçti.
