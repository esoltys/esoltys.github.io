# Shared Flatpak repo

Static hosting for a multi-project [OSTree](https://ostreedev.github.io/ostree/) Flatpak repo,
served as-is by GitHub Pages at `https://esoltys.dev/flatpak/`. Any project's CI can publish a ref
here (each app gets its own `app/<id>/<arch>/<branch>` ref inside the same repo) instead of
standing up a separate repo/signing key per project.

- `esoltys.flatpakrepo` — the repo descriptor users add once with
  `flatpak remote-add --if-not-exists esoltys https://esoltys.dev/flatpak/esoltys.flatpakrepo`.
- `repo/` — the OSTree repo itself (created automatically by the first publishing CI run via
  `flatpak-builder --repo=flatpak/repo ...` / `flatpak build-update-repo`; not created by hand).
  This directory is git-tracked like the rest of the site, but grows over time as releases are
  published — unlike the rest of this repo's static content, watch its size.

Currently publishes [Luminous Music Player](https://github.com/esoltys/luminous)
(`org.luminous.music`) from `esoltys/luminous`'s `flatpak-build` release job. Full setup/runbook
(GPG key generation, secrets, manifest) lives in that repo's
[`docs/FLATPAK.md`](https://github.com/esoltys/luminous/blob/main/docs/FLATPAK.md), since it's
maintained alongside the CI workflow that publishes here — this file is just what's local to this
repo.
