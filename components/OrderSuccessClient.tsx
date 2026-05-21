"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type OrderLink = {
  productId: string;
  title: string;
  quantity: number;
  gdrive_link: string | null;
  notes: string | null;
};

type OrderData = {
  order_id: string;
  status: string;
  amount: number;
  links: OrderLink[] | null;
};

export default function OrderSuccessClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);
  const [expiredMsg, setExpiredMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setErrorMsg("Order ID tidak ditemukan.");
      return;
    }

    fetch(`/api/order/${orderId}`)
      .then(async (res) => {
        const json = await res.json();
        if (res.status === 410) {
          setExpired(true);
          setExpiredMsg(json.message || "Link sudah pernah diakses.");
          setLoading(false);
          return;
        }
        if (!res.ok) {
          throw new Error(json.error || "Gagal memuat order.");
        }
        setOrder(json.data);
        setLoading(false);
      })
      .catch((err) => {
        setErrorMsg(err.message);
        setLoading(false);
      });
  }, [orderId]);

  // ── LOADING ──
  if (loading) {
    return (
      <section className="section fade-up">
        <div className="os-card">
          <div className="admin-spinner" style={{ width: 32, height: 32, margin: "0 auto" }} />
          <p className="os-subtitle">Memuat detail order...</p>
        </div>
      </section>
    );
  }

  // ── EXPIRED (already claimed) ──
  if (expired) {
    return (
      <section className="section fade-up">
        <div className="os-card">
          <div className="os-icon os-icon--expired">
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2>Link Sudah Kedaluwarsa</h2>
          <p className="os-subtitle">{expiredMsg}</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/">Kembali ke Beranda</Link>
          </div>
        </div>
      </section>
    );
  }

  // ── ERROR ──
  if (errorMsg) {
    return (
      <section className="section fade-up">
        <div className="os-card">
          <h2>Terjadi Kesalahan</h2>
          <p className="os-subtitle">{errorMsg}</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/">Kembali ke Beranda</Link>
          </div>
        </div>
      </section>
    );
  }

  if (!order) return null;

  const isPaid = ["success", "paid", "settlement"].includes(order.status);

  // ── PENDING ──
  if (!isPaid) {
    return (
      <section className="section fade-up">
        <div className="os-card">
          <div className="os-icon os-icon--pending">
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
              <path d="M12 6v6l4 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2>Menunggu Pembayaran</h2>
          <p className="os-subtitle">
            Order <strong>{order.order_id}</strong> masih menunggu pembayaran.
            Halaman ini akan menampilkan link download setelah pembayaran dikonfirmasi.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/">Kembali ke Beranda</Link>
          </div>
        </div>
      </section>
    );
  }

  // ── SUCCESS ──
  return (
    <section className="section fade-up">
      <div className="os-card">
        <div className="os-icon os-icon--success">
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <path d="M5 13l4 4L19 7"
              fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2>Pembayaran Berhasil!</h2>
        <p className="os-subtitle">
          Terima kasih! Order <strong>{order.order_id}</strong> sudah dikonfirmasi.
        </p>

        <div className="os-warning">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>
            <strong>Perhatian:</strong> Link di bawah hanya bisa diakses <strong>satu kali</strong>. -
            Pastikan Anda sudah menyimpan/download file sebelum meninggalkan halaman ini. Link dibawah juga akan berbeda pada setiap kali order yang dilakukan.
          </span>
        </div>

        {order.links && order.links.length > 0 ? (
          <div className="os-links">
            {order.links.map((link, idx) => (
              <div key={idx} className="os-link-item">
                <div className="os-link-info">
                  <span className="os-link-title">{link.title}</span>
                  {link.notes && <span className="os-link-notes">{link.notes}</span>}
                </div>
                {link.gdrive_link ? (
                  <a
                    href={link.gdrive_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary os-download-btn"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5 5 5-5m-5 5V3"
                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Download
                  </a>
                ) : (
                  <span className="os-no-link">Link belum tersedia</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="os-subtitle">Tidak ada file yang tersedia untuk order ini.</p>
        )}

        <div className="hero-actions" style={{ marginTop: 16 }}>
          <Link className="btn btn-outline" href="/">Kembali ke Beranda</Link>
        </div>
      </div>
    </section>
  );
}
