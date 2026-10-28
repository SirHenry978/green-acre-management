# Architecture rules

- Authentication and password recovery use the external Django API in `src/lib/api.ts`, not managed Cloud auth, to keep account credentials in the existing server.
- Recovery links use the current HashRouter's `/#/reset-password?uid=…&token=…` format and a server-configured frontend origin; never accept a reset destination from anonymous requests.