// FarmIQ backend client — talks to the Django REST API (MySQL).
// Exposes a small PostgREST-like query builder so module hooks keep a
// familiar `.from(table).select().eq(...)` shape.
import { apiFetch, api, tokens } from "@/lib/api";

type Row = Record<string, any>;
export interface Result<T = any> { data: T | null; error: { message: string } | null }

const enc = (v: any) => {
  if (v === null || v === undefined) return "null";
  return String(v);
};

class QueryBuilder<T = any> implements PromiseLike<Result<T>> {
  private table: string;
  private method: "GET" | "POST" | "PATCH" | "DELETE" = "GET";
  private body: any = undefined;
  private params = new URLSearchParams();
  private singleMode: "none" | "single" | "maybe" = "none";
  private returning = true;

  constructor(table: string) {
    this.table = table;
  }

  // ---- verbs -------------------------------------------------------------
  select(_cols?: string) {
    if (this.method === "GET") this.method = "GET";
    return this;
  }
  insert(values: Row | Row[]) {
    this.method = "POST";
    this.body = values;
    return this;
  }
  upsert(values: Row | Row[], opts?: { onConflict?: string }) {
    this.method = "POST";
    this.body = values;
    this.params.set("upsert", opts?.onConflict || "id");
    return this;
  }
  update(values: Row) {
    this.method = "PATCH";
    this.body = values;
    return this;
  }
  delete() {
    this.method = "DELETE";
    return this;
  }

  // ---- filters -----------------------------------------------------------
  private filter_(col: string, op: string, val: any) {
    this.params.append(col, `${op}.${enc(val)}`);
    return this;
  }
  eq(c: string, v: any) { return this.filter_(c, "eq", v); }
  neq(c: string, v: any) { return this.filter_(c, "neq", v); }
  gt(c: string, v: any) { return this.filter_(c, "gt", v); }
  gte(c: string, v: any) { return this.filter_(c, "gte", v); }
  lt(c: string, v: any) { return this.filter_(c, "lt", v); }
  lte(c: string, v: any) { return this.filter_(c, "lte", v); }
  like(c: string, v: string) { return this.filter_(c, "like", v.replace(/%/g, "*")); }
  ilike(c: string, v: string) { return this.filter_(c, "ilike", v.replace(/%/g, "*")); }
  is(c: string, v: any) { return this.filter_(c, "is", v === null ? "null" : v); }
  in(c: string, v: any[]) { this.params.append(c, `in.(${v.map(enc).join(",")})`); return this; }
  not(c: string, op: string, v: any) { this.params.append(c, `not.${op}.${enc(v)}`); return this; }
  or(expr: string) { this.params.append("or", `(${expr})`); return this; }
  filter(c: string, op: string, v: any) { return this.filter_(c, op, v); }
  match(obj: Row) { Object.entries(obj).forEach(([k, v]) => this.eq(k, v)); return this; }

  // ---- modifiers ---------------------------------------------------------
  order(col: string, opts?: { ascending?: boolean }) {
    this.params.append("order", `${col}.${opts?.ascending === false ? "desc" : "asc"}`);
    return this;
  }
  limit(n: number) { this.params.set("limit", String(n)); return this; }
  range(from: number, to: number) {
    this.params.set("offset", String(from));
    this.params.set("limit", String(to - from + 1));
    return this;
  }
  single() { this.singleMode = "single"; this.params.set("limit", "1"); return this; }
  maybeSingle() { this.singleMode = "maybe"; this.params.set("limit", "1"); return this; }

  // ---- execution ---------------------------------------------------------
  private async run(): Promise<Result<T>> {
    const qs = this.params.toString();
    const path = `/api/db/${this.table}/${qs ? `?${qs}` : ""}`;
    try {
      const res = await apiFetch(path, {
        method: this.method,
        body: this.body !== undefined ? JSON.stringify(this.body) : undefined,
      });
      if (!res.ok) {
        let msg = res.statusText;
        try {
          const j = await res.json();
          msg = j?.detail || j?.error || JSON.stringify(j);
        } catch { /* keep statusText */ }
        return { data: null, error: { message: msg } };
      }
      let rows: any = res.status === 204 ? [] : await res.json().catch(() => []);
      if (!Array.isArray(rows)) rows = rows?.results ?? [rows];
      if (this.singleMode !== "none") {
        if (rows.length === 0) {
          if (this.singleMode === "single") {
            return { data: null, error: { message: "No rows found" } };
          }
          return { data: null, error: null };
        }
        return { data: rows[0] as T, error: null };
      }
      return { data: rows as T, error: null };
    } catch (e: any) {
      return { data: null, error: { message: e?.message || "Network error" } };
    }
  }

  then<R1 = Result<T>, R2 = never>(
    onfulfilled?: ((value: Result<T>) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: any) => R2 | PromiseLike<R2>) | null,
  ): PromiseLike<R1 | R2> {
    return this.run().then(onfulfilled, onrejected);
  }
}

// ---- storage ---------------------------------------------------------------
const storage = {
  from(bucket: string) {
    return {
      async upload(path: string, file: File | Blob, _opts?: any) {
        const fd = new FormData();
        fd.append("file", file as any);
        fd.append("path", path);
        const res = await apiFetch(`/api/storage/${bucket}/upload/`, { method: "POST", body: fd });
        if (!res.ok) return { data: null, error: { message: await res.text() } };
        return { data: await res.json(), error: null };
      },
      async remove(paths: string[]) {
        const res = await apiFetch(`/api/storage/${bucket}/remove/`, {
          method: "POST",
          body: JSON.stringify({ paths }),
        });
        return { data: null, error: res.ok ? null : { message: res.statusText } };
      },
      async createSignedUrl(path: string, expiresIn: number) {
        const res = await apiFetch(
          `/api/storage/${bucket}/sign/?path=${encodeURIComponent(path)}&expires_in=${expiresIn}`,
        );
        if (!res.ok) return { data: null, error: { message: res.statusText } };
        const j = await res.json();
        return { data: { signedUrl: j.signedUrl }, error: null };
      },
      getPublicUrl(path: string) {
        const base = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
          "http://127.0.0.1:8000";
        return { data: { publicUrl: `${base}/media/${bucket}/${path}` } };
      },
    };
  },
};

// ---- auth ------------------------------------------------------------------
const auth = {
  async getUser() {
    if (!tokens.access) return { data: { user: null }, error: null };
    try {
      const me = await api<any>("/api/me/");
      return { data: { user: { id: String(me.id), email: me.email, user_metadata: me } }, error: null };
    } catch (e: any) {
      return { data: { user: null }, error: { message: e?.message } };
    }
  },
  async getSession() {
    const { data } = await auth.getUser();
    return { data: { session: data.user ? { user: data.user } : null }, error: null };
  },
  async updateUser(attrs: { password?: string; data?: Row }) {
    const res = await apiFetch("/api/me/", { method: "PATCH", body: JSON.stringify(attrs.data || attrs) });
    if (!res.ok) return { data: null, error: { message: await res.text() } };
    return { data: await res.json(), error: null };
  },
  async signOut() {
    tokens.clear();
    return { error: null };
  },
  onAuthStateChange(_cb: any) {
    return { data: { subscription: { unsubscribe() {} } } };
  },
};

// ---- edge-function equivalents ---------------------------------------------
const functions = {
  async invoke(name: string, opts?: { body?: any }) {
    const res = await apiFetch(`/api/functions/${name}/`, {
      method: "POST",
      body: JSON.stringify(opts?.body ?? {}),
    });
    if (!res.ok) return { data: null, error: { message: await res.text() } };
    return { data: await res.json().catch(() => ({})), error: null };
  },
};

export const backend = {
  from<T = any>(table: string) { return new QueryBuilder<T>(table); },
  storage,
  auth,
  functions,
  channel() {
    return { on() { return this; }, subscribe() { return this; }, unsubscribe() {} };
  },
  removeChannel() {},
};

// Named export kept as `supabase` so existing module code stays unchanged.
export const supabase = backend;
