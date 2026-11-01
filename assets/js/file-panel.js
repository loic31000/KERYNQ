/* KERYNQ · recherche par fichier. Tout reste en mémoire dans cette page : rien n'est stocké ni envoyé sans action de l'utilisateur. */
(() => {
  'use strict';
  const F = KerynqFile, $ = id => document.getElementById(id);
  const vendor = path => new URL('assets/vendor/' + path, document.baseURI).href;
  let job = 0, objectUrl = '', cancelJob = null, current = null, matches = [], matchIndex = -1, sensitive = [];

  function say(text, busy = false) { $('fileStatus').textContent = text; $('fileBusy').hidden = !busy; if (!busy) cancelJob = null; }
  function progress(value) { const p = $('fileProgress'); if (value === null) p.removeAttribute('value'); else p.value = value; }
  function row(root, label, text) { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = label; dd.textContent = text; root.append(dt, dd); }
  function fill(root, rows) { root.replaceChildren(); for (const [label, text] of rows) row(root, label, text); }
  function loadScript(path) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script'); s.src = vendor(path);
      s.onload = resolve; s.onerror = () => reject(Error('load')); document.head.append(s);
    });
  }
  function reset() {
    job++;
    if (cancelJob) { try { cancelJob(); } catch {} cancelJob = null; }
    if (objectUrl) { URL.revokeObjectURL(objectUrl); objectUrl = ''; }
    current = null; matches = []; matchIndex = -1; sensitive = [];
    $('filePreview').removeAttribute('src'); $('filePreview').hidden = true;
    $('fileText').value = ''; $('fileFind').value = ''; $('fileFindCount').textContent = ''; $('fileSelection').textContent = '';
    fill($('fileInfo'), []); fill($('fileMeta'), []); fill($('fileSensitive'), []);
    $('fileSensitiveWrap').hidden = true; $('fileSensitive').hidden = true; $('fileSensitiveToggle').setAttribute('aria-expanded', 'false'); $('fileSensitiveToggle').textContent = 'Afficher les données sensibles';
    $('fileMetaWrap').hidden = true; $('fileOcr').hidden = true; $('fileReverse').hidden = true; $('fileTextWrap').hidden = true; $('fileBody').hidden = true;
    $('fileInput').value = '';
    say('');
  }
  function showText(text, note) {
    $('fileText').value = text; $('fileTextWrap').hidden = false;
    say(note || (text.trim() ? 'Texte prêt. Relisez-le et sélectionnez un passage.' : 'Aucun texte trouvé.'));
  }
  async function openFile(file) {
    reset();
    const id = job;
    $('fileBody').hidden = false;
    fill($('fileInfo'), [['Nom', file.name.slice(0, 120)], ['Taille', F.formatSize(file.size)]]);
    try {
      const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
      const kind = F.classify(file, head);
      if (id !== job) return;
      if (!kind.ok) { $('fileInfo').replaceChildren(); $('fileBody').hidden = false; say(kind.reason); return; }
      current = {file, kind};
      row($('fileInfo'), 'Type', kind.label);
      if (kind.kind === 'image') await openImage(file, id);
      else if (kind.kind === 'pdf') await openPdf(file, id);
      else await openText(file, kind, id);
    } catch (error) {
      if (id === job) say(error && error.name === 'RangeError' ? 'Mémoire insuffisante pour ce fichier.' : (error && error.userMessage) || 'Impossible de lire ce fichier. Il est peut-être abîmé.');
    }
  }
  async function openText(file, kind, id) {
    let raw;
    try { raw = F.decodeText(new Uint8Array(await file.arrayBuffer())); }
    catch (error) { if (error.name === 'RangeError') throw error; throw Object.assign(Error('text'), {userMessage: error.message}); }
    if (id !== job) return;
    const ready = F.prepareText(kind.ext, raw);
    showText(ready.text, ready.note);
  }
  async function openImage(file, id) {
    objectUrl = URL.createObjectURL(file);
    const img = $('filePreview');
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = () => reject(Object.assign(Error('image'), {userMessage: 'Cette image est abîmée ou illisible.'})); img.src = objectUrl; });
    if (id !== job) return;
    img.hidden = false;
    const w = img.naturalWidth, h = img.naturalHeight;
    row($('fileInfo'), 'Dimensions', w + ' × ' + h + ' pixels');
    $('fileReverse').hidden = false;
    current.tooBig = w * h > F.LIMITS.pixels;
    $('fileOcr').hidden = current.tooBig;
    say(current.tooBig ? 'Image trop grande pour lire son texte. L’aperçu reste disponible.' : 'Image prête. Rien n’a été envoyé.');
    try {
      if (!window.exifr) await loadScript('exifr/lite.umd.js');
      const raw = await window.exifr.parse(file, {tiff: true, exif: true, gps: true, ifd1: false, xmp: false, icc: false, iptc: false, jfif: false});
      if (id !== job || !raw) return;
      const meta = F.splitMetadata(raw);
      if (meta.general.length) { fill($('fileMeta'), meta.general); $('fileMetaWrap').hidden = false; }
      sensitive = meta.sensitive;
      if (sensitive.length) { $('fileSensitiveWrap').hidden = false; $('fileSensitiveCount').textContent = sensitive.length + ' donnée(s) sensible(s) masquée(s), par exemple un lieu ou un auteur.'; }
    } catch { /* Une image sans métadonnées lisibles reste utilisable. */ }
  }
  async function openPdf(file, id) {
    say('Lecture du PDF sur votre appareil…', true); progress(null);
    let lib;
    try { lib = await import(vendor('pdfjs/pdf.min.mjs')); }
    catch { throw Object.assign(Error('pdf'), {userMessage: 'La lecture des PDF nécessite le site en ligne : elle ne fonctionne pas en ouvrant le fichier index.html directement.'}); }
    if (id !== job) return;
    lib.GlobalWorkerOptions.workerSrc = vendor('pdfjs/pdf.worker.min.mjs');
    const task = lib.getDocument({data: await file.arrayBuffer(), isEvalSupported: false, disableFontFace: true, useSystemFonts: false, enableXfa: false, stopAtErrors: false, verbosity: 0});
    cancelJob = () => task.destroy();
    try {
      const pdf = await task.promise;
      if (id !== job) return;
      row($('fileInfo'), 'Pages', String(pdf.numPages));
      const info = await pdf.getMetadata().catch(() => null);
      if (id !== job) return;
      const title = info && info.info && info.info.Title;
      if (typeof title === 'string' && title.trim()) { fill($('fileMeta'), [['Titre', title.trim().slice(0, 200)]]); $('fileMetaWrap').hidden = false; }
      const author = info && info.info && info.info.Author;
      if (typeof author === 'string' && author.trim()) { sensitive = [['Auteur', author.trim().slice(0, 200)]]; $('fileSensitiveWrap').hidden = false; $('fileSensitiveCount').textContent = '1 donnée sensible masquée : l’auteur du document.'; }
      const total = Math.min(pdf.numPages, F.LIMITS.pdfPages);
      let text = '';
      for (let n = 1; n <= total && text.length < F.LIMITS.textChars; n++) {
        const page = await pdf.getPage(n), content = await page.getTextContent();
        if (id !== job) return;
        text += content.items.map(x => (x.str || '') + (x.hasEOL ? '\n' : ' ')).join('').trim() + '\n\n';
        page.cleanup(); progress(n / total); say('Lecture de la page ' + n + ' sur ' + total + '…', true); cancelJob = () => task.destroy();
      }
      text = text.trim().slice(0, F.LIMITS.textChars);
      const capped = pdf.numPages > total || text.length >= F.LIMITS.textChars;
      if (!text) { say('Ce PDF ne contient pas de texte lisible : c’est probablement un document scanné.'); return; }
      showText(text, capped ? 'Seul le début de ce PDF a été lu.' : 'Texte extrait du PDF. Relisez-le et sélectionnez un passage.');
    } catch (error) {
      if (id !== job) return;
      throw Object.assign(Error('pdf'), {userMessage: error && error.name === 'PasswordException' ? 'Ce PDF est protégé par un mot de passe : il ne peut pas être lu ici.' : 'Ce PDF est abîmé ou illisible.'});
    } finally { if (id === job) { cancelJob = null; task.destroy().catch(() => {}); } }
  }
  async function runOcr() {
    if (!current || current.kind.kind !== 'image' || current.tooBig) return;
    const id = job, langs = $('fileOcrLang').value;
    $('fileOcrStart').disabled = true;
    let worker = null, fail = () => {};
    // Une ressource manquante n'interrompt pas toujours Tesseract : on ne laisse jamais l'attente sans fin.
    const failed = new Promise((_, reject) => { fail = reject; });
    const limit = setTimeout(() => fail(Error('timeout')), 90000);
    cancelJob = () => { if (worker) worker.terminate(); };
    say('Préparation de la lecture du texte…', true); progress(null);
    try {
      if (!window.Tesseract) await loadScript('tesseract/tesseract.min.js');
      if (id !== job) return;
      worker = await Promise.race([failed, Tesseract.createWorker(langs, 1, {
        workerPath: vendor('tesseract/worker.min.js'), corePath: vendor('tesseract/tesseract-core-simd-lstm.wasm.js'), langPath: vendor('tesseract/lang'),
        workerBlobURL: false, gzip: true, cacheMethod: 'none', errorHandler: error => fail(error),
        logger: m => { if (id === job && m.status === 'recognizing text') { progress(m.progress); say('Lecture du texte : ' + Math.round(m.progress * 100) + ' %', true); cancelJob = () => worker.terminate(); } }
      })]);
      clearTimeout(limit);
      if (id !== job) { worker.terminate(); return; }
      cancelJob = () => worker.terminate();
      const {data} = await Promise.race([failed, worker.recognize(current.file)]);
      if (id !== job) return;
      const text = (data.text || '').trim();
      showText(text, text ? 'Texte lu avec une confiance de ' + Math.round(data.confidence) + ' %. Cette lecture peut contenir des erreurs : corrigez-la.' : 'Aucun texte reconnu dans cette image.');
    } catch {
      if (id === job) say('La lecture du texte a échoué. Elle nécessite le site en ligne et un navigateur récent.');
    } finally {
      clearTimeout(limit);
      if (worker) { try { await worker.terminate(); } catch {} }
      if (id === job) { cancelJob = null; $('fileOcrStart').disabled = false; }
    }
  }
  function selected() { const t = $('fileText'); return t.value.slice(t.selectionStart, t.selectionEnd); }
  function setFind() {
    matches = F.findMatches($('fileText').value, $('fileFind').value); matchIndex = -1;
    $('fileFindCount').textContent = $('fileFind').value.trim() ? matches.length + ' résultat(s)' : '';
    $('fileFindNext').disabled = !matches.length;
  }
  function nextMatch() {
    if (!matches.length) return;
    matchIndex = (matchIndex + 1) % matches.length;
    const t = $('fileText'), [a, b] = matches[matchIndex];
    t.focus(); t.setSelectionRange(a, b);
    t.scrollTop = t.value.slice(0, a).split('\n').length * parseFloat(getComputedStyle(t).lineHeight) - t.clientHeight / 2;
    $('fileFindCount').textContent = (matchIndex + 1) + ' sur ' + matches.length;
    updateSelection();
  }
  function updateSelection() { const n = selected().length; $('fileSelection').textContent = n ? n + ' caractère(s) sélectionné(s)' : 'Sélectionnez un passage, ou utilisez le texte entier s’il est court.'; }
  function useWeb() {
    const whole = $('fileText').value, source = selected() || (whole.length <= F.LIMITS.query ? whole : '');
    if (!source.trim()) { KerynqApp.notify('Sélectionnez d’abord un passage du texte'); $('fileText').focus(); return; }
    const q = F.selectionToQuery(source);
    KerynqApp.useAsQuestion(q.text);
    KerynqApp.notify(q.truncated ? 'Passage raccourci et placé dans votre question' : 'Passage placé dans votre question. Rien n’a été envoyé.');
  }
  function useAi() {
    const block = F.contextBlock(selected() || $('fileText').value);
    if (!block.text) { KerynqApp.notify('Aucun texte à utiliser'); return; }
    KerynqApp.addToContext(block.text);
    KerynqApp.notify(block.truncated ? 'Extrait raccourci et ajouté au texte pour l’IA' : 'Extrait ajouté au texte pour l’IA. Rien n’a été envoyé.');
  }
  function pick(files) {
    if (!files || !files.length) return;
    if (files.length > 1) { reset(); $('fileBody').hidden = false; say('Un seul fichier à la fois, s’il vous plaît.'); return; }
    openFile(files[0]);
  }
  const hasFiles = e => e.dataTransfer && [...e.dataTransfer.types].includes('Files');
  const drop = $('fileDrop');
  drop.addEventListener('click', () => $('fileInput').click());
  $('fileInput').addEventListener('change', e => pick(e.target.files));
  for (const name of ['dragenter', 'dragover']) drop.addEventListener(name, e => { if (hasFiles(e)) { e.preventDefault(); drop.classList.add('is-over'); } });
  drop.addEventListener('dragleave', () => drop.classList.remove('is-over'));
  drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('is-over'); pick(e.dataTransfer.files); });
  // Un fichier lâché à côté de la zone ne doit pas remplacer la page.
  for (const name of ['dragover', 'drop']) window.addEventListener(name, e => { if (hasFiles(e)) e.preventDefault(); });
  $('fileOcrStart').addEventListener('click', runOcr);
  $('fileCancel').addEventListener('click', () => { const fn = cancelJob; job++; if (fn) { try { fn(); } catch {} } cancelJob = null; $('fileOcrStart').disabled = false; say('Traitement annulé.'); });
  $('fileClear').addEventListener('click', () => { reset(); drop.focus(); KerynqApp.notify('Fichier et données extraites effacés'); });
  $('fileSensitiveToggle').addEventListener('click', () => {
    const list = $('fileSensitive'), open = list.hidden;
    fill(list, open ? sensitive : []); list.hidden = !open;
    $('fileSensitiveToggle').setAttribute('aria-expanded', String(open));
    $('fileSensitiveToggle').textContent = open ? 'Masquer les données sensibles' : 'Afficher les données sensibles';
  });
  $('fileFind').addEventListener('input', setFind);
  $('fileFind').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); nextMatch(); } });
  $('fileFindNext').addEventListener('click', nextMatch);
  $('fileText').addEventListener('input', setFind);
  for (const name of ['select', 'keyup', 'mouseup']) $('fileText').addEventListener(name, updateSelection);
  $('fileUseWeb').addEventListener('click', useWeb);
  $('fileUseAi').addEventListener('click', useAi);
})();
