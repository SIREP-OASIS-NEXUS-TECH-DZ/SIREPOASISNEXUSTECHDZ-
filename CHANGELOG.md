# Changelog | سجل التغييرات

EN:
All notable changes to this project are documented in this file.
Format follows Keep a Changelog, and this project follows Semantic Versioning.

AR:
يتم توثيق جميع التغييرات المهمة في هذا الملف.
يعتمد التنسيق على Keep a Changelog ويتبع المشروع Semantic Versioning.

## [Unreleased] | [غير منشور]

### Planned | مخطط

EN:
- Continue Special Economic Zone (ZES) pilot preparation and technical hardening for production readiness.

AR:
- مواصلة التحضير للإطلاق التجريبي في المنطقة الاقتصادية الخاصة (ZES) وتعزيز الجاهزية التقنية للإنتاج.

## [v1.2.0] - 2026-04-01

Release type | نوع الإصدار: `MINOR`

### Added | مضاف

EN:
- Initiated Phase 1 ZES readiness activities: governance scope confirmation and legal deployment constraint review.
- Published integration checklist draft for network, power, and data retention requirements.
- Added CHANGELOG entries tracking ZES milestone progress against Q2 2026 targets.

AR:
- بدء أنشطة الجاهزية في المرحلة 1 من المنطقة الاقتصادية الخاصة (ZES): تأكيد نطاق الحوكمة ومراجعة القيود القانونية للنشر.
- نشر مسودة قائمة التكامل لمتطلبات الشبكة والطاقة والاحتفاظ بالبيانات.
- إضافة إدخالات CHANGELOG لتتبع تقدم معالم المنطقة الاقتصادية الخاصة (ZES) مقارنة بأهداف الربع الثاني 2026.

### Changed | تعديلات

EN:
- Updated ZES milestone status: governance and legal validation progressed from Planned to In Progress.

AR:
- تحديث حالة معلم ZES: انتقلت مرحلة التحقق الحوكمي والقانوني من "مخطط" إلى "قيد التنفيذ".

## [v1.1.0] - 2026-03-11

Release type | نوع الإصدار: `MINOR`

### Added | مضاف

EN:
- Established a structured performance improvement plan for UI, CSS, images, data model, and API design.
- Defined weekly technical priorities for platform optimization.
- Added formal Special Economic Zone (ZES) integration planning for phased pilot rollout.

AR:
- تم وضع خطة منظمة لتحسين الأداء تشمل واجهة المستخدم وCSS والصور ونموذج البيانات وتصميم الـ API.
- تم تحديد أولويات تقنية أسبوعية لتحسين أداء المنصة.
- تمت إضافة تخطيط رسمي لدمج المنطقة الاقتصادية الخاصة (ZES) وفق مراحل تنفيذ تدريجية.

### Planned | مخطط

EN:
- Review `index.html` and reduce unnecessary DOM depth.
- Audit CSS and remove unused rules.
- Convert heavy images to WebP with fallback formats.
- Draft the initial data model (`oasis`, `wells`, `sensors`, `readings`).
- Design API endpoints with pagination and filtering.

AR:
- مراجعة ملف `index.html` وتقليل عمق بنية DOM غير الضروري.
- تدقيق CSS وحذف القواعد غير المستخدمة.
- تحويل الصور الثقيلة إلى WebP مع صيغ بديلة.
- إعداد المسودة الأولى لنموذج البيانات (`oasis`, `wells`, `sensors`, `readings`).
- تصميم نقاط API مع دعم التصفح الصفحي والتصفية.

### Special Economic Zone (ZES) Integration Program | برنامج دمج المنطقة الاقتصادية الخاصة (ZES)

EN:
Objective: deploy a controlled pilot in a Special Economic Zone (ZES) to validate SIREP operations before wider regional rollout.

AR:
الهدف: تنفيذ إطلاق تجريبي مضبوط داخل المنطقة الاقتصادية الخاصة (ZES) للتحقق من عمليات SIREP قبل التوسع الإقليمي.

#### Phase 1 - Readiness (Q2 2026) | المرحلة 1 - الجاهزية

EN:
- Confirm Special Economic Zone (ZES) governance scope and legal deployment constraints.
- Define pilot perimeter (sites, wells, sensors, users, reporting frequency).
- Publish integration checklist for network, power, and data retention.
- Create a security baseline for edge devices, API keys, and access roles.

AR:
- تأكيد نطاق الحوكمة داخل المنطقة الاقتصادية الخاصة (ZES) والقيود القانونية للنشر.
- تحديد نطاق التجربة (المواقع، الآبار، الحساسات، المستخدمون، وتواتر التقارير).
- نشر قائمة تكامل للشبكة والطاقة وسياسات الاحتفاظ بالبيانات.
- إنشاء خط أساس أمني للأجهزة الطرفية ومفاتيح API وصلاحيات الوصول.

#### Phase 2 - Pilot Deployment (Q2-Q3 2026) | المرحلة 2 - النشر التجريبي

EN:
- Install and register sensor gateways for water and energy telemetry.
- Connect field devices to ingestion APIs and validate payload contracts.
- Enable dashboard views for Special Economic Zone (ZES) operators (operations, alarms, trends).
- Configure alert thresholds for anomaly detection and incident workflow.

AR:
- تركيب وتسجيل بوابات الحساسات لقياسات المياه والطاقة.
- ربط الأجهزة الميدانية بواجهات الإدخال والتحقق من عقود البيانات المرسلة.
- تفعيل لوحات متابعة لمشغلي المنطقة الاقتصادية الخاصة (ZES) (التشغيل، الإنذارات، الاتجاهات).
- ضبط عتبات التنبيه لكشف الشذوذ وإدارة سير الحوادث.

#### Phase 3 - Stabilization (Q3 2026) | المرحلة 3 - التثبيت

EN:
- Benchmark data freshness, API latency, and dashboard response times.
- Tune indexing strategy for readings and event tables.
- Validate backup, restore, and incident recovery procedures.
- Conduct user acceptance review with Special Economic Zone (ZES) stakeholders.

AR:
- قياس مرجعي لحداثة البيانات وزمن استجابة API وأداء اللوحات.
- تحسين استراتيجية الفهرسة لجداول القراءات والأحداث.
- التحقق من إجراءات النسخ الاحتياطي والاستعادة والتعافي من الحوادث.
- تنفيذ مراجعة قبول المستخدم مع الجهات المعنية في المنطقة الاقتصادية الخاصة (ZES).

#### Phase 4 - Scale Decision (Q4 2026) | المرحلة 4 - قرار التوسعة

EN:
- Produce a pilot performance report with KPI outcomes.
- Approve rollout planning for additional zones based on risk and impact.
- Freeze API contract changes and publish long-term support policy.

AR:
- إعداد تقرير أداء للتجربة يتضمن نتائج مؤشرات الأداء.
- اعتماد خطة التوسعة لمناطق إضافية بناء على المخاطر والأثر.
- تجميد تغييرات عقود API ونشر سياسة دعم طويلة المدى.

#### Special Economic Zone (ZES) Milestones | معالم المنطقة الاقتصادية الخاصة (ZES)

EN:
| Milestone | Target Date | Priority | Status |
|---|---|---|---|
| Governance and legal validation complete | 2026-04-15 | High | In Progress |
| Sensor and gateway onboarding complete | 2026-05-30 | High | Planned |
| API and dashboard pilot go-live | 2026-06-20 | High | Planned |
| KPI review and stabilization sign-off | 2026-08-15 | Medium | Planned |
| Regional scale recommendation report | 2026-10-01 | Medium | Planned |

AR:
| المعلم | التاريخ المستهدف | الأولوية | الحالة |
|---|---|---|---|
| اكتمال التحقق الحوكمي والقانوني | 2026-04-15 | عالية | قيد التنفيذ |
| اكتمال إدماج الحساسات والبوابات | 2026-05-30 | عالية | مخطط |
| الإطلاق التجريبي للـ API واللوحة | 2026-06-20 | عالية | مخطط |
| اعتماد مراجعة المؤشرات والتثبيت | 2026-08-15 | متوسطة | مخطط |
| تقرير توصية التوسع الإقليمي | 2026-10-01 | متوسطة | مخطط |

#### Special Economic Zone (ZES) KPIs | مؤشرات الأداء للمنطقة الاقتصادية الخاصة (ZES)

EN:
- Telemetry delivery success rate: >= 99.0%
- Critical alert acknowledgment time: <= 10 minutes
- API p95 response time for dashboard endpoints: <= 450 ms
- Data availability for pilot entities: >= 99.5%
- Incident recovery objective (RTO): <= 2 hours

AR:
- معدل نجاح تسليم القياسات: >= 99.0%
- زمن تأكيد التنبيه الحرج: <= 10 دقائق
- زمن استجابة API عند p95 لنقاط اللوحة: <= 450 ms
- توافر البيانات لكيانات التجربة: >= 99.5%
- هدف زمن الاستعادة من الحوادث (RTO): <= ساعتين

## [v1.0.0] - 2026-03-03

Release type | نوع الإصدار: `MAJOR`

### Added | مضاف

EN:
- First official stable release baseline.
- Core platform documentation and release metadata.
- Initial public release governance under Semantic Versioning.

AR:
- أول خط أساس رسمي لإصدار مستقر.
- توثيق المنصة الأساسي وبيانات الإصدار.
- تأسيس حوكمة الإصدار العام وفق Semantic Versioning.

## [v0.9.0] - 2025-12-30

Release type | نوع الإصدار: `MINOR` (pre-1.0.0 development phase)

### Added | مضاف

EN:
- Initial portal structure and early dashboard pages.

AR:
- البنية الأولية للبوابة والصفحات المبكرة للوحة التحكم.

### Changed | تعديلات

EN:
- Improved responsive layout and visual components during pre-release phase.

AR:
- تحسين التخطيط المتجاوب والمكونات البصرية خلال مرحلة ما قبل الإصدار.

### Notes | ملاحظات

EN:
- Version `0.x.x` indicates an unstable development phase and may include breaking changes.

AR:
- يدل الإصدار `0.x.x` على مرحلة تطوير غير مستقرة وقد تتضمن تغييرات غير متوافقة.

## Versioning Notes | ملاحظات إدارة النُسخ

EN:
- MAJOR: breaking changes to the public API.
- MINOR: backward-compatible features and enhancements.
- PATCH: backward-compatible bug fixes and security updates.

AR:
- MAJOR: تغييرات جذرية تكسر توافق الواجهة البرمجية العامة.
- MINOR: ميزات وتحسينات متوافقة رجعيًا.
- PATCH: إصلاحات أخطاء وتحديثات أمنية متوافقة رجعيًا.

## References | مراجع

EN:
- https://keepachangelog.com/
- https://semver.org/

AR:
- https://keepachangelog.com/
- https://semver.org/
