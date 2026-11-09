# Architecture rules

- Authentication and password recovery use the external Django API in `src/lib/api.ts`, not managed Cloud auth, to keep account credentials in the existing server.
- Recovery links use the current HashRouter's `/#/reset-password?uid=…&token=…` format and a server-configured frontend origin; never accept a reset destination from anonymous requests.
- Farm advice runs in a Cloud function that verifies Django JWTs against a server-configured HTTPS origin and trusts only the server's role and branch; browser-submitted identity or branch context cannot authorize requests.
- Farm advice sends only manually submitted observations to streaming AI Gateway Responses and persists terminal access blocks in a service-only table; clear blocks only after service access is restored and the owner requests recovery.