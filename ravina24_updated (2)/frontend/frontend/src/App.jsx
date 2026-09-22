import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { apiRequest, clearAuthToken, getAuthToken } from "./api";

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selected, setSelected] = useState(null);
  const [poll, setPoll] = useState({ question: "Which frontend technology do you like?", options: [] });
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setPage("login");
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await apiRequest("/auth/profile", { auth: true, method: "GET" });
        setUser(response.data.user);
        setPage("dashboard");
      } catch (error) {
        clearAuthToken();
        setPage("login");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    if (page !== "dashboard") return;

    const loadPoll = async () => {
      try {
        const response = await apiRequest("/poll", { auth: true, method: "GET" });
        const pollData = response.data.poll;
        const normalizedOptions = pollData.options.map((item) => ({ ...item, option: item.option }));
        setPoll({ question: pollData.question, options: normalizedOptions });
      } catch (error) {
        setNotice(error.message || "Unable to load poll data.");
      }
    };

    loadPoll();
  }, [page]);

  const totalVotes = useMemo(
    () => poll.options.reduce((sum, item) => sum + Number(item.votes || 0), 0),
    [poll]
  );

  const results = useMemo(
    () => poll.options.map((item) => ({
      option: item.option,
      votes: Number(item.votes || 0),
      percent: totalVotes ? Math.round((Number(item.votes || 0) / totalVotes) * 100) : 0,
    })),
    [poll, totalVotes]
  );

  async function submitAuth(event) {
    event.preventDefault();
    const isSignup = page === "signup";

    if (!email || !password || (isSignup && !name)) {
      setNotice("Please fill in all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNotice("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setNotice("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setSubmitting(true);
    setNotice("");

    try {
      const endpoint = isSignup ? "/auth/signup" : "/auth/login";
      const response = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify({
          name: isSignup ? name : undefined,
          email,
          password,
        }),
      });

      if (response.data.token) {
        localStorage.setItem("public_poll_token", response.data.token);
      }

      setUser(response.data.user);
      setPage("dashboard");
      setEmail("");
      setPassword("");
      setName("");
      setSelected(null);
    } catch (error) {
      setNotice(error.message || "Authentication failed.");
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  }

  async function submitVote() {
    if (!user) {
      setNotice("Please login first to cast your vote.");
      setPage("login");
      return;
    }

    if (!selected) {
      setNotice("Select an option before submitting your vote.");
      return;
    }

    setSubmitting(true);
    setNotice("");

    try {
      const response = await apiRequest("/poll/vote", {
        method: "POST",
        auth: true,
        body: JSON.stringify({ option: selected }),
      });

      setPoll(response.data.poll);
      setNotice(`Vote submitted for ${selected}.`);
      setSelected(null);
    } catch (error) {
      setNotice(error.message || "Unable to submit your vote.");
    } finally {
      setSubmitting(false);
    }
  }

  async function logout() {
    setSubmitting(true);
    setNotice("");

    try {
      if (getAuthToken()) {
        await apiRequest("/auth/logout", { method: "POST", auth: true });
      }
    } catch (error) {
      console.error(error);
    } finally {
      clearAuthToken();
      setUser(null);
      setSelected(null);
      setPage("login");
      setSubmitting(false);
    }
  }

  if (page === "login" || page === "signup") {
    const isSignup = page === "signup";
    return (
      <main className="auth-page">
        <div className="auth-glow glow-one" />
        <div className="auth-glow glow-two" />
        <section className="auth-card">
          <div className="brand-mark">P</div>
          <span className="eyebrow">PUBLIC POLL</span>
          <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>
          <p className="auth-subtitle">
            {isSignup ? "Join the community and make your voice count." : "Sign in to vote and see live results."}
          </p>

          <form onSubmit={submitAuth} className="auth-form">
            {isSignup && (
              <label>
                Full name
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </label>
            )}
            <label>
              Email address
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </label>
            <button className="primary-btn" type="submit" disabled={submitting || loading}>
              {submitting ? "Please wait..." : isSignup ? "Create account" : "Login"} <span>→</span>
            </button>
          </form>

          {notice && <div className="notice">{notice}</div>}

          <p className="switch-auth">
            {isSignup ? "Already have an account?" : "New to Public Poll?"}{" "}
            <button type="button" onClick={() => { setPage(isSignup ? "login" : "signup"); setNotice(""); }}>
              {isSignup ? "Login" : "Sign up"}
            </button>
          </p>
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <div className="brand-mark">P</div>
          <h1>Loading</h1>
          <p className="auth-subtitle">Checking your session...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <nav className="topbar">
        <button className="brand" onClick={() => setPage("dashboard")}>
          <span className="brand-mark small">P</span>
          <span>Public Poll</span>
        </button>
        <div className="top-actions">
          <span className="user-chip">Hi, {user?.name || "User"}</span>
          <button className="ghost-btn" onClick={logout} disabled={submitting}>Logout</button>
        </div>
      </nav>

      <section className="hero-section">
        <span className="eyebrow">LIVE POLLING DASHBOARD</span>
        <h1>Cast your vote. <span>See it live.</span></h1>
        <p>Vote below and watch the results update in real time.</p>
      </section>

      <section className="poll-card">
        <div className="poll-head">
          <div>
            <div className="live-badge"><i /> LIVE NOW</div>
            <h2>{poll.question}</h2>
          </div>
          <div className="total-badge"><strong>{totalVotes}</strong><small>votes</small></div>
        </div>

        <div className="option-list">
          {results.map(({ option, votes: count, percent }) => (
            <button
              className={`poll-option ${selected === option ? "selected" : ""}`}
              key={option}
              onClick={() => { setSelected(option); setNotice(""); }}
              disabled={submitting}
            >
              <div className="option-top">
                <span className="radio"><span /></span>
                <strong>{option}</strong>
                <span className="percentage">{percent}%</span>
              </div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
              <span className="vote-count">{count} votes</span>
            </button>
          ))}
        </div>

        <button className="primary-btn vote-btn" onClick={submitVote} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit vote"} <span>→</span>
        </button>
        {notice && <div className="notice dashboard-notice">{notice}</div>}
      </section>

      <section className="stats-grid">
        <div className="stat-card"><span>Participation</span><strong>{totalVotes > 0 ? "Active" : "Waiting"}</strong><small>Community voting is open</small></div>
        <div className="stat-card"><span>Your selection</span><strong>{selected || "Not selected"}</strong><small>Choose an option above</small></div>
        <div className="stat-card"><span>Poll status</span><strong>Live</strong><small>Results update instantly</small></div>
      </section>

      <footer>© 2026 Public Poll · Simple. Transparent. Live.</footer>
    </main>
  );
}

export default App;
