#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read_tsv(path: Path):
    with path.open(encoding='utf-8', newline='') as handle:
        return list(csv.DictReader(handle, delimiter='\t'))


class ResearchPipelineTests(unittest.TestCase):
    def test_dataset_split_prevents_native_song_and_lemma_leakage(self):
        rows = [
            ['language','native','romanized','artist','song','lemma'],
            ['hi','प्यार','pyaar','A','Song 1','प्यार'],
            ['hi','प्यार','pyar','B','Song 2','प्यार'],
            ['hi','प्यारा','pyaara','C','Song 3','प्यार'],
            ['ta','தமிழ்','tamil','D','Song 4','தமிழ்'],
            ['ta','பாட்டு','paattu','D','Song 4','பாட்டு'],
            ['ml','പാട്ട്','paattu','E','Song 5','പാട്ട്'],
        ]
        with tempfile.TemporaryDirectory() as temp:
            temp = Path(temp)
            source = temp / 'input.tsv'
            out = temp / 'split'
            with source.open('w', encoding='utf-8', newline='') as handle:
                csv.writer(handle, delimiter='\t', lineterminator='\n').writerows(rows)
            subprocess.run([
                'python3', str(ROOT/'scripts'/'prepare-lyricg2p-dataset.py'),
                str(source), str(out), '--dev', '0.2', '--test', '0.2'
            ], check=True, capture_output=True, text=True)
            membership = {}
            for split in ('train','dev','test'):
                for row in read_tsv(out/f'{split}.tsv'):
                    membership[(row['language'], row['native'], row['song'])] = split
            hi = {split for (lang, native, song), split in membership.items() if lang == 'hi'}
            self.assertEqual(len(hi), 1, 'shared Hindi lemma/native forms must remain in one component')
            tamil_song = {split for (lang, native, song), split in membership.items() if song == 'Song 4'}
            self.assertEqual(len(tamil_song), 1, 'same song must never straddle splits')

    def test_invalid_split_fractions_are_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            temp = Path(temp)
            source = temp/'input.tsv'
            source.write_text('language\tnative\tromanized\nhi\tप्यार\tpyaar\n', encoding='utf-8')
            result = subprocess.run([
                'python3', str(ROOT/'scripts'/'prepare-lyricg2p-dataset.py'),
                str(source), str(temp/'out'), '--dev', '0.7', '--test', '0.4'
            ], capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)

    def test_dakshina_import_normalizes_and_aggregates_attestations(self):
        with tempfile.TemporaryDirectory() as temp:
            temp = Path(temp)
            source_dir = temp/'ta'
            source_dir.mkdir()
            (source_dir/'ta.translit.sampled.test.tsv').write_text(
                'தமிழ்\ttamil\t2\nதமிழ்\ttamizh\t1\nதமிழ்\ttamil\t3\nபாட்டு\tpaattu\t0\n',
                encoding='utf-8'
            )
            output = temp/'dakshina.tsv'
            subprocess.run([
                'python3', str(ROOT/'scripts'/'import-dakshina.py'), temp, output, '--split', 'test'
            ], check=True, capture_output=True, text=True)
            data = {row['native']: row for row in read_tsv(output)}
            tamil = data['தமிழ்']
            self.assertEqual(tamil['references'].split('||')[0], 'tamil')
            counts = json.loads(tamil['referenceCounts'])
            self.assertEqual(counts['tamil'], 5)
            self.assertEqual(counts['tamizh'], 1)
            self.assertEqual(json.loads(data['பாட்டு']['referenceCounts'])['paattu'], 1)


if __name__ == '__main__':
    unittest.main()
