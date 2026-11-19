from __future__ import annotations

import csv
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_sample_catalog_csv_matches_template_and_counts():
    template_path = ROOT / "docs" / "modelo-planilha-produtos.csv"
    sample_path = ROOT / "scripts" / "catalogo-amostra.csv"

    with template_path.open(encoding="utf-8", newline="") as f:
        template_headers = next(csv.reader(f))

    with sample_path.open(encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))

    keys = list(rows[0].keys())
    assert keys[: len(template_headers)] == template_headers
    assert set(keys[len(template_headers) :]) <= {"destaque"}
    assert len(rows) == 900

    parents = {r["sku_pai"] for r in rows}
    skus = [r["sku"] for r in rows]
    assert len(parents) == 300
    assert len(set(skus)) == 900

    for row in rows:
        assert float(row["preco"]) > 0
        assert int(row["estoque"]) >= 0
        assert row["tamanho"] in {"P", "M", "G"}
        assert row["cor"]


def test_catalog_generator_runs_deterministically(tmp_path: Path):
    script = ROOT / "scripts" / "generate-sample-catalog.py"
    code = (
        "import importlib.util, pathlib\n"
        f"spec = importlib.util.spec_from_file_location('gen', r'{script}')\n"
        "mod = importlib.util.module_from_spec(spec)\n"
        "spec.loader.exec_module(mod)\n"
        f"mod.OUT = pathlib.Path(r'{tmp_path / 'out.csv'}')\n"
        "mod.main()\n"
    )
    res = subprocess.run([sys.executable, "-c", code], capture_output=True, text=True, check=True)
    assert "300 produtos pai, 900 variações" in res.stdout
    assert (tmp_path / "out.csv").read_text(encoding="utf-8") == (
        ROOT / "scripts" / "catalogo-amostra.csv"
    ).read_text(encoding="utf-8")


def test_wordpress_child_theme_structure_and_security_guards():
    required_files = [
        "frontend/style.css",
        "frontend/functions.php",
        "frontend/header.php",
        "frontend/footer.php",
        "frontend/front-page.php",
        "frontend/js/custom.js",
        "frontend/woocommerce/archive-product.php",
        "frontend/woocommerce/content-product.php",
        "frontend/woocommerce/single-product.php",
        "frontend/woocommerce/cart/mini-cart.php",
        "scripts/import-catalog.php",
        "scripts/bootstrap-store.sh",
    ]
    for rel in required_files:
        assert (ROOT / rel).is_file(), f"Arquivo obrigatório ausente: {rel}"

    assert not (ROOT / "woocommerce-setup.sql").exists(), "Arquivo legado perigoso não deve existir"

    functions_php = (ROOT / "frontend" / "functions.php").read_text(encoding="utf-8")
    assert "check_ajax_referer('moda_feminina_load_more'" in functions_php
    assert "sanitize_text_field" in functions_php
    assert "woocommerce_blocks_product_grid_item_html" in functions_php
