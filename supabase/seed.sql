-- ==============================================================================
-- KREEPYCODE DATABASE SEED SCRIPT
-- Migration: seed.sql
-- Description: Real DSA & SQL curriculum with 2h, 3h, and 4h pacing tracks.
-- Idempotent: Uses ON CONFLICT DO UPDATE across unique constraints.
-- ==============================================================================

-- 1. COURSES
INSERT INTO public.courses (id, title, slug, description, icon, is_published)
VALUES
  (
    'c0000000-0000-0000-0000-000000000001',
    'Data Structures & Algorithms in C++',
    'dsa-cpp',
    'Rigorous algorithmic foundations, pointer mechanics, asymptotic analysis, and cache-conscious data structures in modern C++.',
    'terminal',
    true
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'Mastering Production SQL',
    'mastering-sql',
    'Relational algebra, analytical window functions, query execution planning, and high-throughput query optimization.',
    'database',
    true
  )
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    is_published = EXCLUDED.is_published;

-- 2. COURSE TRACKS (2h, 3h, 4h daily pacing)
INSERT INTO public.course_tracks (id, course_id, daily_hours, total_days)
VALUES
  -- DSA Tracks
  ('b0000000-0000-0000-0000-000000000021', 'c0000000-0000-0000-0000-000000000001', 2, 60),
  ('b0000000-0000-0000-0000-000000000031', 'c0000000-0000-0000-0000-000000000001', 3, 40),
  ('b0000000-0000-0000-0000-000000000041', 'c0000000-0000-0000-0000-000000000001', 4, 30),
  -- SQL Tracks
  ('b0000000-0000-0000-0000-000000000022', 'c0000000-0000-0000-0000-000000000002', 2, 45),
  ('b0000000-0000-0000-0000-000000000032', 'c0000000-0000-0000-0000-000000000002', 3, 30),
  ('b0000000-0000-0000-0000-000000000042', 'c0000000-0000-0000-0000-000000000002', 4, 21)
ON CONFLICT (course_id, daily_hours) DO UPDATE
SET total_days = EXCLUDED.total_days;

-- 3. TRACK DAYS (Day 1 & Day 2 across each track)
INSERT INTO public.track_days (id, track_id, day_number, title)
VALUES
  -- DSA in C++: 2 Hours
  ('d0000000-0000-0000-0000-000000002101', 'b0000000-0000-0000-0000-000000000021', 1, 'Arrays & Kadane''s Algorithm'),
  ('d0000000-0000-0000-0000-000000002102', 'b0000000-0000-0000-0000-000000000021', 2, 'Two Pointers Technique'),
  -- DSA in C++: 3 Hours
  ('d0000000-0000-0000-0000-000000003101', 'b0000000-0000-0000-0000-000000000031', 1, 'Arrays & Kadane''s Algorithm'),
  ('d0000000-0000-0000-0000-000000003102', 'b0000000-0000-0000-0000-000000000031', 2, 'Two Pointers Technique'),
  -- DSA in C++: 4 Hours
  ('d0000000-0000-0000-0000-000000004101', 'b0000000-0000-0000-0000-000000000041', 1, 'Arrays & Kadane''s Algorithm'),
  ('d0000000-0000-0000-0000-000000004102', 'b0000000-0000-0000-0000-000000000041', 2, 'Two Pointers Technique'),
  -- Mastering SQL: 2 Hours
  ('d0000000-0000-0000-0000-000000002201', 'b0000000-0000-0000-0000-000000000022', 1, 'Filtering & Grouping'),
  ('d0000000-0000-0000-0000-000000002202', 'b0000000-0000-0000-0000-000000000022', 2, 'Window Functions'),
  -- Mastering SQL: 3 Hours
  ('d0000000-0000-0000-0000-000000003201', 'b0000000-0000-0000-0000-000000000032', 1, 'Filtering & Grouping'),
  ('d0000000-0000-0000-0000-000000003202', 'b0000000-0000-0000-0000-000000000032', 2, 'Window Functions'),
  -- Mastering SQL: 4 Hours
  ('d0000000-0000-0000-0000-000000004201', 'b0000000-0000-0000-0000-000000000042', 1, 'Filtering & Grouping'),
  ('d0000000-0000-0000-0000-000000004202', 'b0000000-0000-0000-0000-000000000042', 2, 'Window Functions')
ON CONFLICT (track_id, day_number) DO UPDATE
SET title = EXCLUDED.title;

-- 4. DAY TASKS: DSA IN C++ (DAY 1: ARRAYS & KADANE'S ALGORITHM)

-- DSA Day 1: 2-Hour Track (1 Theory + 1 Problem)
INSERT INTO public.day_tasks (id, day_id, sequence_order, task_type, title, estimated_minutes, payload)
VALUES
  (
    'a0000000-0000-0000-0000-000000002111',
    'd0000000-0000-0000-0000-000000002101',
    1,
    'theory_video',
    'Array Memory Layout & Kadane''s Theorem',
    45,
    '{
      "markdown_notes": "### Contiguous Memory Allocation & Cache Locality\nIn modern processor architectures, CPU caches (L1, L2, L3) exploit spatial locality. Arrays occupy contiguous memory blocks, ensuring sequential reads populate entire 64-byte cache lines without cache misses.\n\n### Kadane''s Algorithm Proof\nKadane''s algorithm computes the maximum subarray sum in O(N) time and O(1) space. At each index i, the optimal subarray ending at i is either nums[i] alone or extends the optimal subarray ending at i-1:\n\ncurrent_max = max(nums[i], current_max + nums[i])\n\nIf current_max drops below zero, discarding the negative prefix guarantees optimal convergence.",
      "video_url": "https://www.youtube-nocookie.com/embed/5WZl3MMT0Eg",
      "video_title": "Kadane''s Algorithm & Spatial Cache Locality",
      "timestamps": [
        {"time": "00:00", "label": "Hardware Cache Lines & Spatial Locality"},
        {"time": "04:15", "label": "The Negative Prefix Invariant"},
        {"time": "09:30", "label": "Proof of Greedy Choice in O(N)"}
      ]
    }'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000002112',
    'd0000000-0000-0000-0000-000000002101',
    2,
    'dsa_problem',
    'Maximum Subarray (Kadane''s Algorithm)',
    75,
    '{
      "description": "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.\n\n### Constraints\n- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4",
      "starter_code": "#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nint maxSubArray(const vector<int>& nums) {\n    // Implement O(N) Kadane''s algorithm\n    int max_so_far = nums[0];\n    int curr_max = nums[0];\n    for (size_t i = 1; i < nums.size(); ++i) {\n        curr_max = max(nums[i], curr_max + nums[i]);\n        max_so_far = max(max_so_far, curr_max);\n    }\n    return max_so_far;\n}\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> nums(n);\n    for (int i = 0; i < n; ++i) cin >> nums[i];\n    cout << maxSubArray(nums) << endl;\n    return 0;\n}",
      "language": "cpp",
      "sample_testcases": [
        {"input": "9\n-2 1 -3 4 -1 2 1 -5 4", "expected_output": "6", "explanation": "[4,-1,2,1] has the largest sum = 6."},
        {"input": "1\n1", "expected_output": "1"}
      ],
      "hidden_testcases": [
        {"input": "5\n5 4 -1 7 8", "expected_output": "23"},
        {"input": "4\n-3 -2 -1 -4", "expected_output": "-1"}
      ]
    }'::jsonb
  )
ON CONFLICT (day_id, sequence_order) DO UPDATE
SET task_type = EXCLUDED.task_type,
    title = EXCLUDED.title,
    estimated_minutes = EXCLUDED.estimated_minutes,
    payload = EXCLUDED.payload;

-- DSA Day 1: 3-Hour Track (1 Theory + 2 Problems)
INSERT INTO public.day_tasks (id, day_id, sequence_order, task_type, title, estimated_minutes, payload)
VALUES
  (
    'a0000000-0000-0000-0000-000000003111',
    'd0000000-0000-0000-0000-000000003101',
    1,
    'theory_video',
    'Array Memory Layout & Kadane''s Theorem',
    45,
    '{
      "markdown_notes": "### Contiguous Memory Allocation & Cache Locality\nIn modern processor architectures, CPU caches (L1, L2, L3) exploit spatial locality.\n\n### Kadane''s Algorithm Proof\nAt each index i, optimal subarray ending at i is max(nums[i], current_max + nums[i]).",
      "video_url": "https://www.youtube-nocookie.com/embed/5WZl3MMT0Eg",
      "video_title": "Kadane''s Algorithm & Spatial Cache Locality",
      "timestamps": [
        {"time": "00:00", "label": "Hardware Cache Lines & Spatial Locality"},
        {"time": "06:00", "label": "Proof of Greedy Choice in O(N)"}
      ]
    }'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000003112',
    'd0000000-0000-0000-0000-000000003101',
    2,
    'dsa_problem',
    'Maximum Subarray (Kadane''s Algorithm)',
    65,
    '{
      "description": "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
      "starter_code": "#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nint maxSubArray(const vector<int>& nums) {\n    int max_so_far = nums[0], curr = nums[0];\n    for (size_t i = 1; i < nums.size(); ++i) {\n        curr = max(nums[i], curr + nums[i]);\n        max_so_far = max(max_so_far, curr);\n    }\n    return max_so_far;\n}\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> nums(n);\n    for (int i = 0; i < n; ++i) cin >> nums[i];\n    cout << maxSubArray(nums) << endl;\n    return 0;\n}",
      "language": "cpp",
      "sample_testcases": [
        {"input": "9\n-2 1 -3 4 -1 2 1 -5 4", "expected_output": "6"}
      ],
      "hidden_testcases": [
        {"input": "5\n5 4 -1 7 8", "expected_output": "23"}
      ]
    }'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000003113',
    'd0000000-0000-0000-0000-000000003101',
    3,
    'dsa_problem',
    'Maximum Product Subarray',
    70,
    '{
      "description": "Given an integer array `nums`, find a subarray with the largest product, and return that product.\n\n### Constraints\n- 1 <= nums.length <= 2 * 10^4\n- -10 <= nums[i] <= 10",
      "starter_code": "#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nint maxProduct(const vector<int>& nums) {\n    int max_p = nums[0], min_p = nums[0], ans = nums[0];\n    for (size_t i = 1; i < nums.size(); ++i) {\n        if (nums[i] < 0) swap(max_p, min_p);\n        max_p = max(nums[i], max_p * nums[i]);\n        min_p = min(nums[i], min_p * nums[i]);\n        ans = max(ans, max_p);\n    }\n    return ans;\n}\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> nums(n);\n    for (int i = 0; i < n; ++i) cin >> nums[i];\n    cout << maxProduct(nums) << endl;\n    return 0;\n}",
      "language": "cpp",
      "sample_testcases": [
        {"input": "4\n2 3 -2 4", "expected_output": "6"},
        {"input": "3\n-2 0 -1", "expected_output": "0"}
      ],
      "hidden_testcases": [
        {"input": "4\n-2 3 -4 -1", "expected_output": "24"}
      ]
    }'::jsonb
  )
ON CONFLICT (day_id, sequence_order) DO UPDATE
SET task_type = EXCLUDED.task_type,
    title = EXCLUDED.title,
    estimated_minutes = EXCLUDED.estimated_minutes,
    payload = EXCLUDED.payload;

-- DSA Day 1: 4-Hour Track (1 Theory + 2 Problems + 1 Bonus Problem)
INSERT INTO public.day_tasks (id, day_id, sequence_order, task_type, title, estimated_minutes, payload)
VALUES
  (
    'a0000000-0000-0000-0000-000000004111',
    'd0000000-0000-0000-0000-000000004101',
    1,
    'theory_video',
    'Array Memory Layout & Kadane''s Theorem',
    45,
    '{
      "markdown_notes": "### Contiguous Memory Allocation & Cache Locality\nIn modern processor architectures, CPU caches (L1, L2, L3) exploit spatial locality.\n\n### Kadane''s Algorithm Proof\nAt each index i, optimal subarray ending at i is max(nums[i], current_max + nums[i]).",
      "video_url": "https://www.youtube-nocookie.com/embed/5WZl3MMT0Eg",
      "video_title": "Kadane''s Algorithm & Spatial Cache Locality"
    }'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000004112',
    'd0000000-0000-0000-0000-000000004101',
    2,
    'dsa_problem',
    'Maximum Subarray (Kadane''s Algorithm)',
    60,
    '{
      "description": "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
      "starter_code": "#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nint maxSubArray(const vector<int>& nums) {\n    int max_so_far = nums[0], curr = nums[0];\n    for (size_t i = 1; i < nums.size(); ++i) {\n        curr = max(nums[i], curr + nums[i]);\n        max_so_far = max(max_so_far, curr);\n    }\n    return max_so_far;\n}\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> nums(n);\n    for (int i = 0; i < n; ++i) cin >> nums[i];\n    cout << maxSubArray(nums) << endl;\n    return 0;\n}",
      "language": "cpp",
      "sample_testcases": [{"input": "9\n-2 1 -3 4 -1 2 1 -5 4", "expected_output": "6"}],
      "hidden_testcases": [{"input": "5\n5 4 -1 7 8", "expected_output": "23"}]
    }'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000004113',
    'd0000000-0000-0000-0000-000000004101',
    3,
    'dsa_problem',
    'Maximum Product Subarray',
    65,
    '{
      "description": "Given an integer array `nums`, find a subarray with the largest product, and return that product.",
      "starter_code": "#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nint maxProduct(const vector<int>& nums) {\n    int max_p = nums[0], min_p = nums[0], ans = nums[0];\n    for (size_t i = 1; i < nums.size(); ++i) {\n        if (nums[i] < 0) swap(max_p, min_p);\n        max_p = max(nums[i], max_p * nums[i]);\n        min_p = min(nums[i], min_p * nums[i]);\n        ans = max(ans, max_p);\n    }\n    return ans;\n}\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> nums(n);\n    for (int i = 0; i < n; ++i) cin >> nums[i];\n    cout << maxProduct(nums) << endl;\n    return 0;\n}",
      "language": "cpp",
      "sample_testcases": [{"input": "4\n2 3 -2 4", "expected_output": "6"}],
      "hidden_testcases": [{"input": "4\n-2 3 -4 -1", "expected_output": "24"}]
    }'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000004114',
    'd0000000-0000-0000-0000-000000004101',
    4,
    'dsa_problem',
    'Bonus: Circular Maximum Subarray Sum',
    70,
    '{
      "description": "Given a circular integer array `nums` of length `n`, return the maximum possible sum of a non-empty subarray.",
      "starter_code": "#include <iostream>\n#include <vector>\n#include <numeric>\n#include <algorithm>\n\nusing namespace std;\n\nint maxSubarraySumCircular(const vector<int>& nums) {\n    int total = 0, max_s = nums[0], cur_max = 0, min_s = nums[0], cur_min = 0;\n    for (int x : nums) {\n        cur_max = max(x, cur_max + x);\n        max_s = max(max_s, cur_max);\n        cur_min = min(x, cur_min + x);\n        min_s = min(min_s, cur_min);\n        total += x;\n    }\n    return max_s > 0 ? max(max_s, total - min_s) : max_s;\n}\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> nums(n);\n    for (int i = 0; i < n; ++i) cin >> nums[i];\n    cout << maxSubarraySumCircular(nums) << endl;\n    return 0;\n}",
      "language": "cpp",
      "sample_testcases": [{"input": "4\n1 -2 3 -2", "expected_output": "3"}, {"input": "3\n5 -3 5", "expected_output": "10"}],
      "hidden_testcases": [{"input": "3\n-3 -2 -3", "expected_output": "-2"}]
    }'::jsonb
  )
ON CONFLICT (day_id, sequence_order) DO UPDATE
SET task_type = EXCLUDED.task_type,
    title = EXCLUDED.title,
    estimated_minutes = EXCLUDED.estimated_minutes,
    payload = EXCLUDED.payload;

-- 5. DAY TASKS: DSA IN C++ (DAY 2: TWO POINTERS TECHNIQUE)

-- DSA Day 2: 2-Hour Track (1 Theory + 1 Problem)
INSERT INTO public.day_tasks (id, day_id, sequence_order, task_type, title, estimated_minutes, payload)
VALUES
  (
    'a0000000-0000-0000-0000-000000002121',
    'd0000000-0000-0000-0000-000000002102',
    1,
    'theory_video',
    'Invariants and Convergence of Two Pointers',
    45,
    '{
      "markdown_notes": "### The Two-Pointer Invariant\nTwo-pointer algorithms transform O(N^2) search spaces into O(N) linear scans by proving that candidates outside the pointer window violate monotonic ordering.\n\n### Convergence Guarantee\nEach step advances at least one pointer monotonically toward termination, guaranteeing strictly N iterations without auxiliary allocations.",
      "video_url": "https://www.youtube-nocookie.com/embed/cQ1Oz4ckcMM",
      "video_title": "Two-Pointer Invariants & Search Space Pruning",
      "timestamps": [
        {"time": "00:00", "label": "Monotonicity and Sorting Prerequisites"},
        {"time": "05:20", "label": "Search Space Pruning Invariants"}
      ]
    }'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000002122',
    'd0000000-0000-0000-0000-000000002102',
    2,
    'dsa_problem',
    'Two Sum II - Input Array Is Sorted',
    75,
    '{
      "description": "Given a 1-indexed array of integers `numbers` that is already sorted in non-decreasing order, find two numbers such that they add up to a specific `target` number. Return their 1-based indices.\n\n### Constraints\n- 2 <= numbers.length <= 3 * 10^4\n- -1000 <= numbers[i] <= 1000\n- Exactly one solution exists",
      "starter_code": "#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nvoid twoSum(const vector<int>& numbers, int target) {\n    int left = 0, right = numbers.size() - 1;\n    while (left < right) {\n        int sum = numbers[left] + numbers[right];\n        if (sum == target) {\n            cout << (left + 1) << \" \" << (right + 1) << endl;\n            return;\n        } else if (sum < target) {\n            ++left;\n        } else {\n            --right;\n        }\n    }\n}\n\nint main() {\n    int n, target;\n    if (!(cin >> n >> target)) return 0;\n    vector<int> numbers(n);\n    for (int i = 0; i < n; ++i) cin >> numbers[i];\n    twoSum(numbers, target);\n    return 0;\n}",
      "language": "cpp",
      "sample_testcases": [
        {"input": "4 9\n2 7 11 15", "expected_output": "1 2"},
        {"input": "3 6\n2 3 4", "expected_output": "1 3"}
      ],
      "hidden_testcases": [
        {"input": "2 -1\n-1 0", "expected_output": "1 2"}
      ]
    }'::jsonb
  )
ON CONFLICT (day_id, sequence_order) DO UPDATE
SET task_type = EXCLUDED.task_type,
    title = EXCLUDED.title,
    estimated_minutes = EXCLUDED.estimated_minutes,
    payload = EXCLUDED.payload;

-- DSA Day 2: 3-Hour Track (1 Theory + 2 Problems)
INSERT INTO public.day_tasks (id, day_id, sequence_order, task_type, title, estimated_minutes, payload)
VALUES
  (
    'a0000000-0000-0000-0000-000000003121',
    'd0000000-0000-0000-0000-000000003102',
    1,
    'theory_video',
    'Invariants and Convergence of Two Pointers',
    45,
    '{
      "markdown_notes": "Two-pointer algorithms transform O(N^2) searches into O(N) linear scans through search space pruning.",
      "video_url": "https://www.youtube-nocookie.com/embed/cQ1Oz4ckcMM",
      "video_title": "Two-Pointer Invariants & Search Space Pruning"
    }'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000003122',
    'd0000000-0000-0000-0000-000000003102',
    2,
    'dsa_problem',
    'Two Sum II - Input Array Is Sorted',
    65,
    '{
      "description": "Find two numbers in sorted array adding to target. Output 1-based indices.",
      "starter_code": "#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nvoid twoSum(const vector<int>& numbers, int target) {\n    int l = 0, r = numbers.size() - 1;\n    while (l < r) {\n        int s = numbers[l] + numbers[r];\n        if (s == target) { cout << (l+1) << \" \" << (r+1) << endl; return; }\n        if (s < target) ++l; else --r;\n    }\n}\n\nint main() {\n    int n, target;\n    if (!(cin >> n >> target)) return 0;\n    vector<int> nums(n);\n    for (int i = 0; i < n; ++i) cin >> nums[i];\n    twoSum(nums, target);\n    return 0;\n}",
      "language": "cpp",
      "sample_testcases": [{"input": "4 9\n2 7 11 15", "expected_output": "1 2"}],
      "hidden_testcases": [{"input": "2 -1\n-1 0", "expected_output": "1 2"}]
    }'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000003123',
    'd0000000-0000-0000-0000-000000003102',
    3,
    'dsa_problem',
    'Container With Most Water',
    70,
    '{
      "description": "Given `n` non-negative integers `height` where each represents a point at coordinate `(i, height[i])`. Find two lines that together with the x-axis form a container, such that the container contains the most water.",
      "starter_code": "#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nint maxArea(const vector<int>& height) {\n    int l = 0, r = height.size() - 1, ans = 0;\n    while (l < r) {\n        ans = max(ans, (r - l) * min(height[l], height[r]));\n        if (height[l] < height[r]) ++l; else --r;\n    }\n    return ans;\n}\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> h(n);\n    for (int i = 0; i < n; ++i) cin >> h[i];\n    cout << maxArea(h) << endl;\n    return 0;\n}",
      "language": "cpp",
      "sample_testcases": [{"input": "9\n1 8 6 2 5 4 8 3 7", "expected_output": "49"}],
      "hidden_testcases": [{"input": "2\n1 1", "expected_output": "1"}]
    }'::jsonb
  )
ON CONFLICT (day_id, sequence_order) DO UPDATE
SET task_type = EXCLUDED.task_type,
    title = EXCLUDED.title,
    estimated_minutes = EXCLUDED.estimated_minutes,
    payload = EXCLUDED.payload;

-- DSA Day 2: 4-Hour Track (1 Theory + 2 Problems + 1 Bonus Problem)
INSERT INTO public.day_tasks (id, day_id, sequence_order, task_type, title, estimated_minutes, payload)
VALUES
  (
    'a0000000-0000-0000-0000-000000004121',
    'd0000000-0000-0000-0000-000000004102',
    1,
    'theory_video',
    'Invariants and Convergence of Two Pointers',
    45,
    '{
      "markdown_notes": "Two-pointer algorithms transform O(N^2) searches into O(N) linear scans.",
      "video_url": "https://www.youtube-nocookie.com/embed/cQ1Oz4ckcMM",
      "video_title": "Two-Pointer Invariants & Search Space Pruning"
    }'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000004122',
    'd0000000-0000-0000-0000-000000004102',
    2,
    'dsa_problem',
    'Two Sum II - Input Array Is Sorted',
    60,
    '{
      "description": "Find two numbers in sorted array adding to target. Output 1-based indices.",
      "starter_code": "#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nvoid twoSum(const vector<int>& numbers, int target) {\n    int l = 0, r = numbers.size() - 1;\n    while (l < r) {\n        int s = numbers[l] + numbers[r];\n        if (s == target) { cout << (l+1) << \" \" << (r+1) << endl; return; }\n        if (s < target) ++l; else --r;\n    }\n}\n\nint main() {\n    int n, target;\n    if (!(cin >> n >> target)) return 0;\n    vector<int> nums(n);\n    for (int i = 0; i < n; ++i) cin >> nums[i];\n    twoSum(nums, target);\n    return 0;\n}",
      "language": "cpp",
      "sample_testcases": [{"input": "4 9\n2 7 11 15", "expected_output": "1 2"}],
      "hidden_testcases": [{"input": "2 -1\n-1 0", "expected_output": "1 2"}]
    }'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000004123',
    'd0000000-0000-0000-0000-000000004102',
    3,
    'dsa_problem',
    'Container With Most Water',
    65,
    '{
      "description": "Find two lines that form a container holding the maximum water volume.",
      "starter_code": "#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nint maxArea(const vector<int>& height) {\n    int l = 0, r = height.size() - 1, ans = 0;\n    while (l < r) {\n        ans = max(ans, (r - l) * min(height[l], height[r]));\n        if (height[l] < height[r]) ++l; else --r;\n    }\n    return ans;\n}\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> h(n);\n    for (int i = 0; i < n; ++i) cin >> h[i];\n    cout << maxArea(h) << endl;\n    return 0;\n}",
      "language": "cpp",
      "sample_testcases": [{"input": "9\n1 8 6 2 5 4 8 3 7", "expected_output": "49"}],
      "hidden_testcases": [{"input": "2\n1 1", "expected_output": "1"}]
    }'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000004124',
    'd0000000-0000-0000-0000-000000004102',
    4,
    'dsa_problem',
    'Bonus: Trapping Rain Water',
    70,
    '{
      "description": "Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
      "starter_code": "#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nint trap(const vector<int>& height) {\n    int l = 0, r = height.size() - 1, l_max = 0, r_max = 0, ans = 0;\n    while (l < r) {\n        if (height[l] < height[r]) {\n            if (height[l] >= l_max) l_max = height[l];\n            else ans += l_max - height[l];\n            ++l;\n        } else {\n            if (height[r] >= r_max) r_max = height[r];\n            else ans += r_max - height[r];\n            --r;\n        }\n    }\n    return ans;\n}\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> h(n);\n    for (int i = 0; i < n; ++i) cin >> h[i];\n    cout << trap(h) << endl;\n    return 0;\n}",
      "language": "cpp",
      "sample_testcases": [{"input": "12\n0 1 0 2 1 0 1 3 2 1 2 1", "expected_output": "6"}],
      "hidden_testcases": [{"input": "6\n4 2 0 3 2 5", "expected_output": "9"}]
    }'::jsonb
  )
ON CONFLICT (day_id, sequence_order) DO UPDATE
SET task_type = EXCLUDED.task_type,
    title = EXCLUDED.title,
    estimated_minutes = EXCLUDED.estimated_minutes,
    payload = EXCLUDED.payload;

-- 6. DAY TASKS: MASTERING SQL (DAY 1: FILTERING & GROUPING)

-- SQL Day 1: 2-Hour Track (1 Theory + 1 Problem)
INSERT INTO public.day_tasks (id, day_id, sequence_order, task_type, title, estimated_minutes, payload)
VALUES
  (
    'a0000000-0000-0000-0000-000000002211',
    'd0000000-0000-0000-0000-000000002201',
    1,
    'theory_video',
    'Query Logical Processing Pipeline & Grouping Mechanics',
    45,
    '{
      "markdown_notes": "### The Relational Execution Pipeline\nSQL is declarative, but evaluated strictly in order:\n1. `FROM` & `JOIN` (Form the Cartesian space)\n2. `WHERE` (Filter individual row tuples)\n3. `GROUP BY` (Partition tuples into buckets)\n4. `HAVING` (Filter aggregated buckets)\n5. `SELECT` (Project expressions & window functions)\n6. `ORDER BY` & `LIMIT` (Sort and slice result set)\n\nUnderstanding this order eliminates alias scope errors and inefficient aggregation scans.",
      "video_url": "https://www.youtube-nocookie.com/embed/BHwzD8E977Y",
      "video_title": "SQL Logical Query Processing",
      "timestamps": [
        {"time": "00:00", "label": "Declarative Syntax vs. Execution Phases"},
        {"time": "05:10", "label": "WHERE Filter vs. HAVING Bucket Filter"}
      ]
    }'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000002212',
    'd0000000-0000-0000-0000-000000002201',
    2,
    'sql_problem',
    'Department Revenue and High-Ticket Volume',
    75,
    '{
      "description": "Calculate total revenue and the count of high-ticket orders (amount >= 500) per department for completed orders. Order results by total_revenue descending.",
      "schema_sql": "CREATE TABLE departments (id INT PRIMARY KEY, name TEXT);\nCREATE TABLE orders (id INT PRIMARY KEY, dept_id INT, amount DECIMAL(10,2), status TEXT);\nINSERT INTO departments VALUES (1, ''Engineering''), (2, ''Sales''), (3, ''Marketing'');\nINSERT INTO orders VALUES (101, 1, 450.00, ''completed''), (102, 1, 1200.00, ''completed''), (103, 2, 800.00, ''completed''), (104, 2, 150.00, ''cancelled''), (105, 3, 2200.00, ''completed''), (106, 1, 95.00, ''completed'');",
      "starter_query": "-- Write your SQL query here\nSELECT\n  d.name AS department,\n  SUM(o.amount) AS total_revenue,\n  COUNT(...) AS high_ticket_count\nFROM departments d\nJOIN orders o ON d.id = o.dept_id\nWHERE o.status = ''completed''\nGROUP BY d.id, d.name\nORDER BY total_revenue DESC;",
      "expected_solution_query": "SELECT d.name AS department, CAST(SUM(o.amount) AS FLOAT) AS total_revenue, COUNT(CASE WHEN o.amount >= 500 THEN 1 END) AS high_ticket_count FROM departments d JOIN orders o ON d.id = o.dept_id WHERE o.status = ''completed'' GROUP BY d.id, d.name ORDER BY total_revenue DESC;",
      "expected_rows": [
        {"department": "Marketing", "total_revenue": 2200, "high_ticket_count": 1},
        {"department": "Engineering", "total_revenue": 1745, "high_ticket_count": 1},
        {"department": "Sales", "total_revenue": 800, "high_ticket_count": 1}
      ]
    }'::jsonb
  )
ON CONFLICT (day_id, sequence_order) DO UPDATE
SET task_type = EXCLUDED.task_type,
    title = EXCLUDED.title,
    estimated_minutes = EXCLUDED.estimated_minutes,
    payload = EXCLUDED.payload;

-- SQL Day 1: 3-Hour Track (1 Theory + 2 Problems)
INSERT INTO public.day_tasks (id, day_id, sequence_order, task_type, title, estimated_minutes, payload)
VALUES
  (
    'a0000000-0000-0000-0000-000000003211',
    'd0000000-0000-0000-0000-000000003201',
    1,
    'theory_video',
    'Query Logical Processing Pipeline & Grouping Mechanics',
    45,
    '{
      "markdown_notes": "SQL execution pipeline: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY.",
      "video_url": "https://www.youtube-nocookie.com/embed/BHwzD8E977Y",
      "video_title": "SQL Logical Query Processing"
    }'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000003212',
    'd0000000-0000-0000-0000-000000003201',
    2,
    'sql_problem',
    'Department Revenue and High-Ticket Volume',
    65,
    '{
      "description": "Calculate total revenue and count of orders >= 500 per department for completed orders.",
      "schema_sql": "CREATE TABLE departments (id INT PRIMARY KEY, name TEXT); CREATE TABLE orders (id INT PRIMARY KEY, dept_id INT, amount DECIMAL(10,2), status TEXT); INSERT INTO departments VALUES (1, ''Engineering''), (2, ''Sales''), (3, ''Marketing''); INSERT INTO orders VALUES (101, 1, 450.00, ''completed''), (102, 1, 1200.00, ''completed''), (103, 2, 800.00, ''completed''), (104, 3, 2200.00, ''completed'');",
      "starter_query": "SELECT d.name AS department, SUM(o.amount) AS total_revenue FROM departments d JOIN orders o ON d.id = o.dept_id GROUP BY d.id, d.name ORDER BY total_revenue DESC;",
      "expected_solution_query": "SELECT d.name AS department, CAST(SUM(o.amount) AS FLOAT) AS total_revenue, COUNT(CASE WHEN o.amount >= 500 THEN 1 END) AS high_ticket_count FROM departments d JOIN orders o ON d.id = o.dept_id WHERE o.status = ''completed'' GROUP BY d.id, d.name ORDER BY total_revenue DESC;",
      "expected_rows": [
        {"department": "Marketing", "total_revenue": 2200, "high_ticket_count": 1},
        {"department": "Engineering", "total_revenue": 1650, "high_ticket_count": 1},
        {"department": "Sales", "total_revenue": 800, "high_ticket_count": 1}
      ]
    }'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000003213',
    'd0000000-0000-0000-0000-000000003201',
    3,
    'sql_problem',
    'Customer Churn Cohort Filtering',
    70,
    '{
      "description": "Identify customers who placed their first order in 2023 and have spent more than 500 in total.",
      "schema_sql": "CREATE TABLE customers (id INT PRIMARY KEY, name TEXT, signup_year INT); CREATE TABLE customer_orders (id INT PRIMARY KEY, customer_id INT, amount DECIMAL(10,2)); INSERT INTO customers VALUES (1, ''Alice'', 2023), (2, ''Bob'', 2022), (3, ''Charlie'', 2023); INSERT INTO customer_orders VALUES (1, 1, 600.00), (2, 2, 1000.00), (3, 3, 250.00);",
      "starter_query": "SELECT c.name, SUM(o.amount) as total_spent FROM customers c JOIN customer_orders o ON c.id = o.customer_id GROUP BY c.id, c.name;",
      "expected_solution_query": "SELECT c.name, CAST(SUM(o.amount) AS FLOAT) AS total_spent FROM customers c JOIN customer_orders o ON c.id = o.customer_id WHERE c.signup_year = 2023 GROUP BY c.id, c.name HAVING SUM(o.amount) > 500 ORDER BY total_spent DESC;",
      "expected_rows": [{"name": "Alice", "total_spent": 600}]
    }'::jsonb
  )
ON CONFLICT (day_id, sequence_order) DO UPDATE
SET task_type = EXCLUDED.task_type,
    title = EXCLUDED.title,
    estimated_minutes = EXCLUDED.estimated_minutes,
    payload = EXCLUDED.payload;

-- SQL Day 1: 4-Hour Track (1 Theory + 2 Problems + 1 Bonus Problem)
INSERT INTO public.day_tasks (id, day_id, sequence_order, task_type, title, estimated_minutes, payload)
VALUES
  (
    'a0000000-0000-0000-0000-000000004211',
    'd0000000-0000-0000-0000-000000004201',
    1,
    'theory_video',
    'Query Logical Processing Pipeline & Grouping Mechanics',
    45,
    '{
      "markdown_notes": "SQL execution pipeline: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY.",
      "video_url": "https://www.youtube-nocookie.com/embed/BHwzD8E977Y",
      "video_title": "SQL Logical Query Processing"
    }'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000004212',
    'd0000000-0000-0000-0000-000000004201',
    2,
    'sql_problem',
    'Department Revenue and High-Ticket Volume',
    60,
    '{
      "description": "Calculate total revenue and count of orders >= 500 per department for completed orders.",
      "schema_sql": "CREATE TABLE departments (id INT PRIMARY KEY, name TEXT); CREATE TABLE orders (id INT PRIMARY KEY, dept_id INT, amount DECIMAL(10,2), status TEXT); INSERT INTO departments VALUES (1, ''Engineering''), (2, ''Sales''), (3, ''Marketing''); INSERT INTO orders VALUES (101, 1, 450.00, ''completed''), (102, 1, 1200.00, ''completed''), (103, 2, 800.00, ''completed''), (104, 3, 2200.00, ''completed'');",
      "starter_query": "SELECT d.name, SUM(o.amount) FROM departments d JOIN orders o ON d.id = o.dept_id GROUP BY d.id, d.name;",
      "expected_solution_query": "SELECT d.name AS department, CAST(SUM(o.amount) AS FLOAT) AS total_revenue, COUNT(CASE WHEN o.amount >= 500 THEN 1 END) AS high_ticket_count FROM departments d JOIN orders o ON d.id = o.dept_id WHERE o.status = ''completed'' GROUP BY d.id, d.name ORDER BY total_revenue DESC;",
      "expected_rows": [
        {"department": "Marketing", "total_revenue": 2200, "high_ticket_count": 1},
        {"department": "Engineering", "total_revenue": 1650, "high_ticket_count": 1},
        {"department": "Sales", "total_revenue": 800, "high_ticket_count": 1}
      ]
    }'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000004213',
    'd0000000-0000-0000-0000-000000004201',
    3,
    'sql_problem',
    'Customer Churn Cohort Filtering',
    65,
    '{
      "description": "Identify customers who placed their first order in 2023 and have spent more than 500 in total.",
      "schema_sql": "CREATE TABLE customers (id INT PRIMARY KEY, name TEXT, signup_year INT); CREATE TABLE customer_orders (id INT PRIMARY KEY, customer_id INT, amount DECIMAL(10,2)); INSERT INTO customers VALUES (1, ''Alice'', 2023), (2, ''Bob'', 2022), (3, ''Charlie'', 2023); INSERT INTO customer_orders VALUES (1, 1, 600.00), (2, 2, 1000.00), (3, 3, 250.00);",
      "starter_query": "SELECT c.name FROM customers c;",
      "expected_solution_query": "SELECT c.name, CAST(SUM(o.amount) AS FLOAT) AS total_spent FROM customers c JOIN customer_orders o ON c.id = o.customer_id WHERE c.signup_year = 2023 GROUP BY c.id, c.name HAVING SUM(o.amount) > 500 ORDER BY total_spent DESC;",
      "expected_rows": [{"name": "Alice", "total_spent": 600}]
    }'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000004214',
    'd0000000-0000-0000-0000-000000004201',
    4,
    'sql_problem',
    'Bonus: Conditional Aggregation and Null-Safe Ratios',
    70,
    '{
      "description": "Compute the success conversion rate (completed / total orders) as a percentage rounded to 2 decimal places.",
      "schema_sql": "CREATE TABLE lead_events (id INT PRIMARY KEY, campaign TEXT, status TEXT); INSERT INTO lead_events VALUES (1, ''Alpha'', ''converted''), (2, ''Alpha'', ''dropped''), (3, ''Alpha'', ''converted''), (4, ''Beta'', ''dropped''), (5, ''Beta'', ''converted'');",
      "starter_query": "SELECT campaign, COUNT(*) FROM lead_events GROUP BY campaign;",
      "expected_solution_query": "SELECT campaign, CAST(ROUND(100.0 * COUNT(CASE WHEN status = ''converted'' THEN 1 END) / COUNT(*), 2) AS FLOAT) AS conversion_rate FROM lead_events GROUP BY campaign ORDER BY conversion_rate DESC;",
      "expected_rows": [
        {"campaign": "Alpha", "conversion_rate": 66.67},
        {"campaign": "Beta", "conversion_rate": 50}
      ]
    }'::jsonb
  )
ON CONFLICT (day_id, sequence_order) DO UPDATE
SET task_type = EXCLUDED.task_type,
    title = EXCLUDED.title,
    estimated_minutes = EXCLUDED.estimated_minutes,
    payload = EXCLUDED.payload;

-- 7. DAY TASKS: MASTERING SQL (DAY 2: WINDOW FUNCTIONS)

-- SQL Day 2: 2-Hour Track (1 Theory + 1 Problem)
INSERT INTO public.day_tasks (id, day_id, sequence_order, task_type, title, estimated_minutes, payload)
VALUES
  (
    'a0000000-0000-0000-0000-000000002221',
    'd0000000-0000-0000-0000-000000002202',
    1,
    'theory_video',
    'Window Frames, Partitioning, and Ranking Semantics',
    45,
    '{
      "markdown_notes": "### The Power of Window Functions\nUnlike standard `GROUP BY` which collapses rows, window functions compute aggregates across defined partitions while preserving individual row identities.\n\n### Frame Specification\n`ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` defines a running cumulative frame without re-scanning prior tuples.",
      "video_url": "https://www.youtube-nocookie.com/embed/Ww71knvhQ-s",
      "video_title": "Window Functions, PARTITION BY, and Framing",
      "timestamps": [
        {"time": "00:00", "label": "Row Preservation vs Group Collapsing"},
        {"time": "06:40", "label": "Running Totals with Window Framing"}
      ]
    }'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000002222',
    'd0000000-0000-0000-0000-000000002202',
    2,
    'sql_problem',
    'Running Total and Moving Cumulative Revenue',
    75,
    '{
      "description": "Calculate running cumulative revenue ordered by transaction date for each merchant.",
      "schema_sql": "CREATE TABLE transactions (id INT PRIMARY KEY, merchant TEXT, tx_date DATE, amount DECIMAL(10,2)); INSERT INTO transactions VALUES (1, ''Stripe'', ''2024-01-01'', 100.00), (2, ''Stripe'', ''2024-01-02'', 150.00), (3, ''Stripe'', ''2024-01-03'', 200.00), (4, ''PayPal'', ''2024-01-01'', 50.00), (5, ''PayPal'', ''2024-01-02'', 80.00);",
      "starter_query": "-- Compute cumulative running total per merchant\nSELECT id, merchant, tx_date, amount FROM transactions;",
      "expected_solution_query": "SELECT id, merchant, tx_date, CAST(amount AS FLOAT) AS amount, CAST(SUM(amount) OVER (PARTITION BY merchant ORDER BY tx_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS FLOAT) AS running_total FROM transactions ORDER BY merchant, tx_date;",
      "expected_rows": [
        {"id": 4, "merchant": "PayPal", "tx_date": "2024-01-01", "amount": 50, "running_total": 50},
        {"id": 5, "merchant": "PayPal", "tx_date": "2024-01-02", "amount": 80, "running_total": 130},
        {"id": 1, "merchant": "Stripe", "tx_date": "2024-01-01", "amount": 100, "running_total": 100},
        {"id": 2, "merchant": "Stripe", "tx_date": "2024-01-02", "amount": 150, "running_total": 250},
        {"id": 3, "merchant": "Stripe", "tx_date": "2024-01-03", "amount": 200, "running_total": 450}
      ]
    }'::jsonb
  )
ON CONFLICT (day_id, sequence_order) DO UPDATE
SET task_type = EXCLUDED.task_type,
    title = EXCLUDED.title,
    estimated_minutes = EXCLUDED.estimated_minutes,
    payload = EXCLUDED.payload;

-- SQL Day 2: 3-Hour Track (1 Theory + 2 Problems)
INSERT INTO public.day_tasks (id, day_id, sequence_order, task_type, title, estimated_minutes, payload)
VALUES
  (
    'a0000000-0000-0000-0000-000000003221',
    'd0000000-0000-0000-0000-000000003202',
    1,
    'theory_video',
    'Window Frames, Partitioning, and Ranking Semantics',
    45,
    '{
      "markdown_notes": "Window functions compute across partitions while preserving row identity.",
      "video_url": "https://www.youtube-nocookie.com/embed/Ww71knvhQ-s",
      "video_title": "Window Functions & Ranking Semantics"
    }'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000003222',
    'd0000000-0000-0000-0000-000000003202',
    2,
    'sql_problem',
    'Running Total and Moving Cumulative Revenue',
    65,
    '{
      "description": "Calculate running cumulative revenue ordered by transaction date for each merchant.",
      "schema_sql": "CREATE TABLE transactions (id INT PRIMARY KEY, merchant TEXT, tx_date DATE, amount DECIMAL(10,2)); INSERT INTO transactions VALUES (1, ''Stripe'', ''2024-01-01'', 100.00), (2, ''Stripe'', ''2024-01-02'', 150.00), (4, ''PayPal'', ''2024-01-01'', 50.00);",
      "starter_query": "SELECT id, merchant, amount FROM transactions;",
      "expected_solution_query": "SELECT id, merchant, tx_date, CAST(amount AS FLOAT) AS amount, CAST(SUM(amount) OVER (PARTITION BY merchant ORDER BY tx_date) AS FLOAT) AS running_total FROM transactions ORDER BY merchant, tx_date;",
      "expected_rows": [
        {"id": 4, "merchant": "PayPal", "tx_date": "2024-01-01", "amount": 50, "running_total": 50},
        {"id": 1, "merchant": "Stripe", "tx_date": "2024-01-01", "amount": 100, "running_total": 100},
        {"id": 2, "merchant": "Stripe", "tx_date": "2024-01-02", "amount": 150, "running_total": 250}
      ]
    }'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000003223',
    'd0000000-0000-0000-0000-000000003202',
    3,
    'sql_problem',
    'Top 2 Earners Per Department with DENSE_RANK',
    70,
    '{
      "description": "Find the top 2 highest-paid employees in each department. In case of ties, use dense ranking.",
      "schema_sql": "CREATE TABLE employees (id INT PRIMARY KEY, name TEXT, department TEXT, salary INT); INSERT INTO employees VALUES (1, ''Alice'', ''Eng'', 120000), (2, ''Bob'', ''Eng'', 115000), (3, ''Charlie'', ''Eng'', 100000), (4, ''David'', ''HR'', 90000), (5, ''Eva'', ''HR'', 95000);",
      "starter_query": "SELECT name, department, salary FROM employees;",
      "expected_solution_query": "WITH ranked AS (SELECT name, department, salary, DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rnk FROM employees) SELECT name, department, salary, rnk FROM ranked WHERE rnk <= 2 ORDER BY department, rnk, name;",
      "expected_rows": [
        {"name": "Alice", "department": "Eng", "salary": 120000, "rnk": 1},
        {"name": "Bob", "department": "Eng", "salary": 115000, "rnk": 2},
        {"name": "Eva", "department": "HR", "salary": 95000, "rnk": 1},
        {"name": "David", "department": "HR", "salary": 90000, "rnk": 2}
      ]
    }'::jsonb
  )
ON CONFLICT (day_id, sequence_order) DO UPDATE
SET task_type = EXCLUDED.task_type,
    title = EXCLUDED.title,
    estimated_minutes = EXCLUDED.estimated_minutes,
    payload = EXCLUDED.payload;

-- SQL Day 2: 4-Hour Track (1 Theory + 2 Problems + 1 Bonus Problem)
INSERT INTO public.day_tasks (id, day_id, sequence_order, task_type, title, estimated_minutes, payload)
VALUES
  (
    'a0000000-0000-0000-0000-000000004221',
    'd0000000-0000-0000-0000-000000004202',
    1,
    'theory_video',
    'Window Frames, Partitioning, and Ranking Semantics',
    45,
    '{
      "markdown_notes": "Window functions compute across partitions while preserving row identity.",
      "video_url": "https://www.youtube-nocookie.com/embed/Ww71knvhQ-s",
      "video_title": "Window Functions & Ranking Semantics"
    }'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000004222',
    'd0000000-0000-0000-0000-000000004202',
    2,
    'sql_problem',
    'Running Total and Moving Cumulative Revenue',
    60,
    '{
      "description": "Calculate running cumulative revenue ordered by transaction date for each merchant.",
      "schema_sql": "CREATE TABLE transactions (id INT PRIMARY KEY, merchant TEXT, tx_date DATE, amount DECIMAL(10,2)); INSERT INTO transactions VALUES (1, ''Stripe'', ''2024-01-01'', 100.00), (2, ''Stripe'', ''2024-01-02'', 150.00), (4, ''PayPal'', ''2024-01-01'', 50.00);",
      "starter_query": "SELECT id, merchant, amount FROM transactions;",
      "expected_solution_query": "SELECT id, merchant, tx_date, CAST(amount AS FLOAT) AS amount, CAST(SUM(amount) OVER (PARTITION BY merchant ORDER BY tx_date) AS FLOAT) AS running_total FROM transactions ORDER BY merchant, tx_date;",
      "expected_rows": [
        {"id": 4, "merchant": "PayPal", "tx_date": "2024-01-01", "amount": 50, "running_total": 50},
        {"id": 1, "merchant": "Stripe", "tx_date": "2024-01-01", "amount": 100, "running_total": 100},
        {"id": 2, "merchant": "Stripe", "tx_date": "2024-01-02", "amount": 150, "running_total": 250}
      ]
    }'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000004223',
    'd0000000-0000-0000-0000-000000004202',
    3,
    'sql_problem',
    'Top 2 Earners Per Department with DENSE_RANK',
    65,
    '{
      "description": "Find the top 2 highest-paid employees in each department using dense ranking.",
      "schema_sql": "CREATE TABLE employees (id INT PRIMARY KEY, name TEXT, department TEXT, salary INT); INSERT INTO employees VALUES (1, ''Alice'', ''Eng'', 120000), (2, ''Bob'', ''Eng'', 115000), (3, ''Charlie'', ''Eng'', 100000), (4, ''David'', ''HR'', 90000), (5, ''Eva'', ''HR'', 95000);",
      "starter_query": "SELECT name, department, salary FROM employees;",
      "expected_solution_query": "WITH ranked AS (SELECT name, department, salary, DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rnk FROM employees) SELECT name, department, salary, rnk FROM ranked WHERE rnk <= 2 ORDER BY department, rnk, name;",
      "expected_rows": [
        {"name": "Alice", "department": "Eng", "salary": 120000, "rnk": 1},
        {"name": "Bob", "department": "Eng", "salary": 115000, "rnk": 2},
        {"name": "Eva", "department": "HR", "salary": 95000, "rnk": 1},
        {"name": "David", "department": "HR", "salary": 90000, "rnk": 2}
      ]
    }'::jsonb
  ),
  (
    'a0000000-0000-0000-0000-000000004224',
    'd0000000-0000-0000-0000-000000004202',
    4,
    'sql_problem',
    'Bonus: Session Gap Detection with LAG and LEAD',
    70,
    '{
      "description": "Detect the gap in days between consecutive user actions using the LAG() window function.",
      "schema_sql": "CREATE TABLE user_activity (id INT PRIMARY KEY, user_id INT, action_date DATE); INSERT INTO user_activity VALUES (1, 101, ''2024-01-01''), (2, 101, ''2024-01-03''), (3, 101, ''2024-01-10''), (4, 102, ''2024-01-02''), (5, 102, ''2024-01-05'');",
      "starter_query": "SELECT id, user_id, action_date FROM user_activity;",
      "expected_solution_query": "SELECT id, user_id, action_date, CAST(JULIANDAY(action_date) - JULIANDAY(LAG(action_date) OVER (PARTITION BY user_id ORDER BY action_date)) AS INT) as days_since_prev FROM user_activity ORDER BY user_id, action_date;",
      "expected_rows": [
        {"id": 1, "user_id": 101, "action_date": "2024-01-01", "days_since_prev": null},
        {"id": 2, "user_id": 101, "action_date": "2024-01-03", "days_since_prev": 2},
        {"id": 3, "user_id": 101, "action_date": "2024-01-10", "days_since_prev": 7},
        {"id": 4, "user_id": 102, "action_date": "2024-01-02", "days_since_prev": null},
        {"id": 5, "user_id": 102, "action_date": "2024-01-05", "days_since_prev": 3}
      ]
    }'::jsonb
  )
ON CONFLICT (day_id, sequence_order) DO UPDATE
SET task_type = EXCLUDED.task_type,
    title = EXCLUDED.title,
    estimated_minutes = EXCLUDED.estimated_minutes,
    payload = EXCLUDED.payload;
