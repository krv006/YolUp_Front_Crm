# Authentication and operator integration plan

1. Align login, session restoration, refresh rotation, logout and forced password change with the backend; hide demo credentials when the mock is disabled.
2. Separate operator access from center CRM and connect tenant creation, editing, blocking, subscriptions, owner management, usage and audit to the C-Panel API.
3. Send a known tenant UUID as X-Tenant-Id, including login and refresh, and retain the authenticated user's tenant UUID for subsequent requests. Use VITE_TENANT_ID for local development.
4. Verify build and test core behavior; exercise real workflows against a staging backend and two tenants before release.

## Hostname blocker

The backend accepts a tenant UUID in X-Tenant-Id, not the slug in `<slug>.yolup.uz`. Its public login resolves globally unique identities and does not validate the tenant header. It provides no public slug-to-UUID lookup. Consequently the frontend cannot securely determine or verify a hostname's tenant before login from the current API. A public tenant-resolution contract and backend enforcement at login are required for hostname-based tenant isolation. Do not send the slug as though it were a UUID. The operator has no tenant context.

The backend requires Django/PostgreSQL/Redis and an operator account; actual deployment, CORS, wildcard DNS/TLS, staging credentials and tenant isolation must be validated before release. The current token storage remains localStorage; secure cookie authentication needs coordinated backend work. Browser Web Locks serialize refresh across supported tabs; environments without Web Locks still need an agreed fallback.
