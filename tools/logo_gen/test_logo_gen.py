import json, tempfile, unittest, xml.dom.minidom as md
from pathlib import Path
import logo_gen as g

class T(unittest.TestCase):
    def test_deterministe(self):
        self.assertEqual(g.render_icon(g.make_spec("Savane Records", 1)), g.render_icon(g.make_spec("Savane Records", 1)))
    def test_svg_valide_pour_toutes_les_combinaisons(self):
        for sh in g.SHAPES:
            for mo in g.MOTIFS:
                for pa in g.PALETTES:
                    s = g.make_spec("Nuit d'Abidjan & Co", 3, shape=sh, motif=mo, palette=pa)
                    md.parseString(g.render_icon(s)); md.parseString(g.render_full(s))
    def test_jeu_prédéfini(self):
        with tempfile.TemporaryDirectory() as d:
            self.assertEqual(g.main(["--presets", "--out", d]), 0)
            m = json.loads((Path(d) / "manifest.json").read_text())
            self.assertEqual(len(m), len(g.PRESET_NAMES))
            self.assertTrue((Path(d) / m[0]["icon"]).exists())
    def test_initiales(self):
        self.assertEqual(g.initials("Savane Records"), "SR"); self.assertEqual(g.initials("Atlas"), "AT")
if __name__ == "__main__":
    unittest.main()
