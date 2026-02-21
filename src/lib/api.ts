import { http } from "./http";

export const api = {
  me: () => http.get("/users/me").then((r) => r.data),
  recipes: () =>
    http
      .get("/recipes")
      .then(
        (r) =>
          r.data as {
            id: number;
            name: string;
            category?: string;
            image_url?: string | null;
            calories?: number | null;
          }[]
      ),
  recipesPaged: (page: number, perPage: number) =>
    http
      .get("/recipes", { params: { page, per_page: perPage } })
      .then((r) => ({
        items: (r.data as Array<{
          id: number;
          name: string;
          category?: string;
          image_url?: string | null;
          calories?: number | null;
        }>) || [],
        total: Number(r.headers["x-total-count"] || 0),
      })),
  recipe: (id: string | number) =>
    http
      .get(`/recipes/${id}`)
      .then((r) => r.data as {
        id: number;
        name: string;
        category?: string;
        image_url?: string | null;
        description?: string | null;
        details?: string | null;
        full_nutrition?: {
          calories?: number;
          protein_grams?: number;
          carbs_grams?: number;
          fat_grams?: number;
        } | null;
      }),
  nutrition: (recipeId?: number) => http.get("/nutrition", { params: recipeId ? { recipeId } : undefined }).then((r) => r.data),
  nutritionById: (id: string | number) => http.get(`/nutrition/${id}`).then((r) => r.data),
  nutritionCreate: (body: any) => http.post("/nutrition", body).then((r) => r.data),
  nutritionUpdate: (id: string | number, body: any) => http.put(`/nutrition/${id}`, body).then((r) => r.data),
  nutritionRemove: (id: string | number) => http.delete(`/nutrition/${id}`).then((r) => r.data),
  mealPlan: {
    get: () => http.get("/meals/plan").then((r) => r.data),
    set: (plan: any) => http.put("/meals/plan", plan).then((r) => r.data),
    clear: () => http.post("/meals/plan/clear").then((r) => r.data),
  },
  pantry: {
    list: () => http.get("/pantry").then((r) => r.data),
    create: (body: any) => http.post("/pantry", body).then((r) => r.data),
    update: (id: string | number, body: any) => http.put(`/pantry/${id}`, body).then((r) => r.data),
    remove: (id: string | number) => http.delete(`/pantry/${id}`).then((r) => r.data),
  },
  shopping: {
    list: () => http.get("/shopping").then((r) => r.data),
    create: (body: any) => http.post("/shopping", body).then((r) => r.data),
    update: (id: string | number, body: any) => http.put(`/shopping/${id}`, body).then((r) => r.data),
    remove: (id: string | number) => http.delete(`/shopping/${id}`).then((r) => r.data),
  },
  stats: {
    range: (from: string, to: string) => http.get("/stats", { params: { from, to } }).then((r) => r.data),
    summary: (period: "today" | "week" | "month") =>
      http
        .get("/stats/summary", { params: { period } })
        .then(
          (r) =>
            r.data as {
              period: string;
              range: { from: string; to: string };
              totals: {
                calories: number;
                protein_grams: number;
                carbs_grams: number;
                fat_grams: number;
              };
            }
        ),
  },
  ai: {
    ensureSession: () => http.post("/ai/session").then((r) => (r.data?.id as string)),
    messages: (sessionId: string) => http.get(`/ai/sessions/${sessionId}/messages`).then((r) => r.data as Array<{ id: string; role: string; content: any; created_at: string }>),
    chat: (message: string, stream = false) => http.post("/ai/chat", { message, stream }).then((r) => r.data as { message?: { role: string; text: string }; usage?: any }),
    plan: (options?: { prompt?: string; budget?: number; max_prep_minutes?: number }) => http.post("/ai/plan", options || {}).then((r) => r.data as { plan: any; artifact_id: string; usage?: any }),
  },
  profile: {
    get: () => http.get("/profile").then((r) => r.data as { user: any; profile: Record<string, any> }),
    update: (body: { first_name?: string; last_name?: string; bio?: string | null; values?: Record<string, any> }) =>
      http.put("/profile", body).then((r) => r.data as { user: any; profile: Record<string, any> }),
    updateCountry: (country_id: number | null) => http.patch("/profile/country", { country_id }).then((r) => r.data as { user: any }),
  },
  referrals: {
    validate: (code: string) => http.get("/referrals/validate", { params: { code } }).then((r) => r.data as { valid: boolean; affiliate?: any }),
    redeem: (code: string) => http.post("/referrals/redeem", { code }).then((r) => r.data),
    request: (payload: { pitch?: string; social_links?: any }) => http.post("/referrals/request", payload).then((r) => r.data),
    status: () => http.get("/referrals/request/status").then((r) => r.data as { status: string; code?: string | null }),
    stats: () => http.get("/referrals/stats").then((r) => r.data as { total: number; applied: number; code: string | null }),
  },
};
