import { http } from "./http";

export const api = {
  me: () => http.get("/users/me").then((r) => r.data),
  recipes: () => http.get("/recipes").then((r) => r.data as { id: number; name: string; category?: string }[]),
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
};
