# Selected security fixes

- [x] Review only the requested findings and confirm Django handles records and uploads.
- [x] Enable known-leaked password checks for Cloud-managed accounts.
- [x] Remove the selected legacy Cloud table and document access policies without changing Django access or avatar policies.
- [x] Verify effective access restrictions and update only the selected findings (11 database checks, 23 existing tests, and a fresh security scan passed).

# Password recovery

# Farm calendar

- [x] Add branch-scoped calendar with planting, harvesting, maintenance, and resource links.
- [x] Extend the downloadable Django package with calendar storage and server-side branch validation.
- [x] Test scheduling, editing, resource isolation, and desktop/mobile presentation.
- [ ] Install the updated server on the user's computer — requires user installation.


- [x] Add Forgot password and public reset form using existing Django accounts.
- [x] Update downloadable Django server with email recovery endpoints and setup instructions.
- [x] Test token security, password update, and sign-in; check preview navigation.
- [ ] User installation and email delivery verification — requires user's server and SMTP configuration.

# Farm advice

- [x] Add manager-only crop/livestock advice page and navigation.
- [x] Add authenticated streaming AI Gateway function and safety guidance.
- [x] Test access rules, input validation, and streamed response handling.
- [ ] Connect Django HTTPS server address — secure configuration was declined.
- [ ] Apply service-only AI access-state migration — Cloud database connection reported tenant not found.
- [ ] Verify live signed-in advice flow — requires the server connection and applied migration.