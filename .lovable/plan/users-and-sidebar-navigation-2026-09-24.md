# Users and Sidebar Navigation

## Changes
- Replace the Users page’s standalone “Add User” dialog with an action that opens the Employees section in HR, where staff records are created.
- Make HR tabs URL-aware so links such as `/hr?tab=employees` open the requested section directly.
- Add collapsible sidebar submenus to every module that already contains multiple major sections, using each page’s existing sections rather than adding new functionality.
- Keep current role permissions, active-item highlighting, mobile closing behavior, and the compact icon-only sidebar intact.

## Technical details
- Extend the sidebar navigation data with child links containing `?tab=` parameters.
- Convert affected pages’ tabs from fixed defaults to URL-controlled values so sidebar child links select the correct section.
- Keep submenu groups open when their module is active and avoid non-null assertions while rendering children.
- Validate compilation and test desktop/mobile navigation in the running preview.
