/* Minimal, dependency-free Markdown -> HTML renderer.
   Supports the subset used by the course: headings, bold, inline code, links,
   fenced code blocks, tables, blockquotes, ordered/unordered lists, hr,
   definition-style ": " lines, and paragraphs. Works in Node and the browser. */
(function (global) {
  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function inline(text) {
    // protect inline code spans
    var codes = [];
    text = text.replace(/`([^`]+)`/g, function (_, c) {
      codes.push("<code>" + escapeHtml(c) + "</code>");
      return "" + (codes.length - 1) + "";
    });
    text = escapeHtml(text);
    // bold (non-greedy so it can span inner single-* italics)
    text = text.replace(/\*\*([\s\S]+?)\*\*/g, "<strong>$1</strong>");
    // italics (remaining single *)
    text = text.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
    // links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, t, u) {
      var safe = u.replace(/"/g, "%22");
      var ext = /^https?:\/\//.test(u) ? ' target="_blank" rel="noopener"' : "";
      return '<a href="' + safe + '"' + ext + ">" + t + "</a>";
    });
    // restore code spans
    text = text.replace(/(\d+)/g, function (_, i) {
      return codes[+i];
    });
    return text;
  }

  function renderTable(rows) {
    // rows: array of raw '| a | b |' lines (header, sep, ...body)
    function cells(line) {
      var t = line.trim().replace(/^\|/, "").replace(/\|$/, "");
      return t.split("|").map(function (c) { return c.trim(); });
    }
    var header = cells(rows[0]);
    var body = rows.slice(2).map(cells);
    var html = '<div class="tablewrap"><table><thead><tr>';
    header.forEach(function (h) { html += "<th>" + inline(h) + "</th>"; });
    html += "</tr></thead><tbody>";
    body.forEach(function (r) {
      html += "<tr>";
      r.forEach(function (c) { html += "<td>" + inline(c) + "</td>"; });
      html += "</tr>";
    });
    html += "</tbody></table></div>";
    return html;
  }

  function mdToHtml(md) {
    md = md.replace(/\r\n/g, "\n");
    var lines = md.split("\n");
    var out = [];
    var i = 0;

    function isTableSep(line) {
      return /^\s*\|?[\s:-]*-[\s:|-]*\|?\s*$/.test(line) && line.indexOf("-") !== -1;
    }

    // collect a whole list (spanning blank lines between items and indented
    // block content such as fenced code) starting at index `start`.
    function collectList(start, ordered) {
      var markerRe = ordered ? /^(\s*)\d+\.\s+(.*)$/ : /^(\s*)[-*]\s+(.*)$/;
      var base = lines[start].match(markerRe)[1].length;
      var offset = base + (ordered ? 3 : 2);
      var items = [], cur = null, k = start;
      while (k < lines.length) {
        var ln = lines[k], m = ln.match(markerRe);
        if (m && m[1].length === base) { if (cur) items.push(cur); cur = [m[2]]; k++; continue; }
        if (ln.trim() === "") {
          var j = k + 1; while (j < lines.length && lines[j].trim() === "") j++;
          if (j < lines.length && cur) {
            var mn = lines[j].match(markerRe), ind = lines[j].match(/^\s*/)[0].length;
            if ((mn && mn[1].length === base) || ind > base) { cur.push(""); k = j; continue; }
          }
          break;
        }
        var ind2 = ln.match(/^\s*/)[0].length;
        if (cur && ind2 > base) { cur.push(ln.slice(Math.min(ind2, offset))); k++; continue; }
        break;
      }
      if (cur) items.push(cur);
      return { items: items, next: k };
    }
    // render one item's body: recurse so nested code/paragraphs/sublists become
    // real blocks; unwrap a lone <p> so simple items stay tight.
    function renderItem(body) {
      while (body.length && body[0].trim() === "") body.shift();
      while (body.length && body[body.length - 1].trim() === "") body.pop();
      var inner = mdToHtml(body.join("\n"));
      var mm = inner.match(/^<p>([\s\S]*)<\/p>$/);
      if (mm && !/<(p|ul|ol|pre|table|blockquote|h[1-6])[ >]/.test(mm[1])) return mm[1];
      return inner;
    }

    while (i < lines.length) {
      var line = lines[i];

      // fenced code block
      var fence = line.match(/^```(\w*)\s*$/);
      if (fence) {
        var lang = fence[1] || "";
        var buf = [];
        i++;
        while (i < lines.length && !/^```\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++; // skip closing fence
        out.push('<pre class="code" data-lang="' + lang + '"><button class="explain" type="button" title="What does this do?">?</button><button class="copy" type="button">Copy</button><code>' +
          escapeHtml(buf.join("\n")) + "</code></pre>");
        continue;
      }

      // horizontal rule
      if (/^\s*---\s*$/.test(line)) { out.push("<hr>"); i++; continue; }

      // heading
      var h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) {
        var lvl = h[1].length;
        out.push("<h" + lvl + ">" + inline(h[2].trim()) + "</h" + lvl + ">");
        i++;
        continue;
      }

      // blockquote (may span lines)
      if (/^\s*>\s?/.test(line)) {
        var q = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
          q.push(lines[i].replace(/^\s*>\s?/, ""));
          i++;
        }
        out.push('<blockquote>' + mdToHtml(q.join("\n")) + "</blockquote>");
        continue;
      }

      // table
      if (line.indexOf("|") !== -1 && i + 1 < lines.length && isTableSep(lines[i + 1])) {
        var trows = [];
        while (i < lines.length && lines[i].indexOf("|") !== -1 && lines[i].trim() !== "") {
          trows.push(lines[i]);
          i++;
        }
        out.push(renderTable(trows));
        continue;
      }

      // unordered list
      if (/^\s*[-*]\s+/.test(line)) {
        var ul = collectList(i, false);
        out.push("<ul>" + ul.items.map(function (b) { return "<li>" + renderItem(b) + "</li>"; }).join("") + "</ul>");
        i = ul.next;
        continue;
      }

      // ordered list
      if (/^\s*\d+\.\s+/.test(line)) {
        var ol = collectList(i, true);
        out.push("<ol>" + ol.items.map(function (b) { return "<li>" + renderItem(b) + "</li>"; }).join("") + "</ol>");
        i = ol.next;
        continue;
      }

      // definition-style ": " line -> indented note paragraph
      if (/^:\s+/.test(line)) {
        out.push('<p class="dd">' + inline(line.replace(/^:\s+/, "")) + "</p>");
        i++;
        continue;
      }

      // blank line
      if (line.trim() === "") { i++; continue; }

      // paragraph (gather until blank / block start)
      var para = [line];
      i++;
      while (i < lines.length && lines[i].trim() !== "" &&
             !/^(#{1,6})\s/.test(lines[i]) &&
             !/^```/.test(lines[i]) &&
             !/^\s*>\s?/.test(lines[i]) &&
             !/^\s*[-*]\s+/.test(lines[i]) &&
             !/^\s*\d+\.\s+/.test(lines[i]) &&
             !/^:\s+/.test(lines[i]) &&
             !/^\s*---\s*$/.test(lines[i]) &&
             !(lines[i].indexOf("|") !== -1 && i + 1 < lines.length && isTableSep(lines[i + 1]))) {
        para.push(lines[i]);
        i++;
      }
      out.push("<p>" + inline(para.join(" ")) + "</p>");
    }

    return out.join("\n");
  }

  if (typeof module !== "undefined" && module.exports) module.exports = mdToHtml;
  else global.mdToHtml = mdToHtml;
})(typeof window !== "undefined" ? window : this);
