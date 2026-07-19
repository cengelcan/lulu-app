# 010 — Gelişmiş ve Açıklanabilir Sağlık İçgörüleri

## Task özeti

| Alan | Değer |
|---|---|
| Durum | Backlog |
| Öncelik | P1 |
| Hedef sürüm | v1.5 |
| Task türü | Plus / Analiz / Sağlık Güvenliği |
| Tahmini efor | XL |
| Ürün katmanı | Temel trend Free, gelişmiş insight Plus |
| Bağımlılıklar | 002, 006 |
| Son güncelleme | 2026-07-15 |

## Bağlam ve problem

Mevcut trendler check-in metriklerini özetliyor fakat paywall’daki `Advanced Insights` vaadini karşılayacak baseline, süreklilik ve açıklama katmanı yok. Sağlık içgörüsü teşhis koymadan, yalnız kullanıcının kendi verisindeki değişimi şeffaf biçimde anlatmalıdır.

## Kullanıcı sonucu

> Bir kullanıcı olarak pet’imin kendi normaline göre neyin değiştiğini, bu sonucun hangi kayıtlardan geldiğini ve ne kadar güvenilir olduğunu görmek istiyorum.

## Insight örnekleri

- “İştah son 7 günün 4’ünde 30 günlük ortalamasının altında işaretlendi.”
- “Kilo son 30 günde %X değişti; ölçüm sayısı N.”
- “Enerji düşüşü ilaç başlangıcından iki gün sonra görülmeye başladı.” — yalnız korelasyon, nedensellik iddiası yok.
- “Yorum için yeterli veri yok; üç check-in daha gerekli.”

## Free / Plus davranışı

| Yetenek | Free | Plus |
|---|---|---|
| Son 7 gün trend | Var | Var |
| 30/90 gün baseline | Sınırlı | Var |
| Cross-metric correlation | Yok | Var |
| Insight geçmişi/export | Yok | Var |
| Açıklama ve kaynak | Her insight’ta zorunlu | Her insight’ta zorunlu |

## Analiz kuralları

- İlk sürüm deterministik ve test edilebilir istatistik kuralları kullanır.
- Minimum veri sayısı ve missing-data oranı olmadan insight üretmez.
- Pet’ler birbirine değil yalnız kendi baseline’ına kıyaslanır.
- Breed/age referans aralığı kullanılacaksa veteriner kaynaklı ve versiyonlu olmalıdır.
- “Risk”, “hastalık” veya “tanı” dili clinical validation olmadan kullanılmaz.

## Veri modeli

- Insight anlık hesaplanabilir; notification/dismiss için `health_insights` snapshot tablosu gerekebilir.
- Alanlar: kind, window, evidence ids, generated_at, rule_version, severity (`info`, `watch`), dismissed_at.
- Evidence yalnız entity ID ve aggregate taşır; serbest not metni kopyalanmaz.

## UX

- Health Overview’da en fazla bir önemli insight.
- Detay ekranında “Why am I seeing this?”, dönem, veri noktaları ve kaynak kayıtlar.
- Kullanıcı `Not useful`, `Dismiss`, `Add note` yapabilir.
- Acil kırmızı alarm yalnız klinik olarak doğrulanmış kapsam varsa; başlangıçta kullanılmaz.

## Uygulama fazları

### Faz 1 — Baseline motoru

- [ ] Veri yeterlilik sözleşmesi.
- [ ] Appetite, energy, water, sleep ve weight kuralları.
- [ ] Golden dataset/unit testler.

### Faz 2 — Insight deneyimi

- [ ] Health Overview ve detail.
- [ ] Evidence drill-down.
- [ ] Dismiss/feedback.

### Faz 3 — Notification ve korelasyon

- [ ] Opt-in summary notification.
- [ ] Medication/record timeline correlation.
- [ ] False-positive monitoring.

## Gizlilik ve sağlık sınırları

- Insight pet sahibinin gözlemlerini özetler; veteriner değerlendirmesinin yerine geçmez.
- Analytics insight türü taşıyabilir, ham ölçüm ve sağlık içeriği taşımaz.
- Notification metni gizlilik tercihine uyar.

## Kabul kriterleri

- [ ] Her insight minimum veri ve rule version taşır.
- [ ] Kullanıcı hangi verinin sonuca yol açtığını görebilir.
- [ ] Eksik/veri az durumda iddia yerine açıklayıcı empty state çıkar.
- [ ] Aynı input aynı insight sonucunu üretir.
- [ ] Paywall metni gerçek insight kapsamıyla eşleşir.

## Açık sorular

- [ ] Hangi metrikler v1 için yeterince güvenilir?
- [ ] Insight push varsayılan kapalı mı olmalı?
- [ ] Vet danışman review süreci nasıl kurulacak?

## Test planı

- Golden dataset: normal, değişim, eksik veri ve uç değer örnekleri.
- Unit/property test: minimum veri, baseline, aynı girdide aynı çıktı ve rule version.
- Klinik içerik review: teşhis dili, yanlış kesinlik ve veteriner yönlendirmesi.
- Manuel: kaynak açıklaması, dismiss/feedback, notification gizliliği, EN/DE ve VoiceOver.

## Definition of Done

- Her insight açıklanabilir, sürümlü ve kaynak veriye izlenebilir.
- False-positive izleme ve kullanıcı feedback kanalı çalışıyor.
- Klinik/gizlilik incelemesi, analytics ve feature flag tamamlandı.
- Paywall vaadi production kapsamıyla birebir doğrulandı.
