/* QR code encoder — byte mode, versions 1-40, all four error correction levels.
   Self-contained, no dependencies. Exposes globalThis.QR.encode(text, opts) -> {size, modules, version, ecl}
   Modules is a 2D array of booleans, [y][x], true = dark. */
(function () {
  'use strict';

  // Error correction levels: ord = table index, fmt = the 2 bits written into the format info.
  var ECL = {
    L: { ord: 0, fmt: 1 },
    M: { ord: 1, fmt: 0 },
    Q: { ord: 2, fmt: 3 },
    H: { ord: 3, fmt: 2 }
  };

  // ECC codewords per block, indexed [ecl.ord][version]. Index 0 of each row is unused.
  var ECC_CODEWORDS_PER_BLOCK = [
    [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    [0, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [0, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
  ];

  // Number of error correction blocks, indexed [ecl.ord][version].
  var NUM_ERROR_CORRECTION_BLOCKS = [
    [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    [0, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    [0, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]
  ];

  function getNumRawDataModules(ver) {
    var result = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      var numAlign = Math.floor(ver / 7) + 2;
      result -= (25 * numAlign - 10) * numAlign - 55;
      if (ver >= 7) result -= 36;
    }
    return result;
  }

  function getNumDataCodewords(ver, ecl) {
    return Math.floor(getNumRawDataModules(ver) / 8)
      - ECC_CODEWORDS_PER_BLOCK[ecl.ord][ver] * NUM_ERROR_CORRECTION_BLOCKS[ecl.ord][ver];
  }

  function getAlignmentPatternPositions(ver) {
    if (ver === 1) return [];
    var numAlign = Math.floor(ver / 7) + 2;
    var step = (ver === 32) ? 26 : Math.ceil((ver * 4 + 4) / (numAlign * 2 - 2)) * 2;
    var size = ver * 4 + 17;
    var result = [6];
    for (var pos = size - 7; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
    return result;
  }

  // --- Galois field arithmetic over GF(256) with primitive modulus 0x11D ---

  function gfMul(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11D);
      z ^= ((y >>> i) & 1) * x;
    }
    return z & 0xFF;
  }

  function rsComputeDivisor(degree) {
    var result = new Uint8Array(degree);
    result[degree - 1] = 1;
    var root = 1;
    for (var i = 0; i < degree; i++) {
      for (var j = 0; j < degree; j++) {
        result[j] = gfMul(result[j], root);
        if (j + 1 < degree) result[j] ^= result[j + 1];
      }
      root = gfMul(root, 0x02);
    }
    return result;
  }

  function rsComputeRemainder(data, divisor) {
    var result = new Uint8Array(divisor.length);
    for (var d = 0; d < data.length; d++) {
      var factor = data[d] ^ result[0];
      result.copyWithin(0, 1);
      result[result.length - 1] = 0;
      for (var i = 0; i < result.length; i++) result[i] ^= gfMul(divisor[i], factor);
    }
    return result;
  }

  // --- Bit stream ---

  function getBit(x, i) {
    return ((x >>> i) & 1) !== 0;
  }

  function appendBits(val, len, bits) {
    for (var i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
  }

  // --- Encoder ---

  function encode(text, opts) {
    opts = opts || {};
    var ecl = ECL[(opts.ecl || 'M').toUpperCase()];
    if (!ecl) throw new Error('Unknown error correction level');
    var minVersion = Math.max(1, Math.min(40, opts.minVersion || 1));

    var bytes = new TextEncoder().encode(text);

    var version = 0;
    for (var ver = minVersion; ver <= 40; ver++) {
      var capacityBits = getNumDataCodewords(ver, ecl) * 8;
      var countBits = ver <= 9 ? 8 : 16;
      if (4 + countBits + bytes.length * 8 <= capacityBits) { version = ver; break; }
    }
    if (version === 0) throw new Error('Data is too long to fit in a QR code (max ~2953 bytes)');

    // Boost the error correction level for free if the data still fits at this version.
    if (opts.boost !== false) {
      ['H', 'Q', 'M'].forEach(function (key) {
        var cand = ECL[key];
        if (cand.ord > ecl.ord) {
          var countBits2 = version <= 9 ? 8 : 16;
          if (4 + countBits2 + bytes.length * 8 <= getNumDataCodewords(version, cand) * 8) ecl = cand;
        }
      });
    }

    var bits = [];
    appendBits(4, 4, bits);                                   // byte mode indicator
    appendBits(bytes.length, version <= 9 ? 8 : 16, bits);    // character count
    for (var b = 0; b < bytes.length; b++) appendBits(bytes[b], 8, bits);

    var dataCapacityBits = getNumDataCodewords(version, ecl) * 8;
    appendBits(0, Math.min(4, dataCapacityBits - bits.length), bits);   // terminator
    appendBits(0, (8 - bits.length % 8) % 8, bits);                     // pad to a byte boundary
    for (var pad = 0xEC; bits.length < dataCapacityBits; pad ^= 0xEC ^ 0x11) appendBits(pad, 8, bits);

    var dataCodewords = new Uint8Array(bits.length / 8);
    for (var i = 0; i < bits.length; i++) dataCodewords[i >>> 3] |= bits[i] << (7 - (i & 7));

    return new QrCode(version, ecl, addEccAndInterleave(dataCodewords, version, ecl),
      opts.mask === undefined ? -1 : opts.mask);
  }

  function addEccAndInterleave(data, version, ecl) {
    var numBlocks = NUM_ERROR_CORRECTION_BLOCKS[ecl.ord][version];
    var blockEccLen = ECC_CODEWORDS_PER_BLOCK[ecl.ord][version];
    var rawCodewords = Math.floor(getNumRawDataModules(version) / 8);
    var numShortBlocks = numBlocks - rawCodewords % numBlocks;
    var shortBlockLen = Math.floor(rawCodewords / numBlocks);

    var blocks = [];
    var rsDiv = rsComputeDivisor(blockEccLen);
    for (var i = 0, k = 0; i < numBlocks; i++) {
      var dat = data.slice(k, k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1));
      k += dat.length;
      var ecc = rsComputeRemainder(dat, rsDiv);
      var block = Array.from(dat);
      if (i < numShortBlocks) block.push(0);   // placeholder, skipped when interleaving
      blocks.push(block.concat(Array.from(ecc)));
    }

    var result = [];
    for (var j = 0; j < blocks[0].length; j++) {
      for (var m = 0; m < blocks.length; m++) {
        if (j !== shortBlockLen - blockEccLen || m >= numShortBlocks) result.push(blocks[m][j]);
      }
    }
    return result;
  }

  // --- Symbol drawing ---

  function QrCode(version, ecl, codewords, mask) {
    this.version = version;
    this.ecl = ecl;
    this.size = version * 4 + 17;

    var size = this.size;
    this.modules = [];
    this.isFunction = [];
    for (var y = 0; y < size; y++) {
      this.modules.push(new Array(size).fill(false));
      this.isFunction.push(new Array(size).fill(false));
    }

    this.drawFunctionPatterns();
    this.drawCodewords(codewords);

    if (mask === -1) {
      var minPenalty = Infinity;
      for (var m = 0; m < 8; m++) {
        this.applyMask(m);
        this.drawFormatBits(m);
        var penalty = this.getPenaltyScore();
        if (penalty < minPenalty) { mask = m; minPenalty = penalty; }
        this.applyMask(m);   // XOR is its own inverse
      }
    }
    this.mask = mask;
    this.applyMask(mask);
    this.drawFormatBits(mask);
    this.isFunction = null;
  }

  QrCode.prototype.setFunctionModule = function (x, y, isDark) {
    this.modules[y][x] = isDark;
    this.isFunction[y][x] = true;
  };

  QrCode.prototype.drawFunctionPatterns = function () {
    var size = this.size, i;

    for (i = 0; i < size; i++) {
      this.setFunctionModule(6, i, i % 2 === 0);
      this.setFunctionModule(i, 6, i % 2 === 0);
    }

    this.drawFinderPattern(3, 3);
    this.drawFinderPattern(size - 4, 3);
    this.drawFinderPattern(3, size - 4);

    var alignPos = getAlignmentPatternPositions(this.version);
    var numAlign = alignPos.length;
    for (i = 0; i < numAlign; i++) {
      for (var j = 0; j < numAlign; j++) {
        // Skip the three corners, which are occupied by the finder patterns.
        if (!(i === 0 && j === 0 || i === 0 && j === numAlign - 1 || i === numAlign - 1 && j === 0)) {
          this.drawAlignmentPattern(alignPos[i], alignPos[j]);
        }
      }
    }

    this.drawFormatBits(0);   // dummy, overwritten once the mask is chosen
    this.drawVersion();
  };

  QrCode.prototype.drawFinderPattern = function (x, y) {
    for (var dy = -4; dy <= 4; dy++) {
      for (var dx = -4; dx <= 4; dx++) {
        var dist = Math.max(Math.abs(dx), Math.abs(dy));
        var xx = x + dx, yy = y + dy;
        if (xx >= 0 && xx < this.size && yy >= 0 && yy < this.size) {
          this.setFunctionModule(xx, yy, dist !== 2 && dist !== 4);
        }
      }
    }
  };

  QrCode.prototype.drawAlignmentPattern = function (x, y) {
    for (var dy = -2; dy <= 2; dy++) {
      for (var dx = -2; dx <= 2; dx++) {
        this.setFunctionModule(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
  };

  QrCode.prototype.drawFormatBits = function (mask) {
    var data = this.ecl.fmt << 3 | mask;
    var rem = data;
    for (var i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    var bits = ((data << 10) | rem) ^ 0x5412;
    var size = this.size;

    for (i = 0; i <= 5; i++) this.setFunctionModule(8, i, getBit(bits, i));
    this.setFunctionModule(8, 7, getBit(bits, 6));
    this.setFunctionModule(8, 8, getBit(bits, 7));
    this.setFunctionModule(7, 8, getBit(bits, 8));
    for (i = 9; i < 15; i++) this.setFunctionModule(14 - i, 8, getBit(bits, i));

    for (i = 0; i < 8; i++) this.setFunctionModule(size - 1 - i, 8, getBit(bits, i));
    for (i = 8; i < 15; i++) this.setFunctionModule(8, size - 15 + i, getBit(bits, i));
    this.setFunctionModule(8, size - 8, true);   // always-dark module
  };

  QrCode.prototype.drawVersion = function () {
    if (this.version < 7) return;
    var rem = this.version;
    for (var i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
    var bits = this.version << 12 | rem;
    for (i = 0; i < 18; i++) {
      var bit = getBit(bits, i);
      var a = this.size - 11 + i % 3, b = Math.floor(i / 3);
      this.setFunctionModule(a, b, bit);
      this.setFunctionModule(b, a, bit);
    }
  };

  QrCode.prototype.drawCodewords = function (data) {
    var size = this.size;
    var i = 0;   // bit index into data
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) {
        for (var j = 0; j < 2; j++) {
          var x = right - j;
          var upward = ((right + 1) & 2) === 0;
          var y = upward ? size - 1 - vert : vert;
          if (!this.isFunction[y][x] && i < data.length * 8) {
            this.modules[y][x] = getBit(data[i >>> 3], 7 - (i & 7));
            i++;
          }
        }
      }
    }
  };

  QrCode.prototype.applyMask = function (mask) {
    for (var y = 0; y < this.size; y++) {
      for (var x = 0; x < this.size; x++) {
        var invert;
        switch (mask) {
          case 0: invert = (x + y) % 2 === 0; break;
          case 1: invert = y % 2 === 0; break;
          case 2: invert = x % 3 === 0; break;
          case 3: invert = (x + y) % 3 === 0; break;
          case 4: invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
          case 5: invert = x * y % 2 + x * y % 3 === 0; break;
          case 6: invert = (x * y % 2 + x * y % 3) % 2 === 0; break;
          case 7: invert = ((x + y) % 2 + x * y % 3) % 2 === 0; break;
          default: throw new Error('Bad mask');
        }
        if (!this.isFunction[y][x] && invert) this.modules[y][x] = !this.modules[y][x];
      }
    }
  };

  // Penalty rules from the QR specification; lower is better.
  QrCode.prototype.getPenaltyScore = function () {
    var size = this.size, result = 0, x, y, runX, runY, runColor, runHistory;

    for (y = 0; y < size; y++) {
      runColor = false; runX = 0; runHistory = [0, 0, 0, 0, 0, 0, 0];
      for (x = 0; x < size; x++) {
        if (this.modules[y][x] === runColor) {
          runX++;
          if (runX === 5) result += 3;
          else if (runX > 5) result++;
        } else {
          this.finderPenaltyAddHistory(runX, runHistory);
          if (!runColor) result += this.finderPenaltyCountPatterns(runHistory) * 40;
          runColor = this.modules[y][x];
          runX = 1;
        }
      }
      result += this.finderPenaltyTerminateAndCount(runColor, runX, runHistory) * 40;
    }

    for (x = 0; x < size; x++) {
      runColor = false; runY = 0; runHistory = [0, 0, 0, 0, 0, 0, 0];
      for (y = 0; y < size; y++) {
        if (this.modules[y][x] === runColor) {
          runY++;
          if (runY === 5) result += 3;
          else if (runY > 5) result++;
        } else {
          this.finderPenaltyAddHistory(runY, runHistory);
          if (!runColor) result += this.finderPenaltyCountPatterns(runHistory) * 40;
          runColor = this.modules[y][x];
          runY = 1;
        }
      }
      result += this.finderPenaltyTerminateAndCount(runColor, runY, runHistory) * 40;
    }

    for (y = 0; y < size - 1; y++) {
      for (x = 0; x < size - 1; x++) {
        var c = this.modules[y][x];
        if (c === this.modules[y][x + 1] && c === this.modules[y + 1][x] && c === this.modules[y + 1][x + 1]) {
          result += 3;
        }
      }
    }

    var dark = 0;
    for (y = 0; y < size; y++) for (x = 0; x < size; x++) if (this.modules[y][x]) dark++;
    var total = size * size;
    var k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
    return result + k * 10;
  };

  QrCode.prototype.finderPenaltyAddHistory = function (currentRunLength, runHistory) {
    if (runHistory[0] === 0) currentRunLength += this.size;   // the light border counts as run length
    runHistory.pop();
    runHistory.unshift(currentRunLength);
  };

  QrCode.prototype.finderPenaltyCountPatterns = function (runHistory) {
    var n = runHistory[1];
    var core = n > 0 && runHistory[2] === n && runHistory[3] === n * 3 && runHistory[4] === n && runHistory[5] === n;
    return (core && runHistory[0] >= n * 4 && runHistory[6] >= n ? 1 : 0)
      + (core && runHistory[6] >= n * 4 && runHistory[0] >= n ? 1 : 0);
  };

  QrCode.prototype.finderPenaltyTerminateAndCount = function (currentRunColor, currentRunLength, runHistory) {
    if (currentRunColor) {
      this.finderPenaltyAddHistory(currentRunLength, runHistory);
      currentRunLength = 0;
    }
    currentRunLength += this.size;
    this.finderPenaltyAddHistory(currentRunLength, runHistory);
    return this.finderPenaltyCountPatterns(runHistory);
  };

  globalThis.QR = {
    encode: function (text, opts) {
      var qr = encode(text, opts);
      return { size: qr.size, modules: qr.modules, version: qr.version, ecl: qr.ecl, mask: qr.mask };
    },
    // Approximate capacity in bytes for the given version and level, for the UI hints.
    capacity: function (version, eclKey) {
      var ecl = ECL[eclKey.toUpperCase()];
      return getNumDataCodewords(version, ecl) - (version <= 9 ? 2 : 3);
    }
  };
})();
