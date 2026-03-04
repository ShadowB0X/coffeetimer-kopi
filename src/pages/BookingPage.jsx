import { useEffect, useState } from "react";
import styles from "../components/BookingPage.module.css";

const todayISODate = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });

export default function BookingPage() {
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);

  const [barberId, setBarberId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(todayISODate());
  const [slot, setSlot] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // load barbers + services
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const [bRes, sRes] = await Promise.all([fetch("/api/barbers"), fetch("/api/services")]);
        const b = await bRes.json();
        const s = await sRes.json();

        if (!b?.ok) throw new Error(b?.error || "Kunne ikke hente frisører");
        if (!s?.ok) throw new Error(s?.error || "Kunne ikke hente services");

        setBarbers(b.barbers || []);
        setServices(s.services || []);

        // default selection
        if ((b.barbers || []).length) setBarberId(b.barbers[0].id);
        if ((s.services || []).length) setServiceId(s.services[0].id);
      } catch (e) {
        setErr(String(e?.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // load slots when barber/date changes
  useEffect(() => {
    if (!barberId || !date) return;

    (async () => {
      setLoadingSlots(true);
      setErr("");
      setSlot("");
      try {
        const r = await fetch(`/api/availability?date=${date}&barberId=${barberId}`);
        const data = await r.json();
        if (!data?.ok) throw new Error(data?.error || "Kunne ikke hente tider");
        setSlots(data.slots || []);
      } catch (e) {
        setSlots([]);
        setErr(String(e?.message || e));
      } finally {
        setLoadingSlots(false);
      }
    })();
  }, [barberId, date]);

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (!barberId || !serviceId || !slot || !name.trim()) {
      setErr("Vælg frisør, service, tid og skriv navn.");
      return;
    }

    try {
      const r = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberId,
          serviceId,
          startISO: slot,
          customerName: name.trim(),
          customerPhone: phone.trim(),
        }),
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.ok) throw new Error(data?.error || "Booking fejlede");

      setMsg("✅ Booking oprettet! (Telegram sendt)");
      setName("");
      setPhone("");

      // refresh slots
      const r2 = await fetch(`/api/availability?date=${date}&barberId=${barberId}`);
      const d2 = await r2.json();
      if (d2?.ok) setSlots(d2.slots || []);
      setSlot("");
    } catch (e) {
      setErr(String(e?.message || e));
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>SHORTCUT · GAMMEL KONGEVEJ 91C</p>
        <h1 className={styles.title}>Book en tid</h1>
        <p className={styles.sub}>Vælg frisør, service og tid.</p>
      </header>

      <form className={styles.card} onSubmit={submit}>
        <div className={styles.grid}>
          <label className={styles.field}>
            <span>Frisør</span>
            <select value={barberId} onChange={(e) => setBarberId(e.target.value)} disabled={loading}>
              <option value="" disabled>
                {loading ? "Henter..." : "Vælg frisør"}
              </option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Service</span>
            <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} disabled={loading}>
              <option value="" disabled>
                {loading ? "Henter..." : "Vælg service"}
              </option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.price} kr
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Dato</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>

          <label className={styles.field}>
            <span>Tid</span>
            <select value={slot} onChange={(e) => setSlot(e.target.value)} disabled={loadingSlots || !barberId}>
              <option value="" disabled>
                {loadingSlots ? "Henter tider..." : "Vælg tid"}
              </option>
              {slots.map((iso) => (
                <option key={iso} value={iso}>
                  {formatTime(iso)}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Navn</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dit navn" />
          </label>

          <label className={styles.field}>
            <span>Telefon (valgfrit)</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="fx 12 34 56 78" />
          </label>
        </div>

        <button className={styles.button} type="submit">
          Book tid
        </button>

        {err && <p className={styles.msg} style={{ color: "#8b0000" }}>{err}</p>}
        {msg && <p className={styles.msg}>{msg}</p>}
      </form>
    </div>
  );
}