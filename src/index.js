export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
      if (path === "/api/usuarios" && method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM pos_usuarios").all();
        return Response.json(results, { headers: corsHeaders });
      }
      if (path === "/api/usuarios" && method === "POST") {
        const { usuario, clave, nombre, rol } = await request.json();
        await env.DB.prepare("INSERT INTO pos_usuarios (usuario, clave, nombre, rol) VALUES (?, ?, ?, ?) ON CONFLICT(usuario) DO UPDATE SET clave=excluded.clave, nombre=excluded.nombre, rol=excluded.rol").bind(usuario, clave, nombre, rol).run();
        return Response.json({ success: true }, { headers: corsHeaders });
      }
      if (path.startsWith("/api/usuarios/") && method === "DELETE") {
        const u = path.split("/").pop();
        await env.DB.prepare("DELETE FROM pos_usuarios WHERE usuario = ?").bind(u).run();
        return Response.json({ success: true }, { headers: corsHeaders });
      }

      if (path === "/api/categorias" && method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM pos_categorias").all();
        return Response.json(results, { headers: corsHeaders });
      }
      if (path === "/api/categorias" && method === "POST") {
        const { nombre } = await request.json();
        await env.DB.prepare("INSERT INTO pos_categorias (nombre) VALUES (?)").bind(nombre).run();
        return Response.json({ success: true }, { headers: corsHeaders });
      }
      if (path.startsWith("/api/categorias/") && method === "DELETE") {
        const id = path.split("/").pop();
        await env.DB.prepare("DELETE FROM pos_categorias WHERE id = ?").bind(id).run();
        return Response.json({ success: true }, { headers: corsHeaders });
      }

      if (path === "/api/salsas" && method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM pos_salsas").all();
        return Response.json(results, { headers: corsHeaders });
      }
      if (path === "/api/salsas" && method === "POST") {
        const { nombre } = await request.json();
        await env.DB.prepare("INSERT INTO pos_salsas (nombre) VALUES (?)").bind(nombre).run();
        return Response.json({ success: true }, { headers: corsHeaders });
      }
      if (path.startsWith("/api/salsas/") && method === "DELETE") {
        const id = path.split("/").pop();
        await env.DB.prepare("DELETE FROM pos_salsas WHERE id = ?").bind(id).run();
        return Response.json({ success: true }, { headers: corsHeaders });
      }

      if (path === "/api/productos" && method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM pos_productos").all();
        return Response.json(results, { headers: corsHeaders });
      }
      if (path === "/api/productos" && method === "POST") {
        const { nombre, descripcion, precio, categoria, requiere_salsa, imagen } = await request.json();
        await env.DB.prepare("INSERT INTO pos_productos (nombre, descripcion, precio, categoria, requiere_salsa, imagen) VALUES (?, ?, ?, ?, ?, ?)").bind(nombre, descripcion || "", precio, categoria, requiere_salsa ? 1 : 0, imagen || "").run();
        return Response.json({ success: true }, { headers: corsHeaders });
      }
      if (path.startsWith("/api/productos/") && method === "DELETE") {
        const id = path.split("/").pop();
        await env.DB.prepare("DELETE FROM pos_productos WHERE id = ?").bind(id).run();
        return Response.json({ success: true }, { headers: corsHeaders });
      }

      if (path === "/api/pedidos" && method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM pos_pedidos ORDER BY id DESC").all();
        return Response.json(results, { headers: corsHeaders });
      }
      if (path === "/api/pedidos" && method === "POST") {
        const o = await request.json();
        const res = await env.DB.prepare("INSERT INTO pos_pedidos (cliente, fact_ruc, fact_razon, fact_dir, fact_phone, fact_email, items, total, estado, mesero, metodo_pago, fecha_hora) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id").bind(o.cliente, o.fact_ruc, o.fact_razon, o.fact_dir, o.fact_phone, o.fact_email, o.items, o.total, o.estado, o.mesero, o.metodo_pago, o.fecha_hora).first();
        return Response.json({ success: true, id: res ? res.id : null }, { headers: corsHeaders });
      }
      if (path.startsWith("/api/pedidos/") && method === "PUT") {
        const id = path.split("/").pop();
        const { estado, metodo_pago } = await request.json();
        if (metodo_pago) {
          await env.DB.prepare("UPDATE pos_pedidos SET estado = ?, metodo_pago = ? WHERE id = ?").bind(estado, metodo_pago, id).run();
        } else {
          await env.DB.prepare("UPDATE pos_pedidos SET estado = ? WHERE id = ?").bind(estado, id).run();
        }
        return Response.json({ success: true }, { headers: corsHeaders });
      }

      return new Response("Ruta no encontrada", { status: 404, headers: corsHeaders });
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
  }
};