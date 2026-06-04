# SYMBOL PRIOR SCORING ROUND 02

Symbol prior scoring maps traditional hour-rectification symbols into three weak-prior groups:

- `G1_zi_wu_mao_you`
- `G2_yin_shen_si_hai`
- `G3_chen_xu_chou_wei`

The output includes:

- normalized prior values that sum to 1;
- raw scores;
- per-answer evidence;
- missing information;
- warning that symbol evidence cannot determine birth hour alone.

Fetal-order scoring uses traditional chart sex:

- male: 1/4/7 -> G1, 2/5/8 -> G3, 3/6/9 -> G2;
- female: 2/5/8 -> G1, 3/6/9 -> G3, 1/4/7 -> G2.

All symbol-answer weights come from `configs/scoring_weights.v1.json`.
