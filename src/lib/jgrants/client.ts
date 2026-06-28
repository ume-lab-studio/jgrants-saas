const BASE_URL = "https://api.jgrants-portal.go.jp/exp/v1/public";

const DEFAULT_SEARCH_PARAMS: Record<string, string> = {
  keyword: "事業",
  sort: "created_date",
  order: "DESC",
  acceptance: "1",
};

async function request<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const res = await fetch(url.toString());

  if (res.status === 401) {
    throw new Error("JGRANTS_AUTH_REQUIRED");
  }

  if (!res.ok) {
    throw new Error(`jGrants API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export type SearchSubsidiesParams = Record<string, string>;

export function searchSubsidies(params: SearchSubsidiesParams = {}) {
  return request<unknown>("/subsidies", { ...DEFAULT_SEARCH_PARAMS, ...params });
}

export function getSubsidyDetail(id: string) {
  return request<unknown>(`/subsidies/${id}`);
}
