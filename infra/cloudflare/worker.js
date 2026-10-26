// Answers byte-range requests for the site's videos.
//
// Cloudflare's static asset layer ignores the Range header and always sends
// the whole file with a 200. Safari on iPhone and iPad will not play a
// <video> unless the server answers ranges with 206 Partial Content, so the
// intro film would not play there. wrangler.jsonc runs this Worker for .mp4
// paths only; every other request is served by the asset layer as before.

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Cross-Origin-Resource-Policy': 'same-origin',
};

export default {
  async fetch(request, env) {
    // Always fetched as a GET: a HEAD from the asset layer has no body to
    // measure or slice. A HEAD still gets no body back from this Worker.
    const head = request.method === 'HEAD';
    const asset = await env.ASSETS.fetch(new Request(request.url, { headers: request.headers }));
    if (asset.status !== 200) return asset;

    const range = request.headers.get('Range');
    const ifRange = request.headers.get('If-Range');
    const etag = asset.headers.get('ETag');
    const wantsPart = range && (!ifRange || ifRange === etag);

    if (!wantsPart) {
      const whole = new Response(head ? null : asset.body, asset);
      whole.headers.set('Accept-Ranges', 'bytes');
      setSecurity(whole.headers);
      return whole;
    }

    const body = await asset.arrayBuffer();
    const size = body.byteLength;
    const span = parseRange(range, size);

    const headers = new Headers(asset.headers);
    headers.delete('Content-Length');
    headers.delete('Content-Encoding');
    headers.set('Accept-Ranges', 'bytes');
    setSecurity(headers);

    if (span === null) {
      // Several ranges at once, or a header we do not understand: send it all.
      headers.set('Content-Length', String(size));
      return new Response(head ? null : body, { status: 200, headers });
    }
    if (span === 'unsatisfiable') {
      headers.set('Content-Range', `bytes */${size}`);
      return new Response(null, { status: 416, headers });
    }

    const [start, end] = span;
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
    headers.set('Content-Length', String(end - start + 1));
    // A range covering the whole file is sent as it is, without a copy.
    const part = start === 0 && end === size - 1 ? body : body.slice(start, end + 1);
    return new Response(head ? null : part, { status: 206, headers });
  },
};

function setSecurity(headers) {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) headers.set(name, value);
}

// "bytes=0-1023", "bytes=1024-" or "bytes=-500" into [start, end], inclusive.
// Returns null for anything else (including several ranges) and
// 'unsatisfiable' when the range lies wholly past the end of the file.
function parseRange(header, size) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m || (m[1] === '' && m[2] === '')) return null;
  let start;
  let end;
  if (m[1] === '') {
    const suffix = Number(m[2]);
    if (suffix === 0) return 'unsatisfiable';
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(m[1]);
    end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
  }
  if (start >= size || start > end) return 'unsatisfiable';
  return [start, end];
}
