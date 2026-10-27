/* Inventario sin IA de pago: catálogo de muebles (m³ por pieza, tabla de la industria
   mexicana de mudanzas que usaba el cotizador viejo) + lectura de texto por reglas.
   Lo usan el panel (index.html) y el portal de clientes (cotiza.html). */
(function (g) {
  // [grupo, nombre, m³, patrón, genérico] — los genéricos ("cama", "sala", "mesa") solo cuentan si nada más específico coincide.
  const CAT = [
    ['Recámara', 'Cama king size', 4.0, /cama\s*king|king\s*size/],
    ['Recámara', 'Cama queen', 2.5, /cama\s*queen|queen\s*size|cama\s*qs/],
    ['Recámara', 'Cama litera', 2.5, /litera/],
    ['Recámara', 'Cama individual', 1.4, /cama\s*(individual|sencilla|indiv)/],
    ['Recámara', 'Cama matrimonial', 2.0, /cama\s*matrimonial|^camas?$|\bcamas?\b(?!\s*de\s*perro)/, 1],
    ['Recámara', 'Colchón king', 2.0, /colchon\w*\s*king/],
    ['Recámara', 'Colchón individual', 1.0, /colchon\w*\s*(individual|sencillo)/],
    ['Recámara', 'Colchón matrimonial/queen', 1.5, /colchon/, 1],
    ['Recámara', 'Ropero grande (3+ puertas)', 3.5, /(ropero|armario|closet)\w*\s*(de\s*)?(grande|3|tres|4|cuatro)/],
    ['Recámara', 'Ropero 1 puerta', 1.5, /(ropero|armario|closet)\w*\s*(de\s*)?(1|una|un|chico)\b/],
    ['Recámara', 'Ropero 2 puertas', 2.5, /ropero|armario|closet/, 1],
    ['Recámara', 'Cómoda', 1.2, /comoda/],
    ['Recámara', 'Buró / mesita de noche', 0.3, /buro|mesita\s*de\s*noche|mesa\s*de\s*noche/],
    ['Recámara', 'Tocador con espejo', 1.0, /tocador/],
    ['Recámara', 'Cajonera / chiffonier', 0.8, /chiffon|cajonera\s*(de\s*)?(recamara|ropa)/],
    ['Recámara', 'Recámara completa', 10.0, /recamara|habitacion|\bcuartos?\b/, 1],
    ['Oficina', 'Estudio completo', 5.0, /\bestudio\b/, 1],
    ['Sala', 'Sala en L (seccional)', 5.5, /sala\s*(en\s*)?l\b|seccional|esquinera/],
    ['Sala', 'Sala 4 piezas', 6.0, /sala\s*(de\s*)?(4|cuatro)/],
    ['Sala', 'Sala 3 piezas', 5.0, /sala\s*(de\s*)?(3|tres)|sala\s*completa|^salas?$|\bsalas?\b/, 1],
    ['Sala', 'Sofá cama', 2.0, /sofa\s*cama/],
    ['Sala', 'Sofá 3 plazas', 3.5, /(sofa|sillon)\w*\s*(de\s*)?(3|tres)\s*(plazas|lugares|personas)|sofa\s*grande/],
    ['Sala', 'Sofá 2 plazas / loveseat', 2.5, /love\s*seat|loveseat|(sofa|sillon)\w*\s*(de\s*)?(2|dos)\s*(plazas|lugares|personas)/],
    ['Sala', 'Sillón individual', 1.5, /sillon|reposet|butaca/],
    ['Sala', 'Sofá (3 plazas)', 3.5, /sofa|sillon|couch/, 1],
    ['Sala', 'Mesa de centro', 0.5, /mesa\s*de\s*centro/],
    ['Sala', 'Mesa lateral', 0.3, /mesa\s*(lateral|auxiliar|esquinera)/],
    ['Sala', 'Librero grande', 3.0, /librero\w*\s*grande/],
    ['Sala', 'Librero chico', 2.0, /librero\w*\s*(chico|pequen)/],
    ['Sala', 'Librero mediano', 2.6, /librero|estante|repisa/, 1],
    ['Sala', 'Vitrina / cristalera', 1.5, /vitrina|cristalera|vajillero/],
    ['Sala', 'Bar / mueble bar', 1.5, /mueble\s*bar|\bbar\b|cava/],
    ['Sala', 'Mueble de TV', 3.0, /mueble\s*(de|para)\s*(tv|tele|pantalla)|centro\s*de\s*entretenimiento/],
    ['Sala', 'Pantalla 55" o más', 0.6, /(tv|tele\w*|pantalla)\w*\s*(de\s*)?(5[5-9]|6\d|7\d|8\d)/],
    ['Sala', 'Pantalla 40-54"', 0.4, /(tv|tele\w*|pantalla)\w*\s*(de\s*)?(4\d|5[0-4])/],
    ['Sala', 'Pantalla / TV', 0.4, /\btv\b|televis|pantalla/, 1],
    ['Comedor', 'Comedor 12 sillas', 10.0, /comedor\w*\s*(de\s*)?(12|doce)/],
    ['Comedor', 'Comedor 8 sillas', 8.0, /comedor\w*\s*(de\s*)?(8|ocho)/],
    ['Comedor', 'Comedor 4 sillas', 4.0, /comedor\w*\s*(de\s*)?(4|cuatro)/],
    ['Comedor', 'Antecomedor', 3.0, /antecomedor/],
    ['Comedor', 'Comedor 6 sillas', 7.0, /comedor/, 1],
    ['Comedor', 'Silla (suelta)', 0.3, /\bsillas?\b(?!\s*(de\s*)?(oficina|ejecutiva|gym))|banco|taburete/, 1],
    ['Comedor', 'Trinchador / alacena', 1.5, /trinchador|aparador|bufetero|buffet/],
    ['Comedor', 'Barra desayunadora', 1.0, /barra/],
    ['Cocina', 'Refrigerador dúplex', 2.0, /(refri\w*|nevera)\s*(duplex|french|grande|2\s*puertas|de\s*dos)/],
    ['Cocina', 'Frigobar', 0.6, /frigobar|mini\s*(refri|fridge)/],
    ['Cocina', 'Refrigerador', 1.5, /refri|nevera|congelador/, 1],
    ['Cocina', 'Estufa', 1.5, /estufa|horno\s*de\s*gas/],
    ['Cocina', 'Microondas', 0.3, /micro/],
    ['Cocina', 'Lavavajillas', 0.8, /lavavajillas|lavaplatos/],
    ['Cocina', 'Alacena / cajonera', 1.0, /alacena|despensero|gabinete/],
    ['Lavado / baño', 'Centro de lavado', 1.5, /centro\s*de\s*lavado/],
    ['Lavado / baño', 'Lavadora', 0.8, /lavadora/],
    ['Lavado / baño', 'Secadora', 0.8, /secadora/],
    ['Lavado / baño', 'Mueble de baño', 1.0, /mueble\s*(de|para)\s*bano/],
    ['Oficina', 'Escritorio grande', 3.0, /escritorio\w*\s*(grande|ejecutivo)/],
    ['Oficina', 'Escritorio', 2.0, /escritorio/],
    ['Oficina', 'Credenza', 3.0, /credenza/],
    ['Oficina', 'Silla de oficina', 0.5, /silla\w*\s*(de\s*)?(oficina|ejecutiva|escritorio|gamer)/],
    ['Oficina', 'Archivero', 0.8, /archivero/],
    ['Especiales', 'Piano vertical', 5.0, /piano\s*vertical|pianola|^piano$|\bpiano\b(?!\s*(de\s*)?cola)/],
    ['Especiales', 'Piano de cola', 15.0, /piano\s*(de\s*)?(media\s*)?cola/],
    ['Especiales', 'Caja fuerte', 2.0, /caja\s*fuerte/],
    ['Gym / otros', 'Caminadora', 1.0, /caminadora|treadmill|eliptica/],
    ['Gym / otros', 'Bicicleta', 1.0, /bici/],
    ['Gym / otros', 'Aparato de pesas', 2.0, /aparato|multifuncional|gimnasio|pesas/],
    ['Gym / otros', 'Mesa de billar', 3.0, /billar/],
    ['Gym / otros', 'Mesa de ping pong', 1.5, /ping\s*pong/],
    ['Gym / otros', 'Cuna', 1.0, /cuna/],
    ['Gym / otros', 'Carriola', 0.6, /carriola|carreola/],
    ['Gym / otros', 'Juguetero', 1.0, /juguetero/],
    ['Gym / otros', 'Mesa (otra)', 1.0, /\bmesas?\b/, 1],
    ['Cajas', 'Caja grande', 0.5, /caja\w*\s*grande/],
    ['Cajas', 'Caja chica', 0.1, /caja\w*\s*(chica|pequen)/],
    ['Cajas', 'Caja mediana', 0.3, /\bcajas?\b/, 1],
    ['Cajas', 'Bulto / maleta', 0.2, /maleta|bulto|bolsa|costal/],
    ['Gym / otros', 'Auto compacto', 20.0, /\b(auto|carro|coche)\b/],
    ['Gym / otros', 'Moto', 2.5, /\bmoto/],
    ['Gym / otros', 'Planta / maceta', 0.2, /planta|maceta/],
    ['Gym / otros', 'Espejo / cuadro', 0.1, /espejo|cuadro/],
    ['Gym / otros', 'Lámpara', 0.2, /lampara/],
  ];
  const CUARTOS = { sala: 15, comedor: 8, recamara: 10, cuarto: 10, habitacion: 10, cocina: 5, estudio: 7, oficina: 7, bano: 2 };
  const NUMS = { un: 1, una: 1, uno: 1, dos: 2, par: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12 };
  const sinAcentos = s => String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '');

  function cantidad(t) {
    let m = t.match(/^(\d{1,3})\s*(x|pz|pzas?|piezas?)?\s+/) || t.match(/\s(x|por)\s*(\d{1,3})$/);
    if (m) return { n: parseInt(m[1] && /\d/.test(m[1]) ? m[1] : m[2], 10), resto: t.replace(m[0], ' ').trim() };
    m = t.match(/^(un|una|uno|dos|par de|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce)\s+/);
    if (m) return { n: NUMS[m[1].replace(' de', '')] || 1, resto: t.slice(m[0].length) };
    return { n: 1, resto: t };
  }

  /** Lee una lista de cosas (o el texto de capturas de chat) y devuelve lo mismo que daba la IA. */
  function analizarTexto(textoOriginal) {
    const texto = String(textoOriginal || '').slice(0, 20000), plano = sinAcentos(texto).toLowerCase();
    const items = {}, sinReconocer = [];
    plano.split(/[\n,;•·+]|\s+y\s+|\s+e\s+|\s{2,}/).map(s => s.replace(/[^\w\s"']/g, ' ').replace(/\s+/g, ' ').trim()).filter(s => s.length >= 3).forEach(trozo => {
      const q = cantidad(trozo), ok = x => x[3].test(q.resto) || x[3].test(trozo), c = CAT.find(x => !x[4] && ok(x)) || CAT.find(x => x[4] && ok(x));
      if (!c) { if (trozo.length < 40 && sinReconocer.length < 15) sinReconocer.push(trozo); return; }
      const n = Math.min(q.n, 200);
      items[c[1]] = items[c[1]] || { articulo: c[1], cantidad: 0, m3_unitario: c[2] };
      items[c[1]].cantidad += n;
    });
    const inventario = Object.values(items);
    let m3 = inventario.reduce((s, i) => s + i.cantidad * i.m3_unitario, 0);
    if (!m3) {   // sin muebles reconocidos: estimar por cuartos ("2 recámaras, sala, comedor")
      Object.keys(CUARTOS).forEach(c => { (plano.match(new RegExp('\\b(\\d+)?\\s*' + c, 'g')) || []).forEach(x => { const k = parseInt(x, 10); m3 += CUARTOS[c] * (k || 1); }); });
    }
    // Datos de contacto en capturas de chat: solo si se dicen de forma explícita.
    const tel = texto.match(/(?:\+?52\s?)?(?:\(?\d{2,3}\)?[\s-]?)?\d{3,4}[\s-]?\d{4}/);
    const prot = texto.replace(/\b(Av|Avda|Blvd|Col|Fracc|No|Núm|Num|Sr|Sra|Dr|Dra)\./gi, '$1§');
    const dir = re => { const m = prot.match(re); return m ? m[1].trim().replace(/§/g, '.') : null; };
    const nombre = texto.match(/(?:soy|me llamo|habla|mi nombre es|nombre[:\s]+|cliente[:\s]+)\s*([A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}){0,3})/);
    return {
      transcripcion: texto ? texto.slice(0, 1500) : null,
      cliente_nombre: nombre ? nombre[1] : null,
      cliente_tel: tel && tel[0].replace(/\D/g, '').length >= 10 ? tel[0].trim() : null,
      origen: dir(/(?:origen|sal(?:go|e|imos|dremos)\s+de|desde|domicilio|direcci[oó]n)[:\s]+([^\n,.]{5,60})/i),
      destino: dir(/(?:destino|va a|llega(?:mos)? a|entrega(?:r)? en|mudanza a|me\s+mud[oaeó]\s+a|nos\s+mudamos\s+a)[:\s]+([^\n,.]{5,60})/i),
      m3_estimado: m3 > 0 ? Math.round(m3 * 10) / 10 : null,
      inventario: inventario.length ? inventario : null,
      sin_reconocer: sinReconocer,
      embalaje: /embalaj|empaqu|empac/i.test(plano),
      notas: null,
      _metodo: 'Lista y reglas (sin IA)',
    };
  }

  /** Lista de muebles con botones − / + . Llama a alCambiar(totalM3, items) en cada cambio. */
  function armarSelector(contenedor, alCambiar) {
    const cant = {}, vistos = {}, grupos = {};
    CAT.forEach(c => { if (vistos[c[1]]) return; vistos[c[1]] = 1; (grupos[c[0]] = grupos[c[0]] || []).push(c); });
    let html = '';
    Object.keys(grupos).forEach(gr => {
      html += '<details class="inv-grupo"><summary>' + gr + '</summary>';
      grupos[gr].forEach(c => {
        const id = 'inv' + CAT.indexOf(c);
        html += '<div class="inv-fila"><span>' + c[1] + ' <small>' + c[2] + ' m³</small></span><span class="inv-ctl">'
          + '<button type="button" data-k="' + id + '" data-d="-1">−</button><b id="' + id + '">0</b><button type="button" data-k="' + id + '" data-d="1">+</button></span></div>';
      });
      html += '</details>';
    });
    contenedor.innerHTML = html;
    contenedor.addEventListener('click', e => {
      const b = e.target.closest('button[data-k]'); if (!b) return;
      const k = b.dataset.k, c = CAT[Number(k.slice(3))];
      cant[k] = Math.max(0, (cant[k] || 0) + Number(b.dataset.d));
      document.getElementById(k).textContent = cant[k];
      const items = Object.keys(cant).filter(x => cant[x]).map(x => ({ articulo: CAT[Number(x.slice(3))][1], cantidad: cant[x], m3_unitario: CAT[Number(x.slice(3))][2] }));
      alCambiar(Math.round(items.reduce((s, i) => s + i.cantidad * i.m3_unitario, 0) * 10) / 10, items, c);
    });
    return { limpiar() { Object.keys(cant).forEach(k => { cant[k] = 0; document.getElementById(k).textContent = '0'; }); alCambiar(0, []); } };
  }

  /** Reduce una foto a JPEG de máx. 1600 px (para leerla rápido) y la devuelve en base64. */
  function fotoABase64(file) {
    return new Promise((ok, mal) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, 1600 / Math.max(img.width, img.height)), cv = document.createElement('canvas');
        cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url);
        ok({ b64: cv.toDataURL('image/jpeg', 0.85).split(',')[1], tipo: 'image/jpeg', nombre: file.name });
      };
      img.onerror = () => mal('No se pudo abrir la imagen ' + file.name);
      img.src = url;
    });
  }

  g.TMLInventario = { analizarTexto, armarSelector, fotoABase64, CAT };
})(window);
