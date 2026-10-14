window.PRISM_SELECTED_ROUGH_PAIRS = {
  "schema": "prism_selected_rough_pairs_v1",
  "dataset": "admitted_rough1000_physical_v1",
  "pairs": [
    {
      "condition_id": "friction_0p2",
      "initial_state_sha256": "66b2523753298f38c25e369a71ad9c34cbae4ba521f39c86bc25ae72ea3314d3",
      "episode_seed": 401010,
      "geometry_seed": 401,
      "selection_rule": "Ordered saved shared cases with GPU MLP nativefall<=8s, PRISM survival and positive forward progress; retain first verified CPU fail/survive contrast. Failed candidate replays remain in private provenance.",
      "videos": [
        {
          "actor": "standard",
          "condition_id": "friction_0p2",
          "grid_shape": [
            21,
            21
          ],
          "root_seed": 401,
          "geometry_seed": 401,
          "episode_index": 10,
          "episode_seed": 401010,
          "initial_state_sha256": "66b2523753298f38c25e369a71ad9c34cbae4ba521f39c86bc25ae72ea3314d3",
          "illustrative_replay": true,
          "exact_quantitative_trajectory": false,
          "physical_duration_seconds": 11.18,
          "termination_reasons": [
            "fell_over",
            "fell_over_post_step"
          ],
          "status": "ready",
          "path": "videos/selected-friction_0p2-standard-case10.mp4",
          "video_sha256": "a38f9006cba48056e3afa23185930dc3e7396560b9cbe841cb56eb309b695eaf",
          "video_bytes": 406366,
          "requested_physics": {
            "foot_friction": 0.2,
            "global_link_density_ratio": 1.0,
            "payload_kg": 0.0
          },
          "physics": {
            "foot_friction": 0.2,
            "global_link_density_ratio": 1.0,
            "payload_kg": 0.0
          },
          "command": [
            0.5,
            0.0,
            0.0
          ],
          "warmup_seconds": 0,
          "measurement_seconds": 20,
          "total_horizon_seconds": 20,
          "backend": "CPU replay",
          "encoded_duration_seconds": 12.28,
          "survived_horizon": false,
          "fps": 25.0,
          "width": 640,
          "height": 360,
          "compatible_with_dataset": "admitted_rough1000_physical_v1",
          "checkpoint_sha256": "5e3960a361847adb048b1acffeb846540d589ff1dc7c36a73fe9dd74e872c343",
          "outcome_selected": true,
          "post_termination_continuation_seconds": 1.0
        },
        {
          "actor": "prism",
          "condition_id": "friction_0p2",
          "grid_shape": [
            21,
            21
          ],
          "root_seed": 401,
          "geometry_seed": 401,
          "episode_index": 10,
          "episode_seed": 401010,
          "initial_state_sha256": "66b2523753298f38c25e369a71ad9c34cbae4ba521f39c86bc25ae72ea3314d3",
          "illustrative_replay": true,
          "exact_quantitative_trajectory": false,
          "physical_duration_seconds": 20.0,
          "termination_reasons": [
            "time_out"
          ],
          "status": "ready",
          "path": "videos/selected-friction_0p2-prism-case10.mp4",
          "video_sha256": "ecdbb3e30b0cd93185907070c507464aba0451f941bc4c7db6f70003345248ef",
          "video_bytes": 662041,
          "requested_physics": {
            "foot_friction": 0.2,
            "global_link_density_ratio": 1.0,
            "payload_kg": 0.0
          },
          "physics": {
            "foot_friction": 0.2,
            "global_link_density_ratio": 1.0,
            "payload_kg": 0.0
          },
          "command": [
            0.5,
            0.0,
            0.0
          ],
          "warmup_seconds": 0,
          "measurement_seconds": 20,
          "total_horizon_seconds": 20,
          "backend": "CPU replay",
          "encoded_duration_seconds": 20.04,
          "survived_horizon": true,
          "fps": 25.0,
          "width": 640,
          "height": 360,
          "compatible_with_dataset": "admitted_rough1000_physical_v1",
          "checkpoint_sha256": "5449bfb5715a85f233ae16c2459d8ff0ac4d06b58b8775e7ed6385fdd8a537ab",
          "outcome_selected": true
        }
      ]
    }
  ]
};
(()=>{const d=window.PRISM_ROUGH21;for(const p of window.PRISM_SELECTED_ROUGH_PAIRS.pairs){d.videos=d.videos.filter(v=>v.condition_id!==p.condition_id||!p.videos.some(s=>s.actor===v.actor)).concat(p.videos);}})();
