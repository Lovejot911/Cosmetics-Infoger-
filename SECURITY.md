# Security notes

Do not place credentials or personal reports in issues or pull requests. Send a vulnerability report privately to the repository owner through a channel they publish.

Environment values stay server-side. API requests have size and type limits; report retrieval uses 192-bit random capability codes, and stored codes are hashed. AI requires a shared access code, database-backed daily budget and cache. Uploaded photos are not sent to the backend.

Before an unrestricted production launch add account authentication, per-user request throttling, abuse controls, operational monitoring and a documented retention policy. The shared access code is designed for a supervised academic demonstration, not a multi-tenant product.
