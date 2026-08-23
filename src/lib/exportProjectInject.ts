import fs from "fs";
import path from "path";
import type { Request, Response, NextFunction } from "express";

// Script chạy trên trình duyệt: chèn nút "Tải xuống" vào từng thẻ dự án ở màn
// hình #/project và gọi API POST /api/project/exportProject để tải nguyên gói zip
// (kịch bản, nhân vật/bối cảnh/đạo cụ/giọng, phân cảnh, video, tiểu thuyết gốc...).
//
// Vì frontend source nằm ở kho riêng (Toonflow-web) và repo này chỉ chứa bản build
// sẵn (data/web/index.html), ta chèn script này lúc phục vụ trang thay vì sửa bundle.
//
// LƯU Ý: KHÔNG dùng backtick, ${...} hay dấu gạch chéo ngược (\) trong chuỗi dưới đây
// để tránh xung đột với template literal của TypeScript.
export const EXPORT_PROJECT_CLIENT_JS = `(function () {
  if (window.__tfExportInit) return;
  window.__tfExportInit = true;

  var DL_SVG = '<svg width="18" height="18" viewBox="0 0 48 48" fill="none">'
    + '<path d="M6 24.0083V42h36V24" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>'
    + '<path d="M33 23L24 32L15 23" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>'
    + '<path d="M23.9917 6V32" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>'
    + '</svg>';
  var SPIN_SVG = '<svg class="tf-spin" width="18" height="18" viewBox="0 0 48 48" fill="none">'
    + '<path d="M24 6a18 18 0 1 1-12.7 5.3" stroke="currentColor" stroke-width="4" stroke-linecap="round"></path>'
    + '</svg>';

  if (!document.getElementById('tf-export-style')) {
    var style = document.createElement('style');
    style.id = 'tf-export-style';
    style.textContent = '.tf-exportBtn{display:inline-flex;align-items:center;cursor:pointer;margin-right:10px;color:inherit;opacity:.75;transition:opacity .15s,color .15s;}'
      + '.tf-exportBtn:hover{opacity:1;color:#0052d9;}'
      + '.tf-exportBtn.tf-loading{cursor:default;opacity:.6;}'
      + '.tf-spin{animation:tf-spin .8s linear infinite;transform-origin:center;}'
      + '@keyframes tf-spin{to{transform:rotate(360deg);}}';
    document.head.appendChild(style);
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(ct) {
    var d = new Date(Number(ct));
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
      + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }

  var cache = null, cacheAt = 0, pending = null;
  function loadProjects() {
    var now = Date.now();
    if (cache && (now - cacheAt < 4000)) return Promise.resolve(cache);
    if (pending) return pending;
    pending = fetch('/api/project/getProject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('token') || '' },
      body: '{}'
    }).then(function (r) { return r.json(); })
      .then(function (j) { cache = (j && j.data) || []; cacheAt = Date.now(); pending = null; return cache; })
      .catch(function () { pending = null; return []; });
    return pending;
  }

  // Map thẻ -> projectId: ưu tiên tên + thời gian tạo (đã định dạng), sau đó tới
  // riêng thời gian (gần như duy nhất), cuối cùng tới riêng tên.
  function findId(name, timeText, ps) {
    var i, p;
    for (i = 0; i < ps.length; i++) {
      p = ps[i];
      if (String(p.name) === name && fmt(p.createTime) === timeText) return p.id;
    }
    var bt = ps.filter(function (p) { return fmt(p.createTime) === timeText; });
    if (bt.length === 1) return bt[0].id;
    var bn = ps.filter(function (p) { return String(p.name) === name; });
    if (bn.length === 1) return bn[0].id;
    return null;
  }

  function fnameFrom(cd, fb) {
    if (!cd) return fb;
    var mk = "filename*=UTF-8''";
    var i = cd.indexOf(mk);
    if (i >= 0) {
      var r = cd.slice(i + mk.length);
      var e = r.indexOf(';'); if (e >= 0) r = r.slice(0, e);
      try { return decodeURIComponent(r.trim()); } catch (x) {}
    }
    var j = cd.indexOf('filename=');
    if (j >= 0) {
      var r2 = cd.slice(j + 9);
      var e2 = r2.indexOf(';'); if (e2 >= 0) r2 = r2.slice(0, e2);
      return r2.replace(/"/g, '').trim();
    }
    return fb;
  }

  function download(pid, btn) {
    if (btn.classList.contains('tf-loading')) return;
    btn.classList.add('tf-loading');
    var ic = btn.querySelector('.i-icon');
    var old = ic.innerHTML;
    ic.innerHTML = SPIN_SVG;
    fetch('/api/project/exportProject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('token') || '' },
      body: JSON.stringify({ projectId: Number(pid) })
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (t) {
          var m = t; try { m = JSON.parse(t).message || t; } catch (x) {}
          throw new Error(m || ('HTTP ' + res.status));
        });
      }
      var cd = res.headers.get('Content-Disposition');
      return res.blob().then(function (b) { return { b: b, n: fnameFrom(cd, 'toonflow-project-' + pid + '.zip') }; });
    }).then(function (o) {
      var url = URL.createObjectURL(o.b);
      var a = document.createElement('a');
      a.href = url; a.download = o.n;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    }).catch(function (err) {
      alert('Tải dự án thất bại: ' + ((err && err.message) || err));
    }).then(function () {
      btn.classList.remove('tf-loading');
      ic.innerHTML = old;
    });
  }

  function decorate() {
    if (location.hash.indexOf('#/project') !== 0) return;
    var abs = document.querySelectorAll('.card .actionBtns');
    if (!abs.length) return;
    loadProjects().then(function (ps) {
      abs.forEach(function (ab) {
        if (ab.querySelector('.tf-exportBtn')) return;
        var card = ab.closest('.card'); if (!card) return;
        var te = card.querySelector('.title'), me = card.querySelector('.time');
        var name = te ? te.textContent.trim() : '';
        var tt = me ? me.textContent.trim() : '';
        var pid = findId(name, tt, ps);
        if (pid == null) return;
        var btn = document.createElement('div');
        btn.className = 'tf-exportBtn';
        btn.title = 'Tải xuống toàn bộ dự án (.zip)';
        btn.innerHTML = '<span class="i-icon">' + DL_SVG + '</span>';
        btn.addEventListener('click', function (e) {
          e.stopPropagation(); e.preventDefault();
          download(pid, btn);
        });
        ab.insertBefore(btn, ab.firstChild);
      });
    });
  }

  var t = null;
  function schedule() { if (t) clearTimeout(t); t = setTimeout(decorate, 150); }
  var mo = new MutationObserver(schedule);
  mo.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('hashchange', function () { cache = null; schedule(); });
  schedule();
})();`;

// Middleware phục vụ index.html đã được chèn thẻ <script> nạp script client ở trên.
// Đọc & chèn một lần rồi cache trong bộ nhớ (index.html rất lớn nên không đọc lại mỗi request).
export function serveInjectedIndex(webDir: string) {
  const indexHtmlPath = path.join(webDir, "index.html");
  const TAG = '<script src="/inject/export-project.js" defer></script>';
  let cached: string | null = null;
  return (_req: Request, res: Response, next: NextFunction) => {
    try {
      if (cached == null) {
        let html = fs.readFileSync(indexHtmlPath, "utf8");
        if (html.indexOf("/inject/export-project.js") === -1) {
          // index.html là bundle rất lớn, chứa nhiều </body> nằm trong chuỗi inline;
          // chèn trước </body> THẬT (cái cuối cùng) để thẻ script được trình duyệt parse.
          let idx = html.lastIndexOf("</body>");
          if (idx === -1) idx = html.lastIndexOf("</html>");
          html = idx !== -1 ? html.slice(0, idx) + TAG + html.slice(idx) : html + TAG;
        }
        cached = html;
      }
      res.type("html").send(cached);
    } catch (e) {
      next();
    }
  };
}
