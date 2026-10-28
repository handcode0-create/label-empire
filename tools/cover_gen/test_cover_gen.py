import json, tempfile, unittest
from pathlib import Path
import cover_gen as cg


class CoverGenTest(unittest.TestCase):
    def test_deterministic(self):
        a = cg.make_cover("Soleil", "Kaya", "EP", size=200)
        b = cg.make_cover("Soleil", "Kaya", "EP", size=200)
        self.assertEqual(a.tobytes(), b.tobytes())
        self.assertNotEqual(a.tobytes(), cg.make_cover("Autre", "Kaya", "EP", size=200).tobytes())

    def test_all_styles_and_palettes(self):
        for i in range(8):
            self.assertEqual(cg.make_cover("T", "A", style=i, palette=i, size=120).size, (120, 120))

    def test_batch_and_save(self):
        with tempfile.TemporaryDirectory() as d:
            f = Path(d) / "c.json"
            f.write_text(json.dumps([{"title": "Nuit d'Abidjan", "artist": "Zaki", "kind": "Album", "style": 5}]))
            self.assertEqual(cg.main(["--batch", str(f), "--size", "200", "--out", d]), 0)
            self.assertTrue((Path(d) / "zaki-nuit-d-abidjan.png").exists())


if __name__ == "__main__":
    unittest.main()
