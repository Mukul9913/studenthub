# Architecture overview

#

# StudentHub uses a Turborepo monorepo with pnpm workspaces.

#

# - apps/api — Express HTTP API (ports, auth, persistence)

# - apps/web — React SPA (Vite)

# - packages/* — shared libraries (types first; more packages as needed)

#

# Clean layering (API):

# routes → controllers → services → repositories → models

#

# Feature-first (Web):

# pages/routes compose layouts + features; features own domain UI.
