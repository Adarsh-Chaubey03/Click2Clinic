# Asset inventory

The web and mobile applications keep their assets beside the application that
uses them. This preserves the existing import paths and lets each client build
independently.

| Application | Asset location | Contents |
| --- | --- | --- |
| Patient web | `frontend/src/assets/` and `frontend/public/` | Logos, icons, healthcare imagery, maps, and media |
| Admin and doctor web | `admin/src/assets/` and `admin/public/` | Portal icons, logos, medicine imagery, and static files |
| Mobile | `mobile/assets/` | Expo icons, splash artwork, and client media |

When adding a new asset, use a stable relative import from the owning
application and avoid placing secrets or environment-specific files in an
asset directory.
