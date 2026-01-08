# Schemat Formatter for VS Code

This extension provides formatting support for Scheme files using [schemat](https://github.com/raviqqe/schemat).

This project is not affiliated with the original `schemat` project.

## Features

- Formats Scheme code (`.scm`, `.ss`, `.sld`, etc) using `schemat`.
- Prompts to install `schemat` if not found.

## Requirements

- `schemat` CLI tool installed. The extension can help you install it via `cargo binstall`.

# Downloads

Unfortunately I am unable to create Azure DevOps account for some stupid reason. You can either built from source or download zip archive directly from actions. Here's a direct link to latest successfull run: https://github.com/playX18/schemat-vsx/actions/runs/20818118107/artifacts/5062892475

## Extension Settings

This extension has only one setting:

* `schemat.command`: Path to the `schemat` executable. Defaults to `schemat`.

## Known Issues

- It might error out on some non-standard reader extensions, please report bugs
to [schemat](https://github.com/raviqqe/schemat) repository.
