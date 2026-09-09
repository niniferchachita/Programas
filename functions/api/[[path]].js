export async function onRequest(context) {
  const { request, env, params } = context;
  const path = params.path ? params.path.join('/') : '';

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    // --- PRODUCTOS ---
    if (path === 'productos' && request.method === 'GET') {
      const { results } = await env.DB.prepare("SELECT * FROM productos").all();
      return new Response(JSON.stringify(results || []), { headers });
    }

    if (path === 'productos' && request.method === 'POST') {
      const data = await request.json();
      await env.DB.prepare(
        "INSERT INTO productos (nombre, precio, categoria, requiere_salsa, imagen) VALUES (?, ?, ?, ?, ?)"
      ).bind(data.nombre, data.precio, data.categoria, data.requiere_salsa ? 1 : 0, data.imagen || "").run();
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    if (path.startsWith('productos/') && request.method === 'DELETE') {
      const id = path.split('/')[1];
      await env.DB.prepare("DELETE FROM productos WHERE id = ?").bind(id).run();
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // --- PEDIDOS ---
    if (path === 'pedidos' && request.method === 'GET') {
      const { results } = await env.DB.prepare("SELECT * FROM pedidos").all();
      return new Response(JSON.stringify(results || []), { headers });
    }

    if (path === 'pedidos' && request.method === 'POST') {
      const p = await request.json();
      await env.DB.prepare(
        "INSERT INTO pedidos (cliente, fact_ruc, fact_razon, fact_phone, fact_email, items, total, estado, mesero, metodo_pago, fecha_hora) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind(p.cliente, p.fact_ruc, p.fact_razon, p.fact_phone, p.fact_email, p.items, p.total, p.estado, p.mesero, p.metodo_pago, p.fecha_hora).run();
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // --- CATEGORIAS / SECCIONES ---
    if (path === 'categorias' && request.method === 'GET') {
      const { results } = await env.DB.prepare("SELECT * FROM categorias").all();
      return new Response(JSON.stringify(results || []), { headers });
    }

    if (path === 'categorias' && request.method === 'POST') {
      const data = await request.json();
      await env.DB.prepare("INSERT INTO categorias (nombre) VALUES (?)").bind(data.nombre).run();
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // --- SALSAS ---
    if (path === 'salsas' && request.method === 'GET') {
      const { results } = await env.DB.prepare("SELECT * FROM salsas").all();
      return new Response(JSON.stringify(results || []), { headers });
    }

    if (path === 'salsas' && request.method === 'POST') {
      const data = await request.json();
      await env.DB.prepare("INSERT INTO salsas (nombre) VALUES (?)").bind(data.nombre).run();
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Ruta no encontrada' }), { status: 404, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
