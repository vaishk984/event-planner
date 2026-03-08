# PlannerOS Production Readiness Checklist

> Prioritized implementation items for production launch

---

## 🔴 CRITICAL (Implement First - Week 1-2)

### 1. CI/CD Pipeline Setup
```
Priority: CRITICAL
Effort: 2-3 days
```
- [ ] Create `.github/workflows/ci.yml` - Main CI pipeline
- [ ] Create `.github/workflows/deploy-staging.yml`
- [ ] Create `.github/workflows/deploy-production.yml`
- [ ] Configure GitHub Secrets for Vercel, Supabase, Sentry
- [ ] Setup lint-staged + Husky pre-commit hooks

### 2. Environment Separation
```
Priority: CRITICAL  
Effort: 1 day
```
- [ ] Create 3 Supabase projects: dev, staging, production
- [ ] Configure environment variables per environment
- [ ] Setup DNS: app.planneros.com, staging.planneros.com
- [ ] Configure Vercel project with preview/production deployments

### 3. Security Essentials
```
Priority: CRITICAL
Effort: 2-3 days
```
- [ ] Implement rate limiting with Upstash Redis
- [ ] Add security headers in middleware (CSP, X-Frame-Options, etc.)
- [ ] Enable RLS on ALL tables (already done for new tables)
- [ ] Add input sanitization with DOMPurify
- [ ] Configure CORS properly
- [ ] Add npm audit to CI pipeline

### 4. Error Monitoring
```
Priority: CRITICAL
Effort: 1 day
```
- [ ] Setup Sentry for error tracking
- [ ] Create `sentry.client.config.ts` and `sentry.server.config.ts`
- [ ] Add source maps to Sentry releases
- [ ] Configure error filtering (no bot errors)

---

## 🟠 HIGH PRIORITY (Week 2-3)

### 5. Testing Infrastructure
```
Priority: HIGH
Effort: 3-4 days
```
- [ ] Configure Jest with coverage thresholds (70%)
- [ ] Add unit tests for critical services (BookingService, PaymentService)
- [ ] Configure Playwright for E2E tests
- [ ] Add smoke tests for critical user flows
- [ ] Create test database seeding script

### 6. Payment Gateway (Razorpay)
```
Priority: HIGH
Effort: 2-3 days
```
- [ ] Integrate Razorpay SDK
- [ ] Create subscription plans (Free, Professional ₹2,999, Business ₹6,999)
- [ ] Setup webhook handlers for payment events
- [ ] Generate GST-compliant invoices
- [ ] Add payment failed email notifications

### 7. Email Service
```
Priority: HIGH
Effort: 1-2 days
```
- [ ] Setup Resend.com for transactional emails
- [ ] Create email templates:
  - Welcome email
  - Payment confirmation
  - Payment reminder (overdue)
  - Password reset
  - Booking status updates

### 8. Logging & Monitoring
```
Priority: HIGH
Effort: 1-2 days
```
- [ ] Setup structured logging with winston/BetterStack
- [ ] Create logging utilities for key events
- [ ] Configure uptime monitoring (BetterStack/UptimeRobot)
- [ ] Setup database performance monitoring

---

## 🟡 MEDIUM PRIORITY (Week 3-4)

### 9. Database Optimization
```
Priority: MEDIUM
Effort: 2 days
```
- [ ] Add performance indexes (composite indexes for common queries)
- [ ] Enable connection pooling (PgBouncer)
- [ ] Setup automated backups (hourly)
- [ ] Configure read replicas for scaling
- [ ] Add query optimization for N+1 problems

### 10. Caching Layer
```
Priority: MEDIUM
Effort: 2 days
```
- [ ] Setup Upstash Redis
- [ ] Cache vendor catalog (1 hour TTL)
- [ ] Cache dashboard data (5 min TTL)
- [ ] Implement cache invalidation on updates
- [ ] Add Next.js data cache for static pages

### 11. SMS Integration (MSG91)
```
Priority: MEDIUM
Effort: 1 day
```
- [ ] Integrate MSG91 for India SMS
- [ ] Create SMS templates for:
  - OTP verification
  - Payment reminders
  - Booking confirmations

### 12. Legal & Compliance
```
Priority: MEDIUM
Effort: 2-3 days
```
- [ ] Create Terms of Service page
- [ ] Create Privacy Policy page (GDPR + India compliant)
- [ ] Add cookie consent banner
- [ ] Configure data retention policies
- [ ] Create audit logging trigger for sensitive tables

---

## 🟢 BEFORE LAUNCH (Week 4-5)

### 13. Analytics & Tracking
```
Priority: BEFORE_LAUNCH
Effort: 1-2 days
```
- [ ] Setup Mixpanel/PostHog for product analytics
- [ ] Track key events:
  - User signup
  - Booking created/confirmed
  - Payment completed
  - Feature usage
- [ ] Setup Google Analytics for website

### 14. Customer Support
```
Priority: BEFORE_LAUNCH
Effort: 1 day
```
- [ ] Setup Crisp/Intercom chat widget
- [ ] Create Help Center with initial articles (10 articles)
- [ ] Configure support email (support@planneros.com)
- [ ] Create FAQ page

### 15. Performance Optimization
```
Priority: BEFORE_LAUNCH
Effort: 2 days
```
- [ ] Run Lighthouse audits (target: 90+ scores)
- [ ] Optimize images with Next.js Image component
- [ ] Enable compression
- [ ] Configure CDN headers
- [ ] Run load testing with k6

### 16. SEO & Marketing
```
Priority: BEFORE_LAUNCH
Effort: 1-2 days
```
- [ ] Add meta tags to all pages
- [ ] Create sitemap.xml
- [ ] Configure robots.txt
- [ ] Add structured data (Schema.org)
- [ ] Create OG images for social sharing

---

## 🔵 POST-LAUNCH (Ongoing)

### 17. Feature Flags
- [ ] Setup PostHog feature flags
- [ ] Create flags for beta features
- [ ] Enable gradual rollouts

### 18. Churn Prevention
- [ ] Build churn risk detection system
- [ ] Create automated retention emails
- [ ] Setup CSM alerts for at-risk users

### 19. Mobile App
- [ ] React Native/Flutter mobile app
- [ ] Push notifications
- [ ] Offline support

---

## Configuration Files to Create

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | Main CI pipeline |
| `.github/workflows/deploy-staging.yml` | Staging deployment |
| `.github/workflows/deploy-production.yml` | Production deployment |
| `vercel.json` | Vercel configuration |
| `sentry.client.config.ts` | Client error tracking |
| `sentry.server.config.ts` | Server error tracking |
| `jest.config.js` | Test configuration |
| `playwright.config.ts` | E2E test configuration |
| `.husky/pre-commit` | Pre-commit hooks |
| `.lintstagedrc.js` | Lint-staged config |

---

## Cost Estimates (Monthly)

| Service | Free Tier | Paid (At Scale) |
|---------|-----------|-----------------|
| Vercel | Free | $20/mo |
| Supabase | Free | $25/mo |
| Upstash Redis | Free | $10/mo |
| Sentry | Free (5k events) | $26/mo |
| Resend | Free (100/day) | $20/mo |
| MSG91 | Pay-per-use | ~₹2,000/mo |
| Crisp | Free | $25/mo |
| **Total** | **Free** | **~₹12,000/mo** |

---

## Launch Readiness Checklist (Final)

### Technical
- [ ] All environments deployed
- [ ] Database migrations applied
- [ ] Backups automated
- [ ] SSL configured
- [ ] Monitoring active
- [ ] Error tracking live
- [ ] Rate limiting enabled

### Business
- [ ] Payment gateway live
- [ ] Legal pages published
- [ ] Support channel ready
- [ ] Pricing page live
- [ ] Analytics tracking

### Marketing
- [ ] Landing page ready
- [ ] Blog with 5+ posts
- [ ] Social media accounts
- [ ] Email sequences ready
- [ ] Demo video recorded

---

*Last Updated: February 2026*
