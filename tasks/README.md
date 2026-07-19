# Lulu Yayın Sonrası Ürün Yol Haritası

Bu klasör ilk App Store yayını sonrasında ele alınacak ürün geliştirmelerini içerir. Sıra, önce ürün vaadini ve temel deneyimi sağlamlaştıracak; ardından Plus için tekrar kullanım ve ödeme değeri oluşturacak şekilde belirlenmiştir.

## Çalışma kuralları

1. Yeni tasklar [`TASK_TEMPLATE.md`](./TASK_TEMPLATE.md) şemasına uyar.
2. Aynı anda mümkünse yalnızca bir büyük task `In Progress` olur.
3. Bir task başlamadan önce bağımlılıkları ve açık soruları kapatılır.
4. Sağlık verisi oluşturma/görüntüleme kritik bir kullanıcı hakkıdır; monetizasyon bunu tehlikeye atmamalıdır.
5. Plus paywall yalnızca gerçekten mevcut ve doğrulanmış özellikleri anlatır.
6. EN ve DE, erişilebilirlik, iPhone ve iPad QA her taskın Definition of Done parçasıdır.
7. AI özellikleri teşhis koymaz; gözlemi özetler, kaynak ve belirsizlik gösterir, veteriner yönlendirmesini korur.

## Durum tanımları

| Durum | Anlamı |
|---|---|
| Backlog | Fikir kabul edildi, henüz uygulamaya hazır değil |
| Ready | Kararlar ve bağımlılıklar tamam, başlanabilir |
| In Progress | Aktif geliştirme |
| Blocked | Dış karar veya bağımlılık bekleniyor |
| QA | Kod tamam, doğrulama sürüyor |
| Done | Yayınlanabilir ve dokümante edildi |

## Sıralı yol haritası

| Sıra | Task | Öncelik | Efor | Önerilen hedef | Bağımlılık |
|---|---|---:|---:|---|---|
| 001 | [Plus vaadi ve monetizasyon sınırları](./001-plus-value-and-entitlement-alignment.md) | P0 | M | v1.1 | İlk yayın |
| 002 | [Home bilgi mimarisi ve Health Overview](./002-home-health-overview.md) | P0 | L | v1.1 | 001 |
| 003 | [Navigasyon ve Care Hub](./003-navigation-and-care-hub.md) | P1 | L | v1.2 | 002 |
| 004 | [Görsel sistem, responsive ve erişilebilirlik](./004-design-system-responsive-accessibility.md) | P1 | L | v1.2 | 002 |
| 005 | [Paywall ve fiyatlandırma v2](./005-paywall-and-pricing-v2.md) | P1 | M | v1.2 | 001, 004 |
| 006 | [İlaç ve doz takibi](./006-medication-and-dose-tracking.md) | P0 | XL | v1.3 | 001 |
| 007 | [Family Activity Timeline](./007-family-activity-timeline.md) | P1 | L | v1.3 | 003, 006 |
| 008 | [Vet Visit Mode](./008-vet-visit-mode.md) | P0 | XL | v1.4 | 006, 002 |
| 009 | [Belge tarama ve yapılandırılmış içe aktarma](./009-document-scan-and-import.md) | P1 | XL | v1.5 | 006, 008 |
| 010 | [Gelişmiş ve açıklanabilir sağlık içgörüleri](./010-explainable-health-insights.md) | P1 | XL | v1.5 | 002, 006 |
| 011 | [Health Passport ve acil durum paylaşımı](./011-health-passport-and-emergency-sharing.md) | P1 | L | v1.6 | 008 |
| 012 | [Smart Care Plans](./012-smart-care-plans.md) | P2 | XL | v1.7 | 006, 010 |
| 013 | [Veteriner ve bakım sağlayıcı rehberi](./013-care-provider-directory.md) | P2 | L | v1.7 | 008 |
| 014 | [Widget, takvim ve sistem entegrasyonları](./014-widgets-and-calendar-integrations.md) | P2 | XL | v1.8 | 006, 012 |

## Ürün stratejisi

### Free katman

- Bir hayvan için güvenilir temel bakım günlüğü.
- Kritik sağlık kaydı, check-in ve kendi verisini görüntüleme engellenmez.
- Kullanıcı Lulu'nun değerini veri kaybetme korkusu olmadan deneyimler.

### Lulu Plus

- Çoklu hayvan ve aile koordinasyonu.
- Otomasyon ve ilaç/doz iş akışları.
- Veteriner hazırlığı, PDF ve güvenli paylaşım.
- Açıklanabilir gelişmiş içgörüler.
- Belge işleme, bakım planları ve sistem entegrasyonları.

### Ana ürün döngüsü

`Bugünkü bakım → kayıt/check-in → hatırlatma → değişimi görme → aileyle koordine olma → veterinerle paylaşma`

## Release yaklaşımı

Her büyük task bağımsız yayınlanabilir olmalı. Büyük AI veya paylaşım özellikleri feature flag ile açılmalı. Plus tanıtım metinleri özellik production ortamında doğrulanmadan güncellenmemeli.
