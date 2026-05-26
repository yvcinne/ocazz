"""
generate_pipeline.py
────────────────────
Runs the four Jupyter notebooks in the correct order to produce
prediction/production/final_pipeline.pkl from raw data.

Usage:
    # 1. Place data.csv inside prediction/data/
    # 2. Run from the project root:
    python prediction/api/generate_pipeline.py

Execution order:
    1. preparing/cleaning.ipynb        → data/data_cleaned.csv
    2. preparing/preparing_data.ipynb  → data/data_split/ + production/*.pkl (encoders)
    3. models/modeling_random_forest.ipynb → production/random_forest_model.pkl
    4. preparing/pipeline.ipynb        → production/final_pipeline.pkl  ← used by Flask API
"""

import subprocess
import sys
import os

VENV_JUPYTER = os.path.join(os.path.dirname(__file__), ".venv", "bin", "jupyter")

NOTEBOOKS = [
    "prediction/preparing/cleaning.ipynb",
    "prediction/preparing/preparing_data.ipynb",
    "prediction/models/modeling_random_forest.ipynb",
    "prediction/preparing/pipeline.ipynb",
]

def run_notebook(path: str) -> None:
    print(f"\n{'='*60}")
    print(f"  Running: {path}")
    print(f"{'='*60}")
    result = subprocess.run(
        [
            VENV_JUPYTER, "nbconvert",
            "--to", "notebook",
            "--execute",
            "--inplace",
            "--ExecutePreprocessor.timeout=600",
            path,
        ],
        capture_output=False,
    )
    if result.returncode != 0:
        print(f"\n❌  Notebook failed: {path}", file=sys.stderr)
        sys.exit(result.returncode)
    print(f"✅  Done: {path}")


def check_data_csv() -> None:
    data_path = os.path.join("prediction", "data", "data.csv")
    if not os.path.isfile(data_path):
        print(
            f"\n❌  Missing file: {data_path}\n"
            "   Place your scraped data.csv inside prediction/data/ and re-run.\n",
            file=sys.stderr,
        )
        sys.exit(1)


if __name__ == "__main__":
    # Must be run from the project root
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    os.chdir(project_root)
    print(f"Working directory: {project_root}")

    check_data_csv()

    for nb in NOTEBOOKS:
        run_notebook(nb)

    pipeline_path = os.path.join("prediction", "production", "final_pipeline.pkl")
    if os.path.isfile(pipeline_path):
        print(f"\n🎉  Pipeline ready at {pipeline_path}")
        print("   Start the Flask API with:")
        print("   prediction/api/.venv/bin/python prediction/api/app.py")
    else:
        print(f"\n⚠️  Pipeline file not found at {pipeline_path}", file=sys.stderr)
        sys.exit(1)
