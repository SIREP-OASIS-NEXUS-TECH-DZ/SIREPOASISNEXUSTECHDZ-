# 📝 Changelog — سجل التغييرات

> **Project:** SIREP OASIS NEXUS TECH DZ  
> **Platform:** Smart Oasis Energy & Water Management Systems — Algeria  
> **Author:** MAHROUG ERRAS BELKACEM  
> **Location:** الأغواط، الجزائر | Laghouat, Algeria  
> **WhatsApp:** 0556640211  
> **Tel:** 0674005940  
> **License:** CC BY-NC-ND 4.0  
> **INAPI:** N° 5893/2025 · Brevet N° 142965

---

All notable changes to this project are documented in this file.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) · Versioning follows [Semantic Versioning](https://semver.org/).

---

## 📚 حول إدارة النُّسخ | About Versioning

يتبع هذا المشروع **الإدارة الدلالية لنُسخ البرمجيات 2.0.0** (Semantic Versioning 2.0.0)

### 🔢 صيغة الترقيم | Version Format

```
MAJOR.MINOR.PATCH
جذري.بسيط.ترقيع
```

### 📋 قواعد رفع الترقيم | Version Increment Rules

| النوع | متى يُرفع | أمثلة |
|------|----------|-------|
| **MAJOR (جذري)** | تغييرات جذرية غير متوافقة رجعيًا | API breaking changes |
| **MINOR (بسيط)** | إضافة ميزات جديدة متوافقة رجعيًا | New features, backward compatible |
| **PATCH (ترقيع)** | إصلاح علل وأخطاء متوافقة رجعيًا | Bug fixes, security patches |

### 🎯 أمثلة على التطبيق | Application Examples

- **v0.9.0** → مرحلة التطوير الأولية (Initial development)
- **v1.0.0** → أول إصدار مستقر للواجهة البرمجية العامة (First stable public API)
- **v1.1.0** → إضافة ميزات جديدة دون كسر التوافقية (New features, no breaking changes)
- **v2.0.0** → تغييرات جذرية تكسر التوافقية الرجعية (Breaking changes)

---

## 🔖 سجل الإصدارات | Version History

---

## [v1.1.0] — 2026-03-11 🚀 Performance Improvement Plan | خطة تحسين الأداء

**نوع الإصدار | Release Type:** `MINOR` — إضافة تحسينات وميزات جديدة متوافقة رجعيًا

### ✅ Done Today | منجز اليوم

- Established a comprehensive performance improvement plan covering: UI, CSS, images, database schema, and API design.
- Documented all action steps in `CHANGELOG.md` aligned with the live repository.
- Defined weekly priorities for SIREP technical performance enhancement.
- **Applied Semantic Versioning 2.0.0 standards** to project documentation.

### 📋 Planned | مخطط للتنفيذ

| # | Task | Priority | Status |
|---|------|----------|--------|
| 1 | Review `index.html` — remove redundant HTML elements, reduce DOM depth | 🔴 High | 📋 Planned |
| 2 | Audit unified CSS in `assets/css/` — purge unused rules | 🔴 High | 📋 Planned |
| 3 | Compress all images → convert to WebP with fallback formats | 🟠 Medium | 📋 Planned |
| 4 | Draft initial database schema (oasis · wells · sensors · readings) in a `.md` file | 🟠 Medium | 📋 Planned |
| 5 | Identify fields requiring database indexes for future dynamic features | 🟡 Low | 📋 Planned |
| 6 | Design API endpoints: return only required fields + support pagination & filtering | 🟡 Low | 📋 Planned |

---

## [v1.0.0] — 2026-03-03 🌟 الإصدار الرسمي الأول | First Official Release

**نوع الإصدار | Release Type:** `MAJOR` — أول إصدار مستقر للواجهة البرمجية العامة

### ➕ Added | مضاف

- `index.html` — Multilingual Dashboard (Arabic / French / English / Tamazight)
- `README.md` — Professional documentation with badges and technical tables
- `STATUTS-FONDATEURS.md` — Full founding charter + 2026 roadmap
- `SECURITY.md` — Security policy and intellectual property protection
- `LICENSE` — CC BY-NC-ND 4.0 © 2025–2026 MAHROUG ERRAS BELKACEM
- `CHANGELOG.md` — This file
- GitHub Release `v1.0.0` — Documented and protected
- Patent **INAPI N° 5893/2025** — Brevet N° 142965
- PCT International coverage — 6 MENA countries

### 🎯 SemVer Compliance

This release marks the **first stable public API** of SIREP OASIS NEXUS TECH DZ platform.  
All future changes will follow strict Semantic Versioning guidelines.

---

## [v0.9.0] — 2025-12-30 🔧 Pre-release | مرحلة التطوير

**نوع الإصدار | Release Type:** `MINOR` (pre-1.0.0) — مرحلة التطوير الأولية

### ➕ Added | مضاف

- `sirep.3.0.1.html` — Initial HTML structure of the portal
- `Laghouat.html` — الأغواط page
- `l.comp..html` — Component page
- `lyahssoun` — Dashboard page

### 🔧 Changed | تعديلات

- Improved HTML structure and responsive design
- Reviewed color schemes, badges, and buttons

### ⚠️ Development Phase Notice

Version 0.x.x indicates **initial development phase**. The public API is not yet stable.  
Breaking changes may occur at any time without MAJOR version increment.

---

## 📅 Upcoming Roadmap | المخطط للمستقبل

| Version | Target Date | Content | Type |
|---------|-------------|---------|------|
| v1.1.0 | Q2 2026 | Live CSP IoT Dashboard integration | MINOR |
| v1.2.0 | Q3 2026 | Full WEFEH system | MINOR |
| v2.0.0 | Q4 2026–2027 | Full SIREP ATLAS SaaS platform | MAJOR |

### 📖 Version Type Legend

- **MAJOR (جذري):** Breaking changes to public API
- **MINOR (بسيط):** New features, backward compatible
- **PATCH (ترقيع):** Bug fixes and security patches

---

## 📚 مراجع | References

- **Semantic Versioning 2.0.0:** https://semver.org/
- **Keep a Changelog:** https://keepachangelog.com/
- **SemVer Arabic:** https://semver.org/lang/ar/

---

<div align="center">

© 2025–2026 **MAHROUG ERRAS BELKACEM** — SIREP OASIS NEXUS TECH DZ  
Protected under **CC BY-NC-ND 4.0** · Patent **INAPI N° 5893/2025**  
الأغواط، الجزائر 🇩🇿 | [GitHub Repository](https://github.com/skacimo1985-star/sirep-amoud)

**Following Semantic Versioning 2.0.0 Standards**

</div>