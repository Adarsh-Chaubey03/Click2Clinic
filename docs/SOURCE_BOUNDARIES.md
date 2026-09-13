# Source boundaries

The local reference directory is intentionally outside the application tree.
Only application files and safe configuration templates belong in this
repository.

The following must remain untracked:

- `.env` and other local environment files;
- dependency directories such as `node_modules/`;
- generated output such as `dist/`, `build/`, and `.expo/`; and
- the local reference directory named `vaidyatek/`.

The root ignore rules enforce these boundaries. Run `git status --ignored` when
checking the workspace before publishing changes.
