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
    },
    {
      "condition_id": "mass_1p4",
      "initial_state_sha256": "5ec96a2a88d121000986746a95e9b42cb8477547ff80d2cdf74a13aba6a09d78",
      "episode_seed": 401088,
      "geometry_seed": 401,
      "selection_rule": "Selected saved shared initial state with a verified native MLP fall and PRISM 20-second survival; illustrative, separate from aggregate results.",
      "videos": [
        {
          "actor": "standard",
          "condition_id": "mass_1p4",
          "grid_shape": [
            21,
            21
          ],
          "root_seed": 401,
          "geometry_seed": 401,
          "episode_index": 88,
          "episode_seed": 401088,
          "initial_state_sha256": "5ec96a2a88d121000986746a95e9b42cb8477547ff80d2cdf74a13aba6a09d78",
          "illustrative_replay": true,
          "exact_quantitative_trajectory": false,
          "physical_duration_seconds": 10.9,
          "termination_reasons": [
            "fell_over",
            "fell_over_post_step"
          ],
          "status": "ready",
          "path": "videos/selected-mass_1p4-standard-case88.mp4",
          "video_sha256": "6e3f9d9a8f40f7a2f536edebd7031927f0ddb394cf387be2a9bf4e2ac672d507",
          "video_bytes": 387108,
          "requested_physics": {
            "foot_friction": 0.6,
            "global_link_density_ratio": 1.4,
            "payload_kg": 0.0
          },
          "physics": {
            "foot_friction": 0.6,
            "global_link_density_ratio": 1.4,
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
          "backend": "Native MuJoCo-Warp CUDA",
          "encoded_duration_seconds": 12.0,
          "survived_horizon": false,
          "fps": 25,
          "width": 640,
          "height": 360,
          "compatible_with_dataset": "admitted_rough1000_physical_v1",
          "checkpoint_sha256": "5e3960a361847adb048b1acffeb846540d589ff1dc7c36a73fe9dd74e872c343",
          "outcome_selected": true,
          "post_termination_continuation_seconds": 1
        },
        {
          "actor": "prism",
          "condition_id": "mass_1p4",
          "grid_shape": [
            21,
            21
          ],
          "root_seed": 401,
          "geometry_seed": 401,
          "episode_index": 88,
          "episode_seed": 401088,
          "initial_state_sha256": "5ec96a2a88d121000986746a95e9b42cb8477547ff80d2cdf74a13aba6a09d78",
          "illustrative_replay": true,
          "exact_quantitative_trajectory": false,
          "physical_duration_seconds": 20.0,
          "termination_reasons": [
            "time_out"
          ],
          "status": "ready",
          "path": "videos/selected-mass_1p4-prism-case88.mp4",
          "video_sha256": "87e4b24a8051b73c67311b668b2bced68c2f92a8a6ec282e62fed79bfdec7149",
          "video_bytes": 666493,
          "requested_physics": {
            "foot_friction": 0.6,
            "global_link_density_ratio": 1.4,
            "payload_kg": 0.0
          },
          "physics": {
            "foot_friction": 0.6,
            "global_link_density_ratio": 1.4,
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
          "backend": "Native MuJoCo-Warp CUDA",
          "encoded_duration_seconds": 20.04,
          "survived_horizon": true,
          "fps": 25,
          "width": 640,
          "height": 360,
          "compatible_with_dataset": "admitted_rough1000_physical_v1",
          "checkpoint_sha256": "5449bfb5715a85f233ae16c2459d8ff0ac4d06b58b8775e7ed6385fdd8a537ab",
          "outcome_selected": true,
          "post_termination_continuation_seconds": 0
        }
      ]
    },
    {
      "condition_id": "payload_8",
      "initial_state_sha256": "4ed8739ba707bdc24bb1d0b9978317aa945445a1b6358e2233e8771c6d6e86eb",
      "episode_seed": 401040,
      "geometry_seed": 401,
      "selection_rule": "Selected saved shared initial state with a verified native MLP fall and PRISM 20-second survival; illustrative, separate from aggregate results.",
      "videos": [
        {
          "actor": "standard",
          "condition_id": "payload_8",
          "grid_shape": [
            21,
            21
          ],
          "root_seed": 401,
          "geometry_seed": 401,
          "episode_index": 40,
          "episode_seed": 401040,
          "initial_state_sha256": "4ed8739ba707bdc24bb1d0b9978317aa945445a1b6358e2233e8771c6d6e86eb",
          "illustrative_replay": true,
          "exact_quantitative_trajectory": false,
          "physical_duration_seconds": 10.46,
          "termination_reasons": [
            "fell_over",
            "fell_over_post_step"
          ],
          "status": "ready",
          "path": "videos/selected-payload_8-standard-case40-backpack.mp4",
          "video_sha256": "f9e92ea2c1abd722a1c14a155fedcecb9dde951f2961255d7524be691f407c6d",
          "video_bytes": 364066,
          "requested_physics": {
            "foot_friction": 0.6,
            "global_link_density_ratio": 1.0,
            "payload_kg": 8.0
          },
          "physics": {
            "foot_friction": 0.6,
            "global_link_density_ratio": 1.0,
            "payload_kg": 8.0
          },
          "command": [
            0.5,
            0.0,
            0.0
          ],
          "warmup_seconds": 0,
          "measurement_seconds": 20,
          "total_horizon_seconds": 20,
          "backend": "Native MuJoCo-Warp CUDA",
          "encoded_duration_seconds": 11.56,
          "survived_horizon": false,
          "fps": 25,
          "width": 640,
          "height": 360,
          "compatible_with_dataset": "admitted_rough1000_physical_v1",
          "checkpoint_sha256": "5e3960a361847adb048b1acffeb846540d589ff1dc7c36a73fe9dd74e872c343",
          "outcome_selected": true,
          "post_termination_continuation_seconds": 1
        },
        {
          "actor": "prism",
          "condition_id": "payload_8",
          "grid_shape": [
            21,
            21
          ],
          "root_seed": 401,
          "geometry_seed": 401,
          "episode_index": 40,
          "episode_seed": 401040,
          "initial_state_sha256": "4ed8739ba707bdc24bb1d0b9978317aa945445a1b6358e2233e8771c6d6e86eb",
          "illustrative_replay": true,
          "exact_quantitative_trajectory": false,
          "physical_duration_seconds": 20.0,
          "termination_reasons": [
            "time_out"
          ],
          "status": "ready",
          "path": "videos/selected-payload_8-prism-case40-backpack.mp4",
          "video_sha256": "591378ff306f72cdee2d0049e3acc8ccf08e74b9db7c8661e3120b085e180486",
          "video_bytes": 600759,
          "requested_physics": {
            "foot_friction": 0.6,
            "global_link_density_ratio": 1.0,
            "payload_kg": 8.0
          },
          "physics": {
            "foot_friction": 0.6,
            "global_link_density_ratio": 1.0,
            "payload_kg": 8.0
          },
          "command": [
            0.5,
            0.0,
            0.0
          ],
          "warmup_seconds": 0,
          "measurement_seconds": 20,
          "total_horizon_seconds": 20,
          "backend": "Native MuJoCo-Warp CUDA",
          "encoded_duration_seconds": 20.04,
          "survived_horizon": true,
          "fps": 25,
          "width": 640,
          "height": 360,
          "compatible_with_dataset": "admitted_rough1000_physical_v1",
          "checkpoint_sha256": "5449bfb5715a85f233ae16c2459d8ff0ac4d06b58b8775e7ed6385fdd8a537ab",
          "outcome_selected": true,
          "post_termination_continuation_seconds": 0
        }
      ]
    }
  ]
};
(()=>{const d=window.PRISM_ROUGH21;for(const p of window.PRISM_SELECTED_ROUGH_PAIRS.pairs){d.videos=d.videos.filter(v=>v.condition_id!==p.condition_id||!p.videos.some(s=>s.actor===v.actor)).concat(p.videos);}})();
