# Diagnostic data

This directory contains the diagnostic engine source data, reasoning graph
indexes, standardized datasets, and evaluation outputs used by the
diagnosis-related backend flows.

## Layout

- `engine/` contains the runtime question-selection and probability logic.
- `reasoning_graph/` contains generated graph nodes, edges, and lookup indexes.
- `standardized_data/` contains canonical symptoms, aliases, relationships, and
  normalization reports.
- `evaluation/` contains benchmark cases, reports, safety checks, and analysis
  utilities.
- The JSON files at the directory root contain disease datasets and validation
  output used by the engine tooling.

The JSON artifacts are intentionally checked in so local development and
evaluation can run without a separate data-generation service.
