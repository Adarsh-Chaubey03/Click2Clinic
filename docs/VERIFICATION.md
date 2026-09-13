# Verification record

## Checks run

| Area | Command | Result |
| --- | --- | --- |
| Patient web | `npm --prefix frontend run build` | Passed |
| Admin web | `npm --prefix admin run build` | Passed |
| Patient web lint | `npm --prefix frontend run lint` | Blocked by the existing ESLint config/package export mismatch |
| Admin web lint | `npm --prefix admin run lint` | Blocked by an undefined flat-config entry |
| Backend | No build or test script is provided beyond the development server | Not run |
| Mobile | No non-interactive validation script is provided | Not run |

The web builds complete successfully. The lint results are retained here so
they are visible without presenting a passing status for checks that could not
run successfully.

## Source inventory

The target contains the backend, patient web, admin/doctor web, mobile,
diagnostic data, documentation, and all application asset directories. The
source comparison also confirmed that the remaining configuration and support
files are present.
