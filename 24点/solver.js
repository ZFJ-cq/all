window.G24 = window.G24 || {};

G24.solve24 = function (nums) {
  var ops = ['+', '-', '*', '/'];
  var sym = G24.OP_DISPLAY;
  var result = null;

  function helper(numbers, expressions) {
    if (result) return;
    if (numbers.length === 1) {
      if (Math.abs(numbers[0] - 24) < G24.EPS) result = expressions[0];
      return;
    }
    for (var i = 0; i < numbers.length; i++) {
      for (var j = 0; j < numbers.length; j++) {
        if (i === j) continue;
        var remaining = [], remainingExpr = [];
        for (var k = 0; k < numbers.length; k++) {
          if (k !== i && k !== j) {
            remaining.push(numbers[k]);
            remainingExpr.push(expressions[k]);
          }
        }
        for (var oi = 0; oi < ops.length; oi++) {
          var op = ops[oi];
          var val;
          if (op === '+') val = numbers[i] + numbers[j];
          else if (op === '-') val = numbers[i] - numbers[j];
          else if (op === '*') val = numbers[i] * numbers[j];
          else {
            if (Math.abs(numbers[j]) < G24.EPS) continue;
            val = numbers[i] / numbers[j];
          }
          remaining.push(val);
          remainingExpr.push('(' + expressions[i] + sym[op] + expressions[j] + ')');
          helper(remaining, remainingExpr);
          remaining.pop();
          remainingExpr.pop();
          if (result) return;
        }
      }
    }
  }

  helper(nums, nums.map(String));
  return result;
};

G24.gen24Q = function () {
  var nums, sol, att = 0;
  do {
    nums = [G24.randInt(1, 13), G24.randInt(1, 13), G24.randInt(1, 13), G24.randInt(1, 13)];
    sol = G24.solve24(nums);
    att++;
  } while (!sol && att < 200);

  if (!sol) {
    var pool = [
      [1, 2, 3, 4], [1, 3, 4, 6], [2, 3, 4, 6], [1, 2, 6, 6],
      [3, 3, 8, 8], [1, 4, 5, 6], [2, 4, 6, 8], [4, 5, 6, 7]
    ];
    nums = pool[G24.randInt(0, pool.length - 1)].slice();
    sol = G24.solve24(nums);
  }

  return { nums: nums, solution: sol || '' };
};

G24.genMathQ = function (diff, range) {
  var max = Math.max(10, Math.min(range || 20, 100));

  if (diff === 'easy') {
    var op = Math.random() > 0.5 ? '+' : '-';
    var a, b, ans;
    if (op === '+') {
      a = G24.randInt(1, max);
      b = G24.randInt(1, max);
      ans = a + b;
    } else {
      a = G24.randInt(1, max);
      b = G24.randInt(1, a);
      ans = a - b;
    }
    return { n1: a, n2: b, op: op, answer: ans };
  } else {
    var t = G24.randInt(0, 3);
    var a2, b2, op2, ans2;
    if (t === 0) {
      a2 = G24.randInt(1, max);
      b2 = G24.randInt(1, max);
      op2 = '+';
      ans2 = a2 + b2;
    } else if (t === 1) {
      a2 = G24.randInt(1, max);
      b2 = G24.randInt(1, a2);
      op2 = '-';
      ans2 = a2 - b2;
    } else if (t === 2) {
      a2 = G24.randInt(1, 12);
      b2 = G24.randInt(1, 12);
      op2 = '*';
      ans2 = a2 * b2;
    } else {
      b2 = G24.randInt(1, 12);
      ans2 = G24.randInt(1, 12);
      a2 = b2 * ans2;
      op2 = '/';
    }
    return { n1: a2, n2: b2, op: op2, answer: ans2 };
  }
};

G24.genRaceQ = function (diff) {
  if (diff === 'hard') {
    var res = G24.gen24Q();
    return {
      n1: res.nums[0], n2: res.nums[1], op: '24', answer: 24,
      nums: res.nums, solution: res.solution, is24: true
    };
  } else {
    var difficulties = diff === 'mix' ? ['easy', 'medium'] : [diff];
    var d = difficulties[Math.floor(Math.random() * difficulties.length)];
    var r = Math.floor(Math.random() * 3) * 30 + 20;
    return G24.genMathQ(d, r);
  }
};