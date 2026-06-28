"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import styles from "./page.module.css";

interface Subsidy {
  id: string;
  title: string;
  summary?: string;
  acceptance_end_datetime: string | null;
  target_area_search: string | null;
  subsidy_max_limit: number;
  institution_name: string | null;
}

interface ApiResponse {
  success: boolean;
  data: Subsidy[];
  error?: string;
}

function formatDeadline(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatAmount(amount: number): string {
  if (amount === 0) return "要確認";
  return `¥${amount.toLocaleString()}`;
}

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<Subsidy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await fetch(
        `/api/subsidies?keyword=${encodeURIComponent(keyword.trim())}`
      );
      const json: ApiResponse = await res.json();

      if (!json.success) {
        setError(json.error ?? "エラーが発生しました");
        setResults([]);
      } else {
        setResults(json.data);
      }
    } catch {
      setError("通信エラーが発生しました");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>jGrants 補助金検索</h1>
        <p className={styles.subtitle}>
          キーワードで補助金を検索し、英語要約を確認できます
        </p>
      </header>

      <main className={styles.main}>
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            className={styles.input}
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="例：DX、省エネ、農業"
            disabled={loading}
          />
          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? "検索中..." : "検索"}
          </button>
        </form>

        {error && <p className={styles.error}>{error}</p>}

        {!loading && searched && results.length === 0 && !error && (
          <p className={styles.empty}>該当する補助金が見つかりませんでした</p>
        )}

        {results.length > 0 && (
          <ul className={styles.list}>
            {results.map((item, index) => (
              <li key={item.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.index}>{index + 1}</span>
                  <h2 className={styles.cardTitle}>{item.title}</h2>
                </div>

                <dl className={styles.meta}>
                  <div className={styles.metaRow}>
                    <dt>締切</dt>
                    <dd>{formatDeadline(item.acceptance_end_datetime)}</dd>
                  </div>
                  <div className={styles.metaRow}>
                    <dt>対象地域</dt>
                    <dd>{item.target_area_search ?? "—"}</dd>
                  </div>
                  <div className={styles.metaRow}>
                    <dt>上限額</dt>
                    <dd>{formatAmount(item.subsidy_max_limit)}</dd>
                  </div>
                </dl>

                {item.summary && (
                  <div className={styles.summary}>
                    <p className={styles.summaryLabel}>英語要約</p>
                    <div className={styles.summaryText}>
                      <ReactMarkdown>{item.summary}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
