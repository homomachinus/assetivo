import AppShell from "@/components/AppShell";
import Topbar from "@/components/Topbar";
import Link from "next/link";

export default function AccountPage() {
  return (
    <AppShell>
      <Topbar
        title="My account"
        subtitle="Premium member"
      />

      <section className="section fade-up">
        <div className="account-grid">
          <div className="account-card">
            <div className="account-profile">
              <div className="avatar">EA</div>
              <div>
                <h2>Emon Ahmed</h2>
                <p>emon.ahmed@email.com</p>
                <span className="pill">Premium member</span>
              </div>
            </div>
          </div>

          <div className="account-card">
            <h3>Account stats</h3>
            <div className="account-stats">
              <div>
                <p className="stat-value">24</p>
                <p className="stat-label">Total orders</p>
              </div>
              <div>
                <p className="stat-value">6</p>
                <p className="stat-label">Favourites</p>
              </div>
              <div>
                <p className="stat-value">3</p>
                <p className="stat-label">Items in cart</p>
              </div>
            </div>
          </div>

          <div className="account-card">
            <h3>Recent orders</h3>
            <ul className="order-list">
              <li>
                <span>Order #ASV-231</span>
                <span>Delivered</span>
              </li>
              <li>
                <span>Order #ASV-228</span>
                <span>In transit</span>
              </li>
              <li>
                <span>Order #ASV-219</span>
                <span>Processing</span>
              </li>
            </ul>
            <Link className="section-link" href="/">
              Back to shop
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
